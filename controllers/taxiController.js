import TaxiProvider from '../models/TaxiProvider.js';

// @route  POST /api/v1/taxi
// @access Private (taxi_provider role only)
export const createTaxiProvider = async (req, res) => {
  try {
    const { businessName, description, phone, email, location, serviceArea, vehicleTypes, pricePerKm, basePrice, operatingHours } = req.body;

    // Check if user already has a taxi provider listing
    const existingTaxi = await TaxiProvider.findOne({ userId: req.user.id });
    if (existingTaxi) {
      return res.status(400).json({ success: false, message: 'You already have a taxi provider listing' });
    }

    const taxiProvider = await TaxiProvider.create({
      userId: req.user.id,
      businessName,
      description,
      phone,
      email,
      location,
      serviceArea,
      vehicleTypes,
      pricePerKm,
      basePrice,
      operatingHours
    });

    res.status(201).json({
      success: true,
      message: 'Taxi provider created successfully',
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

    const filter = { isVerified: true, availability: true };

    if (country) filter['location.country'] = { $regex: country, $options: 'i' };
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (vehicleType) filter.vehicleTypes = vehicleType;
    if (serviceArea) filter.serviceArea = serviceArea;
    if (rating) filter.rating = { $gte: Number(rating) };

    const skip = (page - 1) * limit;

    const taxiProviders = await TaxiProvider.find(filter)
      .populate('userId', 'name email avatar')
      .skip(skip)
      .limit(Number(limit))
      .sort({ rating: -1 });

    const total = await TaxiProvider.countDocuments(filter);

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
    const taxiProvider = await TaxiProvider.findById(req.params.id)
      .populate('userId', 'name email avatar');

    if (!taxiProvider) {
      return res.status(404).json({ success: false, message: 'Taxi provider not found' });
    }

    res.status(200).json({ success: true, taxiProvider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/v1/taxi/:id
// @access Private (owner only)
export const updateTaxiProvider = async (req, res) => {
  try {
    let taxiProvider = await TaxiProvider.findById(req.params.id);

    if (!taxiProvider) {
      return res.status(404).json({ success: false, message: 'Taxi provider not found' });
    }

    if (taxiProvider.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this listing' });
    }

    taxiProvider = await TaxiProvider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, message: 'Taxi provider updated', taxiProvider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/v1/taxi/:id
// @access Private (owner only)
export const deleteTaxiProvider = async (req, res) => {
  try {
    const taxiProvider = await TaxiProvider.findById(req.params.id);

    if (!taxiProvider) {
      return res.status(404).json({ success: false, message: 'Taxi provider not found' });
    }

    if (taxiProvider.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await TaxiProvider.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Taxi provider deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/v1/taxi/user/my-taxi
// @access Private
export const getMyTaxiProvider = async (req, res) => {
  try {
    const taxiProvider = await TaxiProvider.findOne({ userId: req.user.id });

    if (!taxiProvider) {
      return res.status(404).json({ success: false, message: 'You have no taxi provider listing' });
    }

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

    const taxiProvider = await TaxiProvider.findById(req.params.id);

    if (!taxiProvider) {
      return res.status(404).json({ success: false, message: 'Taxi provider not found' });
    }

    if (taxiProvider.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    taxiProvider.vehicles.push({ model, registrationNumber, capacity, type, image });
    await taxiProvider.save();

    res.status(201).json({ success: true, message: 'Vehicle added', taxiProvider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/v1/taxi/:id/add-driver
// @access Private (owner only)
export const addDriver = async (req, res) => {
  try {
    const { name, phone, licenseNumber, experience, image } = req.body;

    const taxiProvider = await TaxiProvider.findById(req.params.id);

    if (!taxiProvider) {
      return res.status(404).json({ success: false, message: 'Taxi provider not found' });
    }

    if (taxiProvider.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    taxiProvider.drivers.push({ name, phone, licenseNumber, experience, image });
    await taxiProvider.save();

    res.status(201).json({ success: true, message: 'Driver added', taxiProvider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};