const express = require('express');
const router = express.Router();
const WATService = require('../services/watService');

// Initialize WAT service
const watService = new WATService();

/**
 * GET /api/wat/words
 * Get randomized words for the test
 */
router.get('/words', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 60;
    const words = watService.getTestWords(count);
    
    res.json({
      success: true,
      words,
      count: words.length,
      message: 'Words retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching words:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch words',
      error: error.message
    });
  }
});

/**
 * POST /api/wat/submit
 * Submit test responses for analysis
 */
router.post('/submit', async (req, res) => {
  try {
    const { userId, responses, totalTimeUsed } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({
        success: false,
        message: 'Responses array is required'
      });
    }

    // Analyze the test
    const analysis = watService.analyzeTest(responses, totalTimeUsed || 0);
    
    // Save results (in a real app, this would save to database)
    const saveResult = await watService.saveResults(userId, {
      ...analysis,
      submittedAt: new Date().toISOString(),
      totalTimeUsed
    });

    res.json({
      success: true,
      message: 'Test analyzed successfully',
      score: analysis.overallScore,
      completedWords: analysis.totalResponses,
      totalWords: analysis.totalWords,
      completionRate: analysis.completionRate,
      timeEfficiency: analysis.timeEfficiency,
      feedback: analysis.feedback,
      strengths: analysis.strengths,
      areasForImprovement: analysis.areasForImprovement,
      detailedAnalysis: analysis.detailedAnalysis,
      patterns: analysis.patterns,
      resultId: saveResult.resultId
    });
  } catch (error) {
    console.error('Error submitting WAT test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze test',
      error: error.message
    });
  }
});

/**
 * POST /api/wat/analyze-response
 * Analyze a single response (for real-time feedback)
 */
router.post('/analyze-response', async (req, res) => {
  try {
    const { word, response } = req.body;

    if (!word || !response) {
      return res.status(400).json({
        success: false,
        message: 'Word and response are required'
      });
    }

    const analysis = watService.analyzeResponse(word, response);

    res.json({
      success: true,
      analysis,
      message: 'Response analyzed successfully'
    });
  } catch (error) {
    console.error('Error analyzing response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze response',
      error: error.message
    });
  }
});

/**
 * GET /api/wat/history/:userId
 * Get user's test history
 */
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const history = await watService.getUserHistory(userId);

    res.json({
      success: true,
      history: history.tests,
      message: 'History retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history',
      error: error.message
    });
  }
});

/**
 * GET /api/wat/stats/:userId
 * Get user's performance statistics
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // In a real implementation, this would calculate stats from database
    const stats = {
      totalTests: 0,
      averageScore: 0,
      bestScore: 0,
      averageCompletionRate: 0,
      improvementTrend: 'stable', // 'improving', 'declining', 'stable'
      strongestAreas: [],
      weakestAreas: [],
      recommendedFocus: []
    };

    res.json({
      success: true,
      stats,
      message: 'Statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

/**
 * GET /api/wat/tips
 * Get preparation tips and strategies
 */
router.get('/tips', (req, res) => {
  try {
    const tips = {
      preparation: [
        'Practice daily with random words for 10-15 minutes',
        'Focus on positive, action-oriented responses',
        'Avoid negative words like "no", "never", "can\'t"',
        'Keep responses natural and authentic',
        'Think of practical, real-life applications'
      ],
      duringTest: [
        'Write the first thought that comes to mind',
        'Don\'t overthink or try to be too clever',
        'Keep responses concise but complete',
        'Maintain a positive mindset throughout',
        'If stuck, move to the next word quickly'
      ],
      examples: {
        good: [
          { word: 'Failure', response: 'Failure teaches the way to success.' },
          { word: 'Leader', response: 'Leader inspires others by example.' },
          { word: 'Challenge', response: 'Challenge brings out the best in people.' }
        ],
        avoid: [
          { word: 'Failure', response: 'Failure is bad.', reason: 'Too negative and simple' },
          { word: 'Leader', response: 'Leader gives orders.', reason: 'Authoritarian view' },
          { word: 'Problem', response: 'Problem should be avoided.', reason: 'Avoidance mindset' }
        ]
      },
      mindset: [
        'Stay calm and composed',
        'Trust your instincts',
        'Focus on solutions, not problems',
        'Think like a leader',
        'Be authentic and honest'
      ]
    };

    res.json({
      success: true,
      tips,
      message: 'Tips retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching tips:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tips',
      error: error.message
    });
  }
});

/**
 * GET /api/wat/health
 * Health check endpoint for WAT service
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'WAT Service',
    status: 'running',
    timestamp: new Date().toISOString(),
    wordBankSize: watService.wordBank.length
  });
});

module.exports = router;