import mongoose from 'mongoose';

const taxiDriverSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Driver name is required']
  },
  email: {
    type: String,
    required: [true, 'Driver email is required']
  },
  phone: {
    type: String,
    required: [true, 'Driver phone is required']
  },
  licenseNumber: {
    type: String,
    required: [true, 'Driver license number is required']
  },
  experience: {
    type: Number,
    required: [true, 'Driver experience is required']
  },
  image: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const TaxiDriver = mongoose.model('TaxiDriver', taxiDriverSchema);
export default TaxiDriver;
