import mongoose from 'mongoose';

const travelPackageSchema = new mongoose.Schema({
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User model (with role agency)
    required: true
  },
  packageName: {
    type: String,
    required: [true, 'Package name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  destination_country: {
    type: String,
    required: true
  },
  destination_city: {
    type: String,
    required: true
  },
  duration_days: {
    type: Number,
    required: true
  },
  duration_nights: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  pricePerPerson: {
    type: Number,
    required: true
  },
  maxGroupSize: {
    type: Number,
    default: 10
  },
  minGroupSize: {
    type: Number,
    default: 1
  },
  images: {
    type: [String],
    default: []
  },
  included: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const TravelPackage = mongoose.model('TravelPackage', travelPackageSchema);
export default TravelPackage;
