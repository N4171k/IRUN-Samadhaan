class OIRTestService {
  constructor() {
    this.apiBaseUrl = 'https://irun-back.onrender.com/api/oir';
  }

  // Generate a new test
  async generateTest() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/generate-test`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate test');
      }
      
      // Handle the backend response format {success: true, data: {...}}
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error generating test:', error);
      throw error;
    }
  }

  // Submit test answers
  async submitTest(testId, answers, timeTaken) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/submit-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_id: testId,
          answers: answers,
          time_taken: timeTaken
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit test');
      }
      
      // Handle the backend response format {success: true, data: {...}}
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      throw error;
    }
  }

  // Get detailed analytics
  async getAnalytics(testResult) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/get-analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_result: testResult
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to get analytics');
      }
      
      // Handle the backend response format {success: true, data: {...}}
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }

  // Get test information
  async getTestInfo() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/test-info`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to get test info');
      }
      
      // Handle the backend response format {success: true, data: {...}}
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error getting test info:', error);
      throw error;
    }
  }

  // Local storage helpers
  saveTestProgress(testId, answers, timeRemaining) {
    const progressData = {
      testId,
      answers,
      timeRemaining,
      savedAt: Date.now()
    };
    
    localStorage.setItem('oir_test_progress', JSON.stringify(progressData));
  }

  loadTestProgress() {
    try {
      const saved = localStorage.getItem('oir_test_progress');
      if (saved) {
        const data = JSON.parse(saved);
        // Only return if saved within last 2 hours
        if (Date.now() - data.savedAt < 2 * 60 * 60 * 1000) {
          return data;
        }
      }
    } catch (error) {
      console.error('Error loading test progress:', error);
    }
    return null;
  }

  clearTestProgress() {
    localStorage.removeItem('oir_test_progress');
  }

  // Utility methods
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  calculateTimeSpent(totalTime, remainingTime) {
    return totalTime - remainingTime;
  }

  isTestComplete(answers, totalQuestions) {
    return Object.keys(answers).length === totalQuestions;
  }

  getCompletionPercentage(answers, totalQuestions) {
    return Math.round((Object.keys(answers).length / totalQuestions) * 100);
  }
}

export default OIRTestService;