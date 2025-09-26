import React from 'react';

const EmotionDisplay = ({ currentEmotion, emotionConfidence, emotionHistory, getEmotionStats }) => {
  const getEmotionEmoji = (emotion) => {
    const emojiMap = {
      happy: '😊',
      sad: '😔',
      neutral: '😐',
      focused: '🤔',
      confused: '😕',
      surprised: '😲',
      angry: '😠',
      excited: '😃'
    };
    return emojiMap[emotion] || '😐';
  };

  const getEmotionColor = (emotion) => {
    const colorMap = {
      happy: '#10b981',
      sad: '#3b82f6',
      neutral: '#6b7280',
      focused: '#8b5cf6',
      confused: '#f59e0b',
      surprised: '#ef4444',
      angry: '#dc2626',
      excited: '#06d6a0'
    };
    return colorMap[emotion] || '#6b7280';
  };

  const emotionStats = getEmotionStats();
  const recentEmotions = emotionHistory.slice(-10); // Last 10 emotions

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Current Emotion */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '8px',
          animation: emotionConfidence > 0.8 ? 'pulse 2s infinite' : 'none'
        }}>
          {currentEmotion ? getEmotionEmoji(currentEmotion) : '😐'}
        </div>
        <h3 style={{
          margin: 0,
          fontSize: '1.2rem',
          fontWeight: '700',
          color: currentEmotion ? getEmotionColor(currentEmotion) : '#6b7280',
          textTransform: 'capitalize'
        }}>
          {currentEmotion || 'Detecting...'}
        </h3>
        {emotionConfidence > 0 && (
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            Confidence: {Math.round(emotionConfidence * 100)}%
          </div>
        )}
      </div>

      {/* Emotion Timeline */}
      {recentEmotions.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ 
            fontSize: '14px', 
            color: '#374151', 
            fontWeight: '600', 
            marginBottom: '12px' 
          }}>
            🕒 Recent Emotions
          </h4>
          <div style={{
            display: 'flex',
            gap: '4px',
            overflow: 'hidden',
            padding: '8px',
            background: 'rgba(243, 244, 246, 0.5)',
            borderRadius: '8px'
          }}>
            {recentEmotions.map((emotion, index) => (
              <div
                key={index}
                style={{
                  fontSize: '20px',
                  opacity: 0.3 + (index / recentEmotions.length) * 0.7,
                  transition: 'all 0.3s ease'
                }}
                title={`${emotion.emotion} (${Math.round(emotion.confidence * 100)}%)`}
              >
                {getEmotionEmoji(emotion.emotion)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emotion Statistics */}
      {emotionStats && (
        <div>
          <h4 style={{ 
            fontSize: '14px', 
            color: '#374151', 
            fontWeight: '600', 
            marginBottom: '12px' 
          }}>
            📊 Session Analysis
          </h4>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>Mood Score</span>
              <span style={{ 
                fontSize: '13px', 
                fontWeight: '600',
                color: emotionStats.moodScore > 60 ? '#10b981' : emotionStats.moodScore < 40 ? '#ef4444' : '#f59e0b'
              }}>
                {Math.round(emotionStats.moodScore)}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              background: '#e5e7eb',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${emotionStats.moodScore}%`,
                height: '100%',
                background: emotionStats.moodScore > 60 ? '#10b981' : emotionStats.moodScore < 40 ? '#ef4444' : '#f59e0b',
                borderRadius: '3px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            <div>
              <strong>Dominant:</strong> {getEmotionEmoji(emotionStats.dominantEmotion)} {emotionStats.dominantEmotion}
            </div>
            <div>
              <strong>Detections:</strong> {emotionStats.totalDetections}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default EmotionDisplay;