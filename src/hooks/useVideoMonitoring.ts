import { useState, useEffect, useRef, useCallback } from 'react'

declare global {
  interface Window {
    gazeStability?: {
      count: number
      lastState: boolean
    }
  }
}

interface VideoMonitoringState {
  faceCount: number
  isLookingAway: boolean
  suspiciousActivity: string[]
  isMonitoring: boolean
  error: string | null
  // ✅ SIMPLE: Just one violation counter
  violationCount: number
}

interface UseVideoMonitoringProps {
  videoElement?: HTMLVideoElement | null
  onViolation: (violation: string) => void
  isActive: boolean
  onDetectionResult?: (detections: any[]) => void
}

export const useVideoMonitoring = ({
  videoElement,
  onViolation,
  isActive,
  onDetectionResult
}: UseVideoMonitoringProps) => {
  const [state, setState] = useState<VideoMonitoringState>({
    faceCount: 0,
    isLookingAway: false,
    suspiciousActivity: [],
    isMonitoring: false,
    error: null,
    violationCount: 0
  })

  const faceDetectorRef = useRef<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialized = useRef<boolean>(false)
  const currentDetections = useRef<any[]>([])
  const initializationInProgress = useRef<boolean>(false)

  const isLookingAwayRef = useRef<boolean>(false)
  const gazeHistoryRef = useRef<boolean[]>([])
  const facePositionHistoryRef = useRef<{ x: number; y: number }[]>([])
  const eyeDistanceHistoryRef = useRef<number[]>([])
  const confidenceHistoryRef = useRef<number[]>([])

  // ✅ SIMPLE: Track previous states to detect changes
  const prevStatesRef = useRef<{
    noFace: boolean
    multipleFaces: boolean
    lookingAway: boolean
  }>({
    noFace: false,
    multipleFaces: false,
    lookingAway: false
  })

  // ✅ SIMPLE: Just increment counter when violation occurs
  const incrementViolationCounter = useCallback(() => {
    setState(prev => ({
      ...prev,
      violationCount: prev.violationCount + 1
    }))
    console.log('🚨 [VIOLATION] Counter incremented!')
  }, [])

  // ✅ MediaPipe initialization
  const initializeDetector = useCallback(async () => {
    if (isInitialized.current || initializationInProgress.current) {
      return
    }

    initializationInProgress.current = true

    try {
      const MediaPipeTasksVision = await import('@mediapipe/tasks-vision')
      const { FaceDetector, FilesetResolver } = MediaPipeTasksVision

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.15/wasm'
      )

      const detector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
          delegate: 'CPU'
        },
        runningMode: 'VIDEO',
        minDetectionConfidence: 0.5,
        minSuppressionThreshold: 0.3
      })

      faceDetectorRef.current = detector
      isInitialized.current = true
      setState(prev => ({ ...prev, isMonitoring: true }))
    } catch (error) {
      setState(prev => ({ ...prev, error: String(error) }))
    } finally {
      initializationInProgress.current = false
    }
  }, [])

  // ✅ Helper functions
  const updateGazeHistory = useCallback((isLookingAway: boolean) => {
    gazeHistoryRef.current.push(isLookingAway)
    if (gazeHistoryRef.current.length > 5) {
      gazeHistoryRef.current.shift()
    }
  }, [])

  const updateFacePositionHistory = useCallback((x: number, y: number) => {
    facePositionHistoryRef.current.push({ x, y })
    if (facePositionHistoryRef.current.length > 3) {
      facePositionHistoryRef.current.shift()
    }
  }, [])

  const updateEyeDistanceHistory = useCallback((distance: number) => {
    eyeDistanceHistoryRef.current.push(distance)
    if (eyeDistanceHistoryRef.current.length > 3) {
      eyeDistanceHistoryRef.current.shift()
    }
  }, [])

  const updateConfidenceHistory = useCallback((confidence: number) => {
    confidenceHistoryRef.current.push(confidence)
    if (confidenceHistoryRef.current.length > 5) {
      confidenceHistoryRef.current.shift()
    }
  }, [])

  const calculateStabilityScore = useCallback(() => {
    if (gazeHistoryRef.current.length < 3) return 0.5
    const recentStates = gazeHistoryRef.current.slice(-3)
    const consistency =
      recentStates.filter(state => state === recentStates[0]).length /
      recentStates.length
    return consistency
  }, [])

  const detectHeadMovement = useCallback(() => {
    if (facePositionHistoryRef.current.length < 2)
      return { isStable: true, movementSpeed: 0 }

    const positions = facePositionHistoryRef.current
    const lastPos = positions[positions.length - 1]
    const prevPos = positions[positions.length - 2]

    const movement = Math.sqrt(
      Math.pow(lastPos.x - prevPos.x, 2) + Math.pow(lastPos.y - prevPos.y, 2)
    )

    return {
      isStable: movement < 10,
      movementSpeed: movement
    }
  }, [])

  const calculateEyeDistanceStability = useCallback(() => {
    if (eyeDistanceHistoryRef.current.length < 2)
      return { isStable: true, variation: 0 }

    const distances = eyeDistanceHistoryRef.current
    const avgDistance =
      distances.reduce((sum, d) => sum + d, 0) / distances.length
    const maxVariation = Math.max(
      ...distances.map(d => Math.abs(d - avgDistance))
    )

    return {
      isStable: maxVariation < avgDistance * 0.15,
      variation: maxVariation / avgDistance
    }
  }, [])

  const calculateAverageConfidence = useCallback(() => {
    if (confidenceHistoryRef.current.length === 0) return 0.5
    return (
      confidenceHistoryRef.current.reduce((sum, c) => sum + c, 0) /
      confidenceHistoryRef.current.length
    )
  }, [])

  // ✅ SIMPLE: Face detection with immediate violation counting
  const detectFaces = useCallback(async () => {
    if (
      !faceDetectorRef.current ||
      !videoElement ||
      !isActive ||
      !isInitialized.current
    ) {
      return
    }

    if (videoElement.readyState < 2 || videoElement.videoWidth === 0) {
      return
    }

    try {
      const detectionResult = faceDetectorRef.current.detectForVideo(
        videoElement,
        performance.now()
      )

      const detections = detectionResult.detections || []
      currentDetections.current = detections

      if (onDetectionResult) {
        onDetectionResult(detections)
      }

      setState(prev => ({ ...prev, faceCount: detections.length }))

      // ✅ SIMPLE: Check for violations and increment counter immediately
      const currentNoFace = detections.length === 0
      const currentMultipleFaces = detections.length > 1
      let currentLookingAway = false

      // Single face - gaze detection
      if (detections.length === 1) {
        const detection = detections[0]
        const keypoints = detection.keypoints
        const rightEye = keypoints[0]
        const leftEye = keypoints[1]
        const noseTip = keypoints[2]

        if (rightEye && leftEye && noseTip) {
          const eyeMidpoint = {
            x: (rightEye.x + leftEye.x) / 2,
            y: (rightEye.y + leftEye.y) / 2
          }

          const eyeDistance = Math.sqrt(
            Math.pow(rightEye.x - leftEye.x, 2) +
              Math.pow(rightEye.y - leftEye.y, 2)
          )

          const noseDeviation = {
            x: noseTip.x - eyeMidpoint.x,
            y: noseTip.y - eyeMidpoint.y
          }

          const normalizedDeviationX = Math.abs(noseDeviation.x) / eyeDistance
          const normalizedDeviationY = Math.abs(noseDeviation.y) / eyeDistance

          const confidence = detection.categories?.[0]?.score || 0.5
          const faceCenter = {
            x: detection.boundingBox.originX + detection.boundingBox.width / 2,
            y: detection.boundingBox.originY + detection.boundingBox.height / 2
          }

          updateConfidenceHistory(confidence)
          updateFacePositionHistory(faceCenter.x, faceCenter.y)
          updateEyeDistanceHistory(eyeDistance)

          const headMovement = detectHeadMovement()
          const eyeStability = calculateEyeDistanceStability()
          const avgConfidence = calculateAverageConfidence()
          const stabilityScore = calculateStabilityScore()

          const baseIsLookingAway =
            normalizedDeviationX > 0.8 || normalizedDeviationY > 0.8

          let finalIsLookingAway = baseIsLookingAway

          if (avgConfidence < 0.7) {
            finalIsLookingAway =
              baseIsLookingAway &&
              (normalizedDeviationX > 0.8 || normalizedDeviationY > 0.84)
          }

          if (!headMovement.isStable && headMovement.movementSpeed > 20) {
            finalIsLookingAway =
              baseIsLookingAway &&
              (normalizedDeviationX > 0.7 || normalizedDeviationY > 1.05)
          }

          // if (!eyeStability.isStable) {
          //   finalIsLookingAway =
          //     baseIsLookingAway &&
          //     (normalizedDeviationX > 0.6 || normalizedDeviationY > 0.91)
          // }

          updateGazeHistory(finalIsLookingAway)

          if (stabilityScore < 0.6) {
            finalIsLookingAway =
              finalIsLookingAway &&
              (normalizedDeviationX > 0.42 || normalizedDeviationY > 0.98)
          }

          currentLookingAway = finalIsLookingAway
          isLookingAwayRef.current = finalIsLookingAway
          setState(prev => ({ ...prev, isLookingAway: finalIsLookingAway }))
        }
      }

      // ✅ SIMPLE: Check if any violation state changed from false to true
      const prevStates = prevStatesRef.current

      if (!prevStates.noFace && currentNoFace) {
        console.log('🚨 [VIOLATION] No face detected!')
        incrementViolationCounter()
      }

      if (!prevStates.multipleFaces && currentMultipleFaces) {
        console.log('🚨 [VIOLATION] Multiple faces detected!')
        incrementViolationCounter()
      }

      if (!prevStates.lookingAway && currentLookingAway) {
        console.log('🚨 [VIOLATION] Looking away detected!')
        incrementViolationCounter()
      }

      // ✅ Update previous states
      prevStatesRef.current = {
        noFace: currentNoFace,
        multipleFaces: currentMultipleFaces,
        lookingAway: currentLookingAway
      }
    } catch (error) {
      console.log('Detection error:', error)
    }
  }, [
    videoElement,
    isActive,
    onDetectionResult,
    incrementViolationCounter,
    updateGazeHistory,
    updateFacePositionHistory,
    updateEyeDistanceHistory,
    updateConfidenceHistory,
    calculateStabilityScore,
    detectHeadMovement,
    calculateEyeDistanceStability,
    calculateAverageConfidence
  ])

  const startMonitoring = useCallback(() => {
    if (!faceDetectorRef.current || !isInitialized.current) return
    if (intervalRef.current) return

    intervalRef.current = setInterval(detectFaces, 1000)
  }, [detectFaces])

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (
      isActive &&
      !isInitialized.current &&
      !initializationInProgress.current
    ) {
      setTimeout(initializeDetector, 2000)
    }
  }, [isActive, initializeDetector])

  useEffect(() => {
    const checkAndStart = () => {
      if (
        isActive &&
        videoElement &&
        faceDetectorRef.current &&
        (videoElement?.readyState ?? 0) >= 2 &&
        (videoElement?.videoWidth ?? 0) > 0 &&
        isInitialized.current
      ) {
        startMonitoring()
      } else {
        stopMonitoring()
      }
    }

    checkAndStart()
    const checkInterval = setInterval(checkAndStart, 3000)

    return () => {
      clearInterval(checkInterval)
      stopMonitoring()
    }
  }, [
    isActive,
    videoElement,
    videoElement?.readyState,
    videoElement?.videoWidth,
    startMonitoring,
    stopMonitoring
  ])

  useEffect(() => {
    return () => {
      if (faceDetectorRef.current) {
        try {
          faceDetectorRef.current.close()
        } catch (error) {
          console.log('Cleanup error:', error)
        }
      }
    }
  }, [])

  return {
    ...state,
    startMonitoring,
    stopMonitoring,
    resetViolations: () =>
      setState(prev => ({
        ...prev,
        suspiciousActivity: [],
        violationCount: 0
      })),
    detectionData: currentDetections.current
  }
}
