// Load environment variables first
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fetch = require('node-fetch');

// Find all API keys in the environment
console.log('ENV VARIABLES:', Object.keys(process.env).filter(key => key.startsWith('GOOGLE_API_KEY_')));

const apiKeys = Object.keys(process.env)
  .filter(key => key.startsWith('GOOGLE_API_KEY_'))
  .map(key => process.env[key]);

console.log(`Found ${apiKeys.length} Google API keys`);
if (apiKeys.length > 0) {
  console.log('First key starts with:', apiKeys[0].substring(0, 10) + '...');
}

if (apiKeys.length === 0) {
  console.warn('No Google API Keys found. Please add them to your .env file in the format GOOGLE_API_KEY_1, GOOGLE_API_KEY_2, etc.');
}

// Make API keys available globally
global.GEMINI_API_KEYS = apiKeys;

// Initialize newsletter scheduler
const { initializeScheduler } = require('./services/newsletterScheduler');

const tatRoutes = require('./routes/tatRoutes');
const watRoutes = require('./routes/watRoutes');
const oirRoutes = require('./routes/oirRoutes');
const gdRoutes = require('./routes/gdRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow any localhost origin on any port
    if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
      return callback(null, true);
    }
    
    // Allow specific frontend URLs
    const allowedOrigins = [
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(null, true); // Allow all for development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/tat', tatRoutes);
app.use('/api/wat', watRoutes);
app.use('/api/oir', oirRoutes);
app.use('/api/gd', gdRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Gemini API Proxy Route to handle CORS
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { model, prompt, apiKey } = req.body;
    
    console.log('🔄 Server received request:');
    console.log('📝 Model:', model);
    console.log('📝 Prompt length:', prompt?.length);
    console.log('🔑 API Key starts with:', apiKey?.substring(0, 10) + '...');
    
    if (!model || !prompt || !apiKey) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ error: 'Missing required fields: model, prompt, apiKey' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    console.log('🌐 Making request to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();
    
    console.log('📨 Gemini API response status:', response.status);
    
    if (!response.ok) {
      console.log('❌ Gemini API Error:', JSON.stringify(data, null, 2));
      return res.status(response.status).json(data);
    }

    console.log('✅ Gemini API Success');
    res.json(data);
  } catch (error) {
    console.error('Gemini API proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'TAT Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: 'The requested endpoint does not exist'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Initialize newsletter scheduler
initializeScheduler();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 TAT API: http://localhost:${PORT}/api/tat`);
  console.log(`🤝 GD API: http://localhost:${PORT}/api/gd`);
  console.log(`📝 WAT API: http://localhost:${PORT}/api/wat`);
  console.log(`🧠 OIR API: http://localhost:${PORT}/api/oir`);
  console.log(`📬 Newsletter scheduler initialized`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;