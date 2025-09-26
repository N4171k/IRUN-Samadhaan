import React, { useRef, useEffect, useState } from 'react';

const CameraPreview = ({ isActive, onCameraReady }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('inactive'); // inactive, requesting, active, error
  const [error, setError] = useState(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

  const startCamera = async () => {
    try {
      setCameraStatus('requesting');
      setError(null);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user' // Front-facing camera
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraStatus('active');
        
        if (onCameraReady) {
          onCameraReady(videoRef.current);
        }
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraStatus('error');
      setError(err.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraStatus('inactive');
  };

  const getStatusColor = () => {
    switch (cameraStatus) {
      case 'active': return '#10b981';
      case 'requesting': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (cameraStatus) {
      case 'active': return 'Camera Active 🔴';
      case 'requesting': return 'Requesting Camera Access...';
      case 'error': return `Camera Error: ${error}`;
      default: return 'Camera Inactive';
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1.2rem',
          fontWeight: '700',
          color: '#1f2937'
        }}>
          📹 Camera Feed
        </h3>
        <div style={{
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          color: getStatusColor(),
          background: `${getStatusColor()}20`,
          border: `1px solid ${getStatusColor()}40`
        }}>
          {getStatusText()}
        </div>
      </div>

      {/* Camera Feed */}
      <div style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#000',
        aspectRatio: '4/3',
        maxWidth: '400px'
      }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: cameraStatus === 'active' ? 'block' : 'none'
          }}
          playsInline
          muted
        />
        
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            display: 'none' // Hidden, used for AI processing
          }}
        />

        {/* Placeholder when camera is not active */}
        {cameraStatus !== 'active' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#9ca3af',
            background: '#1f2937'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
              {cameraStatus === 'requesting' ? '⏳' : 
               cameraStatus === 'error' ? '❌' : '📹'}
            </div>
            <div style={{ fontSize: '14px', textAlign: 'center', padding: '0 20px' }}>
              {cameraStatus === 'requesting' ? 'Please allow camera access...' :
               cameraStatus === 'error' ? 'Camera access denied or unavailable' :
               'Camera feed will appear here when monitoring is active'}
            </div>
          </div>
        )}

        {/* AI Processing Indicator */}
        {cameraStatus === 'active' && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '6px 10px',
            borderRadius: '8px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#10b981',
            fontSize: '11px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#10b981',
              animation: 'pulse 2s infinite'
            }}></div>
            AI MONITORING
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#1e40af',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>🔒</span>
          <strong>Privacy:</strong> All video processing happens locally in your browser. No video is transmitted or stored.
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default CameraPreview;