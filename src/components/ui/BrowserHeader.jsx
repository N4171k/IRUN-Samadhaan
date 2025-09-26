import React from 'react';

function BrowserHeader({ activeTab = "Test your prep" }) {
  const tabs = [
    { name: "Home", active: false },
    { name: "Community", active: false },
    { name: "SSB Drills", active: false },
    { name: "Test your prep", active: true }
  ];

  return (
    <div className="browser-header">
      {/* Browser Tabs */}
      <div className="browser-tabs">
        {tabs.map((tab, index) => (
          <div 
            key={index}
            className={`browser-tab ${tab.name === activeTab ? 'active-tab' : ''}`}
          >
            <span>{tab.name}</span>
          </div>
        ))}
      </div>
      
      {/* Browser Controls */}
      <div className="browser-controls">
        <div className="ai-run-badge">
          <span>AI-RUN</span>
        </div>
        <div className="nele-toggle">
          <span>NELE</span>
          <div className="toggle-switch">
            <div className="toggle-circle"></div>
          </div>
        </div>
        <div className="browser-close">
          <span>×</span>
        </div>
      </div>
    </div>
  );
}

export default BrowserHeader;