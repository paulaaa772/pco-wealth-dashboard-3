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
          <nav className="flex gap-4">
            <button 
              className={activeTab === 'holdings' ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab('holdings')}
            >
              Holdings
            </button>
            <button 
              className={activeTab === 'performance' ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab('performance')}
            >
              Performance
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
        
        {activeTab === 'performance' && (
          <div className="bg-[#2A3C61] rounded-lg p-6">
            <PortfolioPerformanceReport
              totalValue={totalPortfolioValue > 0 ? totalPortfolioValue : undefined}
              performanceData={performanceData}
              riskMetrics={riskMetrics}
              sectorAllocations={sectorAllocations}
              totalReturn={returns.totalReturn}
              ytdReturn={returns.ytdReturn}
              oneYearReturn={returns.oneYearReturn}
              threeYearReturn={returns.threeYearReturn}
              fiveYearReturn={returns.fiveYearReturn}
              benchmarkName="S&P 500"
            />
            <p className="text-xs text-center text-gray-500 mt-4 italic">
              Note: Chart, returns, risk, and allocation data are currently illustrative placeholders.
            </p>
          </div>
        )}
        
        {/* Income Analysis Tab */}
        {activeTab === 'income' && <IncomeAnalysis />}
      </div>
    </div>
  );
}


