import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
    unique: true
  },
  bookingType: {
    type: String,
    enum: ['package', 'taxi'],
    required: true
  },
  travelerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  packageOrServiceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'bookingTypeModel'
  },
  bookingTypeModel: {
    type: String,
    required: true,
    enum: ['TravelPackage', 'TaxiProvider']
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending'
  },
  totalPrice: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    default: 'Cash'
  },
  numberOfPeople: {
    type: Number,
    default: 1
  },
  specialRequests: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
