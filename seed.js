import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import TaxiDriver from './models/TaxiDriver.js';
import Fleet from './models/Fleet.js';
import TravelPackage from './models/TravelPackage.js';
import Booking from './models/Booking.js';
import Review from './models/Review.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Idempotent seeding helper functions
const getOrCreateUser = async (userData) => {
  let user = await User.findOne({ email: userData.email.toLowerCase() });
  if (!user) {
    user = await User.create(userData);
    console.log(`Created user: ${user.email}`);
  } else {
    console.log(`User already exists: ${user.email}`);
  }
  return user;
};

const updateTaxiProviderUser = async (userId, providerFields) => {
  const user = await User.findByIdAndUpdate(userId, providerFields, { new: true });
  console.log(`Updated user taxi profile: ${user.businessName}`);
  return user;
};

const getOrCreateFleetVehicle = async (vehicleData) => {
  let vehicle = await Fleet.findOne({ providerId: vehicleData.providerId, registrationNumber: vehicleData.registrationNumber });
  if (!vehicle) {
    vehicle = await Fleet.create(vehicleData);
    console.log(`Created fleet vehicle: ${vehicle.model} (${vehicle.registrationNumber})`);
  } else {
    console.log(`Fleet vehicle already exists: ${vehicle.model} (${vehicle.registrationNumber})`);
  }
  return vehicle;
};

const getOrCreateTaxiDriver = async (driverData) => {
  let driver = await TaxiDriver.findOne({ providerId: driverData.providerId, licenseNumber: driverData.licenseNumber });
  if (!driver) {
    driver = await TaxiDriver.create(driverData);
    console.log(`Created taxi driver: ${driver.name} (${driver.licenseNumber})`);
  } else {
    console.log(`Taxi driver already exists: ${driver.name} (${driver.licenseNumber})`);
  }
  return driver;
};

const updateAgencyUser = async (userId, agencyFields) => {
  const user = await User.findByIdAndUpdate(userId, agencyFields, { new: true });
  console.log(`Updated user agency profile: ${user.agencyName}`);
  return user;
};

const getOrCreateTravelPackage = async (packageData) => {
  let pkg = await TravelPackage.findOne({ agencyId: packageData.agencyId, packageName: packageData.packageName });
  if (!pkg) {
    pkg = await TravelPackage.create(packageData);
    console.log(`Created travel package: ${pkg.packageName}`);
  } else {
    console.log(`Travel package already exists: ${pkg.packageName}`);
  }
  return pkg;
};

const getOrCreateBooking = async (bookingData) => {
  let booking = await Booking.findOne({ bookingNumber: bookingData.bookingNumber });
  if (!booking) {
    booking = await Booking.create(bookingData);
    console.log(`Created booking: ${booking.bookingNumber}`);
  } else {
    console.log(`Booking already exists: ${booking.bookingNumber}`);
  }
  return booking;
};

const getOrCreateReview = async (reviewData) => {
  let review = await Review.findOne({ bookingId: reviewData.bookingId, reviewerId: reviewData.reviewerId });
  if (!review) {
    review = await Review.create(reviewData);
    console.log(`Created review for booking: ${review.bookingId}`);
  } else {
    console.log(`Review already exists for booking: ${review.bookingId}`);
  }
  return review;
};

// 10 new Taxi Providers dataset
const newTaxiProvidersData = [
  {
    user: {
      name: 'London Elite Cabs',
      email: 'londoncabs@example.com',
      password: 'password123',
      role: 'taxi_provider',
      phone: '+44-20-7946-0958',
      bio: 'Premium private hire and chauffeur services across London.'
    },
    provider: {
      businessName: 'London Elite Cabs',
      description: 'Professional chauffeur service with clean, premium vehicles. Operating 24/7 in Greater London.',
      phone: '+44-20-7946-0958',
      email: 'bookings@londoncabs.com',
      location: { country: 'United Kingdom', city: 'London', address: '12 Baker Street' },
      serviceArea: ['London Metro', 'Heathrow Airport', 'Gatwick Airport'],
      vehicleTypes: ['sedan', 'luxury'],
      vehicles: [
        { model: 'Toyota Prius 2023', registrationNumber: 'LDN-01-TX', capacity: 4, type: 'sedan' },
        { model: 'Mercedes E-Class 2022', registrationNumber: 'LDN-02-LUX', capacity: 4, type: 'luxury' }
      ],
      drivers: [
        { name: 'Arthur Pendelton', email: 'arthur.pendelton@example.com', phone: '+44-7700-900077', licenseNumber: 'UK-DL-9988A', experience: 10 },
        { name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com', phone: '+44-7700-900078', licenseNumber: 'UK-DL-4432B', experience: 4 }
      ],
      pricePerKm: 1.8,
      basePrice: 6.0,
      operatingHours: { open: '00:00', close: '23:59' },
      availability: true,
      rating: 4.8,
      reviewCount: 15,
      isVerified: true
    }
  },
  {
    user: {
      name: 'Paris Prestige Taxis',
      email: 'paristaxis@example.com',
      password: 'password123',
      role: 'taxi_provider',
      phone: '+33-1-4227-7889',
      bio: 'Chauffeurs professionnels pour vos trajets parisiens.'
    },
    provider: {
      businessName: 'Paris Prestige Taxis',
      description: 'Reliable and elegant transport in Paris. English-speaking drivers and premium fleet.',
      phone: '+33-1-4227-7889',
      email: 'contact@paristaxis.com',
      location: { country: 'France', city: 'Paris', address: '45 Avenue des Champs-Élysées' },
      serviceArea: ['Paris Center', 'CDG Airport', 'Orly Airport'],
      vehicleTypes: ['sedan', 'suv'],
      vehicles: [
        { model: 'Renault Zoe 2023', registrationNumber: 'PA-232-ZO', capacity: 4, type: 'sedan' },
        { model: 'Peugeot 5008 2022', registrationNumber: 'PA-500-PE', capacity: 7, type: 'suv' }
      ],
      drivers: [
        { name: 'Jean Dupont', email: 'jean.dupont@example.com', phone: '+33-6-1234-5678', licenseNumber: 'FR-DL-11223', experience: 8 },
        { name: 'Marie Laurent', email: 'marie.laurent@example.com', phone: '+33-6-9876-5432', licenseNumber: 'FR-DL-44556', experience: 6 }
      ],
      pricePerKm: 2.0,
      basePrice: 7.0,
      operatingHours: { open: '05:00', close: '23:59' },
      availability: true,
      rating: 4.6,
      reviewCount: 9,
      isVerified: true
    }
  },
  {
    user: {
      name: 'Tokyo Zen Rides',
      email: 'tokyorides@example.com',
      password: 'password123',
      role: 'taxi_provider',
      phone: '+81-3-5555-0143',
      bio: 'Safe, polite, and precise taxi services in Tokyo.'
    },
    provider: {
      businessName: 'Tokyo Zen Rides',
      description: 'Experience the ultimate hospitality and punctuality in Tokyo. Quiet electric fleet.',
      phone: '+81-3-5555-0143',
      email: 'info@tokyozenrides.com',
      location: { country: 'Japan', city: 'Tokyo', address: '1-2-1 Otemachi, Chiyoda-ku' },
      serviceArea: ['Chiyoda', 'Shinjuku', 'Haneda Airport', 'Narita Airport'],
      vehicleTypes: ['luxury', 'minivan'],
      vehicles: [
        { model: 'Toyota Crown 2024', registrationNumber: 'TK-55-CR', capacity: 4, type: 'luxury' },
        { model: 'Toyota Alphard 2023', registrationNumber: 'TK-99-AL', capacity: 7, type: 'minivan' }
      ],
      drivers: [
        { name: 'Kenji Takahashi', email: 'kenji.takahashi@example.com', phone: '+81-90-1234-5678', licenseNumber: 'JP-DL-88776', experience: 12 },
        { name: 'Yoko Tanaka', email: 'yoko.tanaka@example.com', phone: '+81-90-8765-4321', licenseNumber: 'JP-DL-55443', experience: 5 }
      ],
      pricePerKm: 3.5,
      basePrice: 8.0,
      operatingHours: { open: '00:00', close: '23:59' },
      availability: true,
      rating: 4.9,
      reviewCount: 22,
      isVerified: true
    }
  },
  {
    user: {
      name: 'Sydney Harbour Chauffeurs',
      email: 'sydneyrides@example.com',
      password: 'password123',
      role: 'taxi_provider',
      phone: '+61-2-9876-5432',
      bio: 'Premium private transfer services around Sydney.'
    },
    provider: {
      businessName: 'Sydney Harbour Chauffeurs',
      description: 'Chauffeur and transport service around Sydney Harbour, CBD, and airports. Travel in style.',
      phone: '+61-2-9876-5432',
      email: 'bookings@sydneyharbour.com',
      location: { country: 'Australia', city: 'Sydney', address: '100 George Street' },
      serviceArea: ['Sydney CBD', 'Sydney Airport', 'Bondi Area'],
      vehicleTypes: ['sedan', 'minivan'],
      vehicles: [
        { model: 'Tesla Model 3 2023', registrationNumber: 'SYD-888-EV', capacity: 4, type: 'sedan' },
        { model: 'Kia Carnival 2022', registrationNumber: 'SYD-444-VAN', capacity: 7, type: 'minivan' }
      ],
      drivers: [
        { name: 'Bruce Miller', email: 'bruce.miller@example.com', phone: '+61-412-345-678', licenseNumber: 'AU-DL-1234A', experience: 7 },
        { name: 'Chloe Davis', email: 'chloe.davis@example.com', phone: '+61-412-987-654', licenseNumber: 'AU-DL-5678B', experience: 9 }
      ],
      pricePerKm: 2.2,
      basePrice: 6.5,
      operatingHours: { open: '06:00', close: '23:00' },
      availability: true,
      rating: 4.7,
      reviewCount: 14,
      isVerified: true
    }
  },
  {
    user: {
      name: 'Toronto Metro Cabs',
      email: 'torontocabs@example.com',
      password: 'password123',
      role: 'taxi_provider',
      phone: '+1-416-555-0199',
      bio: 'Convenient and reliable taxi services across Toronto.'
    },
    provider: {
      businessName: 'Toronto Metro Cabs',
      description: 'Fast, secure, and fully verified taxi rides across the Greater Toronto Area.',
      phone: '+1-416-555-0199',
      email: 'toronto@metrocabs.com',
      location: { country: 'Canada', city: 'Toronto', address: '55 Front Street West' },
      serviceArea: ['Greater Toronto Area', 'Pearson Airport'],
      vehicleTypes: ['sedan', 'suv'],
      vehicles: [
        { model: 'Hyundai Sonata 2024', registrationNumber: 'TO-112-HY', capacity: 4, type: 'sedan' },
        { model: 'Ford Explorer 2023', registrationNumber: 'TO-998-FD', capacity: 7, type: 'suv' }
      ],
      drivers: [
        { name: 'Robert Chen', email: 'robert.chen@example.com', phone: '+1-647-555-0101', licenseNumber: 'CA-ON-7788', experience: 6 },
        { name: 'Emily Wong', email: 'emily.wong@example.com', phone: '+1-647-555-0102', licenseNumber: 'CA-ON-9900', experience: 3 }
      ],
      pricePerKm: 1.6,
      basePrice: 5.5,
      operatingHours: { open: '00:00', close: '23:59' },
      availability: true,
      rating: 4.5,
      reviewCount: 11,
      isVerified: true
    }
  },
  {
    user: {
      name: 'Dubai Desert Transports',
      email: 'dubaitransports@example.com',
      password: 'password123',
      role: 'taxi_provider',
      phone: '+971-4-123-4567',
      bio: 'Luxury chauffeur and city transport in Dubai.'
    },
    provider: {
      businessName: 'Dubai Desert Transports',
      description: 'Premium luxury vehicles and local experts to navigate you through Dubai.',
      phone: '+971-4-123-4567',
      email: 'dubai@deserttrans.ae',
      location: { country: 'United Arab Emirates', city: 'Dubai', address: 'Sheikh Zayed Road, Marina' },
      serviceArea: ['Downtown Dubai', 'Dubai Marina', 'DXB Airport'],
      vehicleTypes: ['luxury', 'suv'],
      vehicles: [
        { model: 'Lexus ES 2024', registrationNumber: 'DXB-01-LX', capacity: 4, type: 'luxury' },
        { model: 'Nissan Patrol 2023', registrationNumber: 'DXB-02-SUV', capacity: 7, type: 'suv' }
      ],
      drivers: [
        { name: 'Ahmed Ali', email: 'ahmed.ali@example.com', phone: '+971-50-111-2222', licenseNumber: 'UAE-DXB-909', experience: 15 },
        { name: 'Rajesh Kumar', email: 'rajesh.kumar@example.com', phone: '+971-50-333-4444', licenseNumber: 'UAE-DXB-808', experience: 8 }
      ],
      pricePerKm: 2.5,
      basePrice: 12.0,
      operatingHours: { open: '00:00', close: '23:59' },
      availability: true,
      rating: 4.8,
      reviewCount: 30,
      isVerified: true
    }
  },
  {
    user: {
      name: 'Cape Point Shuttles',
      email: 'capetownshuttles@example.com',
      password: 'password123',
      role: 'taxi_provider',
      phone: '+27-21-555-0123',
      bio: 'Affordable tours and point-to-point transfers in Cape Town.'
    },
    provider: {
      businessName: 'Cape Point Shuttles',
      description: 'Reliable airport shuttles and sightseeing transfers in Cape Town and Western Cape.',
      phone: '+27-21-555-0123',
      email: 'bookings@capepoint.co.za',
      location: { country: 'South Africa', city: 'Cape Town', address: '3 Victoria Road' },
      serviceArea: ['Cape Town Bowl', 'Table Mountain', 'Cape Town Airport'],
      vehicleTypes: ['minivan', 'sedan'],
      vehicles: [
        { model: 'Volkswagen Caddy 2023', registrationNumber: 'CA-98765', capacity: 6, type: 'minivan' },
        { model: 'Toyota Corolla 2022', registrationNumber: 'CA-54321', capacity: 4, type: 'sedan' }
      ],
      drivers: [
        { name: 'Sipho Ncube', email: 'sipho.ncube@example.com', phone: '+27-82-555-0199', licenseNumber: 'ZA-DL-88997', experience: 5 },
        { name: 'Johan de Wet', email: 'johan.dewet@example.com', phone: '+27-82-555-0200', licenseNumber: 'ZA-DL-22334', experience: 11 }
      ],
      pricePerKm: 1.2,
      basePrice: 4.5,
      operatingHours: { open: '06:00', close: '22:00' },
      availability: true,
      rating: 4.4,
      reviewCount: 7,
      isVerified: true
    }
  },
  {
    user: {
      name: 'Rome Imperial Transports',
      email: 'rometransports@example.com',
      password: 'password123',
      role: 'taxi_provider',
      phone: '+39-06-123456',
      bio: 'Your historic city driver in Rome.'
    },
    provider: {
      businessName: 'Rome Imperial Transports',
      description: 'Professional transport services inside Rome and regional airport transfers.',
      phone: '+39-06-123456',
      email: 'rome@imperialtrans.it',
      location: { country: 'Italy', city: 'Rome', address: '15 Via del Corso' },
      serviceArea: ['Rome Historic Center', 'Fiumicino Airport', 'Ciampino Airport'],
      vehicleTypes: ['sedan', 'minivan'],
      vehicles: [
        { model: 'Fiat Tipo 2023', registrationNumber: 'RM-776-IT', capacity: 4, type: 'sedan' },
        { model: 'Mercedes Vito 2022', registrationNumber: 'RM-889-IT', capacity: 8, type: 'minivan' }
      ],
      drivers: [
        { name: 'Francesco Rossi', email: 'francesco.rossi@example.com', phone: '+39-333-123456', licenseNumber: 'IT-RM-99008', experience: 14 },
        { name: 'Giulia Bianchi', email: 'giulia.bianchi@example.com', phone: '+39-333-987654', licenseNumber: 'IT-RM-11223', experience: 7 }
      ],
      pricePerKm: 1.9,
      basePrice: 6.0,
      operatingHours: { open: '05:00', close: '23:30' },
      availability: true,
      rating: 4.7,
      reviewCount: 16,
      isVerified: true
    }
  },
  {
    user: {
      name: 'Singapore Merlion Rides',
      email: 'singaporerides@example.com',
      password: 'password123',
      role: 'taxi_provider',
      phone: '+65-6789-0123',
      bio: 'Efficient and eco-friendly city transfers in Singapore.'
    },
    provider: {
      businessName: 'Singapore Merlion Rides',
      description: 'Highly professional, clean, and quiet hybrid/electric vehicle rides across Singapore.',
      phone: '+65-6789-0123',
      email: 'merlion@rides.sg',
      location: { country: 'Singapore', city: 'Singapore', address: '1 Bayfront Avenue' },
      serviceArea: ['Central Area', 'Changi Airport', 'Sentosa'],
      vehicleTypes: ['sedan', 'luxury'],
      vehicles: [
        { model: 'Hyundai Ioniq 5 2023', registrationNumber: 'SHA-1234-A', capacity: 4, type: 'sedan' },
        { model: 'Toyota Alphard 2024', registrationNumber: 'SHB-8888-G', capacity: 6, type: 'luxury' }
      ],
      drivers: [
        { name: 'Lim Wei Jie', email: 'lim.weijie@example.com', phone: '+65-9123-4567', licenseNumber: 'SG-DL-776655', experience: 9 },
        { name: 'Nurul Huda', email: 'nurul.huda@example.com', phone: '+65-9876-5432', licenseNumber: 'SG-DL-334455', experience: 6 }
      ],
      pricePerKm: 1.5,
      basePrice: 5.0,
      operatingHours: { open: '00:00', close: '23:59' },
      availability: true,
      rating: 4.8,
      reviewCount: 19,
      isVerified: true
    }
  },
  {
    user: {
      name: 'Cairo Sphinx Cabs',
      email: 'cairocabs@example.com',
      password: 'password123',
      role: 'taxi_provider',
      phone: '+20-2-2345-6789',
      bio: 'Trusted taxi services and historical tours around Cairo.'
    },
    provider: {
      businessName: 'Cairo Sphinx Cabs',
      description: 'Reliable service for navigating the busy streets of Cairo and traveling to the Pyramids.',
      phone: '+20-2-2345-6789',
      email: 'cairo@sphinx-cabs.com',
      location: { country: 'Egypt', city: 'Cairo', address: '12 El Tahrir Square' },
      serviceArea: ['Cairo Downtown', 'Giza Pyramids', 'Cairo Airport'],
      vehicleTypes: ['sedan', 'minivan'],
      vehicles: [
        { model: 'Chevrolet Optra 2023', registrationNumber: 'CR-119-EG', capacity: 4, type: 'sedan' },
        { model: 'Hyundai H1 2022', registrationNumber: 'CR-220-EG', capacity: 8, type: 'minivan' }
      ],
      drivers: [
        { name: 'Mostafa Mahmoud', email: 'mostafa.mahmoud@example.com', phone: '+20-100-123-4567', licenseNumber: 'EG-DL-9988', experience: 11 },
        { name: 'Ibrahim Hassan', email: 'ibrahim.hassan@example.com', phone: '+20-100-987-6543', licenseNumber: 'EG-DL-7766', experience: 8 }
      ],
      pricePerKm: 1.0,
      basePrice: 4.0,
      operatingHours: { open: '00:00', close: '23:59' },
      availability: true,
      rating: 4.3,
      reviewCount: 8,
      isVerified: true
    }
  }
];

// 10 new Travel Agencies dataset
const newAgenciesData = [
  {
    user: {
      name: 'Barcelona Sun Travel',
      email: 'barcelonatravel@example.com',
      password: 'password123',
      role: 'agency',
      phone: '+34-93-123-4567',
      bio: 'Expert local tours and beach holidays around Barcelona and Catalonia.'
    },
    agency: {
      agencyName: 'Barcelona Sun Travel',
      description: 'Our agency focuses on high-quality city walks, beach breaks, and gourmet wine-tasting experiences.',
      specialties: ['beach', 'culture', 'food'],
      location: { country: 'Spain', city: 'Barcelona', address: '12 La Rambla' },
      phone: '+34-93-123-4567',
      email: 'info@barcelonasuntravel.com',
      website: 'www.barcelonasuntravel.com',
      priceRange: { min: 100, max: 1500 },
      rating: 4.8,
      reviewCount: 12,
      isVerified: true
    },
    packages: [
      {
        packageName: 'Costa Brava Beach Getaway',
        description: 'Spend 4 wonderful days relaxing on the beautiful beaches of Costa Brava. Package includes a boutique hotel, daily breakfasts, and a guided coastal hike.',
        destination_country: 'Spain',
        destination_city: 'Costa Brava',
        duration_days: 4,
        duration_nights: 3,
        pricePerPerson: 450,
        maxGroupSize: 12,
        minGroupSize: 2,
        included: ['Boutique Hotel', 'Breakfast', 'Guided Coastal Walk', 'Airport Shuttle'],
        isActive: true,
        averageRating: 4.8,
        totalReviews: 5
      },
      {
        packageName: 'Gothic Quarter & Tapas Tour',
        description: 'Discover the rich history of Barcelona with our local guide. Enjoy a premium tapas dinner and explore the narrow streets of the Gothic Quarter.',
        destination_country: 'Spain',
        destination_city: 'Barcelona',
        duration_days: 2,
        duration_nights: 1,
        pricePerPerson: 180,
        maxGroupSize: 10,
        minGroupSize: 1,
        included: ['Gourmet Dinner', 'Local Guide', 'Historic Walk', 'Hotel Stay'],
        isActive: true,
        averageRating: 5.0,
        totalReviews: 3
      }
    ]
  },
  {
    user: {
      name: 'Athens Odyssey Tours',
      email: 'athenstours@example.com',
      password: 'password123',
      role: 'agency',
      phone: '+30-210-987-6543',
      bio: 'Guiding you through ancient ruins and beautiful Greek islands.'
    },
    agency: {
      agencyName: 'Athens Odyssey Tours',
      description: 'We offer cultural excursions, historical walking tours, and island-hopping packages centered in Athens.',
      specialties: ['culture', 'history', 'beach'],
      location: { country: 'Greece', city: 'Athens', address: '5 Plaka Square' },
      phone: '+30-210-987-6543',
      email: 'contact@athensodyssey.gr',
      website: 'www.athensodyssey.gr',
      priceRange: { min: 200, max: 2000 },
      rating: 4.7,
      reviewCount: 8,
      isVerified: true
    },
    packages: [
      {
        packageName: 'Ancient Greek Wonders',
        description: 'Explore the Acropolis, Delphi, and ancient Agora. Package includes 4-star hotel stays, historic site entry passes, and a certified local archaeologist guide.',
        destination_country: 'Greece',
        destination_city: 'Athens',
        duration_days: 5,
        duration_nights: 4,
        pricePerPerson: 650,
        maxGroupSize: 15,
        minGroupSize: 2,
        included: ['Acropolis Tickets', '4-star Hotel', 'Daily Guided Tours', 'Breakfast'],
        isActive: true,
        averageRating: 4.7,
        totalReviews: 4
      },
      {
        packageName: 'Santorini Sunset Extension',
        description: 'A perfect extension to your Greek holiday. Visit beautiful Santorini, enjoy a sunset cruise, and explore the caldera towns of Fira and Oia.',
        destination_country: 'Greece',
        destination_city: 'Santorini',
        duration_days: 3,
        duration_nights: 2,
        pricePerPerson: 490,
        maxGroupSize: 8,
        minGroupSize: 2,
        included: ['Ferry Tickets', 'Sunset Cruise', 'Hotel Stay', 'Wine Tasting'],
        isActive: true,
        averageRating: 4.9,
        totalReviews: 6
      }
    ]
  },
  {
    user: {
      name: 'Kyoto Heritage Expeditions',
      email: 'kyototours@example.com',
      password: 'password123',
      role: 'agency',
      phone: '+81-75-555-0199',
      bio: 'Immersive cultural tours in the historic heart of Japan.'
    },
    agency: {
      agencyName: 'Kyoto Heritage Expeditions',
      description: 'Dedicated to providing genuine experiences of Japanese culture, history, and nature in Kyoto.',
      specialties: ['culture', 'nature', 'luxury'],
      location: { country: 'Japan', city: 'Kyoto', address: '15 Gionmachi Minamigawa' },
      phone: '+81-75-555-0199',
      email: 'bookings@kyotoheritage.jp',
      website: 'www.kyotoheritage.jp',
      priceRange: { min: 300, max: 3000 },
      rating: 4.9,
      reviewCount: 20,
      isVerified: true
    },
    packages: [
      {
        packageName: 'Zen Temples & Bamboo Forests',
        description: 'Walk through Arashiyama, pray at the Golden Pavilion, and experience a private tea ceremony led by a master.',
        destination_country: 'Japan',
        destination_city: 'Kyoto',
        duration_days: 5,
        duration_nights: 4,
        pricePerPerson: 880,
        maxGroupSize: 8,
        minGroupSize: 2,
        included: ['Traditional Ryokan', 'Tea Ceremony', 'Private Guide', 'Temple Admissions'],
        isActive: true,
        averageRating: 4.9,
        totalReviews: 8
      },
      {
        packageName: 'Cherry Blossom Magic Tour',
        description: 'See Kyoto at its most beautiful. Custom sakura walking paths, dinner at Gion, and traditional kimono rental included.',
        destination_country: 'Japan',
        destination_city: 'Kyoto',
        duration_days: 6,
        duration_nights: 5,
        pricePerPerson: 1100,
        maxGroupSize: 12,
        minGroupSize: 2,
        included: ['Hanami Picnic', 'Kimono Experience', 'Dinner at Gion', 'High-end Hotel'],
        isActive: true,
        averageRating: 5.0,
        totalReviews: 12
      }
    ]
  },
  {
    user: {
      name: 'Rio Carnival Travel',
      email: 'riotravel@example.com',
      password: 'password123',
      role: 'agency',
      phone: '+55-21-98765-4321',
      bio: 'Vibrant city tours and ecological hikes in Rio.'
    },
    agency: {
      agencyName: 'Rio Carnival Travel',
      description: 'Feel the rhythm of Rio with local experts showing you beaches, mountains, and nightlife.',
      specialties: ['adventure', 'beach', 'culture'],
      location: { country: 'Brazil', city: 'Rio de Janeiro', address: '100 Avenida Atlântica' },
      phone: '+55-21-98765-4321',
      email: 'info@riocarnival.br',
      website: 'www.riocarnival.br',
      priceRange: { min: 150, max: 1800 },
      rating: 4.6,
      reviewCount: 9,
      isVerified: true
    },
    packages: [
      {
        packageName: 'Copacabana Beach Break',
        description: 'Relax on Copacabana and Ipanema. Enjoy a guided trip to Sugarloaf Mountain and daily beachside breakfasts.',
        destination_country: 'Brazil',
        destination_city: 'Rio de Janeiro',
        duration_days: 5,
        duration_nights: 4,
        pricePerPerson: 590,
        maxGroupSize: 20,
        minGroupSize: 2,
        included: ['Beachside Hotel', 'Sugarloaf Cable Car', 'Breakfast', 'Local Transfers'],
        isActive: true,
        averageRating: 4.6,
        totalReviews: 3
      },
      {
        packageName: 'Christ the Redeemer Hike',
        description: 'Trek through the lush Tijuca Rainforest to reach the majestic Christ the Redeemer statue. Enjoy spectacular city views.',
        destination_country: 'Brazil',
        destination_city: 'Rio de Janeiro',
        duration_days: 3,
        duration_nights: 2,
        pricePerPerson: 320,
        maxGroupSize: 10,
        minGroupSize: 1,
        included: ['Tijuca Forest Guide', 'Corcovado Train', 'Lunch', 'Hotel Stay'],
        isActive: true,
        averageRating: 4.8,
        totalReviews: 5
      }
    ]
  },
  {
    user: {
      name: 'Himalayan Vistas',
      email: 'delhitours@example.com',
      password: 'password123',
      role: 'agency',
      phone: '+91-11-2345-6789',
      bio: 'Incredible journeys through historical and spiritual landmarks in India.'
    },
    agency: {
      agencyName: 'Himalayan Vistas',
      description: 'Specializing in historical, spiritual, and adventure tours across North India.',
      specialties: ['culture', 'adventure', 'history'],
      location: { country: 'India', city: 'New Delhi', address: '24 Connaught Place' },
      phone: '+91-11-2345-6789',
      email: 'contact@himalayanvistas.in',
      website: 'www.himalayanvistas.in',
      priceRange: { min: 100, max: 2200 },
      rating: 4.7,
      reviewCount: 15,
      isVerified: true
    },
    packages: [
      {
        packageName: 'Golden Triangle Explorer',
        description: 'Discover the heritage of Delhi, Taj Mahal in Agra, and the pink palaces of Jaipur over 6 unforgettable days.',
        destination_country: 'India',
        destination_city: 'Agra & Jaipur',
        duration_days: 6,
        duration_nights: 5,
        pricePerPerson: 720,
        maxGroupSize: 16,
        minGroupSize: 2,
        included: ['Taj Mahal Tour', 'Fort Palace Entry', 'AC Coach', '5-star Hotel Stay'],
        isActive: true,
        averageRating: 4.7,
        totalReviews: 9
      },
      {
        packageName: 'Rishikesh Yoga Retreat',
        description: 'Immerse yourself in wellness. Daily yoga, meditation, rafting on the Ganges, and organic vegetarian dining.',
        destination_country: 'India',
        destination_city: 'Rishikesh',
        duration_days: 7,
        duration_nights: 6,
        pricePerPerson: 480,
        maxGroupSize: 12,
        minGroupSize: 1,
        included: ['Yoga Sessions', 'Organic Meals', 'Ganges Rafting', 'Eco-Lodge Stay'],
        isActive: true,
        averageRating: 4.9,
        totalReviews: 6
      }
    ]
  },
  {
    user: {
      name: 'Bangkok Street Bites & Temples',
      email: 'bangkoktravel@example.com',
      password: 'password123',
      role: 'agency',
      phone: '+66-2-123-4567',
      bio: 'Indulge in Thai cuisine and admire golden temples with locals.'
    },
    agency: {
      agencyName: 'Bangkok Street Bites & Temples',
      description: 'Your premier guide to street food stalls, grand temples, and floating markets in Bangkok.',
      specialties: ['food', 'culture', 'budget'],
      location: { country: 'Thailand', city: 'Bangkok', address: '150 Khao San Road' },
      phone: '+66-2-123-4567',
      email: 'bookings@bangkokbites.co.th',
      website: 'www.bangkokbites.co.th',
      priceRange: { min: 80, max: 1200 },
      rating: 4.8,
      reviewCount: 11,
      isVerified: true
    },
    packages: [
      {
        packageName: 'Grand Palace & Floating Markets',
        description: 'Visit the stunning Grand Palace, take a longtail boat ride through floating markets, and experience a tuk-tuk tour.',
        destination_country: 'Thailand',
        destination_city: 'Bangkok',
        duration_days: 4,
        duration_nights: 3,
        pricePerPerson: 390,
        maxGroupSize: 15,
        minGroupSize: 2,
        included: ['Grand Palace Tickets', 'Boat Canal Tour', 'Tuk Tuk Ride', 'Comfort Hotel'],
        isActive: true,
        averageRating: 4.8,
        totalReviews: 7
      },
      {
        packageName: 'Thai Culinary Masterclass',
        description: 'Learn to cook authentic Thai dishes with professional chefs. Visit local markets to select fresh ingredients.',
        destination_country: 'Thailand',
        destination_city: 'Bangkok',
        duration_days: 3,
        duration_nights: 2,
        pricePerPerson: 250,
        maxGroupSize: 8,
        minGroupSize: 1,
        included: ['Cooking Class', 'Market Tour', 'Gourmet Lunch', 'Recipe Booklet'],
        isActive: true,
        averageRating: 4.9,
        totalReviews: 4
      }
    ]
  },
  {
    user: {
      name: 'Andean Adventures',
      email: 'cuscotravel@example.com',
      password: 'password123',
      role: 'agency',
      phone: '+51-84-123-4560',
      bio: 'Inca Trail treks and Machu Picchu expeditions.'
    },
    agency: {
      agencyName: 'Andean Adventures',
      description: 'Safe, sustainable, and highly educational hiking trips to archaeological marvels in the Andes.',
      specialties: ['adventure', 'culture', 'nature'],
      location: { country: 'Peru', city: 'Cusco', address: '8 Plaza de Armas' },
      phone: '+51-84-123-4560',
      email: 'info@andeanadventures.pe',
      website: 'www.andeanadventures.pe',
      priceRange: { min: 200, max: 2500 },
      rating: 4.9,
      reviewCount: 25,
      isVerified: true
    },
    packages: [
      {
        packageName: 'Machu Picchu Explorer',
        description: 'Witness the iconic lost city of the Incas. Scenic train trip, guided tour of Machu Picchu, and Cusco city walk.',
        destination_country: 'Peru',
        destination_city: 'Machu Picchu',
        duration_days: 5,
        duration_nights: 4,
        pricePerPerson: 950,
        maxGroupSize: 10,
        minGroupSize: 2,
        included: ['Train Ticket', 'Machu Picchu Entry', 'Hotel Stay', 'Professional Guide'],
        isActive: true,
        averageRating: 4.9,
        totalReviews: 15
      },
      {
        packageName: 'Sacred Valley Trek',
        description: 'Hike through picturesque Andean valleys, visit local weaving cooperatives, and camp under the southern stars.',
        destination_country: 'Peru',
        destination_city: 'Sacred Valley',
        duration_days: 4,
        duration_nights: 3,
        pricePerPerson: 550,
        maxGroupSize: 12,
        minGroupSize: 4,
        included: ['Hiking Guide', 'Camping Equipment', 'Porters', 'All Meals'],
        isActive: true,
        averageRating: 4.8,
        totalReviews: 10
      }
    ]
  },
  {
    user: {
      name: 'Empire State Experiences',
      email: 'nyctravel@example.com',
      password: 'password123',
      role: 'agency',
      phone: '+1-212-555-0188',
      bio: 'Customized luxury and cultural weekend trips in New York City.'
    },
    agency: {
      agencyName: 'Empire State Experiences',
      description: 'See the absolute best of Broadway, Central Park, and gourmet dining with our high-end NYC packages.',
      specialties: ['luxury', 'culture', 'city'],
      location: { country: 'United States', city: 'New York', address: '350 Fifth Avenue' },
      phone: '+1-212-555-0188',
      email: 'nyc@empiretours.com',
      website: 'www.empiretours.com',
      priceRange: { min: 250, max: 4000 },
      rating: 4.7,
      reviewCount: 14,
      isVerified: true
    },
    packages: [
      {
        packageName: 'Broadway & Skyline Highlights',
        description: 'See a top-tier Broadway musical, get fast-track passes to the Empire State Observatory, and stay in a Times Square luxury hotel.',
        destination_country: 'United States',
        destination_city: 'New York',
        duration_days: 4,
        duration_nights: 3,
        pricePerPerson: 890,
        maxGroupSize: 8,
        minGroupSize: 1,
        included: ['Broadway Show Ticket', 'Empire State Deck', 'Hotel Stay', 'MetroCard'],
        isActive: true,
        averageRating: 4.7,
        totalReviews: 6
      },
      {
        packageName: 'Central Park & Museums Pass',
        description: 'Explore NYC culture. Includes entry to the Met, MoMA, and a guided cycling tour of Central Park.',
        destination_country: 'United States',
        destination_city: 'New York',
        duration_days: 3,
        duration_nights: 2,
        pricePerPerson: 420,
        maxGroupSize: 15,
        minGroupSize: 1,
        included: ['Met & MoMA Entry', 'Bike Rental', 'Brunch Tour', 'Hotel Stay'],
        isActive: true,
        averageRating: 4.8,
        totalReviews: 8
      }
    ]
  },
  {
    user: {
      name: 'Southern Alps Escapes',
      email: 'queenstown@example.com',
      password: 'password123',
      role: 'agency',
      phone: '+64-3-555-0144',
      bio: 'Thrills, mountains, and spectacular sights in New Zealand.'
    },
    agency: {
      agencyName: 'Southern Alps Escapes',
      description: 'Your adventure specialist in the adrenaline capital of the world, Queenstown.',
      specialties: ['adventure', 'nature', 'luxury'],
      location: { country: 'New Zealand', city: 'Queenstown', address: '12 Shotover Street' },
      phone: '+64-3-555-0144',
      email: 'info@southernalps.co.nz',
      website: 'www.southernalps.co.nz',
      priceRange: { min: 300, max: 3500 },
      rating: 4.8,
      reviewCount: 18,
      isVerified: true
    },
    packages: [
      {
        packageName: 'Milford Sound Cruise & Flight',
        description: 'Fly over glaciers and cruise through the deep fiords of Milford Sound. Magnificent waterfalls and wildlife viewing.',
        destination_country: 'New Zealand',
        destination_city: 'Milford Sound',
        duration_days: 2,
        duration_nights: 1,
        pricePerPerson: 620,
        maxGroupSize: 6,
        minGroupSize: 2,
        included: ['Scenic Flight', 'Fiord Cruise', 'Lunch', '1-night Hotel'],
        isActive: true,
        averageRating: 4.9,
        totalReviews: 8
      },
      {
        packageName: 'Adrenaline Adventure Week',
        description: 'Bungy jump, white-water raft, jet boat, and skydive. The ultimate package for thrill seekers.',
        destination_country: 'New Zealand',
        destination_city: 'Queenstown',
        duration_days: 5,
        duration_nights: 4,
        pricePerPerson: 990,
        maxGroupSize: 10,
        minGroupSize: 2,
        included: ['Bungy Jump', 'Jet Boat Ride', 'Helicopter Transfer', '4-star Hotel'],
        isActive: true,
        averageRating: 4.8,
        totalReviews: 10
      }
    ]
  },
  {
    user: {
      name: 'Icelandic Fire & Ice',
      email: 'reykjavik@example.com',
      password: 'password123',
      role: 'agency',
      phone: '+354-555-1234',
      bio: 'Chasing auroras, geysers, and black sand beaches.'
    },
    agency: {
      agencyName: 'Icelandic Fire & Ice',
      description: 'Pioneers in high-comfort adventure excursions and northern lights hunts in Iceland.',
      specialties: ['nature', 'adventure', 'family'],
      location: { country: 'Iceland', city: 'Reykjavik', address: '5 Laugavegur' },
      phone: '+354-555-1234',
      email: 'contact@fireandice.is',
      website: 'www.fireandice.is',
      priceRange: { min: 400, max: 4000 },
      rating: 4.9,
      reviewCount: 22,
      isVerified: true
    },
    packages: [
      {
        packageName: 'Golden Circle & Northern Lights',
        description: 'See Gullfoss waterfall, Geysir, and hunt for the Northern Lights. Rejuvenate in a geothermal spa.',
        destination_country: 'Iceland',
        destination_city: 'Reykjavik',
        duration_days: 5,
        duration_nights: 4,
        pricePerPerson: 1100,
        maxGroupSize: 15,
        minGroupSize: 2,
        included: ['Geysir Tour', 'Aurora Hunting Trip', 'Geothermal Spa', 'Hotel Stay'],
        isActive: true,
        averageRating: 4.9,
        totalReviews: 12
      },
      {
        packageName: 'Glacier Hike & South Coast',
        description: 'Hike on Solheimajokull glacier with ice axes. Walk behind Seljalandsfoss waterfall and marvel at black sand beaches.',
        destination_country: 'Iceland',
        destination_city: 'South Coast',
        duration_days: 4,
        duration_nights: 3,
        pricePerPerson: 850,
        maxGroupSize: 12,
        minGroupSize: 2,
        included: ['Glacier Guide', 'Crampon Rental', 'Waterfalls Tour', 'Guesthouse Stay'],
        isActive: true,
        averageRating: 4.8,
        totalReviews: 10
      }
    ]
  }
];

const seedDB = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // Clean up any user who incorrectly got email set to 'bookings@quickcab.com' in a previous run
    await User.deleteOne({ email: 'bookings@quickcab.com' });

    // Note: We DO NOT wipe User/Agency collections so that other test data isn't deleted.
    // However, we will clear specific drivers and fleets associated with seeded users to avoid duplication
    // of drivers and vehicles when re-running the script.
    console.log('Verifying & seeding original users...');

    // 1. Original traveler
    const traveler = await getOrCreateUser({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'password123',
      role: 'traveler',
      phone: '555-0199',
      avatar: '',
      bio: 'Travel enthusiast exploring the world.'
    });

    // 2. Original agency
    const agencyUser = await getOrCreateUser({
      name: 'GlobeTrotter Tours',
      email: 'agency@example.com',
      password: 'password123',
      role: 'agency',
      phone: '555-0244',
      avatar: '',
      bio: 'Premier travel agency offering customized packages globally.'
    });

    await updateAgencyUser(agencyUser._id, {
      agencyName: 'GlobeTrotter Tours',
      description: 'Your dream vacations designed by experts. We specialize in luxury beach holidays, mountain trekking, and historic cultural tours.',
      specialties: ['adventure', 'luxury', 'beach', 'culture'],
      location: {
        country: 'United States',
        city: 'Miami',
        address: '100 Ocean Drive'
      },
      phone: '555-0244',
      businessEmail: 'info@globetrotter.com',
      website: 'www.globetrotter.com',
      logo: '',
      coverImage: '',
      priceRange: { min: 200, max: 2500 },
      averageRating: 4.8,
      totalReviews: 2,
      isVerified: true,
      isFeatured: true
    });

    const taxiUser = await getOrCreateUser({
      name: 'QuickCab Services',
      email: 'taxi@example.com',
      password: 'password123',
      role: 'taxi_provider',
      phone: '555-0388',
      avatar: '',
      bio: 'Reliable and affordable city rides and airport transfers.'
    });

    // Migrate old booking records referencing 'TaxiProvider' model
    const migrationResult = await Booking.updateMany(
      { $or: [{ bookingTypeModel: 'TaxiProvider' }, { bookingType: 'taxi', bookingTypeModel: { $ne: 'User' } }] },
      { $set: { bookingTypeModel: 'User', packageOrServiceId: taxiUser._id } }
    );
    console.log(`Migrated ${migrationResult.modifiedCount} old bookings to the new User model.`);

    await updateTaxiProviderUser(taxiUser._id, {
      businessName: 'QuickCab Services',
      description: 'Fast, secure, and fully verified taxi rides across the state. Available 24/7.',
      phone: '555-0388',
      businessEmail: 'bookings@quickcab.com',
      location: {
        country: 'United States',
        city: 'Miami',
        address: '450 Airport Boulevard'
      },
      serviceArea: ['Miami Metro', 'Fort Lauderdale', 'Miami Airport (MIA)'],
      vehicleTypes: ['sedan', 'suv', 'minivan'],
      pricePerKm: 1.5,
      basePrice: 5.0,
      operatingHours: { open: '00:00', close: '23:59' },
      availability: true,
      averageRating: 4.5,
      totalReviews: 2,
      isVerified: true
    });

    // Original vehicles/drivers
    const origVehicles = [
      { model: 'Toyota Camry 2024', registrationNumber: 'TX-987-FL', capacity: 4, type: 'sedan' },
      { model: 'Chevrolet Suburban 2023', registrationNumber: 'TX-456-FL', capacity: 7, type: 'suv' }
    ];
    for (const v of origVehicles) {
      await getOrCreateFleetVehicle({ ...v, providerId: taxiUser._id });
    }

    await getOrCreateTaxiDriver({
      name: 'David Smith',
      email: 'david.smith@example.com',
      phone: '555-0988',
      licenseNumber: 'DL-883344',
      experience: 5,
      providerId: taxiUser._id
    });

    // 4. Original packages
    const package1 = await getOrCreateTravelPackage({
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

    const package2 = await getOrCreateTravelPackage({
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

    // 5. Original bookings
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
      const price = isHawaii ? 2400 : 1850;
      const numPeople = isHawaii ? 2 : 1;
      
      const booking = await getOrCreateBooking({
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

    // Create bookings for Taxi Provider (using taxiUser._id now!)
    for (let i = 8; i < 12; i++) {
      const price = 50 + (i * 5);
      const booking = await getOrCreateBooking({
        bookingNumber: `BK-TX-${1000 + i}`,
        bookingType: 'taxi',
        travelerId: traveler._id,
        packageOrServiceId: taxiUser._id,
        bookingTypeModel: 'User',
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

    // Original reviews (linked to taxiUser._id now!)
    if (bookings[0]) {
      await getOrCreateReview({
        reviewType: 'agency',
        reviewerId: traveler._id,
        agencyOrProviderId: agencyUser._id,
        bookingId: bookings[0]._id,
        rating: 5,
        title: 'Absolutely wonderful experience!',
        comment: 'The Hawaii trip was fantastic. GlobeTrotter planned everything perfectly, from the beach resorts to the snorkeling trips.',
        cleanliness_rating: 5,
        comfort_rating: 5,
        professionalism_rating: 5,
        isVerifiedPurchase: true,
        createdAt: new Date('2026-02-01T12:00:00Z')
      });
    }

    if (bookings[1]) {
      await getOrCreateReview({
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
    }

    if (bookings[8]) {
      await getOrCreateReview({
        reviewType: 'taxi',
        reviewerId: traveler._id,
        agencyOrProviderId: taxiUser._id,
        bookingId: bookings[8]._id,
        rating: 5,
        title: 'Punctual and clean!',
        comment: 'The driver David was super helpful. He arrived 5 minutes early, loaded all my bags, and drove very safely.',
        cleanliness_rating: 5,
        comfort_rating: 5,
        professionalism_rating: 5,
        isVerifiedPurchase: true,
        createdAt: new Date('2026-05-10T12:00:00Z')
      });
    }

    if (bookings[9]) {
      await getOrCreateReview({
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
    }

    console.log('Seeding new 10 Taxi Providers...');
    for (const item of newTaxiProvidersData) {
      const user = await getOrCreateUser(item.user);
      const providerFields = {
        businessName: item.provider.businessName,
        description: item.provider.description,
        phone: item.provider.phone,
        businessEmail: item.provider.email,
        location: item.provider.location,
        serviceArea: item.provider.serviceArea,
        vehicleTypes: item.provider.vehicleTypes,
        pricePerKm: item.provider.pricePerKm,
        basePrice: item.provider.basePrice,
        operatingHours: item.provider.operatingHours,
        availability: item.provider.availability,
        averageRating: item.provider.rating,
        totalReviews: item.provider.reviewCount,
        isVerified: item.provider.isVerified
      };
      await updateTaxiProviderUser(user._id, providerFields);

      // Seed vehicles for this provider
      for (const v of item.provider.vehicles) {
        await getOrCreateFleetVehicle({
          ...v,
          providerId: user._id
        });
      }

      // Seed drivers for this provider
      for (const d of item.provider.drivers) {
        await getOrCreateTaxiDriver({
          ...d,
          providerId: user._id
        });
      }
    }

    console.log('Seeding new 10 Travel Agencies & packages...');
    for (const item of newAgenciesData) {
      const user = await getOrCreateUser(item.user);
      const agencyFields = {
        agencyName: item.agency.agencyName,
        description: item.agency.description,
        specialties: item.agency.specialties,
        location: item.agency.location,
        phone: item.agency.phone,
        businessEmail: item.agency.email,
        website: item.agency.website,
        logo: item.agency.logo || '',
        coverImage: item.agency.coverImage || '',
        priceRange: item.agency.priceRange,
        averageRating: item.agency.rating,
        totalReviews: item.agency.reviewCount,
        isVerified: item.agency.isVerified,
        isFeatured: item.agency.isFeatured || false
      };
      await updateAgencyUser(user._id, agencyFields);

      for (const pkg of item.packages) {
        const pkgData = {
          ...pkg,
          agencyId: user._id
        };
        await getOrCreateTravelPackage(pkgData);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB();
