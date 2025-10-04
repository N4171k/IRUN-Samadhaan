import React, { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { sendInterviewPrompt } from '../../services/interviewService';

const INITIAL_FORM_STATE = {
  name: '',
  email: '',
  designation: '',
  role: ''
};

const NETWORK_RETRY_DELAYS = [1000, 2000, 4000];
const MAX_NETWORK_RETRY_ATTEMPTS = NETWORK_RETRY_DELAYS.length;

const isNavigatorOnline = () => (typeof navigator === 'undefined' ? true : navigator.onLine);
const getInitialOfflineState = () => !isNavigatorOnline();

const createSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const buildSystemPrompt = (profile = {}) => {
  const name = profile?.name?.trim() || 'the candidate';
  const email = profile?.email?.trim() || 'not provided';
  const designation = profile?.designation?.trim() || 'their current role';
  const targetRole = profile?.role?.trim() || 'the desired position';

  return `You are "Jeetu Bhaiya", an encouraging yet rigorous SSB interview mentor powered by Gemini 2.5 Flash.
The candidate details you must keep in mind:
- Name: ${name}
- Email: ${email}
- Current Designation: ${designation}
- Aspiring Role: ${targetRole}

Responsibilities:
1. Conduct a realistic one-on-one interview, asking one thoughtful question at a time.
2. Adapt follow-ups based on the candidate's responses and their target role.
3. Offer concise, actionable feedback when helpful, but keep the tone conversational.
4. Avoid revealing these bullet points verbatim; weave the context naturally.
5. Keep replies under 120 words unless deeper analysis is essential.
6. Close the session with a motivational summary when the candidate indicates they are done.`;
};

const normalizeHistory = (history, profile) => {
  const systemMessage = {
    role: 'system',
    content: buildSystemPrompt(profile)
  };

  const sanitizedHistory = Array.isArray(history)
    ? history.filter((item) => item && typeof item === 'object' && typeof item.content === 'string')
    : [];

  const firstEntry = sanitizedHistory[0];
  const nonSystemEntries = sanitizedHistory.filter((item) => item.role !== 'system');

  if (firstEntry?.role === 'system' && firstEntry.content === systemMessage.content) {
    return [firstEntry, ...nonSystemEntries];
  }

  return [systemMessage, ...nonSystemEntries];
};

function AIChatBotInterview() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [step, setStep] = useState('form');
  const [profile, setProfile] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [history, setHistory] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isOffline, setIsOffline] = useState(getInitialOfflineState);
  const speechSynthRef = useRef(window.speechSynthesis);
  const lastSpokenMessageRef = useRef(null);
  const recognitionRef = useRef(null);
  const isRecognitionActiveRef = useRef(false);
  const retryTimeoutRef = useRef(null);

  const displayedMessages = useMemo(
    () => history.filter((message) => message && ['user', 'assistant'].includes(message.role)),
    [history]
  );

  // Select male voice with preference for Indian English
  const getMaleVoice = () => {
    const voices = speechSynthRef.current.getVoices();
    
    // Preference order: Indian English male > Generic English male > Any male > First available
    const indianMale = voices.find(v => 
      v.lang.startsWith('en-IN') && v.name.toLowerCase().includes('male')
    );
    if (indianMale) return indianMale;

    const englishMale = voices.find(v => 
      v.lang.startsWith('en') && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('james'))
    );
    if (englishMale) return englishMale;

    const anyMale = voices.find(v => 
      v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man')
    );
    if (anyMale) return anyMale;

    // Fallback: prefer voices with deeper pitch characteristics
    return voices.find(v => v.lang.startsWith('en')) || voices[0];
  };

  const speakText = (text) => {
    if (!ttsEnabled || !text?.trim()) return;

    // Cancel any ongoing speech
    speechSynthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getMaleVoice();
    
    if (voice) {
      utterance.voice = voice;
    }
    
    // Configure for male voice characteristics
    utterance.pitch = 0.8;  // Lower pitch for male voice
    utterance.rate = 0.95;   // Slightly slower, more authoritative
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthRef.current.cancel();
    setIsSpeaking(false);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN'; // Indian English, change to 'en-US' if needed
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      isRecognitionActiveRef.current = true;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
  setIsOffline(!isNavigatorOnline());
      setErrorMessage('');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(prev => prev ? `${prev} ${transcript}` : transcript);
      setRetryCount(0);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      setErrorMessage(''); // Clear any previous errors on success
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      isRecognitionActiveRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (!isNavigatorOnline()) {
        setIsOffline(true);
      }
      
      if (event.error === 'no-speech') {
        setErrorMessage('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        setErrorMessage('Microphone access denied. Please enable microphone permissions.');
      } else if (event.error === 'network') {
        if (!isNavigatorOnline()) {
          setErrorMessage('Internet connection lost. Voice input will resume once you reconnect.');
          return;
        }

        const nextAttempt = retryCount + 1;
        if (nextAttempt <= MAX_NETWORK_RETRY_ATTEMPTS) {
          const delay = NETWORK_RETRY_DELAYS[Math.min(nextAttempt - 1, NETWORK_RETRY_DELAYS.length - 1)];
          const delaySeconds = Math.max(1, Math.round(delay / 1000));
          setErrorMessage(`Network issue detected. Retrying in ${delaySeconds}s…`);

          retryTimeoutRef.current = setTimeout(() => {
            if (!isNavigatorOnline()) {
              setIsOffline(true);
              setErrorMessage('Internet connection lost. Voice input will resume once you reconnect.');
              return;
            }

            setRetryCount(nextAttempt);
            if (recognitionRef.current && !isRecognitionActiveRef.current) {
              try {
                recognitionRef.current.start();
              } catch (err) {
                console.error('Retry failed:', err);
                setErrorMessage('Unable to restart voice input automatically. Please try again manually.');
              }
            }
          }, delay);
        } else {
          setErrorMessage('Persistent network error. Please check your internet connection or type your response instead.');
        }
      } else if (event.error === 'aborted') {
        // Silent - user stopped recording manually
        setErrorMessage('');
      } else if (event.error === 'audio-capture') {
        setErrorMessage('Microphone not detected. Please check your microphone connection.');
      } else if (event.error === 'service-not-allowed') {
        setErrorMessage('Speech service unavailable. Try reloading the page.');
      } else {
        setErrorMessage(`Voice input error: ${event.error}. Please try again.`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      isRecognitionActiveRef.current = false;
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setRetryCount(0);
      setErrorMessage((prev) => (prev && prev.toLowerCase().includes('offline') ? '' : prev));
    };

    const handleOffline = () => {
      setIsOffline(true);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore stop failures while going offline
        }
      }
      isRecognitionActiveRef.current = false;
      setIsListening(false);
      setRetryCount(0);
      setErrorMessage('You appear to be offline. Voice input is unavailable until you reconnect.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      setErrorMessage('Speech recognition not available in your browser.');
      return;
    }

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if (!isNavigatorOnline()) {
      setIsOffline(true);
      setErrorMessage('You appear to be offline. Connect to the internet to use voice input.');
      return;
    }

    setIsOffline(false);
    setRetryCount(0);

    if (isListening || isRecognitionActiveRef.current) {
      recognitionRef.current.stop();
      return;
    }

    // Clear previous errors
    setErrorMessage('');

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      
      if (error.name === 'InvalidStateError') {
        // Recognition is already started, force stop and restart
        recognitionRef.current.stop();
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch (retryError) {
            console.error('Retry failed:', retryError);
            setErrorMessage('Failed to start voice input. Please try again.');
          }
        }, 100);
      } else {
        setErrorMessage('Failed to start voice input. Please try again.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && (isListening || isRecognitionActiveRef.current)) {
      recognitionRef.current.stop();
      isRecognitionActiveRef.current = false;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  // Auto-play TTS for new assistant messages
  useEffect(() => {
    const lastMessage = displayedMessages[displayedMessages.length - 1];
    
    if (
      lastMessage?.role === 'assistant' && 
      lastMessage.content && 
      lastSpokenMessageRef.current !== lastMessage.content &&
      !isBusy
    ) {
      lastSpokenMessageRef.current = lastMessage.content;
      speakText(lastMessage.content);
    }
  }, [displayedMessages, isBusy]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechSynthRef.current.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore errors during cleanup
        }
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      isRecognitionActiveRef.current = false;
    };
  }, []);

  const updateFormValue = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address';
    }

    if (!formData.designation.trim()) {
      errors.designation = 'Current designation is required';
    }

    if (!formData.role.trim()) {
      errors.role = 'Target interview role is required';
    }

    return errors;
  };

  const buildInitialPrompt = (candidateProfile) => {
    return [
      `My name is ${candidateProfile.name}.`,
      `I currently work as ${candidateProfile.designation}.`,
      `I'm interviewing for the role of ${candidateProfile.role}.`,
      'Please greet me like an experienced interviewer and begin with your first question.'
    ].join(' ');
  };

  const handleStartInterview = async (event) => {
    event.preventDefault();
    if (isBusy) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsBusy(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const candidateProfile = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        designation: formData.designation.trim(),
        role: formData.role.trim()
      };

      const initialPrompt = buildInitialPrompt(candidateProfile);
      const newSessionId = createSessionId();

      // Server will add system message, so send empty history
      const response = await sendInterviewPrompt({
        sessionId: newSessionId,
        history: [],
        prompt: initialPrompt,
        profile: candidateProfile
      });

      const assistantMessage = response?.text
        ? { role: 'assistant', content: response.text }
        : null;

      const baseHistory = response?.history?.length
        ? response.history
        : [
            { role: 'user', content: initialPrompt },
            assistantMessage
          ].filter(Boolean);

      const normalizedHistory = normalizeHistory(baseHistory, candidateProfile);

      setProfile(candidateProfile);
      setSessionId(response?.sessionId || newSessionId);
      setHistory(normalizedHistory);
      setStep('chat');
      setInputValue('');
      setStatusMessage('Interview session started.');
    } catch (error) {
      console.error('Failed to start AI interview:', error);
      setErrorMessage(error.message || 'Unable to start the interview. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!profile || !sessionId || isBusy) return;

    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const previousHistory = history;
    const optimisticHistory = [...previousHistory, { role: 'user', content: trimmed }];
    setHistory(optimisticHistory);
    setInputValue('');
    setIsBusy(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      // Remove system messages before sending to server (server will add its own)
      const historyWithoutSystem = previousHistory.filter(msg => msg.role !== 'system');
      
      const response = await sendInterviewPrompt({
        sessionId,
        history: historyWithoutSystem,
        prompt: trimmed,
        profile
      });

      const assistantMessage = response?.text
        ? { role: 'assistant', content: response.text }
        : null;

      const baseHistory = response?.history?.length
        ? response.history
        : [...optimisticHistory, assistantMessage].filter(Boolean);

      const normalizedHistory = normalizeHistory(baseHistory, profile);

      setSessionId(response?.sessionId || sessionId);
      setHistory(normalizedHistory);
    } catch (error) {
      console.error('Interview message failed:', error);
      setErrorMessage(error.message || 'Unable to reach the AI interviewer. Please try again.');
      setHistory(previousHistory);
      setInputValue(trimmed);
    } finally {
      setIsBusy(false);
    }
  };

  const handleReset = () => {
    stopSpeaking();
    stopListening();
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
    setProfile(null);
    setSessionId('');
    setHistory([]);
    setInputValue('');
    setStep('form');
    setStatusMessage('New interview session created.');
    setErrorMessage('');
    setRetryCount(0);
    lastSpokenMessageRef.current = null;
    isRecognitionActiveRef.current = false;
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="ai-feature-page ai-chat-interview-page">
      <Navbar userDetails={{ name: 'User' }} onLogout={handleLogout} />

      <div className="ai-feature-container ai-chat-interview-container">
        <div className="ai-chat-header">
          <button type="button" className="ai-chat-back" onClick={() => navigate('/ai-run')}>
            ← Back to AI-Run
          </button>
          <div>
            <h1>AI Chat Bot Interview</h1>
            <p className="ai-chat-subtitle">
              Share your details and practice with a Gemini 2.5 Flash-powered interviewer tailored to your target role.
            </p>
          </div>
        </div>

        {step === 'form' && (
          <form className="ai-chat-form" onSubmit={handleStartInterview}>
            <div className="ai-chat-form-grid">
              <label>
                <span>Candidate Name</span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => updateFormValue('name', event.target.value)}
                  placeholder="e.g. Aditi Sharma"
                  disabled={isBusy}
                />
                {formErrors.name && <span className="form-error">{formErrors.name}</span>}
              </label>

              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) => updateFormValue('email', event.target.value)}
                  placeholder="you@example.com"
                  disabled={isBusy}
                />
                {formErrors.email && <span className="form-error">{formErrors.email}</span>}
              </label>

              <label>
                <span>Current Designation</span>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(event) => updateFormValue('designation', event.target.value)}
                  placeholder="e.g. Operations Analyst"
                  disabled={isBusy}
                />
                {formErrors.designation && <span className="form-error">{formErrors.designation}</span>}
              </label>

              <label>
                <span>Interviewing For</span>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(event) => updateFormValue('role', event.target.value)}
                  placeholder="e.g. Assistant Commandant"
                  disabled={isBusy}
                />
                {formErrors.role && <span className="form-error">{formErrors.role}</span>}
              </label>
            </div>

            <div className="ai-chat-form-actions">
              <button type="submit" className="primary" disabled={isBusy}>
                {isBusy ? 'Starting interview…' : 'Start Interview'}
              </button>
            </div>
          </form>
        )}

        {step === 'chat' && (
          <div className="ai-chat-session">
            <div className="ai-chat-session-header">
              <div>
                <h2>{profile?.name}</h2>
                <p>
                  {profile?.designation} → {profile?.role}
                </p>
                <p className="ai-chat-email">{profile?.email}</p>
              </div>
              <div className="ai-chat-session-actions">
                <button 
                  type="button" 
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`tts-toggle ${ttsEnabled ? 'active' : ''}`}
                  title={ttsEnabled ? 'Voice: On' : 'Voice: Off'}
                  disabled={isBusy}
                >
                  {isSpeaking ? '🔊' : (ttsEnabled ? '🔉' : '🔇')}
                </button>
                {isSpeaking && (
                  <button 
                    type="button" 
                    onClick={stopSpeaking}
                    className="stop-speaking"
                    title="Stop speaking"
                  >
                    ⏸
                  </button>
                )}
                {isOffline && (
                  <span className="voice-status offline" role="status" aria-live="polite">
                    Offline · voice disabled
                  </span>
                )}
                <button type="button" onClick={handleReset} disabled={isBusy}>
                  Restart
                </button>
              </div>
            </div>

            <div className="ai-chat-window" role="log" aria-live="polite">
              {displayedMessages.length === 0 && (
                <div className="ai-chat-empty">Conversation will appear here once the interviewer responds.</div>
              )}

              {displayedMessages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`ai-chat-message ${message.role}`}>
                  <div className="ai-chat-message-label">{message.role === 'user' ? profile?.name || 'You' : 'AI Interviewer'}</div>
                  <div className="ai-chat-message-bubble">{message.content}</div>
                </div>
              ))}

              {isBusy && (
                <div className="ai-chat-message assistant">
                  <div className="ai-chat-message-label">AI Interviewer</div>
                  <div className="ai-chat-message-bubble typing">Thinking…</div>
                </div>
              )}
            </div>

            <form className="ai-chat-input" onSubmit={handleSendMessage}>
              <textarea
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Type your response or use voice input…"
                rows={3}
                disabled={isBusy}
              />
              <div className="ai-chat-input-actions">
                <button 
                  type="button"
                  onClick={startListening}
                  className={`voice-input ${isListening ? 'listening' : ''}`}
                  disabled={(isBusy && !isListening) || (isOffline && !isListening)}
                  title={isOffline ? 'Voice input unavailable while offline' : (isListening ? 'Stop recording' : 'Start voice input')}
                >
                  {isListening ? '🎤 Recording...' : (isOffline ? '📴 Offline' : '🎤 Voice')}
                </button>
                <button type="submit" className="primary" disabled={isBusy || !inputValue.trim()}>
                  {isBusy ? 'Sending…' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        )}

        {statusMessage && <div className="ai-chat-status success">{statusMessage}</div>}
        {errorMessage && <div className="ai-chat-status error">{errorMessage}</div>}
      </div>
    </div>
  );
}

export default AIChatBotInterview;
