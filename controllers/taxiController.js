import User from '../models/User.js';
import TaxiDriver from '../models/TaxiDriver.js';
import Fleet from '../models/Fleet.js';

// Helper function to build the taxi provider object structure expected by the UI
const buildTaxiProviderResponse = async (user) => {
  const vehicles = await Fleet.find({ providerId: user._id });
  const drivers = await TaxiDriver.find({ providerId: user._id });
  
  return {
    _id: user._id,
    userId: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || ''
    },
    businessName: user.businessName || `${user.name} Taxi Service`,
    description: user.description || user.bio || '',
    phone: user.phone || '',
    email: user.businessEmail || user.email || '',
    location: user.location || { country: '', city: '', address: '' },
    serviceArea: user.serviceArea || [],
    vehicleTypes: user.vehicleTypes || ['sedan'],
    pricePerKm: user.pricePerKm || 0,
    basePrice: user.basePrice || 0,
    operatingHours: user.operatingHours || { open: '00:00', close: '23:59' },
    availability: user.availability !== undefined ? user.availability : true,
    rating: user.averageRating || 0,
    reviewCount: user.totalReviews || 0,
    isVerified: user.isVerified || false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    vehicles,
    drivers
  };
};

// @route  POST /api/v1/taxi
// @access Private (taxi_provider role only)
export const createTaxiProvider = async (req, res) => {
  try {
    const { businessName, description, phone, email, location, serviceArea, vehicleTypes, pricePerKm, basePrice, operatingHours } = req.body;

    const user = await User.findByIdAndUpdate(req.user.id, {
      businessName,
      description,
      phone,
      businessEmail: email,
      location,
      serviceArea,
      vehicleTypes,
      pricePerKm,
      basePrice,
      operatingHours,
      isVerified: true
    }, { new: true });

    const taxiProvider = await buildTaxiProviderResponse(user);

    res.status(201).json({
      success: true,
      message: 'Taxi provider listing created successfully',
      taxiProvider
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/v1/taxi
// @access Public
export const getAllTaxiProviders = async (req, res) => {
  try {
    const { country, city, vehicleType, serviceArea, rating, page = 1, limit = 10 } = req.query;

    const filter = { role: 'taxi_provider', isActive: true };

    if (country) filter['location.country'] = { $regex: country, $options: 'i' };
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (vehicleType) filter.vehicleTypes = vehicleType;
    if (serviceArea) filter.serviceArea = serviceArea;
    if (rating) filter.averageRating = { $gte: Number(rating) };

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ averageRating: -1 });

    const total = await User.countDocuments(filter);

    const taxiProviders = [];
    for (const u of users) {
      const formatted = await buildTaxiProviderResponse(u);
      taxiProviders.push(formatted);
    }

    res.status(200).json({
      success: true,
      count: taxiProviders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      taxiProviders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/v1/taxi/:id
// @access Public
export const getTaxiProviderById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'taxi_provider' });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Taxi provider not found' });
    }

    const taxiProvider = await buildTaxiProviderResponse(user);

    res.status(200).json({ success: true, taxiProvider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/v1/taxi/:id
// @access Private (owner only)
export const updateTaxiProvider = async (req, res) => {
  try {
    if (req.params.id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this listing' });
    }

    const updateData = { ...req.body };
    if (updateData.email) {
      updateData.businessEmail = updateData.email;
      delete updateData.email;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Taxi provider not found' });
    }

    const taxiProvider = await buildTaxiProviderResponse(user);

    res.status(200).json({ success: true, message: 'Taxi provider updated', taxiProvider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/v1/taxi/:id
// @access Private (owner only)
export const deleteTaxiProvider = async (req, res) => {
  try {
    if (req.params.id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $unset: {
        businessName: 1,
        businessEmail: 1,
        location: 1,
        serviceArea: 1,
        vehicleTypes: 1,
        pricePerKm: 1,
        basePrice: 1,
        operatingHours: 1
      }
    });

    await Fleet.deleteMany({ providerId: req.user.id });
    await TaxiDriver.deleteMany({ providerId: req.user.id });

    res.status(200).json({ success: true, message: 'Taxi provider deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/v1/taxi/user/my-taxi
// @access Private
export const getMyTaxiProvider = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id, role: 'taxi_provider' });

    if (!user) {
      return res.status(404).json({ success: false, message: 'You have no taxi provider listing' });
    }

    const taxiProvider = await buildTaxiProviderResponse(user);

    res.status(200).json({ success: true, taxiProvider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/v1/taxi/:id/add-vehicle
// @access Private (owner only)
export const addVehicle = async (req, res) => {
  try {
    const { model, registrationNumber, capacity, type, image } = req.body;

    if (req.params.id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Fleet.create({
      providerId: req.user.id,
      model,
      registrationNumber,
      capacity,
      type,
      image
    });

    const user = await User.findById(req.user.id);
    const taxiProvider = await buildTaxiProviderResponse(user);

    res.status(201).json({ success: true, message: 'Vehicle added', taxiProvider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/v1/taxi/:id/add-driver
// @access Private (owner only)
export const addDriver = async (req, res) => {
  try {
    const { name, email, phone, licenseNumber, experience, image } = req.body;

    if (req.params.id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await TaxiDriver.create({
      providerId: req.user.id,
      name,
      email,
      phone,
      licenseNumber,
      experience,
      image
    });

    const user = await User.findById(req.user.id);
    const taxiProvider = await buildTaxiProviderResponse(user);

    res.status(201).json({ success: true, message: 'Driver added', taxiProvider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};