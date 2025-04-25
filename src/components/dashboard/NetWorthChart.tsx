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
}

const DEFAULT_TIMEFRAMES = [
  { label: '1D', days: 1 },
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: 'YTD', isYTD: true },
  { label: '1Y', days: 365 },
  { label: 'All', days: Infinity }
];

const NetWorthChart: React.FC<NetWorthChartProps> = ({
  data,
  title = "Net Worth Over Time",
  timeframes = ["1W", "1M", "3M", "6M", "1Y", "All"],
  height = 300,
  darkMode = false
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1M");
  const [filteredData, setFilteredData] = useState<DataPoint[]>([]);
  
  // Filter available timeframes based on prop
  const availableTimeframes = DEFAULT_TIMEFRAMES.filter(tf => 
    timeframes.includes(tf.label)
  );
  
  useEffect(() => {
    // Filter data based on selected timeframe
    const now = new Date();
    let startDate = new Date();
    
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
      } else if (selectedTimeframe === "All") {
        // Show all data by setting a very old date
        startDate = new Date(0);
      }
    }
    
    // Filter the data to include only points after the start date
    const filtered = data.filter(item => new Date(item.date) >= startDate);
    setFilteredData(filtered);
  }, [selectedTimeframe, data]);

  // Format dates for chart labels
  const formatDate = (date: Date) => {
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
        pointRadius: filteredData.length > 30 ? 0 : 3, // Hide points if there are too many data points
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
  
  // Chart.js options
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
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: filteredData.length > 30 ? 12 : 8,
          color: darkMode ? 'rgba(255, 255, 255, 0.6)' : undefined
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return '$' + Number(value).toLocaleString();
          },
          color: darkMode ? 'rgba(255, 255, 255, 0.6)' : undefined
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
    ? "bg-[#1D2939] p-4 rounded-lg" 
    : "bg-white p-4 rounded-lg shadow";
  
  const titleClass = darkMode 
    ? "text-lg font-semibold text-white" 
    : "text-lg font-semibold text-gray-900";
  
  const positiveClass = darkMode 
    ? "text-green-400" 
    : "text-green-600";
  
  const negativeClass = darkMode 
    ? "text-red-400" 
    : "text-red-600";
  
  const dateRangeClass = darkMode 
    ? "text-sm text-gray-400" 
    : "text-sm text-gray-500";
  
  return (
    <div className={containerClass}>
      {title && (
        <div className="flex justify-between items-center mb-4">
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
                <span className={`ml-2 text-sm ${isPositive ? positiveClass : negativeClass}`}>
                  ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
          {!darkMode && (
            <div className="flex space-x-2">
              {availableTimeframes.map(timeframe => (
                <button
                  key={timeframe.label}
                  className={`px-3 py-1 text-sm rounded ${
                    selectedTimeframe === timeframe.label 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedTimeframe(timeframe.label)}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div style={{ height: `${height}px` }}>
        {filteredData.length > 0 ? (
          <Line data={chartData} options={options} height={height} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className={darkMode ? "text-gray-400" : "text-gray-500"}>No data available for the selected time period</p>
          </div>
        )}
      </div>
      
      {filteredData.length > 0 && (
        <div className="mt-4 flex justify-between">
          <span className={dateRangeClass}>
            {new Date(filteredData[0].date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <span className={dateRangeClass}>
            {new Date(filteredData[filteredData.length - 1].date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
      )}
    </div>
  );
};

export default NetWorthChart; 