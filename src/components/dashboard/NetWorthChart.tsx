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
}

const DEFAULT_TIMEFRAMES = [
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
  height = 300
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
    } else {
      // Find the correct timeframe object
      const timeframe = DEFAULT_TIMEFRAMES.find(tf => tf.label === selectedTimeframe);
      if (timeframe && timeframe.days !== Infinity) {
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
  
  // Prepare data for Chart.js
  const chartData = {
    labels: filteredData.map(item => formatDate(item.date)),
    datasets: [
      {
        label: title,
        data: filteredData.map(item => item.value),
        borderColor: '#4f46e5', // Indigo color
        backgroundColor: 'rgba(79, 70, 229, 0.1)', // Light indigo
        fill: true,
        tension: 0.4,
        pointRadius: filteredData.length > 30 ? 0 : 3, // Hide points if there are too many data points
        pointBackgroundColor: '#4f46e5',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#4f46e5',
        pointHoverBorderColor: '#fff',
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
        }
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
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return '$' + Number(value).toLocaleString();
          },
        },
        grid: {
          borderDash: [5, 5],
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {filteredData.length > 0 && (
            <div className="flex items-center mt-1">
              <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}${Math.abs(absoluteChange).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
              <span className={`ml-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
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
      </div>
      
      <div style={{ height: `${height}px` }}>
        {filteredData.length > 0 ? (
          <Line data={chartData} options={options} height={height} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No data available for the selected time period</p>
          </div>
        )}
      </div>
      
      {filteredData.length > 0 && (
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>
            {new Date(filteredData[0].date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <span>
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