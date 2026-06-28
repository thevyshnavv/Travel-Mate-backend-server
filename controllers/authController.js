import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Agency from '../models/Agency.js';
import TaxiProvider from '../models/TaxiProvider.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route  POST /api/v1/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({ name, email, password, role, phone });

    // Auto-create initial profile for agencies or taxi providers
    if (role === 'agency') {
      await Agency.create({
        userId: user._id,
        agencyName: `${user.name} Travel Agency`,
        email: user.email,
        phone: phone || '000-000-0000',
        location: { country: '', city: '', address: '' },
        isVerified: true
      });
    } else if (role === 'taxi_provider') {
      await TaxiProvider.create({
        userId: user._id,
        businessName: `${user.name} Taxi Service`,
        email: user.email,
        phone: phone || '000-000-0000',
        location: { country: '', city: '', address: '' },
        isVerified: true
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/v1/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user exists (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        bio: user.bio || '',
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/v1/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};