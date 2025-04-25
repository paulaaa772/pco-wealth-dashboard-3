'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  darkMode?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color,
  darkMode = false
}) => {
  const sizeClass = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };
  
  // Use default color based on darkMode if no color is provided
  const spinnerColor = color || (darkMode ? '#4f83cc' : '#4F46E5');
  
  return (
    <div className="flex justify-center items-center">
      <div 
        className={`animate-spin rounded-full border-t-2 border-b-2 border-transparent ${sizeClass[size]}`}
        style={{ 
          borderTopColor: spinnerColor,
          borderBottomColor: spinnerColor
        }}
      />
    </div>
  );
};

export default LoadingSpinner; 