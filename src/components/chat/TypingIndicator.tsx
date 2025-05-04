import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex mb-2 justify-start">
      <div className="bg-white rounded-lg p-3 shadow-sm">
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;