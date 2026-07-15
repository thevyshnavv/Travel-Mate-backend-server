import cron from 'node-cron';
import Booking from '../models/Booking.js';
import { sendEmail } from '../config/mailer.js';
import { getPaymentReminderTemplate } from '../utils/emailTemplates.js';

/**
 * Hourly Payment Reminder Job
 * 
 * Schedule: Runs every hour ('0 * * * *').
 * Purpose: Finds all bookings where status is 'confirmed' (or 'Confirmed') and paymentStatus
 *          is 'pending' (or 'Pending'), and a reminder email has not yet been sent.
 *          Sends an HTML reminder email to the traveler to complete their payment,
 *          then sets `reminderSent` to true to prevent duplicate emails.
 */
const runPaymentReminderJob = async () => {
  console.log('[Reminder Job] Starting payment reminder scan...');
  try {
    // Find matching bookings and populate traveler details to get name and email
    const bookings = await Booking.find({
      status: { $in: ['confirmed', 'Confirmed'] },
      paymentStatus: { $in: ['pending', 'Pending'] },
      reminderSent: false
    }).populate('travelerId', 'name email');

    console.log(`[Reminder Job] Found ${bookings.length} unpaid confirmed bookings.`);

    for (const booking of bookings) {
      try {
        const traveler = booking.travelerId;
        if (!traveler || !traveler.email) {
          console.warn(`[Reminder Job] Skipping booking ${booking.bookingNumber} - traveler email not found.`);
          continue;
        }

        const htmlContent = getPaymentReminderTemplate(
          traveler.name,
          booking.bookingNumber,
          booking.totalPrice
        );

        // Send the reminder email
        await sendEmail(
          traveler.email,
          `Payment Reminder: Booking ${booking.bookingNumber}`,
          htmlContent
        );

        // Update the database to reflect that the reminder has been sent
        booking.reminderSent = true;
        await booking.save();
        console.log(`[Reminder Job] Sent payment reminder and saved booking ${booking.bookingNumber}.`);
      } catch (innerErr) {
        // Log individual error and continue loop so other bookings are not blocked
        console.error(`[Reminder Job] Failed to process reminder for booking ${booking.bookingNumber}:`, innerErr.message);
      }
    }
    console.log('[Reminder Job] Payment reminder scan finished.');
  } catch (err) {
    console.error('[Reminder Job] Fatal error during payment reminder job:', err.message);
  }
};

// Register and schedule the job to run every hour
export const initPaymentReminderJob = () => {
  cron.schedule('0 * * * *', runPaymentReminderJob);
  console.log('[Reminder Job] Scheduled: Every hour ("0 * * * *")');
};

// Export the job runner for direct testing/triggering purposes
export { runPaymentReminderJob };
