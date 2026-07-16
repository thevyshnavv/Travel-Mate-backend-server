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

/**
 * Generates HTML email content for traveler payment success confirmation
 */
export const getTravelerPaymentSuccessTemplate = (travelerName, bookingNumber, totalPrice, bookingType, serviceName, driverName = null, driverEmail = null, driverPhone = null, vehicleDetails = null) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      <h2 style="color: #10B981; text-align: center;">Payment Confirmed & Booking Secured!</h2>
      <p>Dear <strong>${travelerName}</strong>,</p>
      <p>Thank you for your payment! We are pleased to confirm that your booking <strong>${bookingNumber}</strong> is now fully secured and confirmed.</p>
      
      <div style="background-color: #ECFDF5; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10B981;">
        <h4 style="margin-top: 0; color: #065F46;">Booking Details:</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; color: #047857;">Booking Number:</td>
            <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #065F46;">${bookingNumber}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #047857;">Booking Type:</td>
            <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #065F46; text-transform: capitalize;">${bookingType}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #047857;">Service/Package Name:</td>
            <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #065F46;">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #047857;">Amount Paid:</td>
            <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #065F46;">$${totalPrice}</td>
          </tr>
        </table>
      </div>

      ${driverName ? `
      <div style="background-color: #F9FAFB; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #E5E7EB;">
        <h4 style="margin-top: 0; color: #374151;">Assigned Driver Details:</h4>
        <p style="margin: 5px 0;"><strong>Driver Name:</strong> ${driverName}</p>
        <p style="margin: 5px 0;"><strong>Driver Email:</strong> ${driverEmail || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Driver Phone:</strong> ${driverPhone || 'N/A'}</p>
        ${vehicleDetails ? `<p style="margin: 5px 0;"><strong>Vehicle Details:</strong> ${vehicleDetails}</p>` : ''}
      </div>
      ` : ''}

      <p>You can view your active bookings and details anytime from your dashboard profile.</p>

      <p style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:5173/profile" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Profile</a>
      </p>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="font-size: 12px; color: #9CA3AF; text-align: center;">This is an automated notification. Please do not reply directly to this email.</p>
    </div>
  `;
};

/**
 * Generates HTML email content for service provider (agency / taxi) new booking notice
 */
export const getProviderNewBookingTemplate = (providerName, travelerName, travelerEmail, travelerPhone, bookingNumber, totalPrice, bookingType, serviceName) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      <h2 style="color: #3B82F6; text-align: center;">New Confirmed Booking Received!</h2>
      <p>Dear <strong>${providerName}</strong>,</p>
      <p>Great news! You have received a new confirmed booking. The customer has successfully paid, and the booking is secured.</p>
      
      <div style="background-color: #EFF6FF; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3B82F6;">
        <h4 style="margin-top: 0; color: #1E40AF;">Booking Summary:</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; color: #1D4ED8;">Booking Number:</td>
            <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #1E40AF;">${bookingNumber}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #1D4ED8;">Service/Package Name:</td>
            <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #1E40AF;">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #1D4ED8;">Amount Collected:</td>
            <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #1E40AF;">$${totalPrice}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #F9FAFB; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #E5E7EB;">
        <h4 style="margin-top: 0; color: #374151;">Customer Contact Details:</h4>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${travelerName}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${travelerEmail}</p>
        <p style="margin: 5px 0;"><strong>Phone:</strong> ${travelerPhone || 'N/A'}</p>
      </div>

      <p>Please review this booking details and prepare for the service from your dashboard.</p>

      <p style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:5173/profile" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Dashboard</a>
      </p>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="font-size: 12px; color: #9CA3AF; text-align: center;">This is an automated notification. Please do not reply directly to this email.</p>
    </div>
  `;
};
