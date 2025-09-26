import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, X, Timer, Target } from 'lucide-react';

const DistractionQuiz = ({ 
  isVisible, 
  onClose, 
  onComplete, 
  subject = 'general',
  difficulty = 'easy' 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Sample quiz questions
  const quizQuestions = {
    general: [
      {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2
      },
      {
        question: "Which planet is closest to the Sun?",
        options: ["Venus", "Mercury", "Earth", "Mars"],
        correct: 1
      },
      {
        question: "What is 15 × 8?",
        options: ["120", "115", "125", "110"],
        correct: 0
      }
    ],
    math: [
      {
        question: "What is the square root of 144?",
        options: ["12", "14", "16", "10"],
        correct: 0
      },
      {
        question: "If x + 5 = 12, what is x?",
        options: ["7", "8", "6", "9"],
        correct: 0
      },
      {
        question: "What is 25% of 80?",
        options: ["15", "20", "25", "30"],
        correct: 1
      }
    ],
    science: [
      {
        question: "What is H2O commonly known as?",
        options: ["Oxygen", "Hydrogen", "Water", "Carbon Dioxide"],
        correct: 2
      },
      {
        question: "How many bones are in the human body?",
        options: ["206", "208", "204", "210"],
        correct: 0
      },
      {
        question: "What gas do plants absorb from the atmosphere?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        correct: 2
      }
    ]
  };

  const questions = quizQuestions[subject] || quizQuestions.general;

  useEffect(() => {
    if (!isVisible || isCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNextQuestion();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, currentQuestion, isCompleted]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      setIsCompleted(true);
      setShowResult(true);
    }
  };

  const handleClose = () => {
    // Reset quiz state
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setTimeLeft(30);
    setIsCompleted(false);
    setShowResult(false);
    onClose();
  };

  const handleComplete = () => {
    const finalScore = score + (selectedAnswer === questions[currentQuestion]?.correct ? 1 : 0);
    const percentage = Math.round((finalScore / questions.length) * 100);
    
    onComplete({
      score: finalScore,
      total: questions.length,
      percentage,
      subject,
      difficulty
    });
    
    handleClose();
  };

  if (!isVisible) return null;

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="glassmorphic-quiz-container">
        {/* Header */}
        <div className="glassmorphic-quiz-header">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-500" />
            <div>
              <h2 className="text-lg font-bold text-gray-800">Quick Focus Quiz</h2>
              <p className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="glassmorphic-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="glassmorphic-progress-container">
          <div 
            className="glassmorphic-progress-bar" 
            style={{ width: `${progress}%` }}
          />
        </div>

        {!showResult ? (
          <>
            {/* Timer */}
            <div className="glassmorphic-timer">
              <Timer className="w-4 h-4 text-orange-500" />
              <span className="font-mono text-lg font-bold text-gray-800">
                {timeLeft}s
              </span>
            </div>

            {/* Question */}
            <div className="glassmorphic-quiz-content">
              <h3 className="glassmorphic-quiz-question">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="glassmorphic-options-grid">
                {currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`glassmorphic-option ${
                      selectedAnswer === index ? 'selected' : ''
                    }`}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="option-text">{option}</span>
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null}
                className="glassmorphic-submit-btn"
              >
                {currentQuestion + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}
              </button>
            </div>
          </>
        ) : (
          /* Results */
          <div className="glassmorphic-quiz-results">
            <div className="result-icon">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            
            <h3 className="result-title">Quiz Completed!</h3>
            
            <div className="result-stats">
              <div className="stat-item">
                <Target className="w-5 h-5 text-blue-500" />
                <span>{score}/{questions.length} Correct</span>
              </div>
              <div className="stat-item">
                <Brain className="w-5 h-5 text-purple-500" />
                <span>{Math.round((score / questions.length) * 100)}% Score</span>
              </div>
            </div>

            <p className="result-message">
              {score === questions.length
                ? "Perfect! Your focus is sharp! 🎯"
                : score >= questions.length * 0.7
                ? "Great job! You're back on track! 👏"
                : "Good attempt! Let's keep practicing! 💪"
              }
            </p>

            <button
              onClick={handleComplete}
              className="glassmorphic-submit-btn"
            >
              Continue Learning
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistractionQuiz;