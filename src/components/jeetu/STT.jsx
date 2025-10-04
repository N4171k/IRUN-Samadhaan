import { useEffect, useMemo, useRef, useState } from 'react';
import { useJeetuInterview } from '../../contexts/JeetuInterviewContext';

const IDLE_STATUS = 'Idle';
const LISTENING_STATUS = 'Listening';
const PROCESSING_STATUS = 'Processing';

function STT() {
  const {
    registerSttControls,
    handleCandidateTurn,
    setIsListening,
    setCandidateInput,
    requestStopListening,
    isSpeaking
  } = useJeetuInterview();

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const speakingRef = useRef(isSpeaking);
  const [supported, setSupported] = useState(true);
  const [status, setStatus] = useState(IDLE_STATUS);
  const [interimTranscript, setInterimTranscript] = useState('');

  useEffect(() => {
    speakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

    if (!SpeechRecognition) {
      setSupported(false);
      registerSttControls({
        start: () => {},
        stop: () => {},
        supported: false
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();
        if (result.isFinal) {
          finalText += `${transcript} `;
        } else {
          interimText = transcript;
        }
      }

      if (interimText) {
        setInterimTranscript(interimText);
        setCandidateInput(interimText);
      }

      if (finalText.trim()) {
        finalTranscriptRef.current = finalText.trim();
        setCandidateInput(finalTranscriptRef.current);
        setStatus(PROCESSING_STATUS);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      setStatus((prev) => (prev === LISTENING_STATUS ? PROCESSING_STATUS : prev));
      if (finalTranscriptRef.current) {
        handleCandidateTurn(finalTranscriptRef.current);
        finalTranscriptRef.current = '';
      } else if (!speakingRef.current) {
        setStatus(IDLE_STATUS);
      }
    };

    recognition.onerror = (event) => {
      console.warn('[STT] Speech recognition error', event);
      setStatus(IDLE_STATUS);
      setIsListening(false);
    };

    recognition.onspeechend = () => {
      setStatus(PROCESSING_STATUS);
      recognition.stop();
    };

    recognitionRef.current = recognition;

    const controls = {
      start: () => {
        if (!recognitionRef.current || speakingRef.current) {
          return;
        }
        try {
          finalTranscriptRef.current = '';
          setInterimTranscript('');
          recognitionRef.current.start();
          setStatus(LISTENING_STATUS);
          setIsListening(true);
        } catch (error) {
          console.warn('[STT] Failed to start recognition', error);
        }
      },
      stop: () => {
        try {
          recognitionRef.current?.stop();
        } catch (error) {
          console.warn('[STT] Failed to stop recognition', error);
        }
      },
      supported: true
    };

    registerSttControls(controls);

    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, [handleCandidateTurn, registerSttControls, setIsListening, setCandidateInput]);

  useEffect(() => {
    if (!supported) {
      setStatus('Microphone unsupported');
    }
  }, [supported]);

  const helperText = useMemo(() => {
    if (!supported) return 'Speech recognition not supported in this browser.';
    if (status === LISTENING_STATUS && interimTranscript) return `Heard: ${interimTranscript}`;
    return status;
  }, [interimTranscript, status, supported]);

  const indicatorVariant = useMemo(() => {
    if (!supported) return 'is-disabled';
    if (status === LISTENING_STATUS) return 'is-listening';
    if (status === PROCESSING_STATUS) return 'is-processing';
    return 'is-idle';
  }, [status, supported]);

  return (
    <div className="mock-stt">
      <div className="mock-stt-status">
        <span className={`mock-stt-indicator ${indicatorVariant}`} />
        <span>{helperText}</span>
      </div>
      {supported ? (
        <button type="button" onClick={requestStopListening} className="mock-link-button">
          Stop listening
        </button>
      ) : (
        <p className="mock-stt-help">Enable the Whisper fallback in settings to unlock microphone transcription.</p>
      )}
    </div>
  );
}

export default STT;
