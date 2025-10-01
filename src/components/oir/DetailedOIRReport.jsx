import React, { useState, useRef } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Target, 
  Award, 
  BarChart3, 
  Download,
  Clock,
  Brain,
  User,
  Calendar,
  FileText,
  Star,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';

const DetailedOIRReport = ({ results, testData, userDetails, questions, answers, onRetakeTest, onBackToDrills }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const reportRef = useRef(null);

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
    results: results.results || [],
    verbal_score: results.verbal_score || 0,
    non_verbal_score: results.non_verbal_score || 0,
    attempted_questions: results.attempted_questions || 0,
    unattempted_questions: results.unattempted_questions || 0
  };

  // Calculate detailed analytics
  const analytics = {
    accuracy: safeResults.total_questions > 0 ? (safeResults.correct_answers / safeResults.total_questions) * 100 : 0,
    attempt_rate: safeResults.total_questions > 0 ? (safeResults.attempted_questions / safeResults.total_questions) * 100 : 0,
    average_time_per_question: safeResults.attempted_questions > 0 ? safeResults.time_taken / safeResults.attempted_questions : 0,
    efficiency_score: safeResults.time_taken > 0 ? (safeResults.correct_answers * 60) / safeResults.time_taken : 0,
    strengths: [],
    areas_for_improvement: [],
    recommendations: []
  };

  // Generate dynamic insights based on performance
  if (safeResults.score >= 80) {
    analytics.strengths.push("Excellent overall performance");
    analytics.strengths.push("Strong analytical thinking");
  } else if (safeResults.score >= 60) {
    analytics.strengths.push("Good problem-solving abilities");
    analytics.areas_for_improvement.push("Focus on improving accuracy");
  } else {
    analytics.areas_for_improvement.push("Needs significant improvement in core concepts");
    analytics.areas_for_improvement.push("Practice more questions regularly");
  }

  if (analytics.accuracy >= 75) {
    analytics.strengths.push("High accuracy in attempted questions");
  } else if (analytics.accuracy >= 50) {
    analytics.areas_for_improvement.push("Improve accuracy through careful reading");
  } else {
    analytics.areas_for_improvement.push("Focus on understanding question patterns");
  }

  if (analytics.attempt_rate >= 90) {
    analytics.strengths.push("Good time management skills");
  } else if (analytics.attempt_rate >= 70) {
    analytics.areas_for_improvement.push("Work on completing more questions");
  } else {
    analytics.areas_for_improvement.push("Significant improvement needed in time management");
  }

  // Generate recommendations
  if (safeResults.verbal_score < safeResults.non_verbal_score) {
    analytics.recommendations.push("Focus more on verbal reasoning practice");
    analytics.recommendations.push("Read comprehension passages daily");
  } else if (safeResults.non_verbal_score < safeResults.verbal_score) {
    analytics.recommendations.push("Practice pattern recognition exercises");
    analytics.recommendations.push("Solve more spatial reasoning problems");
  }

  if (analytics.average_time_per_question > 90) {
    analytics.recommendations.push("Practice time-bound mock tests");
    analytics.recommendations.push("Learn quick calculation techniques");
  }

  analytics.recommendations.push("Regular practice with variety of question types");
  analytics.recommendations.push("Analyze mistakes to avoid repetition");

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

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const generatePDF = async () => {
    if (isGeneratingPDF) return;

    setPdfError(null);
    setIsGeneratingPDF(true);

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const marginX = 16;
      const maxWidth = 180;
      const lineHeight = 6;
      let cursorY = 22;

      const ensureSpace = (lines = 1) => {
        if (cursorY + lines * lineHeight > 280) {
          doc.addPage();
          cursorY = 22;
        }
      };

      const addHeading = (text, size = 16) => {
        ensureSpace(2);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(size);
        doc.text(text, marginX, cursorY);
        cursorY += size / 2 + 4;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
      };

      const addParagraph = (text, options = {}) => {
        const { bold = false } = options;
        const lines = doc.splitTextToSize(text, maxWidth);
        ensureSpace(lines.length);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.text(lines, marginX, cursorY);
        cursorY += lines.length * lineHeight;
        doc.setFont('helvetica', 'normal');
      };

      const addKeyValueRows = (rows) => {
        rows.forEach(([label, value]) => {
          ensureSpace(1);
          doc.setFont('helvetica', 'bold');
          doc.text(`${label}:`, marginX, cursorY);
          doc.setFont('helvetica', 'normal');
          doc.text(String(value), marginX + 48, cursorY);
          cursorY += lineHeight;
        });
      };

      const addBulletList = (items, emptyFallback) => {
        if (!items || items.length === 0) {
          addParagraph(emptyFallback || '—');
          return;
        }

        items.forEach((item) => {
          const lines = doc.splitTextToSize(item, maxWidth - 8);
          ensureSpace(lines.length);
          doc.text('•', marginX, cursorY);
          doc.text(lines, marginX + 6, cursorY);
          cursorY += lines.length * lineHeight;
        });
      };

      addHeading('Officer Intelligence Rating (OIR)');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      ensureSpace(1);
      doc.text('Detailed Performance Report', marginX, cursorY);
      cursorY += lineHeight + 2;

      addHeading('Candidate Information', 13);
      addKeyValueRows([
        ['Candidate', userDetails?.name || 'Test Candidate'],
        ['Date', new Date().toLocaleDateString()],
        ['Test ID', testData?.test_id || 'N/A']
      ]);
      cursorY += 2;

      addHeading('Overall Performance', 13);
      addParagraph(`Overall Score: ${safeResults.score}% (${safeResults.performance_level})`, { bold: true });
      addKeyValueRows([
        ['Correct Answers', `${safeResults.correct_answers}/${safeResults.total_questions}`],
        ['Percentile Rank', `${safeResults.percentile}th`],
        ['Time Taken', formatTime(safeResults.time_taken)],
        ['Accuracy', `${analytics.accuracy.toFixed(1)}%`],
        ['Attempt Rate', `${analytics.attempt_rate.toFixed(1)}%`],
        ['Average Time/Question', `${Math.round(analytics.average_time_per_question)}s`]
      ]);
      cursorY += 2;

      addHeading('Verbal vs Non-Verbal', 13);
      addKeyValueRows([
        ['Verbal Reasoning Score', `${safeResults.verbal_score}%`],
        ['Non-Verbal Reasoning Score', `${safeResults.non_verbal_score}%`]
      ]);
      cursorY += 2;

      addHeading('Strengths', 13);
      addBulletList(analytics.strengths, 'No specific strengths identified.');
      cursorY += 2;

      addHeading('Areas for Improvement', 13);
      addBulletList(analytics.areas_for_improvement, 'No critical weaknesses detected.');
      cursorY += 2;

      addHeading('Recommendations', 13);
      addBulletList(analytics.recommendations, 'No recommendations at this time.');
      cursorY += 2;

      if (safeResults.results?.length) {
        addHeading('Question Summary', 13);
        const statuses = safeResults.results.map((result) => {
          const status = result.is_correct ? 'Correct' : (result.user_answer !== null ? 'Incorrect' : 'Not Attempted');
          return `Q${result.question_id}: ${status}`;
        });

        const columns = 3;
        const columnWidth = 60;
        const rowsPerColumn = Math.ceil(statuses.length / columns);

        for (let row = 0; row < rowsPerColumn; row += 1) {
          ensureSpace(1);
          for (let col = 0; col < columns; col += 1) {
            const index = row + col * rowsPerColumn;
            if (index >= statuses.length) continue;
            doc.text(statuses[index], marginX + col * columnWidth, cursorY);
          }
          cursorY += lineHeight;
        }
      }

      ensureSpace(2);
      cursorY += lineHeight;
      doc.setFont('helvetica', 'italic');
      doc.text(`Report generated on ${new Date().toLocaleString()}`, marginX, cursorY);

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const filename = `OIR_Test_Report_${userDetails?.name || 'Candidate'}_${timestamp}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setPdfError('Failed to generate PDF. Please try again after reloading the page.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={generatePDF}
          disabled={isGeneratingPDF}
          className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          <span>{isGeneratingPDF ? 'Generating PDF...' : 'Export as PDF'}</span>
        </button>
      </div>
      {pdfError && (
        <p className="text-sm text-red-600 text-right -mt-3">
          {pdfError}
        </p>
      )}

      {/* PDF Report Content */}
      <div ref={reportRef} className="bg-white p-8 space-y-8">
        
        {/* Report Header */}
        <div className="text-center border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Officer Intelligence Rating (OIR)</h1>
          <h2 className="text-xl text-gray-600 mb-4">Detailed Performance Report</h2>
          
          {/* Candidate Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Candidate:</span>
              <span>{userDetails?.name || 'Test Candidate'}</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Test ID:</span>
              <span>{testData?.test_id || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Overall Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Score Summary */}
          <div className="text-center bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center justify-center mb-4">
              <Award className="w-16 h-16 text-yellow-500" />
            </div>
            <div className={`text-5xl font-bold mb-2 ${getScoreColor(safeResults.score)}`}>
              {safeResults.score}%
            </div>
            <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium border ${getPerformanceColor(safeResults.performance_level)}`}>
              {safeResults.performance_level}
            </div>
            <div className="text-gray-600 text-sm mt-2">Overall Score</div>
          </div>

          {/* Key Metrics */}
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Correct Answers:</span>
              <span className="font-semibold text-green-600">{safeResults.correct_answers}/{safeResults.total_questions}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Percentile Rank:</span>
              <span className="font-semibold text-blue-600">{safeResults.percentile}th</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Time Taken:</span>
              <span className="font-semibold text-purple-600">{formatTime(safeResults.time_taken)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Accuracy:</span>
              <span className="font-semibold text-indigo-600">{analytics.accuracy.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2" />
            Performance Breakdown
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-center">
                <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">{safeResults.verbal_score}%</div>
                <div className="text-sm text-blue-700">Verbal Reasoning</div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-center">
                <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900">{safeResults.non_verbal_score}%</div>
                <div className="text-sm text-purple-700">Non-Verbal Reasoning</div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">{safeResults.attempted_questions}</div>
                <div className="text-sm text-green-700">Questions Attempted</div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="text-center">
                <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-900">{Math.round(analytics.average_time_per_question)}s</div>
                <div className="text-sm text-orange-700">Avg. Time/Question</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2" />
            Detailed Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Strengths
              </h4>
              {analytics.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {analytics.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start text-green-700 text-sm">
                      <CheckCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-700 text-sm">Focus on building fundamental strengths through practice.</p>
              )}
            </div>

            {/* Areas for Improvement */}
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                <TrendingDown className="w-5 h-5 mr-2" />
                Areas for Improvement
              </h4>
              {analytics.areas_for_improvement.length > 0 ? (
                <ul className="space-y-2">
                  {analytics.areas_for_improvement.map((area, index) => (
                    <li key={index} className="flex items-start text-orange-700 text-sm">
                      <AlertTriangle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-orange-700 text-sm">Continue maintaining your excellent performance!</p>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">
            Recommendations for Improvement
          </h3>
          <ul className="space-y-3">
            {analytics.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start text-blue-800">
                <TrendingUp className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Question-wise Analysis */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Question-wise Performance</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-10 gap-2 mb-4">
              {safeResults.results && safeResults.results.map((result, index) => (
                <div
                  key={index}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${
                    result.is_correct 
                      ? 'bg-green-500 text-white'
                      : result.user_answer !== null
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-300 text-gray-700'
                  }`}
                  title={`Question ${result.question_id}: ${
                    result.is_correct ? 'Correct' : 
                    result.user_answer !== null ? 'Incorrect' : 'Not Attempted'
                  }`}
                >
                  {result.question_id}
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span>Correct ({safeResults.correct_answers})</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span>Incorrect ({safeResults.attempted_questions - safeResults.correct_answers})</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
                <span>Not Attempted ({safeResults.unattempted_questions})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Report Footer */}
        <div className="text-center text-gray-500 text-sm border-t pt-4">
          <p>This report was generated automatically by the IRUN-Samadhaan SSB Practice Platform</p>
          <p>Report generated on: {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
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

export default DetailedOIRReport;