'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DataPoint {
  date: Date;
  value: number;
}

interface NetWorthChartProps {
  data: DataPoint[];
  title?: string;
  timeframes?: string[];
  height?: number;
  darkMode?: boolean;
  selectedTimeframe?: string;
  onTimeframeChange?: (timeframe: string) => void;
}

const DEFAULT_TIMEFRAMES = [
  { label: '1D', days: 1 },
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: 'YTD', isYTD: true },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: Infinity }
];

const NetWorthChart: React.FC<NetWorthChartProps> = ({
  data,
  title = "Net Worth Over Time",
  timeframes = ["1W", "1M", "3M", "6M", "1Y", "ALL"],
  height = 300,
  darkMode = false,
  selectedTimeframe: propSelectedTimeframe,
  onTimeframeChange
}) => {
  // Keep internal state as fallback if props aren't provided
  const [internalSelectedTimeframe, setInternalSelectedTimeframe] = useState<string>("1M");
  
  // Use prop value if provided, otherwise use internal state
  const selectedTimeframe = propSelectedTimeframe || internalSelectedTimeframe;
  
  // Handle timeframe changes
  const handleTimeframeChange = (timeframe: string) => {
    if (onTimeframeChange) {
      onTimeframeChange(timeframe);
    } else {
      setInternalSelectedTimeframe(timeframe);
    }
    console.log(`Changing timeframe to ${timeframe}`);
  };
  
  const [filteredData, setFilteredData] = useState<DataPoint[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Check if we're on a mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  // Filter available timeframes based on prop
  const availableTimeframes = DEFAULT_TIMEFRAMES.filter(tf => 
    timeframes.includes(tf.label)
  );
  
  // If we're on mobile, we might want to show fewer timeframes
  const displayTimeframes = isMobile 
    ? availableTimeframes.filter(tf => ['1M', '3M', '1Y', 'ALL'].includes(tf.label))
    : availableTimeframes;
  
  useEffect(() => {
    // Filter data based on selected timeframe
    const now = new Date();
    let startDate = new Date();
    
    console.log('NetWorthChart: Selected timeframe:', selectedTimeframe);
    console.log('NetWorthChart: Total data points:', data.length);
    
    // Handle YTD case specially
    if (selectedTimeframe === "YTD") {
      startDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
    } else if (selectedTimeframe === "1D") {
      // Last 24 hours
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else {
      // Find the correct timeframe object
      const timeframe = DEFAULT_TIMEFRAMES.find(tf => tf.label === selectedTimeframe);
      if (timeframe && typeof timeframe.days === 'number' && timeframe.days !== Infinity) {
        // Subtract the specified number of days
        startDate.setDate(now.getDate() - timeframe.days);
      } else if (selectedTimeframe === "ALL") {
        // Show all data by setting a very old date
        startDate = new Date(0);
      }
    }
    
    // Filter the data to include only points after the start date
    const filtered = data.filter(item => new Date(item.date) >= startDate);
    console.log('NetWorthChart: Filtered data points:', filtered.length, 'Start date:', startDate);
    setFilteredData(filtered);
  }, [selectedTimeframe, data]);

  // Format dates for chart labels
  const formatDate = (date: Date) => {
    // For mobile, use a more compact date format
    if (isMobile) {
      return new Date(date).toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric'
      });
    }
    
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: filteredData.length <= 12 ? '2-digit' : undefined
    });
  };

  // Calculate change statistics
  const startValue = filteredData.length > 0 ? filteredData[0].value : 0;
  const currentValue = filteredData.length > 0 ? filteredData[filteredData.length - 1].value : 0;
  const absoluteChange = currentValue - startValue;
  const percentChange = startValue > 0 ? (absoluteChange / startValue) * 100 : 0;
  const isPositive = absoluteChange >= 0;
  
  // Set theme colors based on darkMode
  const chartColors = {
    line: darkMode ? '#4f83cc' : '#4f46e5', // Line color
    background: darkMode ? 'rgba(79, 131, 204, 0.1)' : 'rgba(79, 70, 229, 0.1)', // Fill color
    text: darkMode ? '#fff' : '#1F2937', // Text color
    grid: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', // Grid lines
    positive: darkMode ? '#4ADE80' : '#16A34A', // Green for positive values
    negative: darkMode ? '#F87171' : '#DC2626' // Red for negative values
  };
  
  // Prepare data for Chart.js
  const chartData = {
    labels: filteredData.map(item => formatDate(item.date)),
    datasets: [
      {
        label: title,
        data: filteredData.map(item => item.value),
        borderColor: chartColors.line,
        backgroundColor: chartColors.background,
        fill: true,
        tension: 0.4,
        pointRadius: isMobile || filteredData.length > 30 ? 0 : 3, // Hide points on mobile or if there are too many data points
        pointBackgroundColor: chartColors.line,
        pointBorderColor: darkMode ? '#1D2939' : '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: chartColors.line,
        pointHoverBorderColor: darkMode ? '#1D2939' : '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };
  
  // Chart.js options - with responsive adjustments
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
          }
        },
        backgroundColor: darkMode ? '#2D3748' : 'rgba(0, 0, 0, 0.8)',
        titleColor: darkMode ? '#E2E8F0' : '#F9FAFB',
        bodyColor: darkMode ? '#E2E8F0' : '#F9FAFB',
        borderColor: darkMode ? '#4A5568' : '#E2E8F0',
        borderWidth: 1
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: isMobile ? 45 : 0,
          autoSkip: true,
          maxTicksLimit: isMobile ? 6 : (filteredData.length > 30 ? 12 : 8),
          color: darkMode ? 'rgba(255, 255, 255, 0.6)' : undefined,
          font: {
            size: isMobile ? 8 : 11
          }
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            // Compact display for mobile
            if (isMobile) {
              return '$' + Number(value).toLocaleString(undefined, {
                notation: 'compact',
                compactDisplay: 'short'
              });
            }
            return '$' + Number(value).toLocaleString();
          },
          color: darkMode ? 'rgba(255, 255, 255, 0.6)' : undefined,
          font: {
            size: isMobile ? 9 : 11
          }
        },
        grid: {
          color: chartColors.grid
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };
  
  const containerClass = darkMode 
    ? "bg-[#1D2939] p-2 sm:p-4 rounded-lg" 
    : "bg-white p-2 sm:p-4 rounded-lg shadow";
  
  const titleClass = darkMode 
    ? "text-base sm:text-lg font-semibold text-white" 
    : "text-base sm:text-lg font-semibold text-gray-900";
  
  const positiveClass = darkMode 
    ? "text-green-400" 
    : "text-green-600";
  
  const negativeClass = darkMode 
    ? "text-red-400" 
    : "text-red-600";
  
  const dateRangeClass = darkMode 
    ? "text-xs sm:text-sm text-gray-400" 
    : "text-xs sm:text-sm text-gray-500";
  
  return (
    <div className={containerClass}>
      {title && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 sm:mb-4">
          <div>
            <h3 className={titleClass}>{title}</h3>
            {filteredData.length > 0 && (
              <div className="flex items-center mt-1">
                <span className={`font-medium ${isPositive ? positiveClass : negativeClass}`}>
                  {isPositive ? '+' : ''}${Math.abs(absoluteChange).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
                <span className={`ml-2 text-xs sm:text-sm ${isPositive ? positiveClass : negativeClass}`}>
                  ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2 sm:mt-0 sm:flex-nowrap sm:space-x-2">
            {displayTimeframes.map(timeframe => (
              <button
                key={timeframe.label}
                className={`px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs rounded ${
                  selectedTimeframe === timeframe.label 
                    ? 'bg-blue-500 text-white' 
                    : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleTimeframeChange(timeframe.label)}
              >
                {timeframe.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ height: `${isMobile ? height * 0.7 : height}px` }}>
        {filteredData.length > 0 ? (
          <Line data={chartData} options={options} height={height} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className={darkMode ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>No data available for the selected time period</p>
          </div>
        )}
      </div>
      
      {filteredData.length > 0 && (
        <div className="mt-2 sm:mt-4 flex justify-between">
          <span className={dateRangeClass}>
            {new Date(filteredData[0].date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: isMobile ? undefined : 'numeric'
            })}
          </span>
          <span className={dateRangeClass}>
            {new Date(filteredData[filteredData.length - 1].date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: isMobile ? undefined : 'numeric'
            })}
          </span>
        </div>
      )}
    </div>
  );
};

export default NetWorthChart; 