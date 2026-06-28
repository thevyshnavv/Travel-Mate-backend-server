import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Agency from './models/Agency.js';
import TaxiProvider from './models/TaxiProvider.js';
import TravelPackage from './models/TravelPackage.js';
import Booking from './models/Booking.js';
import Review from './models/Review.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedDB = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected. Clearing old data...');

    await User.deleteMany({});
    await Agency.deleteMany({});
    await TaxiProvider.deleteMany({});
    await TravelPackage.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});

    console.log('Creating users...');
    
    // Passwords will be hashed automatically by User pre-save middleware
    const traveler = await User.create({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'password123',
      role: 'traveler',
      phone: '555-0199',
      avatar: '',
      bio: 'Travel enthusiast exploring the world.'
    });

    const agencyUser = await User.create({
      name: 'GlobeTrotter Tours',
      email: 'agency@example.com',
      password: 'password123',
      role: 'agency',
      phone: '555-0244',
      avatar: '',
      bio: 'Premier travel agency offering customized packages globally.'
    });

    const taxiUser = await User.create({
      name: 'QuickCab Services',
      email: 'taxi@example.com',
      password: 'password123',
      role: 'taxi_provider',
      phone: '555-0388',
      avatar: '',
      bio: 'Reliable and affordable city rides and airport transfers.'
    });

    console.log('Creating agency & taxi provider profile documents...');

    const agency = await Agency.create({
      userId: agencyUser._id,
      agencyName: 'GlobeTrotter Tours',
      description: 'Your dream vacations designed by experts. We specialize in luxury beach holidays, mountain trekking, and historic cultural tours.',
      specialties: ['adventure', 'luxury', 'beach', 'culture'],
      location: {
        country: 'United States',
        city: 'Miami',
        address: '100 Ocean Drive'
      },
      phone: '555-0244',
      email: 'info@globetrotter.com',
      website: 'www.globetrotter.com',
      logo: '',
      coverImage: '',
      priceRange: { min: 200, max: 2500 },
      rating: 4.8,
      reviewCount: 2,
      isVerified: true,
      isFeatured: true
    });

    const taxiProvider = await TaxiProvider.create({
      userId: taxiUser._id,
      businessName: 'QuickCab Services',
      description: 'Fast, secure, and fully verified taxi rides across the state. Available 24/7.',
      phone: '555-0388',
      email: 'bookings@quickcab.com',
      location: {
        country: 'United States',
        city: 'Miami',
        address: '450 Airport Boulevard'
      },
      serviceArea: ['Miami Metro', 'Fort Lauderdale', 'Miami Airport (MIA)'],
      vehicleTypes: ['sedan', 'suv', 'minivan'],
      vehicles: [
        { model: 'Toyota Camry 2024', registrationNumber: 'TX-987-FL', capacity: 4, type: 'sedan' },
        { model: 'Chevrolet Suburban 2023', registrationNumber: 'TX-456-FL', capacity: 7, type: 'suv' }
      ],
      drivers: [
        { name: 'David Smith', phone: '555-0988', licenseNumber: 'DL-883344', experience: 5 }
      ],
      pricePerKm: 1.5,
      basePrice: 5.0,
      operatingHours: { open: '00:00', close: '23:59' },
      availability: true,
      rating: 4.5,
      reviewCount: 2,
      isVerified: true
    });

    console.log('Creating travel packages...');

    const package1 = await TravelPackage.create({
      agencyId: agencyUser._id,
      packageName: 'Tropical Hawaii Escape',
      description: 'Spend 5 glorious days in Maui. Package includes ocean-view hotel accommodation, daily guided snorkeling tours, and a traditional luau dinner.',
      destination_country: 'United States',
      destination_city: 'Maui, Hawaii',
      duration_days: 5,
      duration_nights: 4,
      pricePerPerson: 1200,
      maxGroupSize: 15,
      minGroupSize: 2,
      included: ['Hotel Stay', 'Airport Transfer', 'Breakfast', 'Snorkeling Tour'],
      isActive: true,
      averageRating: 5.0,
      totalReviews: 1
    });

    const package2 = await TravelPackage.create({
      agencyId: agencyUser._id,
      packageName: 'Swiss Alps Hiking Adventure',
      description: 'Discover the gorgeous hiking trails of Zermatt. Includes mountain lodge stays, luggage transport, and certified local guides.',
      destination_country: 'Switzerland',
      destination_city: 'Zermatt',
      duration_days: 7,
      duration_nights: 6,
      pricePerPerson: 1850,
      maxGroupSize: 10,
      minGroupSize: 4,
      included: ['Mountain Lodge', 'Hiking Guide', 'Dinner', 'Train Pass'],
      isActive: true,
      averageRating: 4.0,
      totalReviews: 1
    });

    console.log('Creating bookings (distributed over the last 6 months for analytics)...');
    
    // We will simulate bookings from Jan to Jun 2026
    const months = [
      new Date('2026-01-15T10:00:00Z'),
      new Date('2026-02-12T14:30:00Z'),
      new Date('2026-02-28T09:00:00Z'),
      new Date('2026-03-05T11:00:00Z'),
      new Date('2026-03-25T16:00:00Z'),
      new Date('2026-04-10T12:00:00Z'),
      new Date('2026-04-20T15:00:00Z'),
      new Date('2026-04-28T08:30:00Z'),
      new Date('2026-05-04T10:00:00Z'),
      new Date('2026-05-18T13:00:00Z'),
      new Date('2026-06-02T11:30:00Z'),
      new Date('2026-06-15T09:00:00Z')
    ];

    const bookings = [];

    // Create bookings for Agency (Hawaii and Swiss Packages)
    for (let i = 0; i < 8; i++) {
      const isHawaii = i % 2 === 0;
      const pkg = isHawaii ? package1 : package2;
      const price = isHawaii ? 2400 : 1850; // for 2 people or 1 person
      const numPeople = isHawaii ? 2 : 1;
      
      const booking = await Booking.create({
        bookingNumber: `BK-AG-${1000 + i}`,
        bookingType: 'package',
        travelerId: traveler._id,
        packageOrServiceId: pkg._id,
        bookingTypeModel: 'TravelPackage',
        bookingDate: months[i],
        status: i === 7 ? 'Pending' : 'Confirmed',
        totalPrice: price,
        paymentStatus: i === 7 ? 'Pending' : 'Paid',
        paymentMethod: 'Card',
        numberOfPeople: numPeople,
        specialRequests: isHawaii ? 'Honeymoon arrangement' : '',
        createdAt: months[i]
      });
      bookings.push(booking);
    }

    // Create bookings for Taxi Provider
    for (let i = 8; i < 12; i++) {
      const price = 50 + (i * 5); // taxi ride price
      const booking = await Booking.create({
        bookingNumber: `BK-TX-${1000 + i}`,
        bookingType: 'taxi',
        travelerId: traveler._id,
        packageOrServiceId: taxiProvider._id,
        bookingTypeModel: 'TaxiProvider',
        bookingDate: months[i],
        status: i === 11 ? 'Pending' : 'Confirmed',
        totalPrice: price,
        paymentStatus: i === 11 ? 'Pending' : 'Paid',
        paymentMethod: 'Cash',
        numberOfPeople: 2,
        specialRequests: 'Need infant seat',
        createdAt: months[i]
      });
      bookings.push(booking);
    }

    console.log('Creating reviews...');

    // Review for Hawaii Package (belongs to agency)
    await Review.create({
      reviewType: 'agency',
      reviewerId: traveler._id,
      agencyOrProviderId: agencyUser._id,
      bookingId: bookings[0]._id, // First agency booking
      rating: 5,
      title: 'Absolutely wonderful experience!',
      comment: 'The Hawaii trip was fantastic. GlobeTrotter planned everything perfectly, from the beach resorts to the snorkeling trips.',
      cleanliness_rating: 5,
      comfort_rating: 5,
      professionalism_rating: 5,
      isVerifiedPurchase: true,
      createdAt: new Date('2026-02-01T12:00:00Z')
    });

    // Review for Swiss Alps Package
    await Review.create({
      reviewType: 'agency',
      reviewerId: traveler._id,
      agencyOrProviderId: agencyUser._id,
      bookingId: bookings[1]._id,
      rating: 4,
      title: 'Great hike, but demanding',
      comment: 'Zermatt is beautiful. The local guide was very knowledgeable. Lodges were neat, though the trails are very steep!',
      cleanliness_rating: 4,
      comfort_rating: 4,
      professionalism_rating: 5,
      isVerifiedPurchase: true,
      createdAt: new Date('2026-03-01T12:00:00Z')
    });

    // Reviews for Taxi Provider
    await Review.create({
      reviewType: 'taxi',
      reviewerId: traveler._id,
      agencyOrProviderId: taxiUser._id,
      bookingId: bookings[8]._id, // First taxi booking
      rating: 5,
      title: 'Punctual and clean!',
      comment: 'The driver David was super helpful. He arrived 5 minutes early, loaded all my bags, and drove very safely.',
      cleanliness_rating: 5,
      comfort_rating: 5,
      professionalism_rating: 5,
      isVerifiedPurchase: true,
      createdAt: new Date('2026-05-10T12:00:00Z')
    });

    await Review.create({
      reviewType: 'taxi',
      reviewerId: traveler._id,
      agencyOrProviderId: taxiUser._id,
      bookingId: bookings[9]._id,
      rating: 4,
      title: 'Smooth ride',
      comment: 'Good clean sedan, fair base prices. Highly recommended for MIA airport transfers.',
      cleanliness_rating: 4,
      comfort_rating: 4,
      professionalism_rating: 4,
      isVerifiedPurchase: true,
      createdAt: new Date('2026-05-25T12:00:00Z')
    });

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB();
