import express from 'express';
import { body } from 'express-validator';
import {
  createLabTest,
  getMyLabTests,
  getLabBookings,
  getLabTestById,
  updateLabTestStatus,
  addTestResults,
  cancelLabTest
} from '../controllers/labTest.controller.js';
import { protect, patientOnly, labOnly } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

// Patient routes
router.post('/', patientOnly, [
  body('labId').notEmpty().withMessage('Lab ID is required'),
  body('testDetails').isArray({ min: 1 }).withMessage('At least one test is required'),
  body('scheduledDate').notEmpty().withMessage('Scheduled date is required'),
  validate
], createLabTest);

router.get('/my-tests', patientOnly, getMyLabTests);

// Lab routes
router.get('/lab-bookings', labOnly, getLabBookings);

router.put('/:id/status', labOnly, [
  body('status').isIn(['sample-collected', 'processing', 'completed']).withMessage('Invalid status'),
  validate
], updateLabTestStatus);

router.put('/:id/results', labOnly, addTestResults);

// Shared routes
router.get('/:id', protect, getLabTestById);
router.put('/:id/cancel', protect, cancelLabTest);

export default router;
