'use client'

import React, { useState } from 'react';
import { PortfolioPerformanceReport } from '@/components/portfolio/PortfolioPerformanceReport';
import { PortfolioIncome } from '@/components/portfolio/PortfolioIncome';
import { 
  generateMockPerformanceData, 
  generateMockRiskMetrics, 
  generateMockSectorAllocations,
  calculateReturns 
} from '@/lib/portfolio/mockPerformanceData';

// Import the IncomeSource type from the PortfolioIncome component
import type { IncomeSource } from '@/components/portfolio/PortfolioIncome';

export default function PortfolioPage() {
  // Initialize state with mock data
  const [performanceData] = useState(generateMockPerformanceData());
  const [riskMetrics] = useState(generateMockRiskMetrics());
  const [sectorAllocations] = useState(generateMockSectorAllocations());
  const returns = calculateReturns(performanceData);

  // Mock data for the PortfolioIncome component
  const mockIncomeSources: IncomeSource[] = [
    {
      name: "Apple Inc.",
      type: "dividend",
      frequency: "quarterly",
      amount: 2500,
      nextPayment: "2024-06-15",
      yield: 0.0235,
      paymentHistory: [
        { date: "2024-03-15", amount: 2500 },
        { date: "2023-12-15", amount: 2300 },
        { date: "2023-09-15", amount: 2300 },
        { date: "2023-06-15", amount: 2200 },
      ]
    },
    {
      name: "Microsoft Corp",
      type: "dividend",
      frequency: "quarterly",
      amount: 3200,
      nextPayment: "2024-06-08",
      yield: 0.0185,
      paymentHistory: [
        { date: "2024-03-08", amount: 3200 },
        { date: "2023-12-08", amount: 3000 },
        { date: "2023-09-08", amount: 3000 },
        { date: "2023-06-08", amount: 2800 },
      ]
    },
    {
      name: "US Treasury Bonds",
      type: "interest",
      frequency: "monthly",
      amount: 1800,
      nextPayment: "2024-05-28",
      yield: 0.0435,
      paymentHistory: [
        { date: "2024-04-28", amount: 1800 },
        { date: "2024-03-28", amount: 1800 },
        { date: "2024-02-28", amount: 1800 },
        { date: "2024-01-28", amount: 1750 },
      ]
    },
    {
      name: "Vanguard Real Estate ETF",
      type: "distribution",
      frequency: "quarterly",
      amount: 2800,
      nextPayment: "2024-06-25",
      yield: 0.0385,
      paymentHistory: [
        { date: "2024-03-25", amount: 2800 },
        { date: "2023-12-25", amount: 2750 },
        { date: "2023-09-25", amount: 2700 },
        { date: "2023-06-25", amount: 2650 },
      ]
    }
  ];

  const mockMonthlyIncome = [
    { month: "Jan", dividends: 0, interest: 1750, distributions: 0 },
    { month: "Feb", dividends: 0, interest: 1800, distributions: 0 },
    { month: "Mar", dividends: 5500, interest: 1800, distributions: 2800 },
    { month: "Apr", dividends: 0, interest: 1800, distributions: 0 },
    { month: "May", dividends: 0, interest: 1800, distributions: 0 },
    { month: "Jun", dividends: 5700, interest: 1800, distributions: 2800 },
    { month: "Jul", dividends: 0, interest: 1800, distributions: 0 },
    { month: "Aug", dividends: 0, interest: 1800, distributions: 0 },
    { month: "Sep", dividends: 5300, interest: 1800, distributions: 2700 },
    { month: "Oct", dividends: 0, interest: 1800, distributions: 0 },
    { month: "Nov", dividends: 0, interest: 1800, distributions: 0 },
    { month: "Dec", dividends: 5300, interest: 1800, distributions: 2750 }
  ];

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
        
        {/* Income Section */}
        <div className="bg-[#2A3C61] rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Income Analysis</h2>
          <PortfolioIncome
            projectedAnnualIncome={72000}
            ytdIncome={23250}
            lastYearIncome={65400}
            annualTarget={75000}
            incomeSources={mockIncomeSources}
            monthlyIncome={mockMonthlyIncome}
          />
        </div>
      </div>
    </div>
  );
}


