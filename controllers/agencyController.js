import User from '../models/User.js';
import TravelPackage from '../models/TravelPackage.js';
import Guide from '../models/Guide.js';

// Helper function to build the agency response object expected by the UI
const buildAgencyResponse = (user) => {
  return {
    _id: user._id,
    userId: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || ''
    },
    agencyName: user.agencyName || user.businessName || `${user.name} Travel Agency`,
    description: user.description || user.bio || '',
    location: user.location || { country: '', city: '', address: '' },
    specialties: user.specialties || ['general tour'],
    phone: user.phone || '',
    email: user.businessEmail || user.email || '',
    website: user.website || '',
    logo: user.logo || '',
    coverImage: user.coverImage || '',
    priceRange: user.priceRange || { min: 0, max: 0 },
    rating: user.averageRating || 0,
    reviewCount: user.totalReviews || 0,
    isVerified: user.isVerified || false,
    isFeatured: user.isFeatured || false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

// @route  POST /api/v1/agencies
// @access Private (agency role only)
export const createAgency = async (req, res) => {
  try {
    const { agencyName, description, specialties, location, phone, website, email, priceRange } = req.body;

    const user = await User.findByIdAndUpdate(req.user.id, {
      agencyName,
      description,
      specialties: specialties ? (Array.isArray(specialties) ? specialties : specialties.split(',').map(s => s.trim())) : ['general tour'],
      location,
      phone,
      website,
      businessEmail: email,
      priceRange,
      isVerified: true
    }, { new: true });

    const agency = buildAgencyResponse(user);

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

    const filter = { role: 'agency', isActive: true };
    
    if (country) filter['location.country'] = { $regex: country, $options: 'i' };
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (specialty) filter.specialties = specialty;
    if (minPrice || maxPrice) {
      if (minPrice) filter['priceRange.min'] = { $gte: Number(minPrice) };
      if (maxPrice) filter['priceRange.max'] = { $lte: Number(maxPrice) };
    }
    if (rating) filter.averageRating = { $gte: Number(rating) };

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ averageRating: -1 });

    const total = await User.countDocuments(filter);

    const agencies = users.map(u => buildAgencyResponse(u));

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
    const user = await User.findOne({ _id: req.params.id, role: 'agency' });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Agency not found' });
    }

    const agency = buildAgencyResponse(user);

    res.status(200).json({ success: true, agency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/v1/agencies/:id
// @access Private (owner only)
export const updateAgency = async (req, res) => {
  try {
    if (req.params.id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this agency' });
    }

    const updateFields = { ...req.body };
    
    // Handle file uploads (logo and coverImage)
    if (req.files) {
      if (req.files.logo && req.files.logo.length > 0) {
        updateFields.logo = `/uploads/${req.files.logo[0].filename}`;
      }
      if (req.files.coverImage && req.files.coverImage.length > 0) {
        updateFields.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
      }
    }

    if (updateFields.email) {
      updateFields.businessEmail = updateFields.email;
      delete updateFields.email;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Agency not found' });
    }

    const agency = buildAgencyResponse(user);

    res.status(200).json({ success: true, message: 'Agency updated', agency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/v1/agencies/:id
// @access Private (owner only)
export const deleteAgency = async (req, res) => {
  try {
    if (req.params.id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this agency' });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $unset: {
        agencyName: 1,
        specialties: 1,
        website: 1,
        logo: 1,
        coverImage: 1,
        priceRange: 1,
        isFeatured: 1,
        location: 1
      }
    });

    res.status(200).json({ success: true, message: 'Agency deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/v1/agencies/user/my-agency
// @access Private
export const getMyAgency = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id, role: 'agency' });

    if (!user) {
      return res.status(404).json({ success: false, message: 'You have no agency listing' });
    }

    const agency = buildAgencyResponse(user);

    res.status(200).json({ success: true, agency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/v1/agencies/packages
// @access Private (agency role)
export const createPackage = async (req, res) => {
  try {
    const { packageName, description, destination_country, destination_city, duration_days, duration_nights, pricePerPerson, maxGroupSize, minGroupSize, included } = req.body;

    let images = [];
    if (req.files) {
      images = req.files.map(f => `/uploads/${f.filename}`);
    }

    const pkg = await TravelPackage.create({
      agencyId: req.user.id,
      packageName,
      description,
      destination_country,
      destination_city,
      duration_days: Number(duration_days),
      duration_nights: Number(duration_nights),
      pricePerPerson: Number(pricePerPerson),
      maxGroupSize: Number(maxGroupSize || 10),
      minGroupSize: Number(minGroupSize || 1),
      included: included ? (Array.isArray(included) ? included : included.split(',').map(s => s.trim())) : [],
      images
    });

    res.status(201).json({ success: true, message: 'Travel package created successfully', package: pkg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/v1/agencies/:id/packages
// @access Public
export const getAgencyPackages = async (req, res) => {
  try {
    const packages = await TravelPackage.find({ agencyId: req.params.id });
    res.status(200).json({ success: true, count: packages.length, packages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/v1/agencies/packages/my-packages
// @access Private (agency role)
export const getMyPackages = async (req, res) => {
  try {
    const packages = await TravelPackage.find({ agencyId: req.user.id });
    res.status(200).json({ success: true, count: packages.length, packages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/v1/agencies/packages/:id
// @access Private (agency role)
export const updatePackage = async (req, res) => {
  try {
    const pkg = await TravelPackage.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    if (pkg.agencyId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { packageName, description, destination_country, destination_city, duration_days, duration_nights, pricePerPerson, maxGroupSize, minGroupSize, included } = req.body;

    let images = pkg.images || [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => `/uploads/${f.filename}`);
      images = [...images, ...newImages];
    }

    const updatedData = {
      packageName: packageName || pkg.packageName,
      description: description || pkg.description,
      destination_country: destination_country || pkg.destination_country,
      destination_city: destination_city || pkg.destination_city,
      duration_days: duration_days ? Number(duration_days) : pkg.duration_days,
      duration_nights: duration_nights ? Number(duration_nights) : pkg.duration_nights,
      pricePerPerson: pricePerPerson ? Number(pricePerPerson) : pkg.pricePerPerson,
      maxGroupSize: maxGroupSize ? Number(maxGroupSize) : pkg.maxGroupSize,
      minGroupSize: minGroupSize ? Number(minGroupSize) : pkg.minGroupSize,
      included: included ? (Array.isArray(included) ? included : included.split(',').map(s => s.trim())) : pkg.included,
      images
    };

    const updatedPkg = await TravelPackage.findByIdAndUpdate(req.params.id, updatedData, { new: true, runValidators: true });

    res.status(200).json({ success: true, message: 'Package updated successfully', package: updatedPkg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/v1/agencies/packages/:id
// @access Private (agency role)
export const deletePackage = async (req, res) => {
  try {
    const pkg = await TravelPackage.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    if (pkg.agencyId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await TravelPackage.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Package deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/v1/agencies/packages/all
// @access Public
export const getAllPackages = async (req, res) => {
  try {
    const { place, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (place) {
      filter.$or = [
        { destination_city: { $regex: place, $options: 'i' } },
        { destination_country: { $regex: place, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const packages = await TravelPackage.find(filter)
      .populate('agencyId', 'agencyName logo location')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await TravelPackage.countDocuments(filter);

    res.status(200).json({ 
      success: true, 
      count: packages.length, 
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      packages 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/v1/agencies/packages/detail/:id
// @access Public
export const getPackageById = async (req, res) => {
  try {
    const pkg = await TravelPackage.findById(req.params.id);
    
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const user = await User.findOne({ _id: pkg.agencyId, role: 'agency' });
    const agency = user ? buildAgencyResponse(user) : null;

    res.status(200).json({ 
      success: true, 
      package: pkg,
      agency
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/v1/agencies/guides
// @access Private (agency role only)
export const createGuide = async (req, res) => {
  try {
    const { name, email, phone, status } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const guide = await Guide.create({
      agencyId: req.user.id,
      name,
      email,
      phone,
      status: status || 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'Guide registered successfully',
      guide
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/v1/agencies/guides
// @access Private (agency role only)
export const getMyGuides = async (req, res) => {
  try {
    const guides = await Guide.find({ agencyId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      guides
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/v1/agencies/guides/:id
// @access Private (agency role only)
export const updateGuide = async (req, res) => {
  try {
    const { name, email, phone, status } = req.body;

    let guide = await Guide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    if (guide.agencyId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (name) guide.name = name;
    if (email) guide.email = email;
    if (phone) guide.phone = phone;
    if (status) guide.status = status;

    await guide.save();

    res.status(200).json({
      success: true,
      message: 'Guide updated successfully',
      guide
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/v1/agencies/guides/:id
// @access Private (agency role only)
export const deleteGuide = async (req, res) => {
  try {
    let guide = await Guide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    if (guide.agencyId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Guide.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Guide deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};