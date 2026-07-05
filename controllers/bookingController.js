import Booking from '../models/Booking.js';
import TravelPackage from '../models/TravelPackage.js';
import TaxiProvider from '../models/TaxiProvider.js';

// @route  POST /api/v1/bookings
// @access Private (traveler role)
export const createBooking = async (req, res) => {
  try {
    const { bookingType, packageOrServiceId, bookingDate, totalPrice, numberOfPeople, specialRequests, paymentMethod } = req.body;

    if (!bookingType || !packageOrServiceId || !totalPrice) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const bookingNumber = 'BK-' + Date.now().toString() + Math.floor(Math.random() * 1000);
    const bookingTypeModel = bookingType === 'package' ? 'TravelPackage' : 'TaxiProvider';

    const booking = await Booking.create({
      bookingNumber,
      bookingType,
      travelerId: req.user.id,
      packageOrServiceId,
      bookingTypeModel,
      bookingDate,
      totalPrice,
      numberOfPeople,
      specialRequests,
      paymentMethod,
      paymentStatus: 'Pending',
      status: 'Pending'
    });

    if (bookingType === 'taxi') {
      const taxiProvider = await TaxiProvider.findById(packageOrServiceId);
      if (taxiProvider) {
        const io = req.app.get('io');
        if (io) {
          io.to(taxiProvider.userId.toString()).emit('new_taxi_booking', {
            message: 'You have a new taxi booking!',
            booking
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/v1/bookings
// @access Private
export const getMyBookings = async (req, res) => {
  try {
    const role = req.user.role;
    let bookings = [];

    if (role === 'traveler') {
      bookings = await Booking.find({ travelerId: req.user.id })
        .populate('packageOrServiceId')
        .sort({ createdAt: -1 });
    } else if (role === 'agency') {
      // Find bookings for packages belonging to this agency (using agency's userId)
      const packages = await TravelPackage.find({ agencyId: req.user.id });
      const packageIds = packages.map(pkg => pkg._id);
      
      bookings = await Booking.find({ packageOrServiceId: { $in: packageIds } })
        .populate('travelerId', 'name email phone avatar')
        .populate('packageOrServiceId')
        .sort({ createdAt: -1 });
    } else if (role === 'taxi_provider') {
      // Find booking for this taxi provider
      const provider = await TaxiProvider.findOne({ userId: req.user.id });
      if (provider) {
        bookings = await Booking.find({ packageOrServiceId: provider._id })
          .populate('travelerId', 'name email phone avatar')
          .populate('packageOrServiceId')
          .sort({ createdAt: -1 });
      }
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/v1/bookings/:id/status
// @access Private
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify authorized user (either the traveler or the agency/taxi provider)
    // For simplicity, allow user with agency/taxi_provider roles to update status
    if (req.user.role !== 'agency' && req.user.role !== 'taxi_provider' && booking.travelerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
    }

    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      booking
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
