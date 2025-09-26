import React from 'react';
import { CheckCircle, XCircle, TrendingUp, Target, Award, BarChart3 } from 'lucide-react';

const TestResults = ({ results, analytics, onRetakeTest, onBackToDrills }) => {
  // Safety checks for results
  if (!results) {
    return (
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <p className="text-red-800">Error: Test results are missing</p>
      </div>
    );
  }
  
  // Provide safe defaults for missing values
  const safeResults = {
    score: results.score || 0,
    correct_answers: results.correct_answers || 0,
    total_questions: results.total_questions || 0,
    percentile: results.percentile || 0,
    time_taken: results.time_taken || 0,
    performance_level: results.performance_level || 'Needs Improvement',
    results: results.results || []
  };
  const getPerformanceColor = (level) => {
    switch (level) {
      case 'Excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'Very Good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Good': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'Average': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Below Average': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-indigo-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 35) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Award className="w-12 h-12 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Completed!</h2>
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(safeResults.score)}`}>
            {safeResults.score}%
          </div>
          <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium border ${getPerformanceColor(safeResults.performance_level)}`}>
            {safeResults.performance_level}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">
            {safeResults.correct_answers}/{safeResults.total_questions}
          </div>
          <div className="text-sm text-gray-600">Correct Answers</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
          <Target className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">
            {safeResults.percentile}th
          </div>
          <div className="text-sm text-gray-600">Percentile</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
          <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">
            {Math.round((safeResults.time_taken || 0) / 60)} min
          </div>
          <div className="text-sm text-gray-600">Time Taken</div>
        </div>
      </div>

      {/* Detailed Analytics */}
      {analytics && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Detailed Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score Breakdown */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Score Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Verbal Reasoning:</span>
                  <span className={`font-semibold ${getScoreColor(analytics.verbal_reasoning_score)}`}>
                    {analytics.verbal_reasoning_score}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Non-Verbal Reasoning:</span>
                  <span className={`font-semibold ${getScoreColor(analytics.non_verbal_reasoning_score)}`}>
                    {analytics.non_verbal_reasoning_score}%
                  </span>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Key Insights</h4>
              
              {analytics.strengths && analytics.strengths.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-green-700 mb-1">Strengths:</h5>
                  <ul className="text-sm text-green-600 space-y-1">
                    {analytics.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-3 h-3 mt-1 mr-2 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analytics.areas_for_improvement && analytics.areas_for_improvement.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-orange-700 mb-1">Areas for Improvement:</h5>
                  <ul className="text-sm text-orange-600 space-y-1">
                    {analytics.areas_for_improvement.map((area, index) => (
                      <li key={index} className="flex items-start">
                        <XCircle className="w-3 h-3 mt-1 mr-2 flex-shrink-0" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analytics && analytics.recommendations && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Recommendations for Improvement
          </h3>
          <ul className="space-y-2">
            {analytics.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start text-blue-800">
                <TrendingUp className="w-4 h-4 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Question-wise Review */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Question-wise Review
        </h3>
        
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {safeResults.results && safeResults.results.map((result, index) => (
            <div
              key={index}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                result.is_correct 
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}
              title={`Question ${result.question_id}: ${result.is_correct ? 'Correct' : 'Incorrect'}`}
            >
              {result.question_id}
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded-full mr-2"></div>
            <span className="text-gray-600">Correct</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded-full mr-2"></div>
            <span className="text-gray-600">Incorrect</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRetakeTest}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Take Test Again
        </button>
        <button
          onClick={onBackToDrills}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Back to SSB Drills
        </button>
      </div>
    </div>
  );
};

export default TestResults;