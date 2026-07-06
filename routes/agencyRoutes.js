import express from 'express';
import {
  createAgency,
  getAllAgencies,
  getAgencyById,
  updateAgency,
  deleteAgency,
  getMyAgency,
  createPackage,
  getAgencyPackages,
  getMyPackages,
  deletePackage,
  updatePackage,
  getAllPackages
} from '../controllers/agencyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Packages global routes (put before /:id)
router.get('/packages/all', getAllPackages);

// Public routes
router.get('/', getAllAgencies);
router.get('/:id', getAgencyById);
router.get('/:id/packages', getAgencyPackages);

// Protected routes (agency only)
router.post('/', protect, authorize('agency'), upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), createAgency);
router.put('/:id', protect, authorize('agency'), upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), updateAgency);
router.delete('/:id', protect, authorize('agency'), deleteAgency);
router.get('/user/my-agency', protect, getMyAgency);

// Packages protected routes
router.post('/packages', protect, authorize('agency'), upload.array('images', 5), createPackage);
router.get('/packages/my-packages', protect, authorize('agency'), getMyPackages);
router.put('/packages/:id', protect, authorize('agency'), upload.array('images', 5), updatePackage);
router.delete('/packages/:id', protect, authorize('agency'), deletePackage);

export default router;