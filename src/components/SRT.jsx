import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import Navbar from './Navbar';
import { ArrowLeft, Clock, RotateCcw, CheckCircle, AlertTriangle, Play } from 'lucide-react';

function SRT() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Test state
  const [isTestActive, setIsTestActive] = useState(false);
  const [currentSituationIndex, setCurrentSituationIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes per situation
  const [responses, setResponses] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [testCompleted, setTestCompleted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const inputRef = useRef(null);

  // Sample SRT situations - 20 situations for demo
  const srtSituations = [
    "You are the group leader and two team members are arguing during an important meeting.",
    "Your friend asks you to help him cheat in an exam, but you know it's wrong.",
    "You see a senior colleague taking credit for your work in front of the boss.",
    "During a trek, your team member gets injured and needs immediate medical attention.",
    "You discover that your roommate is involved in drug dealing.",
    "In a group project, one member is not contributing but wants equal credit.",
    "You witness a hit-and-run accident where the victim is seriously injured.",
    "Your best friend asks you to lie to his parents about his whereabouts.",
    "During a fire drill, you notice that one exit is blocked and people are panicking.",
    "You find a wallet with a large amount of money on the street.",
    "Your team is behind schedule and everyone is blaming each other.",
    "You see someone drowning in a river and you know swimming but current is strong.",
    "Your colleague is spreading false rumors about you in the office.",
    "During an exam, you notice another student is copying from your paper.",
    "You are appointed as a team leader but face resistance from senior members.",
    "Your neighbor's house is on fire and their child is inside but they're not home.",
    "You discover that your subordinate has been embezzling company funds.",
    "During a group discussion, everyone is talking but no one is listening.",
    "You are offered a bribe to pass someone in a selection process.",
    "Your friend is addicted to alcohol and it's affecting his career and family."
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
    let timer;
    if (isTestActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleNextSituation();
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTestActive, timeRemaining]);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch {}
    navigate('/login');
  };

  const startTest = () => {
    setShowInstructions(false);
    setIsTestActive(true);
    setCurrentSituationIndex(0);
    setTimeRemaining(120);
    setResponses([]);
    setCurrentResponse('');
    setTestCompleted(false);
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleNextSituation = () => {
    const newResponse = {
      situationIndex: currentSituationIndex,
      situation: srtSituations[currentSituationIndex],
      response: currentResponse.trim(),
      timeUsed: 120 - timeRemaining
    };
    
    setResponses(prev => [...prev, newResponse]);
    setCurrentResponse('');
    
    if (currentSituationIndex + 1 >= srtSituations.length) {
      handleTestComplete();
    } else {
      setCurrentSituationIndex(prev => prev + 1);
      setTimeRemaining(120);
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  };

  const handleSubmitResponse = () => {
    if (currentResponse.trim()) {
      handleNextSituation();
    }
  };

  const handleTestComplete = () => {
    setIsTestActive(false);
    const finalResponses = [...responses];
    if (currentResponse.trim() && currentSituationIndex < srtSituations.length) {
      finalResponses.push({
        situationIndex: currentSituationIndex,
        situation: srtSituations[currentSituationIndex],
        response: currentResponse.trim(),
        timeUsed: 120 - timeRemaining
      });
    }
    setResponses(finalResponses);
    setTestCompleted(true);
  };

  const resetTest = () => {
    setIsTestActive(false);
    setCurrentSituationIndex(0);
    setTimeRemaining(120);
    setResponses([]);
    setCurrentResponse('');
    setTestCompleted(false);
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
    if (timeRemaining > 90) return 'text-green-600';
    if (timeRemaining > 30) return 'text-yellow-600';
    return 'text-red-600';
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
            <span className="text-gray-700 font-medium">Situation Reaction Test (SRT)</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-gray-100 px-6 py-4 border-b">
            <h1 className="text-xl font-semibold text-gray-800">
              SSB Drills &gt; Situation Reaction Test (SRT)
            </h1>
          </div>

          {showInstructions && !testCompleted && (
            <div className="p-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">Instructions</h2>
                <div className="space-y-3 text-blue-800">
                  <p><strong>What is SRT?</strong></p>
                  <p>Situation Reaction Test presents you with real-life situations where you need to react quickly and decisively.</p>
                  
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Total Situations:</strong> 60 real-life scenarios (20 for demo)</li>
                    <li><strong>Time per Situation:</strong> 2 minutes maximum</li>
                    <li>Write your immediate reaction to each situation</li>
                    <li>Focus on practical solutions and leadership</li>
                  </ul>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
                    <h3 className="font-semibold text-green-800 mb-2">Good Response Tips:</h3>
                    <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
                      <li>Quick and decisive action</li>
                      <li>Shows leadership and responsibility</li>
                      <li>Practical and realistic solutions</li>
                      <li>Positive and constructive approach</li>
                    </ul>
                  </div>
                </div>
                
                <button 
                  onClick={startTest} 
                  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Start SRT Test</span>
                </button>
              </div>
            </div>
          )}

          {isTestActive && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
                <div className={`flex items-center space-x-2 ${getTimeColor()} font-semibold`}>
                  <Clock className="w-5 h-5" />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
                <div className="text-sm font-medium">
                  Situation {currentSituationIndex + 1} of {srtSituations.length}
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentSituationIndex + 1) / srtSituations.length) * 100}%` }}
                ></div>
              </div>

              <div className="mb-6">
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 mb-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-2">Situation {currentSituationIndex + 1}:</h3>
                      <p className="text-yellow-800 leading-relaxed">
                        {srtSituations[currentSituationIndex]}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reaction:
                  </label>
                  <textarea
                    ref={inputRef}
                    value={currentResponse}
                    onChange={(e) => setCurrentResponse(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault();
                        handleSubmitResponse();
                      }
                    }}
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Write your immediate reaction and action plan..."
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button 
                  onClick={resetTest}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Test</span>
                </button>
                
                <div className="space-x-3">
                  <button 
                    onClick={handleSubmitResponse}
                    disabled={!currentResponse.trim()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {currentSituationIndex === srtSituations.length - 1 ? 'Complete Test' : 'Next Situation →'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {testCompleted && (
            <div className="p-6">
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-green-900">SRT Test Completed!</h2>
                </div>
                
                <div className="bg-white p-4 rounded-lg border mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Performance Summary</h3>
                  <p className="text-gray-700">
                    Completed {responses.length} situations. Great job on quick decision-making!
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button 
                    onClick={resetTest}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Take Test Again
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

export default SRT;