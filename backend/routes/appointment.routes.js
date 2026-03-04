import express from 'express';
import { body } from 'express-validator';
import {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  completeAppointment,
  cancelAppointment,
  getAvailableTimeSlots
} from '../controllers/appointment.controller.js';
import { protect, patientOnly, doctorOnly } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

// Patient routes
router.post('/', patientOnly, [
  body('doctorId').notEmpty().withMessage('Doctor ID is required'),
  body('appointmentDate').notEmpty().withMessage('Appointment date is required'),
  body('timeSlot').notEmpty().withMessage('Time slot is required'),
  body('reasonForVisit').notEmpty().withMessage('Reason for visit is required'),
  validate
], createAppointment);

router.get('/my-appointments', patientOnly, getMyAppointments);

// Doctor routes
router.get('/doctor-appointments', doctorOnly, getDoctorAppointments);

// Public route to get available time slots
router.get('/available-slots', getAvailableTimeSlots);

router.put('/:id/status', doctorOnly, [
  body('status').isIn(['confirmed', 'completed', 'no-show']).withMessage('Invalid status'),
  validate
], updateAppointmentStatus);

router.put('/:id/complete', doctorOnly, [
  body('diagnosis').notEmpty().withMessage('Diagnosis is required'),
  validate
], completeAppointment);

// Shared routes
router.get('/:id', protect, getAppointmentById);
router.put('/:id/cancel', protect, cancelAppointment);

export default router;
