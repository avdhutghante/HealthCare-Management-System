import express from 'express';
import { body } from 'express-validator';
import {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  addDoctorReview
} from '../controllers/doctor.controller.js';
import { protect, doctorOnly, patientOnly } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);

// Protected routes
router.put('/profile', doctorOnly, updateDoctorProfile);

router.post('/:id/review', patientOnly, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString(),
  validate
], addDoctorReview);

export default router;
