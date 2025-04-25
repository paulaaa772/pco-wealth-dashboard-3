'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Edit2, Download, Plus } from 'lucide-react';

// Import custom components
import NetWorthChart from '@/components/dashboard/NetWorthChart';
import DonutChart from '@/components/dashboard/DonutChart';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import AiAssistantPanel from '@/components/dashboard/AiAssistantPanel';

// Simple error boundary component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Data type for chart
interface DataPoint {
  date: Date;
  value: number;
}

// Sample data for the chart
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

// Portfolio data
const portfolioData = {
  totalValue: 76584.92,
  cash: 8924.36,
  buyingPower: 17848.72,
  margin: 8924.36,
  startValue: 64597.47,
  endValue: 76584.92,
  netCashFlow: 3000,
  returnRate: 13.92,
  date: 'Apr 24, 2025',
  startDate: 'Jan 1, 2025',
  endDate: 'Apr 24, 2025'
};

// Content components for different tabs
const TaxAndProfitContent = () => <div className="p-4">Tax and Profit content placeholder</div>;
const InKindTransferContent = () => <div className="p-4">In-Kind Transfer content placeholder</div>;
const GoalSystemContent = () => <div className="p-4">Goals & Tracking content placeholder</div>;
const PortfolioSimulationContent = () => <div className="p-4">Simulation content placeholder</div>;

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [netWorthData, setNetWorthData] = useState<DataPoint[]>([]);
  
  // Simulate data loading
  useEffect(() => {
    const loadNetWorthData = async () => {
      try {
        // Simulate API fetch with timeout
        setTimeout(() => {
          setNetWorthData(chartData);
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error loading net worth data:', error);
        setIsLoading(false);
      }
    };
    
    loadNetWorthData();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="lg:flex lg:items-center lg:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate mb-1">
              Portfolio
            </h1>
            <div className="flex items-center text-sm text-gray-500">
              <RefreshCw className="h-4 w-4 mr-1" />
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <div className="mt-5 flex lg:mt-0 lg:ml-4">
            <span className="ml-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Edit2 className="-ml-1 mr-2 h-4 w-4" />
                Edit Allocations
              </button>
            </span>
            
            <span className="ml-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="-ml-1 mr-2 h-4 w-4" />
                Export
              </button>
            </span>
            
            <span className="ml-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Plus className="-ml-1 mr-2 h-4 w-4" />
                Add Funds
              </button>
            </span>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-1 ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tax')}
              className={`pb-4 px-1 ${
                activeTab === 'tax'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tax & Profit
            </button>
            <button
              onClick={() => setActiveTab('transfers')}
              className={`pb-4 px-1 ${
                activeTab === 'transfers'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              In-Kind Transfer
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`pb-4 px-1 ${
                activeTab === 'goals'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Goals & Tracking
            </button>
            <button
              onClick={() => setActiveTab('simulation')}
              className={`pb-4 px-1 ${
                activeTab === 'simulation'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Simulation
            </button>
          </nav>
        </div>
        
        {/* Content area */}
        <div className="mb-8">
          {activeTab === 'overview' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Portfolio Overview</h2>
              
              {/* Net Worth Chart Component */}
              <div className="mb-8">
                <NetWorthChart 
                  data={netWorthData}
                  title="Net Worth History"
                  height={300}
                  timeframes={['1W', '1M', '3M', '6M', 'YTD', '1Y', 'All']}
                />
              </div>
              
              {/* Portfolio Stats */}
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
              
              {/* Allocation Chart */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Asset Allocation</h3>
                <div className="flex justify-center">
                  <DonutChart />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'tax' && <TaxAndProfitContent />}
          {activeTab === 'transfers' && <InKindTransferContent />}
          {activeTab === 'goals' && <GoalSystemContent />}
          {activeTab === 'simulation' && <PortfolioSimulationContent />}
        </div>
        
        {/* AI Assistant */}
        <AiAssistantPanel />
      </div>
    </ErrorBoundary>
  );
} 