import Agency from '../models/Agency.js';

// @route  POST /api/v1/agencies
// @access Private (agency role only)
export const createAgency = async (req, res) => {
  try {
    const { agencyName, description, specialties, location, phone, website, email, priceRange } = req.body;

    // Check if user already has an agency
    const existingAgency = await Agency.findOne({ userId: req.user.id });
    if (existingAgency) {
      return res.status(400).json({ success: false, message: 'You already have an agency listing' });
    }

    const agency = await Agency.create({
      userId: req.user.id,
      agencyName,
      description,
      specialties,
      location,
      phone,
      website,
      email,
      priceRange
    });

    res.status(201).json({
      success: true,
      message: 'Agency created successfully',
      agency
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/v1/agencies
// @access Public
export const getAllAgencies = async (req, res) => {
  try {
    const { country, city, minPrice, maxPrice, specialty, rating, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = { isVerified: true };
    
    if (country) filter['location.country'] = { $regex: country, $options: 'i' };
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (specialty) filter.specialties = specialty;
    if (minPrice || maxPrice) {
      filter['priceRange.min'] = {};
      if (minPrice) filter['priceRange.min'].$gte = Number(minPrice);
      if (maxPrice) filter['priceRange.max'] = { $lte: Number(maxPrice) };
    }
    if (rating) filter.rating = { $gte: Number(rating) };

    const skip = (page - 1) * limit;

    const agencies = await Agency.find(filter)
      .populate('userId', 'name email avatar')
      .skip(skip)
      .limit(Number(limit))
      .sort({ rating: -1 });

    const total = await Agency.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: agencies.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      agencies
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/v1/agencies/:id
// @access Public
export const getAgencyById = async (req, res) => {
  try {
    const agency = await Agency.findById(req.params.id)
      .populate('userId', 'name email avatar');

    if (!agency) {
      return res.status(404).json({ success: false, message: 'Agency not found' });
    }

    res.status(200).json({ success: true, agency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/v1/agencies/:id
// @access Private (owner only)
export const updateAgency = async (req, res) => {
  try {
    let agency = await Agency.findById(req.params.id);

    if (!agency) {
      return res.status(404).json({ success: false, message: 'Agency not found' });
    }

    // Check if user is the owner
    if (agency.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this agency' });
    }

    agency = await Agency.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, message: 'Agency updated', agency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/v1/agencies/:id
// @access Private (owner only)
export const deleteAgency = async (req, res) => {
  try {
    const agency = await Agency.findById(req.params.id);

    if (!agency) {
      return res.status(404).json({ success: false, message: 'Agency not found' });
    }

    // Check if user is the owner
    if (agency.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this agency' });
    }

    await Agency.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Agency deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/v1/agencies/user/my-agency
// @access Private
export const getMyAgency = async (req, res) => {
  try {
    const agency = await Agency.findOne({ userId: req.user.id });

    if (!agency) {
      return res.status(404).json({ success: false, message: 'You have no agency listing' });
    }

    res.status(200).json({ success: true, agency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};