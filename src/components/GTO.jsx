import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import Navbar from './Navbar';
import { ArrowLeft, Mic, MicOff, Clock, RotateCcw, CheckCircle, Play, Pause } from 'lucide-react';

function GTO() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Test state
  const [isTestActive, setIsTestActive] = useState(false);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [preparationTime, setPreparationTime] = useState(60); // 1 minute preparation
  const [speakingTime, setSpeakingTime] = useState(180); // 3 minutes speaking
  const [phase, setPhase] = useState('preparation'); // preparation, speaking, completed
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [preparationNotes, setPreparationNotes] = useState('');
  const [performances, setPerformances] = useState([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  
  const timerRef = useRef(null);

  // Sample extempore topics
  const extemporeTopics = [
    "Leadership in the Digital Age",
    "Climate Change and National Security", 
    "Youth and Social Responsibility",
    "Technology: Boon or Bane",
    "Importance of Physical Fitness for Officers",
    "Role of Communication in Leadership",
    "Corruption and Its Impact on Society",
    "Women Empowerment in Armed Forces",
    "Importance of Team Work",
    "Challenges Facing Modern India",
    "Role of Education in Nation Building",
    "Social Media and Its Impact on Youth",
    "Importance of Discipline in Life",
    "Globalization and Indian Culture",
    "Environmental Conservation: Our Responsibility",
    "Role of Youth in Politics",
    "Artificial Intelligence and Future Jobs",
    "Importance of Mental Health Awareness",
    "Nationalism vs Regionalism",
    "Role of Sports in Character Building",
    "Cyber Security: Need of the Hour",
    "Work-Life Balance in Modern Times",
    "Importance of Innovation and Creativity",
    "Role of Media in Democracy",
    "Challenges of Urbanization"
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
            if (phase === 'preparation') {
              handleStartSpeaking();
            } else if (phase === 'speaking') {
              handleTopicComplete();
            }
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
  }, [isTestActive, timeRemaining, phase]);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch {}
    navigate('/login');
  };

  const selectRandomTopics = () => {
    const shuffled = [...extemporeTopics].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3); // Give 3 topic options
  };

  const startTest = () => {
    const selectedTopics = selectRandomTopics();
    setTopics(selectedTopics);
    setShowInstructions(false);
    setIsTestActive(true);
    setCurrentTopicIndex(0);
    setPhase('topic_selection');
    setSelectedTopic('');
    setPreparationNotes('');
    setPerformances([]);
    setTestCompleted(false);
  };

  const handleTopicSelection = (topic) => {
    setSelectedTopic(topic);
    setPhase('preparation');
    setTimeRemaining(preparationTime);
  };

  const handleStartSpeaking = () => {
    setPhase('speaking');
    setTimeRemaining(speakingTime);
    setIsRecording(true);
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleTopicComplete = () => {
    const performance = {
      topic: selectedTopic,
      preparationNotes: preparationNotes,
      speakingDuration: speakingTime - timeRemaining,
      completed: true
    };
    
    setPerformances(prev => [...prev, performance]);
    setIsRecording(false);
    
    if (currentTopicIndex < 2) { // Simulate multiple rounds
      setCurrentTopicIndex(prev => prev + 1);
      const newTopics = selectRandomTopics();
      setTopics(newTopics);
      setPhase('topic_selection');
      setSelectedTopic('');
      setPreparationNotes('');
    } else {
      handleTestComplete();
    }
  };

  const handleTestComplete = () => {
    setIsTestActive(false);
    setTestCompleted(true);
    setPhase('completed');
    clearInterval(timerRef.current);
  };

  const resetTest = () => {
    setIsTestActive(false);
    setCurrentTopicIndex(0);
    setPhase('preparation');
    setTimeRemaining(60);
    setTopics([]);
    setSelectedTopic('');
    setPreparationNotes('');
    setPerformances([]);
    setTestCompleted(false);
    setShowInstructions(true);
    setIsRecording(false);
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
    if (phase === 'preparation') {
      return timeRemaining > 30 ? 'text-green-600' : timeRemaining > 10 ? 'text-yellow-600' : 'text-red-600';
    } else if (phase === 'speaking') {
      return timeRemaining > 120 ? 'text-green-600' : timeRemaining > 60 ? 'text-yellow-600' : 'text-red-600';
    }
    return 'text-blue-600';
  };

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userDetails={userDetails} onLogout={handleLogout} />

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
            <span className="text-gray-700 font-medium">GTO - Extempore</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-gray-100 px-6 py-4 border-b">
            <h1 className="text-xl font-semibold text-gray-800">
              SSB Drills &gt; GTO - Extempore Speaking
            </h1>
          </div>

          {showInstructions && !testCompleted && (
            <div className="p-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">Instructions</h2>
                <div className="space-y-3 text-blue-800">
                  <p><strong>What is Extempore?</strong></p>
                  <p>Extempore is impromptu speaking where you are given a topic and need to speak for 3 minutes after 1 minute of preparation. This tests your communication skills, confidence, and ability to organize thoughts quickly.</p>
                  
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Topic Selection:</strong> Choose from 3 given topics</li>
                    <li><strong>Preparation Time:</strong> 1 minute to organize thoughts</li>
                    <li><strong>Speaking Time:</strong> 3 minutes presentation</li>
                    <li><strong>Assessment:</strong> Content, delivery, confidence, and clarity</li>
                    <li>Stand and speak clearly</li>
                    <li>Maintain eye contact with audience</li>
                    <li>Use proper body language</li>
                  </ul>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-green-800 mb-2">Speaking Tips:</h3>
                      <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
                        <li>Start with a strong opening</li>
                        <li>Structure: Introduction, Body, Conclusion</li>
                        <li>Use examples and personal experiences</li>
                        <li>Speak with confidence and conviction</li>
                        <li>Maintain proper pace and tone</li>
                        <li>End with a memorable conclusion</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold text-yellow-800 mb-2">What Assessors Look For:</h3>
                      <ul className="list-disc list-inside text-yellow-700 space-y-1 text-sm">
                        <li>Confidence and stage presence</li>
                        <li>Clarity of expression</li>
                        <li>Logical flow of ideas</li>
                        <li>Knowledge and awareness</li>
                        <li>Ability to handle time pressure</li>
                        <li>Leadership and communication skills</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={startTest} 
                  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Extempore</span>
                </button>
              </div>
            </div>
          )}

          {isTestActive && (
            <div className="p-6">
              {/* Phase indicator and timer */}
              <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center space-x-2 ${getTimeColor()} font-semibold`}>
                    <Clock className="w-5 h-5" />
                    <span>{formatTime(timeRemaining)}</span>
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {phase === 'topic_selection' ? 'Select Topic' :
                     phase === 'preparation' ? 'Preparation Time' :
                     phase === 'speaking' ? 'Speaking Time' : 'Phase'}
                  </div>
                </div>
                
                <div className="text-sm font-medium">
                  Round {currentTopicIndex + 1} of 3
                </div>
              </div>

              {/* Topic Selection Phase */}
              {phase === 'topic_selection' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Choose Your Topic</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {topics.map((topic, index) => (
                      <button
                        key={index}
                        onClick={() => handleTopicSelection(topic)}
                        className="p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <div className="font-medium text-gray-800">{topic}</div>
                        <div className="text-sm text-gray-600 mt-1">Click to select this topic</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preparation Phase */}
              {phase === 'preparation' && (
                <div>
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold text-blue-900 mb-2">Preparation Phase</h2>
                    <p className="text-blue-800">
                      <strong>Your Topic:</strong> {selectedTopic}
                    </p>
                    <p className="text-blue-700 text-sm mt-2">
                      Use this time to organize your thoughts, plan your structure, and prepare key points.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preparation Notes (Optional):
                    </label>
                    <textarea
                      value={preparationNotes}
                      onChange={(e) => setPreparationNotes(e.target.value)}
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Jot down key points, structure, examples you want to mention..."
                    />
                  </div>

                  <div className="mt-4 flex justify-center">
                    <button 
                      onClick={handleStartSpeaking}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
                    >
                      Start Speaking Now
                    </button>
                  </div>
                </div>
              )}

              {/* Speaking Phase */}
              {phase === 'speaking' && (
                <div>
                  <div className="bg-green-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-green-900 mb-2">Speaking Phase</h2>
                        <p className="text-green-800">
                          <strong>Topic:</strong> {selectedTopic}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={handleToggleRecording}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                            isRecording 
                              ? 'bg-red-600 text-white hover:bg-red-700' 
                              : 'bg-gray-600 text-white hover:bg-gray-700'
                          }`}
                        >
                          {isRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          <span>{isRecording ? 'Recording...' : 'Start Recording'}</span>
                        </button>
                        
                        {isRecording && (
                          <div className="flex items-center space-x-2 text-red-600">
                            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">LIVE</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Speaking guidelines */}
                  <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold text-yellow-800 mb-2">Speaking Guidelines:</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-yellow-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Stand up and speak clearly</li>
                        <li>Maintain eye contact</li>
                        <li>Use appropriate gestures</li>
                      </ul>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Structure your speech well</li>
                        <li>Keep track of time</li>
                        <li>End with strong conclusion</li>
                      </ul>
                    </div>
                  </div>

                  {/* Notes reference */}
                  {preparationNotes && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h4 className="font-medium text-gray-800 mb-2">Your Preparation Notes:</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{preparationNotes}</p>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <button 
                      onClick={handleTopicComplete}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      Complete This Round
                    </button>
                  </div>
                </div>
              )}

              {/* Reset button */}
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={resetTest}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Test</span>
                </button>
              </div>
            </div>
          )}

          {testCompleted && (
            <div className="p-6">
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-green-900">Extempore Session Completed!</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Performance Summary */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-800 mb-3">Session Summary</h3>
                    <div className="space-y-3">
                      {performances.map((performance, index) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-3">
                          <div className="font-medium text-gray-800">Round {index + 1}</div>
                          <div className="text-sm text-gray-600">{performance.topic}</div>
                          <div className="text-xs text-gray-500">
                            Speaking time: {formatTime(performance.speakingDuration)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assessment Areas */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-800 mb-3">Assessment Areas</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div>
                        <strong className="text-blue-800">Communication:</strong>
                        <span> Clarity and effectiveness of speech</span>
                      </div>
                      <div>
                        <strong className="text-blue-800">Confidence:</strong>
                        <span> Stage presence and self-assurance</span>
                      </div>
                      <div>
                        <strong className="text-blue-800">Content:</strong>
                        <span> Knowledge and logical flow</span>
                      </div>
                      <div>
                        <strong className="text-blue-800">Time Management:</strong>
                        <span> Effective use of allocated time</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Key Takeaways</h3>
                  <p className="text-gray-700 text-sm">
                    Great job completing the extempore sessions! This exercise helps develop confidence, 
                    quick thinking, and communication skills essential for military leadership. 
                    Continue practicing with different topics to improve further.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button 
                    onClick={resetTest}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Practice More Topics
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

export default GTO;