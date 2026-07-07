import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentNumber: {
    type: String,
    required: true,
    unique: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    default: 'Card'
  },
  paymentGateway: {
    type: String,
    default: 'Razorpay'
  },
  transactionId: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  billingName: {
    type: String,
    default: ''
  },
  billingAddress: {
    type: String,
    default: ''
  },
  billingCity: {
    type: String,
    default: ''
  },
  billingCountry: {
    type: String,
    default: ''
  },
  billingPhone: {
    type: String,
    default: ''
  },
  receiptURL: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
