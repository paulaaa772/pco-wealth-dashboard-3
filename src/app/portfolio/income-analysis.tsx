'use client'

import React, { useState, useEffect } from 'react';
import { PortfolioIncome, IncomeSource, MonthlyIncome } from '@/components/portfolio/PortfolioIncome';
import axios from 'axios';

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

  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [targetAnnualIncome, setTargetAnnualIncome] = useState(0);
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  // Get sample portfolio if needed
  useEffect(() => {
    async function getSamplePortfolio() {
      try {
        const response = await axios.get('/api/portfolios/sample');
        if (response.data && response.data.portfolioId) {
          setPortfolioId(response.data.portfolioId);
        }
      } catch (err) {
        console.error('Error getting sample portfolio:', err);
        setError('Failed to get sample portfolio. Please try again later.');
      }
    }
    
    if (!portfolioId) {
      getSamplePortfolio();
    }
  }, [portfolioId]);

  // Fetch income data when component mounts
  useEffect(() => {
    async function fetchIncomeData() {
      if (!portfolioId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/income?portfolioId=${portfolioId}`);
        
        if (response.data) {
          setIncomeData({
            projectedAnnualIncome: response.data.projectedAnnualIncome,
            ytdIncome: response.data.ytdIncome,
            lastYearIncome: response.data.lastYearIncome,
            annualTarget: response.data.annualTarget,
            incomeSources: response.data.incomeSources,
            monthlyIncome: response.data.monthlyIncome
          });
          setTargetAnnualIncome(response.data.annualTarget);
        }
      } catch (err) {
        console.error('Error fetching income data:', err);
        setError('Failed to load income data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchIncomeData();
  }, [portfolioId]);

  // Handle updating target income
  const updateTargetIncome = async () => {
    if (!portfolioId) return;
    
    try {
      await axios.put('/api/income', {
        portfolioId,
        annualTarget: targetAnnualIncome
      });
      
      // Update local state
      if (incomeData) {
        setIncomeData({
          ...incomeData,
          annualTarget: targetAnnualIncome
        });
      }
      
      setIsEditingTarget(false);
    } catch (err) {
      console.error('Error updating target income:', err);
      setError('Failed to update target income. Please try again later.');
    }
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