import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';

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
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'Paid' });
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
