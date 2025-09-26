import React from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

function AIRun() {
  const navigate = useNavigate();

  const aiFeatures = [
    {
      id: 'note-synthesizer',
      title: 'Note Synthesizer',
      description: 'AI-powered note compilation and synthesis',
      className: 'note-synthesizer',
      size: 'large'
    },
    {
      id: 'ai-mock-interview',
      title: 'AI SSB Mock Interview',
      description: 'Practice with AI-powered mock interviews',
      className: 'ai-mock-interview',
      size: 'large'
    },
    {
      id: 'micro-learning',
      title: 'Micro Learning',
      description: 'Bite-sized learning modules',
      className: 'micro-learning',
      size: 'small'
    },
    {
      id: 'study-plan',
      title: 'Study Plan Generator',
      description: 'AI-generated personalized study plans',
      className: 'study-plan',
      size: 'small'
    },
    {
      id: 'mentor-chat',
      title: 'Meet Your own Jeetu Bhaiya',
      description: 'Chat with your AI mentor',
      className: 'mentor-chat',
      size: 'large',
      hasAvatar: true
    }
  ];

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
          <div className="feature-card large note-synthesizer" onClick={() => handleFeatureClick('note-synthesizer')}>
            <h3>Note Synthesizer</h3>
          </div>
          
          <div className="feature-card large ai-mock-interview" onClick={() => handleFeatureClick('ai-mock-interview')}>
            <div className="interview-content">
              <h3>AI SSB</h3>
              <h3>Mock Interview</h3>
            </div>
            
            <div className="mentor-section">
              <div className="mentor-content">
                <div className="mentor-text">
                  <h3>Meet</h3>
                  <h3>Your own</h3>
                  <h4 className="mentor-name">Jeetu Bhaiya</h4>
                </div>
                <div className="mentor-avatar">
                  <img src="/avatar.png" alt="Jeetu Bhaiya" className="avatar-image" />
                </div>
              </div>
            </div>
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