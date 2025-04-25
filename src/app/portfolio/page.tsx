'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowUp, ArrowDown, RefreshCw, Edit2, Share2, Plus, Minus } from 'lucide-react'

// Mock data
const portfolioData = {
  totalValue: 7516.61,
  date: '4/24/2025',
  cash: 1.01,
  margin: 3681.97,
  buyingPower: 3682.98,
  startDate: 'Jul 23, 2024',
  startValue: 0.00,
  endDate: 'Apr 24, 2025',
  endValue: 7516.61,
  netCashFlow: 7592.52,
  dividendsEarned: 1.45,
  marketGain: -75.91,
  returnRate: -13.75,
  slices: 17
}

// Chart data points for the line graph
const chartData = [
  { date: 'Aug \'24', value: 2000 },
  { date: 'Sep \'24', value: 0 },
  { date: 'Oct \'24', value: 0 },
  { date: 'Nov \'24', value: 0 },
  { date: 'Dec \'24', value: 0 },
  { date: 'Jan \'25', value: 0 },
  { date: 'Feb \'25', value: 0 },
  { date: 'Mar \'25', value: 0 },
  { date: 'Apr \'25', value: 7516.61 }
]

// Portfolio allocation data for pie chart
const allocationData = [
  { color: 'bg-blue-500', percentage: 20 },
  { color: 'bg-indigo-700', percentage: 15 },
  { color: 'bg-indigo-400', percentage: 12 },
  { color: 'bg-teal-500', percentage: 10 },
  { color: 'bg-green-500', percentage: 9 },
  { color: 'bg-blue-300', percentage: 8 },
  { color: 'bg-gray-300', percentage: 26 }
]

const renderDonutChart = () => (
  <div className="relative w-64 h-64 mx-auto">
    <svg className="w-full h-full" viewBox="0 0 100 100">
      <circle className="fill-transparent stroke-gray-200" cx="50" cy="50" r="40" strokeWidth="20" />
      
      {/* We'll add a stroke-dasharray and stroke-dashoffset to create donut chart segments */}
      {allocationData.map((segment, index) => {
        const total = allocationData.reduce((sum, item) => sum + item.percentage, 0);
        const startAngle = allocationData
          .slice(0, index)
          .reduce((sum, item) => sum + item.percentage, 0) / total * 100;
        
        return (
          <circle
            key={index}
            className={`fill-transparent ${segment.color}`}
            cx="50" 
            cy="50" 
            r="40"
            strokeWidth="20"
            strokeDasharray="251.2"
            strokeDashoffset={`calc(251.2 - (251.2 * ${segment.percentage} / 100))`}
            transform={`rotate(${-90 + (startAngle * 3.6)} 50 50)`}
          />
        );
      })}
      
      {/* Center circle (empty) */}
      <circle className="fill-white dark:fill-gray-900" cx="50" cy="50" r="30" />
    </svg>
    
    {/* Portfolio value in center */}
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="text-2xl font-bold">${portfolioData.totalValue.toLocaleString()}</div>
      <div className="text-sm text-gray-500">as of {portfolioData.date}</div>
    </div>
  </div>
);

const PerformanceChart = () => {
  const maxValue = Math.max(...chartData.map(item => item.value));
  
  return (
    <div className="h-72 w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200">1D</button>
          <button className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200">1W</button>
          <button className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200">1M</button>
          <button className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200">3M</button>
          <button className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200">YTD</button>
          <button className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200">1Y</button>
          <button className="px-2 py-1 text-xs rounded bg-gray-200 font-semibold">ALL</button>
        </div>
        <button className="text-gray-500">
          {/* Three dots icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      </div>
      
      <div className="relative h-52">
        {/* Y-axis labels */}
        <div className="absolute left-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <div>${maxValue.toLocaleString()}</div>
          <div>${(maxValue * 0.75).toLocaleString()}</div>
          <div>${(maxValue * 0.5).toLocaleString()}</div>
          <div>${(maxValue * 0.25).toLocaleString()}</div>
          <div>$0</div>
        </div>
        
        {/* Chart area */}
        <div className="ml-14 h-full relative">
          {/* Horizontal grid lines */}
          <div className="absolute w-full h-px bg-gray-200 top-0"></div>
          <div className="absolute w-full h-px bg-gray-200 top-1/4"></div>
          <div className="absolute w-full h-px bg-gray-200 top-2/4"></div>
          <div className="absolute w-full h-px bg-gray-200 top-3/4"></div>
          <div className="absolute w-full h-px bg-gray-200 bottom-0"></div>
          
          {/* Line chart */}
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <polyline
              points={chartData.map((point, i) => `${(i / (chartData.length - 1)) * 100},${100 - (point.value / maxValue) * 100}`).join(' ')}
              className="stroke-blue-500 stroke-2 fill-none"
            />
          </svg>
          
          {/* X-axis labels */}
          <div className="absolute w-full bottom-0 transform translate-y-6 flex justify-between text-xs text-gray-500">
            {chartData.map((point, i) => (
              <div key={i}>{point.date}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState('portfolio');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          {['Portfolio', 'Activity', 'Holdings', 'Funding'].map((tab) => (
            <button
              key={tab}
              className={`pb-4 px-1 ${activeTab === tab.toLowerCase() 
                ? 'border-b-2 border-blue-500 font-semibold text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(tab.toLowerCase())}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* Main content */}
      <div>
        <h1 className="text-2xl font-semibold mb-4">Stocks</h1>
        
        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 border-b border-gray-200 pb-4">
          <div>
            <div className="text-sm text-gray-500 flex items-center">
              Cash
              <span className="ml-1 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div className="font-semibold text-lg">${portfolioData.cash.toFixed(2)}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 flex items-center">
              Margin
              <span className="ml-1 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div className="font-semibold text-lg text-blue-500">
              ${portfolioData.margin.toLocaleString()}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Total buying power</div>
            <div className="font-semibold text-lg">${portfolioData.buyingPower.toLocaleString()}</div>
          </div>
          
          <div className="flex items-center">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">
              Move money
            </button>
          </div>
        </div>
        
        {/* Portfolio chart and details */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
          {/* Left column with pie chart */}
          <div className="lg:col-span-2">
            {renderDonutChart()}
          </div>
          
          {/* Right column with performance chart */}
          <div className="lg:col-span-3">
            <PerformanceChart />
            
            {/* Performance summary */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div>
                <div className="text-sm text-gray-500">Starting value: {portfolioData.startDate}</div>
                <div className="font-semibold">${portfolioData.startValue.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Ending value: {portfolioData.endDate}</div>
                <div className="font-semibold">${portfolioData.endValue.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Net cash flow</div>
                <div className="font-semibold">${portfolioData.netCashFlow.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Dividends earned</div>
                <div className="font-semibold">${portfolioData.dividendsEarned.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Market gain</div>
                <div className="font-semibold text-red-500">${portfolioData.marketGain.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Money weighted rate of return</div>
                <div className="font-semibold flex items-center text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {portfolioData.returnRate.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-4 mb-8">
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <Plus className="h-6 w-6 text-gray-600" />
            </div>
            <span className="text-sm">Buy</span>
          </button>
          
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <Minus className="h-6 w-6 text-gray-600" />
            </div>
            <span className="text-sm">Sell</span>
          </button>
          
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <RefreshCw className="h-6 w-6 text-gray-600" />
            </div>
            <span className="text-sm">Rebalance</span>
          </button>
          
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <Edit2 className="h-6 w-6 text-gray-600" />
            </div>
            <span className="text-sm">Edit</span>
          </button>
          
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <Share2 className="h-6 w-6 text-gray-600" />
            </div>
            <span className="text-sm">Share</span>
          </button>
        </div>
        
        {/* Activity Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Upcoming Activity</h2>
          
          <div className="border-b border-gray-200 py-4">
            <div className="flex justify-between">
              <div>Trades</div>
              <div className="text-gray-500">None</div>
            </div>
          </div>
          
          <div className="border-b border-gray-200 py-4">
            <div className="flex justify-between">
              <div>Transfers To/From Stocks</div>
              <div className="text-gray-500">None</div>
            </div>
          </div>
        </div>
        
        {/* Slices Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Slices: {portfolioData.slices}</h2>
        </div>
        
      </div>
    </div>
  )
}
