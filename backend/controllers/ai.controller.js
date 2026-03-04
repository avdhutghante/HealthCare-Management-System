import aiService from '../services/ai.service.js';

/**
 * Chat with AI Medical Assistant
 */
export const chatWithAI = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const result = await aiService.chat(message, conversationHistory || []);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat request',
      error: error.message,
    });
  }
};

/**
 * Analyze symptoms
 */
export const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms, age, gender, existingConditions } = req.body;

    if (!symptoms) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms are required',
      });
    }

    const result = await aiService.analyzeSymptoms(
      symptoms,
      age || 'Not specified',
      gender || 'Not specified',
      existingConditions || []
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Symptom Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze symptoms',
      error: error.message,
    });
  }
};

/**
 * Get doctor recommendation based on symptoms
 */
export const recommendDoctor = async (req, res) => {
  try {
    const { symptoms, medicalHistory } = req.body;

    if (!symptoms) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms are required',
      });
    }

    const result = await aiService.recommendDoctor(symptoms, medicalHistory);

    res.status(200).json(result);
  } catch (error) {
    console.error('Doctor Recommendation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor recommendation',
      error: error.message,
    });
  }
};

/**
 * Explain medication
 */
export const explainMedication = async (req, res) => {
  try {
    const { medicationName } = req.body;

    if (!medicationName) {
      return res.status(400).json({
        success: false,
        message: 'Medication name is required',
      });
    }

    const result = await aiService.explainMedication(medicationName);

    res.status(200).json(result);
  } catch (error) {
    console.error('Medication Explanation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to explain medication',
      error: error.message,
    });
  }
};

/**
 * Assess health risk
 */
export const assessHealthRisk = async (req, res) => {
  try {
    const patientData = req.body;

    if (!patientData.age || !patientData.gender) {
      return res.status(400).json({
        success: false,
        message: 'Age and gender are required',
      });
    }

    const result = await aiService.assessHealthRisk(patientData);

    res.status(200).json(result);
  } catch (error) {
    console.error('Health Risk Assessment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assess health risk',
      error: error.message,
    });
  }
};

/**
 * Get AI health tips based on user profile
 */
export const getHealthTips = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // You can fetch user data from database and provide personalized tips
    const tips = await aiService.chat(
      'Provide 5 general health tips for maintaining good health and wellness.',
      []
    );

    res.status(200).json({
      success: true,
      data: tips,
    });
  } catch (error) {
    console.error('Health Tips Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health tips',
      error: error.message,
    });
  }
};
