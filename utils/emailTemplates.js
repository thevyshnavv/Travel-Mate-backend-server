/**
 * Generates HTML email content for payment reminders
 * @param {string} travelerName - The name of the traveler
 * @param {string} bookingNumber - The booking number
 * @param {number} totalPrice - The total price of the booking
 * @returns {string} - HTML string
 */
export const getPaymentReminderTemplate = (travelerName, bookingNumber, totalPrice) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      <h2 style="color: #4F46E5; text-align: center;">Payment Reminder for Your Booking</h2>
      <p>Dear <strong>${travelerName}</strong>,</p>
      <p>This is a friendly reminder that your booking <strong>${bookingNumber}</strong> has been successfully confirmed. However, we have not yet received your payment.</p>
      
      <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #1F2937;">Booking Summary:</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; color: #4B5563;">Booking Number:</td>
            <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #111827;">${bookingNumber}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #4B5563;">Total Price:</td>
            <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #111827;">$${totalPrice}</td>
          </tr>
        </table>
      </div>

      <p>Please complete your payment as soon as possible to secure your reservation. If payment is not received within 48 hours of booking creation, your reservation will be automatically cancelled.</p>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:5173/profile" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Complete Payment</a>
      </p>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="font-size: 12px; color: #9CA3AF; text-align: center;">This is an automated notification. Please do not reply directly to this email.</p>
    </div>
  `;
};

/**
 * Generates HTML email content for booking cancellations
 * @param {string} travelerName - The name of the traveler
 * @param {string} bookingNumber - The booking number
 * @returns {string} - HTML string
 */
export const getBookingCancellationTemplate = (travelerName, bookingNumber) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      <h2 style="color: #EF4444; text-align: center;">Booking Cancellation Notice</h2>
      <p>Dear <strong>${travelerName}</strong>,</p>
      <p>We regret to inform you that your booking <strong>${bookingNumber}</strong> has been cancelled because we did not receive the required payment within the 48-hour window.</p>
      
      <div style="border-left: 4px solid #EF4444; padding: 10px 15px; background-color: #FEF2F2; margin: 20px 0;">
        <p style="margin: 0; color: #991B1B;"><strong>Status:</strong> Cancelled (Unpaid)</p>
        <p style="margin: 5px 0 0 0; color: #991B1B;"><strong>Booking Number:</strong> ${bookingNumber}</p>
      </div>

      <p>If you believe this is an error or would like to make a new reservation, please visit our platform or contact support.</p>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:5173/browse-agencies" style="background-color: #1F2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Browse New Packages</a>
      </p>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="font-size: 12px; color: #9CA3AF; text-align: center;">This is an automated notification. Please do not reply directly to this email.</p>
    </div>
  `;
};
