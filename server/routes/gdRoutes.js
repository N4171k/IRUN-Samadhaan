const express = require('express');
const router = express.Router();
const gdSimulationService = require('../services/gdSimulationService');

const supportedLanguages = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'hi-IN', label: 'Hindi (भारत)' },
  { code: 'mr-IN', label: 'Marathi (मराठी)' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
  { code: 'te-IN', label: 'Telugu (తెలుగు)' },
  { code: 'bn-IN', label: 'Bengali (বাংলা)' },
  { code: 'gu-IN', label: 'Gujarati (ગુજરાતી)' }
];

router.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'OK',
    configured: gdSimulationService.isConfigured(),
    languages: supportedLanguages,
    timestamp: new Date().toISOString()
  });
});

router.get('/languages', (req, res) => {
  return res.status(200).json({
    success: true,
    data: supportedLanguages
  });
});

router.post('/simulate', async (req, res) => {
  try {
    const { story, language } = req.body || {};

    if (!story || typeof story !== 'string' || story.trim().length < 20) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Please provide a valid story with at least 20 characters.'
      });
    }

    if (!gdSimulationService.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'SERVICE_NOT_CONFIGURED',
        message: 'Gemini API key is not configured on the server. Please contact the administrator.'
      });
    }

    const result = await gdSimulationService.simulateDiscussion({
      story,
      language: language || 'en-IN'
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('GD simulation error:', error);
    return res.status(500).json({
      success: false,
      error: 'SIMULATION_ERROR',
      message: error.message || 'Failed to generate AI discussion.'
    });
  }
});

module.exports = router;
