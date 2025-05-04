import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'small' | 'medium' | 'large';
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt,
  size = 'medium'
}) => {
  const sizeMap = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };
  
  const iconSizeMap = {
    small: 14,
    medium: 20,
    large: 28
  };

  if (!src) {
    return (
      <div 
        className={`${sizeMap[size]} rounded-full bg-gray-200 flex items-center justify-center`}
        aria-label={alt}
      >
        <User size={iconSizeMap[size]} color="#666" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeMap[size]} rounded-full object-cover`}
    />
  );
};

export default Avatar;