'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowUp, ArrowDown, RefreshCw, Edit2, Share2, Plus, Minus, UploadCloud, AlertTriangle, FileText, TrendingDown, ArrowLeftRight, DollarSign, Landmark, BarChart2, Target, Bell, Calendar, CheckSquare, Flag, PlusCircle, MessageSquare, X, Send, Maximize2, Minimize2, Play, Settings, Layers, ChevronDown, BarChart, LineChart, Clock, Filter, Download } from 'lucide-react'

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
  { color: 'bg-blue-500', percentage: 20, name: 'Technology' },
  { color: 'bg-indigo-700', percentage: 15, name: 'Healthcare' },
  { color: 'bg-indigo-400', percentage: 12, name: 'Consumer Discretionary' },
  { color: 'bg-teal-500', percentage: 10, name: 'Financial Services' },
  { color: 'bg-green-500', percentage: 9, name: 'Communication' },
  { color: 'bg-blue-300', percentage: 8, name: 'Industrials' },
  { color: 'bg-gray-300', percentage: 26, name: 'Other Sectors' }
]

// Sample tax data for the Tax & Profit tab
const taxData = {
  currentYear: 2025,
  realizedGains: {
    shortTerm: -1250.35,
    longTerm: 3427.89,
    total: 2177.54
  },
  washSales: [
    { symbol: 'AAPL', amount: 320.45, date: '2025-01-15', replacement: '2025-01-28' },
    { symbol: 'MSFT', amount: 145.78, date: '2025-02-10', replacement: '2025-02-20' }
  ],
  harvestingOpportunities: [
    { symbol: 'NVDA', currentLoss: -450.25, potentialSavings: 112.56 },
    { symbol: 'AMZN', currentLoss: -280.50, potentialSavings: 70.13 }
  ],
  taxDocuments: [
    { year: 2024, type: '1099-B', status: 'Imported', date: '2025-02-15' },
    { year: 2024, type: '1099-DIV', status: 'Imported', date: '2025-02-15' },
    { year: 2023, type: '1099-B', status: 'Imported', date: '2024-02-10' },
    { year: 2023, type: '1099-DIV', status: 'Imported', date: '2024-02-10' }
  ]
}

// Transfer data for the In-Kind Transfer tab
const transferData = {
  recentTransfers: [
    { id: 'T-1234', date: '2025-03-15', type: 'Cash', amount: 5000, status: 'Completed', from: 'External Bank', to: 'Portfolio' },
    { id: 'T-1235', date: '2025-03-01', type: 'In-Kind', amount: 25, symbol: 'AAPL', status: 'Completed', from: 'External Broker', to: 'Portfolio' },
    { id: 'T-1236', date: '2025-02-15', type: 'In-Kind', amount: 10, symbol: 'MSFT', status: 'Completed', from: 'Portfolio', to: 'External Broker' },
  ],
  externalAccounts: [
    { id: 1, name: 'Chase Bank', type: 'Bank', status: 'Verified' },
    { id: 2, name: 'Fidelity', type: 'Brokerage', status: 'Verified' },
    { id: 3, name: 'Coinbase', type: 'Crypto', status: 'Pending' },
  ],
  assets: [
    { id: 1, symbol: 'AAPL', name: 'Apple Inc.', shares: 50, estimatedValue: 8750.00 },
    { id: 2, symbol: 'MSFT', name: 'Microsoft Corporation', shares: 25, estimatedValue: 9525.00 },
    { id: 3, symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 15, estimatedValue: 2103.75 },
  ]
}

// Goal tracking data
interface InvestmentGoal {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  frequency: string;
  contribution: number;
  progress: number;
}

interface Milestone {
  id: number;
  title: string;
  type: string;
  target: number;
  current: number;
  progress: number;
  isComplete: boolean;
  completedDate?: string;
}

interface PerformanceTarget {
  id: number;
  title: string;
  target: number;
  current: number;
  period: string;
  progress: number;
}

const goalData = {
  investmentGoals: [
    { 
      id: 1, 
      title: 'Retirement Fund', 
      targetAmount: 500000, 
      currentAmount: 175000, 
      deadline: '2040-01-01',
      frequency: 'Monthly',
      contribution: 1000,
      progress: 35
    },
    { 
      id: 2, 
      title: 'House Down Payment', 
      targetAmount: 100000, 
      currentAmount: 65000, 
      deadline: '2026-06-30',
      frequency: 'Monthly',
      contribution: 2500,
      progress: 65
    },
    { 
      id: 3, 
      title: 'Education Fund', 
      targetAmount: 75000, 
      currentAmount: 12000, 
      deadline: '2030-09-01',
      frequency: 'Monthly',
      contribution: 500,
      progress: 16
    }
  ] as InvestmentGoal[],
  milestones: [
    {
      id: 1,
      title: '$200,000 Portfolio Value',
      type: 'Portfolio',
      target: 200000,
      current: 175000,
      progress: 87.5,
      isComplete: false
    },
    {
      id: 2,
      title: 'First Dividend Income',
      type: 'Income',
      target: 100,
      current: 100,
      progress: 100,
      isComplete: true,
      completedDate: '2025-02-15'
    },
    {
      id: 3,
      title: 'Technology Sector Allocation',
      type: 'Allocation',
      target: 20,
      current: 15,
      progress: 75,
      isComplete: false
    }
  ] as Milestone[],
  performanceTargets: [
    {
      id: 1,
      title: 'Annual Return',
      target: 10,
      current: 7.5,
      period: 'Year to date',
      progress: 75
    },
    {
      id: 2,
      title: 'Monthly Contribution',
      target: 2000,
      current: 2000,
      period: 'Current month',
      progress: 100
    },
    {
      id: 3,
      title: 'Dividend Yield',
      target: 3,
      current: 2.1,
      period: 'Trailing 12 months',
      progress: 70
    }
  ] as PerformanceTarget[]
};

const DonutChart = () => {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  
  // Calculate the total value
  const totalPercentage = allocationData.reduce((sum, item) => sum + item.percentage, 0);
  
  return (
    <div className="relative w-64 h-64 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle className="fill-transparent stroke-gray-200" cx="50" cy="50" r="40" strokeWidth="20" />
        
        {/* Donut chart segments */}
        {allocationData.map((segment, index) => {
          const startAngle = allocationData
            .slice(0, index)
            .reduce((sum, item) => sum + item.percentage, 0) / totalPercentage * 100;
          
          return (
            <circle
              key={index}
              className={`fill-transparent ${segment.color} cursor-pointer transition-all duration-200`}
              cx="50" 
              cy="50" 
              r="40"
              strokeWidth={hoveredSegment === index ? "22" : "20"}
              strokeDasharray="251.2"
              strokeDashoffset={`calc(251.2 - (251.2 * ${segment.percentage} / 100))`}
              transform={`rotate(${-90 + (startAngle * 3.6)} 50 50)`}
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
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
      
      {/* Tooltip for hovered segment */}
      {hoveredSegment !== null && (
        <div className="absolute z-10 bg-gray-800 text-white px-3 py-2 rounded shadow-lg text-sm"
             style={{
               left: '50%',
               top: '-40px',
               transform: 'translateX(-50%)'
             }}>
          <div className="font-bold">{allocationData[hoveredSegment].name}</div>
          <div className="flex justify-between gap-3">
            <span>${(portfolioData.totalValue * allocationData[hoveredSegment].percentage / 100).toFixed(2)}</span>
            <span>{allocationData[hoveredSegment].percentage}%</span>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="mt-8 grid grid-cols-2 gap-2 text-xs">
        {allocationData.map((segment, index) => (
          <div key={index} className="flex items-center" 
               onMouseEnter={() => setHoveredSegment(index)}
               onMouseLeave={() => setHoveredSegment(null)}>
            <div className={`w-3 h-3 rounded-full mr-2 ${segment.color}`}></div>
            <div className={`${hoveredSegment === index ? 'font-bold' : ''}`}>
              {segment.name} ({segment.percentage}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PerformanceChart = () => {
  const maxValue = Math.max(...chartData.map(item => item.value));
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  
  return (
    <div className="h-72 w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          {[
            { id: '1d', label: '1D' },
            { id: '1w', label: '1W' },
            { id: '1m', label: '1M' },
            { id: '3m', label: '3M' },
            { id: 'ytd', label: 'YTD' },
            { id: '1y', label: '1Y' },
            { id: 'all', label: 'ALL' }
          ].map(period => (
            <button 
              key={period.id}
              className={`px-2 py-1 text-xs rounded ${
                selectedTimeframe === period.id 
                  ? 'bg-gray-200 font-semibold' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedTimeframe(period.id)}
            >
              {period.label}
            </button>
          ))}
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
          
          {/* Interactive chart area */}
          <div className="absolute inset-0">
            {/* Invisible hit areas for interaction */}
            <div className="relative w-full h-full">
              {chartData.map((point, i) => (
                <div 
                  key={i}
                  className="absolute top-0 h-full cursor-pointer"
                  style={{ 
                    left: `${(i / (chartData.length - 1)) * 100}%`, 
                    width: `${100 / chartData.length}%` 
                  }}
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </div>
          </div>
          
          {/* Line chart */}
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <polyline
              points={chartData.map((point, i) => `${(i / (chartData.length - 1)) * 100},${100 - (point.value / maxValue) * 100}`).join(' ')}
              className="stroke-blue-500 stroke-2 fill-none"
            />
            
            {/* Data points */}
            {chartData.map((point, i) => (
              <circle
                key={i}
                cx={`${(i / (chartData.length - 1)) * 100}%`}
                cy={`${100 - (point.value / maxValue) * 100}%`}
                r={hoveredPoint === i ? "4" : "0"}
                className="fill-blue-600"
              />
            ))}
            
            {/* Vertical line at hovered point */}
            {hoveredPoint !== null && (
              <line
                x1={`${(hoveredPoint / (chartData.length - 1)) * 100}%`}
                y1="0%"
                x2={`${(hoveredPoint / (chartData.length - 1)) * 100}%`}
                y2="100%"
                className="stroke-gray-400 stroke-dashed"
                strokeWidth="1"
                strokeDasharray="4"
              />
            )}
          </svg>
          
          {/* Value tooltip */}
          {hoveredPoint !== null && (
            <div 
              className="absolute bg-gray-800 text-white px-3 py-2 rounded shadow-lg text-sm z-10"
              style={{
                left: `${(hoveredPoint / (chartData.length - 1)) * 100}%`,
                top: `${100 - (chartData[hoveredPoint].value / maxValue) * 100}%`,
                transform: 'translate(-50%, -120%)'
              }}
            >
              <div className="font-bold">${chartData[hoveredPoint].value.toLocaleString()}</div>
              <div className="text-xs text-gray-300">{chartData[hoveredPoint].date}</div>
            </div>
          )}
          
          {/* X-axis labels */}
          <div className="absolute w-full bottom-0 transform translate-y-6 flex justify-between text-xs text-gray-500">
            {chartData.map((point, i) => (
              <div key={i} className={hoveredPoint === i ? "font-semibold text-blue-600" : ""}>{point.date}</div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Current value display */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-500">
          {hoveredPoint !== null ? (
            <span>Value on {chartData[hoveredPoint].date}</span>
          ) : (
            <span>Current value</span>
          )}
        </div>
        <div className="text-xl font-bold">
          ${hoveredPoint !== null ? chartData[hoveredPoint].value.toLocaleString() : chartData[chartData.length-1].value.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

const TaxAndProfitContent = () => {
  return (
    <div className="space-y-8">
      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Year-to-Date Tax Summary ({taxData.currentYear})</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Short-Term Gains/Losses</div>
            <div className={`text-xl font-bold ${taxData.realizedGains.shortTerm >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {taxData.realizedGains.shortTerm >= 0 ? '+' : ''}
              ${taxData.realizedGains.shortTerm.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Taxed as ordinary income</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Long-Term Gains/Losses</div>
            <div className={`text-xl font-bold ${taxData.realizedGains.longTerm >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {taxData.realizedGains.longTerm >= 0 ? '+' : ''}
              ${taxData.realizedGains.longTerm.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Preferential tax rates</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Total Realized Gain/Loss</div>
            <div className={`text-xl font-bold ${taxData.realizedGains.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {taxData.realizedGains.total >= 0 ? '+' : ''}
              ${taxData.realizedGains.total.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Net impact on taxes</div>
          </div>
        </div>
      </div>
      
      {/* Tax-Loss Harvesting Opportunities */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tax-Loss Harvesting Opportunities</h2>
          <button className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
            Analyze Portfolio
          </button>
        </div>
        
        {taxData.harvestingOpportunities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Loss</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Potential Tax Savings</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taxData.harvestingOpportunities.map((opportunity, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{opportunity.symbol}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600">${opportunity.currentLoss.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">~${opportunity.potentialSavings.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      <button className="text-blue-600 hover:text-blue-800">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <TrendingDown className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p>No harvesting opportunities currently available.</p>
          </div>
        )}
      </div>
      
      {/* Wash Sale Detection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Wash Sale Detection</h2>
        
        {taxData.washSales.length > 0 ? (
          <div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
                <p className="text-sm text-yellow-700">
                  {taxData.washSales.length} wash sale{taxData.washSales.length > 1 ? 's' : ''} detected. These transactions affect your tax basis.
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Disallowed Loss</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Replacement Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {taxData.washSales.map((sale, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{sale.symbol}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">${sale.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{sale.date}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{sale.replacement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <p className="text-sm text-green-700">
                No wash sales detected. Your tax losses should be fully deductible.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Gain/Loss Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Realized Gain/Loss Breakdown</h2>
          <div className="flex space-x-2">
            <select className="text-sm border border-gray-300 rounded px-2 py-1 bg-white">
              <option>All Time</option>
              <option>2025</option>
              <option>2024</option>
              <option>2023</option>
            </select>
            <button className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">
              Export
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Acquired</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Sold</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Basis</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Proceeds</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Term</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">AAPL</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2023-05-10</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2025-02-15</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">$1,250.00</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">$1,875.25</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">+$625.25</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Long</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">MSFT</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2025-01-10</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2025-02-20</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">$2,100.00</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">$1,850.50</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600">-$249.50</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Short</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">AMZN</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2023-08-15</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2025-03-10</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">$3,450.75</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">$4,250.30</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">+$799.55</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Long</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Tax Documents */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Tax Documents</h2>
        
        <div className="mb-4">
          <button className="flex items-center text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            <UploadCloud className="h-4 w-4 mr-2" />
            Import 1099 Forms
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Year</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Imported</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {taxData.taxDocuments.map((doc, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{doc.type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{doc.year}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{doc.date}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{doc.status}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    <button className="text-blue-600 hover:text-blue-800 mr-2">
                      <FileText className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const InKindTransferContent = () => {
  const [transferType, setTransferType] = useState('cash'); // 'cash' or 'asset'
  const [direction, setDirection] = useState('inbound'); // 'inbound' or 'outbound'
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [amount, setAmount] = useState('');
  const [shares, setShares] = useState('');
  const [step, setStep] = useState(1);

  const handleTransferSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, this would process the transfer
    alert('Transfer initiated successfully. A confirmation will be sent to your email.');
    // Reset form and return to step 1
    setSelectedAccount('');
    setSelectedAsset('');
    setAmount('');
    setShares('');
    setStep(1);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Transfer Assets & Cash</h2>
        
        {/* Transfer Type Selector */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-2">
            <button 
              className={`px-4 py-2 rounded-md ${transferType === 'cash' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              onClick={() => setTransferType('cash')}
            >
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                <span>Cash</span>
              </div>
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${transferType === 'asset' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              onClick={() => setTransferType('asset')}
            >
              <div className="flex items-center">
                <BarChart2 className="h-4 w-4 mr-2" />
                <span>Securities</span>
              </div>
            </button>
          </div>
          
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button 
              className={`px-4 py-2 rounded-md ${direction === 'inbound' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              onClick={() => setDirection('inbound')}
            >
              <div className="flex items-center">
                <ArrowDown className="h-4 w-4 mr-2" />
                <span>Transfer In</span>
              </div>
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${direction === 'outbound' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              onClick={() => setDirection('outbound')}
            >
              <div className="flex items-center">
                <ArrowUp className="h-4 w-4 mr-2" />
                <span>Transfer Out</span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Multi-step Transfer Form */}
        <div className="bg-gray-50 p-6 rounded-lg">
          {/* Step Indicator */}
          <div className="flex items-center mb-6">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>3</div>
          </div>
          
          <form onSubmit={handleTransferSubmit}>
            {/* Step 1: Select Account */}
            {step === 1 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Select {direction === 'inbound' ? 'Source' : 'Destination'} Account</h3>
                <div className="space-y-3 mb-6">
                  {transferData.externalAccounts.map(account => (
                    <div 
                      key={account.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAccount === account.id.toString() 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                      onClick={() => setSelectedAccount(account.id.toString())}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          {account.type === 'Bank' ? (
                            <Landmark className="h-5 w-5 mr-3 text-gray-600" />
                          ) : (
                            <BarChart2 className="h-5 w-5 mr-3 text-gray-600" />
                          )}
                          <div>
                            <div className="font-medium">{account.name}</div>
                            <div className="text-sm text-gray-500">{account.type}</div>
                          </div>
                        </div>
                        {account.status === 'Verified' ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Verified</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-blue-600 mb-4">+ Link a new external account</div>
                <div className="flex justify-end">
                  <button 
                    type="button"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedAccount}
                    onClick={() => setStep(2)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 2: Enter Transfer Details */}
            {step === 2 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Transfer Details</h3>
                
                {transferType === 'cash' ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="text"
                        className="w-full pl-7 pr-12 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Transfers usually take 1-3 business days to complete.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Asset
                      </label>
                      <select
                        className="w-full py-2 px-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={selectedAsset}
                        onChange={(e) => setSelectedAsset(e.target.value)}
                      >
                        <option value="">Select a security</option>
                        {transferData.assets.map(asset => (
                          <option key={asset.id} value={asset.id}>
                            {asset.symbol} - {asset.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {selectedAsset && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Shares
                        </label>
                        <input
                          type="text"
                          className="w-full py-2 px-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                          value={shares}
                          onChange={(e) => setShares(e.target.value)}
                        />
                        {direction === 'outbound' && (
                          <p className="text-xs text-gray-500 mt-1">
                            Available: {transferData.assets.find(a => a.id.toString() === selectedAsset)?.shares} shares
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Note:</span> In-kind transfers preserve your cost basis and avoid taxable events.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={(transferType === 'cash' && !amount) || (transferType === 'asset' && (!selectedAsset || !shares))}
                    onClick={() => setStep(3)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 3: Review & Confirm */}
            {step === 3 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Review & Confirm</h3>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Transfer Type:</span>
                    <span className="font-medium">{transferType === 'cash' ? 'Cash' : 'In-Kind Securities'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Direction:</span>
                    <span className="font-medium">{direction === 'inbound' ? 'Transfer In' : 'Transfer Out'}</span>
                  </div>
                  {transferType === 'cash' ? (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">${amount}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Asset:</span>
                        <span className="font-medium">
                          {transferData.assets.find(a => a.id.toString() === selectedAsset)?.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Shares:</span>
                        <span className="font-medium">{shares}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">{direction === 'inbound' ? 'From:' : 'To:'}</span>
                    <span className="font-medium">
                      {transferData.externalAccounts.find(a => a.id.toString() === selectedAccount)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">{direction === 'inbound' ? 'To:' : 'From:'}</span>
                    <span className="font-medium">S&P Wealth Portfolio</span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 mb-6">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                      By proceeding, you authorize this transfer. This action cannot be undone once initiated.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    Confirm Transfer
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
      
      {/* Recent Transfers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Transfers</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transferData.recentTransfers.map((transfer, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">{transfer.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{transfer.date}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {transfer.type === 'Cash' ? 'Cash' : `${transfer.symbol} (${transfer.amount} shares)`}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                    {transfer.type === 'Cash' ? `$${transfer.amount.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{transfer.from}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{transfer.to}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      transfer.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transfer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MilestonesSection = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Milestones</h2>
      <button className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded">
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Milestone
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {goalData.milestones.map((milestone) => (
        <div 
          key={milestone.id}
          className={`border rounded-lg p-4 ${
            milestone.isComplete ? 'bg-green-50 border-green-200' : 'bg-white'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-medium">{milestone.title}</h3>
              <div className="text-xs text-gray-500">{milestone.type}</div>
            </div>
            {milestone.isComplete ? (
              <span className="flex items-center text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                <CheckSquare className="h-3 w-3 mr-1" />
                Complete
              </span>
            ) : (
              <span className="flex items-center text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                <Flag className="h-3 w-3 mr-1" />
                In Progress
              </span>
            )}
          </div>
          
          {!milestone.isComplete && (
            <>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-500">
                  {milestone.type === 'Portfolio' ? '$' : ''}{milestone.current.toLocaleString()}
                  {milestone.type === 'Allocation' ? '%' : ''} of {milestone.type === 'Portfolio' ? '$' : ''}
                  {milestone.target.toLocaleString()}{milestone.type === 'Allocation' ? '%' : ''}
                </span>
                <span className="text-xs font-medium">{milestone.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${milestone.progress}%` }}
                ></div>
              </div>
            </>
          )}
          
          {milestone.isComplete && (
            <div className="text-sm text-green-700 mt-2">
              Completed on {milestone.completedDate}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

const GoalSystemContent = () => {
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  
  // Render the goals
  return (
    <div className="space-y-8">
      {/* Investment Goals */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Investment Goals</h2>
          <button 
            className="flex items-center text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
            onClick={() => setShowAddGoalForm(!showAddGoalForm)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Goal
          </button>
        </div>
        
        {/* Add Goal Form */}
        {showAddGoalForm && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
            <h3 className="text-lg font-medium mb-3">New Investment Goal</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="e.g., Retirement Fund"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-7 p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Contribution</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-7 p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                <input 
                  type="date" 
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2 flex justify-end space-x-3">
                <button 
                  type="button" 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                  onClick={() => setShowAddGoalForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="space-y-6">
          {goalData.investmentGoals.map((goal) => (
            <div key={goal.id} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                <div className="font-medium">{goal.title}</div>
                <div className="flex space-x-2">
                  <span className="text-sm text-gray-500">Target: ${goal.targetAmount.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">|</span>
                  <span className="text-sm text-gray-500">By {goal.deadline}</span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Current: ${goal.currentAmount.toLocaleString()}</span>
                  <span className="text-sm font-medium">{goal.progress}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Contribution</div>
                    <div className="font-medium">${goal.contribution}/mo</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Remaining</div>
                    <div className="font-medium">${(goal.targetAmount - goal.currentAmount).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Time Left</div>
                    <div className="font-medium">
                      {/* Hardcoded for now due to TypeScript date calculation errors */}
                      {goal.id === 1 ? '180' : goal.id === 2 ? '14' : '64'} months
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 border-t flex justify-end space-x-2">
                <button className="text-sm text-blue-600 px-3 py-1 rounded hover:bg-blue-50">Adjust</button>
                <button className="text-sm text-blue-600 px-3 py-1 rounded hover:bg-blue-50">Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Milestones */}
      <MilestonesSection />
      
      {/* Performance Targets */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Performance Targets</h2>
          <div className="flex space-x-2">
            <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>Daily</option>
              <option>Weekly</option>
              <option selected>Monthly</option>
              <option>Yearly</option>
            </select>
            <button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded">
              Add Target
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          {goalData.performanceTargets.map((target) => (
            <div key={target.id} className="border rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="font-medium">{target.title}</h3>
                  <div className="text-xs text-gray-500">{target.period}</div>
                </div>
                <div className="text-lg font-semibold">
                  {target.current}{target.title === 'Annual Return' || target.title === 'Dividend Yield' ? '%' : ''} 
                  <span className="text-gray-400 text-base"> / {target.target}{target.title === 'Annual Return' || target.title === 'Dividend Yield' ? '%' : ''}</span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    target.progress >= 100 ? 'bg-green-500' : 
                    target.progress >= 75 ? 'bg-blue-500' : 
                    target.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(target.progress, 100)}%` }}
                ></div>
              </div>
              
              <div className="mt-3 text-sm">
                {target.progress >= 100 ? (
                  <div className="text-green-600">Target achieved! 🎉</div>
                ) : target.progress >= 75 ? (
                  <div className="text-blue-600">On track to meet target</div>
                ) : target.progress >= 50 ? (
                  <div className="text-yellow-600">Progress needed to meet target</div>
                ) : (
                  <div className="text-red-600">Significantly below target</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AiAssistantPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([
    { role: 'assistant', content: 'Hello! I\'m your AI financial assistant. How can I help you with your portfolio today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (isMinimized) setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    setMessages([...messages, { role: 'user', content: inputValue }]);
    
    // Simulate AI response based on different questions
    setTimeout(() => {
      let response = '';
      const userQuestion = inputValue.toLowerCase();
      
      if (userQuestion.includes('portfolio performance') || userQuestion.includes('how is my portfolio')) {
        response = 'Your portfolio is up 7.2% year-to-date, outperforming the S&P 500 by 1.3%. Your technology sector allocation has been your strongest performer.';
      } else if (userQuestion.includes('tax') || userQuestion.includes('taxes')) {
        response = 'Based on your current realized gains of $2,177.54, you might face approximately $500-700 in additional tax liability. Would you like me to suggest some tax-loss harvesting opportunities?';
      } else if (userQuestion.includes('dividend') || userQuestion.includes('income')) {
        response = 'Your portfolio is generating approximately $1,250 in annual dividend income, with a current yield of 2.3%. The highest dividend yield in your portfolio is coming from your VYM holding at 3.1%.';
      } else if (userQuestion.includes('rebalance') || userQuestion.includes('allocation')) {
        response = 'Your portfolio is currently overweight in Technology (25% vs 20% target) and underweight in Healthcare (10% vs 15% target). Would you like me to suggest specific trades to rebalance?';
      } else if (userQuestion.includes('goal') || userQuestion.includes('target')) {
        response = 'You\'re currently on track to meet your Retirement Fund goal by 2040. Your House Down Payment goal needs attention as you\'re 5% behind the required saving rate.';
      } else {
        response = 'I\'d be happy to help with that! Could you provide more details about what you\'re looking for regarding your investments?';
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setInputValue('');
      
      // Scroll to bottom of messages
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1000);
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <>
      {/* Assistant Button */}
      <button
        onClick={toggleOpen}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center p-3 rounded-full shadow-lg transition-colors ${
          isOpen ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {/* Assistant Panel */}
      {isOpen && (
        <div
          className={`fixed z-40 transition-all duration-300 bg-white shadow-xl rounded-lg overflow-hidden ${
            isMinimized
              ? 'bottom-20 right-6 w-72 h-14'
              : 'bottom-20 right-6 w-96 h-[500px] max-h-[80vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-medium flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              AI Financial Assistant
            </h3>
            <div className="flex space-x-2">
              <button onClick={toggleMinimize} className="text-white hover:text-blue-100">
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Chat Messages */}
              <div className="p-4 overflow-y-auto h-[calc(100%-120px)] bg-gray-50">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      message.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Field */}
              <div className="p-3 border-t">
                <form onSubmit={handleSubmit} className="flex items-center">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Ask about your portfolio..."
                    className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-3 py-2 rounded-r-lg hover:bg-blue-700"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-blue-600 font-medium">Pro Tip:</span> Ask about portfolio performance, tax implications, or investment advice
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

// Error boundary component to catch rendering errors
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Caught runtime error:', error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h2>
        <p className="text-red-600 mb-4">We encountered an error while rendering this section.</p>
        <button 
          onClick={() => setHasError(false)} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return <>{children}</>;
};

// Sample data for backtesting
const backtestData = {
  strategies: [
    { id: 1, name: 'Buy and Hold', description: 'Simple buy and hold strategy' },
    { id: 2, name: 'Dollar Cost Averaging', description: 'Invest a fixed amount at regular intervals' },
    { id: 3, name: 'Value Investing', description: 'Focus on undervalued stocks with strong fundamentals' },
    { id: 4, name: 'Momentum Trading', description: 'Buy stocks showing upward trends' },
    { id: 5, name: 'Dividend Growth', description: 'Focus on stocks with growing dividend yields' },
  ],
  timeframes: [
    { id: 1, name: '1 Year', value: '1y' },
    { id: 2, name: '3 Years', value: '3y' },
    { id: 3, name: '5 Years', value: '5y' },
    { id: 4, name: '10 Years', value: '10y' },
    { id: 5, name: 'Custom', value: 'custom' },
  ],
  indices: [
    { id: 1, name: 'S&P 500', symbol: 'SPY' },
    { id: 2, name: 'Nasdaq', symbol: 'QQQ' },
    { id: 3, name: 'Dow Jones', symbol: 'DIA' },
    { id: 4, name: 'Russell 2000', symbol: 'IWM' },
  ],
  sampleResults: {
    initialInvestment: 10000,
    endValue: 15750,
    returnPercentage: 57.5,
    annualizedReturn: 12.6,
    maxDrawdown: 18.3,
    sharpeRatio: 1.32,
    volatility: 14.7,
    winRate: 62,
    monthlyPerformance: [
      { month: 'Jan', value: 2.4 },
      { month: 'Feb', value: -1.5 },
      { month: 'Mar', value: 3.2 },
      { month: 'Apr', value: 1.8 },
      { month: 'May', value: -0.5 },
      { month: 'Jun', value: 2.1 },
      { month: 'Jul', value: 3.5 },
      { month: 'Aug', value: -2.1 },
      { month: 'Sep', value: -4.2 },
      { month: 'Oct', value: 2.7 },
      { month: 'Nov', value: 4.8 },
      { month: 'Dec', value: 1.9 },
    ],
    comparisonPerformance: [
      { year: 2020, strategy: 8.4, spy: 16.3 },
      { year: 2021, strategy: 21.7, spy: 26.9 },
      { year: 2022, strategy: -12.3, spy: -19.4 },
      { year: 2023, strategy: 18.9, spy: 24.2 },
      { year: 2024, strategy: 6.4, spy: 5.5 },
    ]
  }
};

interface SimulationParameters {
  strategyId: number;
  timeframeId: number;
  initialAmount: number;
  monthlyContribution: number;
  rebalanceFrequency: string;
  benchmark: string;
  includeInflation: boolean;
  includeFees: boolean;
  feePercentage: number;
  taxRate: number;
}

// Portfolio Simulation/Backtesting Component
const PortfolioSimulationContent = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showParameters, setShowParameters] = useState(true);
  const [parameters, setParameters] = useState<SimulationParameters>({
    strategyId: 1,
    timeframeId: 2,
    initialAmount: 10000,
    monthlyContribution: 500,
    rebalanceFrequency: 'quarterly',
    benchmark: 'SPY',
    includeInflation: true,
    includeFees: true,
    feePercentage: 0.25,
    taxRate: 25
  });
  // Track allocation percentages separately
  const [allocation, setAllocation] = useState({
    usStocks: 60,
    intlStocks: 20,
    bonds: 15,
    cash: 5
  });

  const handleParameterChange = (name: keyof SimulationParameters, value: any) => {
    setParameters({
      ...parameters,
      [name]: value
    });
  };

  const handleAllocationChange = (name: keyof typeof allocation, value: number) => {
    setAllocation({
      ...allocation,
      [name]: value
    });
  };

  const runSimulation = () => {
    setIsRunning(true);
    // Simulate API call delay
    setTimeout(() => {
      setIsRunning(false);
      setShowResults(true);
      setShowParameters(false);
    }, 2000);
  };

  const reset = () => {
    setShowResults(false);
    setShowParameters(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Portfolio Simulation & Backtesting</h2>
        <p className="text-gray-600 mb-6">
          Test investment strategies against historical market data to evaluate performance and make informed decisions.
        </p>
        
        {/* Simulation Parameters */}
        {showParameters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Strategy & Timeframe</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Investment Strategy</label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded text-gray-900 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={parameters.strategyId}
                      onChange={(e) => handleParameterChange('strategyId', parseInt(e.target.value))}
                    >
                      {backtestData.strategies.map(strategy => (
                        <option key={strategy.id} value={strategy.id}>{strategy.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {backtestData.strategies.find(s => s.id === parameters.strategyId)?.description}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded text-gray-900 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={parameters.timeframeId}
                      onChange={(e) => handleParameterChange('timeframeId', parseInt(e.target.value))}
                    >
                      {backtestData.timeframes.map(timeframe => (
                        <option key={timeframe.id} value={timeframe.id}>{timeframe.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {parameters.timeframeId === 5 && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input 
                          type="date" 
                          className="w-full p-2 border border-gray-300 rounded text-gray-900 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input 
                          type="date" 
                          className="w-full p-2 border border-gray-300 rounded text-gray-900 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Benchmark</label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded text-gray-900 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={parameters.benchmark}
                      onChange={(e) => handleParameterChange('benchmark', e.target.value)}
                    >
                      {backtestData.indices.map(index => (
                        <option key={index.id} value={index.symbol}>{index.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Investment Parameters</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Investment</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input 
                        type="number" 
                        className="w-full pl-7 p-2 border border-gray-300 rounded text-gray-900 focus:ring-blue-500 focus:border-blue-500" 
                        value={parameters.initialAmount}
                        onChange={(e) => handleParameterChange('initialAmount', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Contribution</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input 
                        type="number" 
                        className="w-full pl-7 p-2 border border-gray-300 rounded text-gray-900 focus:ring-blue-500 focus:border-blue-500" 
                        value={parameters.monthlyContribution}
                        onChange={(e) => handleParameterChange('monthlyContribution', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rebalance Frequency</label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded text-gray-900 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={parameters.rebalanceFrequency}
                      onChange={(e) => handleParameterChange('rebalanceFrequency', e.target.value)}
                    >
                      <option value="never">Never</option>
                      <option value="annually">Annually</option>
                      <option value="semiannually">Semi-Annually</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Advanced Options</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="includeInflation" 
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={parameters.includeInflation}
                      onChange={(e) => handleParameterChange('includeInflation', e.target.checked)}
                    />
                    <label htmlFor="includeInflation" className="ml-2 block text-sm text-gray-700">Include Inflation Adjustment</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="includeFees" 
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={parameters.includeFees}
                      onChange={(e) => handleParameterChange('includeFees', e.target.checked)}
                    />
                    <label htmlFor="includeFees" className="ml-2 block text-sm text-gray-700">Include Investment Fees</label>
                  </div>
                  
                  {parameters.includeFees && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Annual Fee (%)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="w-32 p-2 border border-gray-300 rounded text-gray-900 focus:ring-blue-500 focus:border-blue-500" 
                        value={parameters.feePercentage}
                        onChange={(e) => handleParameterChange('feePercentage', parseFloat(e.target.value))}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                    <input 
                      type="number" 
                      className="w-32 p-2 border border-gray-300 rounded text-gray-900 focus:ring-blue-500 focus:border-blue-500" 
                      value={parameters.taxRate}
                      onChange={(e) => handleParameterChange('taxRate', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-md font-medium text-blue-800 mb-2">Asset Allocation</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm">US Stocks</span>
                    </div>
                    <div className="relative w-32">
                      <input 
                        type="number" 
                        className="w-full p-1 text-sm text-gray-900 text-right border border-gray-300 rounded" 
                        value={allocation.usStocks}
                        onChange={(e) => handleAllocationChange('usStocks', parseInt(e.target.value))}
                      />
                      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">Intl Stocks</span>
                    </div>
                    <div className="relative w-32">
                      <input 
                        type="number" 
                        className="w-full p-1 text-sm text-gray-900 text-right border border-gray-300 rounded" 
                        value={allocation.intlStocks}
                        onChange={(e) => handleAllocationChange('intlStocks', parseInt(e.target.value))}
                      />
                      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                      <span className="text-sm">Bonds</span>
                    </div>
                    <div className="relative w-32">
                      <input 
                        type="number" 
                        className="w-full p-1 text-sm text-gray-900 text-right border border-gray-300 rounded" 
                        value={allocation.bonds}
                        onChange={(e) => handleAllocationChange('bonds', parseInt(e.target.value))}
                      />
                      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span className="text-sm">Cash</span>
                    </div>
                    <div className="relative w-32">
                      <input 
                        type="number" 
                        className="w-full p-1 text-sm text-gray-900 text-right border border-gray-300 rounded" 
                        value={allocation.cash}
                        onChange={(e) => handleAllocationChange('cash', parseInt(e.target.value))}
                      />
                      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  onClick={runSimulation}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                      Running Simulation...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Simulation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Simulation Results */}
        {showResults && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Simulation Results</h3>
              <div className="flex space-x-3">
                <button 
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center"
                  onClick={reset}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Edit Parameters
                </button>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </button>
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Final Value</div>
                <div className="text-xl font-bold">${backtestData.sampleResults.endValue.toLocaleString()}</div>
                <div className="text-green-600 text-sm flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {backtestData.sampleResults.returnPercentage}%
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Annualized Return</div>
                <div className="text-xl font-bold">{backtestData.sampleResults.annualizedReturn}%</div>
                <div className="text-sm text-gray-500">vs. {backtestData.sampleResults.comparisonPerformance[4].spy}% Benchmark</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Max Drawdown</div>
                <div className="text-xl font-bold">{backtestData.sampleResults.maxDrawdown}%</div>
                <div className="text-sm text-gray-500">Worst peak-to-trough</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Sharpe Ratio</div>
                <div className="text-xl font-bold">{backtestData.sampleResults.sharpeRatio}</div>
                <div className="text-sm text-gray-500">Risk-adjusted return</div>
              </div>
            </div>
            
            {/* Performance Chart */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Portfolio Growth</h4>
                <div className="flex space-x-2">
                  <select className="text-sm border border-gray-300 rounded px-2 py-1">
                    <option>Linear</option>
                    <option>Logarithmic</option>
                  </select>
                  <select className="text-sm border border-gray-300 rounded px-2 py-1">
                    <option>All Data</option>
                    <option>YTD</option>
                    <option>1 Year</option>
                    <option>3 Years</option>
                  </select>
                </div>
              </div>
              
              <div className="aspect-[16/9] bg-gray-50 w-full rounded-lg p-4 flex items-center justify-center">
                <div className="text-gray-500 text-sm flex flex-col items-center">
                  <LineChart className="h-10 w-10 mb-2 text-gray-400" />
                  Growth chart would be rendered here
                </div>
              </div>
            </div>
            
            {/* Monthly Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="col-span-2">
                <h4 className="font-medium mb-3">Annual Performance</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Strategy</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Benchmark</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Difference</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {backtestData.sampleResults.comparisonPerformance.map((year, i) => {
                        const difference = year.strategy - year.spy;
                        return (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{year.year}</td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${year.strategy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {year.strategy >= 0 ? '+' : ''}{year.strategy}%
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${year.spy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {year.spy >= 0 ? '+' : ''}{year.spy}%
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {difference >= 0 ? '+' : ''}{difference.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Monthly Performance</h4>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-3 gap-2">
                    {backtestData.sampleResults.monthlyPerformance.map((month, i) => (
                      <div key={i} className="text-center">
                        <div className="text-xs text-gray-500">{month.month}</div>
                        <div className={`text-sm font-medium ${month.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {month.value >= 0 ? '+' : ''}{month.value}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Win Rate:</span>
                      <span className="text-sm font-medium">{backtestData.sampleResults.winRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Volatility:</span>
                      <span className="text-sm font-medium">{backtestData.sampleResults.volatility}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Best Month:</span>
                      <span className="text-sm font-medium text-green-600">+4.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Worst Month:</span>
                      <span className="text-sm font-medium text-red-600">-4.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Strategy Analysis */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Strategy Analysis</h4>
              <p className="text-sm text-blue-800 mb-3">
                This strategy outperformed the benchmark by <span className="font-semibold">0.9%</span> annually while providing a better risk-adjusted return. 
                Key strengths include lower drawdowns and consistent performance during market downturns.
              </p>
              <h5 className="font-medium text-blue-800 mb-1">Recommendations:</h5>
              <ul className="text-sm text-blue-800 list-disc list-inside">
                <li>Consider increasing allocation to value stocks for more stability</li>
                <li>Rebalance more frequently during volatile periods</li>
                <li>Additional diversification could further reduce drawdowns</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrap each section with ErrorBoundary
export default function Portfolio() {
  const [activeTab, setActiveTab] = useState('portfolio');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8 overflow-x-auto pb-1">
          {['Portfolio', 'Activity', 'Holdings', 'Funding', 'Tax & Profit', 'Transfers', 'Goals', 'Simulation'].map((tab) => (
            <button
              key={tab}
              className={`pb-4 px-1 whitespace-nowrap ${activeTab === tab.toLowerCase().replace(/[^a-z0-9]/g, '') 
                ? 'border-b-2 border-blue-500 font-semibold text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(tab.toLowerCase().replace(/[^a-z0-9]/g, ''))}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* Main content */}
      {activeTab === 'portfolio' && (
        <ErrorBoundary>
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
                <DonutChart />
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
        </ErrorBoundary>
      )}
      
      {/* Tax & Profit Content */}
      {activeTab === 'taxprofit' && (
        <ErrorBoundary>
          <TaxAndProfitContent />
        </ErrorBoundary>
      )}
      
      {/* Transfers Content */}
      {activeTab === 'transfers' && (
        <ErrorBoundary>
          <InKindTransferContent />
        </ErrorBoundary>
      )}
      
      {/* Goals Content */}
      {activeTab === 'goals' && (
        <ErrorBoundary>
          <GoalSystemContent />
        </ErrorBoundary>
      )}
      
      {/* Simulation Content */}
      {activeTab === 'simulation' && (
        <ErrorBoundary>
          <PortfolioSimulationContent />
        </ErrorBoundary>
      )}
      
      {/* Other tabs will be implemented later */}
      {activeTab !== 'portfolio' && activeTab !== 'taxprofit' && activeTab !== 'transfers' && activeTab !== 'goals' && activeTab !== 'simulation' && (
        <div className="py-8 text-center text-gray-500">
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p>The {activeTab} tab is under development.</p>
        </div>
      )}
      
      {/* AI Assistant Panel */}
      <ErrorBoundary>
        <AiAssistantPanel />
      </ErrorBoundary>
    </div>
  )
}
