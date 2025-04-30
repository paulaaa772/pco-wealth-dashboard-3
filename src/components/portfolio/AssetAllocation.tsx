'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext';
import DonutChart from '@/components/dashboard/DonutChart';

// Define the different views for asset allocation
type AllocationView = 'symbol' | 'account' | 'accountType';

interface AllocationItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
  assetClass?: string;
  balance: number;
}

// Define asset class mappings type
interface AssetClassConfig {
  default: string;
  mappings?: Record<string, string>;
}

export default function AssetAllocation() {
  const { manualAccounts, isLoading } = useManualAccounts();
  const [view, setView] = useState<AllocationView>('symbol');
  const [selectedItem, setSelectedItem] = useState<AllocationItem | null>(null);

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

  // Map account types to asset classes
  const getAssetClass = (account: any, symbol: string, assetType?: string): string => {
    // If asset has a specified type, use it directly
    if (assetType) {
      return assetType;
    }

    // Fallback to the previous mapping logic
    const assetClasses: Record<string, AssetClassConfig> = {
      'Brokerage': {
        default: 'Stock',
        mappings: {
          'AAPL': 'Stock',
          'MSFT': 'Stock',
          'AMZN': 'Stock',
          'GOOGL': 'Stock',
          'FB': 'Stock',
          'TSLA': 'Stock',
          'BRK.B': 'Stock',
          'V': 'Stock',
          'JNJ': 'Stock',
          'JPM': 'Stock',
          'NVDA': 'Stock',
          'PG': 'Stock',
          'HD': 'Stock',
          'UNH': 'Stock',
          'MA': 'Stock',
          'SPY': 'ETF',
          'VOO': 'ETF',
          'QQQ': 'ETF',
          'VTI': 'ETF',
          'IVV': 'ETF',
          'VEA': 'ETF',
          'IEMG': 'ETF',
          'AGG': 'Bond',
          'BND': 'Bond',
          'LQD': 'Bond',
        }
      },
      'Bank Account': { default: 'Cash' },
      'Crypto Wallet': { default: 'Crypto' },
      'Other': { default: 'Other' }
    };

    const accountClass = assetClasses[account.accountType] || { default: 'Other' };
    return accountClass.mappings?.[symbol] || accountClass.default;
  };

  // Process data for different views
  const allocationData = useMemo(() => {
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
      return manualAccounts.map((account, index) => {
        const percentage = (account.totalValue / totalPortfolioValue) * 100;
        return {
          name: account.accountName,
          value: Math.round(percentage),
          percentage: percentage,
          color: getColorForIndex(index),
          assetClass: account.accountType,
          balance: account.totalValue
        };
      }).filter(item => item.value > 0);
    } 
    else if (view === 'accountType') {
      // Group by asset type instead of account type
      const typeMap = new Map<string, number>();
      
      manualAccounts.forEach(account => {
        account.assets.forEach(asset => {
          // Use asset type if available, otherwise use the inferred class
          const assetType = asset.assetType || getAssetClass(account, asset.symbol);
          const currentValue = typeMap.get(assetType) || 0;
          typeMap.set(assetType, currentValue + asset.value);
        });
      });

      return Array.from(typeMap.entries()).map(([type, value], index) => {
        const percentage = (value / totalPortfolioValue) * 100;
        return {
          name: type,
          value: Math.round(percentage),
          percentage: percentage,
          color: getColorForIndex(index),
          assetClass: type,
          balance: value
        };
      }).filter(item => item.value > 0);
    }
    else {
      // Group by symbol (default)
      const symbolMap = new Map<string, { total: number, assetClass: string }>();
      
      manualAccounts.forEach(account => {
        account.assets.forEach(asset => {
          const existing = symbolMap.get(asset.symbol) || { 
            total: 0, 
            assetClass: getAssetClass(account, asset.symbol, asset.assetType) 
          };
          symbolMap.set(asset.symbol, {
            total: existing.total + asset.value,
            assetClass: existing.assetClass
          });
        });
      });

      return Array.from(symbolMap.entries())
        .map(([symbol, data], index) => {
          const percentage = (data.total / totalPortfolioValue) * 100;
          return {
            name: symbol,
            value: Math.round(percentage),
            percentage: percentage,
            color: getColorForIndex(index),
            assetClass: data.assetClass,
            balance: data.total
          };
        })
        .sort((a, b) => b.balance - a.balance) // Sort by value descending
        .filter(item => item.value > 0); // Filter out 0% allocations
    }
  }, [manualAccounts, isLoading, view]);

  // Format data for DonutChart
  const chartData = useMemo(() => {
    return allocationData.map(item => ({
      name: item.name,
      value: item.value,
      color: item.color
    }));
  }, [allocationData]);

  // Set first item as selected by default when data changes
  useEffect(() => {
    if (allocationData.length > 0 && !selectedItem) {
      setSelectedItem(allocationData[0]);
    } else if (allocationData.length > 0 && selectedItem) {
      // Try to maintain selection after view change
      const newSelection = allocationData.find(item => item.name === selectedItem.name);
      setSelectedItem(newSelection || allocationData[0]);
    } else {
      setSelectedItem(null);
    }
  }, [allocationData, selectedItem]);

  // Handle click on pie slice
  const handleSliceClick = (sliceName: string) => {
    const selected = allocationData.find(item => item.name === sliceName);
    if (selected) {
      setSelectedItem(selected);
    }
  };

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
        <h2 className="text-2xl font-semibold">Asset Allocation</h2>
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
      
      <div className="flex flex-col md:flex-row mt-4">
        {/* Chart Section */}
        <div className="md:w-1/2 flex flex-col items-center">
          <div className="relative">
            <DonutChart 
              data={chartData} 
              darkMode={true}
              width={300}
              height={300}
              innerRadius={70}
              outerRadius={120}
              showLegend={false}
              onSliceClick={handleSliceClick}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button 
              className="px-3 py-1 rounded bg-[#2A3C61] text-gray-300 hover:bg-[#344571]"
            >
              Investment
            </button>
            <button 
              className="px-3 py-1 rounded bg-[#2A3C61] text-gray-300 hover:bg-[#344571]"
            >
              Asset Class
            </button>
          </div>
        </div>
        
        {/* Details Section */}
        <div className="md:w-1/2 mt-6 md:mt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#2A3C61] text-gray-300">
                <tr>
                  <th className="py-2 px-4 text-left font-medium">PERCENTAGE</th>
                  <th className="py-2 px-4 text-left font-medium">
                    {view === 'symbol' ? 'INVESTMENT' : 
                     view === 'account' ? 'ACCOUNT' : 'ASSET TYPE'}
                  </th>
                  <th className="py-2 px-4 text-left font-medium">
                    {view === 'accountType' ? 'DESCRIPTION' : 'ASSET CLASS'}
                  </th>
                  <th className="py-2 px-4 text-right font-medium">BALANCE</th>
                </tr>
              </thead>
              <tbody>
                {allocationData.map((item, index) => (
                  <tr 
                    key={item.name} 
                    className={`${index % 2 === 0 ? 'bg-[#2A3C61]' : 'bg-[#233150]'} hover:bg-[#344571] cursor-pointer ${selectedItem?.name === item.name ? 'bg-[#344571] border-l-4 border-blue-500' : ''}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="py-2 px-4 flex items-center">
                      <div 
                        className="h-3 w-3 rounded-sm mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      {item.percentage.toFixed(2)}%
                    </td>
                    <td className="py-2 px-4 text-blue-400 hover:underline">
                      {item.name}
                    </td>
                    <td className="py-2 px-4">
                      {item.assetClass}
                    </td>
                    <td className="py-2 px-4 text-right">
                      ${item.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 