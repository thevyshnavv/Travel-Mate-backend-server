import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { sendEmail } from '../config/mailer.js';
import { getTravelerPaymentSuccessTemplate, getProviderNewBookingTemplate } from '../utils/emailTemplates.js';

// Helper to generate a unique payment number
const generatePaymentNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAY-${timestamp}-${random}`;
};

// POST /api/v1/payment/create-order
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    // Validate amount
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: `Invalid amount: ${amount}` });
    }

    // Validate Razorpay keys exist
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: 'Razorpay keys not configured on server' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency,
      receipt: `receipt_${generatePaymentNumber()}`
    };

    console.log('Creating Razorpay order:', options);
    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ success: false, message: 'Failed to create Razorpay order' });
    }

    console.log('Razorpay order created:', order.id);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Razorpay createOrder error:', error);
    // Return the actual Razorpay error so we can debug
    res.status(500).json({
      success: false,
      message: error?.error?.description || error?.message || 'Unknown Razorpay error',
      razorpayError: error?.error || null
    });
  }
};


// POST /api/v1/payment/verify
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
      amount,
      currency = 'INR',
      paymentMethod = 'Card',
      billingName = '',
      billingAddress = '',
      billingCity = '',
      billingCountry = '',
      billingPhone = ''
    } = req.body;

    // 1. Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // 2. Save payment record to DB
    const payment = new Payment({
      paymentNumber: generatePaymentNumber(),
      bookingId,
      userId: req.user._id,
      amount,
      currency,
      paymentMethod,
      paymentGateway: 'Razorpay',
      transactionId: razorpay_payment_id,
      status: 'Paid',
      billingName,
      billingAddress,
      billingCity,
      billingCountry,
      billingPhone,
      receiptURL: ''
    });
    await payment.save();

    // 3. Update booking paymentStatus to 'Paid'
    if (bookingId) {
      const booking = await Booking.findById(bookingId)
        .populate('travelerId')
        .populate('packageOrServiceId')
        .populate('assignedDriverId')
        .populate('assignedVehicleId')
        .populate('assignedGuideId');
      
      if (booking) {
        booking.paymentStatus = 'Paid';
        booking.status = 'Confirmed'; // Confirm the booking on payment
        await booking.save();

        // Prepare traveler and service details
        const traveler = booking.travelerId;
        const bookingType = booking.bookingType; // 'package' or 'taxi'
        let serviceName = 'Booking Service';
        let providerEmail = null;
        let providerName = 'Service Provider';

        if (bookingType === 'package') {
          const pkg = booking.packageOrServiceId;
          if (pkg) {
            serviceName = pkg.packageName;
            // Retrieve the agency User record using pkg.agencyId
            const agencyUser = await User.findById(pkg.agencyId);
            if (agencyUser) {
              providerEmail = agencyUser.businessEmail || agencyUser.email;
              providerName = agencyUser.agencyName || agencyUser.businessName || agencyUser.name;
            }
          }
        } else if (bookingType === 'taxi') {
          const taxiUser = booking.packageOrServiceId;
          if (taxiUser) {
            serviceName = taxiUser.businessName || taxiUser.name || 'Taxi Service';
            providerEmail = taxiUser.businessEmail || taxiUser.email;
            providerName = taxiUser.businessName || taxiUser.name;
          }
        }

        // Send Email to Traveler
        if (traveler && traveler.email) {
          try {
            const travelerHtml = getTravelerPaymentSuccessTemplate(
              traveler.name,
              booking.bookingNumber,
              booking.totalPrice,
              bookingType,
              serviceName,
              booking.assignedDriverId?.name,
              booking.assignedDriverId?.email,
              booking.assignedDriverId?.phone,
              booking.assignedVehicleId ? `${booking.assignedVehicleId.model} (${booking.assignedVehicleId.registrationNumber})` : null,
              booking.assignedGuideId?.name,
              booking.assignedGuideId?.email,
              booking.assignedGuideId?.phone
            );
            await sendEmail(
              traveler.email,
              `Booking Confirmed & Paid: ${booking.bookingNumber}`,
              travelerHtml
            );
          } catch (mailErr) {
            console.error('[VerifyPayment Mail] Failed to send email to traveler:', mailErr.message);
          }
        }

        // Send Email to Provider (Agency or Taxi Provider)
        if (providerEmail) {
          try {
            const providerHtml = getProviderNewBookingTemplate(
              providerName,
              traveler ? traveler.name : 'A Traveler',
              traveler ? traveler.email : 'N/A',
              traveler ? traveler.phone : 'N/A',
              booking.bookingNumber,
              booking.totalPrice,
              bookingType,
              serviceName
            );
            await sendEmail(
              providerEmail,
              `New Paid Booking: ${booking.bookingNumber}`,
              providerHtml
            );
          } catch (mailErr) {
            console.error('[VerifyPayment Mail] Failed to send email to provider:', mailErr.message);
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and recorded successfully',
      payment
    });
  } catch (error) {
    console.error('Payment verify error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/payment/my-payments
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate('bookingId', 'bookingNumber bookingType totalPrice status')
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
