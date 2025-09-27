const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class OIRTestService {
  constructor() {
    this.testsDataPath = path.join(__dirname, '../data/oirTestData.json');
    this.apiKeys = global.GEMINI_API_KEYS || [];
    this.currentKeyIndex = 0;
    this.genAI = null;
    this.selectedModel = 'gemini-1.5-flash'; // Default model
    this.isInitialized = false;
    this.initializeGemini();
  }

  // Initialize Gemini AI with available API keys
  async initializeGemini() {
    if (this.apiKeys.length > 0) {
      this.genAI = new GoogleGenerativeAI(this.apiKeys[this.currentKeyIndex]);
      console.log('OIR Service: Gemini AI initialized with API key');
      
      // Use the latest available model
      // Try models in order of preference
      const preferredModels = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro'
      ];
      
      this.selectedModel = preferredModels[0]; // Default to newest
      console.log(`Using model: ${this.selectedModel}`);
      this.isInitialized = true;
    } else {
      console.warn('OIR Service: No Gemini API keys available, using static data only');
      this.isInitialized = true;
    }
  }

  // Rotate to next API key if current one fails
  async rotateApiKey() {
    if (this.apiKeys.length > 1) {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
      this.genAI = new GoogleGenerativeAI(this.apiKeys[this.currentKeyIndex]);
      console.log(`Rotated to API key ${this.currentKeyIndex + 1}`);
    }
  }

  // Generate questions using Gemini AI
  async generateQuestionsWithAI() {
    if (!this.genAI) {
      throw new Error('Gemini AI not initialized');
    }

    // Wait for initialization to complete if needed
    if (!this.isInitialized) {
      await new Promise(resolve => {
        const checkInit = () => {
          if (this.isInitialized) {
            resolve();
          } else {
            setTimeout(checkInit, 100);
          }
        };
        checkInit();
      });
    }

    const model = this.genAI.getGenerativeModel({ model: this.selectedModel });
    
    const prompt = `Generate an Officer Intelligence Rating (OIR) test with exactly 20 questions in JSON format.

Requirements:
- 10 verbal reasoning questions (analogies, word relationships, coding-decoding, logical sequences)
- 10 non-verbal reasoning questions (pattern recognition with geometric shapes)
- Each question must have exactly 4 options
- Non-verbal questions must use only: triangle, square, rectangle, circle, pentagon
- Shape attributes: rotation (0-360°), fill (none/filled/striped), size (small/medium/large)

JSON Structure:
{
  "test_id": "oir_test_ai_generated",
  "time_limit_minutes": 30,
  "questions": [
    {
      "id": 1,
      "type": "verbal",
      "question": "Complete the analogy: BOOK : READ :: FOOD : ?",
      "options": ["Cook", "Eat", "Taste", "Prepare"],
      "answer": "Eat"
    },
    {
      "id": 11,
      "type": "non-verbal",
      "question": "Which figure completes the sequence?",
      "sequence": [
        {"shape": "triangle", "rotation": 0, "fill": "none", "size": "medium"},
        {"shape": "triangle", "rotation": 90, "fill": "none", "size": "medium"}
      ],
      "options": [
        {"shape": "triangle", "rotation": 180, "fill": "none", "size": "medium"},
        {"shape": "square", "rotation": 0, "fill": "none", "size": "medium"},
        {"shape": "circle", "rotation": 0, "fill": "none", "size": "medium"},
        {"shape": "triangle", "rotation": 0, "fill": "filled", "size": "medium"}
      ],
      "answer": {"shape": "triangle", "rotation": 180, "fill": "none", "size": "medium"}
    }
  ],
  "answer_key": {
    "1": "Eat",
    "11": {"shape": "triangle", "rotation": 180, "fill": "none", "size": "medium"}
  }
}

IMPORTANT: For non-verbal questions, use "options" field (NOT "option_figures") containing array of shape objects.
Generate unique, challenging questions suitable for CDS officer selection. Return only valid JSON.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean and parse JSON response
      const cleanedText = text.replace(/```json\s*|```\s*/g, '').trim();
      const generatedData = JSON.parse(cleanedText);
      
      // Transform data to ensure consistent field names
      if (generatedData.questions) {
        generatedData.questions = generatedData.questions.map(q => {
          // Fix option_figures -> options for non-verbal questions
          if (q.type === 'non-verbal' && q.option_figures && !q.options) {
            q.options = q.option_figures;
            delete q.option_figures;
          }
          return q;
        });
      }
      
      return generatedData;
    } catch (error) {
      console.error('Error generating questions with AI:', error);
      
      // Try rotating API key and retry once
      if (this.apiKeys.length > 1) {
        this.rotateApiKey();
        try {
          const model = this.genAI.getGenerativeModel({ model: this.selectedModel });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          const cleanedText = text.replace(/```json\s*|```\s*/g, '').trim();
          const retryData = JSON.parse(cleanedText);
          
          // Transform data to ensure consistent field names
          if (retryData.questions) {
            retryData.questions = retryData.questions.map(q => {
              // Fix option_figures -> options for non-verbal questions
              if (q.type === 'non-verbal' && q.option_figures && !q.options) {
                q.options = q.option_figures;
                delete q.option_figures;
              }
              return q;
            });
          }
          
          return retryData;
        } catch (retryError) {
          console.error('Retry with rotated API key also failed:', retryError);
        }
      }
      
      throw error;
    }
  }

  // Generate a new OIR test (with AI or fallback to static data)
  async generateTest() {
    try {
      // Try generating with AI first
      if (this.genAI && this.apiKeys.length > 0) {
        try {
          console.log('Generating OIR test with Gemini AI...');
          const aiGeneratedTest = await this.generateQuestionsWithAI();
          
          // Add timestamp and process the data
          const newTest = {
            test_id: `oir_test_ai_${Date.now()}`,
            time_limit_minutes: aiGeneratedTest.time_limit_minutes || 30,
            questions: aiGeneratedTest.questions,
            generated_at: new Date().toISOString(),
            generated_by: 'gemini_ai'
          };

          return {
            success: true,
            data: {
              test_id: newTest.test_id,
              time_limit_minutes: newTest.time_limit_minutes,
              questions: newTest.questions.map(q => ({
                id: q.id,
                type: q.type,
                question: q.question,
                options: q.options, // Always include options
                sequence: q.type === 'non-verbal' ? q.sequence : undefined
              })),
              generated_by: 'gemini_ai'
            }
          };
        } catch (aiError) {
          console.error('AI generation failed, falling back to static data:', aiError);
        }
      }
      
      // Fallback to static data
      console.log('Using static test data...');
      const testData = this.loadTestData();
      
      // Shuffle questions for randomness
      const shuffledQuestions = this.shuffleArray([...testData.questions]);
      
      // Create a new test with shuffled questions
      const newTest = {
        test_id: `oir_test_static_${Date.now()}`,
        time_limit_minutes: testData.time_limit_minutes,
        questions: shuffledQuestions,
        generated_at: new Date().toISOString(),
        generated_by: 'static_data'
      };

      return {
        success: true,
        data: {
          test_id: newTest.test_id,
          time_limit_minutes: newTest.time_limit_minutes,
          questions: newTest.questions.map(q => ({
            id: q.id,
            type: q.type,
            question: q.question,
            options: q.options, // Always include options
            sequence: q.type === 'non-verbal' ? q.sequence : undefined
          })),
          generated_by: 'static_data'
        }
      };
    } catch (error) {
      console.error('Error generating OIR test:', error);
      return {
        success: false,
        message: 'Failed to generate test',
        error: error.message
      };
    }
  }

  // Evaluate test submission
  evaluateTest(testId, userAnswers, timeTaken = 0) {
    try {
      const testData = this.loadTestData();
      const answerKey = testData.answer_key;
      
      let correctAnswers = 0;
      let totalQuestions = Object.keys(answerKey).length;
      let attemptedQuestions = 0;
      let results = [];
      let verbalCorrect = 0;
      let nonVerbalCorrect = 0;
      let verbalTotal = 0;
      let nonVerbalTotal = 0;

      // Evaluate each answer
      for (const [questionId, userAnswer] of Object.entries(userAnswers)) {
        const correctAnswer = answerKey[questionId];
        let isCorrect = false;

        if (userAnswer !== null && userAnswer !== undefined) {
          attemptedQuestions++;
        }

        if (typeof correctAnswer === 'string') {
          // Verbal question
          verbalTotal++;
          isCorrect = userAnswer === correctAnswer;
          if (isCorrect) verbalCorrect++;
        } else {
          // Non-verbal question - compare objects
          nonVerbalTotal++;
          isCorrect = this.compareNonVerbalAnswers(userAnswer, correctAnswer);
          if (isCorrect) nonVerbalCorrect++;
        }

        if (isCorrect) {
          correctAnswers++;
        }

        results.push({
          question_id: parseInt(questionId),
          user_answer: userAnswer,
          correct_answer: correctAnswer,
          is_correct: isCorrect
        });
      }

      // Calculate scores
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const verbalScore = verbalTotal > 0 ? Math.round((verbalCorrect / verbalTotal) * 100) : 0;
      const nonVerbalScore = nonVerbalTotal > 0 ? Math.round((nonVerbalCorrect / nonVerbalTotal) * 100) : 0;
      const percentile = this.calculatePercentile(score);

      return {
        success: true,
        data: {
          test_id: testId,
          score: score,
          correct_answers: correctAnswers,
          total_questions: totalQuestions,
          attempted_questions: attemptedQuestions,
          unattempted_questions: totalQuestions - attemptedQuestions,
          verbal_score: verbalScore,
          non_verbal_score: nonVerbalScore,
          percentile: percentile,
          performance_level: this.getPerformanceLevel(score),
          time_taken: timeTaken,
          results: results,
          evaluated_at: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error evaluating OIR test:', error);
      return {
        success: false,
        message: 'Failed to evaluate test',
        error: error.message
      };
    }
  }

  // Get detailed analytics for a test result
  getTestAnalytics(testResult) {
    try {
      const verbalQuestions = testResult.results.filter(r => r.question_id <= 10);
      const nonVerbalQuestions = testResult.results.filter(r => r.question_id > 10);

      const verbalScore = Math.round(
        (verbalQuestions.filter(q => q.is_correct).length / verbalQuestions.length) * 100
      );
      
      const nonVerbalScore = Math.round(
        (nonVerbalQuestions.filter(q => q.is_correct).length / nonVerbalQuestions.length) * 100
      );

      return {
        success: true,
        data: {
          overall_score: testResult.score,
          verbal_reasoning_score: verbalScore,
          non_verbal_reasoning_score: nonVerbalScore,
          strengths: this.identifyStrengths(verbalScore, nonVerbalScore),
          areas_for_improvement: this.identifyWeaknesses(verbalScore, nonVerbalScore),
          recommendations: this.getRecommendations(testResult.score)
        }
      };
    } catch (error) {
      console.error('Error generating analytics:', error);
      return {
        success: false,
        message: 'Failed to generate analytics',
        error: error.message
      };
    }
  }

  // Helper methods
  loadTestData() {
    const data = fs.readFileSync(this.testsDataPath, 'utf8');
    return JSON.parse(data);
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  compareNonVerbalAnswers(userAnswer, correctAnswer) {
    if (!userAnswer || !correctAnswer) return false;
    
    return (
      userAnswer.shape === correctAnswer.shape &&
      userAnswer.rotation === correctAnswer.rotation &&
      userAnswer.fill === correctAnswer.fill &&
      userAnswer.size === correctAnswer.size
    );
  }

  calculatePercentile(score) {
    // Simplified percentile calculation
    if (score >= 90) return 95;
    if (score >= 80) return 85;
    if (score >= 70) return 75;
    if (score >= 60) return 65;
    if (score >= 50) return 50;
    if (score >= 40) return 35;
    if (score >= 30) return 25;
    return 15;
  }

  getPerformanceLevel(score) {
    if (score >= 85) return 'Excellent';
    if (score >= 75) return 'Very Good';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Average';
    if (score >= 35) return 'Below Average';
    return 'Needs Improvement';
  }

  identifyStrengths(verbalScore, nonVerbalScore) {
    const strengths = [];
    
    if (verbalScore >= 75) {
      strengths.push('Strong verbal reasoning and analytical thinking');
    }
    
    if (nonVerbalScore >= 75) {
      strengths.push('Excellent pattern recognition and spatial intelligence');
    }
    
    if (verbalScore >= 65 && nonVerbalScore >= 65) {
      strengths.push('Well-balanced cognitive abilities');
    }
    
    if (strengths.length === 0) {
      strengths.push('Room for improvement in all areas');
    }
    
    return strengths;
  }

  identifyWeaknesses(verbalScore, nonVerbalScore) {
    const weaknesses = [];
    
    if (verbalScore < 60) {
      weaknesses.push('Verbal reasoning and logical thinking need practice');
    }
    
    if (nonVerbalScore < 60) {
      weaknesses.push('Pattern recognition and spatial intelligence require improvement');
    }
    
    return weaknesses;
  }

  getRecommendations(score) {
    const recommendations = [];
    
    if (score < 50) {
      recommendations.push('Focus on basic reasoning concepts and practice regularly');
      recommendations.push('Solve puzzles and brain teasers daily');
      recommendations.push('Practice time management during tests');
    } else if (score < 70) {
      recommendations.push('Work on advanced reasoning techniques');
      recommendations.push('Practice with timed mock tests');
      recommendations.push('Analyze your mistakes to avoid repetition');
    } else {
      recommendations.push('Maintain your performance with regular practice');
      recommendations.push('Focus on speed and accuracy');
      recommendations.push('Help others to strengthen your own understanding');
    }
    
    return recommendations;
  }
}

module.exports = OIRTestService;