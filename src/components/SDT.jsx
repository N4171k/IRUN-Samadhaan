import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import Navbar from './Navbar';
import { ArrowLeft, Users, Heart, UserCheck, Eye, RotateCcw, CheckCircle } from 'lucide-react';

function SDT() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Test state
  const [testStarted, setTestStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // SDT sections - what different people think about you
  const sdtSections = [
    {
      id: 'parents',
      title: 'What your Parents think about you',
      icon: <Heart className="w-6 h-6" />,
      description: 'How do your parents perceive your personality, behavior, and character?',
      prompts: [
        'Your strengths as seen by your parents',
        'Areas where your parents think you need improvement',
        'Your parents\' expectations from you',
        'How your parents describe you to others'
      ]
    },
    {
      id: 'siblings',
      title: 'What your Brothers/Sisters think about you',
      icon: <Users className="w-6 h-6" />,
      description: 'How do your siblings view your personality and behavior?',
      prompts: [
        'Your role in the family as seen by siblings',
        'How you handle conflicts with siblings',
        'Your leadership qualities among siblings',
        'What siblings appreciate most about you'
      ]
    },
    {
      id: 'friends',
      title: 'What your Friends think about you',
      icon: <UserCheck className="w-6 h-6" />,
      description: 'How do your friends perceive your personality in social situations?',
      prompts: [
        'Your role in friend groups',
        'How you support friends in difficult times',
        'Your social and communication skills',
        'What makes you a good friend'
      ]
    },
    {
      id: 'teachers',
      title: 'What your Teachers think about you',
      icon: <Eye className="w-6 h-6" />,
      description: 'How do your teachers/mentors view your academic and personal qualities?',
      prompts: [
        'Your academic discipline and attitude',
        'Your participation in class activities',
        'Your leadership in academic projects',
        'Your potential as seen by teachers'
      ]
    },
    {
      id: 'self',
      title: 'What YOU think about yourself',
      icon: <Eye className="w-6 h-6" />,
      description: 'This is the most important - your honest self-assessment',
      prompts: [
        'Your greatest strengths and abilities',
        'Areas where you want to improve',
        'Your life goals and ambitions',
        'How you handle challenges and failures',
        'Your leadership style and approach',
        'Your core values and principles'
      ],
      isImportant: true
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

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch {}
    navigate('/login');
  };

  const startTest = () => {
    setShowInstructions(false);
    setTestStarted(true);
    setCurrentSection(0);
    setResponses({});
    setTestCompleted(false);
  };

  const handleResponseChange = (sectionId, value) => {
    setResponses(prev => ({
      ...prev,
      [sectionId]: value
    }));
  };

  const handleNextSection = () => {
    if (currentSection < sdtSections.length - 1) {
      setCurrentSection(prev => prev + 1);
    } else {
      handleTestComplete();
    }
  };

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const handleTestComplete = () => {
    setTestStarted(false);
    setTestCompleted(true);
  };

  const resetTest = () => {
    setTestStarted(false);
    setCurrentSection(0);
    setResponses({});
    setTestCompleted(false);
    setShowInstructions(true);
  };

  const handleBackToSSB = () => {
    navigate('/ssb-drills');
  };

  const getCurrentResponse = () => {
    const currentSectionId = sdtSections[currentSection]?.id;
    return responses[currentSectionId] || '';
  };

  const setCurrentResponse = (value) => {
    const currentSectionId = sdtSections[currentSection]?.id;
    handleResponseChange(currentSectionId, value);
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
            <span className="text-gray-700 font-medium">Self Description Test (SDT)</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-gray-100 px-6 py-4 border-b">
            <h1 className="text-xl font-semibold text-gray-800">
              SSB Drills &gt; Self Description Test (SDT)
            </h1>
          </div>

          {showInstructions && !testCompleted && (
            <div className="p-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">Instructions</h2>
                <div className="space-y-3 text-blue-800">
                  <p><strong>What is SDT?</strong></p>
                  <p>Self Description Test evaluates how you perceive yourself and how others perceive you. This reveals your self-awareness, honesty, and understanding of your personality from different perspectives.</p>
                  
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>5 Perspectives:</strong> Parents, Siblings, Friends, Teachers, and most importantly - Yourself</li>
                    <li><strong>Purpose:</strong> Assess self-awareness and honest self-reflection</li>
                    <li>Be honest and authentic in your responses</li>
                    <li>Think from each person's perspective genuinely</li>
                    <li>The self-assessment section is most critical</li>
                  </ul>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-green-800 mb-2">What Assessors Look For:</h3>
                      <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
                        <li>Self-awareness and maturity</li>
                        <li>Honesty and authenticity</li>
                        <li>Consistency across perspectives</li>
                        <li>Balanced self-assessment</li>
                        <li>Recognition of strengths and weaknesses</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold text-yellow-800 mb-2">Tips for Better Response:</h3>
                      <ul className="list-disc list-inside text-yellow-700 space-y-1 text-sm">
                        <li>Be specific with examples</li>
                        <li>Avoid extreme statements</li>
                        <li>Show growth mindset</li>
                        <li>Balance positive and areas of improvement</li>
                        <li>Reflect genuine relationships</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={startTest} 
                  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Start SDT Test
                </button>
              </div>
            </div>
          )}

          {testStarted && (
            <div className="p-6">
              {/* Progress indicator */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Section {currentSection + 1} of {sdtSections.length}
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(((currentSection + 1) / sdtSections.length) * 100)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentSection + 1) / sdtSections.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Current section */}
              <div className="bg-white border rounded-lg p-6">
                <div className={`flex items-center space-x-3 mb-4 ${
                  sdtSections[currentSection].isImportant ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {sdtSections[currentSection].icon}
                  <h2 className="text-xl font-semibold">
                    {sdtSections[currentSection].title}
                    {sdtSections[currentSection].isImportant && (
                      <span className="text-red-500 ml-2 text-sm">(Most Important)</span>
                    )}
                  </h2>
                </div>

                <p className="text-gray-600 mb-4">
                  {sdtSections[currentSection].description}
                </p>

                {/* Prompts */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Consider these aspects:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {sdtSections[currentSection].prompts.map((prompt, index) => (
                      <li key={index}>{prompt}</li>
                    ))}
                  </ul>
                </div>

                {/* Response textarea */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response:
                  </label>
                  <textarea
                    value={getCurrentResponse()}
                    onChange={(e) => setCurrentResponse(e.target.value)}
                    className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder={`Write how ${sdtSections[currentSection].title.toLowerCase()} in detail...`}
                  />
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>Characters: {getCurrentResponse().length}</span>
                    <span>Be honest and specific with examples</span>
                  </div>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center mt-6">
                <button 
                  onClick={handlePreviousSection}
                  disabled={currentSection === 0}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <div className="flex space-x-3">
                  <button 
                    onClick={resetTest}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>

                  <button 
                    onClick={handleNextSection}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    {currentSection === sdtSections.length - 1 ? 'Complete Test' : 'Next →'}
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
                  <h2 className="text-xl font-semibold text-green-900">SDT Test Completed!</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Summary */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-800 mb-3">Test Summary</h3>
                    <div className="space-y-2 text-sm">
                      {sdtSections.map((section) => (
                        <div key={section.id} className="flex justify-between items-center">
                          <span className="text-gray-600">{section.title}:</span>
                          <span className={`font-medium ${
                            responses[section.id] && responses[section.id].length > 50 
                              ? 'text-green-600' 
                              : 'text-yellow-600'
                          }`}>
                            {responses[section.id] ? 
                              `${responses[section.id].length} chars` : 
                              'Not completed'
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-800 mb-3">Key Assessment Areas</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div>
                        <strong className="text-blue-800">Self-Awareness:</strong>
                        <span> How well you understand yourself</span>
                      </div>
                      <div>
                        <strong className="text-blue-800">Consistency:</strong>
                        <span> Alignment between different perspectives</span>
                      </div>
                      <div>
                        <strong className="text-blue-800">Honesty:</strong>
                        <span> Authenticity in self-description</span>
                      </div>
                      <div>
                        <strong className="text-blue-800">Maturity:</strong>
                        <span> Balanced view of strengths and weaknesses</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Next Steps</h3>
                  <p className="text-gray-700 text-sm">
                    Your SDT responses provide insights into your self-awareness and personality. 
                    This information will be valuable for your Personal Interview preparation.
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
                    onClick={() => navigate('/pi')}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Prepare for Personal Interview
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

export default SDT;