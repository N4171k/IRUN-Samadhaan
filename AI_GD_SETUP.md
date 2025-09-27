# AI-Simulated Group Discussion (GD) Setup Guide

## Overview
The AI-Simulated GD Practice Lab uses 4 Gemini AI models to simulate realistic Group Discussion scenarios for SSB preparation. Each AI candidate has a unique personality and discussion style.

## Setup Instructions

### 1. Get Gemini API Keys
You need 4 separate Gemini API keys for the best experience:
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create 4 API keys (you can use the same Google account)
- Each key will power one AI candidate

### 2. Configure API Keys
You can set up your API keys in two ways:

#### Option A: Environment Variables (Recommended)
1. Copy `.env.example` to `.env`
2. Add your API keys:
```bash
VITE_GEMINI_API_KEY_1=your_first_gemini_api_key
VITE_GEMINI_API_KEY_2=your_second_gemini_api_key
VITE_GEMINI_API_KEY_3=your_third_gemini_api_key
VITE_GEMINI_API_KEY_4=your_fourth_gemini_api_key
```

#### Option B: Manual Entry
- Enter API keys directly in the configuration panel when using the feature
- Keys are stored in browser session only (not persistent)

## AI Candidates

### Candidate Personalities
1. **Arjun** (Analytical) - Presents facts, statistics, and logical reasoning
2. **Priya** (Collaborative) - Builds on others' ideas, seeks common ground
3. **Vikram** (Assertive) - Confident and direct, presents strong viewpoints
4. **Sneha** (Diplomatic) - Balanced approach, presents multiple perspectives

## How It Works

### Discussion Flow
1. **Topic Generation**: Random GD topic is selected
2. **Round 1**: Each AI speaks → Your turn
3. **Round 2**: AIs respond to previous points → Your turn  
4. **Round 3**: Final round → Your turn
5. **Assessment**: AI generates comprehensive performance report

### Features
- **Speech Recognition**: Use voice input for responses (where supported)
- **Real-time Discussion**: AI candidates respond based on conversation flow
- **Performance Assessment**: Detailed feedback on communication, leadership, and content
- **Multiple Rounds**: 3 rounds of discussion for comprehensive practice

## Assessment Criteria
You'll be evaluated on:
- **Content Quality** (0-10): Relevance and depth of your points
- **Communication Skills** (0-10): Clarity and articulation
- **Leadership Qualities** (0-10): Initiative and influence in discussion
- **Participation Level** (0-10): Active engagement and listening
- **Overall Performance** (0-10): Combined assessment

## Tips for Better Performance
1. **Listen Actively**: Build on previous points made by AI candidates
2. **Stay Relevant**: Keep your responses focused on the topic
3. **Show Leadership**: Guide the discussion without dominating
4. **Be Respectful**: Acknowledge others' viewpoints before presenting yours
5. **Speak Clearly**: Use proper articulation and confidence

## Troubleshooting

### Common Issues
- **API Key Errors**: Ensure keys start with "AIzaSy" and have proper permissions
- **Rate Limits**: If you hit limits, wait before trying again
- **Network Issues**: Check internet connection for API calls

### API Key Requirements
- Must be valid Gemini API keys
- Should have access to `gemini-pro` model
- Need proper quotas enabled

## Privacy & Security
- API keys entered manually are stored only in browser session
- No conversation data is stored permanently
- All AI interactions happen directly with Google's Gemini API

---

For support or issues, please check the application logs or contact the development team.