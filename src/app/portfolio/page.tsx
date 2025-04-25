'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  RefreshCw,
  Edit2,
  Download,
  Plus,
  PlusCircle,
  CheckSquare,
  Flag,
  LineChart,
  Share2,
  Edit,
  MinusCircle
} from 'lucide-react'

// Import our custom components
import NetWorthChart from '@/components/dashboard/NetWorthChart';
import DonutChart from '@/components/dashboard/DonutChart';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import AiAssistantPanel from '@/components/dashboard/AiAssistantPanel';

// Error boundary component for better error handling
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Updated chart data points for the line graph with more detailed data
interface DataPoint {
  date: Date;
  value: number;
}

const chartData: DataPoint[] = [
  { date: new Date('2024-06-01'), value: 1000 },
  { date: new Date('2024-06-15'), value: 1500 },
  { date: new Date('2024-07-01'), value: 2000 },
  { date: new Date('2024-07-15'), value: 1800 },
  { date: new Date('2024-08-01'), value: 2200 },
  { date: new Date('2024-08-15'), value: 2100 },
  { date: new Date('2024-09-01'), value: 2500 },
  { date: new Date('2024-09-15'), value: 3000 },
  { date: new Date('2024-10-01'), value: 3200 },
  { date: new Date('2024-10-15'), value: 4000 },
  { date: new Date('2024-11-01'), value: 4500 },
  { date: new Date('2024-11-15'), value: 5000 },
  { date: new Date('2024-12-01'), value: 5500 },
  { date: new Date('2024-12-15'), value: 6000 },
  { date: new Date('2025-01-01'), value: 6500 },
  { date: new Date('2025-01-15'), value: 7000 },
  { date: new Date('2025-02-01'), value: 7200 },
  { date: new Date('2025-02-15'), value: 7100 },
  { date: new Date('2025-03-01'), value: 7300 },
  { date: new Date('2025-03-15'), value: 7400 },
  { date: new Date('2025-04-01'), value: 7500 },
  { date: new Date('2025-04-15'), value: 7516.61 }
];

// Portfolio allocation data for pie chart with the specific color scheme
const allocationData = [
  { name: 'Technology', value: 20, color: '#4169E1' },
  { name: 'Healthcare', value: 15, color: '#9370DB' },
  { name: 'Financial Services', value: 10, color: '#20B2AA' },
  { name: 'Consumer Discretionary', value: 12, color: '#3CB371' },
  { name: 'Communication', value: 9, color: '#FF6347' },
  { name: 'Industrials', value: 8, color: '#6495ED' },
  { name: 'Other Sectors', value: 26, color: '#A9A9A9' }
];

// Portfolio data
const portfolioData = {
  totalValue: 7516.61,
  cash: 1.01,
  buyingPower: 3682.98,
  margin: 3681.97,
  startValue: 0,
  endValue: 7516.61,
  netCashFlow: 7592.52,
  returnRate: -13.75,
  date: 'Apr 24, 2025',
  startDate: 'Jul 23, 2024',
  endDate: 'Apr 24, 2025'
};

// Content components for different tabs
const TaxAndProfitContent = () => <div className="p-4">Tax and Profit content placeholder</div>;
const InKindTransferContent = () => <div className="p-4">In-Kind Transfer content placeholder</div>;
const GoalSystemContent = () => <div className="p-4">Goals & Tracking content placeholder</div>;
const PortfolioSimulationContent = () => <div className="p-4">Simulation content placeholder</div>;

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [isLoading, setIsLoading] = useState(true);
  const [netWorthData, setNetWorthData] = useState<DataPoint[]>([]);
  
  const timeframes = [
    { id: '1D', label: '1D' },
    { id: '1W', label: '1W' },
    { id: '1M', label: '1M' },
    { id: '3M', label: '3M' },
    { id: '6M', label: '6M' },
    { id: 'YTD', label: 'YTD' },
    { id: '1Y', label: '1Y' }
  ];
  
  // Simulate data loading
  useEffect(() => {
    const loadNetWorthData = async () => {
      try {
        // In a real app, you would fetch this data from an API
        // For now, we'll simulate loading with a timeout
        setTimeout(() => {
          setNetWorthData(chartData);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading net worth data:', error);
        setIsLoading(false);
      }
    };
    
    loadNetWorthData();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#172033]">
        <LoadingSpinner size="large" color="#fff" />
      </div>
    );
  }
  
  const renderContent = () => {
    switch(activeTab) {
      case 'tax':
        return <TaxAndProfitContent />;
      case 'transfers':
        return <InKindTransferContent />;
      case 'goals':
        return <GoalSystemContent />;
      case 'simulation':
        return <PortfolioSimulationContent />;
      case 'portfolio':
      default:
        return (
          <div className="space-y-8">
            {/* Portfolio Overview Card */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Portfolio Overview</h2>
                
                {/* Net Worth Chart - Using our NetWorthChart component */}
                <div className="mb-8">
                  <NetWorthChart 
                    data={netWorthData}
                    title="Net Worth History"
                    height={300}
                    timeframes={['1W', '1M', '3M', '6M', 'YTD', '1Y', 'All']}
                  />
                </div>
                
                {/* Portfolio Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Total Portfolio Value</div>
                    <div className="text-2xl font-bold">${portfolioData.totalValue.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">as of {portfolioData.date}</div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Cash Balance</div>
                    <div className="text-2xl font-bold">${portfolioData.cash.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">Available for trading</div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Buying Power</div>
                    <div className="text-2xl font-bold">${portfolioData.buyingPower.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">Including ${portfolioData.margin.toLocaleString()} margin</div>
                  </div>
                </div>
                
                {/* Performance Metrics */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Start Value</div>
                      <div className="font-medium">${portfolioData.startValue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{portfolioData.startDate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Current Value</div>
                      <div className="font-medium">${portfolioData.endValue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{portfolioData.endDate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Net Deposits</div>
                      <div className="font-medium">${portfolioData.netCashFlow.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Total contributions</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Net Return</div>
                      <div className={`font-medium ${portfolioData.returnRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {portfolioData.returnRate >= 0 ? '+' : ''}{portfolioData.returnRate}%
                      </div>
                      <div className="text-xs text-gray-500">Since inception</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Allocation and Holdings Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Sector Allocation</h2>
                <DonutChart data={allocationData} />
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Top Holdings</h2>
                  <Link href="#" className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold mr-3">
                        A
                      </div>
                      <div>
                        <div className="font-medium">AAPL</div>
                        <div className="text-sm text-gray-500">Apple Inc.</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$2,504.25</div>
                      <div className="text-sm text-green-600">+15.2%</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold mr-3">
                        M
                      </div>
                      <div>
                        <div className="font-medium">MSFT</div>
                        <div className="text-sm text-gray-500">Microsoft Corp.</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$1,982.00</div>
                      <div className="text-sm text-green-600">+8.7%</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold mr-3">
                        G
                      </div>
                      <div>
                        <div className="font-medium">GOOGL</div>
                        <div className="text-sm text-gray-500">Alphabet Inc.</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$1,653.75</div>
                      <div className="text-sm text-red-600">-2.3%</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-semibold mr-3">
                        A
                      </div>
                      <div>
                        <div className="font-medium">AMZN</div>
                        <div className="text-sm text-gray-500">Amazon.com Inc.</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$1,376.61</div>
                      <div className="text-sm text-green-600">+5.1%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Activity</h2>
                <div className="flex space-x-3 items-center">
                  <div className="text-sm text-gray-500">Filter:</div>
                  <select className="text-sm border border-gray-300 rounded px-2 py-1">
                    <option>All Activity</option>
                    <option>Trades</option>
                    <option>Dividends</option>
                    <option>Transfers</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Apr 24, 2025</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Buy</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        Bought 5 shares of NVDA @ $85.31
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600">-$426.55</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Apr 20, 2025</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Dividend</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        Dividend payment from AAPL
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">+$6.25</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Apr 15, 2025</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Deposit</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        Bank transfer deposit
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">+$1,000.00</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Apr 12, 2025</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Sell</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        Sold 10 shares of MSFT @ $378.12
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">+$3,781.20</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-center mt-4">
                <button className="text-sm text-blue-600 px-3 py-1 hover:bg-blue-50 rounded">
                  View All Activity
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="bg-[#172033] min-h-screen text-white">
        <div className="container mx-auto px-4 py-6">
          {/* Navigation Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-8 border-b border-gray-700">
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`pb-4 px-1 ${
                  activeTab === 'portfolio'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`pb-4 px-1 ${
                  activeTab === 'activity'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setActiveTab('holdings')}
                className={`pb-4 px-1 ${
                  activeTab === 'holdings'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Holdings
              </button>
              <button
                onClick={() => setActiveTab('funding')}
                className={`pb-4 px-1 ${
                  activeTab === 'funding'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Funding
              </button>
              <button
                onClick={() => setActiveTab('tax')}
                className={`pb-4 px-1 ${
                  activeTab === 'tax'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Tax & Profit
              </button>
              <button
                onClick={() => setActiveTab('transfers')}
                className={`pb-4 px-1 ${
                  activeTab === 'transfers'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Transfers
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className={`pb-4 px-1 ${
                  activeTab === 'goals'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Goals
              </button>
              <button
                onClick={() => setActiveTab('simulation')}
                className={`pb-4 px-1 ${
                  activeTab === 'simulation'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Simulation
              </button>
            </nav>
          </div>
          
          {/* Main Content */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Stocks</h2>
            
            {/* Cash, Margin, Buying Power Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">Cash</span>
                  <div className="bg-gray-700 rounded-full w-4 h-4 flex items-center justify-center text-xs">?</div>
                </div>
                <div className="text-xl font-bold">${portfolioData.cash.toLocaleString()}</div>
              </div>
              
              <div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">Margin</span>
                  <div className="bg-gray-700 rounded-full w-4 h-4 flex items-center justify-center text-xs">?</div>
                </div>
                <div className="text-xl font-bold text-blue-400">${portfolioData.margin.toLocaleString()} ›</div>
              </div>
              
              <div>
                <span className="text-gray-400">Total buying power</span>
                <div className="text-xl font-bold">${portfolioData.buyingPower.toLocaleString()}</div>
              </div>
              
              <div className="md:col-span-3 flex justify-end">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                  Move money
                </button>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left side - Donut Chart */}
              <div className="w-full lg:w-1/3">
                <div className="bg-[#1D2939] rounded-lg p-6 h-full">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-1">${portfolioData.totalValue.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">as of {portfolioData.date}</div>
                  </div>
                  
                  <div className="mt-4">
                    <DonutChart 
                      data={allocationData} 
                      width={250} 
                      height={250} 
                      innerRadius={70} 
                      outerRadius={110} 
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-6 grid grid-cols-5 gap-2">
                    <div className="flex flex-col items-center">
                      <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center mb-1">
                        <Plus className="h-6 w-6" />
                      </button>
                      <span className="text-xs text-gray-300">Buy</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center mb-1">
                        <MinusCircle className="h-6 w-6" />
                      </button>
                      <span className="text-xs text-gray-300">Sell</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center mb-1">
                        <RefreshCw className="h-6 w-6" />
                      </button>
                      <span className="text-xs text-gray-300">Rebalance</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center mb-1">
                        <Edit className="h-6 w-6" />
                      </button>
                      <span className="text-xs text-gray-300">Edit</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center mb-1">
                        <Share2 className="h-6 w-6" />
                      </button>
                      <span className="text-xs text-gray-300">Share</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right side - Line Chart */}
              <div className="w-full lg:w-2/3">
                <div className="bg-[#1D2939] rounded-lg p-6">
                  {/* Time Frame Buttons */}
                  <div className="flex justify-end mb-4">
                    {timeframes.map((tf) => (
                      <button
                        key={tf.id}
                        onClick={() => setSelectedTimeframe(tf.id)}
                        className={`px-2 py-1 text-xs rounded mx-1 ${
                          selectedTimeframe === tf.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {tf.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Net Worth Chart */}
                  <div className="h-64">
                    <NetWorthChart 
                      data={netWorthData}
                      title=""
                      height={256}
                      timeframes={['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y']}
                      darkMode={true}
                    />
                  </div>
                  
                  {/* Portfolio Performance Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <div>
                      <div className="text-gray-400 text-sm">Starting value: {portfolioData.startDate}</div>
                      <div className="font-medium">${portfolioData.startValue.toLocaleString()}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-400 text-sm">Ending value: {portfolioData.endDate}</div>
                      <div className="font-medium">${portfolioData.endValue.toLocaleString()}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-400 text-sm">Net cash flow</div>
                      <div className="font-medium">${portfolioData.netCashFlow.toLocaleString()}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-400 text-sm">Money weighted rate of return</div>
                      <div className="font-medium text-red-500">↓ {portfolioData.returnRate}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Assistant */}
        <AiAssistantPanel />
      </div>
    </ErrorBoundary>
  );
}
