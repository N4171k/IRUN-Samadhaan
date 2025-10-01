import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useLoaderTask } from '../../contexts/LoaderContext';

function NoteSynthesizer() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [synthesizedNotes, setSynthesizedNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const runWithLoader = useLoaderTask();

  const handleSynthesize = async () => {
    if (!notes.trim()) return;
    
    setIsLoading(true);
    try {
      await runWithLoader(async () => new Promise((resolve) => {
        setTimeout(() => {
          setSynthesizedNotes(
            'Synthesized Notes Summary\n\n' +
            'Key Points:\n' +
            '• Main concepts extracted from your notes\n' +
            '• Important details highlighted\n' +
            '• Structured format for better understanding\n\n' +
            'Quick Review:\n' +
            '• Bullet points for easy scanning\n' +
            '• Connections between topics identified\n' +
            '• Action items highlighted\n\n' +
            'Study Tips:\n' +
            '• Focus areas identified\n' +
            '• Memory techniques suggested\n' +
            '• Review schedule recommended'
          );
          resolve();
        }, 2000);
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="ai-feature-page">
      <Navbar 
        userDetails={{ name: 'User' }} 
        onLogout={handleLogout}
      />
      
      <div className="ai-feature-container">
        <div className="feature-header">
          <button className="back-btn" onClick={() => navigate('/ai-run')}>
            ← Back to AI-Run
          </button>
          <h1 className="feature-title">Note Synthesizer</h1>
          <p className="feature-description">
            Transform your scattered notes into organized, structured summaries using AI
          </p>
        </div>

        <div className="synthesizer-workspace">
          <div className="input-section">
            <h3>Your Notes</h3>
            <textarea
              className="notes-input"
              placeholder="Paste your notes here... The AI will help organize and synthesize them into a structured format."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={12}
            />
            <button 
              className={`synthesize-btn ${!notes.trim() ? 'disabled' : ''}`}
              onClick={handleSynthesize}
              disabled={!notes.trim() || isLoading}
            >
              {isLoading ? 'Synthesizing...' : 'Synthesize Notes'}
            </button>
          </div>

          <div className="output-section">
            <h3>Synthesized Output</h3>
            <div className="notes-output">
              {isLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>AI is analyzing and organizing your notes...</p>
                </div>
              ) : synthesizedNotes ? (
                <pre className="synthesized-content">{synthesizedNotes}</pre>
              ) : (
                <div className="empty-state">
                  <p>Your synthesized notes will appear here</p>
                  <p>Add some notes and click "Synthesize Notes" to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteSynthesizer;