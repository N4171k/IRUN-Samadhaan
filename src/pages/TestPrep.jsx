import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import Navbar from '../components/Navbar';
import ChatWithMentor from '../components/ChatWithMentor';
import SubjectCategories from '../components/testprep/SubjectCategories';
import PreviousYearPapers from '../components/testprep/PreviousYearPapers';
import TestActions from '../components/testprep/TestActions';

function TestPrep() {
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

  // Subject selection state
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Example data for previous year papers (can be fetched from API)
  const [previousPapers] = useState([]);

  // Handler functions for test actions
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    console.log('Subject selected:', subject);
  };

  const handleCreateTest = () => {
    if (selectedSubject) {
      console.log(`Creating test for ${selectedSubject.name}`);
      // Navigate to test creation page or open modal
    }
  };

  const handleViewPerformance = () => {
    if (selectedSubject) {
      console.log(`Viewing performance for ${selectedSubject.name}`);
      // Navigate to performance analytics page
    }
  };

  const handleChatWithMentor = () => {
    console.log('Chat with mentor clicked');
    // Open chat interface or navigate to chat page
  };

  if (!userDetails) {
    return <div className="loading-container">Loading user...</div>;
  }

  return (
    <div className="dashboard-layout">
      <Navbar userDetails={userDetails} onLogout={handleLogout} />
      
      <div className="test-prep-container">
        <div className="test-prep-content">
          <div className="page-header">
            <h1 className="page-title">Test Your Prep !</h1>
            <p className="page-subtitle">
              Choose your subject and start practicing with previous year papers
            </p>
          </div>

          <div className="test-prep-main-layout">
            {/* Subject Categories Section */}
            <div className="subjects-section">
              <SubjectCategories 
                onSubjectSelect={handleSubjectSelect}
                selectedSubject={selectedSubject}
              />
            </div>

            {/* Content Area */}
            <div className="content-area">
              <div className="test-prep-layout">
                {/* Left Section - Previous Year Question Papers */}
                <div className="left-section">
                  <PreviousYearPapers 
                    papers={previousPapers}
                    selectedSubject={selectedSubject}
                  />
                </div>

                {/* Right Section - Test Actions */}
                <TestActions 
                  onCreateTest={handleCreateTest}
                  onViewPerformance={handleViewPerformance}
                  onChatWithMentor={handleChatWithMentor}
                  selectedSubject={selectedSubject}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat with Mentor Component */}
      <ChatWithMentor />
    </div>
  );
}

export default TestPrep;