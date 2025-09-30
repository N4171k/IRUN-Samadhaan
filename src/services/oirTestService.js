import { buildApiUrl } from '../config/env';

class OIRTestService {
  constructor() {
    this.apiBaseUrl = buildApiUrl('api/oir');
  }

  buildEndpoint(path = '') {
    if (!path) {
      return this.apiBaseUrl;
    }

    return `${this.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  async performRequest(path, options = {}) {
    const url = this.buildEndpoint(path);
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type') || '';
    const bodyText = await response.text();

    let payload;

    if (bodyText && contentType.includes('application/json')) {
      try {
        payload = JSON.parse(bodyText);
      } catch (parseError) {
        const error = new Error('Received malformed JSON from the server while generating the OIR test.');
        error.cause = parseError;
        error.status = response.status;
        error.endpoint = url;
        throw error;
      }
    }

    if (!payload) {
      const snippet = bodyText.slice(0, 200).replace(/\s+/g, ' ').trim();
      const error = new Error(
        `Unexpected response format from the OIR service at ${url}. ${
          snippet ? `Body starts with: ${snippet}` : 'Response body was empty.'
        }`
      );
      error.status = response.status;
      error.endpoint = url;
      error.responsePreview = snippet;
      throw error;
    }

    if (!response.ok) {
      const error = new Error(payload.message || payload.error || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.endpoint = url;
      error.body = payload;
      throw error;
    }

    if (!payload.success || typeof payload.data === 'undefined') {
      const error = new Error(payload.message || 'Invalid response format received from the OIR service.');
      error.status = response.status;
      error.endpoint = url;
      error.body = payload;
      throw error;
    }

    return payload.data;
  }

  // Generate a new test
  async generateTest() {
    try {
      return await this.performRequest('generate-test');
    } catch (error) {
      console.error('Error generating test:', error);
      throw error;
    }
  }

  // Submit test answers
  async submitTest(testId, answers, timeTaken) {
    try {
      return await this.performRequest('submit-test', {
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
    } catch (error) {
      console.error('Error submitting test:', error);
      throw error;
    }
  }

  // Get detailed analytics
  async getAnalytics(testResult) {
    try {
      return await this.performRequest('get-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_result: testResult
        }),
      });
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }

  // Get test information
  async getTestInfo() {
    try {
      return await this.performRequest('test-info');
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