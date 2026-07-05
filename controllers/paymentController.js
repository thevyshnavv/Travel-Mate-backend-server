import Razorpay from 'razorpay';
import crypto from 'crypto';

export const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'USD' } = req.body;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret',
    });

    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency,
      receipt: `receipt_order_${Math.round(Math.random() * 1000)}`
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) {
      return res.status(500).json({ success: false, message: 'Failed to create order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret')
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
