import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    phone: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['traveler', 'agency', 'taxi_provider', 'admin'],
        default: 'traveler'
    },
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: '',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isBlock: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    averageRating: {
        type: Number,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    businessName: {
        type: String,
        trim: true
    },
    businessEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    location: {
        country: { type: String, default: '' },
        city: { type: String, default: '' },
        address: { type: String, default: '' }
    },
    serviceArea: {
        type: [String],
        default: []
    },
    vehicleTypes: {
        type: [String],
        default: ['sedan']
    },
    pricePerKm: {
        type: Number,
        default: 0
    },
    basePrice: {
        type: Number,
        default: 0
    },
    operatingHours: {
        open: { type: String, default: '00:00' },
        close: { type: String, default: '23:59' }
    },
    availability: {
        type: Boolean,
        default: true
    },
    agencyName: {
        type: String,
        trim: true
    },
    specialties: {
        type: [String],
        default: ['general tour']
    },
    website: {
        type: String,
        trim: true
    },
    logo: {
        type: String,
        default: ''
    },
    coverImage: {
        type: String,
        default: ''
    },
    priceRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 }
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;