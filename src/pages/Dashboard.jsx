import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import Navbar from '../components/Navbar';
import ChatWithMentor from '../components/ChatWithMentor';

function Dashboard() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

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

  useEffect(() => {
    const generateCalendar = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      const days = [];
      
      // Add empty cells for previous month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push({ day: '', isCurrentMonth: false, isToday: false });
      }
      
      // Add days of current month
      const today = new Date();
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDay = new Date(year, month, day);
        const isToday = today.getFullYear() === year && 
                       today.getMonth() === month && 
                       today.getDate() === day;
        
        // Only allow activity on past dates and today, never on future dates
        const isFutureDate = currentDay > today;
        const hasActivity = !isFutureDate && Math.random() > 0.7; // Random activity only for past/current dates
        
        days.push({ 
          day, 
          isCurrentMonth: true, 
          isToday,
          hasActivity
        });
      }
      
      setCalendarDays(days);
    };
    
    generateCalendar();
  }, [currentDate]);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch {}
    navigate('/login');
  };

  if (!userDetails) {
    return <div>Loading...</div>;
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
          <section className="glassmorphic-progress-section">
            <div className="progress-header">
              <h3>
                Your Progress Journey
                <span className="progress-sparkle"></span>
              </h3>
              <span className="glassmorphic-target-year">target year: 2026</span>
            </div>
            <div className="glassmorphic-progress-container">
              <div className="glassmorphic-progress-bar">
                <div className="glassmorphic-progress-fill" style={{ width: '65%' }}>
                  <div className="progress-shimmer"></div>
                </div>
              </div>
              <div className="progress-stats">
                <span className="progress-percentage">65%</span>
                <span className="progress-label">Complete</span>
              </div>
            </div>
          </section>

          <section className="glassmorphic-cards-section">
            <h3>Continue from where you left:</h3>
            <div className="glassmorphic-cards-row">
              <div className="glassmorphic-card">
                <div className="card-glow"></div>
                <div className="card-content">
                  <span className="card-icon">📚</span>
                  <span className="card-title">Module 1</span>
                  <span className="card-subtitle">Mathematics</span>
                </div>
                <div className="card-progress">
                  <div className="mini-progress-bar">
                    <div className="mini-progress-fill" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
              <div className="glassmorphic-card">
                <div className="card-glow"></div>
                <div className="card-content">
                  <span className="card-icon">🔬</span>
                  <span className="card-title">Module 2</span>
                  <span className="card-subtitle">Physics</span>
                </div>
                <div className="card-progress">
                  <div className="mini-progress-bar">
                    <div className="mini-progress-fill" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="glassmorphic-cards-section">
            <h3>Your Learning Path</h3>
            <div className="glassmorphic-cards-row">
              <div className="glassmorphic-card subject-card">
                <div className="card-glow"></div>
                <div className="card-content">
                  <span className="card-icon">🧮</span>
                  <span className="card-title">Mathematics</span>
                  <span className="card-subtitle">Advanced concepts</span>
                </div>
                <div className="card-stats">
                  <span className="card-stat">12 Topics</span>
                </div>
              </div>
              <div className="glassmorphic-card subject-card">
                <div className="card-glow"></div>
                <div className="card-content">
                  <span className="card-icon">📝</span>
                  <span className="card-title">English</span>
                  <span className="card-subtitle">Grammar & Comprehension</span>
                </div>
                <div className="card-stats">
                  <span className="card-stat">8 Topics</span>
                </div>
              </div>
              <div className="glassmorphic-card subject-card">
                <div className="card-glow"></div>
                <div className="card-content">
                  <span className="card-icon">⚛️</span>
                  <span className="card-title">Physics</span>
                  <span className="card-subtitle">Mechanics & Optics</span>
                </div>
                <div className="card-stats">
                  <span className="card-stat">15 Topics</span>
                </div>
              </div>
            </div>
          </section>

          <section className="glassmorphic-cards-section">
            <h3>SSB Preparation Suite</h3>
            <div className="glassmorphic-cards-row">
              <div className="glassmorphic-card drill-card">
                <div className="card-glow drill-glow"></div>
                <div className="card-content">
                  <span className="card-icon">🎯</span>
                  <span className="card-title">OIR Test</span>
                  <span className="card-subtitle">Reasoning & Logic</span>
                </div>
                <div className="card-stats">
                  <span className="card-stat">Ready</span>
                </div>
              </div>
              <div className="glassmorphic-card drill-card">
                <div className="card-glow drill-glow"></div>
                <div className="card-content">
                  <span className="card-icon">💭</span>
                  <span className="card-title">PPDT</span>
                  <span className="card-subtitle">Picture Perception</span>
                </div>
                <div className="card-stats">
                  <span className="card-stat">Ready</span>
                </div>
              </div>
              <div className="glassmorphic-card drill-card">
                <div className="card-glow drill-glow"></div>
                <div className="card-content">
                  <span className="card-icon">🗣️</span>
                  <span className="card-title">GTO Tasks</span>
                  <span className="card-subtitle">Group Activities</span>
                </div>
                <div className="card-stats">
                  <span className="card-stat">Ready</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <aside className="glassmorphic-dashboard-sidebar">
        <div className="glassmorphic-activity-calendar">
          <div className="calendar-aurora"></div>
          <div className="calendar-particles"></div>
          
          <div className="glassmorphic-calendar-header">
            <button 
              className="glassmorphic-calendar-nav-btn"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            >
              &#8249;
            </button>
            <h4>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h4>
            <button 
              className="glassmorphic-calendar-nav-btn"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            >
              &#8250;
            </button>
          </div>
          <div className="glassmorphic-calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <span key={day} className="glassmorphic-weekday">{day}</span>
            ))}
          </div>
          <div className="glassmorphic-calendar-grid">
            {calendarDays.map((dayObj, i) => (
              <span
                key={i}
                className={`glassmorphic-calendar-cell ${!dayObj.isCurrentMonth ? 'inactive' : ''} ${dayObj.isToday ? 'today' : ''} ${dayObj.hasActivity ? 'active' : ''}`}
              >
                {dayObj.day}
                {dayObj.hasActivity && <div className="activity-indicator"></div>}
              </span>
            ))}
          </div>
        </div>



      </aside>
      
      {/* Chat with Mentor Component */}
      <ChatWithMentor />
      </div>
    </div>
  );
}

export default Dashboard;
