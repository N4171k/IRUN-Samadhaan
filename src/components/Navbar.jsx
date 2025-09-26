import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNELE } from '../contexts/NELEContext';

function Navbar({ userDetails, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const { neleEnabled, toggleNELE, isMonitoring } = useNELE();
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getActiveNavItem = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        return 'Home';
      case '/community':
        return 'Community';
      case '/ssb-drills':
        return 'SSB Drills';
      case '/test-prep':
        return 'Test your prep';
      case '/ai-run':
        return 'AI-Run';

      default:
        return 'Home';
    }
  };

  const navItems = [
    { label: 'Home', path: '/dashboard' },
    { label: 'Community', path: '/community' },
    { label: 'SSB Drills', path: '/ssb-drills' },
    { label: 'Test your prep', path: '/test-prep' }
  ];

  const activeItem = getActiveNavItem();

  const handleProfileClick = () => {
    setProfileOpen(!profileOpen);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    onLogout();
  };

  return (
    <header className="glassmorphic-navbar">
      {/* Aurora background effect */}
      <div className="navbar-aurora"></div>
      
      {/* Floating background particles */}
      <div className="navbar-particle navbar-particle-1"></div>
      <div className="navbar-particle navbar-particle-2"></div>
      <div className="navbar-particle navbar-particle-3"></div>
      <div className="navbar-particle navbar-particle-4"></div>
      <div className="navbar-particle navbar-particle-5"></div>
      
      {/* Floating shapes like login page */}
      <div className="navbar-floating-shape shape-1"></div>
      <div className="navbar-floating-shape shape-2"></div>
      <div className="navbar-floating-shape shape-3"></div>
      
      {/* Background gradient overlay */}
      <div className="navbar-gradient-overlay"></div>
      
      {/* Logo section */}
      <div className="navbar-logo">
        <div className="logo-container">
          <h1 className="logo-text">IRUN</h1>
          <div className="logo-sparkle"></div>
          <div className="logo-underline"></div>
        </div>
      </div>
      
      {/* Navigation menu */}
      <nav className="navbar-nav">
        <ul className="glassmorphic-nav-menu">
          {navItems.map((item, index) => (
            <li
              key={item.label}
              className={`glassmorphic-nav-item ${activeItem === item.label ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              style={{ '--item-delay': `${index * 0.1}s` }}
            >
              <span className="nav-item-text">{item.label}</span>
              <div className="nav-item-glow"></div>
              <div className="nav-item-sparkle"></div>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Right side actions */}
      <div className="navbar-actions">
        <button 
          className="glassmorphic-ai-button" 
          onClick={() => navigate('/ai-run')}
        >
          <span className="ai-button-text">AI-RUN</span>
          <div className="ai-button-glow"></div>
          <div className="ai-button-particles"></div>
        </button>
        
        <div className="nele-section">
          <span className="nele-label">NELE AI {isMonitoring && '🔴'}</span>
          <label className="glassmorphic-switch">
            <input 
              type="checkbox" 
              className="switch-input" 
              checked={neleEnabled}
              onChange={(e) => toggleNELE(e.target.checked)}
            />
            <span className="glassmorphic-switch-slider">
              <span className="switch-handle"></span>
              <div className="switch-glow"></div>
            </span>
          </label>
        </div>
        
        <div className="profile-section" ref={profileRef}>
          <div
            className="glassmorphic-profile-avatar"
            onClick={handleProfileClick}
          >
            <span className="avatar-text">
              {userDetails?.name?.charAt(0) || userDetails?.email?.charAt(0) || 'U'}
            </span>
            <div className="avatar-ring"></div>
            <div className="avatar-pulse"></div>
            <div className="avatar-particles"></div>
          </div>
          
          {profileOpen && (
            <div className="glassmorphic-profile-dropdown">
              <div className="dropdown-aurora"></div>
              <div className="dropdown-particles"></div>
              
              <div className="dropdown-header">
                <div className="user-avatar-mini">
                  {userDetails?.name?.charAt(0) || userDetails?.email?.charAt(0) || 'U'}
                </div>
                <div className="user-details">
                  <strong className="user-name">{userDetails?.name || userDetails?.email}</strong>
                  <span className="user-status">Online</span>
                </div>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={() => setProfileOpen(false)}>
                  <span className="item-icon">👤</span>
                  <span className="item-text">Edit Profile</span>
                  <div className="item-hover-glow"></div>
                </div>
                <div className="dropdown-item logout-item" onClick={handleLogout}>
                  <span className="item-icon">🚪</span>
                  <span className="item-text">Logout</span>
                  <div className="item-hover-glow"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;