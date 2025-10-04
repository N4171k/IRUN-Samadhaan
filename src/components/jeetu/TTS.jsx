import { useEffect, useRef, useState } from 'react';
import { useJeetuInterview } from '../../contexts/JeetuInterviewContext';

function TTS() {
  const {
    pendingSpeech,
    notifySpeechStart,
    notifySpeechEnd,
    registerTtsControls,
    cancelSpeech
  } = useJeetuInterview();

  const [supported, setSupported] = useState(true);
  const [status, setStatus] = useState('Idle');
  const utteranceRef = useRef(null);
  const speakingPromiseRef = useRef(null);

  const stopCurrentSpeech = () => {
    if (!('speechSynthesis' in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
  };

  const speak = (text) => {
    if (!text) {
      return Promise.resolve();
    }
    if (!('speechSynthesis' in window)) {
      setSupported(false);
      return Promise.resolve();
    }

    stopCurrentSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setStatus('Speaking');
      notifySpeechStart();
    };

    const cleanup = () => {
      setStatus('Idle');
      notifySpeechEnd();
      utteranceRef.current = null;
      speakingPromiseRef.current = null;
    };

    utterance.onend = cleanup;
    utterance.onerror = (event) => {
      console.warn('[TTS] Speech synthesis error', event);
      cleanup();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    const promise = new Promise((resolve) => {
      utterance.onend = () => {
        cleanup();
        resolve();
      };
      utterance.onerror = () => {
        cleanup();
        resolve();
      };
    });

    speakingPromiseRef.current = promise;
    return promise;
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      setSupported(false);
      return;
    }

    registerTtsControls({
      speak,
      cancel: stopCurrentSpeech
    });

    return () => {
      stopCurrentSpeech();
    };
  }, [registerTtsControls]);

  useEffect(() => {
    if (pendingSpeech) {
      setStatus('Queueing');
      speak(pendingSpeech);
    }
  }, [pendingSpeech]);

  return (
    <div className="mock-tts">
      <span className="mock-tts-status">Voice: {supported ? status : 'Not supported'}</span>
      {supported && (
        <button type="button" className="mock-link-button" onClick={cancelSpeech}>
          Stop voice
        </button>
      )}
    </div>
  );
}

export default TTS;
