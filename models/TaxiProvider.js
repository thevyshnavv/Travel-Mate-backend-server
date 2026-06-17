import mongoose from 'mongoose';

const taxiProviderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    required: true
  },
  email: String,
  location: {
    country: String,
    city: String,
    address: String
  },
  serviceArea: {
    type: [String],
    default: []
    // e.g., ['Airport Transfer', 'City Tour', 'Long Distance']
  },
  vehicleTypes: {
    type: [String],
    default: ['sedan']
    // e.g., ['sedan', 'suv', 'minivan', 'luxury', 'bus']
  },
  vehicles: [{
    model: String,
    registrationNumber: String,
    capacity: Number,
    type: String,
    image: String
  }],
  drivers: [{
    name: String,
    phone: String,
    licenseNumber: String,
    experience: Number, // in years
    image: String
  }],
  pricePerKm: {
    type: Number,
    default: 0
  },
  basePrice: {
    type: Number,
    default: 0
  },
  operatingHours: {
    open: String, // e.g., "06:00"
    close: String // e.g., "23:00"
  },
  availability: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const TaxiProvider = mongoose.model('TaxiProvider', taxiProviderSchema);
export default TaxiProvider;