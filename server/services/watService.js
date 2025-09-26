class WATService {
  constructor() {
    this.wordBank = [
      'Leader', 'Failure', 'Success', 'Challenge', 'Team', 'Courage', 'Responsibility',
      'Trust', 'Initiative', 'Discipline', 'Confidence', 'Determination', 'Honesty',
      'Loyalty', 'Patience', 'Strength', 'Victory', 'Defeat', 'Goal', 'Mission',
      'Sacrifice', 'Duty', 'Honor', 'Pride', 'Risk', 'Decision', 'Problem', 'Solution',
      'Friend', 'Enemy', 'Family', 'Country', 'Service', 'Training', 'Excellence',
      'Commitment', 'Focus', 'Innovation', 'Adaptation', 'Perseverance', 'Cooperation',
      'Leadership', 'Follower', 'Competition', 'Achievement', 'Progress', 'Change',
      'Opportunity', 'Integrity', 'Dedication', 'Performance', 'Quality', 'Standard',
      'Efficiency', 'Teamwork', 'Communication', 'Strategy', 'Tactics', 'Planning',
      'Vision', 'Ambition', 'Motivation', 'Inspiration', 'Creativity', 'Learning'
    ];

    // Positive indicators for scoring
    this.positiveIndicators = [
      'success', 'achieve', 'accomplish', 'overcome', 'solve', 'inspire', 'motivate',
      'help', 'support', 'guide', 'teach', 'learn', 'grow', 'improve', 'develop',
      'progress', 'advance', 'forward', 'positive', 'good', 'great', 'excellent',
      'strong', 'confident', 'determined', 'dedicated', 'committed', 'responsible',
      'honest', 'loyal', 'trustworthy', 'reliable', 'capable', 'skilled', 'talented',
      'creative', 'innovative', 'adaptive', 'flexible', 'resilient', 'persistent',
      'focused', 'disciplined', 'organized', 'efficient', 'effective', 'productive',
      'collaborative', 'cooperative', 'united', 'together', 'team', 'unity'
    ];

    // Negative indicators to flag
    this.negativeIndicators = [
      'no', 'not', 'never', 'cannot', 'can\'t', 'won\'t', 'shouldn\'t', 'wouldn\'t',
      'impossible', 'difficult', 'hard', 'bad', 'terrible', 'awful', 'horrible',
      'hate', 'dislike', 'avoid', 'fear', 'scared', 'worried', 'anxious', 'stress',
      'fail', 'failure', 'defeat', 'lose', 'loss', 'weak', 'weakness', 'poor',
      'unable', 'incapable', 'useless', 'worthless', 'hopeless', 'helpless'
    ];

    // Action-oriented words that show leadership potential
    this.actionWords = [
      'lead', 'guide', 'direct', 'manage', 'organize', 'plan', 'execute', 'implement',
      'create', 'build', 'develop', 'establish', 'initiate', 'start', 'begin',
      'act', 'take', 'make', 'do', 'work', 'strive', 'fight', 'defend', 'protect',
      'serve', 'contribute', 'participate', 'engage', 'involve', 'commit', 'dedicate'
    ];
  }

  /**
   * Get a randomized set of words for the test
   * @param {number} count - Number of words to return (default: 60)
   * @returns {Array} Array of words
   */
  getTestWords(count = 60) {
    const shuffled = [...this.wordBank].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, this.wordBank.length));
  }

  /**
   * Analyze a single response for psychological indicators
   * @param {string} word - The stimulus word
   * @param {string} response - The user's response
   * @returns {Object} Analysis result
   */
  analyzeResponse(word, response) {
    if (!response || response.trim().length === 0) {
      return {
        word,
        response,
        score: 0,
        flags: ['no_response'],
        indicators: {
          positive: 0,
          negative: 0,
          action: 0,
          length: 0
        }
      };
    }

    const cleanResponse = response.toLowerCase().trim();
    const words = cleanResponse.split(/\s+/);
    
    let positiveCount = 0;
    let negativeCount = 0;
    let actionCount = 0;
    const flags = [];

    // Check for positive indicators
    this.positiveIndicators.forEach(indicator => {
      if (cleanResponse.includes(indicator)) {
        positiveCount++;
      }
    });

    // Check for negative indicators
    this.negativeIndicators.forEach(indicator => {
      if (cleanResponse.includes(indicator)) {
        negativeCount++;
        flags.push('negative_language');
      }
    });

    // Check for action-oriented language
    this.actionWords.forEach(action => {
      if (cleanResponse.includes(action)) {
        actionCount++;
      }
    });

    // Response length analysis
    if (response.length < 10) {
      flags.push('too_short');
    } else if (response.length > 100) {
      flags.push('too_long');
    }

    // Check for common patterns
    if (cleanResponse.includes('key to success') || 
        cleanResponse.includes('important for') ||
        cleanResponse.includes('leads to')) {
      flags.push('cliche_response');
    }

    // Check if response directly relates to the word
    if (!cleanResponse.includes(word.toLowerCase()) && 
        !this.isConceptuallyRelated(word, cleanResponse)) {
      flags.push('unrelated_response');
    }

    // Calculate score based on various factors
    let score = 50; // Base score

    // Positive indicators boost score
    score += positiveCount * 10;
    
    // Negative indicators reduce score
    score -= negativeCount * 15;
    
    // Action words boost score
    score += actionCount * 8;
    
    // Length penalties/bonuses
    if (response.length >= 20 && response.length <= 80) {
      score += 10; // Good length
    }

    // Flag penalties
    if (flags.includes('negative_language')) score -= 20;
    if (flags.includes('too_short')) score -= 15;
    if (flags.includes('cliche_response')) score -= 10;
    if (flags.includes('unrelated_response')) score -= 25;

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    return {
      word,
      response,
      score,
      flags,
      indicators: {
        positive: positiveCount,
        negative: negativeCount,
        action: actionCount,
        length: response.length
      }
    };
  }

  /**
   * Check if response is conceptually related to the word
   * @param {string} word - The stimulus word
   * @param {string} response - The response text
   * @returns {boolean} Whether they are related
   */
  isConceptuallyRelated(word, response) {
    // Simple conceptual mapping - in a real system this could be more sophisticated
    const conceptMap = {
      'leader': ['guide', 'inspire', 'direct', 'manage', 'team', 'follow'],
      'failure': ['success', 'learn', 'try', 'again', 'overcome', 'mistake'],
      'team': ['together', 'cooperate', 'group', 'work', 'unite', 'collective'],
      'courage': ['brave', 'bold', 'fear', 'strength', 'face', 'overcome'],
      'responsibility': ['duty', 'accountable', 'task', 'role', 'obligation']
    };

    const concepts = conceptMap[word.toLowerCase()] || [];
    return concepts.some(concept => response.includes(concept));
  }

  /**
   * Analyze complete test submission
   * @param {Array} responses - Array of response objects
   * @param {number} totalTimeUsed - Total time taken for the test
   * @returns {Object} Complete analysis
   */
  analyzeTest(responses, totalTimeUsed) {
    if (!responses || responses.length === 0) {
      return {
        overallScore: 0,
        completionRate: 0,
        averageScore: 0,
        totalResponses: 0,
        totalWords: 60,
        timeEfficiency: 0,
        strengths: [],
        areasForImprovement: ['Complete the test with responses'],
        detailedAnalysis: [],
        feedback: 'No responses were recorded. Please ensure you complete the test.'
      };
    }

    const detailedAnalysis = responses.map(r => 
      this.analyzeResponse(r.word, r.response)
    );

    const validResponses = detailedAnalysis.filter(a => a.score > 0);
    const totalWords = 60; // Standard WAT has 60 words
    
    const overallScore = validResponses.length > 0 
      ? Math.round(validResponses.reduce((sum, a) => sum + a.score, 0) / validResponses.length)
      : 0;
    
    const completionRate = Math.round((responses.length / totalWords) * 100);
    const averageScore = overallScore;
    
    // Time efficiency calculation (15 minutes = 900 seconds is ideal)
    const idealTime = 900; // 15 minutes
    const timeEfficiency = Math.round(Math.max(0, 100 - Math.abs(totalTimeUsed - idealTime) / idealTime * 100));

    // Analyze patterns
    const flags = detailedAnalysis.reduce((acc, analysis) => {
      analysis.flags.forEach(flag => {
        acc[flag] = (acc[flag] || 0) + 1;
      });
      return acc;
    }, {});

    const totalPositive = detailedAnalysis.reduce((sum, a) => sum + a.indicators.positive, 0);
    const totalNegative = detailedAnalysis.reduce((sum, a) => sum + a.indicators.negative, 0);
    const totalAction = detailedAnalysis.reduce((sum, a) => sum + a.indicators.action, 0);

    // Generate strengths and areas for improvement
    const strengths = [];
    const areasForImprovement = [];

    if (completionRate >= 90) {
      strengths.push('Excellent completion rate - shows good time management');
    }
    if (totalPositive > totalNegative * 2) {
      strengths.push('Positive mindset - responses show optimistic thinking');
    }
    if (totalAction > responses.length * 0.3) {
      strengths.push('Action-oriented responses - shows leadership potential');
    }
    if (timeEfficiency > 80) {
      strengths.push('Good time management throughout the test');
    }

    if (completionRate < 70) {
      areasForImprovement.push('Work on time management to complete more words');
    }
    if (flags.negative_language > responses.length * 0.2) {
      areasForImprovement.push('Reduce negative language - focus on positive framing');
    }
    if (flags.too_short > responses.length * 0.3) {
      areasForImprovement.push('Provide more detailed responses - aim for complete thoughts');
    }
    if (flags.cliche_response > responses.length * 0.2) {
      areasForImprovement.push('Avoid cliche responses - be more original and personal');
    }
    if (totalAction < responses.length * 0.1) {
      areasForImprovement.push('Include more action-oriented language to show initiative');
    }

    // Generate personalized feedback
    let feedback = this.generateFeedback(overallScore, completionRate, strengths, areasForImprovement);

    return {
      overallScore,
      completionRate,
      averageScore,
      totalResponses: responses.length,
      totalWords,
      timeEfficiency,
      strengths,
      areasForImprovement,
      detailedAnalysis,
      feedback,
      patterns: {
        positiveIndicators: totalPositive,
        negativeIndicators: totalNegative,
        actionWords: totalAction,
        flags
      }
    };
  }

  /**
   * Generate personalized feedback based on performance
   * @param {number} score - Overall score
   * @param {number} completionRate - Completion percentage
   * @param {Array} strengths - Identified strengths
   * @param {Array} improvements - Areas for improvement
   * @returns {string} Feedback message
   */
  generateFeedback(score, completionRate, strengths, improvements) {
    let feedback = '';

    if (score >= 80 && completionRate >= 90) {
      feedback = 'Excellent performance! Your responses demonstrate strong psychological fitness for leadership roles. ';
    } else if (score >= 65 && completionRate >= 75) {
      feedback = 'Good performance with room for improvement. Your responses show potential for leadership development. ';
    } else if (score >= 50) {
      feedback = 'Average performance. Focus on developing more positive and action-oriented thinking patterns. ';
    } else {
      feedback = 'Below average performance. Consider working on positive thinking and reducing negative language patterns. ';
    }

    if (strengths.length > 0) {
      feedback += `Your key strengths include: ${strengths.join(', ')}. `;
    }

    if (improvements.length > 0) {
      feedback += `Areas for improvement: ${improvements.join(', ')}. `;
    }

    feedback += 'Remember, WAT reflects your subconscious thought patterns. Regular practice with positive, action-oriented thinking will improve your performance.';

    return feedback;
  }

  /**
   * Save test results (placeholder for database implementation)
   * @param {string} userId - User identifier
   * @param {Object} results - Test results
   * @returns {Object} Save confirmation
   */
  async saveResults(userId, results) {
    // In a real implementation, this would save to a database
    console.log(`Saving WAT results for user ${userId}:`, results);
    
    return {
      success: true,
      resultId: `wat_${userId}_${Date.now()}`,
      savedAt: new Date().toISOString()
    };
  }

  /**
   * Get user's test history (placeholder for database implementation)
   * @param {string} userId - User identifier
   * @returns {Array} Previous test results
   */
  async getUserHistory(userId) {
    // In a real implementation, this would fetch from a database
    console.log(`Fetching WAT history for user ${userId}`);
    
    return {
      success: true,
      tests: [] // Would contain previous test results
    };
  }
}

module.exports = WATService;