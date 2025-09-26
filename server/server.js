// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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

const tatRoutes = require('./routes/tatRoutes');
const watRoutes = require('./routes/watRoutes');
const oirRoutes = require('./routes/oirRoutes');
const gdRoutes = require('./routes/gdRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/tat', tatRoutes);
app.use('/api/wat', watRoutes);
app.use('/api/oir', oirRoutes);
app.use('/api/gd', gdRoutes);

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 TAT API: http://localhost:${PORT}/api/tat`);
  console.log(`🤝 GD API: http://localhost:${PORT}/api/gd`);
  console.log(`📝 WAT API: http://localhost:${PORT}/api/wat`);
  console.log(`🧠 OIR API: http://localhost:${PORT}/api/oir`);
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