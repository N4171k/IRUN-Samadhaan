import { useEffect, useRef, useState } from 'react';
import { useJeetuInterview } from '../../contexts/JeetuInterviewContext';
import { transcribeWithWhisper } from '../../services/interviewService';

function CameraFeed({ onRecordingStop }) {
  const {
    requestStartListening,
    requestStopListening,
    isSpeaking,
    isListening,
    setIsListening,
    handleCandidateTurn,
    setCandidateInput
  } = useJeetuInterview();

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const silenceStartRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const audioContextRef = useRef(null);

  const [mediaStream, setMediaStream] = useState(null);
  const [recordingState, setRecordingState] = useState('idle'); // idle | recording | paused
  const [downloadUrl, setDownloadUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const startSilenceMonitor = () => {
    if (!mediaStream) return;
    if (audioContextRef.current) return;

    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const source = audioContext.createMediaStreamSource(mediaStream);
      source.connect(analyser);

      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      const dataArray = new Uint8Array(analyser.fftSize);

      const detectSilence = () => {
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i += 1) {
          const value = (dataArray[i] - 128) / 128;
          sum += Math.abs(value);
        }
        const average = sum / dataArray.length;

        if (recordingState === 'recording' && average < 0.015) {
          if (!silenceStartRef.current) {
            silenceStartRef.current = performance.now();
          } else if (performance.now() - silenceStartRef.current > 2000) {
            handleStop('silence');
          }
        } else {
          silenceStartRef.current = null;
        }

        rafRef.current = requestAnimationFrame(detectSilence);
      };

      detectSilence();
    } catch (error) {
      console.warn('[CameraFeed] Unable to initialise silence detection', error);
    }
  };

  const stopSilenceMonitor = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    silenceStartRef.current = null;
  };

  useEffect(() => {
    async function initStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('[CameraFeed] Unable to access media devices', error);
        if (error?.name === 'NotAllowedError') {
          setErrorMessage('Access to camera or microphone was blocked. Allow permissions in your browser and try again.');
        } else if (error?.name === 'NotFoundError') {
          setErrorMessage('No microphone was detected. Plug in a mic or switch to typing.');
        } else {
          setErrorMessage('Unable to access camera or microphone. Check permissions or use the typing option.');
        }
        setIsListening(false);
      }
    }

    initStream();

    return () => {
      stopSilenceMonitor();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaStream?.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mediaStream && videoRef.current && videoRef.current.srcObject !== mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  const handleStart = async () => {
    if (!mediaStream || recordingState === 'recording' || isSpeaking) {
      return;
    }

    try {
      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        if (blob.size > 0) {
          if (downloadUrl) {
            URL.revokeObjectURL(downloadUrl);
          }
          const url = URL.createObjectURL(blob);
          setDownloadUrl(url);
          onRecordingStop?.(blob);
          if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
            transcribeWithWhisper(blob)
              .then((text) => {
                if (text) {
                  setCandidateInput(text);
                  handleCandidateTurn(text);
                }
              })
              .catch((error) => {
                console.warn('[CameraFeed] Whisper fallback failed', error);
                setErrorMessage('Fallback transcription unavailable.');
              });
          }
        }
        chunksRef.current = [];
        stopSilenceMonitor();
        setRecordingState('idle');
        requestStopListening();
        setIsListening(false);
      };

      mediaRecorder.start();
      setRecordingState('recording');
      const listeningStarted = requestStartListening();
      if (!listeningStarted) {
        setErrorMessage('Microphone not ready. Check browser permissions or use the typing option below.');
      }
      startSilenceMonitor();
    } catch (error) {
      console.error('[CameraFeed] Unable to start recording', error);
      setErrorMessage('Unable to start recording. Check your input devices or try typing your response.');
    }
  };

  const handlePause = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      requestStopListening();
      setIsListening(false);
      stopSilenceMonitor();
    }
  };

  const handleResume = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      requestStartListening();
      startSilenceMonitor();
    }
  };

  const handleStop = (reason = 'manual') => {
    if (mediaRecorderRef.current && recordingState !== 'idle') {
      mediaRecorderRef.current.stop();
      setRecordingState('idle');
      if (reason === 'silence') {
        setErrorMessage('Recording stopped after detecting silence.');
      }
    }
  };

  return (
    <div className="mock-camera">
      <div className="mock-camera-frame">
        <video ref={videoRef} className="mock-camera-video" autoPlay playsInline muted />
        {isListening && recordingState === 'recording' && (
          <div className="mock-camera-badge">
            <span className="mock-camera-dot" />
            Listening
          </div>
        )}
      </div>

      <div className="mock-camera-controls">
        <button
          type="button"
          onClick={handleStart}
          className={`mock-camera-button mock-camera-button--record ${
            recordingState === 'recording' || isSpeaking ? 'is-disabled' : ''
          }`}
          disabled={recordingState === 'recording' || isSpeaking}
          title="Record"
        >
          ⏺
        </button>

        <button
          type="button"
          onClick={recordingState === 'paused' ? handleResume : handlePause}
          className={`mock-camera-button mock-camera-button--pause ${recordingState === 'idle' ? 'is-disabled' : ''}`}
          disabled={recordingState === 'idle'}
          title={recordingState === 'paused' ? 'Resume' : 'Pause'}
        >
          {recordingState === 'paused' ? '▶' : '⏸'}
        </button>

        <button
          type="button"
          onClick={() => handleStop('manual')}
          className={`mock-camera-button mock-camera-button--stop ${recordingState === 'idle' ? 'is-disabled' : ''}`}
          disabled={recordingState === 'idle'}
          title="Stop"
        >
          ⏹
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`jeetu-bhaiya-session-${Date.now()}.webm`}
            className="mock-camera-download"
          >
            Download session
          </a>
        )}
      </div>

      {errorMessage && <p className="mock-camera-error">{errorMessage}</p>}
    </div>
  );
}

export default CameraFeed;
