import React from 'react';

interface OnlineStatusProps {
  isOnline: boolean;
}

const OnlineStatus: React.FC<OnlineStatusProps> = ({ isOnline }) => {
  return (
    <span 
      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
        isOnline ? 'bg-green-500' : 'bg-gray-400'
      }`}
      aria-label={isOnline ? 'Online' : 'Offline'}
    />
  );
};

export default OnlineStatus;