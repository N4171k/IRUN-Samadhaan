import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import Navbar from './Navbar';
import { ArrowLeft, User, FileText, MessageCircle, Clock, Star, CheckCircle } from 'lucide-react';

function PersonalInterview() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState('preparation');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [responses, setResponses] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  // Sample PI questions based on common SSB interview patterns
  const piQuestions = [
    {
      category: "Personal Background",
      questions: [
        "Tell me about yourself and your family background.",
        "What are your hobbies and how do they help you?",
        "Describe your educational journey and achievements.",
        "What are your strengths and weaknesses?",
        "How do you handle stress and pressure?"
      ]
    },
    {
      category: "Motivation & Goals",
      questions: [
        "Why do you want to join the Armed Forces?",
        "What specific branch interests you and why?",
        "What are your short-term and long-term goals?",
        "How do you plan to contribute to the nation?",
        "What motivates you to become an officer?"
      ]
    },
    {
      category: "Current Affairs & Knowledge",
      questions: [
        "What are the current major challenges facing India?",
        "Tell me about recent defense developments in India.",
        "What is your opinion on India's foreign policy?",
        "Discuss any recent military operation you're aware of.",
        "What are your views on modernization of Armed Forces?"
      ]
    },
    {
      category: "Leadership & Scenarios",
      questions: [
        "Describe a situation where you showed leadership.",
        "How would you handle a conflict within your team?",
        "What qualities make a good military officer?",
        "How do you motivate people who are not performing well?",
        "Describe a challenging decision you had to make."
      ]
    },
    {
      category: "Service & Commitment",
      questions: [
        "Are you prepared for the challenges of military life?",
        "How will you maintain work-life balance in service?",
        "What if you're posted in a remote location?",
        "How do you view the concept of 'Service before Self'?",
        "What are your expectations from military service?"
      ]
    }
  ];

  const preparationTips = {
    general: [
      "Research your application thoroughly - know everything you wrote",
      "Stay updated with current affairs, especially defense-related news",
      "Practice answering questions confidently and honestly",
      "Prepare examples from your life that demonstrate leadership qualities",
      "Understand the branch you're applying for in detail"
    ],
    documentation: [
      "Know your family history and background well",
      "Be clear about your educational achievements",
      "Understand your hobbies and how they've shaped you",
      "Remember important dates and events in your life",
      "Be honest about your strengths and areas for improvement"
    ],
    presentation: [
      "Maintain good posture and eye contact",
      "Speak clearly and at appropriate pace",
      "Show enthusiasm and genuine interest",
      "Be confident but not arrogant",
      "Listen carefully to the complete question before answering"
    ]
  };

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

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch {}
    navigate('/login');
  };

  const startInterview = () => {
    setCurrentSection('interview');
    setInterviewStarted(true);
    setCurrentQuestionIndex(0);
    setResponses({});
    setInterviewCompleted(false);
  };

  const handleResponse = (response) => {
    const currentCategory = piQuestions[Math.floor(currentQuestionIndex / 5)];
    const questionIndex = currentQuestionIndex % 5;
    
    setResponses(prev => ({
      ...prev,
      [`${currentCategory.category}_${questionIndex}`]: {
        question: currentCategory.questions[questionIndex],
        response: response,
        category: currentCategory.category
      }
    }));
  };

  const nextQuestion = () => {
    const totalQuestions = piQuestions.reduce((sum, cat) => sum + cat.questions.length, 0);
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      completeInterview();
    }
  };

  const completeInterview = () => {
    setInterviewStarted(false);
    setInterviewCompleted(true);
    setCurrentSection('completed');
  };

  const resetInterview = () => {
    setCurrentSection('preparation');
    setInterviewStarted(false);
    setCurrentQuestionIndex(0);
    setResponses({});
    setInterviewCompleted(false);
  };

  const getCurrentQuestion = () => {
    const categoryIndex = Math.floor(currentQuestionIndex / 5);
    const questionIndex = currentQuestionIndex % 5;
    
    if (categoryIndex < piQuestions.length) {
      return {
        category: piQuestions[categoryIndex].category,
        question: piQuestions[categoryIndex].questions[questionIndex],
        progress: {
          current: currentQuestionIndex + 1,
          total: piQuestions.reduce((sum, cat) => sum + cat.questions.length, 0)
        }
      };
    }
    return null;
  };

  const handleBackToSSB = () => {
    navigate('/ssb-drills');
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
            <span className="text-gray-700 font-medium">Personal Interview (PI)</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-gray-100 px-6 py-4 border-b">
            <h1 className="text-xl font-semibold text-gray-800">
              SSB Drills &gt; Personal Interview (PI)
            </h1>
          </div>

          {/* Preparation Section */}
          {currentSection === 'preparation' && (
            <div className="p-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mb-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">Personal Interview Preparation</h2>
                <div className="space-y-3 text-blue-800">
                  <p>
                    The Personal Interview is conducted by the Interviewing Officer (IO) and is crucial for your final selection. 
                    It assesses your personality, motivation, knowledge, and suitability for military service.
                  </p>
                  
                  <div className="bg-white p-4 rounded-lg border border-blue-200 mt-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Interview Duration & Format:</h3>
                    <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
                      <li><strong>Duration:</strong> 45-60 minutes typically</li>
                      <li><strong>Style:</strong> Conversational and probing</li>
                      <li><strong>Focus:</strong> Your background, motivation, knowledge, and personality</li>
                      <li><strong>Assessment:</strong> Honesty, confidence, knowledge, and officer potential</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Preparation Tips */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {Object.entries(preparationTips).map(([category, tips]) => (
                  <div key={category} className="bg-white border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 capitalize flex items-center">
                      {category === 'general' && <Star className="w-5 h-5 mr-2 text-yellow-600" />}
                      {category === 'documentation' && <FileText className="w-5 h-5 mr-2 text-blue-600" />}
                      {category === 'presentation' && <MessageCircle className="w-5 h-5 mr-2 text-green-600" />}
                      {category.replace(/([A-Z])/g, ' $1')} Tips
                    </h3>
                    <ul className="space-y-2">
                      {tips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-2 mr-2"></span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* User Information Display */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                <div className="flex items-center mb-3">
                  <User className="w-5 h-5 text-yellow-600 mr-2" />
                  <h3 className="font-semibold text-yellow-800">Your Profile Information</h3>
                </div>
                <div className="text-sm text-yellow-700">
                  <p><strong>Name:</strong> {userDetails?.name || 'Not provided'}</p>
                  <p><strong>Email:</strong> {userDetails?.email || 'Not provided'}</p>
                  <p className="text-xs mt-2 italic">
                    * Interview questions will be based on your background and application. Make sure you're familiar with all information you've provided.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <button 
                  onClick={startInterview}
                  className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Start Practice Interview
                </button>
              </div>
            </div>
          )}

          {/* Interview Section */}
          {interviewStarted && currentSection === 'interview' && (
            <div className="p-6">
              {(() => {
                const currentQ = getCurrentQuestion();
                return currentQ ? (
                  <>
                    {/* Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Question {currentQ.progress.current} of {currentQ.progress.total}</span>
                        <span>{currentQ.category}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(currentQ.progress.current / currentQ.progress.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Question */}
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                      <div className="flex items-start space-x-3">
                        <MessageCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                          <div className="text-sm text-blue-600 font-medium mb-2">
                            Interviewing Officer asks:
                          </div>
                          <h2 className="text-lg font-semibold text-blue-900">
                            {currentQ.question}
                          </h2>
                        </div>
                      </div>
                    </div>

                    {/* Response Area */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Response:
                      </label>
                      <textarea
                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Type your response here... Be honest, confident, and specific."
                        onChange={(e) => handleResponse(e.target.value)}
                      />
                      <div className="text-xs text-gray-500 mt-2">
                        💡 Tip: Take your time to think, speak clearly, and use specific examples from your life
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                      <button 
                        onClick={resetInterview}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Reset Interview
                      </button>
                      
                      <button
                        onClick={nextQuestion}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                      >
                        {currentQ.progress.current === currentQ.progress.total ? 'Complete Interview' : 'Next Question →'}
                      </button>
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          )}

          {/* Completion Section */}
          {currentSection === 'completed' && (
            <div className="p-6">
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-green-900">Interview Practice Completed!</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Summary */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-800 mb-3">Practice Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Questions Answered:</span>
                        <span className="font-medium text-gray-800">{Object.keys(responses).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Categories Covered:</span>
                        <span className="font-medium text-gray-800">{piQuestions.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Points */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-800 mb-3">Remember for Actual Interview</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5 mr-2" />
                        <span>Be honest and authentic</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5 mr-2" />
                        <span>Maintain eye contact and confident posture</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5 mr-2" />
                        <span>Support answers with specific examples</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5 mr-2" />
                        <span>Show genuine enthusiasm for service</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Final Advice</h3>
                  <p className="text-gray-700 text-sm">
                    The Personal Interview is your opportunity to showcase your personality and motivation. 
                    Be yourself, stay calm, and remember that the interviewer wants to understand you as a person. 
                    Your genuine responses and authentic personality are your greatest assets.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button 
                    onClick={resetInterview}
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

export default PersonalInterview;