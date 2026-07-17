import Booking from '../models/Booking.js';
import Fleet from '../models/Fleet.js';
import TaxiDriver from '../models/TaxiDriver.js';
import Guide from '../models/Guide.js';
import TravelPackage from '../models/TravelPackage.js';

const RIDE_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Automatically assigns the next available vehicle and driver for a taxi booking.
 * Follows a sequential (round-robin/FIFO) order.
 * Ensures no overlapping bookings exist within the 2-hour ride schedule window.
 * 
 * @param {string} providerId - The taxi provider User ID
 * @param {string|Date} bookingDate - The requested date and time of the ride
 * @returns {Promise<{vehicle: Object, driver: Object}|null>} - The assigned vehicle and driver, or null if none are available.
 */
export const assignVehicleAndDriver = async (providerId, bookingDate) => {
  // Retrieve all vehicles and drivers for the provider, sorted by creation date
  const vehicles = await Fleet.find({ providerId }).sort({ createdAt: 1 });
  const drivers = await TaxiDriver.find({ providerId }).sort({ createdAt: 1 });

  if (!vehicles || vehicles.length === 0) {
    throw new Error('No vehicles registered for this taxi provider.');
  }
  if (!drivers || drivers.length === 0) {
    throw new Error('No drivers registered for this taxi provider.');
  }

  // Find the last taxi booking for this provider that had a vehicle and driver assigned
  const lastBooking = await Booking.findOne({
    bookingType: 'taxi',
    packageOrServiceId: providerId,
    assignedVehicleId: { $ne: null },
    assignedDriverId: { $ne: null }
  }).sort({ createdAt: -1 });

  let lastVehicleIdx = -1;
  let lastDriverIdx = -1;

  if (lastBooking) {
    lastVehicleIdx = vehicles.findIndex(v => v._id.toString() === lastBooking.assignedVehicleId.toString());
    lastDriverIdx = drivers.findIndex(d => d._id.toString() === lastBooking.assignedDriverId.toString());
  }

  // Next in sequence starts from (last + 1)
  let currVIdx = (lastVehicleIdx + 1) % vehicles.length;
  let currDIdx = (lastDriverIdx + 1) % drivers.length;

  const targetTime = new Date(bookingDate).getTime();
  const start = new Date(targetTime - RIDE_DURATION_MS);
  const end = new Date(targetTime + RIDE_DURATION_MS);

  // We want to loop and check all combinations in sequence
  const maxAttempts = vehicles.length * drivers.length;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const candidateVehicle = vehicles[currVIdx];
    const candidateDriver = drivers[currDIdx];

    // Check if candidate vehicle is occupied
    const overlappingVehicle = await Booking.findOne({
      bookingType: 'taxi',
      assignedVehicleId: candidateVehicle._id,
      status: { $nin: ['Cancelled', 'cancelled'] },
      bookingDate: { $gt: start, $lt: end }
    });

    // Check if candidate driver is occupied
    const overlappingDriver = await Booking.findOne({
      bookingType: 'taxi',
      assignedDriverId: candidateDriver._id,
      status: { $nin: ['Cancelled', 'cancelled'] },
      bookingDate: { $gt: start, $lt: end }
    });

    if (!overlappingVehicle && !overlappingDriver) {
      return {
        vehicle: candidateVehicle,
        driver: candidateDriver
      };
    }

    // Sequentially move to the next index in the round-robin order
    currVIdx = (currVIdx + 1) % vehicles.length;
    currDIdx = (currDIdx + 1) % drivers.length;
    attempts++;
  }

  return null; // No available vehicle and driver pair for this schedule
};

/**
 * Automatically assigns the next available guide for a travel package booking.
 * Follows a sequential (round-robin/FIFO) order.
 * Ensures no overlapping bookings exist within the travel package's duration_days range.
 * 
 * @param {string} agencyId - The travel agency User ID
 * @param {string} packageId - The booked travel package ID
 * @param {string|Date} bookingDate - The requested start date of the package tour
 * @returns {Promise<Object|null>} - The assigned guide, or null if none are available.
 */
export const assignGuide = async (agencyId, packageId, bookingDate) => {
  const pkg = await TravelPackage.findById(packageId);
  if (!pkg) {
    throw new Error('Travel package not found.');
  }

  const duration_days = pkg.duration_days || 1;

  // Retrieve active guides for the agency, sorted by creation date
  const guides = await Guide.find({ agencyId, status: 'Active' }).sort({ createdAt: 1 });

  if (!guides || guides.length === 0) {
    throw new Error('No active guides registered for this travel agency.');
  }

  // Find all packages belonging to this agency
  const agencyPackages = await TravelPackage.find({ agencyId }).select('_id');
  const agencyPackageIds = agencyPackages.map(p => p._id);

  // Find the last booking for this agency's packages that had a guide assigned
  const lastBooking = await Booking.findOne({
    bookingType: 'package',
    packageOrServiceId: { $in: agencyPackageIds },
    assignedGuideId: { $ne: null }
  }).sort({ createdAt: -1 });

  let lastGuideIdx = -1;
  if (lastBooking) {
    lastGuideIdx = guides.findIndex(g => g._id.toString() === lastBooking.assignedGuideId.toString());
  }

  // Next in sequence starts from (last + 1)
  let currGuideIdx = (lastGuideIdx + 1) % guides.length;

  // Normalize dates to start of day for check
  const S_new = new Date(bookingDate);
  S_new.setHours(0, 0, 0, 0);
  const E_new = new Date(S_new.getTime() + duration_days * 24 * 60 * 60 * 1000);

  let attempts = 0;
  while (attempts < guides.length) {
    const candidateGuide = guides[currGuideIdx];

    // Check if candidate guide has any overlapping active bookings
    const existBookings = await Booking.find({
      bookingType: 'package',
      assignedGuideId: candidateGuide._id,
      status: { $nin: ['Cancelled', 'cancelled'] }
    }).populate('packageOrServiceId');

    let overlaps = false;
    for (const eb of existBookings) {
      if (!eb.packageOrServiceId) continue;
      const S_exist = new Date(eb.bookingDate);
      S_exist.setHours(0, 0, 0, 0);
      const D_exist = eb.packageOrServiceId.duration_days || 1;
      const E_exist = new Date(S_exist.getTime() + D_exist * 24 * 60 * 60 * 1000);

      // Overlap check: S_new < E_exist && S_exist < E_new
      if (S_new < E_exist && S_exist < E_new) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) {
      return candidateGuide;
    }

    // Sequentially move to the next guide in round-robin order
    currGuideIdx = (currGuideIdx + 1) % guides.length;
    attempts++;
  }

  return null; // No guide is available for this schedule
};
