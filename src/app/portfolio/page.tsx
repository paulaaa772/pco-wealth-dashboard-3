'use client'

import React, { useState, useMemo } from 'react';
import { PortfolioPerformanceReport } from '@/components/portfolio/PortfolioPerformanceReport';
import { 
  generateMockPerformanceData, 
  generateMockRiskMetrics, 
  generateMockSectorAllocations,
  calculateReturns 
} from '@/lib/portfolio/mockPerformanceData';
import { IncomeAnalysis } from './income-analysis';
import { PortfolioHoldings } from './holdings';
import { useManualAccounts } from '@/context/ManualAccountsContext';
import AssetAllocation from '@/components/portfolio/AssetAllocation';
import EnhancedPerformanceAnalytics from '@/components/portfolio/EnhancedPerformanceAnalytics';
import GoalTrackingDashboard from '@/components/portfolio/GoalTrackingDashboard';
import TaxCenter from '@/components/portfolio/TaxCenter';
import PortfolioOptimizationTools from '@/components/portfolio/PortfolioOptimizationTools';
import ESGSustainabilityMetrics from '@/components/portfolio/ESGSustainabilityMetrics';
import AIFeatures from '@/components/portfolio/AIFeatures';
import Link from 'next/link';

export default function PortfolioPage() {
  const { manualAccounts, isLoading: isLoadingAccounts, error: accountsError } = useManualAccounts();

  // Initialize state with mock data
  const [performanceData] = useState(generateMockPerformanceData());
  const [riskMetrics] = useState(generateMockRiskMetrics());
  const [sectorAllocations] = useState(generateMockSectorAllocations());
  const returns = calculateReturns(performanceData);

  // Calculate REAL total value from context
  const totalPortfolioValue = useMemo(() => {
    return manualAccounts.reduce((sum, account) => sum + account.totalValue, 0);
  }, [manualAccounts]);

  const [activeTab, setActiveTab] = useState('holdings'); // Default to holdings tab

  // Tab interface styles
  const tabStyle = "px-4 py-2 text-sm font-medium";
  const activeTabStyle = `${tabStyle} bg-[#2A3C61] rounded-t-lg text-white`;
  const inactiveTabStyle = `${tabStyle} text-gray-400 hover:text-white`;

  // Handle loading state from context
  if (isLoadingAccounts) {
    return (
        <div className="min-h-screen bg-[#1B2B4B] text-white p-6 flex justify-center items-center">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
  }
  
   // Handle error state from context
   if (accountsError) {
     return (
        <div className="min-h-screen bg-[#1B2B4B] text-white p-6">
           <div className="max-w-7xl mx-auto space-y-6">
              <h1 className="text-3xl font-bold">Portfolio</h1>
              <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg">
                 Error loading accounts: {accountsError}
              </div>
           </div>
        </div>
     );
   }

  return (
    <div className="min-h-screen bg-[#1B2B4B] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Portfolio</h1>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-700">
          <nav className="flex flex-wrap gap-4">
            <button 
              className={activeTab === 'holdings' ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab('holdings')}
            >
              Holdings
            </button>
            <button 
              className={activeTab === 'allocation' ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab('allocation')}
            >
              Allocation
            </button>
            <button 
              className={activeTab === 'performance' ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab('performance')}
            >
              Performance
            </button>
            <button 
              className={activeTab === 'goals' ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab('goals')}
            >
              Goals
            </button>
            <button 
              className={activeTab === 'tax' ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab('tax')}
            >
              Tax
            </button>
            <Link 
              href="#portfolio-optimization" 
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'optimization' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-800 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('optimization')}
            >
              Optimization Tools
            </Link>
            <button 
              className={activeTab === 'esg' ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab('esg')}
            >
              ESG
            </button>
            <button 
              className={activeTab === 'ai' ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab('ai')}
            >
              AI Insights
            </button>
            <button 
              className={activeTab === 'income' ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab('income')}
            >
              Income Analysis
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'holdings' && <PortfolioHoldings />}
        
        {activeTab === 'allocation' && <AssetAllocation />}
        
        {activeTab === 'performance' && <EnhancedPerformanceAnalytics />}
        
        {/* Goals Tab */}
        {activeTab === 'goals' && <GoalTrackingDashboard />}
        
        {/* Tax Tab */}
        {activeTab === 'tax' && <TaxCenter />}
        
        {/* Optimization Tab */}
        {activeTab === 'optimization' && (
          <div id="portfolio-optimization" className="mt-4">
            <PortfolioOptimizationTools />
          </div>
        )}
        
        {/* ESG Tab */}
        {activeTab === 'esg' && <ESGSustainabilityMetrics />}
        
        {/* AI Insights Tab */}
        {activeTab === 'ai' && <AIFeatures />}
        
        {/* Income Analysis Tab */}
        {activeTab === 'income' && <IncomeAnalysis />}
      </div>
    </div>
  );
}


