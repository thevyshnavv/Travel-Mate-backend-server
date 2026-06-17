import express from 'express';
import {
  createTaxiProvider,
  getAllTaxiProviders,
  getTaxiProviderById,
  updateTaxiProvider,
  deleteTaxiProvider,
  getMyTaxiProvider,
  addVehicle,
  addDriver
} from '../controllers/taxiController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllTaxiProviders);
router.get('/:id', getTaxiProviderById);

// Protected routes (taxi_provider only)
router.post('/', protect, authorize('taxi_provider'), createTaxiProvider);
router.put('/:id', protect, authorize('taxi_provider'), updateTaxiProvider);
router.delete('/:id', protect, authorize('taxi_provider'), deleteTaxiProvider);
router.get('/user/my-taxi', protect, getMyTaxiProvider);
router.post('/:id/add-vehicle', protect, authorize('taxi_provider'), addVehicle);
router.post('/:id/add-driver', protect, authorize('taxi_provider'), addDriver);

export default router;