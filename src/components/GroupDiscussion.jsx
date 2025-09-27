import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import Navbar from './Navbar';
import AIGDSimulator from './AIGDSimulator';
import ErrorBoundary from './ErrorBoundary';
import { ArrowLeft, Users, Timer, Bot, Megaphone } from 'lucide-react';

function GroupDiscussion() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // GD State
  const [mode, setMode] = useState('real');
  const [gdStarted, setGdStarted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('preparation'); // preparation, discussion, conclusion
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes
  const [userStory, setUserStory] = useState('');
  const [gdNotes, setGdNotes] = useState('');
  const [participantSpoken, setParticipantSpoken] = useState(false);
  const [leadershipShown, setLeadershipShown] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState(3);
  const [speakingClarity, setSpeakingClarity] = useState(3);
  const [showInstructions, setShowInstructions] = useState(true);

  // Sample participant stories from PPDT
  const sampleStories = [
    {
      id: 1,
      participant: "Candidate A",
      story: "I saw two friends discussing a problem. One friend was helping the other solve a difficult situation. They worked together to find a solution and both looked satisfied with the outcome."
    },
    {
      id: 2,
      participant: "Candidate B", 
      story: "The image showed a leader guiding a team member. There was some confusion initially, but through clear communication and guidance, they resolved the issue successfully."
    },
    {
      id: 3,
      participant: "Candidate C",
      story: "I perceived it as a mentoring situation where an experienced person was sharing knowledge with a junior. The interaction looked positive and constructive."
    },
    {
      id: 4,
      participant: "You",
      story: userStory || "Your PPDT story will appear here when you share it."
    }
  ];

  const gdTopics = [
    "Leadership qualities observed in the image",
    "Problem-solving approaches depicted",
    "Communication and teamwork aspects",
    "Positive outcomes and solutions shown",
    "Character traits of people in the image"
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
    // Get user's PPDT story from localStorage or previous test
    const savedStory = localStorage.getItem('ppdtStory');
    if (savedStory) {
      setUserStory(savedStory);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (userStory && userStory.trim().length > 0) {
        localStorage.setItem('ppdtStory', userStory);
      } else {
        localStorage.removeItem('ppdtStory');
      }
    }
  }, [userStory]);

  useEffect(() => {
    let timer;
    if (mode === 'real' && gdStarted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleGDComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gdStarted, timeRemaining, mode]);

  useEffect(() => {
    if (mode !== 'real') {
      setGdStarted(false);
      setShowInstructions(false);
      setCurrentPhase('preparation');
    } else {
      setShowInstructions(true);
      setTimeRemaining(900);
      setCurrentPhase('preparation');
    }
  }, [mode]);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch {}
    navigate('/login');
  };

  const startGD = () => {
    setShowInstructions(false);
    setGdStarted(true);
    setCurrentPhase('discussion');
    setTimeRemaining(900); // 15 minutes
  };

  const handleGDComplete = () => {
    setGdStarted(false);
    setCurrentPhase('conclusion');
  };

  const resetGD = () => {
    setGdStarted(false);
    setCurrentPhase('preparation');
    setTimeRemaining(900);
    setUserStory('');
    setGdNotes('');
    setParticipantSpoken(false);
    setLeadershipShown(false);
    setConfidenceLevel(3);
    setSpeakingClarity(3);
    setShowInstructions(true);
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
    if (timeRemaining > 600) return 'text-green-600';
    if (timeRemaining > 300) return 'text-yellow-600';
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
            <span className="text-gray-700 font-medium">Group Discussion (GD)</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Test Header */}
          <div className="bg-gray-100 px-6 py-4 border-b">
            <h1 className="text-xl font-semibold text-gray-800">
              SSB Drills &gt; Group Discussion (GD)
            </h1>
          </div>

          <div className="p-6 border-b bg-white">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Choose your GD practice mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMode('real')}
                className={`text-left p-4 rounded-xl border transition-all ${
                  mode === 'real'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Megaphone className={`w-6 h-6 ${mode === 'real' ? 'text-blue-600' : 'text-gray-500'}`} />
                  <div>
                    <p className="font-semibold text-gray-900">Real GD Lobby</p>
                    <p className="text-sm text-gray-600">
                      Practice the traditional PPDT follow-up with timers, self-assessment, and manual note taking.
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Mimics live GD dynamics with manual controls. Great for simulating assessment room pressure.
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMode('ai')}
                className={`text-left p-4 rounded-xl border transition-all ${
                  mode === 'ai'
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bot className={`w-6 h-6 ${mode === 'ai' ? 'text-purple-600' : 'text-gray-500'}`} />
                  <div>
                    <p className="font-semibold text-gray-900">AI Simulated GD</p>
                    <p className="text-sm text-gray-600">
                      Gemini powered multilingual GD with four AI candidates, idea bank, translation, and TTS/STT helpers.
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Receive real-time transcripts, assessor summary, and optional speech playback for immersive practice.
                </div>
              </button>
            </div>
          </div>

          {/* AI Simulation */}
          {mode === 'ai' && (
            <ErrorBoundary>
              <AIGDSimulator />
            </ErrorBoundary>
          )}

          {/* Instructions */}
          {mode === 'real' && showInstructions && (
            <div className="p-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">Group Discussion Instructions</h2>
                <div className="space-y-3 text-blue-800">
                  <p><strong>What is GD after PPDT?</strong></p>
                  <p>Group Discussion follows PPDT where candidates discuss their stories and perceptions. Assessors evaluate your leadership, confidence, communication skills, and ability to speak clearly.</p>
                  
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Duration:</strong> 15 minutes discussion</li>
                    <li><strong>Participants:</strong> 4-8 candidates (simulated here)</li>
                    <li><strong>Topic:</strong> Stories from PPDT and related themes</li>
                    <li><strong>Assessment Focus:</strong> Dominance, Leadership, Confidence, Speaking Clarity</li>
                    <li>Share your PPDT story first</li>
                    <li>Listen to others' stories respectfully</li>
                    <li>Contribute meaningfully to discussion</li>
                    <li>Show leadership without being aggressive</li>
                  </ul>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-green-800 mb-2">What TO DO:</h3>
                      <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
                        <li>Speak confidently and clearly</li>
                        <li>Listen actively to others</li>
                        <li>Take initiative in discussion</li>
                        <li>Support good ideas from others</li>
                        <li>Maintain positive body language</li>
                        <li>Stay calm and composed</li>
                      </ul>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h3 className="font-semibold text-red-800 mb-2">What NOT TO DO:</h3>
                      <ul className="list-disc list-inside text-red-700 space-y-1 text-sm">
                        <li>Don't interrupt others rudely</li>
                        <li>Don't be overly aggressive</li>
                        <li>Don't remain completely silent</li>
                        <li>Don't criticize others' stories</li>
                        <li>Don't monopolize the discussion</li>
                        <li>Don't show negative attitude</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Enter your PPDT story to begin discussion:
                  </label>
                  <textarea
                    value={userStory}
                    onChange={(e) => setUserStory(e.target.value)}
                    className="w-full h-24 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Paste or type your PPDT story here..."
                  />
                </div>
                
                <button 
                  onClick={startGD} 
                  disabled={!userStory.trim()}
                  className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Group Discussion
                </button>
              </div>
            </div>
          )}

          {/* GD Interface */}
          {mode === 'real' && gdStarted && (
            <div className="p-6">
              {/* Timer and Status */}
              <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center space-x-2 ${getTimeColor()} font-semibold`}>
                    <Timer className="w-5 h-5" />
                    <span>{formatTime(timeRemaining)}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Discussion Time Remaining
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">4 Participants</span>
                  </div>
                  <div className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Discussion Active
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Participant Stories */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">PPDT Stories Shared</h3>
                  
                  {sampleStories.map((story) => (
                    <div 
                      key={story.id} 
                      className={`p-4 rounded-lg border ${
                        story.participant === 'You' 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${
                          story.participant === 'You' 
                            ? 'text-blue-800' 
                            : 'text-gray-800'
                        }`}>
                          {story.participant}
                        </span>
                        {story.participant === 'You' && (
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                            Your Story
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{story.story}</p>
                    </div>
                  ))}
                </div>

                {/* Discussion Panel */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Discussion Topics</h3>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-800 mb-2">Current Discussion Points:</h4>
                    <ul className="space-y-2">
                      {gdTopics.map((topic, index) => (
                        <li key={index} className="text-sm text-yellow-700 flex items-start">
                          <span className="font-bold mr-2">{index + 1}.</span>
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Discussion Notes
                    </label>
                    <textarea
                      value={gdNotes}
                      onChange={(e) => setGdNotes(e.target.value)}
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Take notes on discussion points, your contributions, and key insights..."
                    />
                  </div>

                  {/* Self Assessment */}
                  <div className="bg-white p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3">Self Assessment</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="spoken"
                          checked={participantSpoken}
                          onChange={(e) => setParticipantSpoken(e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="spoken" className="text-sm text-gray-700">
                          I actively participated in discussion
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="leadership"
                          checked={leadershipShown}
                          onChange={(e) => setLeadershipShown(e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="leadership" className="text-sm text-gray-700">
                          I showed leadership qualities
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Confidence Level (1-5):
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={confidenceLevel}
                          onChange={(e) => setConfidenceLevel(e.target.value)}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{confidenceLevel}/5</span>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Speaking Clarity (1-5):
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={speakingClarity}
                          onChange={(e) => setSpeakingClarity(e.target.value)}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{speakingClarity}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete GD Button */}
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={handleGDComplete}
                  className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  Complete Discussion
                </button>
              </div>
            </div>
          )}

          {/* GD Results */}
          {mode === 'real' && currentPhase === 'conclusion' && (
            <div className="p-6">
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h2 className="text-xl font-semibold text-green-900 mb-4">Group Discussion Completed!</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Performance Summary */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-800 mb-3">Your Performance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Participation:</span>
                        <span className={`text-sm font-medium ${
                          participantSpoken ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {participantSpoken ? 'Active' : 'Needs Improvement'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Leadership:</span>
                        <span className={`text-sm font-medium ${
                          leadershipShown ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {leadershipShown ? 'Demonstrated' : 'Room for Growth'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Confidence:</span>
                        <span className="text-sm font-medium text-blue-600">
                          {confidenceLevel}/5
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Speaking Clarity:</span>
                        <span className="text-sm font-medium text-blue-600">
                          {speakingClarity}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Discussion Notes */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-800 mb-3">Your Notes</h3>
                    <div className="bg-gray-50 p-3 rounded-md min-h-32 text-sm text-gray-700">
                      {gdNotes || <em className="text-gray-500">No notes taken</em>}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Key Assessment Areas</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-blue-800">Dominance:</strong>
                      <p className="text-gray-600">How well you took charge of discussion</p>
                    </div>
                    <div>
                      <strong className="text-blue-800">Leadership:</strong>
                      <p className="text-gray-600">Initiative and guidance shown</p>
                    </div>
                    <div>
                      <strong className="text-blue-800">Confidence:</strong>
                      <p className="text-gray-600">Self-assurance in expressing views</p>
                    </div>
                    <div>
                      <strong className="text-blue-800">Speaking Clarity:</strong>
                      <p className="text-gray-600">Clear and effective communication</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button 
                    onClick={resetGD}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Practice Again
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

export default GroupDiscussion;