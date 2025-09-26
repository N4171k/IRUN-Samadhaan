import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import Navbar from './Navbar';
import { ArrowLeft, Lightbulb, CheckCircle, Clock, Users, FileText, Award } from 'lucide-react';

function ConferenceTips() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('overview');

  const tipCategories = {
    overview: {
      title: 'Conference Day Overview',
      icon: <FileText className="w-6 h-6" />,
      content: {
        introduction: "Conference Day is the final stage of SSB where all assessors discuss your performance across all tests and activities. It's where final merit listing happens.",
        keyPoints: [
          "All assessors (Psychologist, GTO, CO, IO) discuss your case",
          "Your performance is reviewed holistically",
          "Merit list is prepared based on comprehensive assessment",
          "Final recommendations are made for selection",
          "Usually happens on the last day of SSB"
        ],
        timeline: "Typically occurs on Day 5 of the SSB process"
      }
    },
    preparation: {
      title: 'How to Prepare',
      icon: <CheckCircle className="w-6 h-6" />,
      content: {
        beforeConference: [
          "Review your entire SSB journey - all tests and performances",
          "Be honest and authentic in all final interactions",
          "Maintain consistency in your responses and behavior",
          "Stay confident but humble throughout the process",
          "Prepare for possible last-minute clarifications"
        ],
        mentalPreparation: [
          "Accept that the process is now largely out of your control",
          "Focus on presenting your authentic self",
          "Stay calm and composed if called for clarifications",
          "Trust the process and your preparation",
          "Prepare mentally for any outcome"
        ]
      }
    },
    dos: {
      title: 'What TO DO',
      icon: <CheckCircle className="w-6 h-6" />,
      content: {
        behavior: [
          "Maintain consistent behavior till the very end",
          "Be respectful to all staff and fellow candidates",
          "Show genuine interest in the process",
          "Display positive attitude and energy",
          "Help fellow candidates when appropriate"
        ],
        interaction: [
          "Answer any clarifications honestly and directly",
          "Maintain eye contact during conversations",
          "Use confident body language",
          "Be punctual for all final activities",
          "Show gratitude for the opportunity"
        ],
        finalMoments: [
          "Pack your belongings neatly",
          "Thank the staff for their guidance",
          "Exchange contacts with fellow candidates appropriately",
          "Leave the premises with dignity regardless of result",
          "Stay humble in victory or defeat"
        ]
      }
    },
    donts: {
      title: 'What NOT TO DO',
      icon: <Award className="w-6 h-6" />,
      content: {
        behaviorToAvoid: [
          "Don't try to influence assessors with extra information",
          "Don't compare your performance with other candidates",
          "Don't show overconfidence or arrogance",
          "Don't appear desperate or pleading",
          "Don't discuss confidential test details"
        ],
        commonMistakes: [
          "Don't change your personality suddenly on the last day",
          "Don't try to guess what assessors want to hear",
          "Don't get into arguments with fellow candidates",
          "Don't show disappointment if things don't go as expected",
          "Don't make negative comments about the process"
        ]
      }
    },
    tips: {
      title: 'Pro Tips & Tricks',
      icon: <Lightbulb className="w-6 h-6" />,
      content: {
        insiderTips: [
          "Assessors observe you even during informal moments",
          "Your behavior with subordinate staff is noted",
          "Consistency across all tests matters more than excellence in one",
          "Natural behavior is valued over 'learned' responses",
          "Your reactions to stress and pressure are being evaluated"
        ],
        strategicAdvice: [
          "Focus on being your authentic best self",
          "Demonstrate the 15 Officer Like Qualities naturally",
          "Show genuine care for fellow candidates",
          "Maintain military bearing without being artificial",
          "Display emotional maturity in all situations"
        ],
        lastMinuteTips: [
          "Get adequate rest the night before conference day",
          "Eat a proper breakfast to maintain energy levels",
          "Dress smartly and maintain good grooming",
          "Carry yourself with quiet confidence",
          "Remember that your journey itself is an achievement"
        ]
      }
    },
    psychology: {
      title: 'Psychology Behind Conference',
      icon: <Users className="w-6 h-6" />,
      content: {
        assessorPerspective: [
          "Assessors look for consistency in your behavior pattern",
          "They evaluate your suitability for military leadership",
          "Your potential for growth and adaptability is assessed",
          "Team dynamics and social compatibility are considered",
          "Long-term officer potential is the primary focus"
        ],
        selectionCriteria: [
          "Officer Like Qualities (OLQs) demonstration",
          "Psychological suitability for military service",
          "Leadership potential and character",
          "Ability to perform under pressure",
          "Compatibility with military ethos and values"
        ]
      }
    }
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
            <span className="text-gray-700 font-medium">Conference Day Tips & Tricks</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-gray-100 px-6 py-4 border-b">
            <h1 className="text-xl font-semibold text-gray-800">
              SSB Drills &gt; Conference Day Tips & Tricks
            </h1>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-1/4 bg-gray-50 border-r">
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Topics</h3>
                <nav className="space-y-2">
                  {Object.entries(tipCategories).map(([key, category]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === key
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category.icon}
                      <span className="text-sm font-medium">{category.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  {tipCategories[selectedCategory].icon}
                  <h2 className="text-2xl font-bold text-gray-800">
                    {tipCategories[selectedCategory].title}
                  </h2>
                </div>

                {/* Content based on selected category */}
                {selectedCategory === 'overview' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-blue-800 leading-relaxed">
                        {tipCategories[selectedCategory].content.introduction}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Key Points:</h3>
                      <ul className="space-y-2">
                        {tipCategories[selectedCategory].content.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <h4 className="font-semibold text-yellow-800">Timeline</h4>
                      </div>
                      <p className="text-yellow-700">{tipCategories[selectedCategory].content.timeline}</p>
                    </div>
                  </div>
                )}

                {selectedCategory === 'preparation' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Before Conference Day:</h3>
                      <ul className="space-y-2">
                        {tipCategories[selectedCategory].content.beforeConference.map((tip, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Mental Preparation:</h3>
                      <ul className="space-y-2">
                        {tipCategories[selectedCategory].content.mentalPreparation.map((tip, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {selectedCategory === 'dos' && (
                  <div className="space-y-6">
                    {Object.entries(tipCategories[selectedCategory].content).map(([sectionKey, tips]) => (
                      <div key={sectionKey}>
                        <h3 className="font-semibold text-gray-800 mb-3 capitalize">
                          {sectionKey.replace(/([A-Z])/g, ' $1').trim()}:
                        </h3>
                        <ul className="space-y-2">
                          {tips.map((tip, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {selectedCategory === 'donts' && (
                  <div className="space-y-6">
                    {Object.entries(tipCategories[selectedCategory].content).map(([sectionKey, tips]) => (
                      <div key={sectionKey}>
                        <h3 className="font-semibold text-gray-800 mb-3 capitalize">
                          {sectionKey.replace(/([A-Z])/g, ' $1').trim()}:
                        </h3>
                        <ul className="space-y-2">
                          {tips.map((tip, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                                <div className="w-5 h-5 bg-red-100 border-2 border-red-600 rounded-full flex items-center justify-center">
                                  <span className="text-red-600 font-bold text-xs">✕</span>
                                </div>
                              </div>
                              <span className="text-gray-700">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {selectedCategory === 'tips' && (
                  <div className="space-y-6">
                    {Object.entries(tipCategories[selectedCategory].content).map(([sectionKey, tips]) => (
                      <div key={sectionKey}>
                        <h3 className="font-semibold text-gray-800 mb-3 capitalize">
                          {sectionKey.replace(/([A-Z])/g, ' $1').trim()}:
                        </h3>
                        <ul className="space-y-2">
                          {tips.map((tip, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {selectedCategory === 'psychology' && (
                  <div className="space-y-6">
                    {Object.entries(tipCategories[selectedCategory].content).map(([sectionKey, items]) => (
                      <div key={sectionKey}>
                        <h3 className="font-semibold text-gray-800 mb-3 capitalize">
                          {sectionKey.replace(/([A-Z])/g, ' $1').trim()}:
                        </h3>
                        <ul className="space-y-2">
                          {items.map((item, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <Users className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Call to action */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border">
                <div className="flex items-center space-x-3 mb-3">
                  <Award className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Remember</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Conference Day is the culmination of your SSB journey. Stay true to yourself, 
                  maintain dignity in all circumstances, and remember that reaching this stage 
                  itself is a significant achievement. Trust the process and give your best!
                </p>
                <div className="flex space-x-4">
                  <button 
                    onClick={handleBackToSSB}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Back to SSB Drills
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConferenceTips;