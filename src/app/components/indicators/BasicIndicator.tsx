'use client'

import React, { useState, useEffect } from 'react';

interface BasicIndicatorProps {
  label: string;
  value: number | string;
  change?: number; // Optional change value
  format?: 'currency' | 'percentage' | 'number'; // Format type
  showIcon?: boolean; // Whether to show up/down icon
}

const BasicIndicator: React.FC<BasicIndicatorProps> = ({
  label,
  value,
  change = 0,
  format = 'number',
  showIcon = true
}) => {
  const [formattedValue, setFormattedValue] = useState<string>('');
  const [formattedChange, setFormattedChange] = useState<string>('');
  
  useEffect(() => {
    // Format the value based on the format type
    if (typeof value === 'number') {
      switch (format) {
        case 'currency':
          setFormattedValue(new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD' 
          }).format(value));
          break;
        case 'percentage':
          setFormattedValue(new Intl.NumberFormat('en-US', { 
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(value/100));
          break;
        default:
          setFormattedValue(new Intl.NumberFormat('en-US').format(value));
      }
    } else {
      setFormattedValue(value.toString());
    }
    
    // Format the change value
    if (typeof change === 'number') {
      const prefix = change > 0 ? '+' : '';
      switch (format) {
        case 'currency':
          setFormattedChange(`${prefix}${new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD' 
          }).format(change)}`);
          break;
        case 'percentage':
          setFormattedChange(`${prefix}${new Intl.NumberFormat('en-US', { 
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(change/100)}`);
          break;
        default:
          setFormattedChange(`${prefix}${new Intl.NumberFormat('en-US').format(change)}`);
      }
    }
  }, [value, change, format]);
  
  // Determine the color based on the change value
  const getColorClass = () => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-400';
  };
  
  // Icon for direction
  const renderIcon = () => {
    if (!showIcon) return null;
    
    if (change > 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      );
    } else if (change < 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return null;
  };
  
  return (
    <div className="flex flex-col bg-gray-900 rounded-lg p-3 shadow-md">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-xl font-semibold text-white">{formattedValue}</div>
      {change !== undefined && (
        <div className="flex items-center mt-1">
          {renderIcon()}
          <span className={`text-sm ml-1 ${getColorClass()}`}>
            {formattedChange}
          </span>
        </div>
      )}
    </div>
  );
};

export default BasicIndicator; 