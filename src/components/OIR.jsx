import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import Navbar from './Navbar';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import VerbalQuestion from './oir/VerbalQuestion';
import NonVerbalQuestion from './oir/NonVerbalQuestion';
import TestTimer from './oir/TestTimer';
import TestResults from './oir/TestResults';
import ErrorBoundary from './oir/ErrorBoundary';
import OIRTestService from '../services/oirTestService';

function OIR() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Test state
  const [isTestActive, setIsTestActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes total
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [testData, setTestData] = useState(null);
  const [oirService] = useState(() => new OIRTestService());
  const [isSubmitting, setIsSubmitting] = useState(false);



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
    let intervalId;
    if (isTestActive && timeRemaining > 0) {
      intervalId = setInterval(() => {
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
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTestActive, timeRemaining]);

  const handleLogout = useCallback(async () => {
    try {
      await account.deleteSession('current');
    } catch {}
    navigate('/login');
  }, [navigate]);

  const startTest = useCallback(async () => {
    try {
      setIsLoading(true);
      const generatedTest = await oirService.generateTest();
      setTestData(generatedTest);
      setQuestions(generatedTest.questions);
      setShowInstructions(false);
      setIsTestActive(true);
      setCurrentQuestionIndex(0);
      setTimeRemaining(generatedTest.time_limit_minutes * 60);
      setAnswers({});
      setTestCompleted(false);
      setTestResults(null);
    } catch (error) {
      console.error('Failed to generate test:', error);
      alert('Failed to generate test. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [oirService]);

  const handleAnswerSelect = useCallback((questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex + 1 >= questions.length) {
      handleTestComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleTestComplete = async () => {
    setIsTestActive(false);
    setIsSubmitting(true);
    
    try {
      const submission = {
        test_id: testData.test_id,
        answers: answers,
        time_taken: (testData.time_limit_minutes * 60) - timeRemaining,
        completed_at: new Date().toISOString()
      };
      
      const results = await oirService.submitTest(
        testData.test_id, 
        answers, 
        (testData.time_limit_minutes * 60) - timeRemaining
      );
      setTestResults(results);
      setTestCompleted(true);
    } catch (error) {
      console.error('Failed to submit test:', error);
      alert('Failed to submit test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetTest = () => {
    setIsTestActive(false);
    setCurrentQuestionIndex(0);
    setTimeRemaining(1800);
    setAnswers({});
    setTestCompleted(false);
    setTestResults(null);
    setShowInstructions(true);
    setTestData(null);
    setQuestions([]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToSSB = () => {
    navigate('/ssb-drills');
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
            onClick={handleBackToSSB}
            className="glassmorphic-breadcrumb-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to SSB Drills</span>
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Officer Intelligence Rating (OIR)</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="glassmorphic-dashboard-wrapper">
        <div className="glassmorphic-dashboard-card">
          {/* Floating particles inside card */}
          <div className="dashboard-particle particle-1"></div>
          <div className="dashboard-particle particle-2"></div>
          <div className="dashboard-particle particle-3"></div>

          <div className="glassmorphic-dashboard-content">
            {/* Test Header */}
            <div className="glassmorphic-test-header">
              <h1 className="test-page-title">
                Officer Intelligence Rating (OIR)
                <span className="progress-sparkle"></span>
              </h1>
            </div>

          {/* Instructions */}
          {showInstructions && !testCompleted && (
            <div className="p-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">Instructions</h2>
                <div className="space-y-3 text-blue-800">
                  <p><strong>What is OIR?</strong></p>
                  <p>Officer Intelligence Rating test evaluates your logical reasoning, mathematical ability, and problem-solving skills.</p>
                  
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Total Questions:</strong> 20 questions (10 verbal + 10 non-verbal)</li>
                    <li><strong>Total Time:</strong> 30 minutes</li>
                    <li><strong>Question Types:</strong> Verbal reasoning, Non-verbal pattern recognition</li>
                    <li>Choose the best answer for each question</li>
                    <li>You can navigate between questions freely</li>
                    <li>No negative marking</li>
                    <li>Test auto-submits when time expires</li>
                  </ul>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
                    <h3 className="font-semibold text-yellow-800">Tips:</h3>
                    <ul className="list-disc list-inside text-yellow-700 space-y-1 mt-2">
                      <li>Read each question carefully</li>
                      <li>Don't spend too much time on difficult questions</li>
                      <li>Use elimination method for multiple choice</li>
                      <li>Practice mental calculations quickly</li>
                    </ul>
                  </div>
                </div>
                
                <button 
                  onClick={startTest} 
                  disabled={isLoading}
                  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Generating Test...' : 'Start OIR Test'}
                </button>
              </div>
            </div>
          )}

          {/* Test Interface */}
          {isTestActive && questions.length > 0 && (
            <div className="p-6">
              {/* Test Timer */}
              <TestTimer 
                totalTimeInMinutes={testData?.time_limit_minutes || 30}
                timeRemaining={timeRemaining}
                totalQuestions={questions.length}
                currentQuestionIndex={currentQuestionIndex}
                onTimeUp={handleTestComplete}
                isActive={isTestActive}
              />

              {/* Question Component */}
              <div className="mb-6">
                <ErrorBoundary showDetails={true}>
                  {questions[currentQuestionIndex].type === 'verbal' ? (
                    <VerbalQuestion 
                      question={questions[currentQuestionIndex]}
                      selectedAnswer={answers[questions[currentQuestionIndex].id]}
                      onAnswerSelect={(answer) => handleAnswerSelect(questions[currentQuestionIndex].id, answer)}
                    />
                  ) : (
                    <NonVerbalQuestion 
                      question={questions[currentQuestionIndex]}
                      selectedAnswer={answers[questions[currentQuestionIndex].id]}
                      onAnswerSelect={(answer) => handleAnswerSelect(questions[currentQuestionIndex].id, answer)}
                    />
                  )}
                </ErrorBoundary>
              </div>

              {/* Navigation Controls */}
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
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {currentQuestionIndex === questions.length - 1 ? (
                    <button 
                      onClick={handleTestComplete}
                      disabled={isSubmitting}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Test'}
                    </button>
                  ) : (
                    <button 
                      onClick={handleNextQuestion}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      Next Question
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Test Results */}
          {testCompleted && testResults && (
            <div className="p-6">
              <TestResults 
                results={testResults}
                onRetakeTest={resetTest}
                onBackToSSB={handleBackToSSB}
              />
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OIR;