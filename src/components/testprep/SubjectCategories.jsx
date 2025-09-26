import React, { useState } from 'react';

function SubjectCategories({ onSubjectSelect, selectedSubject = null }) {
  const subjects = [
    {
      id: 'english',
      name: 'English',
      description: 'Grammar, Comprehension, Vocabulary',
      icon: '📚',
      color: '#4a90e2',
      paperCount: 15
    },
    {
      id: 'general-knowledge',
      name: 'General Knowledge',
      description: 'Current Affairs, History, Geography',
      icon: '🌍',
      color: '#7b68ee',
      paperCount: 12
    },
    {
      id: 'elementary-mathematics',
      name: 'Elementary Mathematics',
      description: 'Arithmetic, Algebra, Geometry',
      icon: '🔢',
      color: '#ff6b35',
      paperCount: 18
    }
  ];

  const handleSubjectClick = (subject) => {
    if (onSubjectSelect) {
      onSubjectSelect(subject);
    }
  };

  return (
    <div className="subject-categories-container">
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
      className={`subject-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      style={{ '--subject-color': subject.color }}
    >
      <div className="subject-icon">
        <span>{subject.icon}</span>
      </div>
      
      <div className="subject-content">
        <h3 className="subject-name">{subject.name}</h3>
        <p className="subject-description">{subject.description}</p>
        
        <div className="subject-stats">
          <div className="paper-count">
            <span className="count-number">{subject.paperCount}</span>
            <span className="count-label">Previous Papers</span>
          </div>
          
          <div className="difficulty-indicator">
            <div className="difficulty-bars">
              <div className="bar active"></div>
              <div className="bar active"></div>
              <div className="bar"></div>
            </div>
            <span className="difficulty-label">Moderate</span>
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