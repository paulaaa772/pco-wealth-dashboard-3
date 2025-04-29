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

    // Create random investments
    const investments: Investment[] = [];
    let totalInvestmentValue = 0;

    for (let i = 0; i < 8; i++) {
      const stock = stocks[Math.floor(Math.random() * stocks.length)];
      const shares = Math.floor(5 + Math.random() * 95);
      const price = stock.price;
      const costBasisPerShare = price * (0.8 + Math.random() * 0.4); // Random cost basis around current price
      const value = shares * price;
      const costBasis = shares * costBasisPerShare;
      const gain = value - costBasis;
      const gainPercent = (gain / costBasis) * 100;

      totalInvestmentValue += value;

      investments.push({
        id: `inv-${i + 1}`,
        symbol: stock.symbol,
        name: stock.name,
        category: stock.category,
        shares,
        price,
        costBasis,
        value,
        gain,
        gainPercent,
        allocation: 0, // Will calculate after all investments are created
      });
    }

    // Add allocation percentages
    return investments.map(inv => ({
      ...inv,
      allocation: (inv.value / totalInvestmentValue) * 100
    }));
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