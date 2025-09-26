import React from 'react';

const VerbalQuestion = ({ question, selectedAnswer, onAnswerSelect, disabled }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="mb-4">
        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full mb-3 inline-block">
          VERBAL REASONING
        </span>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {question.question}
        </h3>
      </div>
      
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
          const isSelected = selectedAnswer === option;
          
          return (
            <label
              key={index}
              className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={isSelected}
                onChange={() => !disabled && onAnswerSelect(option)}
                disabled={disabled}
                className="mr-3 h-4 w-4 text-blue-600"
              />
              <span className="flex items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-700 rounded-full text-sm font-medium mr-3">
                  {optionLabel}
                </span>
                <span className="text-gray-900">{option}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default VerbalQuestion;