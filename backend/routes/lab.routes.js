import express from 'express';
import { body } from 'express-validator';
import {
  getAllLabs,
  getLabById,
  updateLabProfile,
  addLabReview
} from '../controllers/lab.controller.js';
import { protect, labOnly, patientOnly } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllLabs);
router.get('/:id', getLabById);

// Protected routes
router.put('/profile', labOnly, updateLabProfile);

router.post('/:id/review', patientOnly, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString(),
  validate
], addLabReview);

export default router;
