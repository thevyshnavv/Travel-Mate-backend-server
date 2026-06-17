import mongoose from 'mongoose';

const agencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agencyName: {
    type: String,
    required: [true, 'Agency name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  specialties: {
    type: [String],
    default: ['general tour']
    // e.g., ['adventure', 'budget', 'luxury', 'family', 'solo']
  },
  location: {
    country: String,
    city: String,
    address: String
  },
  phone: {
    type: String,
    required: true
  },
  website: String,
  email: String,
  logo: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  priceRange: {
    min: Number,
    max: Number
    // e.g., { min: 500, max: 5000 }
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

const Agency = mongoose.model('Agency', agencySchema);
export default Agency;