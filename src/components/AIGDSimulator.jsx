import React, { useState, useEffect } from 'react';
import { Bot, User, MessageCircle, Clock, CheckCircle, AlertCircle, Settings, Mic, MicOff } from 'lucide-react';

const AIGDSimulator = () => {
  // Validate API key format (basic validation for Gemini keys)
  const isValidApiKey = (apiKey) => {
    return apiKey && apiKey.trim().length > 20 && apiKey.startsWith('AIzaSy');
  };

  // Test API key to see what models are available
  const testApiKey = async (apiKey) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Available models for this API key:', data.models?.map(m => m.name));
        
        // Find working generative models, prefer flash models for better rate limits
        const generativeModels = data.models?.filter(model => 
          model.supportedGenerationMethods?.includes('generateContent') &&
          (model.name.includes('gemini') || model.name.includes('text'))
        );
        
        if (generativeModels && generativeModels.length > 0) {
          console.log('Found working generative models:', generativeModels.map(m => m.name));
          
          // Prefer flash models for better rate limits
          const flashModel = generativeModels.find(m => m.name.includes('flash'));
          if (flashModel) {
            console.log('Using flash model for better rate limits:', flashModel.name);
            return flashModel.name;
          }
          
          // Otherwise use the first available model
          return generativeModels[0].name;
        }
        
        return data.models || [];
      } else {
        console.error('API key test failed:', response.status, response.statusText);
        return [];
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      return [];
    }
  };

  // Helper function to check if all API keys are from environment variables and valid
  const allApiKeysFromEnv = () => {
    return import.meta.env.VITE_GEMINI_API_KEY_1 && 
           import.meta.env.VITE_GEMINI_API_KEY_2 && 
           import.meta.env.VITE_GEMINI_API_KEY_3 && 
           import.meta.env.VITE_GEMINI_API_KEY_4 &&
           isValidApiKey(import.meta.env.VITE_GEMINI_API_KEY_1) &&
           isValidApiKey(import.meta.env.VITE_GEMINI_API_KEY_2) &&
           isValidApiKey(import.meta.env.VITE_GEMINI_API_KEY_3) &&
           isValidApiKey(import.meta.env.VITE_GEMINI_API_KEY_4);
  };

  // Configuration for 4 AI candidates
  const [aiConfigs, setAiConfigs] = useState({
    candidate1: { 
      name: 'Arjun', 
      apiKey: import.meta.env.VITE_GEMINI_API_KEY_1 || '', 
      personality: 'analytical' 
    },
    candidate2: { 
      name: 'Priya', 
      apiKey: import.meta.env.VITE_GEMINI_API_KEY_2 || '', 
      personality: 'collaborative' 
    },
    candidate3: { 
      name: 'Vikram', 
      apiKey: import.meta.env.VITE_GEMINI_API_KEY_3 || '', 
      personality: 'assertive' 
    },
    candidate4: { 
      name: 'Sneha', 
      apiKey: import.meta.env.VITE_GEMINI_API_KEY_4 || '', 
      personality: 'diplomatic' 
    }
  });

  // GD State
  const [currentTopic, setCurrentTopic] = useState('');
  const [gdStarted, setGdStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentSpeaker, setCurrentSpeaker] = useState(0); // 0-3 for AI, 4 for user
  const [userResponse, setUserResponse] = useState('');
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [gdHistory, setGdHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(!allApiKeysFromEnv());
  const [gdComplete, setGdComplete] = useState(false);
  const [finalReport, setFinalReport] = useState(null);
  const [autoStartAttempted, setAutoStartAttempted] = useState(false);
  const [error, setError] = useState(null);

  // API Model state
  const [workingModel, setWorkingModel] = useState(null);

  // Generate fallback response when all APIs are down
  const generateFallbackResponse = (prompt) => {
    // Extract personality from prompt
    const personalityMatch = prompt.match(/Your name: (\w+)/);
    const name = personalityMatch ? personalityMatch[1] : 'AI';
    
    // Simple fallback responses based on personality
    const fallbackResponses = {
      'Arjun': 'From an analytical perspective, this topic requires careful consideration of multiple data points and evidence-based reasoning. Let me share some key insights based on available research.',
      'Priya': 'Thank you for bringing up this important topic. I believe we can find common ground by building on everyone\'s perspectives and working together collaboratively to find solutions.',
      'Vikram': 'I have a strong viewpoint on this matter. While I respect other opinions, I believe we need to be direct and decisive in our approach to address this issue effectively.',
      'Sneha': 'This is indeed a complex topic with valid arguments on multiple sides. Perhaps we should consider a balanced approach that addresses various stakeholder concerns while maintaining fairness.'
    };
    
    return fallbackResponses[name] || 'Thank you for this thought-provoking topic. I believe this issue deserves careful consideration from multiple angles to reach the best solution.';
  };

  // Voice features
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  // GD Topics pool
  const gdTopics = [
    "Is social media more beneficial or harmful to society?",
    "Should India focus more on space exploration or poverty alleviation?", 
    "Is online education as effective as traditional classroom learning?",
    "Should military service be mandatory for all citizens?",
    "Is artificial intelligence a threat or an opportunity for employment?",
    "Should plastic be completely banned to save the environment?",
    "Is the current education system preparing students for the future?",
    "Should voting be made compulsory in a democracy?",
    "Is work-from-home culture sustainable in the long term?",
    "Should celebrities be held responsible for their social influence?"
  ];

  // AI Personalities
  const personalities = {
    analytical: "You are an analytical thinker who presents facts, statistics, and logical reasoning. You prefer data-driven arguments.",
    collaborative: "You are a collaborative team player who builds on others' ideas and seeks common ground. You encourage participation from all.",
    assertive: "You are confident and direct in your communication. You present strong viewpoints but remain respectful of others.",
    diplomatic: "You are diplomatic and balanced, often presenting multiple perspectives and seeking middle ground solutions."
  };

  // Check if all API keys are set and valid
  const allApiKeysSet = () => {
    return Object.values(aiConfigs).every(config => config.apiKey.trim() !== '');
  };

  const allApiKeysValid = () => {
    return Object.values(aiConfigs).every(config => isValidApiKey(config.apiKey));
  };

  // Auto-start GD if environment API keys are available
  useEffect(() => {
    const attemptAutoStart = async () => {
      try {
        if (allApiKeysFromEnv() && !gdStarted && !gdComplete && !autoStartAttempted) {
          setAutoStartAttempted(true);
          // Small delay to ensure component is mounted properly
          setTimeout(async () => {
            await startGD();
          }, 1500);
        }
      } catch (error) {
        console.error('Auto-start error:', error);
        setError('Failed to auto-start Group Discussion.');
      }
    };

    attemptAutoStart();
  }, []);

  // Initialize GD with random topic
  const startGD = async () => {
    try {
      setError(null); // Clear any previous errors
      setWorkingModel(null); // Clear any cached wrong models
      
      if (!allApiKeysSet()) {
        setError('Please set all 4 Gemini API keys before starting the GD.');
        return;
      }

      if (!allApiKeysValid()) {
        setError('Please ensure all API keys are valid Gemini API keys (should start with "AIzaSy").');
        return;
      }

      console.log('Starting GD with fresh model discovery...');

      const randomTopic = gdTopics[Math.floor(Math.random() * gdTopics.length)];
      setCurrentTopic(randomTopic);
      setGdStarted(true);
      setShowSettings(false);
      setCurrentRound(1);
      setCurrentSpeaker(0);
      setGdHistory([]);
      
      // Start with first AI candidate
      await generateAIResponse(0, randomTopic, []);
    } catch (error) {
      console.error('Error starting GD:', error);
      setError('Failed to start Group Discussion. Please try again.');
    }
  };

  // Generate AI response using Gemini API
  const generateAIResponse = async (candidateIndex, topic, history) => {
    setIsLoading(true);
    const candidate = Object.values(aiConfigs)[candidateIndex];
    
    try {
      // Build context for the AI
      let context = `You are participating in a Group Discussion (GD) for SSB selection. 
      Topic: "${topic}"
      Your name: ${candidate.name}
      Your personality: ${personalities[candidate.personality]}
      
      Rules:
      - Keep responses between 30-80 words
      - Be respectful and professional
      - Present your viewpoint clearly
      - ${candidateIndex === 0 ? 'Start the discussion with an opening statement' : 'Respond to previous points and add your perspective'}
      - Avoid aggressive language
      - Show leadership qualities
      
      Previous discussion:`;

      history.forEach((entry, index) => {
        context += `\n${entry.speaker}: ${entry.message}`;
      });

      context += `\n\nNow give your response as ${candidate.name}:`;

      // Try with candidate's API key first, then fallback to other keys if rate limited
      let response;
      try {
        response = await callGeminiAPI(candidate.apiKey, context);
      } catch (error) {
        if (error.message.includes('Rate limit exceeded')) {
          // Try with other available API keys
          const allKeys = [import.meta.env.VITE_GEMINI_API_KEY_1, import.meta.env.VITE_GEMINI_API_KEY_2, import.meta.env.VITE_GEMINI_API_KEY_3, import.meta.env.VITE_GEMINI_API_KEY_4].filter(key => key && key !== candidate.apiKey);
          for (const fallbackKey of allKeys) {
            try {
              response = await callGeminiAPI(fallbackKey, context);
              break;
            } catch (fallbackError) {
              if (!fallbackError.message.includes('Rate limit exceeded')) {
                throw fallbackError;
              }
            }
          }
          if (!response) {
            throw error; // All keys are rate limited
          }
        } else {
          throw error;
        }
      }
      
      const newEntry = {
        speaker: candidate.name,
        message: response,
        type: 'ai',
        candidateIndex: candidateIndex,
        timestamp: new Date().toISOString()
      };

      const updatedHistory = [...history, newEntry];
      setGdHistory(updatedHistory);

      // Move to next speaker or user turn with longer delays to avoid rate limiting
      if (candidateIndex < 3) {
        setCurrentSpeaker(candidateIndex + 1);
        // Increase delay to 10 seconds to avoid rate limiting and quota issues
        setTimeout(() => generateAIResponse(candidateIndex + 1, topic, updatedHistory), 10000);
      } else {
        // All AI candidates have spoken, now user's turn
        setIsUserTurn(true);
        setCurrentSpeaker(4);
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Special handling for rate limit errors
      if (error.message.includes('Rate limit exceeded')) {
        setError(`⏱️ Rate Limit Reached: ${candidate.name}'s API key has hit the free tier limit. Try again in about a minute, or use different API keys for each candidate to increase your quota.`);
      } else {
        setError(`Error generating AI response from ${candidate.name}: ${error.message}`);
      }
      
      setIsLoading(false);
      setGdStarted(false); // Stop the GD on error
    } finally {
      setIsLoading(false);
    }
  };

  // Call Gemini API with fallback model strategy
  const callGeminiAPI = async (apiKey, prompt, retryCount = 0) => {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API key is required');
    }

    // Use multiple working models as fallbacks for when services are unavailable
    const basicModels = [
      'gemini-1.5-flash',     // Primary - most stable and reliable
      'gemini-1.5-pro',       // Secondary - more capable 
      'gemini-2.5-flash'      // Tertiary - newest (but sometimes down)
    ];

    console.log('Using basic proven models only - no discovery');
    let lastError = null;

    for (let model of basicModels) {
      try {
        console.log('🔄 Trying model:', model);
        console.log('📝 Prompt length:', prompt.length);
        console.log('🔑 API Key starts with:', apiKey.substring(0, 10) + '...');
        
        // Use server proxy to avoid CORS issues
        const requestBody = {
          model: model,
          prompt: prompt,
          apiKey: apiKey
        };
        console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch('https://irun-back.onrender.com/api/gemini/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });      console.log('📨 Response status:', response.status);
      console.log('📨 Response headers:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Gemini API Error Response:', errorData);
        console.error('❌ Status:', response.status);
        console.error('❌ Status Text:', response.statusText);
        
        if (response.status === 400) {
          throw new Error('Invalid API key or request format. Please check your API key.');
        } else if (response.status === 403) {
          throw new Error('API key lacks required permissions. Please check your Gemini API key settings.');
        } else if (response.status === 429) {
          // Parse retry delay from the error response
          let retryDelay = 60; // default 60 seconds
          try {
            const errorData = JSON.parse(errorData);
            if (errorData.error && errorData.error.details) {
              const retryInfo = errorData.error.details.find(d => d['@type']?.includes('RetryInfo'));
              if (retryInfo && retryInfo.retryDelay) {
                retryDelay = parseInt(retryInfo.retryDelay.replace('s', '')) || 60;
              }
            }
          } catch (e) {
            // Use default delay if parsing fails
          }
          
          throw new Error(`Rate limit exceeded. The API suggests waiting ${retryDelay} seconds. Please try again later or use a different API key.`);
        } else if (response.status >= 500) {
          // Server errors (500, 503, etc.) - try next model instead of retrying same request
          throw new Error(`Gemini API server error (${response.status}): ${response.statusText}. Trying next model...`);
        } else {
          throw new Error(`Gemini API error: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('No response generated. Please try again.');
      }

      return data.candidates[0].content.parts[0].text.trim();
      
    } catch (error) {
      console.error(`Error with model ${model}:`, error.message);
      lastError = error;
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      // Continue to next model if this one failed
      if (basicModels.indexOf(model) < basicModels.length - 1) {
        continue;
      } else {
        throw error;
      }
    }
  }

  // If we get here, all models failed - provide fallback response
  console.log('🔄 All Gemini models failed, using fallback response');
  return generateFallbackResponse(prompt);
};

  // Handle user response submission
  const submitUserResponse = async () => {
    if (userResponse.trim() === '') return;

    const userEntry = {
      speaker: 'You',
      message: userResponse.trim(),
      type: 'user',
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...gdHistory, userEntry];
    setGdHistory(updatedHistory);
    setUserResponse('');
    setIsUserTurn(false);

    // Check if we've completed 3 rounds
    if (currentRound >= 3) {
      // End GD and generate report
      await generateFinalReport(updatedHistory);
    } else {
      // Start next round
      setCurrentRound(prev => prev + 1);
      setCurrentSpeaker(0);
      setTimeout(() => generateAIResponse(0, currentTopic, updatedHistory), 1000);
    }
  };

  // Generate final assessment report
  const generateFinalReport = async (history) => {
    setIsLoading(true);
    
    try {
      // Use first AI's API key for report generation
      const firstApiKey = Object.values(aiConfigs)[0].apiKey;
      
      const userResponses = history.filter(entry => entry.type === 'user');
      const reportPrompt = `Analyze this Group Discussion performance and provide a detailed assessment report.

Topic: "${currentTopic}"

User's responses:
${userResponses.map((response, index) => `${index + 1}. ${response.message}`).join('\n')}

Complete discussion flow:
${history.map(entry => `${entry.speaker}: ${entry.message}`).join('\n')}

Please provide a comprehensive assessment covering:
1. Content Quality (0-10)
2. Communication Skills (0-10) 
3. Leadership Qualities (0-10)
4. Participation Level (0-10)
5. Overall Performance (0-10)

For each category, provide:
- Score
- Strengths observed
- Areas for improvement
- Specific suggestions

Format the response as a structured report.`;

      const report = await callGeminiAPI(firstApiKey, reportPrompt);
      setFinalReport(report);
      setGdComplete(true);
      
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Error generating final report. Please try again.');
      setGdComplete(true); // Still mark as complete even if report fails
    } finally {
      setIsLoading(false);
    }
  };

  // Handle API key changes
  const updateApiKey = (candidateKey, apiKey) => {
    setAiConfigs(prev => ({
      ...prev,
      [candidateKey]: {
        ...prev[candidateKey],
        apiKey: apiKey.trim()
      }
    }));
  };

  // Voice recognition for user input
  const startListening = () => {
    if (!speechSupported) return;

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserResponse(prev => prev + ' ' + transcript);
    };
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  // Reset GD
  const resetGD = () => {
    setGdStarted(false);
    setGdComplete(false);
    setCurrentRound(1);
    setCurrentSpeaker(0);
    setIsUserTurn(false);
    setGdHistory([]);
    setUserResponse('');
    setFinalReport(null);
    setCurrentTopic('');
    setAutoStartAttempted(false);
    setError(null);
    setIsLoading(false);
    setShowSettings(!allApiKeysFromEnv()); // Show settings only if env keys aren't available
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-red-800 font-semibold">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">AI-Simulated GD Practice Lab</h1>
            <p className="text-purple-100">
              Gemini-powered simulation with four virtual candidates. Choose your language, share your story, and watch the discussion unfold. 
              Supports speech input and audio playback where your browser allows it.
            </p>
          </div>
          {allApiKeysFromEnv() && (
            <div className="text-right">
              <div className="flex items-center gap-2 text-green-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Ready</span>
              </div>
              <p className="text-xs text-purple-200 mt-1">Environment configured</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Start Panel for Environment-configured setup */}
      {allApiKeysFromEnv() && !gdStarted && !gdComplete && !showSettings && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center">
            {autoStartAttempted && isLoading ? (
              <>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <h2 className="text-xl font-semibold text-gray-800">Preparing Group Discussion...</h2>
                </div>
                <p className="text-gray-600">
                  Setting up AI candidates and generating discussion topic. Please wait.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Ready to Start!</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  All 4 Gemini API keys are configured in your environment. 
                  {autoStartAttempted ? ' Click below to begin your AI Group Discussion practice.' : ' Starting automatically in a moment...'}
                </p>
                {!autoStartAttempted && (
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={startGD}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Start AI Group Discussion
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
                    >
                      View Configuration
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Configuration</h2>
            <div className="flex items-center gap-2">
              {allApiKeysFromEnv() && (
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                >
                  Hide Settings
                </button>
              )}
              <Settings className="w-5 h-5 text-gray-500" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className={`border rounded-lg p-4 ${
              allApiKeysSet() ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <p className={`text-sm ${
                allApiKeysSet() ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {allApiKeysFromEnv() ? (
                  <>
                    <strong>✅ Fully Configured:</strong> All 4 API keys loaded from environment variables. 
                    AI Group Discussion is ready to start automatically.
                  </>
                ) : allApiKeysSet() ? (
                  <>
                    <strong>Ready to Start:</strong> All API keys are configured. You can now start the AI Group Discussion.
                  </>
                ) : (
                  <>
                    <strong>Setup Required:</strong> Please add your 4 Gemini API keys to enable the AI candidates. 
                    Each API key will power one virtual candidate with a unique personality.
                    <br />
                    <small className="mt-1 block">
                      Tip: You can also set these as environment variables (VITE_GEMINI_API_KEY_1, etc.) in your .env file.
                    </small>
                  </>
                )}
              </p>
            </div>

            {Object.entries(aiConfigs).map(([key, config], index) => {
              const envKeyName = `VITE_GEMINI_API_KEY_${index + 1}`;
              const isFromEnv = import.meta.env[envKeyName] && import.meta.env[envKeyName] === config.apiKey;
              
              return (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Bot className="w-5 h-5 text-purple-600" />
                    <h3 className="font-medium text-gray-800">
                      Candidate {index + 1}: {config.name}
                    </h3>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {config.personality}
                    </span>
                    {isFromEnv && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        From .env
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder={`Gemini API Key for ${config.name} (starts with AIzaSy...)`}
                    value={config.apiKey}
                    onChange={(e) => updateApiKey(key, e.target.value)}
                    className={`w-full p-3 border rounded-lg text-sm font-mono ${
                      config.apiKey && !isValidApiKey(config.apiKey) 
                        ? 'border-red-300 bg-red-50' 
                        : config.apiKey && isValidApiKey(config.apiKey)
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300'
                    }`}
                  />
                  {config.apiKey && !isValidApiKey(config.apiKey) && (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠ Invalid API key format. Gemini keys should start with "AIzaSy"
                    </p>
                  )}
                  {config.apiKey && isValidApiKey(config.apiKey) && !isFromEnv && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Valid API key format
                    </p>
                  )}
                  {isFromEnv && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Loaded from environment variable ({envKeyName})
                    </p>
                  )}
                </div>
              );
            })}

            <button
              onClick={startGD}
              disabled={!allApiKeysSet() || !allApiKeysValid()}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                allApiKeysSet() && allApiKeysValid()
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {!allApiKeysSet() 
                ? 'Please Set All API Keys'
                : !allApiKeysValid()
                ? 'Please Enter Valid API Keys'
                : 'Start AI Group Discussion'
              }
            </button>
          </div>
        </div>
      )}

      {/* GD Interface */}
      {gdStarted && !gdComplete && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* GD Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Group Discussion in Progress</h2>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Topic:</strong> {currentTopic}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  Round {currentRound} of 3
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {isUserTurn ? 'Your turn to speak' : `AI Candidate ${currentSpeaker + 1} speaking`}
                </div>
              </div>
            </div>
          </div>

          {/* Discussion History */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {gdHistory.map((entry, index) => (
                <div key={index} className={`flex items-start gap-3 ${entry.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    entry.type === 'user' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    {entry.type === 'user' ? <User className="w-4 h-4 text-green-600" /> : <Bot className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div className={`max-w-md ${entry.type === 'user' ? 'text-right' : ''}`}>
                    <div className="text-sm font-medium text-gray-700 mb-1">{entry.speaker}</div>
                    <div className={`p-3 rounded-lg ${
                      entry.type === 'user' 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <p className="text-sm text-gray-800">{entry.message}</p>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-600 animate-pulse" />
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-500">AI candidate is thinking...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Input */}
          {isUserTurn && (
            <div className="border-t bg-gray-50 p-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Your Response (Share your thoughts on the topic)
                </label>
                <div className="relative">
                  <textarea
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    placeholder="Share your thoughts and perspectives on the topic..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 pr-12"
                    disabled={isLoading}
                  />
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={startListening}
                      disabled={isListening || isLoading}
                      className={`absolute right-3 top-3 p-2 rounded ${
                        isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Speak clearly and confidently. Share your perspective and build on others' points.
                  </p>
                  <button
                    onClick={submitUserResponse}
                    disabled={userResponse.trim() === '' || isLoading}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                      userResponse.trim() !== '' && !isLoading
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Submit Response
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Final Report */}
      {gdComplete && finalReport && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">GD Assessment Report</h2>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2"><strong>Topic Discussed:</strong> {currentTopic}</p>
            <p className="text-sm text-gray-600"><strong>Rounds Completed:</strong> 3</p>
          </div>

          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
              {finalReport}
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={resetGD}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Practice Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIGDSimulator;