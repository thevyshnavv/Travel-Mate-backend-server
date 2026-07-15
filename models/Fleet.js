import mongoose from 'mongoose';

const fleetSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required']
  },
  registrationNumber: {
    type: String,
    required: [true, 'Vehicle registration number is required']
  },
  capacity: {
    type: Number,
    required: [true, 'Vehicle capacity is required']
  },
  type: {
    type: String,
    required: [true, 'Vehicle type is required']
  },
  image: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const Fleet = mongoose.model('Fleet', fleetSchema);
export default Fleet;
