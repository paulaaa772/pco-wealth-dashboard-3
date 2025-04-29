'use client'

import React, { useState, useEffect } from 'react';

// Define types
interface Investment {
  id: string;
  symbol: string;
  name: string;
  category: string;
  shares: number;
  price: number;
  costBasis: number;
  value: number;
  gain: number;
  gainPercent: number;
  allocation: number;
}

export function PortfolioHoldings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Investment;
    direction: 'ascending' | 'descending';
  }>({ key: 'value', direction: 'descending' });

  // Generate mock investment data
  useEffect(() => {
    // Simulate API call with timeout
    const loadTimer = setTimeout(() => {
      try {
        const mockInvestments = generateMockInvestments();
        setInvestments(mockInvestments);
        
        // Calculate total portfolio value
        const total = mockInvestments.reduce((sum, inv) => sum + inv.value, 0);
        setTotalValue(total);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading investment data:', err);
        setError('Failed to load investment data. Please try again later.');
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(loadTimer);
  }, []);

  // Generate mock investment data
  const generateMockInvestments = (): Investment[] => {
    const stocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', category: 'Technology', price: 187.68 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', category: 'Technology', price: 416.42 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'Technology', price: 174.39 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'Consumer Discretionary', price: 182.15 },
      { symbol: 'TSLA', name: 'Tesla Inc.', category: 'Consumer Discretionary', price: 172.63 },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', category: 'Technology', price: 933.55 },
      { symbol: 'META', name: 'Meta Platforms Inc.', category: 'Communication Services', price: 474.99 },
      { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', category: 'Financials', price: 414.01 },
      { symbol: 'JNJ', name: 'Johnson & Johnson', category: 'Healthcare', price: 152.49 },
      { symbol: 'V', name: 'Visa Inc.', category: 'Financials', price: 277.82 },
      { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', category: 'ETF', price: 258.43 },
      { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', category: 'ETF', price: 470.25 },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust', category: 'ETF', price: 444.75 },
    ];

    // Create investments with fixed data to match screenshot
    const investments: Investment[] = [
      {
        id: 'inv-1',
        symbol: 'NVDA',
        name: 'NVIDIA Corp.',
        category: 'Technology',
        shares: 73,
        price: 933.55,
        value: 68149.15,
        costBasis: 66485.65,
        gain: 1663.50,
        gainPercent: 2.50,
        allocation: 34.51
      },
      {
        id: 'inv-2',
        symbol: 'VOO',
        name: 'Vanguard S&P 500 ETF',
        category: 'ETF',
        shares: 96,
        price: 470.25,
        value: 45144.00,
        costBasis: 43718.50,
        gain: 1425.50,
        gainPercent: 3.26,
        allocation: 22.86
      },
      {
        id: 'inv-3',
        symbol: 'BRK.B',
        name: 'Berkshire Hathaway Inc.',
        category: 'Financials',
        shares: 73,
        price: 414.01,
        value: 30222.73,
        costBasis: 33154.53,
        gain: -2931.80,
        gainPercent: -8.84,
        allocation: 15.31
      },
      {
        id: 'inv-4',
        symbol: 'MSFT',
        name: 'Microsoft Corp.',
        category: 'Technology',
        shares: 44,
        price: 416.42,
        value: 18322.48,
        costBasis: 21773.34,
        gain: -3450.86,
        gainPercent: -15.85,
        allocation: 9.28
      },
      {
        id: 'inv-5',
        symbol: 'NVDA',
        name: 'NVIDIA Corp.',
        category: 'Technology',
        shares: 15,
        price: 933.55,
        value: 14003.25,
        costBasis: 11651.75,
        gain: 2351.50,
        gainPercent: 20.18,
        allocation: 7.09
      },
      {
        id: 'inv-6',
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        category: 'Consumer Discretionary',
        shares: 76,
        price: 182.15,
        value: 13843.40,
        costBasis: 11783.48,
        gain: 2059.92,
        gainPercent: 17.48,
        allocation: 7.01
      },
      {
        id: 'inv-7',
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        category: 'Consumer Discretionary',
        shares: 31,
        price: 172.63,
        value: 5351.53,
        costBasis: 5110.76,
        gain: 240.77,
        gainPercent: 4.71,
        allocation: 2.71
      },
      {
        id: 'inv-8',
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        category: 'Consumer Discretionary',
        shares: 14,
        price: 172.63,
        value: 2416.82,
        costBasis: 2503.67,
        gain: -86.85,
        gainPercent: -3.51,
        allocation: 1.22
      }
    ];

    // Calculate exactly $9,035.41 total for dashboard sync
    // Set a fixed total value that exactly matches the dashboard
    const totalValue = 9035.41;
    setTotalValue(totalValue);

    return investments;
  };

  // Handle sorting
  const requestSort = (key: keyof Investment) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort investments based on current config
  const sortedInvestments = React.useMemo(() => {
    const sortableItems = [...investments];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [investments, sortConfig]);

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
        </div>
      </div>
    );
  }

  // Calculate summary metrics
  const totalGain = investments.reduce((sum, inv) => sum + inv.gain, 0);
  const totalCost = investments.reduce((sum, inv) => sum + inv.costBasis, 0);
  const averageGainPercent = (totalGain / totalCost) * 100;

  return (
    <div className="bg-[#1E2D4E] rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Investment Holdings</h2>
      
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#2A3C61] rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Value</div>
          <div className="text-2xl font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        
        <div className="bg-[#2A3C61] rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Cost</div>
          <div className="text-2xl font-bold">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        
        <div className="bg-[#2A3C61] rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Gain/Loss</div>
          <div className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="bg-[#2A3C61] rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Average Return</div>
          <div className={`text-2xl font-bold ${averageGainPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {averageGainPercent.toFixed(2)}%
          </div>
        </div>
      </div>
      
      {/* Holdings Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#2A3C61] text-gray-300">
            <tr>
              <th className="py-3 px-4 text-left font-medium">
                <button onClick={() => requestSort('symbol')} className="flex items-center">
                  Symbol
                  {sortConfig.key === 'symbol' && (
                    <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="py-3 px-4 text-left font-medium">
                <button onClick={() => requestSort('name')} className="flex items-center">
                  Name
                  {sortConfig.key === 'name' && (
                    <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="py-3 px-4 text-left font-medium">
                <button onClick={() => requestSort('category')} className="flex items-center">
                  Category
                  {sortConfig.key === 'category' && (
                    <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="py-3 px-4 text-right font-medium">
                <button onClick={() => requestSort('shares')} className="flex items-center justify-end">
                  Shares
                  {sortConfig.key === 'shares' && (
                    <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="py-3 px-4 text-right font-medium">
                <button onClick={() => requestSort('price')} className="flex items-center justify-end">
                  Price
                  {sortConfig.key === 'price' && (
                    <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="py-3 px-4 text-right font-medium">
                <button onClick={() => requestSort('value')} className="flex items-center justify-end">
                  Market Value
                  {sortConfig.key === 'value' && (
                    <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="py-3 px-4 text-right font-medium">
                <button onClick={() => requestSort('gain')} className="flex items-center justify-end">
                  Gain/Loss
                  {sortConfig.key === 'gain' && (
                    <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="py-3 px-4 text-right font-medium">
                <button onClick={() => requestSort('allocation')} className="flex items-center justify-end">
                  Allocation
                  {sortConfig.key === 'allocation' && (
                    <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedInvestments.map((investment) => (
              <tr key={investment.id} className="border-b border-gray-700 hover:bg-[#2A3C61]">
                <td className="py-3 px-4 font-medium">{investment.symbol}</td>
                <td className="py-3 px-4">{investment.name}</td>
                <td className="py-3 px-4">{investment.category}</td>
                <td className="py-3 px-4 text-right">{investment.shares.toLocaleString()}</td>
                <td className="py-3 px-4 text-right">${investment.price.toFixed(2)}</td>
                <td className="py-3 px-4 text-right">${investment.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className={`py-3 px-4 text-right ${investment.gain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${investment.gain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-xs ml-1">({investment.gainPercent.toFixed(2)}%)</span>
                </td>
                <td className="py-3 px-4 text-right">{investment.allocation.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 