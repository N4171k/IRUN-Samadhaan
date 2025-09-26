import React, { useRef, useEffect, useState, useCallback } from 'react'
import {
  Brain,
  Users,
  Video,
  VideoOff,
  Eye,
  AlertTriangle,
  X
} from 'lucide-react'
import { useVideoMonitoring } from '../hooks/useVideoMonitoring.ts'

interface VideoPanelProps {
  isUser: boolean
  isActive: boolean
  audioLevel?: number
  status: string
  transcript?: string
  interimTranscript?: string
  streamingText?: string
  isRecording?: boolean
  isProcessing?: boolean
  canInterrupt?: boolean
  onStopSpeaking?: () => void
  onVideoViolation?: (count: number) => void
}

export const VideoPanel: React.FC<VideoPanelProps> = ({
  isUser,
  isActive,
  audioLevel = 0,
  status,
  transcript = '',
  interimTranscript = '',
  streamingText = '',
  isRecording = false,
  isProcessing = false,
  onStopSpeaking,
  onVideoViolation
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const [userVideoStream, setUserVideoStream] = useState<MediaStream | null>(
    null
  )
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [showDetectionOverlay, setShowDetectionOverlay] = useState(true)
  const [videoReady, setVideoReady] = useState(false)

  // ✅ Violation alert state
  const [currentViolation, setCurrentViolation] = useState<string | null>(null)
  const violationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ✅ Track previous violation count to detect changes
  const prevViolationCountRef = useRef<number>(0)

  // ✅ Initialize video monitoring hook
  const {
    faceCount,
    isLookingAway,
    suspiciousActivity,
    isMonitoring,
    error: monitoringError,
    detectionData,
    violationCount // ✅ Get the violation counter from hook
  } = useVideoMonitoring({
    videoElement: videoReady ? videoRef.current : null,
    onViolation: () => {}, // ✅ Empty - we'll handle it below
    isActive: true,
    onDetectionResult: undefined
  })

  // ✅ NEW: Watch for violation count changes and call onVideoViolation
  useEffect(() => {
    if (violationCount > prevViolationCountRef.current) {
      console.log(
        `🚨 [VIDEOPANEL] Violation count increased: ${prevViolationCountRef.current} → ${violationCount}`
      )

      // Show internal alert
      const violationMessage = `Video violation detected (Count: ${violationCount})`
      setCurrentViolation(violationMessage)

      // Auto-hide after 8 seconds
      if (violationTimeoutRef.current) {
        clearTimeout(violationTimeoutRef.current)
      }
      violationTimeoutRef.current = setTimeout(() => {
        setCurrentViolation(null)
      }, 8000)

      // ✅ Call external handler
      if (onVideoViolation) {
        console.log(
          '📞 [VIDEOPANEL] Calling onVideoViolation with:',
          violationMessage
        )
        try {
          onVideoViolation(violationCount)
          console.log('✅ [VIDEOPANEL] Successfully called onVideoViolation')
        } catch (error) {
          console.error(
            '❌ [VIDEOPANEL] Error calling onVideoViolation:',
            error
          )
        }
      } else {
        console.log('⚠️ [VIDEOPANEL] No onVideoViolation handler provided')
      }
    }

    // Update previous count
    prevViolationCountRef.current = violationCount
  }, [violationCount, onVideoViolation])

  // ✅ Manual dismiss alert
  const dismissAlert = useCallback(() => {
    console.log('🚨 ALERT DISMISSED')
    setCurrentViolation(null)
    if (violationTimeoutRef.current) {
      clearTimeout(violationTimeoutRef.current)
    }
  }, [])

  // ✅ Simple drawing function - only bounding box
  const drawDetectionOverlay = useCallback(
    (detections: any[]) => {
      if (
        !overlayCanvasRef.current ||
        !videoRef.current ||
        !showDetectionOverlay
      ) {
        return
      }

      const canvas = overlayCanvasRef.current
      const video = videoRef.current
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // ✅ Draw bounding boxes with violation-based colors
      detections.forEach((detection, index) => {
        const bbox = detection.boundingBox
        let boxColor = '#00ff44' // Default green

        // Change color based on violations
        if (detections.length === 0) {
          boxColor = '#ff4444' // Red for no face
        } else if (detections.length > 1) {
          boxColor = '#ffaa00' // Orange for multiple faces
        } else if (isLookingAway) {
          boxColor = '#ff4444' // Red for looking away
        }

        ctx.strokeStyle = boxColor
        ctx.lineWidth = 4
        ctx.strokeRect(bbox.originX, bbox.originY, bbox.width, bbox.height)
      })
    },
    [isLookingAway, showDetectionOverlay]
  )

  // ✅ Effect to handle detection data changes
  useEffect(() => {
    if (detectionData && detectionData.length > 0) {
      drawDetectionOverlay(detectionData)
    } else if (
      showDetectionOverlay &&
      overlayCanvasRef.current &&
      videoRef.current
    ) {
      const canvas = overlayCanvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx && canvas.width > 0 && canvas.height > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [detectionData, drawDetectionOverlay, showDetectionOverlay])

  // ✅ Camera setup logic (same as before)
  const startUserVideo = useCallback(async () => {
    if (!isUser) return
    setIsCameraLoading(true)
    setCameraError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      })
      setUserVideoStream(stream)
    } catch (error) {
      setCameraError('Camera access denied or not available')
    } finally {
      setIsCameraLoading(false)
    }
  }, [isUser])

  const stopUserVideo = useCallback(() => {
    if (userVideoStream) {
      userVideoStream.getTracks().forEach(track => {
        track.stop()
      })
      setUserVideoStream(null)
      setCameraError(null)
      setVideoReady(false)
    }
  }, [userVideoStream])

  useEffect(() => {
    if (isUser && !userVideoStream && !cameraError) {
      startUserVideo()
    }

    return () => {
      if (userVideoStream) {
        userVideoStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isUser, startUserVideo, userVideoStream, cameraError])

  useEffect(() => {
    const video = videoRef.current
    if (isUser && video && userVideoStream) {
      video.srcObject = userVideoStream

      const handleLoadedData = () => {
        setVideoReady(true)
      }

      const handleCanPlay = () => {
        setVideoReady(true)
      }

      video.addEventListener('loadeddata', handleLoadedData)
      video.addEventListener('canplay', handleCanPlay)

      video.play().catch(() => {})

      return () => {
        video.removeEventListener('loadeddata', handleLoadedData)
        video.removeEventListener('canplay', handleCanPlay)
      }
    } else {
      setVideoReady(false)
    }
  }, [isUser, userVideoStream])

  // ✅ Get current violation status
  const getCurrentViolationStatus = () => {
    const violations = []

    if (faceCount === 0) {
      violations.push('No face detected')
    } else if (faceCount > 1) {
      violations.push('Multiple faces detected')
    }

    if (isLookingAway && faceCount === 1) {
      violations.push('Looking away')
    }

    if (violations.length === 0 && faceCount === 1) {
      violations.push('Normal - Face detected and focused')
    }

    return violations
  }

  const gradientClass = isUser
    ? 'from-blue-500/20 to-purple-500/20'
    : 'from-purple-500/20 to-pink-500/20'

  const borderColor = isActive
    ? isUser
      ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/25'
      : 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/25'
    : 'border-gray-500 bg-gray-500/20'

  const statusColor = isActive
    ? isUser
      ? 'bg-green-500'
      : 'bg-purple-500'
    : 'bg-gray-500'

  return (
    <div className='relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group'>
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`}
      ></div>

      {/* Video Content */}
      <div className='relative h-full flex items-center justify-center'>
        <div className='text-center'>
          <div
            className={`${isUser ? 'w-48 h-36' : 'w-20 h-20'} mx-auto mb-4 ${
              isUser ? 'rounded-lg' : 'rounded-full'
            } border-4 transition-all duration-300 ${borderColor} overflow-hidden relative`}
          >
            <div className='w-full h-full flex items-center justify-center relative overflow-hidden'>
              {isActive && isUser && audioLevel > 0 && (
                <div
                  className='absolute inset-1 bg-green-500/30 rounded-lg transition-transform duration-100'
                  style={{
                    transform: `scale(${0.95 + audioLevel * 0.05})`,
                    opacity: 0.3 + audioLevel * 0.7
                  }}
                />
              )}

              {isActive && !isUser && (
                <div className='absolute inset-1 bg-purple-500/30 rounded-full animate-pulse' />
              )}

              {isUser ? (
                isCameraLoading ? (
                  <div className='flex flex-col items-center text-white'>
                    <div className='w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mb-2'></div>
                    <span className='text-xs text-gray-300'>Loading...</span>
                  </div>
                ) : userVideoStream ? (
                  <div className='relative w-full h-full'>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className='w-full h-full object-cover rounded-lg'
                      style={{
                        transform: 'scaleX(-1)'
                      }}
                    />

                    {showDetectionOverlay && (
                      <canvas
                        ref={overlayCanvasRef}
                        className='absolute top-0 left-0 w-full h-full pointer-events-none'
                        style={{
                          transform: 'scaleX(-1)'
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center h-full'>
                    <Users className='w-12 h-12 text-gray-300 mb-2' />
                    <span className='text-xs text-gray-400 text-center'>
                      {cameraError ? 'Camera Off' : 'No Camera'}
                    </span>
                  </div>
                )
              ) : (
                <Brain className='w-8 h-8 text-purple-400 z-10' />
              )}
            </div>

            {/* Toggle detection overlay button */}
            {isUser && (
              <div className='absolute top-1 right-1 flex flex-col space-y-1'>
                <button
                  onClick={() => {
                    setShowDetectionOverlay(!showDetectionOverlay)
                  }}
                  className={`px-1 py-0.5 text-xs rounded ${
                    showDetectionOverlay ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                  title='Toggle detection overlay'
                >
                  📊
                </button>
              </div>
            )}
          </div>

          <h3 className='text-lg font-medium mb-2'>
            {isUser ? 'You' : 'AI Interviewer'}
          </h3>

          <div className='flex items-center justify-center space-x-2'>
            <div
              className={`w-2 h-2 rounded-full ${statusColor} ${
                isActive ? 'animate-pulse' : ''
              }`}
            />
            <span className='text-sm text-gray-400'>{status}</span>
          </div>

          {/* ✅ Show current violations and violation counter */}
          {isUser && (
            <div className='text-xs text-gray-400 mt-2 max-w-48 mx-auto'>
              <div className='mb-1'>
                Status:{' '}
                {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
              </div>

              {/* Current Violations */}
              <div className='space-y-1'>
                {getCurrentViolationStatus().map((violation, index) => (
                  <div
                    key={index}
                    className={`px-2 py-1 rounded text-xs ${
                      violation.includes('Normal')
                        ? 'bg-green-600/20 text-green-400'
                        : violation.includes('No face')
                        ? 'bg-red-600/20 text-red-400'
                        : violation.includes('Multiple faces')
                        ? 'bg-orange-600/20 text-orange-400'
                        : violation.includes('Looking away')
                        ? 'bg-red-600/20 text-red-400'
                        : 'bg-gray-600/20 text-gray-400'
                    }`}
                  >
                    {violation}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Monitoring Status */}
      {isUser && isMonitoring && (
        <div className='absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs'>
          <div className='flex items-center space-x-1 text-green-400'>
            <Eye className='w-3 h-3' />
            <span>AI Monitoring</span>
            {violationCount > 0 && (
              <span className='bg-red-600 text-white px-1 rounded text-xs ml-2'>
                {violationCount}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Camera Controls */}
      {isUser && (
        <div className='absolute top-4 right-4 flex space-x-2'>
          <button
            onClick={userVideoStream ? stopUserVideo : startUserVideo}
            className='p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors'
            title={userVideoStream ? 'Turn off camera' : 'Turn on camera'}
          >
            {userVideoStream ? (
              <VideoOff className='w-4 h-4 text-red-400' />
            ) : (
              <Video className='w-4 h-4 text-green-400' />
            )}
          </button>
        </div>
      )}

      {/* Rest of existing JSX... */}
      <div className='absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg'>
        <span className='text-sm font-medium'>
          {isUser ? 'You' : 'AI Interviewer'}
        </span>
      </div>

      {isUser && (transcript || interimTranscript) && (
        <div className='absolute bottom-4 right-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3'>
          <p className='text-sm text-gray-300'>
            {transcript}
            <span className='text-gray-400 italic'>{interimTranscript}</span>
            {isRecording && <span className='animate-pulse'>|</span>}
          </p>
        </div>
      )}

      {!isUser && streamingText && (
        <div className='absolute bottom-4 right-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3'>
          <div className='flex justify-between items-start'>
            <p className='text-sm text-gray-300 flex-1'>
              {streamingText}
              <span className='animate-pulse'>|</span>
            </p>
            {onStopSpeaking && (
              <button
                onClick={onStopSpeaking}
                className='ml-2 text-red-400 hover:text-red-300 text-xs'
              >
                Stop
              </button>
            )}
          </div>
        </div>
      )}

      {!isUser && isProcessing && !streamingText && (
        <div className='absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3'>
          <div className='flex items-center space-x-3'>
            <div className='relative'>
              <div className='w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin'></div>
            </div>
            <div>
              <span className='text-sm text-gray-300'>
                Analyzing your response...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
