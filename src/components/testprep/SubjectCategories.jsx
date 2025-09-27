import React from 'react';

function SubjectCategories({ onSubjectSelect, selectedSubject = null }) {
  const subjects = [
    {
      id: 'english',
      name: 'English',
      description: 'Grammar, Comprehension, Vocabulary',
      icon: '📚',
      color: '#667eea',
      paperCount: 15
    },
    {
      id: 'general-knowledge',
      name: 'General Knowledge',
      description: 'Current Affairs, History, Geography',
      icon: '🌍',
      color: '#764ba2',
      paperCount: 12
    },
    {
      id: 'elementary-mathematics',
      name: 'Elementary Mathematics',
      description: 'Arithmetic, Algebra, Geometry',
      icon: '🔢',
      color: '#f093fb',
      paperCount: 18
    }
  ];

  const handleSubjectClick = (subject) => {
    if (onSubjectSelect) {
      onSubjectSelect(subject);
    }
  };

  return (
    <div className="glassmorphic-dashboard-card">
      <div className="categories-header">
        <h2 className="categories-title">Select Subject Category</h2>
        <p className="categories-subtitle">Choose a subject to view previous year papers</p>
      </div>
      
      <div className="subject-grid">
        {subjects.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            isSelected={selectedSubject?.id === subject.id}
            onClick={() => handleSubjectClick(subject)}
          />
        ))}
      </div>
    </div>
  );
}

function SubjectCard({ subject, isSelected, onClick }) {
  return (
    <div 
      className={`glassmorphic-card subject-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="card-glow"></div>
      <div className="card-content">
        <div className="subject-icon" style={{ background: `linear-gradient(135deg, ${subject.color}, ${subject.color}dd)` }}>
          <span>{subject.icon}</span>
        </div>
        
        <div className="subject-content">
          <h3 className="card-title">{subject.name}</h3>
          <p className="card-subtitle">{subject.description}</p>
          
          <div className="subject-stats">
            <div className="paper-count">
              <span className="count-number" style={{ color: subject.color }}>{subject.paperCount}</span>
              <span className="count-label">Previous Papers</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="subject-arrow">
        <span>→</span>
      </div>
    </div>
  );
}

export default SubjectCategories;
export { SubjectCard };