import cron from 'node-cron';
import Booking from '../models/Booking.js';
import { sendEmail } from '../config/mailer.js';
import { getBookingCancellationTemplate } from '../utils/emailTemplates.js';

/**
 * Auto-Cancel Unpaid Bookings Job
 * 
 * Schedule: Runs every 30 minutes.
 * Purpose: Finds all bookings where status is 'confirmed' (or 'Confirmed') and paymentStatus
 *          is 'pending' (or 'Pending'), and the booking creation date is older than 48 hours.
 *          Updates the booking status to 'cancelled', then sends an HTML cancellation
 *          notice email to the traveler.
 */
const runCancelBookingJob = async () => {
  console.log('[Cancel Job] Starting unpaid bookings auto-cancellation scan...');
  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    // Find matching bookings and populate traveler details to get name and email
    const bookings = await Booking.find({
      status: { $in: ['confirmed', 'Confirmed'] },
      paymentStatus: { $in: ['pending', 'Pending'] },
      createdAt: { $lt: fortyEightHoursAgo }
    }).populate('travelerId', 'name email');

    console.log(`[Cancel Job] Found ${bookings.length} unpaid bookings older than 48 hours.`);

    for (const booking of bookings) {
      try {
        const traveler = booking.travelerId;
        if (!traveler || !traveler.email) {
          console.warn(`[Cancel Job] Skipping booking ${booking.bookingNumber} - traveler email not found.`);
          continue;
        }

        // 1. Update booking status to 'cancelled' (we use lowercase 'cancelled' to meet user spec,
        //    but enums allow both case variants)
        booking.status = 'cancelled';
        await booking.save();
        console.log(`[Cancel Job] Cancelled booking ${booking.bookingNumber} in database.`);

        // 2. Send the cancellation notice email
        const htmlContent = getBookingCancellationTemplate(
          traveler.name,
          booking.bookingNumber
        );

        await sendEmail(
          traveler.email,
          `Booking Cancelled: Booking ${booking.bookingNumber}`,
          htmlContent
        );
        console.log(`[Cancel Job] Sent cancellation notice to ${traveler.email} for booking ${booking.bookingNumber}.`);
      } catch (innerErr) {
        // Log individual error and continue loop so other bookings are not blocked
        console.error(`[Cancel Job] Failed to process cancellation for booking ${booking.bookingNumber}:`, innerErr.message);
      }
    }
    console.log('[Cancel Job] Auto-cancellation scan finished.');
  } catch (err) {
    console.error('[Cancel Job] Fatal error during auto-cancellation job:', err.message);
  }
};

// Register and schedule the job to run every 30 minutes
export const initCancelBookingJob = () => {
  cron.schedule('*/30 * * * *', runCancelBookingJob);
  console.log('[Cancel Job] Scheduled: Every 30 minutes ("*/30 * * * *")');
};

// Export the job runner for direct testing/triggering purposes
export { runCancelBookingJob };
