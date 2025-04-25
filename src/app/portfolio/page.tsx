'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  RefreshCw,
  Edit2,
  Download,
  Plus,
  PlusCircle,
  CheckSquare,
  Flag,
  LineChart,
  Share2,
  Edit,
  MinusCircle,
  Calendar,
  DollarSign,
  ArrowDown,
  ArrowUp,
  BarChart2,
  FileText,
  AlertTriangle
} from 'lucide-react'

// Import our custom components
import NetWorthChart from '@/components/dashboard/NetWorthChart';
import DonutChart from '@/components/dashboard/DonutChart';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import AiAssistantPanel from '@/components/dashboard/AiAssistantPanel';

// Error boundary component for better error handling
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Updated chart data points for the line graph with more detailed data
interface DataPoint {
  date: Date;
  value: number;
}

const chartData: DataPoint[] = [
  { date: new Date('2024-06-01'), value: 1000 },
  { date: new Date('2024-06-15'), value: 1500 },
  { date: new Date('2024-07-01'), value: 2000 },
  { date: new Date('2024-07-15'), value: 1800 },
  { date: new Date('2024-08-01'), value: 2200 },
  { date: new Date('2024-08-15'), value: 2100 },
  { date: new Date('2024-09-01'), value: 2500 },
  { date: new Date('2024-09-15'), value: 3000 },
  { date: new Date('2024-10-01'), value: 3200 },
  { date: new Date('2024-10-15'), value: 4000 },
  { date: new Date('2024-11-01'), value: 4500 },
  { date: new Date('2024-11-15'), value: 5000 },
  { date: new Date('2024-12-01'), value: 5500 },
  { date: new Date('2024-12-15'), value: 6000 },
  { date: new Date('2025-01-01'), value: 6500 },
  { date: new Date('2025-01-15'), value: 7000 },
  { date: new Date('2025-02-01'), value: 7200 },
  { date: new Date('2025-02-15'), value: 7100 },
  { date: new Date('2025-03-01'), value: 7300 },
  { date: new Date('2025-03-15'), value: 7400 },
  { date: new Date('2025-04-01'), value: 7500 },
  { date: new Date('2025-04-15'), value: 7516.61 }
];

// Define a type for holdings with sector information
interface Holding {
  name: string;
  symbol: string;
  quantity: number;
  value: number;
  sector?: string;
  accountType?: 'taxable' | 'retirement' | 'crypto' | 'cash';
}

// Add the holdings data with sector information
const holdingsData: Holding[] = [
  // Taxable account investments
  { name: "Tencent", symbol: "TCEHY", quantity: 2, value: 111.84, sector: "Communication Services", accountType: "taxable" },
  { name: "Taiwan Semiconductor", symbol: "TSM", quantity: 2.17, value: 323.89, sector: "Technology", accountType: "taxable" },
  { name: "ASML Holding NV", symbol: "ASML", quantity: 1.04, value: 667.48, sector: "Technology", accountType: "taxable" },
  { name: "Morgan Stanley CD (4.2%)", symbol: "CD", quantity: 1, value: 2000.00, sector: "Fixed Income", accountType: "taxable" },
  { name: "BlackRock Technology Opportuni", symbol: "BGSAX", quantity: 1, value: 57.38, sector: "Technology", accountType: "taxable" },
  { name: "Berkshire Hathaway B", symbol: "BRK.B", quantity: 2, value: 584.65, sector: "Financials", accountType: "taxable" },
  { name: "Caterpillar", symbol: "CAT", quantity: 2, value: 378.74, sector: "Industrials", accountType: "taxable" },
  { name: "iShares Gold Trust", symbol: "IAU", quantity: 1, value: 59.66, sector: "Commodities", accountType: "taxable" },
  { name: "Northrop Grumman", symbol: "NOC", quantity: 1, value: 507.62, sector: "Industrials", accountType: "taxable" },
  { name: "Novo Nordisk ADR", symbol: "NVO", quantity: 1, value: 252.87, sector: "Healthcare", accountType: "taxable" },
  { name: "SPDR S&P 500 ETF", symbol: "SPY", quantity: 2, value: 310.10, sector: "Broad Market", accountType: "taxable" },
  { name: "Vanguard Dividend Appreciation", symbol: "VIG", quantity: 1, value: 192.36, sector: "Broad Market", accountType: "taxable" },
  { name: "Vanguard Total Stock Market ET", symbol: "VTI", quantity: 3, value: 465.21, sector: "Broad Market", accountType: "taxable" },
  { name: "Vanguard Growth ETF", symbol: "VUG", quantity: 2, value: 313.00, sector: "Broad Market", accountType: "taxable" },
  { name: "Consumer Discretionary SPDR", symbol: "XLY", quantity: 1, value: 155.05, sector: "Consumer Discretionary", accountType: "taxable" },
  { name: "Vistra Corp", symbol: "VST", quantity: 1, value: 50.00, sector: "Utilities", accountType: "taxable" },
  { name: "Vanguard Real Estate ETF", symbol: "VNQ", quantity: 2, value: 180.00, sector: "Real Estate", accountType: "taxable" },
  { name: "Health Care Select Sector SPDR", symbol: "XLV", quantity: 1, value: 100.00, sector: "Healthcare", accountType: "taxable" },
  { name: "Pacer Data & Infra REIT ETF", symbol: "SRVR", quantity: 5, value: 120.00, sector: "Real Estate", accountType: "taxable" },
  { name: "NVIDIA", symbol: "NVDA", quantity: 14, value: 1260.00, sector: "Technology", accountType: "taxable" },
  { name: "Lam Research", symbol: "LRCX", quantity: 1, value: 900.00, sector: "Technology", accountType: "taxable" },
  { name: "Kratos Defense", symbol: "KTOS", quantity: 8, value: 120.00, sector: "Industrials", accountType: "taxable" },
  { name: "Intel Corp", symbol: "INTC", quantity: 5, value: 185.00, sector: "Technology", accountType: "taxable" },
  { name: "Agrify Corp", symbol: "AGFY", quantity: 3, value: 5.00, sector: "Consumer Discretionary", accountType: "taxable" },
  { name: "MicroStrategy", symbol: "MSTR", quantity: 0, value: 0.00, sector: "Technology", accountType: "taxable" },
  { name: "Fundrise Portfolio", symbol: "Fundrise", quantity: 1, value: 1117.70, sector: "Real Estate", accountType: "taxable" },
  { name: "Bitcoin", symbol: "BTC", quantity: 0.05, value: 3000.00, sector: "Crypto", accountType: "crypto" },
  { name: "High-Yield Savings", symbol: "HYSA", quantity: 1, value: 12000.00, sector: "Cash", accountType: "cash" },
  
  // Retirement account investments
  { name: "BlackRock Equity Index Fund GG", symbol: "BEIFGG", quantity: 1, value: 16962.49, sector: "Broad Market", accountType: "retirement" },
  { name: "Large Cap Growth III Fund (AmerCentury)", symbol: "LCGFAC", quantity: 1, value: 16011.20, sector: "Large Cap Growth", accountType: "retirement" },
  { name: "American Funds Growth Fund of Amer R6", symbol: "RGAGX", quantity: 1, value: 10972.12, sector: "Large Cap Growth", accountType: "retirement" },
  { name: "Great-West Life Stock", symbol: "GWO", quantity: 1, value: 5478.62, sector: "Financials", accountType: "retirement" },
  { name: "BlackRock US Debt Index Fund L", symbol: "BRDIX", quantity: 1, value: 3137.62, sector: "Fixed Income", accountType: "retirement" },
  { name: "American Funds Capital World G/I R6", symbol: "RWIGX", quantity: 1, value: 3000.52, sector: "Global Equity", accountType: "retirement" },
  { name: "BlackRock Mid Capitalization Eqy Index J", symbol: "BMCIX", quantity: 1, value: 2681.10, sector: "Mid Cap", accountType: "retirement" },
  { name: "BlackRock Russell 2000 Index J", symbol: "BR2KX", quantity: 1, value: 2626.73, sector: "Small Cap", accountType: "retirement" },
  { name: "BlackRock MSCI EAFE Equity Index Fund M", symbol: "BEIFM", quantity: 1, value: 113.19, sector: "International", accountType: "retirement" },
  { name: "Mid Cap Growth / Artisan Partners Fund", symbol: "ARTMX", quantity: 1, value: 81.43, sector: "Mid Cap", accountType: "retirement" },
  { name: "Allspring Small Company Growth Inst", symbol: "WSCGX", quantity: 1, value: 40.15, sector: "Small Cap", accountType: "retirement" },
  { name: "American Beacon Small Cap Value Cl I CIT", symbol: "ABSCI", quantity: 1, value: 39.45, sector: "Small Cap", accountType: "retirement" },
  { name: "Allspring Special Mid Cap Value CIT E2", symbol: "ASMCE", quantity: 1, value: 39.10, sector: "Mid Cap", accountType: "retirement" },
  { name: "Capital Group EuroPacific Growth SA", symbol: "CEUSX", quantity: 1, value: 32.18, sector: "International", accountType: "retirement" },
  { name: "Empower Multi-Sector Bond Inst", symbol: "EMPBX", quantity: 1, value: 29.97, sector: "Fixed Income", accountType: "retirement" }
];

// Calculate total portfolio value from holdings
const calculateTotalPortfolioValue = () => {
  return holdingsData.reduce((total, holding) => total + holding.value, 0);
};

// Calculate sector allocations for the donut chart
const calculateSectorAllocations = () => {
  const sectors: { [key: string]: number } = {};
  
  // Sum values by sector
  holdingsData.forEach(holding => {
    const sector = holding.sector || 'Other';
    sectors[sector] = (sectors[sector] || 0) + holding.value;
  });
  
  // Convert to array and calculate percentages
  const totalValue = calculateTotalPortfolioValue();
  const allocations = Object.entries(sectors).map(([name, value]) => {
    return { name, value: Math.round((value / totalValue) * 100) };
  });
  
  // Sort by percentage (descending)
  return allocations.sort((a, b) => b.value - a.value);
};

// Generate color for each sector
const getSectorColors = () => {
  const colors = [
    '#4169E1', // Royal Blue
    '#9370DB', // Medium Purple
    '#20B2AA', // Light Sea Green
    '#3CB371', // Medium Sea Green
    '#FF6347', // Tomato
    '#6495ED', // Cornflower Blue
    '#A9A9A9', // Dark Gray
    '#FFD700', // Gold
    '#8A2BE2', // Blue Violet
    '#32CD32', // Lime Green
    '#FF4500', // Orange Red
    '#4682B4', // Steel Blue
    '#7B68EE', // Medium Slate Blue
    '#2E8B57', // Sea Green
    '#CD5C5C'  // Indian Red
  ];
  
  const sectorAllocations = calculateSectorAllocations();
  
  // Assign colors to sectors
  return sectorAllocations.map((sector, index) => ({
    ...sector,
    color: colors[index % colors.length]
  }));
};

// Updated portfolio data with calculations from holdings
const getPortfolioData = () => {
  const totalValue = calculateTotalPortfolioValue();
  const cash = holdingsData
    .filter(holding => holding.sector === 'Cash')
    .reduce((sum, holding) => sum + holding.value, 0);
  
  return {
    totalValue,
    cash,
    buyingPower: cash * 2, // Assume 2x leverage for buying power
    margin: cash,
    startValue: totalValue * 0.9, // Assume 10% growth from start
    endValue: totalValue,
    netCashFlow: totalValue * 0.7, // Assume 70% of value is from contributions
    returnRate: 13.92, // Using static value for now
    date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    startDate: 'Jan 1, 2024',
    endDate: new Date().toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  };
};

// Get allocations for donut chart
const getAllocationData = () => {
  return getSectorColors();
};

// Calculate tax implications from the portfolio
const calculateTaxData = () => {
  // Calculate dividends based on typical yield for different sectors
  const dividendYields: { [key: string]: number } = {
    'Technology': 0.005, // 0.5%
    'Healthcare': 0.015, // 1.5%
    'Financials': 0.025, // 2.5%
    'Utilities': 0.035, // 3.5%
    'Real Estate': 0.04, // 4%
    'Consumer Discretionary': 0.01, // 1%
    'Commodities': 0, // 0%
    'Fixed Income': 0.03, // 3%
    'Broad Market': 0.018, // 1.8%
    'Cash': 0.042, // 4.2% (high-yield savings)
    'Crypto': 0, // 0%
    'Industrials': 0.02, // 2%
    'Communication Services': 0.008, // 0.8%
    'International': 0.023, // 2.3%
    'Global Equity': 0.018, // 1.8%
    'Large Cap Growth': 0.007, // 0.7%
    'Mid Cap': 0.012, // 1.2%
    'Small Cap': 0.01 // 1%
  };
  
  // Calculate estimated annual dividend income
  const dividendIncome = holdingsData.reduce((total, holding) => {
    const sector = holding.sector || 'Other';
    const yield_ = dividendYields[sector] || 0.01; // default to 1%
    return total + (holding.value * yield_);
  }, 0);
  
  // Categorize holdings by tax treatment
  const taxableHoldings = holdingsData.filter(h => h.accountType === 'taxable');
  const retirementHoldings = holdingsData.filter(h => h.accountType === 'retirement');
  const cryptoHoldings = holdingsData.filter(h => h.accountType === 'crypto');
  
  // Calculate capital gains (assuming 10% avg price appreciation for taxable holdings, 15% for crypto)
  const shortTermGains = taxableHoldings.reduce((total, h) => total + (h.value * 0.03), 0); // 3% of value for short-term
  const longTermGains = taxableHoldings.reduce((total, h) => total + (h.value * 0.07), 0); // 7% of value for long-term
  const cryptoGains = cryptoHoldings.reduce((total, h) => total + (h.value * 0.15), 0); // 15% for crypto
  
  // Tax rates
  const shortTermRate = 0.32; // 32% tax rate
  const longTermRate = 0.15; // 15% tax rate
  const qualifiedDividendRate = 0.15; // 15% qualified dividend rate
  const cryptoRate = 0.32; // 32% crypto tax rate
  
  // Tax amounts
  const shortTermTax = shortTermGains * shortTermRate;
  const longTermTax = longTermGains * longTermRate;
  const dividendTax = dividendIncome * qualifiedDividendRate;
  const cryptoTax = cryptoGains * cryptoRate;
  const totalTax = shortTermTax + longTermTax + dividendTax + cryptoTax;
  
  // Find harvesting opportunities (positions with losses)
  const harvestingOpportunities = taxableHoldings
    .filter(h => Math.random() < 0.2) // Randomly select some holdings for demonstration
    .map(h => {
      const lossPercent = Math.random() * 0.1 + 0.05; // 5-15% loss
      const lossAmount = h.value * lossPercent;
      const taxSaving = lossAmount * shortTermRate;
      return {
        name: h.name,
        symbol: h.symbol,
        lossAmount: lossAmount,
        taxSaving: taxSaving
      };
    })
    .sort((a, b) => b.taxSaving - a.taxSaving) // Sort by potential tax savings
    .slice(0, 5); // Show top 5
  
  return {
    taxableValue: taxableHoldings.reduce((sum, h) => sum + h.value, 0),
    retirementValue: retirementHoldings.reduce((sum, h) => sum + h.value, 0),
    cryptoValue: cryptoHoldings.reduce((sum, h) => sum + h.value, 0),
    annualDividendIncome: dividendIncome,
    dividendTax,
    shortTermGains,
    longTermGains,
    cryptoGains,
    shortTermTax,
    longTermTax,
    cryptoTax,
    totalTax,
    harvestingOpportunities,
    currentYear: new Date().getFullYear(),
    taxDocuments: [
      { year: 2023, type: '1099-B', status: 'Completed', date: 'Feb 15, 2024' },
      { year: 2023, type: '1099-DIV', status: 'Completed', date: 'Feb 15, 2024' },
      { year: 2022, type: '1099-B', status: 'Completed', date: 'Feb 10, 2023' },
      { year: 2022, type: '1099-DIV', status: 'Completed', date: 'Feb 10, 2023' }
    ]
  };
};

// Tax & Profit Content
const TaxAndProfitContent = () => {
  const taxData = calculateTaxData();
  
  return (
    <div className="bg-[#172033] text-white p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Tax & Profit Overview</h2>
        <p className="text-gray-400">Current Tax Year: {taxData.currentYear}</p>
      </div>
      
      {/* Account Types and Tax Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1D2939] rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-400" />
            Taxable Accounts
          </h3>
          <div className="text-2xl font-bold">
            ${taxData.taxableValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-gray-400 text-sm mt-1">Subject to capital gains tax</div>
        </div>
        
        <div className="bg-[#1D2939] rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-400" />
            Retirement Accounts
          </h3>
          <div className="text-2xl font-bold">
            ${taxData.retirementValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-gray-400 text-sm mt-1">Tax-deferred or tax-free growth</div>
        </div>
        
        <div className="bg-[#1D2939] rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-purple-400" />
            Crypto Assets
          </h3>
          <div className="text-2xl font-bold">
            ${taxData.cryptoValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-gray-400 text-sm mt-1">Taxed as property</div>
        </div>
      </div>
      
      {/* Realized Gains and Income */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Realized Gains & Income (Est. {taxData.currentYear})</h3>
        <div className="bg-[#1D2939] rounded-lg overflow-hidden">
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium mb-3">Capital Gains</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400">Short-Term Gains</span>
                    <span className="text-green-400">${taxData.shortTermGains.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Est. Tax (32%)</span>
                    <span className="text-red-400">${taxData.shortTermTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400">Long-Term Gains</span>
                    <span className="text-green-400">${taxData.longTermGains.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Est. Tax (15%)</span>
                    <span className="text-red-400">${taxData.longTermTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400">Crypto Gains</span>
                    <span className="text-green-400">${taxData.cryptoGains.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Est. Tax (32%)</span>
                    <span className="text-red-400">${taxData.cryptoTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-3">Dividend Income</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400">Est. Annual Dividends</span>
                    <span className="text-green-400">${taxData.annualDividendIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Est. Tax (15%)</span>
                    <span className="text-red-400">${taxData.dividendTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Total Estimated Tax</span>
                    <span className="text-red-400 font-medium">${taxData.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tax Optimization Opportunities */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Tax Optimization Opportunities</h3>
        <div className="bg-[#1D2939] rounded-lg p-4">
          <h4 className="text-lg font-medium mb-3 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
            Tax Loss Harvesting Opportunities
          </h4>
          
          {taxData.harvestingOpportunities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Security</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Potential Loss</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Tax Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {taxData.harvestingOpportunities.map((opportunity, index) => (
                    <tr key={index} className="hover:bg-[#2D3748]">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{opportunity.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{opportunity.symbol}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-400">
                        -${opportunity.lossAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-400">
                        ${opportunity.taxSaving.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400">No tax loss harvesting opportunities identified at this time.</p>
          )}
          
          <div className="mt-4 text-sm text-gray-400">
            <p className="mb-2">
              <strong>Strategy:</strong> Consider selling securities with losses to offset capital gains and reduce your tax liability.
            </p>
            <p>
              <strong>Note:</strong> Be aware of wash sale rules when repurchasing similar securities.
            </p>
          </div>
        </div>
      </div>
      
      {/* Tax Documents */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Tax Documents</h3>
        <div className="bg-[#1D2939] rounded-lg p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tax Year</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Document</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {taxData.taxDocuments.map((doc, index) => (
                  <tr key={index} className="hover:bg-[#2D3748]">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{doc.year}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{doc.type}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-800 text-green-100">
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{doc.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      <button className="text-blue-400 hover:text-blue-300 flex items-center justify-end w-full">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>Download</span>
                      </button>
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
};

// Content components for different tabs
const InKindTransferContent = () => <div className="p-4">In-Kind Transfer content placeholder</div>;
const GoalSystemContent = () => <div className="p-4">Goals & Tracking content placeholder</div>;
const PortfolioSimulationContent = () => <div className="p-4">Simulation content placeholder</div>;

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [isLoading, setIsLoading] = useState(true);
  const [netWorthData, setNetWorthData] = useState<DataPoint[]>([]);
  const [portfolioData, setPortfolioData] = useState(getPortfolioData());
  const [allocationData, setAllocationData] = useState(getAllocationData());
  
  // Add state for holdings filtering and sorting
  const [holdingsFilter, setHoldingsFilter] = useState('');
  const [holdingsSortField, setHoldingsSortField] = useState<'name' | 'value'>('value');
  const [holdingsSortDirection, setHoldingsSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const timeframes = [
    { id: '1D', label: '1D' },
    { id: '1W', label: '1W' },
    { id: '1M', label: '1M' },
    { id: '3M', label: '3M' },
    { id: '6M', label: '6M' },
    { id: 'YTD', label: 'YTD' },
    { id: '1Y', label: '1Y' }
  ];
  
  // Simulate data loading
  useEffect(() => {
    const loadNetWorthData = async () => {
      try {
        // In a real app, you would fetch this data from an API
        // For now, we'll simulate loading with a timeout
        setTimeout(() => {
          setNetWorthData(chartData);
          setPortfolioData(getPortfolioData());
          setAllocationData(getAllocationData());
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading net worth data:', error);
        setIsLoading(false);
      }
    };
    
    loadNetWorthData();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#172033]">
        <LoadingSpinner size="large" color="#fff" />
      </div>
    );
  }
  
  // Add a function to render the Holdings tab content
  const renderHoldingsTab = () => {
    // Filter the holdings based on search
    const filteredHoldings = holdingsData.filter(holding => 
      holding.name.toLowerCase().includes(holdingsFilter.toLowerCase()) || 
      holding.symbol.toLowerCase().includes(holdingsFilter.toLowerCase())
    );
    
    // Sort the holdings
    const sortedHoldings = [...filteredHoldings].sort((a, b) => {
      if (holdingsSortField === 'name') {
        return holdingsSortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else {
        return holdingsSortDirection === 'asc' 
          ? a.value - b.value 
          : b.value - a.value;
      }
    });
    
    // Calculate total portfolio value
    const totalValue = holdingsData.reduce((sum, holding) => sum + holding.value, 0);
    
    return (
      <div className="bg-[#172033] text-white p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Holdings</h2>
          <p className="text-gray-400">Total Portfolio Value: ${totalValue.toLocaleString()}</p>
        </div>
        
        {/* Search and Sort Controls */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search holdings..."
              value={holdingsFilter}
              onChange={(e) => setHoldingsFilter(e.target.value)}
              className="bg-[#1D2939] text-white border border-gray-700 rounded-md p-2 pl-8 w-full md:w-64"
            />
            <svg className="absolute left-2 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">Sort by:</span>
            <button
              onClick={() => {
                setHoldingsSortField('name');
                if (holdingsSortField === 'name') {
                  setHoldingsSortDirection(holdingsSortDirection === 'asc' ? 'desc' : 'asc');
                } else {
                  setHoldingsSortDirection('asc');
                }
              }}
              className={`px-3 py-1 rounded ${
                holdingsSortField === 'name' ? 'bg-blue-600 text-white' : 'bg-[#1D2939] text-gray-300'
              }`}
            >
              Name {holdingsSortField === 'name' && (holdingsSortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                setHoldingsSortField('value');
                if (holdingsSortField === 'value') {
                  setHoldingsSortDirection(holdingsSortDirection === 'asc' ? 'desc' : 'asc');
                } else {
                  setHoldingsSortDirection('desc');
                }
              }}
              className={`px-3 py-1 rounded ${
                holdingsSortField === 'value' ? 'bg-blue-600 text-white' : 'bg-[#1D2939] text-gray-300'
              }`}
            >
              Value {holdingsSortField === 'value' && (holdingsSortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
        
        {/* Holdings Table */}
        <div className="bg-[#1D2939] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-[#1A202C]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    % of Portfolio
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sortedHoldings.map((holding, index) => {
                  const percentage = (holding.value / totalValue) * 100;
                  return (
                    <tr key={index} className="hover:bg-[#2D3748]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {holding.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {holding.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                        {holding.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white">
                        ${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                        {percentage.toFixed(2)}%
                        <div className="w-full bg-gray-700 h-1 mt-1 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-500 h-1 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  const renderContent = () => {
    switch(activeTab) {
      case 'tax':
        return <TaxAndProfitContent />;
      case 'transfers':
        return <InKindTransferContent />;
      case 'goals':
        return <GoalSystemContent />;
      case 'simulation':
        return <PortfolioSimulationContent />;
      case 'portfolio':
      default:
        return (
          <div className="space-y-8">
            {/* Portfolio Overview Card */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Portfolio Overview</h2>
                
                {/* Net Worth Chart - Using our NetWorthChart component */}
                <div className="mb-8">
                  <NetWorthChart 
                    data={netWorthData}
                    title="Net Worth History"
                    height={300}
                    timeframes={['1W', '1M', '3M', '6M', 'YTD', '1Y', 'All']}
                  />
                </div>
                
                {/* Portfolio Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Total Portfolio Value</div>
                    <div className="text-2xl font-bold">${portfolioData.totalValue.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">as of {portfolioData.date}</div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Cash Balance</div>
                    <div className="text-2xl font-bold">${portfolioData.cash.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">Available for trading</div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Buying Power</div>
                    <div className="text-2xl font-bold">${portfolioData.buyingPower.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">Including ${portfolioData.margin.toLocaleString()} margin</div>
                  </div>
                </div>
                
                {/* Performance Metrics */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Start Value</div>
                      <div className="font-medium">${portfolioData.startValue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{portfolioData.startDate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Current Value</div>
                      <div className="font-medium">${portfolioData.endValue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{portfolioData.endDate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Net Deposits</div>
                      <div className="font-medium">${portfolioData.netCashFlow.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Total contributions</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Net Return</div>
                      <div className={`font-medium ${portfolioData.returnRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {portfolioData.returnRate >= 0 ? '+' : ''}{portfolioData.returnRate}%
                      </div>
                      <div className="text-xs text-gray-500">Since inception</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Allocation and Holdings Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Sector Allocation</h2>
                <DonutChart data={allocationData} />
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Top Holdings</h2>
                  <Link href="#" className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold mr-3">
                        A
                      </div>
                      <div>
                        <div className="font-medium">AAPL</div>
                        <div className="text-sm text-gray-500">Apple Inc.</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$2,504.25</div>
                      <div className="text-sm text-green-600">+15.2%</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold mr-3">
                        M
                      </div>
                      <div>
                        <div className="font-medium">MSFT</div>
                        <div className="text-sm text-gray-500">Microsoft Corp.</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$1,982.00</div>
                      <div className="text-sm text-green-600">+8.7%</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold mr-3">
                        G
                      </div>
                      <div>
                        <div className="font-medium">GOOGL</div>
                        <div className="text-sm text-gray-500">Alphabet Inc.</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$1,653.75</div>
                      <div className="text-sm text-red-600">-2.3%</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-semibold mr-3">
                        A
                      </div>
                      <div>
                        <div className="font-medium">AMZN</div>
                        <div className="text-sm text-gray-500">Amazon.com Inc.</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$1,376.61</div>
                      <div className="text-sm text-green-600">+5.1%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Activity</h2>
                <div className="flex space-x-3 items-center">
                  <div className="text-sm text-gray-500">Filter:</div>
                  <select className="text-sm border border-gray-300 rounded px-2 py-1">
                    <option>All Activity</option>
                    <option>Trades</option>
                    <option>Dividends</option>
                    <option>Transfers</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Apr 24, 2025</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Buy</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        Bought 5 shares of NVDA @ $85.31
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600">-$426.55</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Apr 20, 2025</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Dividend</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        Dividend payment from AAPL
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">+$6.25</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Apr 15, 2025</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Deposit</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        Bank transfer deposit
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">+$1,000.00</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Apr 12, 2025</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Sell</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        Sold 10 shares of MSFT @ $378.12
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">+$3,781.20</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-center mt-4">
                <button className="text-sm text-blue-600 px-3 py-1 hover:bg-blue-50 rounded">
                  View All Activity
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="bg-[#172033] min-h-screen text-white">
        <div className="container mx-auto px-4 py-6">
          {/* Navigation Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-8 border-b border-gray-700">
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`pb-4 px-1 ${
                  activeTab === 'portfolio'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`pb-4 px-1 ${
                  activeTab === 'activity'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setActiveTab('holdings')}
                className={`pb-4 px-1 ${
                  activeTab === 'holdings'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Holdings
              </button>
              <button
                onClick={() => setActiveTab('funding')}
                className={`pb-4 px-1 ${
                  activeTab === 'funding'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Funding
              </button>
              <button
                onClick={() => setActiveTab('tax')}
                className={`pb-4 px-1 ${
                  activeTab === 'tax'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Tax & Profit
              </button>
              <button
                onClick={() => setActiveTab('transfers')}
                className={`pb-4 px-1 ${
                  activeTab === 'transfers'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Transfers
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className={`pb-4 px-1 ${
                  activeTab === 'goals'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Goals
              </button>
              <button
                onClick={() => setActiveTab('simulation')}
                className={`pb-4 px-1 ${
                  activeTab === 'simulation'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Simulation
              </button>
            </nav>
          </div>
          
          {/* Main Content */}
          <div>
            {activeTab === 'portfolio' && (
              <>
                <h2 className="text-2xl font-semibold mb-6">Stocks</h2>
                
                {/* Cash, Margin, Buying Power Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div>
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-2">Cash</span>
                      <div className="bg-gray-700 rounded-full w-4 h-4 flex items-center justify-center text-xs">?</div>
                    </div>
                    <div className="text-xl font-bold">${portfolioData.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-2">Margin</span>
                      <div className="bg-gray-700 rounded-full w-4 h-4 flex items-center justify-center text-xs">?</div>
                    </div>
                    <div className="text-xl font-bold text-blue-400">${portfolioData.margin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ›</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400">Total buying power</span>
                    <div className="text-xl font-bold">${portfolioData.buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  
                  <div className="md:col-span-3 flex justify-end">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                      Move money
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left side - Donut Chart */}
                  <div className="w-full lg:w-1/3">
                    <div className="bg-[#1D2939] rounded-lg p-6 h-full">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-1">${portfolioData.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="text-sm text-gray-400">as of {portfolioData.date}</div>
                      </div>
                      
                      <div className="mt-4">
                        <DonutChart 
                          data={allocationData} 
                          width={250} 
                          height={250} 
                          innerRadius={70} 
                          outerRadius={110} 
                          darkMode={true}
                        />
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="mt-6 grid grid-cols-5 gap-2">
                        <div className="flex flex-col items-center">
                          <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center mb-1">
                            <Plus className="h-6 w-6" />
                          </button>
                          <span className="text-xs text-gray-300">Buy</span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center mb-1">
                            <MinusCircle className="h-6 w-6" />
                          </button>
                          <span className="text-xs text-gray-300">Sell</span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center mb-1">
                            <RefreshCw className="h-6 w-6" />
                          </button>
                          <span className="text-xs text-gray-300">Rebalance</span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center mb-1">
                            <Edit className="h-6 w-6" />
                          </button>
                          <span className="text-xs text-gray-300">Edit</span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center mb-1">
                            <Share2 className="h-6 w-6" />
                          </button>
                          <span className="text-xs text-gray-300">Share</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right side - Line Chart */}
                  <div className="w-full lg:w-2/3">
                    <div className="bg-[#1D2939] rounded-lg p-6">
                      {/* Time Frame Buttons */}
                      <div className="flex justify-end mb-4">
                        {timeframes.map((tf) => (
                          <button
                            key={tf.id}
                            onClick={() => setSelectedTimeframe(tf.id)}
                            className={`px-2 py-1 text-xs rounded mx-1 ${
                              selectedTimeframe === tf.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {tf.label}
                          </button>
                        ))}
                      </div>
                      
                      {/* Net Worth Chart */}
                      <div className="h-64">
                        <NetWorthChart 
                          data={netWorthData}
                          title=""
                          height={256}
                          timeframes={['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y']}
                          darkMode={true}
                        />
                      </div>
                      
                      {/* Portfolio Performance Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div>
                          <div className="text-gray-400 text-sm">Starting value: {portfolioData.startDate}</div>
                          <div className="font-medium">${portfolioData.startValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                        
                        <div>
                          <div className="text-gray-400 text-sm">Ending value: {portfolioData.endDate}</div>
                          <div className="font-medium">${portfolioData.endValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                        
                        <div>
                          <div className="text-gray-400 text-sm">Net cash flow</div>
                          <div className="font-medium">${portfolioData.netCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                        
                        <div>
                          <div className="text-gray-400 text-sm">Money weighted rate of return</div>
                          <div className="font-medium text-red-500">↓ {portfolioData.returnRate}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'holdings' && renderHoldingsTab()}
            
            {/* ... keep other tab content ... */}
          </div>
        </div>
        
        {/* AI Assistant */}
        <AiAssistantPanel />
      </div>
    </ErrorBoundary>
  );
}
