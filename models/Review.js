import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewType: {
    type: String,
    enum: ['agency', 'taxi', 'package'],
    required: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agencyOrProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User (with role agency or taxi_provider)
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    default: ''
  },
  comment: {
    type: String,
    required: true
  },
  cleanliness_rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  comfort_rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  professionalism_rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  images: {
    type: [String],
    default: []
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  helpfulCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
