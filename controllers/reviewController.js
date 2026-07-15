import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import TravelPackage from '../models/TravelPackage.js';

// @route  POST /api/v1/reviews
// @access Private (traveler role)
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, title, comment, cleanliness_rating, comfort_rating, professionalism_rating } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify booking traveler matches reviewer
    if (booking.travelerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to review this booking' });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking' });
    }

    // Find the owner/provider userId
    let agencyOrProviderId;
    let reviewType;

    if (booking.bookingType === 'package') {
      const pkg = await TravelPackage.findById(booking.packageOrServiceId);
      if (!pkg) {
        // Fallback or find agency directly if package deleted
        const agency = await User.findOne({ _id: booking.packageOrServiceId, role: 'agency' });
        agencyOrProviderId = agency ? agency._id : null;
      } else {
        agencyOrProviderId = pkg.agencyId;
      }
      reviewType = 'agency';
    } else {
      // In the new architecture, packageOrServiceId is the taxi provider's user ID directly
      agencyOrProviderId = booking.packageOrServiceId;
      reviewType = 'taxi';
    }

    if (!agencyOrProviderId) {
      return res.status(400).json({ success: false, message: 'Could not resolve provider ID for this review' });
    }

    // Create the review
    const review = await Review.create({
      reviewType,
      reviewerId: req.user.id,
      agencyOrProviderId,
      bookingId,
      rating: Number(rating),
      title: title || '',
      comment,
      cleanliness_rating: Number(cleanliness_rating || 5),
      comfort_rating: Number(comfort_rating || 5),
      professionalism_rating: Number(professionalism_rating || 5),
      isVerifiedPurchase: true,
      isApproved: true
    });

    // Update ratings on Agency and User profiles
    const allReviews = await Review.find({ agencyOrProviderId });
    const count = allReviews.length;
    const avg = parseFloat((allReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1));

    // Update User model
    await User.findByIdAndUpdate(agencyOrProviderId, {
      averageRating: avg,
      totalReviews: count
    });

    // Also update booking status to mark reviewed (implied)
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/v1/reviews
// @access Public
export const getReviews = async (req, res) => {
  try {
    const { agencyOrProviderId } = req.query;
    const filter = {};

    if (agencyOrProviderId) {
      filter.agencyOrProviderId = agencyOrProviderId;
    }

    const reviews = await Review.find(filter)
      .populate('reviewerId', 'name avatar')
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
