'use client';

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { subDays, startOfDay, format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

const timeRanges = ['1W', '1M', '3M', '6M', 'YTD', '1Y', 'ALL'] as const;
type TimeRange = typeof timeRanges[number];

// Define props interface
interface PortfolioChartProps {
  totalValue: number; // Accept the total value from the parent
}

// Function to generate mock historical data
const generateHistoricalData = (days: number, endValue: number) => {
  const data = [];
  const endDate = startOfDay(new Date());
  let currentValue = endValue;
  
  // Simulate a general upward trend with volatility
  const trendFactor = 1 + (Math.random() * 0.05 + 0.02); // 2-7% upward trend overall
  const dailyVolatility = 0.015; // 1.5% daily volatility
  
  for (let i = 0; i < days; i++) {
    const date = subDays(endDate, i);
    data.push({ date, value: currentValue });
    
    // Adjust previous day's value based on trend and volatility
    const randomChange = (Math.random() * 2 - 1) * dailyVolatility; // Random daily move
    const trendAdjustment = (trendFactor - 1) / days; // Gradual trend effect
    currentValue = currentValue / (1 + trendAdjustment + randomChange);
    
    // Ensure value doesn't go below a certain floor (e.g., 10% of end value)
    currentValue = Math.max(endValue * 0.1, currentValue);
  }
  
  return data.reverse(); // Reverse to have dates in chronological order
};

export default function PortfolioChart({ totalValue }: PortfolioChartProps) { // Use prop
  const [activeRange, setActiveRange] = useState<TimeRange>('1Y');
  const [chartData, setChartData] = useState<ChartData<'line', number[], string>>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    let daysToShow;
    const today = new Date();
    switch (activeRange) {
      case '1W': daysToShow = 7; break;
      case '1M': daysToShow = 30; break;
      case '3M': daysToShow = 90; break;
      case '6M': daysToShow = 180; break;
      case 'YTD': 
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        daysToShow = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
        break;
      case '1Y': daysToShow = 365; break;
      case 'ALL': daysToShow = 365 * 2; break; // Simulate 2 years for ALL
      default: daysToShow = 365;
    }

    // Regenerate data based on selected timeframe and the passed totalValue
    const historicalData = generateHistoricalData(daysToShow, totalValue); // Use totalValue here

    setChartData({
      labels: historicalData.map(d => format(d.date, 'MMM dd')), // Format date labels
      datasets: [
        {
          fill: true,
          label: 'Portfolio Value',
          data: historicalData.map(d => parseFloat(d.value.toFixed(2))), // Use generated values
          borderColor: '#9DC4D4', 
          backgroundColor: 'rgba(157, 196, 212, 0.1)',
          tension: 0.2,
          pointRadius: 0, 
          borderWidth: 2,
        },
      ],
    });
  }, [activeRange, totalValue]); // Re-run effect when activeRange changes

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
          maxTicksLimit: 8, // Limit number of x-axis labels
          autoSkip: true,
        },
      },
      y: {
        position: 'right' as const,
        display: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#9CA3AF',
          callback: (value: any) => '$' + Number(value).toLocaleString(),
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            return `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-1 sm:gap-2">
        {timeRanges.map((range) => (
          <button
            key={range}
            onClick={() => setActiveRange(range)} // Add onClick handler
            className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm transition-colors ${
              activeRange === range
                ? 'bg-white text-[#1B2B4B] font-medium'
                : 'text-gray-400 hover:text-white hover:bg-[#344571]'
            }`}
          >
            {range}
          </button>
        ))}
        {/* Optional: More options button */}
        {/* <button className="text-gray-400 hover:text-white">
          <span className="material-icons">more_horiz</span>
        </button> */}
      </div>
      <div className="h-[400px]">
        {chartData.labels && chartData.labels.length > 0 ? (
          <Line options={options} data={chartData} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading chart data...
          </div>
        )}
      </div>
    </div>
  );
} 