'use client';

import React, { useState, useMemo } from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  PieChart,
  Pie,
  Cell,
  Line,
  LineChart,
  ComposedChart,
  Area
} from 'recharts';
import { format, addDays, addMonths, addYears, subYears, parseISO, isValid } from 'date-fns';
import TaxPlanner from './tax/TaxPlanner';

// Define interfaces for our tax-related data
interface TaxLot {
  id: string;
  symbol: string;
  purchaseDate: Date;
  quantity: number;
  costBasis: number;
  currentValue: number;
  unrealizedGain: number;
  holdingPeriod: 'short' | 'long';
}

interface HarvestingOpportunity {
  id: string;
  symbol: string;
  quantity: number;
  costBasis: number;
  currentValue: number;
  estimatedLoss: number;
  estimatedTaxSavings: number;
  recommendation: string;
}

interface CapitalGain {
  year: string;
  shortTerm: number;
  longTerm: number;
  total: number;
}

interface TaxCategory {
  name: string;
  value: number;
  color: string;
}

// Generate sample tax lots for demonstration
const generateSampleTaxLots = (): TaxLot[] => {
  const symbols = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'TSLA', 'META', 'NVDA', 'BRK.B', 'JPM', 'V'];
  const lots: TaxLot[] = [];
  
  // Generate a mix of lots with different holding periods and gain/loss scenarios
  for (let i = 0; i < 30; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const purchaseDate = subYears(new Date(), Math.random() * 4); // 0 to 4 years ago
    const holdingPeriod = (new Date().getTime() - purchaseDate.getTime()) > 365 * 24 * 60 * 60 * 1000 ? 'long' : 'short';
    const quantity = Math.floor(Math.random() * 100) + 1;
    const costBasisPerShare = Math.random() * 900 + 100; // $100 to $1000
    const costBasis = costBasisPerShare * quantity;
    
    // Generate current value with some randomness for gains and losses
    let currentValueMultiplier = 1;
    if (Math.random() > 0.6) {
      // 40% chance of gain
      currentValueMultiplier = 1 + (Math.random() * 0.5); // 0% to 50% gain
    } else {
      // 60% chance of loss
      currentValueMultiplier = 0.6 + (Math.random() * 0.4); // 0% to 40% loss
    }
    const currentValue = costBasis * currentValueMultiplier;
    const unrealizedGain = currentValue - costBasis;
    
    lots.push({
      id: `${symbol}-${i}`,
      symbol,
      purchaseDate,
      quantity,
      costBasis,
      currentValue,
      unrealizedGain,
      holdingPeriod
    });
  }
  
  return lots;
};

// Generate tax harvesting opportunities from lots with losses
const generateHarvestingOpportunities = (lots: TaxLot[]): HarvestingOpportunity[] => {
  // Filter for lots with losses
  const lotsWithLosses = lots.filter(lot => lot.unrealizedGain < 0);
  
  // Sort by size of loss (biggest loss first)
  lotsWithLosses.sort((a, b) => a.unrealizedGain - b.unrealizedGain);
  
  // Take top 5 loss opportunities
  return lotsWithLosses.slice(0, 5).map(lot => {
    const estimatedTaxRate = lot.holdingPeriod === 'short' ? 0.32 : 0.15; // Simplified tax rates
    const estimatedLoss = Math.abs(lot.unrealizedGain);
    const estimatedTaxSavings = estimatedLoss * estimatedTaxRate;
    
    return {
      id: lot.id,
      symbol: lot.symbol,
      quantity: lot.quantity,
      costBasis: lot.costBasis,
      currentValue: lot.currentValue,
      estimatedLoss,
      estimatedTaxSavings,
      recommendation: lot.holdingPeriod === 'short' 
        ? 'Consider selling to harvest short-term loss' 
        : 'Consider selling to harvest long-term loss'
    };
  });
};

// Generate historical and projected capital gains data
const generateCapitalGainsData = (): CapitalGain[] => {
  // Simplified historical data for demo
  const historicalYears = [
    { year: '2020', shortTerm: 8500, longTerm: 15200, total: 23700 },
    { year: '2021', shortTerm: 12400, longTerm: 31500, total: 43900 },
    { year: '2022', shortTerm: -5200, longTerm: 12300, total: 7100 },
    { year: '2023', shortTerm: 7800, longTerm: 25600, total: 33400 },
  ];
  
  // Projected years
  const currentYear = new Date().getFullYear();
  const projectedYears = [
    { year: currentYear.toString(), shortTerm: 9400, longTerm: 28700, total: 38100 },
    { year: (currentYear + 1).toString(), shortTerm: 11800, longTerm: 32600, total: 44400 },
    { year: (currentYear + 2).toString(), shortTerm: 14300, longTerm: 36900, total: 51200 },
  ];
  
  return [...historicalYears, ...projectedYears];
};

// Generate account tax categorization data
const generateTaxCategoryData = (): TaxCategory[] => {
  return [
    { name: 'Taxable', value: 450000, color: '#EF4444' },
    { name: 'Tax-Deferred', value: 680000, color: '#F59E0B' },
    { name: 'Tax-Free', value: 320000, color: '#10B981' }
  ];
};

export default function TaxAnalyticsDashboard() {
  const { manualAccounts, isLoading } = useManualAccounts();
  const [taxLots, setTaxLots] = useState<TaxLot[]>(generateSampleTaxLots());
  const [activeTab, setActiveTab] = useState<'harvesting' | 'gains' | 'optimization' | 'tax-planner'>('harvesting');
  const [taxYear, setTaxYear] = useState<string>(new Date().getFullYear().toString());
  
  // Calculate total portfolio value from accounts
  const totalPortfolioValue = useMemo(() => {
    return manualAccounts.reduce((sum, account) => sum + account.totalValue, 0);
  }, [manualAccounts]);
  
  // Generate harvesting opportunities
  const harvestingOpportunities = useMemo(() => {
    return generateHarvestingOpportunities(taxLots);
  }, [taxLots]);
  
  // Calculate total potential tax savings
  const totalPotentialSavings = useMemo(() => {
    return harvestingOpportunities.reduce((sum, opportunity) => sum + opportunity.estimatedTaxSavings, 0);
  }, [harvestingOpportunities]);
  
  // Generate capital gains data
  const capitalGainsData = useMemo(() => {
    return generateCapitalGainsData();
  }, []);
  
  // Generate tax category data
  const taxCategoryData = useMemo(() => {
    return generateTaxCategoryData();
  }, []);
  
  // Calculate realized vs unrealized gains
  const totalRealizedGains = useMemo(() => {
    const currentYearData = capitalGainsData.find(item => item.year === new Date().getFullYear().toString());
    return currentYearData ? currentYearData.total : 0;
  }, [capitalGainsData]);
  
  const totalUnrealizedGains = useMemo(() => {
    return taxLots.reduce((sum, lot) => sum + lot.unrealizedGain, 0);
  }, [taxLots]);
  
  // Calculate estimated tax for the current year
  const estimatedTax = useMemo(() => {
    const currentYearData = capitalGainsData.find(item => item.year === new Date().getFullYear().toString());
    if (!currentYearData) return 0;
    
    // Simplified tax calculation for demo
    return (currentYearData.shortTerm * 0.32) + (currentYearData.longTerm * 0.15);
  }, [capitalGainsData]);
  
  // Find lots that will convert from short to long term soon
  const upcomingLongTermLots = useMemo(() => {
    const today = new Date();
    const oneYearFromToday = addYears(today, 1);
    
    return taxLots
      .filter(lot => lot.holdingPeriod === 'short')
      .filter(lot => {
        const oneYearFromPurchase = addYears(lot.purchaseDate, 1);
        const daysRemaining = (oneYearFromPurchase.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return daysRemaining > 0 && daysRemaining <= 90; // Within next 90 days
      })
      .sort((a, b) => {
        const aOneYear = addYears(a.purchaseDate, 1);
        const bOneYear = addYears(b.purchaseDate, 1);
        return aOneYear.getTime() - bOneYear.getTime();
      });
  }, [taxLots]);
  
  const tabStyles = {
    base: "px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-200",
    active: "bg-blue-600 text-white rounded-md",
    inactive: "text-gray-400 hover:text-white hover:bg-[#344571] rounded-md"
  };
  
  if (isLoading) {
    return (
      <div className="bg-[#1E2D4E] rounded-lg p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[#1E2D4E] rounded-lg p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Tax Analytics</h2>
          <div className="flex space-x-2 bg-[#2A3C61] rounded-lg p-1">
            <button
              onClick={() => setActiveTab('harvesting')}
              className={`${tabStyles.base} ${activeTab === 'harvesting' ? tabStyles.active : tabStyles.inactive}`}
            >
              Tax-Loss Harvesting
            </button>
            <button
              onClick={() => setActiveTab('gains')}
              className={`${tabStyles.base} ${activeTab === 'gains' ? tabStyles.active : tabStyles.inactive}`}
            >
              Capital Gains
            </button>
            <button
              onClick={() => setActiveTab('optimization')}
              className={`${tabStyles.base} ${activeTab === 'optimization' ? tabStyles.active : tabStyles.inactive}`}
            >
              Tax Optimization
            </button>
            <button
              onClick={() => setActiveTab('tax-planner')}
              className={`${tabStyles.base} ${activeTab === 'tax-planner' ? tabStyles.active : tabStyles.inactive}`}
            >
              Tax Planner
            </button>
          </div>
        </div>
        
        {/* Summary Cards - show on all tabs except tax planner */}
        {activeTab !== 'tax-planner' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#2A3C61] rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-1">Potential Tax Savings</h4>
              <p className="text-2xl font-semibold text-white">
                ${totalPotentialSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            
            <div className="bg-[#2A3C61] rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-1">Unrealized Gains</h4>
              <p className={`text-2xl font-semibold ${totalUnrealizedGains >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${totalUnrealizedGains.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            
            <div className="bg-[#2A3C61] rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-1">Realized Gains (YTD)</h4>
              <p className={`text-2xl font-semibold ${totalRealizedGains >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${totalRealizedGains.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            
            <div className="bg-[#2A3C61] rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-1">Estimated Tax (YTD)</h4>
              <p className="text-2xl font-semibold text-white">
                ${estimatedTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        )}
        
        {/* Tax Planner Tab */}
        {activeTab === 'tax-planner' && (
          <TaxPlanner />
        )}
        
        {/* Tax-Loss Harvesting Tab */}
        {activeTab === 'harvesting' && (
          <div className="space-y-6">
            <div className="bg-[#2A3C61] rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-4">Tax-Loss Harvesting Opportunities</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cost Basis</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Current Value</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estimated Loss</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tax Savings</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {harvestingOpportunities.map((opportunity) => (
                      <tr key={opportunity.id}>
                        <td className="px-4 py-3 whitespace-nowrap font-medium">{opportunity.symbol}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{opportunity.quantity}</td>
                        <td className="px-4 py-3 whitespace-nowrap">${opportunity.costBasis.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-3 whitespace-nowrap">${opportunity.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-red-500">${opportunity.estimatedLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-green-500">${opportunity.estimatedTaxSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-white text-xs">
                            Harvest Loss
                          </button>
                        </td>
                      </tr>
                    ))}
                    {harvestingOpportunities.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                          No harvesting opportunities found at this time.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Wash Sale Warning */}
            <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-500 mb-2">Wash Sale Rule</h3>
              <p className="text-sm text-gray-300">
                Remember that the IRS wash sale rule prohibits selling an investment for a loss and replacing it with the same or a "substantially identical" investment within 30 days before or after the sale. Consider replacing harvested positions with similar but not identical investments.
              </p>
            </div>
            
            {/* Upcoming Long-Term Status */}
            <div className="bg-[#2A3C61] rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-4">Upcoming Long-Term Status Conversions</h3>
              <div className="space-y-4">
                {upcomingLongTermLots.map((lot) => {
                  const daysToLongTerm = Math.ceil((addYears(lot.purchaseDate, 1).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={lot.id} className="bg-[#1E2D4E] rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">{lot.symbol}</span>
                          <span className="ml-2 text-sm text-gray-400">{lot.quantity} shares</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          Purchased on {format(lot.purchaseDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-400">
                          Converts in <span className="font-bold">{daysToLongTerm}</span> days
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(addYears(lot.purchaseDate, 1), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {upcomingLongTermLots.length === 0 && (
                  <div className="text-center text-gray-400 py-6">
                    No positions are converting to long-term status in the next 90 days.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Capital Gains Tab */}
        {activeTab === 'gains' && (
          <div className="space-y-6">
            {/* Realized vs Unrealized Gains */}
            <div className="bg-[#2A3C61] rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-4">Capital Gains by Year</h3>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={capitalGainsData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="year" stroke="#9CA3AF" />
                    <YAxis
                      tickFormatter={(value) => `$${Math.abs(value) >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                      stroke="#9CA3AF"
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F9FAFB' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    />
                    <Legend />
                    <Bar dataKey="shortTerm" name="Short-Term" fill="#EF4444" barSize={30} />
                    <Bar dataKey="longTerm" name="Long-Term" fill="#10B981" barSize={30} />
                    <Line dataKey="total" name="Total" stroke="#FBBF24" strokeWidth={2} dot={{ stroke: '#FBBF24', strokeWidth: 2, r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Capital Gains Tax Rates Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#2A3C61] rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-4">Capital Gains Tax Rates</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-[#1E2D4E] rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Short-Term Capital Gains</h4>
                    <p className="text-sm text-gray-400">
                      Short-term capital gains (assets held for 1 year or less) are taxed as ordinary income at rates of 10%, 12%, 22%, 24%, 32%, 35%, or 37% depending on your total taxable income.
                    </p>
                  </div>
                  <div className="p-3 bg-[#1E2D4E] rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Long-Term Capital Gains</h4>
                    <p className="text-sm text-gray-400">
                      Long-term capital gains (assets held for more than 1 year) are generally taxed at more favorable rates: 0%, 15%, or 20% depending on your taxable income.
                    </p>
                  </div>
                  <div className="p-3 bg-[#1E2D4E] rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Net Investment Income Tax</h4>
                    <p className="text-sm text-gray-400">
                      An additional 3.8% Net Investment Income Tax may apply to both short-term and long-term capital gains if your modified adjusted gross income exceeds certain thresholds.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#2A3C61] rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-4">Tax Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taxCategoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {taxCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F9FAFB' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex justify-center mt-4">
                  {taxCategoryData.map((category) => (
                    <div key={category.name} className="flex items-center mx-2">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
                      <span className="text-xs">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tax Optimization Tab */}
        {activeTab === 'optimization' && (
          <div className="space-y-6">
            {/* Optimization Strategies */}
            <div className="bg-[#2A3C61] rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-4">Tax Optimization Strategies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#1E2D4E] rounded-lg">
                  <h4 className="text-md font-semibold mb-2">Tax-Loss Harvesting</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Offset capital gains by strategically selling investments at a loss while maintaining your overall investment strategy.
                  </p>
                  <button className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-white">
                    View Opportunities
                  </button>
                </div>
                
                <div className="p-4 bg-[#1E2D4E] rounded-lg">
                  <h4 className="text-md font-semibold mb-2">Tax-Aware Rebalancing</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Maintain your target asset allocation while minimizing tax impact by prioritizing tax-advantaged accounts for rebalancing.
                  </p>
                  <button className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-white">
                    Rebalance Portfolio
                  </button>
                </div>
                
                <div className="p-4 bg-[#1E2D4E] rounded-lg">
                  <h4 className="text-md font-semibold mb-2">Asset Location Optimization</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Place tax-inefficient investments in tax-advantaged accounts and tax-efficient investments in taxable accounts.
                  </p>
                  <button className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-white">
                    Optimize Location
                  </button>
                </div>
                
                <div className="p-4 bg-[#1E2D4E] rounded-lg">
                  <h4 className="text-md font-semibold mb-2">Tax Lot Selection</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    When selling partial positions, select specific tax lots to minimize tax impact based on your current tax situation.
                  </p>
                  <button className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-white">
                    Manage Tax Lots
                  </button>
                </div>
              </div>
            </div>
            
            {/* Tax Lot Selection */}
            <div className="bg-[#2A3C61] rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-4">Tax Lot Optimization</h3>
              <p className="text-sm text-gray-400 mb-4">
                When selling shares, the specific lots you choose can significantly impact your tax liability. Below are some common tax lot selection methods:
              </p>
              
              <div className="space-y-4">
                <div className="p-3 bg-[#1E2D4E] rounded-lg flex items-start">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium">First In, First Out (FIFO)</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Sells the oldest shares first. This is the default method used by most brokerages unless you specify otherwise.
                    </p>
                  </div>
                </div>
                
                <div className="p-3 bg-[#1E2D4E] rounded-lg flex items-start">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium">Highest Cost First</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Sells shares with the highest cost basis first, minimizing capital gains or maximizing capital losses.
                    </p>
                  </div>
                </div>
                
                <div className="p-3 bg-[#1E2D4E] rounded-lg flex items-start">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium">Tax-Sensitive Optimization</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Automatically selects lots based on your tax situation, considering holding periods, cost basis, and current year tax position.
                    </p>
                  </div>
                </div>
                
                <div className="p-3 bg-[#1E2D4E] rounded-lg flex items-start">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold">4</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium">Specific Identification</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Manually select specific lots when selling, giving you maximum control over tax consequences.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white">
                  Set Default Tax Lot Method
                </button>
              </div>
            </div>
            
            {/* Tax Planning Tips */}
            <div className="bg-[#2A3C61] rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-4">Tax Planning Tips</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-[#1E2D4E] rounded-lg">
                  <h4 className="font-medium mb-2">Charitable Giving</h4>
                  <p className="text-sm text-gray-400">
                    Consider donating appreciated securities instead of cash to maximize tax benefits.
                  </p>
                </div>
                
                <div className="p-3 bg-[#1E2D4E] rounded-lg">
                  <h4 className="font-medium mb-2">Tax-Loss Carryforward</h4>
                  <p className="text-sm text-gray-400">
                    Capital losses can offset gains and up to $3,000 of ordinary income per year, with excess carried forward.
                  </p>
                </div>
                
                <div className="p-3 bg-[#1E2D4E] rounded-lg">
                  <h4 className="font-medium mb-2">End-of-Year Planning</h4>
                  <p className="text-sm text-gray-400">
                    Review your tax situation in November/December to identify last-minute tax-saving opportunities.
                  </p>
                </div>
                
                <div className="p-3 bg-[#1E2D4E] rounded-lg">
                  <h4 className="font-medium mb-2">Retirement Contributions</h4>
                  <p className="text-sm text-gray-400">
                    Maximize tax-advantaged retirement accounts to reduce current taxable income.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 