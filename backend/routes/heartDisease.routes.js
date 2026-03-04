import express from 'express';
import { predictHeartDisease, getHeartDiseaseInfo } from '../controllers/heartDisease.controller.js';

const router = express.Router();

/**
 * Heart Disease Prediction Routes
 */

// Predict heart disease
router.post('/predict', predictHeartDisease);

// Get heart disease information
router.get('/info', getHeartDiseaseInfo);

export default router;
