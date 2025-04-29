'use client'

import React, { useState } from 'react';
import { PortfolioPerformanceReport } from '@/components/portfolio/PortfolioPerformanceReport';
import { 
  generateMockPerformanceData, 
  generateMockRiskMetrics, 
  generateMockSectorAllocations,
  calculateReturns 
} from '@/lib/portfolio/mockPerformanceData';
import { IncomeAnalysis } from './income-analysis';

export default function PortfolioPage() {
  // Initialize state with mock data
  const [performanceData] = useState(generateMockPerformanceData());
  const [riskMetrics] = useState(generateMockRiskMetrics());
  const [sectorAllocations] = useState(generateMockSectorAllocations());
  const returns = calculateReturns(performanceData);

  return (
    <div className="min-h-screen bg-[#1B2B4B] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Portfolio</h1>
        
        {/* Performance Report Section */}
        <div className="bg-[#2A3C61] rounded-lg p-6">
          <PortfolioPerformanceReport
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
        </div>
        
        {/* Income Analysis Section */}
        <IncomeAnalysis />
      </div>
    </div>
  );
}


