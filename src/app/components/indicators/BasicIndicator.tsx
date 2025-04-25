'use client'

import React from 'react';
import { FaArrowUp, FaArrowDown, FaInfoCircle } from 'react-icons/fa';
import { Tooltip as ReactTooltip } from 'react-tooltip';

interface BasicIndicatorProps {
  label: string;
  value: number;
  change?: number;
  format?: 'currency' | 'percentage' | 'number';
  showIcon?: boolean;
  tooltipContent?: string;
}

const BasicIndicator: React.FC<BasicIndicatorProps> = ({
  label,
  value,
  change = 0,
  format = 'number',
  showIcon = true,
  tooltipContent,
}) => {
  // Format value based on type
  const formatValue = (val: number): string => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val);
    } else if (format === 'percentage') {
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val / 100);
    } else {
      return new Intl.NumberFormat('en-US').format(val);
    }
  };

  // Determine color and icon based on change value
  const getColorAndIcon = () => {
    if (!showIcon || change === 0) {
      return {
        containerClass: 'bg-gray-800',
        textClass: 'text-white',
        icon: null,
      };
    }

    if (change > 0) {
      return {
        containerClass: 'bg-green-900/20 border-green-600/30',
        textClass: 'text-green-400',
        icon: <FaArrowUp className="text-green-400" />,
      };
    } else {
      return {
        containerClass: 'bg-red-900/20 border-red-600/30',
        textClass: 'text-red-400',
        icon: <FaArrowDown className="text-red-400" />,
      };
    }
  };

  const { containerClass, textClass, icon } = getColorAndIcon();
  
  // Generate default tooltip content if not provided
  const getTooltipContent = (): string => {
    if (tooltipContent) return tooltipContent;
    
    switch (label) {
      case 'Current Price':
        return 'The latest market price for this stock';
      case 'Daily Change':
        return 'The absolute price change since previous market close';
      case 'Change %':
        return 'The percentage change since previous market close';
      case 'Volume':
        return 'The number of shares traded today';
      default:
        return `Information about ${label}`;
    }
  };

  const tooltipId = `tooltip-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`p-4 border rounded-lg ${containerClass}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-gray-400 text-sm font-medium flex items-center">
          {label}
          <span 
            className="ml-1 cursor-help" 
            data-tooltip-id={tooltipId}
            data-tooltip-content={getTooltipContent()}
          >
            <FaInfoCircle className="text-gray-500 text-xs" />
          </span>
          <ReactTooltip id={tooltipId} place="top" />
        </h3>
        {icon && <span>{icon}</span>}
      </div>
      <div className={`text-xl font-bold ${textClass}`}>{formatValue(value)}</div>
    </div>
  );
};

export default BasicIndicator; 