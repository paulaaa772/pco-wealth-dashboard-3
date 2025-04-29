'use client';

import React, { useMemo, useState } from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext';
import DonutChart from '@/components/dashboard/DonutChart';

// Define the different views for asset allocation
type AllocationView = 'symbol' | 'account' | 'accountType';

export default function AssetAllocation() {
  const { manualAccounts, isLoading } = useManualAccounts();
  const [view, setView] = useState<AllocationView>('symbol');

  // Generate chart colors
  const getColorForIndex = (index: number) => {
    const colors = [
      '#4A90E2', // Blue
      '#50E3C2', // Teal
      '#B8E986', // Green
      '#F8E71C', // Yellow
      '#F5A623', // Orange
      '#BD10E0', // Purple
      '#9013FE', // Violet
      '#4A4A4A', // Gray
      '#6A8EAE', // Steel Blue
      '#5AC8FA', // Sky Blue
      '#AF52DE', // Magenta
      '#FF9500', // Deep Orange
      '#FF2D55', // Red
      '#44DB5E', // Lime
      '#007AFF', // Royal Blue
      '#8E8E93'  // Gray
    ];
    return colors[index % colors.length];
  };

  // Process data for different views
  const chartData = useMemo(() => {
    if (isLoading || manualAccounts.length === 0) {
      return [];
    }

    // Calculate total portfolio value
    const totalPortfolioValue = manualAccounts.reduce(
      (sum, account) => sum + account.totalValue, 
      0
    );

    if (view === 'account') {
      // Group by account
      return manualAccounts.map((account, index) => ({
        name: account.accountName,
        value: Math.round((account.totalValue / totalPortfolioValue) * 100),
        color: getColorForIndex(index)
      })).filter(item => item.value > 0);
    } 
    else if (view === 'accountType') {
      // Group by account type
      const typeMap = new Map<string, number>();
      
      manualAccounts.forEach(account => {
        const currentValue = typeMap.get(account.accountType) || 0;
        typeMap.set(account.accountType, currentValue + account.totalValue);
      });

      return Array.from(typeMap.entries()).map(([type, value], index) => ({
        name: type,
        value: Math.round((value / totalPortfolioValue) * 100),
        color: getColorForIndex(index)
      })).filter(item => item.value > 0);
    }
    else {
      // Group by symbol (default)
      const symbolMap = new Map<string, number>();
      
      manualAccounts.forEach(account => {
        account.assets.forEach(asset => {
          const currentValue = symbolMap.get(asset.symbol) || 0;
          symbolMap.set(asset.symbol, currentValue + asset.value);
        });
      });

      return Array.from(symbolMap.entries())
        .map(([symbol, value], index) => ({
          name: symbol,
          value: Math.round((value / totalPortfolioValue) * 100),
          color: getColorForIndex(index)
        }))
        .sort((a, b) => b.value - a.value) // Sort by value descending
        .filter(item => item.value > 0); // Filter out 0% allocations
    }
  }, [manualAccounts, isLoading, view]);

  // Handle scenarios with no data
  if (isLoading) {
    return (
      <div className="bg-[#1E2D4E] rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Asset Allocation</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (manualAccounts.length === 0) {
    return (
      <div className="bg-[#1E2D4E] rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Asset Allocation</h2>
        </div>
        <div className="text-center py-6 text-gray-400">
          No accounts added yet. Add accounts to view allocation.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1E2D4E] rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Asset Allocation</h2>
        <div className="flex space-x-2 text-sm">
          <button 
            onClick={() => setView('symbol')}
            className={`px-3 py-1 rounded ${
              view === 'symbol' 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#2A3C61] text-gray-300 hover:bg-[#344571]'
            }`}
          >
            By Symbol
          </button>
          <button 
            onClick={() => setView('account')}
            className={`px-3 py-1 rounded ${
              view === 'account' 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#2A3C61] text-gray-300 hover:bg-[#344571]'
            }`}
          >
            By Account
          </button>
          <button 
            onClick={() => setView('accountType')}
            className={`px-3 py-1 rounded ${
              view === 'accountType' 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#2A3C61] text-gray-300 hover:bg-[#344571]'
            }`}
          >
            By Type
          </button>
        </div>
      </div>
      
      <div className="flex justify-center mt-4">
        <DonutChart 
          data={chartData} 
          darkMode={true}
          width={350}
          height={350}
          innerRadius={70}
          outerRadius={120}
          showLegend={true}
        />
      </div>
    </div>
  );
} 