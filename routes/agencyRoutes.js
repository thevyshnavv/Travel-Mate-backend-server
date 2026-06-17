import express from 'express';
import {
  createAgency,
  getAllAgencies,
  getAgencyById,
  updateAgency,
  deleteAgency,
  getMyAgency
} from '../controllers/agencyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllAgencies);
router.get('/:id', getAgencyById);

// Protected routes (agency only)
router.post('/', protect, authorize('agency'), createAgency);
router.put('/:id', protect, authorize('agency'), updateAgency);
router.delete('/:id', protect, authorize('agency'), deleteAgency);
router.get('/user/my-agency', protect, getMyAgency);

export default router;