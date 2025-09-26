import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import Navbar from './Navbar';
import { ArrowLeft, Clock, Eye, EyeOff, RotateCcw, Play } from 'lucide-react';

function PPDT() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Test state
  const [isTestActive, setIsTestActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(240); // 4 minutes (240 seconds)
  const [story, setStory] = useState('');
  const [currentImage, setCurrentImage] = useState(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [imageVisible, setImageVisible] = useState(true);
  
  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  // Sample blurry images for PPDT (in real scenario, these would be actual blurry images)
  const ppdtImages = [
    {
      id: 1,
      description: "A blurry figure standing near a building",
      blurredImageData: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9ImJsdXIiPgogICAgICA8ZmVHYXVzc2lhbkJsdXIgaW49IlNvdXJjZUdyYXBoaWMiIHN0ZERldmlhdGlvbj0iNSIvPgogICAgPC9maWx0ZXI+CiAgPC9kZWZzPgogICAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmMGY0ZjgiLz4KICA8cmVjdCB4PSIxMDAiIHk9IjEwMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iIzM3NDE1MSIgZmlsdGVyPSJ1cmwoI2JsdXIpIi8+CiAgPHJlY3QgeD0iMjAwIiB5PSI1MCIgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM2Yjc0ODkiIGZpbHRlcj0idXJsKCNibHVyKSIvPgo8L3N2Zz4K"
    },
    {
      id: 2,
      description: "Two blurry figures in conversation",
      blurredImageData: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9ImJsdXIyIj4KICAgICAgPGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VHcmFwaGljIiBzdGREZXZpYXRpb249IjYiLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y5ZmFmYyIvPgogIDxyZWN0IHg9IjgwIiB5PSIxMDAiIHdpZHRoPSI2MCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMyNTYzZWIiIGZpbHRlcj0idXJsKCNibHVyMikiLz4KICA8cmVjdCB4PSIyNDAiIHk9IjEyMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzFmMjkzNyIgZmlsdGVyPSJ1cmwoI2JsdXIyKSIvPgo8L3N2Zz4K"
    },
    {
      id: 3,
      description: "A blurry scene with multiple objects",
      blurredImageData: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9ImJsdXIzIj4KICAgICAgPGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VHcmFwaGljIiBzdGREZXZpYXRpb249IjciLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZlZjNjNyIvPgogIDxjaXJjbGUgY3g9IjEyMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiNkYzI2MjYiIGZpbHRlcj0idXJsKCNibHVyMykiLz4KICA8cmVjdCB4PSIyNTAiIHk9IjgwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE0MCIgZmlsbD0iIzA1OTY2OSIgZmlsdGVyPSJ1cmwoI2JsdXIzKSIvPgo8L3N2Zz4K"
    }
  ];

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await account.get();
        setUserDetails(user);
        setIsLoading(false);
      } catch (err) {
        console.error('User not logged in:', err);
        navigate('/login');
      }
    }
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (isTestActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTestComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTestActive, timeRemaining]);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch {}
    navigate('/login');
  };

  const selectRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * ppdtImages.length);
    return ppdtImages[randomIndex];
  };

  const startTest = () => {
    const selectedImage = selectRandomImage();
    setCurrentImage(selectedImage);
    setShowInstructions(false);
    setIsTestActive(true);
    setTimeRemaining(240); // 4 minutes
    setStory('');
    setTestCompleted(false);
    setImageVisible(true);
    
    // Focus on textarea after a brief delay
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  const handleTestComplete = () => {
    setIsTestActive(false);
    setTestCompleted(true);
    clearInterval(timerRef.current);
  };

  const resetTest = () => {
    setIsTestActive(false);
    setCurrentImage(null);
    setTimeRemaining(240);
    setStory('');
    setTestCompleted(false);
    setShowInstructions(true);
    setImageVisible(true);
    clearInterval(timerRef.current);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToSSB = () => {
    navigate('/ssb-drills');
  };

  const getTimeColor = () => {
    if (timeRemaining > 120) return 'text-green-600';
    if (timeRemaining > 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userDetails={userDetails} onLogout={handleLogout} />

      {/* Breadcrumb Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm">
            <button 
              onClick={handleBackToSSB}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to SSB Drills</span>
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 font-medium">Picture Perception & Description Test (PPDT)</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Test Header */}
          <div className="bg-gray-100 px-6 py-4 border-b">
            <h1 className="text-xl font-semibold text-gray-800">
              SSB Drills &gt; Picture Perception & Description Test (PPDT)
            </h1>
          </div>

          {/* Instructions */}
          {showInstructions && !testCompleted && (
            <div className="p-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">Instructions</h2>
                <div className="space-y-3 text-blue-800">
                  <p><strong>What is PPDT?</strong></p>
                  <p>Picture Perception and Description Test shows you a blurry image for 30 seconds, then you have 4 minutes to write a story based on what you perceived.</p>
                  
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Observation Time:</strong> 30 seconds to observe the blurry image</li>
                    <li><strong>Writing Time:</strong> 4 minutes (240 seconds) to write your story</li>
                    <li><strong>Story Elements:</strong> Include characters, their mood, action, and outcome</li>
                    <li>Write about what you see, not what you think you should see</li>
                    <li>Keep the story positive and action-oriented</li>
                    <li>Focus on leadership qualities and problem-solving</li>
                  </ul>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
                    <h3 className="font-semibold text-yellow-800">Story Writing Tips:</h3>
                    <ul className="list-disc list-inside text-yellow-700 space-y-1 mt-2">
                      <li>Start with setting the scene</li>
                      <li>Introduce the characters and their relationship</li>
                      <li>Describe the situation or problem</li>
                      <li>Show how characters resolve the situation</li>
                      <li>End with a positive outcome</li>
                      <li>Use active voice and positive language</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
                    <h3 className="font-semibold text-green-800">What Assessors Look For:</h3>
                    <ul className="list-disc list-inside text-green-700 space-y-1 mt-2">
                      <li>Perception of the image</li>
                      <li>Imagination and creativity</li>
                      <li>Positive thinking</li>
                      <li>Leadership orientation</li>
                      <li>Problem-solving approach</li>
                    </ul>
                  </div>
                </div>
                
                <button 
                  onClick={startTest} 
                  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Start PPDT Test</span>
                </button>
              </div>
            </div>
          )}

          {/* Test Interface */}
          {isTestActive && (
            <div className="p-6">
              {/* Timer and Controls */}
              <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center space-x-2 ${getTimeColor()} font-semibold`}>
                    <Clock className="w-5 h-5" />
                    <span>{formatTime(timeRemaining)}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Time Remaining
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setImageVisible(!imageVisible)}
                    className="flex items-center space-x-2 px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {imageVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{imageVisible ? 'Hide' : 'Show'} Image</span>
                  </button>
                  
                  <button 
                    onClick={resetTest}
                    className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image Section */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Observe the Image Carefully</h3>
                    
                    <div className={`w-full h-64 bg-white rounded border flex items-center justify-center overflow-hidden transition-opacity duration-300 ${
                      imageVisible ? 'opacity-100' : 'opacity-20'
                    }`}>
                      {currentImage ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={currentImage.blurredImageData}
                            alt="Blurry test image"
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            Blurry Image - Use Your Perception
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Loading image...</span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Look carefully at shapes, positions, and possible relationships between elements
                    </p>
                  </div>
                </div>

                {/* Story Writing Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Write Your Story Here
                    </label>
                    <textarea
                      ref={textareaRef}
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Start writing your story based on what you perceive in the image..."
                    />
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-gray-500">
                        Word count: {story.trim().split(/\s+/).filter(word => word.length > 0).length} words
                      </div>
                      <div className="text-xs text-gray-500">
                        Characters: {story.length}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Story Structure Reminder:</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Setting & Characters</li>
                      <li>• Situation/Problem</li>
                      <li>• Action taken</li>
                      <li>• Positive outcome</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Complete Test Button */}
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={handleTestComplete}
                  className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  Complete Test
                </button>
              </div>
            </div>
          )}

          {/* Test Results */}
          {testCompleted && (
            <div className="p-6">
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h2 className="text-xl font-semibold text-green-900 mb-4">PPDT Test Completed!</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Your Story */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-800 mb-3">Your Story</h3>
                    <div className="bg-gray-50 p-3 rounded-md min-h-32 text-sm text-gray-700">
                      {story || <em className="text-gray-500">No story written</em>}
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>Words: {story.trim().split(/\s+/).filter(word => word.length > 0).length}</span>
                      <span>Characters: {story.length}</span>
                    </div>
                  </div>

                  {/* Image Reference */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-800 mb-3">Test Image</h3>
                    <div className="w-full h-40 bg-gray-50 rounded border flex items-center justify-center">
                      {currentImage && (
                        <img 
                          src={currentImage.blurredImageData}
                          alt="Test image"
                          className="max-w-full max-h-full object-contain"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Next Steps</h3>
                  <p className="text-gray-700 text-sm mb-3">
                    Great job completing the PPDT! Your story will be used in the Group Discussion (GD) round where you'll discuss your perception with other candidates.
                  </p>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">Prepare for Group Discussion:</h4>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>• Be ready to explain your story and perception</li>
                      <li>• Listen to others' stories respectfully</li>
                      <li>• Show leadership and confidence in discussion</li>
                      <li>• Maintain your viewpoint while being open to others</li>
                    </ul>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button 
                    onClick={resetTest}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Take Test Again</span>
                  </button>
                  
                  <button 
                    onClick={() => navigate('/gd')}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Go to Group Discussion
                  </button>
                  
                  <button 
                    onClick={handleBackToSSB}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Back to SSB Drills
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PPDT;