import React, { useEffect } from 'react';

const Loader = () => {
  useEffect(() => {
    const runLine = document.getElementById('run-line');

    if (runLine && typeof runLine.getTotalLength === 'function') {
      const length = runLine.getTotalLength();
      runLine.style.strokeDasharray = `${length}`;
      runLine.style.strokeDashoffset = `${length}`;
    }
  }, []);

  return (
    <div className="loader-container" aria-live="polite" aria-busy="true" role="status">
      <svg
        id="irun-loader"
        width="240"
        height="100"
        viewBox="0 0 260 90"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>IRUN Samadhaan loading indicator</title>
        <g id="logo-icon">
          <path
            d="M43.6,23.1c-1.8-2.1-4.2-3.7-6.9-4.5c-2.3-0.7-4.7-0.7-7,0.1c-3.1,1.1-5.7,3-7.7,5.5c-1.5,1.9-2.5,4.1-3,6.5
                    c-0.6,2.9-0.2,5.9,1,8.6c1.1,2.4,2.8,4.5,4.9,6.1c1.8,1.4,3.9,2.4,6.1,2.9c2.4,0.5,4.9,0.4,7.2-0.5c3.2-1.2,5.9-3.4,7.8-6.1
                    c1.5-2.1,2.4-4.5,2.6-7.1c0.1-1.3,0-2.6-0.3-3.9C52.1,34.4,49.2,28.2,43.6,23.1z"
            fill="#4285F4"
          />
          <path
            d="M29.9,24.2c-1.3,0-2.5,0.6-3.3,1.6c-0.8,1-1.2,2.3-1,3.6c0.2,1.7,1.2,3.1,2.6,3.9c1.6,0.9,3.6,0.8,5-0.4
                    c1.1-0.9,1.8-2.2,1.9-3.6c0.1-1.8-0.8-3.5-2.4-4.4C31.5,24.4,30.7,24.2,29.9,24.2z"
            fill="#FFFFFF"
          />

          <circle id="brain-pulse-dot" cx="29.9" cy="28.9" r="2.5" fill="#4285F4" />

          <path
            id="lightbulb-glow"
            d="M45.8,18.5c2.7,0.8,5.1,2.4,6.9,4.5c5.6,5.1,8.5,11.3,7.9,18.1c-0.2,2.6-1.1,5-2.6,7.1c-1.9,2.7-4.6,4.9-7.8,6.1
                    c-0.8,0.3-1.6,0.5-2.4,0.7v10.5c0,1.9-1.5,3.4-3.4,3.4h-0.1c-1.9,0-3.4-1.5-3.4-3.4V54.4c-0.4,0-0.8-0.1-1.2-0.2
                    c-3.1-0.7-5.8-2.4-7.9-4.9L45.8,18.5z"
            fill="#FBBC05"
          />
          <rect x="36.5" y="66" width="13" height="3" rx="1.5" fill="#4285F4" />
          <rect x="39" y="71" width="8" height="3" rx="1.5" fill="#4285F4" />
        </g>

        <g
          id="logo-text"
          fill="#ffffffff"
          fontFamily="'Inter', Arial, sans-serif"
          fontSize="48"
          fontWeight="bold"
        >
          <path d="M89,64.5V36.8h11.2V64.5H89z" />
          <circle cx="94.5" cy="22.5" r="5.5" fill="#FBBC05" />

          <text x="110" y="65">R</text>
          <text x="148" y="65">U</text>
          <text x="187" y="65">N</text>

          <path
            id="run-line"
            d="M85,73 C130,73 140,80 180,80 C210,80 220,73 255,73"
            stroke="#ffffffff"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};

export default Loader;
