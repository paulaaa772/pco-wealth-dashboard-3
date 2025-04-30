'use client';

import React from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext';
import RiskBasedAllocation from './RiskBasedAllocation';
import RebalancingEngine from './RebalancingEngine';
import DiversificationAnalysis from './DiversificationAnalysis';
import ScenarioAnalysis from './ScenarioAnalysis';
import AIInsightsSummary from './AIInsightsSummary';

const PortfolioOptimizationTools: React.FC = () => {
  const { manualAccounts, isLoading } = useManualAccounts();

  if (isLoading) {
    return (
      <div className="space-y-8 py-6">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Portfolio Optimization Suite</h2>
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Portfolio Optimization Suite</h2>
      
      {/* AI Insights Summary Component */}
      <AIInsightsSummary manualAccounts={manualAccounts} />

      {/* Risk-Based Allocation Component */}
      <RiskBasedAllocation />
      
      {/* Rebalancing Engine Component */}
      <RebalancingEngine />
      
      {/* Diversification Analysis Component */}
      <DiversificationAnalysis />
      
      {/* Scenario Analysis Component */}
      <ScenarioAnalysis />

      {/* Add any other summary or overarching tools here */}
    </div>
  );
};

export default PortfolioOptimizationTools; 