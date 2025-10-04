import React from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

function AIRun() {
  const navigate = useNavigate();

  const handleFeatureClick = (featureId) => {
    // Navigate to specific AI feature
    navigate(`/ai-run/${featureId}`);
  };

  const handleLogout = () => {
    // Handle logout logic
    navigate('/login');
  };

  return (
    <div className="ai-run-page">
      <Navbar 
        userDetails={{ name: 'User' }} 
        onLogout={handleLogout}
      />
      
      <div className="ai-run-container">
        <div className="ai-features-grid">
          <div
            className="feature-card large ai-chat-bot-interview"
            onClick={() => handleFeatureClick('ai-chat-bot-interview')}
          >
            <h3>AI Chat Bot</h3>
            <h3>Interview</h3>
          </div>

          <div className="feature-card large note-synthesizer" onClick={() => handleFeatureClick('note-synthesizer')}>
            <h3>Note Synthesizer</h3>
          </div>
          
          <div className="feature-card small micro-learning" onClick={() => handleFeatureClick('micro-learning')}>
            <h3>Micro</h3>
            <h3>Learning</h3>
          </div>
          
          <div className="feature-card small study-plan" onClick={() => handleFeatureClick('study-plan')}>
            <h3>Study Plan</h3>
            <h3>Generator</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIRun;