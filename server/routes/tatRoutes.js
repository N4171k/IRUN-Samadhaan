const express = require('express');
const router = express.Router();
const tatService = require('../services/tatService');

// Rate limiting middleware (simple implementation)
const requestCounts = new Map();
const RATE_LIMIT = process.env.RATE_LIMIT || 60; // requests per minute

const rateLimiter = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window
  
  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, []);
  }
  
  const requests = requestCounts.get(clientIP);
  // Remove old requests outside the window
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: `Too many requests. Limit: ${RATE_LIMIT} requests per minute.`,
      retryAfter: 60
    });
  }
  
  recentRequests.push(now);
  requestCounts.set(clientIP, recentRequests);
  next();
};

/**
 * GET /api/tat/topic
 * Generate a new TAT topic
 */
router.get('/topic', rateLimiter, async (req, res) => {
  try {
    // Check if service is configured
    if (!tatService.isConfigured()) {
      console.warn('TAT Service not configured, using fallback topic');
      
      // Instead of returning an error, let's return a fallback topic
      const fallbackTopics = [
        "An elderly woman feeds pigeons in a busy city square",
        "A child discovers an old photograph in the attic",
        "Two colleagues disagree during a late-night meeting",
        "A family gathers around a hospital bed",
        "A musician performs alone on an empty subway platform"
      ];
      
      const randomTopic = fallbackTopics[Math.floor(Math.random() * fallbackTopics.length)];
      
      return res.status(206).json({
        success: true,
        data: {
          topic: randomTopic,
          timestamp: new Date().toISOString(),
          source: 'fallback',
          fallback: true
        },
        warning: 'Using fallback topic because Google Gemini API is not configured',
        fallback: true
      });
    }

    console.log('Generating new TAT topic...');
    const result = await tatService.generateTATTopic();
    
    if (result.success) {
      console.log('TAT topic generated successfully:', result.data.topic);
      res.status(200).json({
        success: true,
        data: result.data,
        message: 'TAT topic generated successfully'
      });
    } else {
      console.log('TAT topic generation failed, using fallback:', result.data.topic);
      res.status(206).json({
        success: true,
        data: result.data,
        warning: result.message,
        fallback: true
      });
    }
  } catch (error) {
    console.error('Error in /topic route:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to generate TAT topic',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/tat/feedback
 * Generate feedback for a user's TAT story
 */
router.post('/feedback', rateLimiter, async (req, res) => {
  try {
    const { story, topic } = req.body;
    
    // Validate input
    if (!story || typeof story !== 'string') {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Story is required and must be a string'
      });
    }
    
    if (story.trim().length === 0) {
      return res.status(400).json({
        error: 'EMPTY_STORY',
        message: 'Story cannot be empty'
      });
    }
    
    if (story.length > 5000) {
      return res.status(400).json({
        error: 'STORY_TOO_LONG',
        message: 'Story must be less than 5000 characters'
      });
    }

    // Check if service is configured
    if (!tatService.isConfigured()) {
      return res.status(503).json({
        error: 'SERVICE_NOT_CONFIGURED',
        message: 'Google Gemini API key is not configured. Please check server configuration.',
        fallback: true
      });
    }

    console.log('Generating feedback for story...');
    const result = await tatService.generateFeedback(story, topic || 'Unknown topic');
    
    if (result.success) {
      console.log('Feedback generated successfully');
      res.status(200).json({
        success: true,
        data: result.data,
        message: 'Feedback generated successfully'
      });
    } else {
      console.log('Feedback generation failed, using fallback');
      res.status(206).json({
        success: true,
        data: result.data,
        warning: result.message,
        fallback: true
      });
    }
  } catch (error) {
    console.error('Error in /feedback route:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to generate feedback',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/tat/topic-with-image
 * Generate a new TAT topic with corresponding image
 */
router.get('/topic-with-image', rateLimiter, async (req, res) => {
  try {
    // Check if service is configured
    if (!tatService.isConfigured()) {
      return res.status(503).json({
        error: 'SERVICE_NOT_CONFIGURED',
        message: 'Google Gemini API key is not configured. Please check server configuration.',
        fallback: true
      });
    }

    console.log('Generating new TAT topic with image...');
    const result = await tatService.generateTATTopicWithImage();
    
    if (result.success) {
      console.log('TAT topic with image generated successfully');
      res.status(200).json({
        success: true,
        data: result.data,
        message: 'TAT topic with image generated successfully'
      });
    } else {
      console.log('TAT topic with image generation failed, using fallback');
      res.status(206).json({
        success: true,
        data: result.data,
        warning: result.message,
        fallback: true
      });
    }
  } catch (error) {
    console.error('Error in /topic-with-image route:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to generate TAT topic with image',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/tat/image
 * Generate an image for a TAT topic
 */
router.post('/image', rateLimiter, async (req, res) => {
  try {
    const { topic } = req.body;
    
    // Validate input
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Topic is required and must be a string'
      });
    }
    
    if (topic.trim().length === 0) {
      return res.status(400).json({
        error: 'EMPTY_TOPIC',
        message: 'Topic cannot be empty'
      });
    }
    
    if (topic.length > 200) {
      return res.status(400).json({
        error: 'TOPIC_TOO_LONG',
        message: 'Topic must be less than 200 characters'
      });
    }

    // Check if service is configured
    if (!tatService.isConfigured()) {
      return res.status(503).json({
        error: 'SERVICE_NOT_CONFIGURED',
        message: 'Google Gemini API key is not configured. Please check server configuration.',
        fallback: true
      });
    }

    console.log('Generating image for topic:', topic);
    const result = await tatService.generateTATImage(topic);
    
    if (result.success) {
      console.log('Image generated successfully');
      res.status(200).json({
        success: true,
        data: result.data,
        message: 'Image generated successfully'
      });
    } else {
      console.log('Image generation failed, using fallback');
      res.status(206).json({
        success: true,
        data: result.data,
        warning: result.message,
        fallback: true
      });
    }
  } catch (error) {
    console.error('Error in /image route:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to generate image',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/tat/health
 * Check the health of the TAT service
 */
router.get('/health', (req, res) => {
  const isConfigured = tatService.isConfigured();
  
  res.status(200).json({
    status: 'OK',
    service: 'TAT Service',
    configured: isConfigured,
    endpoints: {
      topic: '/api/tat/topic',
      topicWithImage: '/api/tat/topic-with-image',
      feedback: '/api/tat/feedback',
      image: '/api/tat/image'
    },
    rateLimit: `${RATE_LIMIT} requests per minute`,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;