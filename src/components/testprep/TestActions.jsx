import React from 'react';

function TestActions({ onCreateTest, onViewPerformance, onChatWithMentor, selectedSubject = null }) {
  return (
    <div className="right-section">
      <CreateTestButton 
        onClick={onCreateTest} 
        selectedSubject={selectedSubject}
      />
      <YourPerformance 
        onClick={onViewPerformance}
        selectedSubject={selectedSubject}
      />
      <ChatWithMentorButton 
        onClick={onChatWithMentor}
      />
    </div>
  );
}

function CreateTestButton({ onClick, selectedSubject }) {
  const isDisabled = !selectedSubject;
  
  return (
    <div className="test-section">
      <div className="section-label">
        <span>Create Custom Test</span>
      </div>
      <div 
        className={`test-button ${isDisabled ? 'disabled' : ''}`}
        onClick={!isDisabled ? onClick : undefined}
        role="button"
        tabIndex={!isDisabled ? 0 : -1}
        onKeyDown={(e) => e.key === 'Enter' && !isDisabled && onClick && onClick()}
      >
        <div className="button-content">
          <div className="button-icon">
            <span>📝</span>
          </div>
          <div className="button-text">
            <span className="primary-text">
              {selectedSubject 
                ? `Create ${selectedSubject.name} Test` 
                : 'Select Subject First'
              }
            </span>
            <span className="secondary-text">
              {selectedSubject 
                ? 'Build your custom practice test'
                : 'Choose a subject to create test'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function YourPerformance({ onClick, selectedSubject, performanceData = null }) {
  // Mock performance data based on selected subject
  const getSubjectPerformance = () => {
    if (!selectedSubject) return null;
    
    const performances = {
      'english': { score: 78, tests: 12, improvement: '+5%', trend: 'up' },
      'general-knowledge': { score: 85, tests: 8, improvement: '+12%', trend: 'up' },
      'elementary-mathematics': { score: 72, tests: 15, improvement: '-2%', trend: 'down' }
    };
    
    return performances[selectedSubject.id];
  };

  const performance = performanceData || getSubjectPerformance();

  return (
    <div className="performance-section">
      <div className="section-label">
        <span>Your Performance</span>
        {selectedSubject && (
          <span className="subject-tag">{selectedSubject.name}</span>
        )}
      </div>
      
      <div 
        className="performance-card"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick && onClick()}
      >
        {performance ? (
          <div className="performance-content">
            <div className="performance-main">
              <div className="score-display">
                <span className="score-number">{performance.score}%</span>
                <span className="score-label">Average Score</span>
              </div>
              
              <div className="performance-stats">
                <div className="stat">
                  <span className="stat-value">{performance.tests}</span>
                  <span className="stat-label">Tests Taken</span>
                </div>
                
                <div className="stat">
                  <span className={`stat-value ${performance.trend}`}>
                    {performance.improvement}
                  </span>
                  <span className="stat-label">This Month</span>
                </div>
              </div>
            </div>
            
            <div className="performance-chart">
              <div className="chart-placeholder">
                <span>📈</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="performance-placeholder">
            <div className="placeholder-content">
              <span className="placeholder-icon">📈</span>
              <span className="placeholder-text">
                {selectedSubject 
                  ? `No ${selectedSubject.name} performance data yet`
                  : 'Select a subject to view performance'
                }
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatWithMentorButton({ onClick }) {
  return (
    <div className="mentor-section">
      <div className="section-label">
        <span>Get Help</span>
      </div>
      
      <div 
        className="mentor-button"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick && onClick()}
      >
        <div className="mentor-content">
          <div className="mentor-icon">
            <span>👨‍🏫</span>
          </div>
          
          <div className="mentor-text">
            <span className="mentor-title">CHAT WITH MENTOR</span>
            <span className="mentor-subtitle">Get instant help & guidance</span>
          </div>
          
          <div className="mentor-indicator">
            <div className="online-dot"></div>
            <span>Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestActions;
export { CreateTestButton, YourPerformance, ChatWithMentorButton };