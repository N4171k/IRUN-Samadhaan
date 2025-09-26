import React from 'react';

function PreviousYearPapers({ papers = [], selectedSubject = null }) {
  // Generate subject-specific papers if a subject is selected
  const getSubjectPapers = () => {
    if (!selectedSubject) {
      return Array(3).fill(null); // Default placeholder papers
    }
    
    // Mock papers based on selected subject
    const subjectPapers = {
      'english': [
        { year: '2023', title: 'English Comprehension', questions: 25, difficulty: 'Medium', duration: '60 min' },
        { year: '2022', title: 'Grammar & Vocabulary', questions: 30, difficulty: 'Easy', duration: '45 min' },
        { year: '2021', title: 'Reading Comprehension', questions: 20, difficulty: 'Hard', duration: '75 min' }
      ],
      'general-knowledge': [
        { year: '2023', title: 'Current Affairs 2023', questions: 40, difficulty: 'Medium', duration: '90 min' },
        { year: '2022', title: 'History & Geography', questions: 35, difficulty: 'Medium', duration: '60 min' },
        { year: '2021', title: 'Science & Technology', questions: 30, difficulty: 'Hard', duration: '80 min' }
      ],
      'elementary-mathematics': [
        { year: '2023', title: 'Arithmetic & Algebra', questions: 50, difficulty: 'Medium', duration: '120 min' },
        { year: '2022', title: 'Geometry & Mensuration', questions: 45, difficulty: 'Hard', duration: '100 min' },
        { year: '2021', title: 'Number Systems', questions: 40, difficulty: 'Easy', duration: '90 min' }
      ]
    };
    
    return subjectPapers[selectedSubject.id] || [];
  };

  const displayPapers = papers.length > 0 ? papers : getSubjectPapers();

  return (
    <div className="papers-container">
      <div className="section-header">
        <h2 className="section-title">
          {selectedSubject 
            ? `${selectedSubject.name} - Previous Year Papers` 
            : 'Previous Year Question Papers'
          }
        </h2>
        {selectedSubject && (
          <p className="section-subtitle">
            {displayPapers.length} papers available for {selectedSubject.name}
          </p>
        )}
      </div>
      
      <div className="question-papers-grid">
        {displayPapers.map((paper, index) => (
          <PaperCard 
            key={index} 
            paper={paper} 
            index={index}
            subjectColor={selectedSubject?.color}
          />
        ))}
      </div>
    </div>
  );
}

function PaperCard({ paper, index, subjectColor }) {
  const handlePaperClick = () => {
    if (paper) {
      console.log(`Opening paper: ${paper.title}`);
      // Handle paper selection/download
    }
  };

  return (
    <div 
      className="paper-card" 
      role="button" 
      tabIndex={0}
      onClick={handlePaperClick}
      onKeyDown={(e) => e.key === 'Enter' && handlePaperClick()}
      style={subjectColor ? { '--paper-accent': subjectColor } : {}}
    >
      {paper ? (
        <div className="paper-content">
          <div className="paper-header">
            <div className="paper-year">{paper.year}</div>
            <div className={`difficulty-badge ${paper.difficulty?.toLowerCase()}`}>
              {paper.difficulty}
            </div>
          </div>
          
          <div className="paper-body">
            <h4 className="paper-title">{paper.title}</h4>
            
            <div className="paper-stats">
              <div className="stat-item">
                <span className="stat-icon">📝</span>
                <span className="stat-text">{paper.questions} Questions</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-icon">⏱️</span>
                <span className="stat-text">{paper.duration}</span>
              </div>
            </div>
          </div>
          
          <div className="paper-footer">
            <button className="download-btn">
              <span>📥</span>
              Download
            </button>
          </div>
        </div>
      ) : (
        <div className="paper-placeholder">
          <div className="placeholder-content">
            <span className="placeholder-icon">📄</span>
            <span className="placeholder-text">Select a subject to view papers</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PreviousYearPapers;