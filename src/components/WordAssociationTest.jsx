import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import { buildApiUrl } from '../config/env';
import Navbar from './Navbar';
import { Play, Pause, RotateCcw, Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useLoaderTask } from '../contexts/LoaderContext';

const WAT_API_BASE_URL = buildApiUrl('api/wat');

function WordAssociationTest() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const runWithLoader = useLoaderTask();
  
  // Test state
  const [isTestActive, setIsTestActive] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [timePerWord, setTimePerWord] = useState(15); // seconds
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [totalTime, setTotalTime] = useState(15 * 60); // 15 minutes total
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(15 * 60);
  const [responses, setResponses] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [words, setWords] = useState([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const inputRef = useRef(null);
  const wordTimerRef = useRef(null);
  const totalTimerRef = useRef(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        await runWithLoader(async () => {
          const user = await account.get();
          setUserDetails(user);
          setIsLoading(false);
        });
      } catch (err) {
        console.error('User not logged in:', err);
        navigate('/login');
      }
    }
    fetchUser();
  }, [navigate, runWithLoader]);

  useEffect(() => {
    if (isTestActive) {
      // Word timer
      wordTimerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleNextWord();
            return timePerWord;
          }
          return prev - 1;
        });
      }, 1000);

      // Total timer
      totalTimerRef.current = setInterval(() => {
        setTotalTimeRemaining(prev => {
          if (prev <= 1) {
            handleTestComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (wordTimerRef.current) clearInterval(wordTimerRef.current);
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    };
  }, [isTestActive, timePerWord]);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch {}
    navigate('/login');
  };

  const fetchWords = useCallback(async () => {
    try {
      await runWithLoader(async () => {
        const response = await fetch(`${WAT_API_BASE_URL}/words`);
        if (!response.ok) throw new Error('Failed to fetch words');
        const data = await response.json();
        setWords(data.words);
      });
    } catch (error) {
      console.error('Error fetching words:', error);
      // Fallback words if API fails
      setWords([
        'Leader', 'Failure', 'Success', 'Challenge', 'Team', 'Courage', 'Responsibility',
        'Trust', 'Initiative', 'Discipline', 'Confidence', 'Determination', 'Honesty',
        'Loyalty', 'Patience', 'Strength', 'Victory', 'Defeat', 'Goal', 'Mission',
        'Sacrifice', 'Duty', 'Honor', 'Pride', 'Risk', 'Decision', 'Problem', 'Solution',
        'Friend', 'Enemy', 'Family', 'Country', 'Service', 'Training', 'Excellence',
        'Commitment', 'Focus', 'Innovation', 'Adaptation', 'Perseverance', 'Cooperation',
        'Leadership', 'Follower', 'Competition', 'Achievement', 'Progress', 'Change',
        'Opportunity', 'Responsibility', 'Integrity', 'Dedication', 'Performance', 'Quality',
        'Standard', 'Efficiency', 'Teamwork', 'Communication', 'Strategy', 'Tactics'
      ]);
    }
  }, [runWithLoader]);

  const startTest = async () => {
    await fetchWords();
    setShowInstructions(false);
    setIsTestActive(true);
    setCurrentWordIndex(0);
    setTimeRemaining(timePerWord);
    setTotalTimeRemaining(totalTime);
    setResponses([]);
    setCurrentResponse('');
    setTestCompleted(false);
    setTestResults(null);
    
    // Focus on input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleNextWord = () => {
    // Save current response
    const newResponse = {
      word: words[currentWordIndex],
      response: currentResponse.trim(),
      timeUsed: timePerWord - timeRemaining
    };
    
    setResponses(prev => [...prev, newResponse]);
    setCurrentResponse('');
    
    if (currentWordIndex + 1 >= words.length) {
      handleTestComplete();
    } else {
      setCurrentWordIndex(prev => prev + 1);
      setTimeRemaining(timePerWord);
      
      // Focus on input for next word
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  };

  const handleSubmitResponse = () => {
    if (currentResponse.trim()) {
      handleNextWord();
    }
  };

  const handleTestComplete = async () => {
    setIsTestActive(false);
    clearInterval(wordTimerRef.current);
    clearInterval(totalTimerRef.current);
    
    // Add current response if test is manually completed
    const finalResponses = [...responses];
    if (currentResponse.trim() && currentWordIndex < words.length) {
      finalResponses.push({
        word: words[currentWordIndex],
        response: currentResponse.trim(),
        timeUsed: timePerWord - timeRemaining
      });
    }
    
    setResponses(finalResponses);
    setTestCompleted(true);
    setIsSubmitting(true);
    
    try {
      await runWithLoader(async () => {
        const response = await fetch(`${WAT_API_BASE_URL}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userDetails.$id,
            responses: finalResponses,
            totalTimeUsed: totalTime - totalTimeRemaining
          }),
        });

        if (!response.ok) throw new Error('Failed to submit test');

        const results = await response.json();
        setTestResults(results);
      });
    } catch (error) {
      console.error('Error submitting test:', error);
      // Show basic results even if submission fails
      setTestResults({
        score: Math.floor((finalResponses.filter(r => r.response.length > 0).length / words.length) * 100),
        completedWords: finalResponses.length,
        totalWords: words.length,
        feedback: "Test completed successfully! Results could not be saved to server."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetTest = () => {
    setIsTestActive(false);
    setCurrentWordIndex(0);
    setTimeRemaining(timePerWord);
    setTotalTimeRemaining(totalTime);
    setResponses([]);
    setCurrentResponse('');
    setTestCompleted(false);
    setTestResults(null);
    setShowInstructions(true);
    clearInterval(wordTimerRef.current);
    clearInterval(totalTimerRef.current);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="glassmorphic-dashboard-layout">
      {/* Aurora Background Effect */}
      <div className="dashboard-aurora"></div>
      
      {/* Floating Background Shapes */}
      <div className="dashboard-floating-shape shape-1"></div>
      <div className="dashboard-floating-shape shape-2"></div>
      <div className="dashboard-floating-shape shape-3"></div>
      <div className="dashboard-floating-shape shape-4"></div>
      <div className="dashboard-floating-shape shape-5"></div>
      
      {/* Sparkle Effects */}
      <div className="dashboard-sparkle sparkle-1"></div>
      <div className="dashboard-sparkle sparkle-2"></div>
      <div className="dashboard-sparkle sparkle-3"></div>

      <Navbar userDetails={userDetails} onLogout={handleLogout} />
      
      {/* Breadcrumb Navigation */}
      <div className="glassmorphic-breadcrumb-nav">
        <div className="glassmorphic-breadcrumb-container">
          <button 
            onClick={() => navigate('/ssb-drills')}
            className="glassmorphic-breadcrumb-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to SSB Drills</span>
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Word Association Test (WAT)</span>
        </div>
      </div>
      
      <div className="glassmorphic-dashboard-wrapper">
        <div className="glassmorphic-dashboard-card">
          {/* Floating particles inside card */}
          <div className="dashboard-particle particle-1"></div>
          <div className="dashboard-particle particle-2"></div>
          <div className="dashboard-particle particle-3"></div>

          <div className="glassmorphic-dashboard-content">
            <div className="glassmorphic-test-header">
              <h1 className="test-page-title">
                Word Association Test (WAT)
                <span className="progress-sparkle"></span>
              </h1>
            </div>

          {showInstructions && !testCompleted && (
            <div className="wat-instructions">
              <div className="instruction-card">
                <h2>Instructions</h2>
                <div className="instruction-content">
                  <p><strong>What is WAT?</strong></p>
                  <p>Word Association Test is a psychological test where you write the first thought that comes to your mind after seeing a word.</p>
                  
                  <ul>
                    <li>You'll see <strong>60 words</strong> for <strong>15 seconds each</strong></li>
                    <li>Write the <strong>first sentence</strong> that comes to your mind</li>
                    <li>Total time: <strong>15 minutes</strong></li>
                    <li>Focus on <strong>positive, action-oriented</strong> responses</li>
                    <li>Avoid negative words like "no", "never", "can't"</li>
                    <li>Be natural - don't memorize responses</li>
                  </ul>

                  <div className="example-section">
                    <h3>Examples:</h3>
                    <div className="example">
                      <strong>Word:</strong> Failure<br/>
                      <span className="good-response">✓ Good: "Failure teaches the way to success."</span><br/>
                      <span className="bad-response">✗ Avoid: "Failure is bad."</span>
                    </div>
                    <div className="example">
                      <strong>Word:</strong> Leader<br/>
                      <span className="good-response">✓ Good: "Leader inspires others by example."</span><br/>
                      <span className="bad-response">✗ Avoid: "Leader gives orders."</span>
                    </div>
                  </div>
                </div>
                
                <button onClick={startTest} className="start-test-button">
                  <Play className="w-5 h-5" />
                  Start Test
                </button>
              </div>
            </div>
          )}

          {isTestActive && (
            <div className="wat-test-interface">
              <div className="test-header">
                <div className="timer-section">
                  <div className="word-timer">
                    <Clock className="w-5 h-5" />
                    <span>Word: {timeRemaining}s</span>
                  </div>
                  <div className="total-timer">
                    <span>Total: {formatTime(totalTimeRemaining)}</span>
                  </div>
                </div>
                
                <div className="progress-section">
                  <span>Word {currentWordIndex + 1} of {words.length}</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="word-display">
                <h2 className="current-word">{words[currentWordIndex]}</h2>
              </div>

              <div className="response-section">
                <textarea
                  ref={inputRef}
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitResponse();
                    }
                  }}
                  placeholder="Write the first thought that comes to your mind..."
                  className="response-input"
                  rows={3}
                />
                
                <div className="response-controls">
                  <button 
                    onClick={handleSubmitResponse}
                    disabled={!currentResponse.trim()}
                    className="submit-response-button"
                  >
                    Next Word →
                  </button>
                  
                  <button 
                    onClick={handleTestComplete}
                    className="complete-test-button"
                  >
                    Complete Test
                  </button>
                </div>
              </div>

              <div className="test-controls">
                <button onClick={resetTest} className="reset-button">
                  <RotateCcw className="w-4 h-4" />
                  Reset Test
                </button>
              </div>
            </div>
          )}

          {testCompleted && (
            <div className="wat-results">
              <div className="results-card">
                <h2>Test Completed!</h2>
                
                {isSubmitting ? (
                  <div className="submitting-state">
                    <div className="spinner"></div>
                    <p>Analyzing your responses...</p>
                  </div>
                ) : testResults ? (
                  <div className="results-content">
                    <div className="results-summary">
                      <div className="result-stat">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <div>
                          <h3>{testResults.completedWords}/{testResults.totalWords}</h3>
                          <p>Words Completed</p>
                        </div>
                      </div>
                      
                      <div className="result-stat">
                        <AlertCircle className="w-8 h-8 text-blue-500" />
                        <div>
                          <h3>{testResults.score}%</h3>
                          <p>Completion Rate</p>
                        </div>
                      </div>
                    </div>

                    {testResults.feedback && (
                      <div className="feedback-section">
                        <h3>Feedback</h3>
                        <p>{testResults.feedback}</p>
                      </div>
                    )}

                    <div className="responses-review">
                      <h3>Your Responses</h3>
                      <div className="responses-list">
                        {responses.map((response, index) => (
                          <div key={index} className="response-item">
                            <div className="response-word">{response.word}</div>
                            <div className="response-text">
                              {response.response || <em>No response</em>}
                            </div>
                            <div className="response-time">{response.timeUsed}s</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="results-actions">
                  <button onClick={resetTest} className="retake-button">
                    <RotateCcw className="w-4 h-4" />
                    Take Test Again
                  </button>
                  
                  <button 
                    onClick={() => navigate('/ssb-drills')}
                    className="back-to-drills-button"
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
    </div>
  );
}

export default WordAssociationTest;