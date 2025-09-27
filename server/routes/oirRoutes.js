const express = require('express');
const router = express.Router();
const OIRTestService = require('../services/oirService');

const oirService = new OIRTestService();

// GET /api/oir/generate-test - Generate a new OIR test
router.get('/generate-test', async (req, res) => {
  try {
    const result = await oirService.generateTest();
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in generate-test route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/oir/submit-test - Submit and evaluate OIR test
router.post('/submit-test', (req, res) => {
  try {
    const { test_id, answers, time_taken } = req.body;
    
    // Validate required fields
    if (!test_id || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: test_id and answers'
      });
    }
    
    // Evaluate the test with time taken
    const result = oirService.evaluateTest(test_id, answers, time_taken || 0);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in submit-test route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/oir/get-analytics - Get detailed analytics for test result
router.post('/get-analytics', (req, res) => {
  try {
    const { test_result } = req.body;
    
    if (!test_result) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: test_result'
      });
    }
    
    const result = oirService.getTestAnalytics(test_result);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in get-analytics route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/oir/test-info - Get general information about OIR test
router.get('/test-info', (req, res) => {
  try {
    const testInfo = {
      success: true,
      data: {
        test_name: 'Officer Intelligence Rating (OIR)',
        description: 'A comprehensive test to assess verbal and non-verbal reasoning abilities',
        duration: '30 minutes',
        total_questions: 20,
        question_types: {
          verbal_reasoning: 10,
          non_verbal_reasoning: 10
        },
        scoring: {
          max_score: 100,
          passing_score: 60,
          excellent: '85-100',
          good: '70-84',
          average: '50-69',
          below_average: '35-49',
          poor: '0-34'
        },
        instructions: [
          'Read each question carefully before answering',
          'For verbal questions, select the most appropriate option',
          'For non-verbal questions, identify the pattern and complete the sequence',
          'Manage your time effectively - 1.5 minutes per question on average',
          'Do not spend too much time on any single question',
          'Review your answers if time permits'
        ]
      }
    };
    
    res.status(200).json(testInfo);
  } catch (error) {
    console.error('Error in test-info route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;