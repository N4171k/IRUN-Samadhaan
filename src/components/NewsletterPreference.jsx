import React, { useState } from 'react';

function NewsletterPreference({ onPreferenceChange }) {
  const [wantsNewsletter, setWantsNewsletter] = useState(false);
  const [sendTime, setSendTime] = useState('08:00');
  const [customTime, setCustomTime] = useState(false);

  const handleNewsletterToggle = (e) => {
    const value = e.target.checked;
    setWantsNewsletter(value);
    onPreferenceChange({ wantsNewsletter: value, sendTime });
  };

  const handleTimeChange = (e) => {
    const value = e.target.value;
    setSendTime(value);
    onPreferenceChange({ wantsNewsletter, sendTime: value });
  };

  const handleCustomTimeToggle = (e) => {
    const value = e.target.checked;
    setCustomTime(value);
    if (!value) {
      // Reset to default time when switching back to default
      setSendTime('08:00');
      onPreferenceChange({ wantsNewsletter, sendTime: '08:00' });
    }
  };

  return (
    <div className="newsletter-preference glassmorphic-card">
      <div className="preference-header">
        <h3 className="preference-title">Daily Current Affairs Newsletter</h3>
        <p className="preference-description">
          Stay updated with relevant military news, defense technology, and geopolitical insights
        </p>
      </div>

      <div className="preference-toggle">
        <div className="toggle-container">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={wantsNewsletter}
              onChange={handleNewsletterToggle}
              className="toggle-input"
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">
              {wantsNewsletter ? 'Enabled' : 'Enable Daily Newsletter'}
            </span>
          </label>
        </div>
      </div>

      {wantsNewsletter && (
        <div className="time-preference">
          <div className="time-toggle">
            <label className="time-toggle-label">
              <input
                type="checkbox"
                checked={customTime}
                onChange={handleCustomTimeToggle}
                className="time-toggle-input"
              />
              <span className="time-toggle-slider"></span>
              <span className="time-toggle-text">
                Custom time (default: 8:00 AM)
              </span>
            </label>
          </div>

          {customTime && (
            <div className="time-selector">
              <label htmlFor="sendTime" className="time-label">
                Select delivery time:
              </label>
              <input
                type="time"
                id="sendTime"
                value={sendTime}
                onChange={handleTimeChange}
                className="time-input"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NewsletterPreference;