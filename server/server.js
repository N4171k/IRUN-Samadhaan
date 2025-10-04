// Load environment variables first
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fetch = require('node-fetch');
const { WebSocketServer } = require('ws');

// Discover available Gemini API keys from multiple naming conventions
const GEMINI_KEY_PATTERNS = [
  /^GOOGLE_API_KEY(?:_\d+)?$/,
  /^GEMINI_API_KEY(?:_\d+)?$/,
  /^VITE_GEMINI_API_KEY(?:_\d+)?$/
];

const isPlaceholderKey = (value = '') => {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized.includes('your_') ||
    normalized.includes('replace') ||
    normalized.includes('dummy')
  );
};

const discoveredKeyEntries = Object.entries(process.env)
  .filter(([key, value]) => {
    if (!value) return false;
    return GEMINI_KEY_PATTERNS.some((pattern) => pattern.test(key));
  });

const apiKeys = Array.from(new Set(
  discoveredKeyEntries
    .map(([, value]) => value.trim())
    .filter((value) => !isPlaceholderKey(value))
));

const discoveredLabels = discoveredKeyEntries.map(([key]) => key);
console.log('Gemini API key env vars detected:', discoveredLabels);
console.log(`Usable Gemini API keys: ${apiKeys.length}`);

if (apiKeys.length === 0) {
  console.warn('No usable Google Gemini API keys found. Add GOOGLE_API_KEY_1 / GEMINI_API_KEY_1 / VITE_GEMINI_API_KEY_1 to the server environment.');
} else {
  console.log('First Gemini API key prefix:', apiKeys[0].substring(0, 10) + '...');
}

// Make API keys available globally
global.GEMINI_API_KEYS = apiKeys;

// Normalise the first discovered Gemini key so downstream services can rely on standard env names
if (apiKeys.length > 0) {
  const primaryKey = apiKeys[0];
  if (!process.env.INTERVIEW_API) {
    process.env.INTERVIEW_API = primaryKey;
  }
  if (!process.env.GOOGLE_API_KEY) {
    process.env.GOOGLE_API_KEY = primaryKey;
  }
  if (!process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = primaryKey;
  }
}

// Initialize newsletter scheduler
const { initializeScheduler } = require('./services/newsletterScheduler');

const tatRoutes = require('./routes/tatRoutes');
const watRoutes = require('./routes/watRoutes');
const oirRoutes = require('./routes/oirRoutes');
const gdRoutes = require('./routes/gdRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const { streamInterviewResponse } = require('./services/interviewAgent');

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
app.use('/api/interview', interviewRoutes);

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
const server = app.listen(PORT, () => {
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

// WebSocket for Jeetu Interview mentor
const interviewWss = new WebSocketServer({ server, path: '/ws/interview' });

interviewWss.on('connection', (socket) => {
  console.log('[JeetuInterview] websocket client connected');
  let active = true;

  socket.on('close', () => {
    active = false;
    console.log('[JeetuInterview] websocket client disconnected');
  });

  socket.on('message', async (raw) => {
    if (!active) {
      return;
    }

    let payload;
    try {
      payload = JSON.parse(raw.toString());
    } catch (error) {
      socket.send(JSON.stringify({ type: 'error', message: 'Invalid payload format' }));
      return;
    }

    if (payload?.type !== 'candidate_message') {
      socket.send(JSON.stringify({ type: 'error', message: 'Unsupported message type' }));
      return;
    }

    const candidateText = payload.text || '';
    if (!candidateText.trim()) {
      socket.send(JSON.stringify({ type: 'error', message: 'Candidate response is empty' }));
      return;
    }

    socket.send(JSON.stringify({ type: 'status', state: 'thinking' }));

    try {
      const stream = streamInterviewResponse({
        sessionId: payload.sessionId,
        history: payload.history || [],
        input: candidateText,
        profile: payload.profile || {}
      });

      for await (const event of stream) {
        if (!active) {
          break;
        }

        if (event.type === 'chunk') {
          socket.send(JSON.stringify({ type: 'chunk', delta: event.delta }));
        } else if (event.type === 'complete') {
          socket.send(
            JSON.stringify({
              type: 'complete',
              text: event.text,
              sessionId: event.sessionId,
              history: event.history
            })
          );
        }
      }

      if (active) {
        socket.send(JSON.stringify({ type: 'status', state: 'speaking' }));
      }
    } catch (error) {
      console.error('[JeetuInterview] websocket stream error', error);
      if (active) {
        socket.send(
          JSON.stringify({
            type: 'error',
            message: 'Jeetu Bhaiya is unavailable right now. Try again shortly.'
          })
        );
      }
    }
  });
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