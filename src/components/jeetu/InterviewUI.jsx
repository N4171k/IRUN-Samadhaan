import { useEffect, useMemo, useRef, useState } from 'react';
import Avatar from './Avatar';
import CameraFeed from './CameraFeed';
import STT from './STT';
import TTS from './TTS';
import { useJeetuInterview } from '../../contexts/JeetuInterviewContext';

const STATUS_MAP = {
  idle: { label: 'Ready', variant: 'ready' },
  connecting: { label: 'Connecting…', variant: 'connecting' },
  streaming: { label: 'Live', variant: 'live' },
  error: { label: 'Offline', variant: 'error' }
};

function InterviewUI() {
  const {
    aiResponse,
    candidateInput,
    wsStatus,
    avatarState,
    transcriptHistory,
    connectionError,
    clearHistory,
    cancelSpeech,
    resetConnection,
    handleCandidateTurn,
    hasInterviewStarted,
    requestStopListening
  } = useJeetuInterview();

  const captionsRef = useRef(null);
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    if (captionsRef.current) {
      captionsRef.current.scrollTop = captionsRef.current.scrollHeight;
    }
  }, [aiResponse]);

  const statusBadge = useMemo(() => STATUS_MAP[wsStatus] || STATUS_MAP.idle, [wsStatus]);

  const handleManualSubmit = () => {
    const trimmed = manualInput.trim();
    if (!trimmed) {
      return;
    }
    requestStopListening();
    handleCandidateTurn(trimmed);
    setManualInput('');
  };

  return (
    <div className="mock-interview-grid">
      <div className="mock-interview-stack">
        <div className="mock-card mock-card--mentor">
          <div className="mock-card-header">
            <div>
              <p className="mock-card-subtitle">Your mentor</p>
              <h2 className="mock-card-title">Jeetu Bhaiya</h2>
            </div>
            <span className={`mock-status-pill mock-status-pill--${statusBadge.variant}`}>
              {statusBadge.label}
            </span>
          </div>

          <div className="mock-avatar-shell">
            <Avatar />
          </div>

          <div className="mock-caption-card">
            <div className="mock-caption-header">
              <h3>Live captions</h3>
              <button
                type="button"
                className="mock-link-button"
                onClick={() => {
                  cancelSpeech();
                  resetConnection();
                  clearHistory();
                }}
              >
                Reset turn
              </button>
            </div>
            <div ref={captionsRef} className="mock-caption-body">
              {aiResponse ? <p>{aiResponse}</p> : <p className="mock-empty-state">Awaiting your introduction…</p>}
            </div>
            <TTS />
          </div>
        </div>

        <div className="mock-card">
          <div className="mock-card-header">
            <div>
              <p className="mock-card-subtitle">Conversation log</p>
              <h3 className="mock-card-title">Session transcript</h3>
            </div>
            {transcriptHistory.length > 0 && (
              <button type="button" className="mock-link-button" onClick={clearHistory}>
                Clear log
              </button>
            )}
          </div>
          <div className="mock-history">
            {transcriptHistory.length === 0 ? (
              <p className="mock-empty-state">Your dialogue with Jeetu Bhaiya will appear here.</p>
            ) : (
              transcriptHistory.map((entry, index) => (
                <div
                  key={`${entry.role}-${index}`}
                  className={`mock-history-entry ${entry.role === 'assistant' ? 'is-mentor' : 'is-candidate'}`}
                >
                  <span className="mock-history-label">{entry.role === 'assistant' ? 'Jeetu' : 'You'}</span>
                  <p>{entry.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mock-interview-stack">
        <div className="mock-card mock-card--camera">
          <div className="mock-card-header">
            <div>
              <p className="mock-card-subtitle">Your setup</p>
              <h2 className="mock-card-title">Candidate camera</h2>
            </div>
            <span className="mock-avatar-state">Avatar: {avatarState}</span>
          </div>
          <p className="mock-card-description">
            Hit record, share your thoughts, and Jeetu will follow up with relevant questions. Two seconds of silence will
            automatically stop the recording.
          </p>

          <CameraFeed
            onRecordingStop={(blob) => {
              if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
                console.info('[JeetuBhaiya] STT fallback blob available', blob.size);
              }
            }}
          />

          <div className="mock-transcript">
            <span className="mock-transcript-label">Latest words</span>
            <p>{candidateInput || 'Waiting for your cue…'}</p>
          </div>

          <STT />

          {connectionError && <p className="mock-error">{connectionError}</p>}
        </div>

        <div className="mock-card">
          <div className="mock-card-header">
            <div>
              <p className="mock-card-subtitle">Alternative input</p>
              <h3 className="mock-card-title">Type your response</h3>
            </div>
          </div>
          <p className="mock-card-description">
            Prefer typing? Enter your response below and hit send. You can switch between speaking and typing at any
            time, just remember to begin with <strong>START</strong> when you&apos;re ready to kick off the interview.
          </p>
          <div className="mock-manual-input">
            <textarea
              value={manualInput}
              onChange={(event) => setManualInput(event.target.value)}
              placeholder={hasInterviewStarted ? 'Type your next answer here…' : 'Type START to begin the interview…'}
              rows={4}
              onKeyDown={(event) => {
                const isModifier = event.ctrlKey || event.metaKey;
                if (isModifier && event.key === 'Enter') {
                  event.preventDefault();
                  handleManualSubmit();
                }
              }}
            />
            <div className="mock-manual-actions">
              <button
                type="button"
                className="mock-manual-send"
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
              >
                Send response
              </button>
              <span className="mock-manual-hint">Press Enter while holding Ctrl (or Cmd) to send quickly.</span>
            </div>
          </div>
        </div>

        <div className="mock-card">
          <div className="mock-card-header">
            <div>
              <p className="mock-card-subtitle">Warm-up ideas</p>
              <h3 className="mock-card-title">Suggested prompts</h3>
            </div>
          </div>
          <ul className="mock-prompts">
            <li>
              Introduce yourself as if you&apos;re meeting the SSB panel for the first time.
            </li>
            <li>
              Why do you want to join the defence services? Highlight your motivation and values.
            </li>
            <li>
              Share a story where you led a team under pressure and what you learnt from it.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default InterviewUI;
