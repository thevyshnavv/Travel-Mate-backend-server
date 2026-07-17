import mongoose from 'mongoose';

const guideSchema = new mongoose.Schema({
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Guide name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Guide email is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Guide phone number is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

const Guide = mongoose.model('Guide', guideSchema);
export default Guide;
