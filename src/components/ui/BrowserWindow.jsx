import React from 'react';

function BrowserWindow({ children, className = "" }) {
  return (
    <div className="browser-container">
      <div className={`browser-window ${className}`}>
        {children}
      </div>
    </div>
  );
}

export default BrowserWindow;