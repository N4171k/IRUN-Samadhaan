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
      description: "Discuss PPDT stories - show leadership & confidence",
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
    <div className="dashboard-layout">
      <Navbar userDetails={userDetails} onLogout={handleLogout} />
      
      <div className="ssb-drills-container">
        <div className="ssb-drills-content">
          <div className="page-header">
            <h1 className="page-title">SSB Drills</h1>
          </div>

          {/* Categorize drills by phases */}
          {['Screening Tests', 'Day 1 Screening', 'Day 2 Psychology', 'Group Task Officer', 'Interview', 'Final Phase'].map(category => {
            const categoryDrills = drills.filter(drill => drill.category === category);
            if (categoryDrills.length === 0) return null;
            
            return (
              <div key={category} className="drill-category-section">
                <h3 className="category-title">{category}</h3>
                <div className="drills-list">
                  {categoryDrills.map((drill) => (
                    <div 
                      key={drill.id} 
                      className="drill-item cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleDrillClick(drill)}
                    >
                      <div className="drill-icon-box">
                        <span className="drill-icon">{drill.icon}</span>
                      </div>
                      
                      <div className="drill-content">
                        <h3 className="drill-title-text">{drill.title}</h3>
                        <p className="drill-description">{drill.description}</p>
                        <div className="drill-arrow">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Chat with Mentor Component */}
      <ChatWithMentor />
    </div>
  );
}

export default SSBDrills;