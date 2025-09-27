// Newsletter Routes
const express = require('express');
const { sendWelcomeNewsletter, sendWelcomeBackNewsletter } = require('../services/welcomeNewsletter');

const router = express.Router();

// Send welcome newsletter to a new user
router.post('/welcome', async (req, res) => {
  try {
    const { user } = req.body;
    
    if (!user || !user.email) {
      return res.status(400).json({ 
        error: 'Missing required user information', 
        message: 'User object must include email' 
      });
    }
    
    console.log(`📬 Sending welcome newsletter to: ${user.name || 'User'} (${user.email})`);
    
    const success = await sendWelcomeNewsletter(user);
    
    if (success) {
      res.status(200).json({ 
        message: 'Welcome newsletter sent successfully',
        success: true 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send welcome newsletter',
        message: 'Welcome newsletter could not be sent',
        success: false
      });
    }
  } catch (error) {
    console.error('Error sending welcome newsletter:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An error occurred while sending the welcome newsletter',
      success: false
    });
  }
});

// Send welcome back newsletter to a returning user
router.post('/welcome-back', async (req, res) => {
  try {
    const { user } = req.body;
    
    if (!user || !user.email) {
      return res.status(400).json({ 
        error: 'Missing required user information', 
        message: 'User object must include email' 
      });
    }
    
    console.log(`📬 Sending welcome back newsletter to: ${user.name || 'User'} (${user.email})`);
    
    const success = await sendWelcomeBackNewsletter(user);
    
    if (success) {
      res.status(200).json({ 
        message: 'Welcome back newsletter sent successfully',
        success: true 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send welcome back newsletter',
        message: 'Welcome back newsletter could not be sent',
        success: false
      });
    }
  } catch (error) {
    console.error('Error sending welcome back newsletter:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An error occurred while sending the welcome back newsletter',
      success: false
    });
  }
});

module.exports = router;