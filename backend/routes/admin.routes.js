import express from 'express';
import { body } from 'express-validator';
import {
  getPendingApprovals,
  approveUser,
  rejectUser,
  getAllUsers,
  getDashboardStats,
  deactivateUser,
  activateUser
} from '../controllers/admin.controller.js';
import { adminOnly } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

// All routes are admin-only
router.use(adminOnly);

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Get all users with filters
router.get('/users', getAllUsers);

// Get pending approvals
router.get('/pending-approvals', getPendingApprovals);

// Approve user
router.put('/approve/:userId', approveUser);

// Reject user
router.put('/reject/:userId', [
  body('reason').optional().isString().withMessage('Reason must be a string'),
  validate
], rejectUser);

// Deactivate user
router.put('/deactivate/:userId', deactivateUser);

// Activate user
router.put('/activate/:userId', activateUser);

export default router;
