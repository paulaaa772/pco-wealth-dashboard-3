'use client'

import React, { useState, useEffect } from 'react';
import { PortfolioIncome, IncomeSource, MonthlyIncome } from '@/components/portfolio/PortfolioIncome';

export function IncomeAnalysis() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incomeData, setIncomeData] = useState<{
    projectedAnnualIncome: number;
    ytdIncome: number;
    lastYearIncome: number;
    annualTarget: number;
    incomeSources: IncomeSource[];
    monthlyIncome: MonthlyIncome[];
  } | null>(null);

  const [portfolioId, setPortfolioId] = useState<string>('demo-portfolio');
  const [targetAnnualIncome, setTargetAnnualIncome] = useState(0);
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  // Generate mock data client-side
  useEffect(() => {
    // Generate mock data
    function generateMockIncomeData() {
      // Sample income sources
      const incomeSources: IncomeSource[] = [
        {
          name: "Apple Inc.",
          type: "dividend",
          frequency: "quarterly",
          amount: 2500,
          nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          yield: 0.0235,
          paymentHistory: [
            { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2500 },
            { date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2300 },
            { date: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2300 },
            { date: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2200 },
          ]
        },
        {
          name: "Microsoft Corp",
          type: "dividend",
          frequency: "quarterly",
          amount: 3200,
          nextPayment: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days from now
          yield: 0.0185,
          paymentHistory: [
            { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 3200 },
            { date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 3000 },
            { date: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 3000 },
            { date: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2800 },
          ]
        },
        {
          name: "US Treasury Bonds",
          type: "interest",
          frequency: "monthly",
          amount: 1800,
          nextPayment: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
          yield: 0.0435,
          paymentHistory: [
            { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 1800 },
            { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 1800 },
            { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 1800 },
            { date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 1750 },
          ]
        },
        {
          name: "Vanguard Real Estate ETF",
          type: "distribution",
          frequency: "quarterly",
          amount: 2800,
          nextPayment: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days from now
          yield: 0.0385,
          paymentHistory: [
            { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2800 },
            { date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2750 },
            { date: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2700 },
            { date: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2650 },
          ]
        }
      ];
      
      // Generate monthly income data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyIncome: MonthlyIncome[] = months.map((month, i) => {
        // Simulate quarterly dividend payments
        const isDividendMonth = i % 3 === 0;
        const dividends = isDividendMonth ? 5500 : 0;
        
        // Interest is monthly
        const interest = 1800;
        
        // Distributions are quarterly
        const distributions = isDividendMonth ? 2800 : 0;
        
        return {
          month,
          dividends,
          interest,
          distributions
        };
      });
      
      // Calculate annual projections
      const projectedAnnualIncome = 72000;
      const ytdIncome = 23250;
      const lastYearIncome = 65400;
      const annualTarget = 75000;
      
      return {
        projectedAnnualIncome,
        ytdIncome,
        lastYearIncome,
        annualTarget,
        incomeSources,
        monthlyIncome
      };
    }

    // Set a small timeout to simulate a network request
    const timer = setTimeout(() => {
      try {
        const mockData = generateMockIncomeData();
        setIncomeData(mockData);
        setTargetAnnualIncome(mockData.annualTarget);
        setLoading(false);
      } catch (err) {
        console.error('Error generating mock data:', err);
        setError('Failed to generate income data. Please try again later.');
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle updating target income
  const updateTargetIncome = () => {
    if (incomeData) {
      setIncomeData({
        ...incomeData,
        annualTarget: targetAnnualIncome
      });
    }
    setIsEditingTarget(false);
  };

  if (loading) {
    return (
      <div className="bg-[#1E2D4E] rounded-lg p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1E2D4E] rounded-lg p-6">
        <div className="text-red-500 p-4 rounded-lg">
          <h3 className="text-xl font-bold mb-2">Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1E2D4E] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Income Analysis</h2>
        
        {/* Target income editor */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Annual Target:</span>
          {isEditingTarget ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={targetAnnualIncome}
                onChange={(e) => setTargetAnnualIncome(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 w-32 text-white"
              />
              <button
                onClick={updateTargetIncome}
                className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setTargetAnnualIncome(incomeData?.annualTarget || 0);
                  setIsEditingTarget(false);
                }}
                className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium">${targetAnnualIncome.toLocaleString()}</span>
              <button
                onClick={() => setIsEditingTarget(true)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
      
      {incomeData && (
        <PortfolioIncome
          projectedAnnualIncome={incomeData.projectedAnnualIncome}
          ytdIncome={incomeData.ytdIncome}
          lastYearIncome={incomeData.lastYearIncome}
          annualTarget={incomeData.annualTarget}
          incomeSources={incomeData.incomeSources}
          monthlyIncome={incomeData.monthlyIncome}
        />
      )}
    </div>
  );
} 