import React, { useState } from 'react';
import { MessageCircle, ArrowLeft, Send, X } from 'lucide-react';

function ChatWithMentor() {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);

  const mentors = [
    { 
      id: 1, 
      name: "Dr. Rajesh Kumar", 
      specialty: "Mathematics", 
      avatar: "RK", 
      online: true, 
      lastMessage: "Great progress on algebra!" 
    },
    { 
      id: 2, 
      name: "Prof. Priya Sharma", 
      specialty: "Physics", 
      avatar: "PS", 
      online: false, 
      lastMessage: "Let's discuss mechanics tomorrow" 
    },
    { 
      id: 3, 
      name: "Col. Vikram Singh", 
      specialty: "SSB Preparation", 
      avatar: "VS", 
      online: true, 
      lastMessage: "Your leadership skills are improving" 
    },
    { 
      id: 4, 
      name: "Dr. Anita Verma", 
      specialty: "English", 
      avatar: "AV", 
      online: true, 
      lastMessage: "Focus on essay writing" 
    }
  ];

  const handleCloseMentorChat = () => {
    setChatOpen(false);
    setSelectedMentor(null);
  };

  return (
    <>
      {/* Glassmorphic Floating Chat Button */}
      <div className="glassmorphic-floating-chat-btn" onClick={() => setChatOpen(!chatOpen)}>
        <span className="glassmorphic-chat-icon">💬</span>
        <span className="glassmorphic-chat-text">CHAT w/ MENTOR</span>
        {chatOpen && <X size={16} className="glassmorphic-chat-close" />}
      </div>
      
      {/* Glassmorphic Chat Window */}
      {chatOpen && (
        <div className="glassmorphic-chat-window">
          {!selectedMentor ? (
            <>
              <div className="glassmorphic-chat-header">
                <h3>Choose a Mentor</h3>
                <button className="glassmorphic-chat-close-btn" onClick={handleCloseMentorChat}>
                  <X size={18} />
                </button>
              </div>
              <div className="glassmorphic-mentors-list">
                {mentors.map(mentor => (
                  <div key={mentor.id} className="glassmorphic-mentor-item" onClick={() => setSelectedMentor(mentor)}>
                    <div className="glassmorphic-mentor-avatar">
                      {mentor.avatar}
                      <span className={`glassmorphic-status-indicator ${mentor.online ? 'online' : 'offline'}`}></span>
                    </div>
                    <div className="glassmorphic-mentor-info">
                      <div className="glassmorphic-mentor-name">{mentor.name}</div>
                      <div className="glassmorphic-mentor-specialty">{mentor.specialty}</div>
                      <div className="glassmorphic-last-message">{mentor.lastMessage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="glassmorphic-chat-header">
                <button className="glassmorphic-back-btn" onClick={() => setSelectedMentor(null)}>
                  <ArrowLeft size={16} />
                </button>
                <div className="glassmorphic-chat-mentor-info">
                  <span className="glassmorphic-mentor-avatar-small">{selectedMentor.avatar}</span>
                  <div>
                    <div className="glassmorphic-mentor-name">{selectedMentor.name}</div>
                    <div className="glassmorphic-mentor-status">
                      <span className={`glassmorphic-status-dot ${selectedMentor.online ? 'online' : 'offline'}`}></span>
                      {selectedMentor.online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
                <button className="glassmorphic-chat-close-btn" onClick={handleCloseMentorChat}>
                  <X size={18} />
                </button>
              </div>
              <div className="glassmorphic-chat-messages">
                <div className="glassmorphic-message glassmorphic-mentor-message">
                  <div className="glassmorphic-message-avatar">{selectedMentor.avatar}</div>
                  <div className="glassmorphic-message-content">
                    <div className="glassmorphic-message-text">{selectedMentor.lastMessage}</div>
                    <div className="glassmorphic-message-time">2 hours ago</div>
                  </div>
                </div>
                <div className="glassmorphic-message glassmorphic-user-message">
                  <div className="glassmorphic-message-content">
                    <div className="glassmorphic-message-text">Thank you for the guidance!</div>
                    <div className="glassmorphic-message-time">1 hour ago</div>
                  </div>
                </div>
              </div>
              <div className="glassmorphic-chat-input">
                <input type="text" placeholder="Type a message..." />
                <button>
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default ChatWithMentor;