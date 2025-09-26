import { useState, useEffect, useRef, useCallback } from 'react';

export const useDistractionDetection = ({
  onDistraction = () => {},
  sensitivity = 'medium',
  enablePersistentChecking = true,
  maxViolationsBeforeAlert = 3
}) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
  const [currentViolations, setCurrentViolations] = useState([]);
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const intervalRef = useRef(null);
  const lastDetectionRef = useRef(Date.now());
  const violationHistoryRef = useRef([]);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      setIsInitializing(true);
      setCameraError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        const video = document.createElement('video');
        video.style.display = 'none';
        video.autoplay = true;
        video.playsInline = true;
        document.body.appendChild(video);
        videoRef.current = video;
      }

      if (!canvasRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        canvas.style.display = 'none';
        document.body.appendChild(canvas);
        canvasRef.current = canvas;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      console.log('NELE: Camera initialized');
      setIsInitializing(false);
      return true;
    } catch (error) {
      console.error('NELE: Camera failed:', error);
      setCameraError(error.message);
      setIsInitializing(false);
      return false;
    }
  }, []);

  // Initialize MediaPipe (simplified for now)
  const initializeDetector = useCallback(async () => {
    try {
      console.log('NELE: Simulating MediaPipe initialization...');
      
      // For now, we'll simulate the detector
      faceDetectorRef.current = { initialized: true };
      console.log('NELE: Demo detector ready');
      return true;
    } catch (error) {
      console.error('NELE: Detector initialization failed:', error);
      return false;
    }
  }, []);

  // Analyze video frame (simplified demo version)
  const analyzeFrame = useCallback(() => {
    if (!videoRef.current || !faceDetectorRef.current || !isMonitoring) {
      return;
    }

    try {
      const now = Date.now();
      
      // For demo purposes, we'll simulate random distractions occasionally
      const shouldTrigger = Math.random() < 0.01; // 1% chance per frame
      
      if (shouldTrigger && now - lastDetectionRef.current > 30000) { // 30 second cooldown
        const violationTypes = ['no-face', 'multiple-faces', 'looking-away'];
        const randomViolation = violationTypes[Math.floor(Math.random() * violationTypes.length)];
        
        setCurrentViolations([randomViolation]);
        setDistractionCount(prev => prev + 1);
        onDistraction(randomViolation);
        lastDetectionRef.current = now;

        setTimeout(() => {
          setCurrentViolations([]);
        }, 3000);
      }

    } catch (error) {
      console.error('NELE: Analysis error:', error);
    }
  }, [isMonitoring, onDistraction]);

  // Start monitoring
  const startMonitoring = useCallback(async () => {
    console.log('NELE: Starting camera monitoring...');
    
    const cameraReady = await initializeCamera();
    if (!cameraReady) return false;

    const detectorReady = await initializeDetector();
    if (!detectorReady) return false;

    setIsMonitoring(true);
    setCurrentViolations([]);

    intervalRef.current = setInterval(analyzeFrame, 500);
    return true;
  }, [initializeCamera, initializeDetector, analyzeFrame]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    console.log('NELE: Stopping monitoring...');
    setIsMonitoring(false);
    setCurrentViolations([]);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
      
      if (videoRef.current && videoRef.current.parentNode) {
        videoRef.current.parentNode.removeChild(videoRef.current);
      }
      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
      }
    };
  }, [stopMonitoring]);

  const resetStats = useCallback(() => {
    setDistractionCount(0);
    setCurrentViolations([]);
    violationHistoryRef.current = [];
  }, []);

  // Demo function for testing
  const triggerDistraction = useCallback((violationType = 'looking-away') => {
    if (!isMonitoring) return;
    
    setDistractionCount(prev => prev + 1);
    setCurrentViolations([violationType]);
    onDistraction(violationType);
    
    setTimeout(() => {
      setCurrentViolations([]);
    }, 3000);
  }, [isMonitoring, onDistraction]);

  return {
    isMonitoring,
    distractionCount,
    currentViolations,
    cameraError,
    isInitializing,
    startMonitoring,
    stopMonitoring,
    resetStats,
    triggerDistraction
  };
};

export default useDistractionDetection;