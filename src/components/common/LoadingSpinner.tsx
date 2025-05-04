import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'var(--color-primary)' 
}) => {
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 36
  };

  return (
    <Loader2 
      size={sizeMap[size]} 
      color={color} 
      className="animate-spin" 
    />
  );
};

export default LoadingSpinner;