'use client';

import React from 'react';
import RiskBasedAllocation from './RiskBasedAllocation';
import RebalancingEngine from './RebalancingEngine';
import DiversificationAnalysis from './DiversificationAnalysis';
import ScenarioAnalysis from './ScenarioAnalysis';

const PortfolioOptimizationTools: React.FC = () => {
  return (
    <div className="space-y-8 py-6">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Portfolio Optimization Suite</h2>
      
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