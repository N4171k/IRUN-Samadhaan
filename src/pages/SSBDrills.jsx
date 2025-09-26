import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import Navbar from '../components/Navbar';
import ChatWithMentor from '../components/ChatWithMentor';
import { ArrowRight } from 'lucide-react';

function SSBDrills() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await account.get();
        setUserDetails(user);
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

  const handleDrillClick = (drill) => {
    if (drill.route && drill.route !== "#") {
      navigate(drill.route);
    } else {
      // For future implementation of other drills
      alert(`${drill.title} will be available soon!`);
    }
  };

  const drills = [
    {
      id: 1,
      title: "OIR (Officer Intelligence Rating)",
      description: "Intelligence and reasoning test",
      icon: "🧠",
      route: "/oir",
      category: "Screening Tests"
    },
    {
      id: 2,
      title: "PPDT (Picture Perception & Description Test)",
      description: "240 seconds to write story on blurry image",
      icon: "🖼️",
      route: "/ppdt",
      category: "Day 1 Screening"
    },
    {
      id: 3,
      title: "Group Discussion (GD)",
      description: "Choose real lobby or AI-simulated GD with Gemini insights",
      icon: "👥",
      route: "/gd",
      category: "Day 1 Screening"
    },
    {
      id: 4,
      title: "Thematic Apperception Test (TAT)",
      description: "11 pictures + blank canvas story writing - 3 min each",
      icon: "📚",
      route: "/tat",
      category: "Day 2 Psychology"
    },
    {
      id: 5,
      title: "Word Association Test (WAT)",
      description: "60 words, 15 seconds each - instant response",
      icon: "📝",
      route: "/wat",
      category: "Day 2 Psychology"
    },
    {
      id: 6,
      title: "SRT (Situation Reaction Test)",
      description: "60 real-life situations - react within 2 minutes",
      icon: "⚡",
      route: "/srt",
      category: "Day 2 Psychology"
    },
    {
      id: 7,
      title: "SDT (Self Description Test)",
      description: "What others think about you vs self-perception",
      icon: "🪞",
      route: "/sdt",
      category: "Day 2 Psychology"
    },
    {
      id: 8,
      title: "GTO (Extempore)",
      description: "Impromptu speaking on given topics",
      icon: "🎤",
      route: "/gto",
      category: "Group Task Officer"
    },
    {
      id: 9,
      title: "Personal Interview (PI)",
      description: "Interview based on your background & signup info",
      icon: "🤝",
      route: "/pi",
      category: "Interview"
    },
    {
      id: 10,
      title: "Conference Day Tips",
      description: "Essential tips and tricks for conference day",
      icon: "💡",
      route: "/conference-tips",
      category: "Final Phase"
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!userDetails) {
    return <div className="loading-container">Loading user...</div>;
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
      
      <div className="glassmorphic-dashboard-wrapper">
        <div className="glassmorphic-dashboard-card">
          {/* Floating particles inside card */}
          <div className="dashboard-particle particle-1"></div>
          <div className="dashboard-particle particle-2"></div>
          <div className="dashboard-particle particle-3"></div>

          <div className="glassmorphic-dashboard-content">
            <div className="page-header">
              <h1 className="page-title">
                SSB Drills
                <span className="progress-sparkle"></span>
              </h1>
            </div>

            {/* Categorize drills by phases */}
            {['Screening Tests', 'Day 1 Screening', 'Day 2 Psychology', 'Group Task Officer', 'Interview', 'Final Phase'].map(category => {
              const categoryDrills = drills.filter(drill => drill.category === category);
              if (categoryDrills.length === 0) return null;
              
              return (
                <section key={category} className="glassmorphic-cards-section">
                  <h3>{category}</h3>
                  <div className="glassmorphic-cards-row">
                    {categoryDrills.map((drill) => (
                      <div 
                        key={drill.id} 
                        className="glassmorphic-card drill-card"
                        onClick={() => handleDrillClick(drill)}
                      >
                        <div className="card-glow drill-glow"></div>
                        <div className="card-content">
                          <span className="card-icon">{drill.icon}</span>
                          <span className="card-title">{drill.title}</span>
                          <span className="card-subtitle">{drill.description}</span>
                        </div>
                        <div className="card-stats">
                          <span className="card-stat">Ready</span>
                        </div>
                        <div className="drill-arrow-glassmorphic">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Chat with Mentor Component */}
      <ChatWithMentor />
    </div>
  );
}

export default SSBDrills;