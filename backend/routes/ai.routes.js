import express from 'express';
import {
  chatWithAI,
  analyzeSymptoms,
  recommendDoctor,
  explainMedication,
  assessHealthRisk,
  getHealthTips,
} from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Chat with AI Assistant (authentication optional for demo)
router.post('/chat', chatWithAI);

// Symptom analysis (authentication optional for demo)
router.post('/analyze-symptoms', analyzeSymptoms);

// Doctor recommendation (authentication optional for demo)
router.post('/recommend-doctor', recommendDoctor);

// Medication explanation (authentication optional for demo)
router.post('/explain-medication', explainMedication);

// Health risk assessment (authentication optional for demo)
router.post('/assess-health-risk', assessHealthRisk);

// Get health tips (requires authentication)
router.get('/health-tips', protect, getHealthTips);

// Get health tips
router.get('/health-tips', getHealthTips);

export default router;
