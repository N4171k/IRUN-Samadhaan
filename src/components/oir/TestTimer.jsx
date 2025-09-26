import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

const TestTimer = ({ 
  totalTimeInMinutes, 
  timeRemaining: externalTimeRemaining,
  totalQuestions,
  currentQuestionIndex,
  onTimeUp, 
  isActive = true, 
  showWarnings = true 
}) => {
  const [internalTimeRemaining, setInternalTimeRemaining] = useState(
    externalTimeRemaining !== undefined ? externalTimeRemaining : totalTimeInMinutes * 60
  );
  const [showWarning, setShowWarning] = useState(false);
  
  // Use external timeRemaining if provided, otherwise use internal state
  const timeRemaining = externalTimeRemaining !== undefined ? externalTimeRemaining : internalTimeRemaining;

  useEffect(() => {
    if (!isActive || externalTimeRemaining !== undefined) return; // Don't run timer if external time is provided

    const timer = setInterval(() => {
      setInternalTimeRemaining(prev => {
        if (prev <= 1) {
          if (onTimeUp) onTimeUp();
          return 0;
        }
        
        // Show warning when 5 minutes or 25% time remaining (whichever is less)
        const warningThreshold = Math.min(300, safeTotalSeconds * 0.25);
        if (showWarnings && prev <= warningThreshold && prev > warningThreshold - 1) {
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 3000); // Hide warning after 3 seconds
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, totalTimeInMinutes, onTimeUp, showWarnings, externalTimeRemaining]);

  // Safety checks to prevent NaN values
  const safeTimeInMinutes = totalTimeInMinutes && !isNaN(totalTimeInMinutes) ? totalTimeInMinutes : 30;
  const safeTotalSeconds = safeTimeInMinutes * 60;
  
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (!timeRemaining || isNaN(timeRemaining) || !safeTotalSeconds) return 'text-gray-600';
    const percentageRemaining = (timeRemaining / safeTotalSeconds) * 100;
    
    if (percentageRemaining > 50) return 'text-green-600';
    if (percentageRemaining > 25) return 'text-yellow-600';
    if (percentageRemaining > 10) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressPercentage = () => {
    if (!timeRemaining || isNaN(timeRemaining) || !safeTotalSeconds) return 0;
    return ((safeTotalSeconds - timeRemaining) / safeTotalSeconds) * 100;
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      {/* Warning Alert */}
      {showWarning && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-yellow-800 font-medium">
            Time is running out! Please manage your remaining time carefully.
          </span>
        </div>
      )}
      
      {/* Timer Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Clock className={`w-6 h-6 ${getTimeColor()}`} />
          <div>
            <div className={`text-2xl font-bold ${getTimeColor()}`}>
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-gray-500">
              Time Remaining
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">
            Total: {safeTimeInMinutes} minutes
          </div>
          {totalQuestions && currentQuestionIndex !== undefined && (
            <div className="text-xs text-gray-500">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>
          )}
          <div className="text-xs text-gray-500">
            {Math.round(getProgressPercentage())}% elapsed
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              timeRemaining <= 300 ? 'bg-red-500' :
              timeRemaining <= 600 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>
      
      {/* Status Text */}
      <div className="mt-2 text-center">
        {timeRemaining <= 60 && (
          <span className="text-xs text-red-600 font-medium animate-pulse">
            ⚠️ Final minute! Submit your answers now!
          </span>
        )}
        {timeRemaining > 60 && timeRemaining <= 300 && (
          <span className="text-xs text-yellow-600 font-medium">
            ⏰ Less than 5 minutes remaining
          </span>
        )}
        {timeRemaining > 300 && (
          <span className="text-xs text-gray-500">
            📝 Test in progress
          </span>
        )}
      </div>
    </div>
  );
};

export default TestTimer;