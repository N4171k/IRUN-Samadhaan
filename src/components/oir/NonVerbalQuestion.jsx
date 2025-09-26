import React from 'react';
import ShapeRenderer from './ShapeRenderer';

const NonVerbalQuestion = ({ question, selectedAnswer, onAnswerSelect, disabled }) => {
  // Add safety checks for question structure
  if (!question) {
    return (
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <p className="text-red-800">Error: Question data is missing</p>
      </div>
    );
  }

  if (!question.sequence || !Array.isArray(question.sequence)) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <p className="text-yellow-800">Error: Question sequence is missing or invalid</p>
        <pre className="text-xs mt-2">{JSON.stringify(question, null, 2)}</pre>
      </div>
    );
  }

  if (!question.options || !Array.isArray(question.options)) {
    // Check for legacy option_figures field as fallback
    if (question.option_figures && Array.isArray(question.option_figures)) {
      console.warn('Using legacy option_figures field. This should be updated to use options.');
      question.options = question.option_figures;
    } else {
      return (
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <p className="text-yellow-800">Error: Question options are missing or invalid</p>
          <pre className="text-xs mt-2">{JSON.stringify(question, null, 2)}</pre>
        </div>
      );
    }
  }
  const isAnswerSelected = (option) => {
    if (!selectedAnswer) return false;
    return (
      selectedAnswer.shape === option.shape &&
      selectedAnswer.rotation === option.rotation &&
      selectedAnswer.fill === option.fill &&
      selectedAnswer.size === option.size
    );
  };

  const serializeShape = (shape) => {
    return JSON.stringify(shape);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="mb-6">
        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full mb-3 inline-block">
          NON-VERBAL REASONING
        </span>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {question.question}
        </h3>
        
        {/* Sequence Display */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Sequence:</h4>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            {question.sequence && question.sequence.map((shape, index) => {
              // Safety check for each shape
              if (!shape || typeof shape !== 'object') {
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-red-100 border border-red-300 rounded flex items-center justify-center">
                      <span className="text-red-500 text-xs">Invalid</span>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{index + 1}</span>
                  </div>
                );
              }
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <ShapeRenderer shape={shape} size={60} />
                  <span className="text-xs text-gray-500 mt-1">{index + 1}</span>
                </div>
              );
            })}
            <div className="flex items-center">
              <span className="text-2xl text-gray-400 mx-2">→</span>
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                <span className="text-gray-400 text-lg">?</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Options */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Choose the correct option:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {question.options && question.options.map((option, index) => {
            // Safety check for each option
            if (!option || typeof option !== 'object') {
              return (
                <div key={index} className="flex flex-col items-center p-4 rounded-lg border-2 border-red-300 bg-red-50">
                  <div className="w-12 h-12 bg-red-100 border border-red-300 rounded flex items-center justify-center mb-2">
                    <span className="text-red-500 text-xs">Invalid</span>
                  </div>
                  <span className="text-red-500 text-xs">Option {String.fromCharCode(65 + index)}</span>
                </div>
              );
            }
            
            const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
            const isSelected = isAnswerSelected(option);
            
            return (
              <label
                key={index}
                className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={serializeShape(option)}
                  checked={isSelected}
                  onChange={() => !disabled && onAnswerSelect(option)}
                  disabled={disabled}
                  className="sr-only"
                />
                
                <div className="mb-2">
                  <ShapeRenderer shape={option} size={50} />
                </div>
                
                <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {optionLabel}
                </span>
              </label>
            );
          })}
        </div>
      </div>
      
      {/* Shape Legend */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <h5 className="text-xs font-medium text-blue-900 mb-2">Shape Properties:</h5>
        <div className="text-xs text-blue-800 space-y-1">
          <div><strong>Fill:</strong> None (outline), Filled (solid), Striped (diagonal lines)</div>
          <div><strong>Size:</strong> Small, Medium, Large</div>
          <div><strong>Rotation:</strong> 0° to 360° (clockwise from top)</div>
        </div>
      </div>
    </div>
  );
};

export default NonVerbalQuestion;