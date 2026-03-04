import express from 'express';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Placeholder - will be implemented based on requirements
router.get('/profile', protect, (req, res) => {
  res.json({ success: true, message: 'User routes coming soon' });
});

export default router;
