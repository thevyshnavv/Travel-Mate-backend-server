import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using SMTP transport configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.EMAIL_PORT || '2525', 10),
  secure: process.env.EMAIL_PORT === '465', // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Reusable utility function to send emails
 * @param {string} to - Recipient email address
 * @param {string} subject - Subject line of the email
 * @param {string} html - HTML email body content
 * @returns {Promise<object>} - Nodemailer send result info object
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Travel Mate" <${process.env.EMAIL_USER || 'no-reply@travelmate.com'}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: MsgId=${info.messageId} To=${to}`);
    return info;
  } catch (error) {
    console.error(`Error occurred while sending email to ${to}:`, error.message);
    throw error;
  }
};
