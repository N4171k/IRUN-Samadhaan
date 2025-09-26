# TAT Server

A Node.js server providing Thematic Apperception Test (TAT) services using Google Gemini AI.

## Features

- 🎯 **TAT Topic Generation**: Generate creative scenarios for TAT assessments
- 📝 **Story Feedback**: AI-powered feedback on user stories
- 🛡️ **Rate Limiting**: Protection against API abuse
- 🚀 **CORS Enabled**: Ready for frontend integration
- ⚡ **Error Handling**: Comprehensive error handling with fallbacks

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Get your Google Gemini API key:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

3. Update `.env` with your configuration:
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
GOOGLE_API_KEY=your_actual_api_key_here
RATE_LIMIT=60
```

### 3. Start the Server

**Development mode** (with auto-restart):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

## API Endpoints

### Base URL
```
http://localhost:3001
```

### Health Check
```
GET /health
```
Returns server status and configuration info.

### TAT Service Health
```
GET /api/tat/health
```
Returns TAT service status and available endpoints.

### Generate TAT Topic
```
GET /api/tat/topic
```

**Response:**
```json
{
  "success": true,
  "data": {
    "topic": "A young man looking out at a village from a hilltop",
    "timestamp": "2025-09-14T12:00:00.000Z",
    "source": "gemini-pro"
  },
  "message": "TAT topic generated successfully"
}
```

### Generate Story Feedback
```
POST /api/tat/feedback
```

**Request Body:**
```json
{
  "story": "The young man stood on the hilltop, contemplating his future...",
  "topic": "A young man looking out at a village from a hilltop"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "feedback": "Your story shows excellent imagination and emotional depth...",
    "timestamp": "2025-09-14T12:00:00.000Z",
    "wordCount": 45,
    "source": "gemini-pro"
  },
  "message": "Feedback generated successfully"
}
```

## Rate Limiting

- **Default**: 60 requests per minute per IP
- **Configurable**: Set `RATE_LIMIT` in environment variables
- **Response**: 429 status code when limit exceeded

## Error Handling

The server includes comprehensive error handling:

- **API Failures**: Automatic fallback to pre-defined content
- **Invalid Input**: Clear error messages for validation failures
- **Rate Limiting**: Proper HTTP status codes and retry information
- **Configuration Issues**: Helpful setup guidance

## Integration with React Frontend

The server is configured to work with your React application:

1. **CORS**: Pre-configured for `http://localhost:5173`
2. **JSON Support**: Automatic parsing of JSON requests
3. **Error Responses**: Consistent error format for frontend handling

### Example Frontend Integration

```javascript
// Fetch a new TAT topic
const getTATTopic = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/tat/topic');
    const data = await response.json();
    return data.data.topic;
  } catch (error) {
    console.error('Error fetching TAT topic:', error);
  }
};

// Submit story for feedback
const getFeedback = async (story, topic) => {
  try {
    const response = await fetch('http://localhost:3001/api/tat/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ story, topic }),
    });
    const data = await response.json();
    return data.data.feedback;
  } catch (error) {
    console.error('Error getting feedback:', error);
  }
};
```

## Logging

The server includes request logging via Morgan:
- **Development**: Detailed logs for debugging
- **Production**: Optimized for performance monitoring

## Security Features

- **Helmet**: Security headers for protection
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Protects against malicious input
- **Environment Variables**: Secure configuration management

## Troubleshooting

### Common Issues

1. **"Service not configured" error**
   - Check your Google API key in `.env`
   - Ensure the key has Gemini API access

2. **CORS errors from frontend**
   - Verify `FRONTEND_URL` in `.env` matches your React app
   - Check that the server is running on the correct port

3. **Rate limit exceeded**
   - Wait for the rate limit window to reset (1 minute)
   - Consider increasing `RATE_LIMIT` for development

### Support

For issues with Google Gemini API:
- [Google AI Studio Documentation](https://ai.google.dev/docs)
- [API Key Management](https://makersuite.google.com/app/apikey)