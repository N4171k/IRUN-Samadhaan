import React, { useState, useEffect } from 'react';
import { X, Brain, Target, Clock, AlertTriangle } from 'lucide-react';

const DistractionPopup = ({ 
  isVisible, 
  onClose, 
  onStartQuiz, 
  violationType, 
  distractionCount 
}) => {
  const [countdown, setCountdown] = useState(15);
  const [autoClose, setAutoClose] = useState(true);

  useEffect(() => {
    if (!isVisible) {
      setCountdown(15);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1 && autoClose) {
          onClose();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, onClose, autoClose]);

  const getViolationMessage = () => {
    switch (violationType) {
      case 'no-face':
        return "I noticed you stepped away from the camera";
      case 'multiple-faces':
        return "I detected multiple people in the frame";
      case 'looking-away':
        return "I saw that you were looking away from the screen";
      default:
        return "I noticed you might be distracted";
    }
  };

  const getViolationIcon = () => {
    switch (violationType) {
      case 'no-face':
        return <AlertTriangle className="w-8 h-8 text-red-400" />;
      case 'multiple-faces':
        return <AlertTriangle className="w-8 h-8 text-orange-400" />;
      case 'looking-away':
        return <AlertTriangle className="w-8 h-8 text-yellow-400" />;
      default:
        return <Brain className="w-8 h-8 text-blue-400" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="glassmorphic-distraction-popup">
        {/* Header */}
        <div className="glassmorphic-popup-header">
          <div className="flex items-center gap-3">
            {getViolationIcon()}
            <div>
              <h2 className="text-xl font-bold text-gray-800">Hey there! 👋</h2>
              <p className="text-sm text-gray-600">NELE AI Assistant</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="glassmorphic-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="glassmorphic-popup-content">
          <div className="text-center mb-6">
            <p className="text-lg text-gray-700 mb-2">
              {getViolationMessage()}
            </p>
            <p className="text-gray-600">
              How about we take a quick break and test your knowledge?
            </p>
          </div>

          {/* Stats */}
          <div className="glassmorphic-stats-row">
            <div className="glassmorphic-stat-item">
              <Target className="w-5 h-5 text-blue-500" />
              <div>
                <span className="block text-lg font-bold text-gray-800">{distractionCount}</span>
                <span className="text-xs text-gray-600">Distractions</span>
              </div>
            </div>
            <div className="glassmorphic-stat-item">
              <Brain className="w-5 h-5 text-purple-500" />
              <div>
                <span className="block text-lg font-bold text-gray-800">AI</span>
                <span className="text-xs text-gray-600">Monitoring</span>
              </div>
            </div>
          </div>

          {/* Countdown */}
          {autoClose && (
            <div className="glassmorphic-countdown">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Auto-closing in {countdown}s
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="glassmorphic-popup-actions">
            <button
              onClick={() => setAutoClose(!autoClose)}
              className="glassmorphic-secondary-btn"
            >
              {autoClose ? 'Disable Auto-close' : 'Enable Auto-close'}
            </button>
            
            <button
              onClick={onStartQuiz}
              className="glassmorphic-primary-btn"
            >
              <Brain className="w-4 h-4" />
              Start Quick Quiz
            </button>
          </div>

          {/* Footer */}
          <div className="glassmorphic-popup-footer">
            <p className="text-xs text-gray-500 text-center">
              This helps improve your focus and learning experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistractionPopup;