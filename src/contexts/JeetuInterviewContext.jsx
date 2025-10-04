import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE_URL, SOCKET_BASE_URL } from '../config/env';

const JeetuInterviewContext = createContext(null);

function normaliseWsUrl(pathname) {
  const base = SOCKET_BASE_URL || API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  if (!base) {
    return pathname;
  }

  try {
    const baseUrl = new URL(base);
    baseUrl.protocol = baseUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    baseUrl.pathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return baseUrl.toString();
  } catch (error) {
    console.warn('[JeetuInterview] Failed to parse socket URL', base, error);
    return pathname;
  }
}

export function JeetuInterviewProvider({ children }) {
  const WELCOME_MESSAGE = 'Hello, welcome to IRUN INTERVIEW. I am Jeetu. Say START to start your interview.';

  const [avatarState, setAvatarState] = useState('still');
  const [aiResponse, setAiResponse] = useState('');
  const [candidateInput, setCandidateInput] = useState('');
  const [wsStatus, setWsStatus] = useState('idle');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pendingSpeech, setPendingSpeech] = useState('');
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [connectionError, setConnectionError] = useState(null);
  const [hasInterviewStarted, setHasInterviewStarted] = useState(false);

  const wsRef = useRef(null);
  const aiResponseRef = useRef('');
  const historyRef = useRef([]);
  const sessionIdRef = useRef(null);
  const sttControlsRef = useRef({
    start: null,
    stop: null,
    supported: true
  });
  const ttsControlsRef = useRef({
    speak: async () => {},
    cancel: () => {}
  });
  const sttReadyRef = useRef(false);

  const initialiseConversation = useCallback(() => {
    const openingHistory = [{ role: 'assistant', content: WELCOME_MESSAGE }];
    historyRef.current = openingHistory;
    setTranscriptHistory(openingHistory);
    setAiResponse(WELCOME_MESSAGE);
    setPendingSpeech(WELCOME_MESSAGE);
    setCandidateInput('');
    setAvatarState('still');
    setIsListening(false);
    setIsSpeaking(false);
    setConnectionError(null);
    setHasInterviewStarted(false);
    sessionIdRef.current = null;
  }, [WELCOME_MESSAGE]);

  useEffect(() => {
    aiResponseRef.current = aiResponse;
  }, [aiResponse]);

  useEffect(() => {
    initialiseConversation();
  }, [initialiseConversation]);

  useEffect(() => () => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'component-unmount');
      wsRef.current = null;
    }
  }, []);

  const resetConnection = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close(1000, 'reset');
      } catch (error) {
        console.warn('[JeetuInterview] Unable to close socket during reset', error);
      }
    }
    wsRef.current = null;
    setWsStatus('idle');
    sessionIdRef.current = null;
    initialiseConversation();
  }, [initialiseConversation]);

  const handleCandidateTurn = useCallback(
    (text) => {
      const trimmed = text?.trim();
      if (!trimmed) {
        return;
      }

      setCandidateInput(trimmed);

      const normalised = trimmed.toLowerCase();
      const cleaned = normalised.replace(/[.!?]/g, '').trim();
      const isStartCommand =
        cleaned === 'start' ||
        cleaned === 'start interview' ||
        cleaned === 'start the interview' ||
        cleaned.startsWith('start ');

      if (!hasInterviewStarted) {
        if (!isStartCommand) {
          setAiResponse('When you are ready, just say "START" and I will begin the interview.');
          setAvatarState('still');
          return;
        }
        setHasInterviewStarted(true);
      }

      const previousHistory = historyRef.current;
      const userEntry = { role: 'user', content: trimmed };
      const optimisticHistory = [...previousHistory, userEntry];
      historyRef.current = optimisticHistory;
      setTranscriptHistory(optimisticHistory);

      setAiResponse('');
      setPendingSpeech('');
      setConnectionError(null);
      setAvatarState('thinking');

      if (wsRef.current) {
        wsRef.current.close(1000, 'new-turn');
        wsRef.current = null;
      }

      const wsUrl = normaliseWsUrl('/ws/interview');
      setWsStatus('connecting');

      let fallbackActivated = false;

      const runHttpFallback = async (cause) => {
        if (fallbackActivated) {
          return;
        }
        fallbackActivated = true;

        const fallbackNotice =
          cause === 'connect-timeout'
            ? 'Realtime channel is unavailable. Using backup mode to continue your interview.'
            : 'Realtime connection dropped. Switching to backup mode.';

        setWsStatus('idle');
        setAvatarState('thinking');
        setConnectionError(fallbackNotice);

        try {
          const response = await fetch(`${API_BASE_URL}/api/interview/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              sessionId: sessionIdRef.current,
              history: previousHistory,
              prompt: trimmed
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP fallback failed with status ${response.status}`);
          }

          const result = await response.json();
          sessionIdRef.current = result.sessionId || sessionIdRef.current;

          const assistantText = result.text || '';
          const nextHistory = Array.isArray(result.history) && result.history.length
            ? result.history
            : (() => {
                const base = [...previousHistory, userEntry];
                if (assistantText) {
                  base.push({ role: 'assistant', content: assistantText });
                }
                return base;
              })();

          historyRef.current = nextHistory;
          setTranscriptHistory(nextHistory);
          setAiResponse(assistantText);
          setPendingSpeech(assistantText);
          setAvatarState(assistantText ? 'speaking' : 'still');
          setConnectionError(null);
        } catch (error) {
          console.error('[JeetuInterview] HTTP fallback failed', error);
          setConnectionError('Interview mentor is unreachable right now. Please try again shortly.');
          setAvatarState('still');
        } finally {
          if (wsRef.current) {
            try {
              wsRef.current.close(4000, 'http-fallback');
            } catch (error) {
              console.warn('[JeetuInterview] Failed to close websocket after fallback', error);
            }
          }
          wsRef.current = null;
        }
      };

      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      const connectTimer = setTimeout(() => {
        runHttpFallback('connect-timeout');
      }, 5000);

      socket.onopen = () => {
        clearTimeout(connectTimer);
        setWsStatus('streaming');
        socket.send(
          JSON.stringify({
            type: 'candidate_message',
            text: trimmed,
            history: previousHistory,
            sessionId: sessionIdRef.current
          })
        );
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case 'status':
              if (data.state) {
                setAvatarState(data.state);
              }
              break;
            case 'chunk': {
              const delta = data.delta || '';
              if (delta) {
                setAiResponse((prev) => prev + delta);
              }
              break;
            }
            case 'complete': {
              const finalText = data.text || aiResponseRef.current;
              setAiResponse(finalText);
              setPendingSpeech(finalText);
              if (Array.isArray(data.history)) {
                historyRef.current = data.history;
                setTranscriptHistory(data.history);
              }
              if (data.sessionId) {
                sessionIdRef.current = data.sessionId;
              }
              setAvatarState('speaking');
              break;
            }
            case 'history':
              if (Array.isArray(data.history)) {
                historyRef.current = data.history;
                setTranscriptHistory(data.history);
              }
              break;
            case 'error':
              setConnectionError(data.message || 'Something went wrong');
              setWsStatus('error');
              setAvatarState('still');
              runHttpFallback('ws-error');
              break;
            default:
              break;
          }
        } catch (error) {
          console.error('[JeetuInterview] Failed to parse socket payload', error);
        }
      };

      socket.onerror = (error) => {
        console.error('[JeetuInterview] WebSocket error', error);
        runHttpFallback('ws-error');
      };

      socket.onclose = (event) => {
        clearTimeout(connectTimer);
        if (event.code !== 1000 && event.code !== 1001) {
          if (!fallbackActivated) {
            setConnectionError('Connection closed unexpectedly');
          }
        }
        setWsStatus('idle');
        wsRef.current = null;
        if (!fallbackActivated && (event.code === 1006 || event.code === 1011)) {
          runHttpFallback('ws-close');
        }
      };
    },
    [hasInterviewStarted]
  );

  const registerSttControls = useCallback((controls) => {
    sttControlsRef.current = controls;
    sttReadyRef.current = Boolean(controls && (controls.start || controls.supported === false));
    setConnectionError(null);
  }, []);

  const registerTtsControls = useCallback((controls) => {
    ttsControlsRef.current = controls;
  }, []);

  const requestStartListening = useCallback(() => {
    if (isSpeaking) {
      return false;
    }
    const controls = sttControlsRef.current;
    if (!sttReadyRef.current || typeof controls.start !== 'function') {
      setConnectionError('Microphone is still initialising or unsupported in this browser. Try again or use typing.');
      return false;
    }
    setConnectionError(null);
    controls.start();
    return true;
  }, [isSpeaking]);

  const requestStopListening = useCallback(() => {
    const controls = sttControlsRef.current;
    if (typeof controls.stop === 'function') {
      controls.stop();
    }
  }, []);

  const notifySpeechStart = useCallback(() => {
    setIsSpeaking(true);
    setAvatarState('speaking');
  }, []);

  const notifySpeechEnd = useCallback(() => {
    setIsSpeaking(false);
    setAvatarState('still');
    setPendingSpeech('');
  }, []);

  const cancelSpeech = useCallback(() => {
    ttsControlsRef.current.cancel?.();
    notifySpeechEnd();
  }, [notifySpeechEnd]);

  const clearHistory = useCallback(() => {
    initialiseConversation();
  }, [initialiseConversation]);

  const value = useMemo(
    () => ({
      avatarState,
      aiResponse,
      candidateInput,
      wsStatus,
      isListening,
      isSpeaking,
      pendingSpeech,
      transcriptHistory,
      connectionError,
      setIsListening,
      handleCandidateTurn,
      registerSttControls,
      registerTtsControls,
      requestStartListening,
      requestStopListening,
      notifySpeechStart,
      notifySpeechEnd,
      cancelSpeech,
      clearHistory,
      resetConnection,
      setCandidateInput,
      setAvatarState,
      hasInterviewStarted
    }),
    [
      avatarState,
      aiResponse,
      candidateInput,
      wsStatus,
      isListening,
      isSpeaking,
      pendingSpeech,
      transcriptHistory,
      connectionError,
      handleCandidateTurn,
      registerSttControls,
      registerTtsControls,
      requestStartListening,
      requestStopListening,
      notifySpeechStart,
      notifySpeechEnd,
      cancelSpeech,
      clearHistory,
      resetConnection,
      setCandidateInput,
      setAvatarState,
      hasInterviewStarted
    ]
  );

  return <JeetuInterviewContext.Provider value={value}>{children}</JeetuInterviewContext.Provider>;
}

export function useJeetuInterview() {
  const context = useContext(JeetuInterviewContext);
  if (!context) {
    throw new Error('useJeetuInterview must be used within a JeetuInterviewProvider');
  }
  return context;
}
