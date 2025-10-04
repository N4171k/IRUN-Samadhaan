import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { JeetuInterviewProvider } from '../../contexts/JeetuInterviewContext';
import InterviewUI from '../../components/jeetu/InterviewUI';
import { account } from '../../lib/appwrite';
import { useLoaderTask } from '../../contexts/LoaderContext';

function MockInterview() {
  const navigate = useNavigate();
  const runWithLoader = useLoaderTask();
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        await runWithLoader(async () => {
          const user = await account.get();
          setUserDetails(user);
          setIsLoading(false);
        });
      } catch (error) {
        console.error('User not logged in:', error);
        setIsLoading(false);
        navigate('/login');
      }
    }

    fetchUser();
  }, [navigate, runWithLoader]);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Failed to log out', error);
    }
    navigate('/login');
  };

  if (isLoading) {
    return <div className="loading-container">Loading user...</div>;
  }

  return (
    <div className="mock-interview-page">
      <Navbar userDetails={userDetails || { name: 'Cadet' }} onLogout={handleLogout} />

      <div className="mock-interview-content">
        <button type="button" className="mock-interview-back" onClick={() => navigate('/ai-run')}>
          <ArrowLeft className="h-5 w-5" />
          Back to AI Run
        </button>

        <div className="mock-interview-hero">
          <span className="mock-interview-badge">
            <Sparkles className="h-4 w-4" />
            AI Run Experience
          </span>
          <h1>Jeetu Bhaiya Mock Interview</h1>
          <p>
            Step into a structured SSB-style interview room. Jeetu Bhaiya listens to your response, probes deeper with
            contextual follow-ups, and keeps the conversation flowing until you&apos;re confident for the real board. When you
            hear his welcome, just say <strong>START</strong> to launch your interview.
          </p>
        </div>

        <JeetuInterviewProvider>
          <InterviewUI />
        </JeetuInterviewProvider>
      </div>
    </div>
  );
}

export default MockInterview;
