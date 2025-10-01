import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLoaderTask } from '../contexts/LoaderContext';

const FALLBACK_LANGUAGES = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'hi-IN', label: 'Hindi (भारत)' },
  { code: 'mr-IN', label: 'Marathi (मराठी)' }
];

function AIGDPractice({ story, onStoryChange }) {
  const [language, setLanguage] = useState('en-IN');
  const [languages, setLanguages] = useState(FALLBACK_LANGUAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [listening, setListening] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const recognitionRef = useRef(null);
  const speechSupported = typeof window !== 'undefined' && !!window.speechSynthesis;
  const runWithLoader = useLoaderTask();

  useEffect(() => {
    async function checkServerAndFetchLanguages() {
      try {
        setServerStatus('checking');
        const response = await runWithLoader(async () => fetch('/api/gd/languages'));
        console.log('Languages API response status:', response.status);
        
        if (!response.ok) {
          console.warn(`Languages API returned ${response.status}: ${response.statusText}`);
          setServerStatus('disconnected');
          return;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.warn('Languages API did not return JSON, content-type:', contentType);
          setServerStatus('error');
          return;
        }
        
        const responseText = await response.text();
        console.log('Languages API raw response:', responseText);
        
        if (!responseText.trim()) {
          console.warn('Languages API returned empty response');
          setServerStatus('error');
          return;
        }
        
        const payload = JSON.parse(responseText);
        if (payload?.success && Array.isArray(payload.data)) {
          setLanguages(payload.data);
          if (payload.data.find((item) => item.code === language) === undefined) {
            setLanguage(payload.data[0]?.code || 'en-IN');
          }
          setServerStatus('connected');
        } else {
          setServerStatus('error');
        }
      } catch (err) {
        console.warn('Failed to fetch GD languages, using fallback list.', err);
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          setServerStatus('disconnected');
        } else {
          setServerStatus('error');
        }
      }
    }

    checkServerAndFetchLanguages();
  }, [runWithLoader]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ');
      onStoryChange((prev) => `${prev ? `${prev.trim()} ` : ''}${transcript.trim()}`);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [language, onStoryChange]);

  const speakText = (text) => {
    if (!speechSupported || !text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
      setListening(true);
    } catch (error) {
      console.error('Unable to start speech recognition:', error);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setListening(false);
  };

  const handleSimulate = async () => {
    if (!story || story.trim().length < 20) {
      setError('Please provide a story with at least 20 characters to simulate the group discussion.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null);

    try {
      await runWithLoader(async () => {
        const response = await fetch('/api/gd/simulate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            story,
            language
          })
        });

        console.log('Simulation API response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Simulation API error ${response.status}:`, errorText);
          throw new Error(`Server error (${response.status}): ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await response.text();
          console.error('Simulation API did not return JSON, content-type:', contentType, 'Response:', responseText);
          throw new Error('Server returned invalid response format');
        }

        const responseText = await response.text();
        console.log('Simulation API raw response:', responseText);

        if (!responseText.trim()) {
          throw new Error('Server returned empty response');
        }

        const payload = JSON.parse(responseText);
        if (!payload?.success) {
          throw new Error(payload?.message || 'Simulation failed. Please try again later.');
        }

        setResult(payload.data);
      });
    } catch (err) {
      console.error('GD simulation error:', err);
      if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
        setError('Server returned invalid data. Please try again or contact support.');
      } else if (err.message.includes('fetch')) {
        setError('Unable to connect to server. Please check your internet connection.');
      } else {
        setError(err.message || 'Unable to generate AI discussion.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const languageLabel = useMemo(() => {
    return languages.find((item) => item.code === language)?.label || language;
  }, [language, languages]);

  return (
    <div className="p-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-4">
        {serverStatus !== 'connected' && (
          <div className={`px-3 py-2 rounded-md text-sm ${
            serverStatus === 'checking' 
              ? 'bg-blue-100 text-blue-800' 
              : serverStatus === 'disconnected'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {serverStatus === 'checking' && '🔄 Connecting to AI simulation server...'}
            {serverStatus === 'disconnected' && '⚠️ AI server not running. Please start the backend server on port 3001.'}
            {serverStatus === 'error' && '❌ AI server configuration issue. Check server logs.'}
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-purple-900">AI-Simulated GD Practice Lab</h2>
              {serverStatus === 'connected' && <span className="text-green-600 text-sm">🟢 Connected</span>}
            </div>
            <p className="text-sm text-purple-700 mt-1">
              Gemini-powered simulation with four virtual candidates. Choose your language, share your story,
              and watch the discussion unfold. Supports speech input and audio playback where your browser allows it.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="gd-language" className="text-sm font-medium text-purple-800">Discussion Language</label>
            <select
              id="gd-language"
              className="border border-purple-300 rounded-md px-3 py-2 text-sm"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {languages.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-800">Your PPDT story</label>
          <textarea
            value={story}
            onChange={(event) => onStoryChange(event.target.value)}
            className="w-full h-28 border border-purple-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
            placeholder="Paste or dictate your PPDT story here..."
          />
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>Selected language: {languageLabel}</span>
            {recognitionRef.current ? (
              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                className={`px-3 py-1 rounded-full border text-xs font-medium ${
                  listening
                    ? 'bg-red-100 border-red-300 text-red-700'
                    : 'bg-gray-100 border-gray-300 text-gray-600'
                }`}
              >
                {listening ? 'Stop Dictation' : 'Dictate (STT)'}
              </button>
            ) : (
              <span className="italic">Speech-to-text not supported in this browser.</span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSimulate}
          disabled={isLoading || serverStatus !== 'connected'}
          className="w-full md:w-auto bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating simulation…' : 'Generate AI Discussion'}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-purple-900">AI-Simulated GD Practice Lab</h2>
            <p className="text-sm text-purple-700 mt-1">
              Gemini-powered simulation with four virtual candidates. Choose your language, share your story,
              and watch the discussion unfold. Supports speech input and audio playback where your browser allows it.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="gd-language" className="text-sm font-medium text-purple-800">Discussion Language</label>
            <select
              id="gd-language"
              className="border border-purple-300 rounded-md px-3 py-2 text-sm"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {languages.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-800">Your PPDT story</label>
          <textarea
            value={story}
            onChange={(event) => onStoryChange(event.target.value)}
            className="w-full h-28 border border-purple-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
            placeholder="Paste or dictate your PPDT story here..."
          />
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>Selected language: {languageLabel}</span>
            {recognitionRef.current ? (
              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                className={`px-3 py-1 rounded-full border text-xs font-medium ${
                  listening
                    ? 'bg-red-100 border-red-300 text-red-700'
                    : 'bg-gray-100 border-gray-300 text-gray-600'
                }`}
              >
                {listening ? 'Stop Dictation' : 'Dictate (STT)'}
              </button>
            ) : (
              <span className="italic">Speech-to-text not supported in this browser.</span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSimulate}
          disabled={isLoading}
          className="w-full md:w-auto bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating simulation…' : 'Generate AI Discussion'}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="mt-8 space-y-6">
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Virtual Candidates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.personas.map((persona) => (
                <div key={persona.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
                  <h4 className="font-semibold text-gray-900">{persona.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{persona.background}</p>
                  <p className="text-sm text-indigo-600 mt-2"><strong>Stance:</strong> {persona.stance}</p>
                  <p className="text-sm text-gray-600 mt-2"><strong>Speaking style:</strong> {persona.speakingStyle}</p>
                  <p className="text-sm text-purple-700 mt-2"><strong>Alternative idea:</strong> {persona.alternativeIdea}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Simulated Discussion Transcript</h3>
              {speechSupported && (
                <button
                  type="button"
                  onClick={() => speakText(result.transcript)}
                  className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Play Full Audio
                </button>
              )}
            </div>
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-sm text-blue-800"><strong>You:</strong> {story}</p>
              </div>
              {result.conversation.map((entry, index) => (
                <div key={`${entry.speaker}-${index}`} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="font-semibold text-gray-800">{entry.speaker}</span>
                    <span>Round {entry.round}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{entry.message}</p>
                  {speechSupported && (
                    <div className="mt-2 flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => speakText(`${entry.speaker} कह रहे हैं: ${entry.message}`)}
                        className="px-2 py-1 bg-gray-200 rounded"
                      >
                        Speak
                      </button>
                      <button
                        type="button"
                        onClick={stopSpeaking}
                        className="px-2 py-1 bg-gray-100 border rounded"
                      >
                        Stop
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Assessor Summary</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900">Consensus</h4>
                <p>{result.summary.consensus}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Standout Moments</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.summary.standoutMoments.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.summary.recommendations.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Follow-up Questions</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.summary.followUpQuestions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AIGDPractice;
