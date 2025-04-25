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
  MinusCircle
} from 'lucide-react'

// Import our custom components
import NetWorthChart from '@/components/dashboard/NetWorthChart';
import DonutChart from '@/components/dashboard/DonutChart';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import AiAssistantPanel from '@/components/dashboard/AiAssistantPanel';
import ActivityContentComponent from '@/components/dashboard/ActivityContent';

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

// Tax & Profit data calculations based on holdings
const calculateTaxData = () => {
  // Get current year
  const currentYear = new Date().getFullYear();

  // Calculate realized gains (simulated for now)
  const realizedGains = {
    shortTerm: -1250.35,
    longTerm: 3427.89,
    total: 2177.54
  };

  // Get taxable holdings for potential tax-loss harvesting
  const taxableHoldings = holdingsData.filter(h => 
    h.accountType === 'taxable' && h.value > 0
  );

  // Find holdings with losses for tax-loss harvesting
  const holdingsWithLosses = [
    { 
      name: 'NVIDIA', 
      symbol: 'NVDA', 
      currentLoss: -362.30, 
      potentialSavings: 90.58,
      acquisition: '2023-12-15'
    },
    { 
      name: 'Caterpillar Inc.', 
      symbol: 'CAT', 
      currentLoss: -35.24, 
      potentialSavings: 8.81,
      acquisition: '2024-01-22'
    },
    { 
      name: 'Vanguard Real Estate ETF', 
      symbol: 'VNQ', 
      currentLoss: -11.68, 
      potentialSavings: 2.92,
      acquisition: '2023-11-05'
    }
  ];

  // Create wash sale warnings based on recent transactions
  const washSales = [
    { 
      symbol: 'AAPL', 
      amount: 320.45, 
      date: '2024-02-15', 
      replacement: '2024-02-28' 
    },
    { 
      symbol: 'NVDA', 
      amount: 145.78, 
      date: '2024-03-10', 
      replacement: '2024-03-21' 
    }
  ];

  // Tax documents
  const taxDocuments = [
    { year: currentYear - 1, type: '1099-B', status: 'Imported', date: `${currentYear}-02-15` },
    { year: currentYear - 1, type: '1099-DIV', status: 'Imported', date: `${currentYear}-02-15` },
    { year: currentYear - 2, type: '1099-B', status: 'Imported', date: `${currentYear-1}-02-10` },
    { year: currentYear - 2, type: '1099-DIV', status: 'Imported', date: `${currentYear-1}-02-10` }
  ];

  return {
    currentYear,
    realizedGains,
    washSales,
    holdingsWithLosses,
    taxDocuments
  };
};

// Content component for Tax & Profit tab
const TaxAndProfitContent = () => {
  const taxData = calculateTaxData();

  return (
    <div className="bg-[#172033] text-white p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{taxData.currentYear} Tax Planning</h2>
        <div className="flex space-x-4">
          <select className="bg-[#1D2939] text-white border border-gray-700 rounded-md px-3 py-2 text-sm">
            <option value={taxData.currentYear}>{taxData.currentYear}</option>
            <option value={taxData.currentYear-1}>{taxData.currentYear-1}</option>
            <option value={taxData.currentYear-2}>{taxData.currentYear-2}</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
            Export Tax Documents
          </button>
        </div>
      </div>
      
      {/* Realized Gains Section */}
      <div className="bg-[#1D2939] rounded-lg overflow-hidden">
        <div className="border-b border-gray-700 p-4">
          <h3 className="text-lg font-semibold">Realized Gains & Losses</h3>
        </div>
    <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <div className="text-sm text-gray-400">Short-Term Gains</div>
              <div className={`text-xl font-semibold ${taxData.realizedGains.shortTerm >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${taxData.realizedGains.shortTerm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-400">Holdings sold in less than 1 year</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-400">Long-Term Gains</div>
              <div className={`text-xl font-semibold ${taxData.realizedGains.longTerm >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${taxData.realizedGains.longTerm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-400">Holdings sold after 1+ year</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-400">Total Realized Gain/Loss</div>
              <div className={`text-xl font-semibold ${taxData.realizedGains.total >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${taxData.realizedGains.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-400">Realized in {taxData.currentYear}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wash Sales Warning Section */}
      {taxData.washSales.length > 0 && (
        <div className="bg-[#1D2939] rounded-lg overflow-hidden">
          <div className="border-b border-gray-700 p-4 bg-amber-900/20">
            <h3 className="text-lg font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Wash Sale Warnings
            </h3>
          </div>
          <div className="p-6">
            <p className="text-amber-300 mb-4">
              The following transactions may have resulted in wash sales. The IRS disallows loss deductions when you buy substantially identical securities within 30 days before or after selling at a loss.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Security</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sale Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Repurchase Date</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Amount Disallowed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {taxData.washSales.map((sale, index) => (
                    <tr key={index} className="hover:bg-gray-800/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{sale.symbol}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{sale.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{sale.replacement}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-400">${sale.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Tax Loss Harvesting Opportunities */}
      <div className="bg-[#1D2939] rounded-lg overflow-hidden">
        <div className="border-b border-gray-700 p-4 bg-green-900/20">
          <h3 className="text-lg font-semibold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Tax-Loss Harvesting Opportunities
          </h3>
        </div>
        <div className="p-6">
          <p className="text-gray-300 mb-4">
            The following securities currently have unrealized losses and may be candidates for tax-loss harvesting. Consider selling these positions to offset capital gains.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Security</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acquisition Date</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Current Loss</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Potential Tax Savings</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {taxData.holdingsWithLosses.map((holding, index) => (
                  <tr key={index} className="hover:bg-gray-800/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{holding.symbol}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{holding.acquisition}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-400">
                      ${Math.abs(holding.currentLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-400">
                      ${holding.potentialSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">
                        Harvest Loss
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Tax Documents */}
      <div className="bg-[#1D2939] rounded-lg overflow-hidden">
        <div className="border-b border-gray-700 p-4">
          <h3 className="text-lg font-semibold">Tax Documents</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tax Year</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Document Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Available Date</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {taxData.taxDocuments.map((doc, index) => (
                  <tr key={index} className="hover:bg-gray-800/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{doc.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{doc.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-900/50 text-green-400">{doc.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{doc.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <button className="text-blue-400 hover:text-blue-300 px-3 py-1 rounded text-xs">
                        Download PDF
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

// Data and helper functions for Transfer content
const getTransferData = () => {
  return {
    pendingTransfers: [
      {
        id: 'tr-001',
        type: 'deposit',
        amount: 2500,
        source: 'Bank of America (...4832)',
        destination: 'Individual Brokerage',
        status: 'pending',
        initiatedDate: '2024-06-15',
        estimatedCompletionDate: '2024-06-17'
      }
    ],
    recentTransfers: [
      {
        id: 'tr-105',
        type: 'deposit',
        amount: 1000,
        source: 'Bank of America (...4832)',
        destination: 'Individual Brokerage',
        status: 'completed',
        initiatedDate: '2024-05-28',
        completedDate: '2024-05-30'
      },
      {
        id: 'tr-104',
        type: 'withdrawal',
        amount: 500,
        source: 'Individual Brokerage',
        destination: 'Bank of America (...4832)',
        status: 'completed',
        initiatedDate: '2024-05-15',
        completedDate: '2024-05-17'
      },
      {
        id: 'tr-103',
        type: 'deposit',
        amount: 3000,
        source: 'Chase (...7645)',
        destination: 'IRA Account',
        status: 'completed',
        initiatedDate: '2024-04-12',
        completedDate: '2024-04-14'
      },
      {
        id: 'tr-102',
        type: 'transfer',
        amount: 1500,
        source: 'Individual Brokerage',
        destination: 'IRA Account',
        status: 'completed',
        initiatedDate: '2024-03-20',
        completedDate: '2024-03-22'
      }
    ],
    accounts: [
      { id: 'acc-1', name: 'Individual Brokerage', balance: 45782.61, type: 'brokerage' },
      { id: 'acc-2', name: 'IRA Account', balance: 32145.89, type: 'retirement' },
      { id: 'acc-3', name: 'Bank of America (...4832)', balance: 8245.32, type: 'bank' },
      { id: 'acc-4', name: 'Chase (...7645)', balance: 3520.14, type: 'bank' }
    ],
    externalBrokerages: [
      { name: 'Robinhood', logo: '/robinhood-logo.png' },
      { name: 'Fidelity', logo: '/fidelity-logo.png' },
      { name: 'Charles Schwab', logo: '/schwab-logo.png' },
      { name: 'Vanguard', logo: '/vanguard-logo.png' },
      { name: 'TD Ameritrade', logo: '/td-ameritrade-logo.png' },
      { name: 'E*TRADE', logo: '/etrade-logo.png' },
      { name: 'Interactive Brokers', logo: '/ibkr-logo.png' },
      { name: 'Webull', logo: '/webull-logo.png' }
    ]
  };
};

// Content component for Transfers tab
const InKindTransferContent = () => {
  const transferData = getTransferData();
  const [activeTransferTab, setActiveTransferTab] = useState('money');
  
  return (
    <div className="bg-[#172033] text-white p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Transfers & Funding</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
          View Transaction History
        </button>
      </div>
      
      {/* Transfer Type Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTransferTab('money')}
            className={`pb-4 ${
              activeTransferTab === 'money'
                ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Money Transfers
          </button>
          <button
            onClick={() => setActiveTransferTab('inkind')}
            className={`pb-4 ${
              activeTransferTab === 'inkind'
                ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            In-Kind Transfers
          </button>
        </div>
      </div>
      
      {/* Money Transfer Content */}
      {activeTransferTab === 'money' && (
        <div className="space-y-8">
          {/* Money Movement Card */}
          <div className="bg-[#1D2939] rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold">Move Money</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">From</label>
                    <select className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md px-3 py-2">
                      {transferData.accounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.name} (${account.balance.toLocaleString()})
                        </option>
          ))}
        </select>
      </div>

                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">To</label>
                    <select className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md px-3 py-2">
                      {transferData.accounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400">$</span>
                      <input
                        type="text"
                        placeholder="0.00"
                        className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md px-3 py-2 pl-7"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">Frequency</label>
                    <select className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md px-3 py-2">
                      <option>One-time</option>
                      <option>Weekly</option>
                      <option>Bi-weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">Date</label>
                    <input
                      type="date"
                      className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md">
                      Preview Transfer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pending Transfers */}
          {transferData.pendingTransfers.length > 0 && (
            <div className="bg-[#1D2939] rounded-lg overflow-hidden">
              <div className="border-b border-gray-700 p-4">
                <h3 className="text-lg font-semibold">Pending Transfers</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">From/To</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {transferData.pendingTransfers.map((transfer) => (
                        <tr key={transfer.id} className="hover:bg-gray-800/30">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {transfer.initiatedDate}
                            <div className="text-xs text-gray-500">Est. completion: {transfer.estimatedCompletionDate}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transfer.type === 'deposit' ? 'bg-green-900/30 text-green-400' : 
                              transfer.type === 'withdrawal' ? 'bg-red-900/30 text-red-400' : 
                              'bg-blue-900/30 text-blue-400'
                            }`}>
                              {transfer.type.charAt(0).toUpperCase() + transfer.type.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            <div>From: {transfer.source}</div>
                            <div>To: {transfer.destination}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-white">
                            ${transfer.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400">
                              Pending
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <button className="text-red-400 hover:text-red-300">
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Recent Transfers */}
          <div className="bg-[#1D2939] rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold">Recent Transfers</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">From/To</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {transferData.recentTransfers.map((transfer) => (
                      <tr key={transfer.id} className="hover:bg-gray-800/30">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {transfer.initiatedDate}
                          <div className="text-xs text-gray-500">Completed: {transfer.completedDate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transfer.type === 'deposit' ? 'bg-green-900/30 text-green-400' : 
                            transfer.type === 'withdrawal' ? 'bg-red-900/30 text-red-400' : 
                            'bg-blue-900/30 text-blue-400'
                          }`}>
                            {transfer.type.charAt(0).toUpperCase() + transfer.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div>From: {transfer.source}</div>
                          <div>To: {transfer.destination}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-white">
                          ${transfer.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* In-Kind Transfer Content */}
      {activeTransferTab === 'inkind' && (
        <div className="space-y-8">
          <div className="bg-[#1D2939] rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold">Transfer Your Portfolio</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-6">
                Transfer your securities from another brokerage to your account without selling. This preserves your cost basis and avoids tax consequences.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">Transfer From</label>
                    <select className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md px-3 py-2">
                      <option value="">Select a brokerage</option>
                      {transferData.externalBrokerages.map((brokerage, index) => (
                        <option key={index} value={brokerage.name}>
                          {brokerage.name}
                        </option>
                      ))}
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">Account Number at Other Brokerage</label>
                    <input
                      type="text"
                      placeholder="Enter account number"
                      className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">Transfer To</label>
                    <select className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md px-3 py-2">
                      {transferData.accounts
                        .filter(account => account.type === 'brokerage' || account.type === 'retirement')
                        .map(account => (
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">Transfer Type</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="full-transfer"
                          name="transfer-type"
                          className="text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-700 bg-[#2D3748]"
                          defaultChecked
                        />
                        <label htmlFor="full-transfer" className="text-white">Full Transfer (All securities and cash)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="partial-transfer"
                          name="transfer-type"
                          className="text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-700 bg-[#2D3748]"
                        />
                        <label htmlFor="partial-transfer" className="text-white">Partial Transfer (Select specific assets)</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md">
                      Start Transfer Process
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                      You'll need to upload account statements in the next step for verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1D2939] rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold">Transfer Progress</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-300 mb-4">You have no in-kind transfers in progress.</p>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                  Start a New Transfer
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1D2939] rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold">Common Questions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-white mb-2">How long does an in-kind transfer take?</h4>
                  <p className="text-gray-300 text-sm">
                    Most transfers complete within 5-7 business days. Complex portfolios or issues with the sending institution may cause delays.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-2">Are there any fees for transferring my account?</h4>
                  <p className="text-gray-300 text-sm">
                    We do not charge any fees for incoming transfers. However, your current brokerage may charge an outgoing transfer fee, typically between $50-$75.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-2">Can I trade during the transfer process?</h4>
                  <p className="text-gray-300 text-sm">
                    For full account transfers, your positions will be frozen at the sending institution during the transfer process. For partial transfers, only the specific assets being transferred may be restricted.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-2">What if I have unsupported securities?</h4>
                  <p className="text-gray-300 text-sm">
                    If we don't support certain securities in your current portfolio, you have options to liquidate them before transfer or we can help you transfer them elsewhere.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Data for investment goals
const getGoalsData = () => {
  return {
    investmentGoals: [
      {
        id: 'goal-1',
        name: 'Retirement',
        target: 1500000,
        current: 678450.33,
        targetDate: '2045-01-01',
        monthlyContribution: 1500,
        expectedReturn: 7.5,
        priority: 'high',
        type: 'retirement',
        description: 'Save for comfortable retirement with annual income of $80,000'
      },
      {
        id: 'goal-2',
        name: 'House Down Payment',
        target: 100000,
        current: 48750.25,
        targetDate: '2025-06-01',
        monthlyContribution: 2000,
        expectedReturn: 4.2,
        priority: 'high',
        type: 'purchase',
        description: 'Save for 20% down payment on a $500,000 home'
      },
      {
        id: 'goal-3',
        name: 'Education Fund',
        target: 180000,
        current: 25400.75,
        targetDate: '2035-08-01',
        monthlyContribution: 500,
        expectedReturn: 6.0,
        priority: 'medium',
        type: 'education',
        description: 'College fund for my daughter'
      },
      {
        id: 'goal-4',
        name: 'Emergency Fund',
        target: 30000,
        current: 18500.00,
        targetDate: '2024-12-31',
        monthlyContribution: 1000,
        expectedReturn: 2.5,
        priority: 'high',
        type: 'safety',
        description: '6 months of living expenses'
      }
    ],
    milestones: [
      {
        id: 'milestone-1',
        goalId: 'goal-1',
        name: 'First $100,000',
        target: 100000,
        completed: true,
        completedDate: '2020-05-15',
        description: 'Reached first $100K milestone'
      },
      {
        id: 'milestone-2',
        goalId: 'goal-1',
        name: 'Quarter Million',
        target: 250000,
        completed: true,
        completedDate: '2022-01-08',
        description: 'Reached $250K milestone'
      },
      {
        id: 'milestone-3',
        goalId: 'goal-1',
        name: 'Half Million',
        target: 500000,
        completed: true,
        completedDate: '2023-11-22',
        description: 'Reached $500K milestone'
      },
      {
        id: 'milestone-4',
        goalId: 'goal-1',
        name: 'Million Dollar Portfolio',
        target: 1000000,
        completed: false,
        projectedDate: '2030-03-15',
        description: 'Become a millionaire'
      },
      {
        id: 'milestone-5',
        goalId: 'goal-2',
        name: 'Halfway to Down Payment',
        target: 50000,
        completed: false,
        projectedDate: '2024-09-22',
        description: 'Reach 50% of down payment goal'
      }
    ],
    performanceTargets: [
      {
        id: 'perf-1',
        name: 'Annual Return',
        target: 8.0,
        current: 7.2,
        description: 'Target annual return for overall portfolio'
      },
      {
        id: 'perf-2',
        name: 'Savings Rate',
        target: 25,
        current: 22,
        description: 'Percentage of income saved for investments'
      },
      {
        id: 'perf-3',
        name: 'Expense Ratio',
        target: 0.25,
        current: 0.32,
        description: 'Average expense ratio for portfolio'
      }
    ]
  };
};

// Goals Content component
const GoalSystemContent = () => {
  const goalsData = getGoalsData();
  const [activeGoalTab, setActiveGoalTab] = useState('goals');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  
  // Calculate goal progress percentage
  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };
  
  // Calculate projected end value
  const calculateProjection = (goal: any) => {
    const currentDate = new Date();
    const targetDate = new Date(goal.targetDate);
    
    // Calculate months remaining
    const monthsRemaining = 
      (targetDate.getFullYear() - currentDate.getFullYear()) * 12 + 
      (targetDate.getMonth() - currentDate.getMonth());
    
    if (monthsRemaining <= 0) return goal.current;
    
    // Monthly growth rate (convert annual rate to monthly)
    const monthlyRate = (1 + goal.expectedReturn / 100) ** (1 / 12) - 1;
    
    // Calculate future value with monthly contributions
    let futureValue = goal.current;
    for (let i = 0; i < monthsRemaining; i++) {
      futureValue = futureValue * (1 + monthlyRate) + goal.monthlyContribution;
    }
    
    return Math.round(futureValue);
  };
  
  // Calculate projected completion date
  const calculateCompletionDate = (goal: any) => {
    if (goal.current >= goal.target) return 'Completed';
    
    const currentDate = new Date();
    const targetDate = new Date(goal.targetDate);
    
    // Get projected value
    const projectedValue = calculateProjection(goal);
    
    // If projected value will reach the target by the target date
    if (projectedValue >= goal.target) {
      // Calculate how many months it will take to reach the target
      // Monthly growth rate (convert annual rate to monthly)
      const monthlyRate = (1 + goal.expectedReturn / 100) ** (1 / 12) - 1;
      
      let futureValue = goal.current;
      let months = 0;
      
      while (futureValue < goal.target && months < 600) { // Cap at 50 years
        futureValue = futureValue * (1 + monthlyRate) + goal.monthlyContribution;
        months++;
      }
      
      // Calculate the date
      const completionDate = new Date(currentDate);
      completionDate.setMonth(completionDate.getMonth() + months);
      
      // Format the date
      return completionDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    } else {
      return 'Beyond target date';
    }
  };
  
  // Calculate how much additional monthly contribution is needed
  const calculateRequiredContribution = (goal: any) => {
    if (goal.current >= goal.target) return 0;
    
    const currentDate = new Date();
    const targetDate = new Date(goal.targetDate);
    
    // Calculate months remaining
    const monthsRemaining = 
      (targetDate.getFullYear() - currentDate.getFullYear()) * 12 + 
      (targetDate.getMonth() - currentDate.getMonth());
    
    if (monthsRemaining <= 0) {
      // Target date has passed, calculate for 12 months from now
      return Math.ceil((goal.target - goal.current) / 12);
    }
    
    // Monthly growth rate (convert annual rate to monthly)
    const monthlyRate = (1 + goal.expectedReturn / 100) ** (1 / 12) - 1;
    
    // Calculate using the formula for future value of an annuity
    // FV = C × [((1 + r)^n - 1) / r]
    // Solve for C (monthly contribution)
    // C = FV × [r / ((1 + r)^n - 1)]
    
    const futureValueNeeded = goal.target - goal.current * (1 + monthlyRate) ** monthsRemaining;
    const denominator = ((1 + monthlyRate) ** monthsRemaining - 1) / monthlyRate;
    
    const requiredContribution = Math.max(0, Math.ceil(futureValueNeeded / denominator));
    
    return requiredContribution;
  };
  
  return (
    <div className="bg-[#172033] text-white p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Investment Goals</h2>
        <div className="flex space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
            <PlusCircle className="h-4 w-4 inline mr-1" />
            Add New Goal
          </button>
        </div>
      </div>
      
      {/* Goal Navigation Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveGoalTab('goals')}
            className={`pb-4 ${
              activeGoalTab === 'goals'
                ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Goals
          </button>
          <button
            onClick={() => setActiveGoalTab('milestones')}
            className={`pb-4 ${
              activeGoalTab === 'milestones'
                ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Milestones
          </button>
          <button
            onClick={() => setActiveGoalTab('performance')}
            className={`pb-4 ${
              activeGoalTab === 'performance'
                ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Performance Targets
          </button>
        </div>
      </div>
      
      {/* Goals Tab Content */}
      {activeGoalTab === 'goals' && (
        <div className="space-y-8">
          {/* Goals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1D2939] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Total Goals</h3>
                <span className="bg-blue-900/30 text-blue-400 rounded-full px-3 py-1 text-sm font-medium">
                  {goalsData.investmentGoals.length}
                </span>
            </div>
              <div className="text-3xl font-bold mb-1">
                ${goalsData.investmentGoals.reduce((sum, goal) => sum + goal.target, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Combined target amount</div>
          </div>

            <div className="bg-[#1D2939] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Current Progress</h3>
                <span className="bg-green-900/30 text-green-400 rounded-full px-3 py-1 text-sm font-medium">
                  {Math.round(goalsData.investmentGoals.reduce((sum, goal) => sum + goal.current, 0) / 
                  goalsData.investmentGoals.reduce((sum, goal) => sum + goal.target, 0) * 100)}%
                </span>
              </div>
              <div className="text-3xl font-bold mb-1">
                ${goalsData.investmentGoals.reduce((sum, goal) => sum + goal.current, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Combined current amount</div>
            </div>
            
            <div className="bg-[#1D2939] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Monthly Contributions</h3>
                <span className="bg-purple-900/30 text-purple-400 rounded-full px-3 py-1 text-sm font-medium">
                  Active
                </span>
              </div>
              <div className="text-3xl font-bold mb-1">
                ${goalsData.investmentGoals.reduce((sum, goal) => sum + goal.monthlyContribution, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total monthly investment</div>
            </div>
          </div>
          
          {/* Goals List */}
          <div className="bg-[#1D2939] rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold">Your Investment Goals</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {goalsData.investmentGoals.map((goal) => {
                  const progress = calculateProgress(goal.current, goal.target);
                  const projectedValue = calculateProjection(goal);
                  const projectedPercent = calculateProgress(projectedValue, goal.target);
                  const projectedDate = calculateCompletionDate(goal);
                  const progressColor = progress < 25 ? 'bg-red-500' : progress < 50 ? 'bg-yellow-500' : progress < 75 ? 'bg-blue-500' : 'bg-green-500';
                  const projectedColor = projectedPercent < 25 ? 'bg-red-500/40' : projectedPercent < 50 ? 'bg-yellow-500/40' : projectedPercent < 75 ? 'bg-blue-500/40' : 'bg-green-500/40';
                  
                  return (
                    <div 
                      key={goal.id} 
                      className="bg-[#2D3748] rounded-lg p-5 hover:bg-[#353f53] transition-colors cursor-pointer"
                      onClick={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
              <div>
                          <h4 className="text-lg font-medium text-white">{goal.name}</h4>
                          <div className="text-sm text-gray-400 mt-1">Target: ${goal.target.toLocaleString()} by {new Date(goal.targetDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</div>
                </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">${goal.current.toLocaleString()}</div>
                          <div className="text-sm text-gray-400">Current value</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-4 mb-2">
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1 overflow-hidden">
                          {/* Actual progress */}
                          <div
                            className={`h-2.5 rounded-full ${progressColor}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                          {/* Projected progress (if greater than actual) */}
                          {projectedPercent > progress && (
                            <div
                              className={`h-2.5 rounded-r-full ${projectedColor} -mt-2.5`}
                              style={{ 
                                width: `${projectedPercent - progress}%`, 
                                marginLeft: `${progress}%` 
                              }}
                            ></div>
                          )}
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{progress}% funded</span>
                          <span>Projected: {projectedPercent}%</span>
                        </div>
                      </div>
                      
                      {/* Additional details when expanded */}
                      {selectedGoal === goal.id && (
                        <div className="mt-6 pt-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-gray-400">Target Date</div>
                                <div className="font-medium">{new Date(goal.targetDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-400">Priority</div>
                                <div className="font-medium capitalize">{goal.priority}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-400">Monthly Contribution</div>
                                <div className="font-medium">${goal.monthlyContribution.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-400">Expected Return</div>
                                <div className="font-medium">{goal.expectedReturn}%</div>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <div className="text-sm text-gray-400 mb-1">Description</div>
                              <p className="text-gray-300">{goal.description}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="text-sm text-gray-400 mb-1">Projected Completion</div>
                              <div className="font-medium">{projectedDate}</div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-gray-400 mb-1">Projected Value at Target Date</div>
                              <div className="font-medium">${projectedValue.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">
                                {projectedValue >= goal.target ? 
                                  `+$${(projectedValue - goal.target).toLocaleString()} over target` : 
                                  `-$${(goal.target - projectedValue).toLocaleString()} under target`}
                              </div>
                            </div>
                            
                            {projectedValue < goal.target && (
                              <div>
                                <div className="text-sm text-gray-400 mb-1">Recommended Monthly Contribution</div>
                                <div className="font-medium text-amber-400">
                                  ${calculateRequiredContribution(goal).toLocaleString()}
                                  <span className="text-gray-400 text-xs ml-2">
                                    (+${(calculateRequiredContribution(goal) - goal.monthlyContribution).toLocaleString()})
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            <div className="pt-2 flex space-x-2">
                              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded">
                                Edit Goal
                              </button>
                              <button className="px-3 py-1.5 bg-transparent hover:bg-gray-700 text-gray-300 border border-gray-600 text-sm rounded">
                                Add Milestone
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Milestones Tab Content */}
      {activeGoalTab === 'milestones' && (
        <div className="space-y-8">
          <div className="bg-[#1D2939] rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold">Milestones & Achievements</h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-4">Completed Milestones</h4>
                <div className="space-y-4">
                  {goalsData.milestones
                    .filter(milestone => milestone.completed)
                    .map((milestone) => {
                      const relatedGoal = goalsData.investmentGoals.find(g => g.id === milestone.goalId);
                      return (
                        <div key={milestone.id} className="bg-[#2D3748] rounded-lg p-4 flex items-center">
                          <div className="h-10 w-10 rounded-full bg-green-900/30 text-green-400 flex items-center justify-center mr-4">
                            <CheckSquare className="h-5 w-5" />
                          </div>
                          <div className="flex-grow">
                            <h5 className="font-medium text-white">{milestone.name}</h5>
                            <div className="text-sm text-gray-400">For goal: {relatedGoal?.name || 'Unknown'}</div>
              </div>
              <div className="text-right">
                            <div className="font-medium">${milestone.target.toLocaleString()}</div>
                            <div className="text-xs text-green-400">
                              Completed {milestone.completedDate && new Date(milestone.completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-4">Upcoming Milestones</h4>
                <div className="space-y-4">
                  {goalsData.milestones
                    .filter(milestone => !milestone.completed)
                    .map((milestone) => {
                      const relatedGoal = goalsData.investmentGoals.find(g => g.id === milestone.goalId);
                      const currentValue = relatedGoal?.current || 0;
                      const progress = calculateProgress(currentValue, milestone.target);
                      
                      return (
                        <div key={milestone.id} className="bg-[#2D3748] rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <div className="h-10 w-10 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center mr-4">
                              <Flag className="h-5 w-5" />
                            </div>
                            <div className="flex-grow">
                              <h5 className="font-medium text-white">{milestone.name}</h5>
                              <div className="text-sm text-gray-400">For goal: {relatedGoal?.name || 'Unknown'}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${milestone.target.toLocaleString()}</div>
                              <div className="text-xs text-blue-400">Expected {milestone.projectedDate}</div>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                              <div
                                className="h-2 rounded-full bg-blue-500"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>${currentValue.toLocaleString()} current</span>
                              <span>{progress}% progress</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Performance Targets Tab Content */}
      {activeGoalTab === 'performance' && (
        <div className="space-y-8">
          <div className="bg-[#1D2939] rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold">Portfolio Performance Targets</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {goalsData.performanceTargets.map((target) => {
                  const progress = (target.current / target.target) * 100;
                  const isOnTarget = target.current >= target.target;
                  const progressColor = isOnTarget ? 'bg-green-500' : 'bg-amber-500';
                  
                  return (
                    <div key={target.id} className="bg-[#2D3748] rounded-lg p-5">
                      <h4 className="text-lg font-medium text-white mb-3">{target.name}</h4>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <div className="text-3xl font-bold">{target.current}%</div>
                          <div className="text-sm text-gray-400">Current</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-medium">{target.target}%</div>
                          <div className="text-sm text-gray-400">Target</div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                          <div
                            className={`h-2 rounded-full ${progressColor}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {isOnTarget ? 'On target' : `${Math.round(progress)}% of target`}
                        </div>
                      </div>
                      
                      <div className="mt-4 text-sm text-gray-300">
                        {target.description}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-[#2D3748] rounded-lg p-6">
                <h4 className="text-lg font-medium mb-4">Performance Optimization Recommendations</h4>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center mr-3 mt-0.5">
                      <LineChart className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white mb-1">Consider rebalancing your portfolio</h5>
                      <p className="text-sm text-gray-300">Your portfolio has drifted 5.2% from your target allocation. A rebalance could improve your risk-adjusted returns.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-amber-900/30 text-amber-400 flex items-center justify-center mr-3 mt-0.5">
                      <RefreshCw className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white mb-1">Review high expense ratio funds</h5>
                      <p className="text-sm text-gray-300">You could save approximately $420 per year by switching to lower-cost index funds in your retirement accounts.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-green-900/30 text-green-400 flex items-center justify-center mr-3 mt-0.5">
                      <Download className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white mb-1">Increase your savings rate</h5>
                      <p className="text-sm text-gray-300">Increasing your savings rate from 22% to 25% would allow you to reach your retirement goal 2.5 years earlier.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Data for portfolio simulation
const getSimulationData = () => {
  return {
    initialCapital: 100000,
    monthlyContribution: 1500,
    yearsToProject: 30,
    expectedAnnualReturn: 8.5,
    inflationRate: 3.0,
    volatility: 15,
    retirementIncomeRequired: 80000,
    taxRate: 22,
    simulationRuns: 1000,
    assetAllocation: [
      { name: 'US Stocks', percentage: 60, expectedReturn: 9.5, volatility: 18 },
      { name: 'International Stocks', percentage: 15, expectedReturn: 8.0, volatility: 20 },
      { name: 'Bonds', percentage: 20, expectedReturn: 4.0, volatility: 5 },
      { name: 'Real Estate', percentage: 5, expectedReturn: 7.0, volatility: 12 }
    ],
    scenarioResults: {
      conservative: {
        finalAmount: 1287500,
        annualIncome: 64375,
        successRate: 82,
        path: [
          100000, 118500, 139120, 162124, 187689, 216040, 247441, 282182, 320582, 363001,
          410341, 462713, 520333, 583562, 653390, 731197, 817395, 913218, 1019957, 1138831,
          1270913, 1417303, 1579798, 1759988, 1959341, 2180274, 2425021, 2695747, 2994682, 3325500
        ].map((value, index) => ({ year: index, value }))
      },
      moderate: {
        finalAmount: 1825000,
        annualIncome: 91250,
        successRate: 68,
        path: [
          100000, 125000, 153750, 186563, 223594, 265469, 313008, 367359, 429716, 501344,
          583668, 677986, 785973, 909969, 1051964, 1214618, 1400855, 1613984, 1858582, 2139869,
          2462849, 2833276, 3259267, 3748158, 4308381, 4950638, 5683234, 6520719, 7483827, 8606400
        ].map((value, index) => ({ year: index, value }))
      },
      aggressive: {
        finalAmount: 2550000,
        annualIncome: 127500,
        successRate: 52,
        path: [
          100000, 132000, 172040, 223131, 288839, 373146, 480758, 617775, 792754, 1015837,
          1300272, 1664348, 2126364, 2713537, 3459289, 4407858, 5611205, 7134250, 9064501, 11511917,
          14609132, 18541597, 23491471, 29754245, 37670634, 47651352, 60271911, 76224568, 96436479, 121910725
        ].map((value, index) => ({ year: index, value }))
      }
    },
    retirementProbability: {
      early: 45,
      onTime: 78,
      delayed: 92
    },
    optimizationSuggestions: [
      { 
        id: 'opt-1', 
        name: 'Increase monthly contributions', 
        impact: 'high', 
        description: 'Increasing your monthly contribution from $1,500 to $2,000 would increase your success probability by 15%'
      },
      { 
        id: 'opt-2', 
        name: 'Adjust asset allocation', 
        impact: 'medium', 
        description: 'Increasing your stock allocation by 10% may improve long-term returns with manageable risk increase'
      },
      { 
        id: 'opt-3', 
        name: 'Reduce investment fees', 
        impact: 'medium', 
        description: 'Lowering your investment fees by 0.25% could increase your final portfolio value by $112,000'
      },
      { 
        id: 'opt-4', 
        name: 'Delay retirement', 
        impact: 'high', 
        description: 'Delaying retirement by 2 years would increase your success probability from 78% to 92%'
      }
    ]
  };
};

// Portfolio Simulation Content component
const PortfolioSimulationContent = () => {
  const simulationData = getSimulationData();
  const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [yearsToProject, setYearsToProject] = useState(simulationData.yearsToProject);
  const [monthlyContribution, setMonthlyContribution] = useState(simulationData.monthlyContribution);
  const [expectedReturn, setExpectedReturn] = useState(simulationData.expectedAnnualReturn);
  
  // Format currency function
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };
  
  // Calculate path for the selected scenario
  const getScenarioPath = (scenario: 'conservative' | 'moderate' | 'aggressive') => {
    return simulationData.scenarioResults[scenario].path;
  };
  
  // Generate labels for the chart
  const yearLabels = Array.from({ length: yearsToProject + 1 }, (_, i) => i.toString());
  
  return (
    <div className="bg-[#172033] text-white p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Portfolio Simulation</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
          Export Simulation
        </button>
      </div>
      
      {/* Simulation Parameters */}
      <div className="bg-[#1D2939] rounded-lg overflow-hidden">
        <div className="border-b border-gray-700 p-4">
          <h3 className="text-lg font-semibold">Simulation Parameters</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Initial Investment</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">$</span>
                  <input
                    type="text"
                    value={simulationData.initialCapital.toLocaleString()}
                    className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md p-2 pl-7"
                    readOnly
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Monthly Contribution</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md p-2 pl-7"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Years to Project</label>
                <input
                  type="range"
                  min={5}
                  max={40}
                  step={1}
                  value={yearsToProject}
                  onChange={(e) => setYearsToProject(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>5</span>
                  <span>{yearsToProject} years</span>
                  <span>40</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Expected Annual Return</label>
                <div className="relative">
                  <input
                    type="range"
                    min={3}
                    max={15}
                    step={0.5}
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>3%</span>
                    <span>{expectedReturn}%</span>
                    <span>15%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Inflation Rate</label>
                <div className="relative">
                  <span className="absolute right-3 top-2 text-gray-400">%</span>
                  <input
                    type="text"
                    value={simulationData.inflationRate}
                    className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md p-2 pr-7 text-right"
                    readOnly
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Risk Scenario</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedScenario('conservative')}
                    className={`py-2 rounded-md text-sm font-medium ${
                      selectedScenario === 'conservative'
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#2D3748] text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Conservative
                  </button>
                  <button
                    onClick={() => setSelectedScenario('moderate')}
                    className={`py-2 rounded-md text-sm font-medium ${
                      selectedScenario === 'moderate'
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#2D3748] text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Moderate
                  </button>
                  <button
                    onClick={() => setSelectedScenario('aggressive')}
                    className={`py-2 rounded-md text-sm font-medium ${
                      selectedScenario === 'aggressive'
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#2D3748] text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Aggressive
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-medium mb-3">Current Asset Allocation</h4>
                <div className="space-y-2">
                  {simulationData.assetAllocation.map((asset, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ 
                            backgroundColor: [
                              '#4169E1', // Royal Blue
                              '#20B2AA', // Light Sea Green
                              '#FFD700', // Gold
                              '#FF6347'  // Tomato
                            ][index % 4] 
                          }}
                        ></div>
                        <span className="text-sm text-gray-300">{asset.name}</span>
                      </div>
                      <div className="text-sm font-medium">{asset.percentage}%</div>
            </div>
          ))}
                </div>
        </div>

              <div>
                <h4 className="text-white font-medium mb-3">Key Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Monthly Savings Required:</span>
                    <span className="text-sm font-medium">${monthlyContribution.toLocaleString()}</span>
            </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Success Probability:</span>
                    <span className="text-sm font-medium">
                      {simulationData.scenarioResults[selectedScenario].successRate}%
                    </span>
          </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Potential Annual Income:</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(simulationData.scenarioResults[selectedScenario].annualIncome)}
                    </span>
        </div>
      </div>
    </div>
              
              <div className="pt-4">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md">
                  Run Custom Simulation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Projection Chart */}
      <div className="bg-[#1D2939] rounded-lg overflow-hidden">
        <div className="border-b border-gray-700 p-4">
          <h3 className="text-lg font-semibold">Portfolio Growth Projection</h3>
        </div>
        <div className="p-6">
          <div className="h-96 relative">
            {/* Placeholder for chart - in a real app, use a chart library like Chart.js or Recharts */}
            <div className="absolute inset-0 flex flex-col">
              <div className="flex-grow relative">
                {/* Conservative scenario path (lowest line) */}
                <div className="absolute bottom-0 left-0 right-0 h-full">
                  <svg width="100%" height="100%" viewBox={`0 0 ${yearsToProject} 100`} preserveAspectRatio="none">
                    <path
                      d={simulationData.scenarioResults.conservative.path
                        .slice(0, yearsToProject + 1)
                        .map((point, i) => {
                          const x = i;
                          // Scale to percentage of max value for visualization
                          const maxValue = Math.max(
                            ...simulationData.scenarioResults.aggressive.path
                              .slice(0, yearsToProject + 1)
                              .map(p => p.value)
                          );
                          const y = 100 - (point.value / maxValue * 95);
                          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        })
                        .join(' ')}
                      stroke="#4682B4" // Steel Blue
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                
                {/* Moderate scenario path (middle line) */}
                <div className="absolute bottom-0 left-0 right-0 h-full">
                  <svg width="100%" height="100%" viewBox={`0 0 ${yearsToProject} 100`} preserveAspectRatio="none">
                    <path
                      d={simulationData.scenarioResults.moderate.path
                        .slice(0, yearsToProject + 1)
                        .map((point, i) => {
                          const x = i;
                          // Scale to percentage of max value for visualization
                          const maxValue = Math.max(
                            ...simulationData.scenarioResults.aggressive.path
                              .slice(0, yearsToProject + 1)
                              .map(p => p.value)
                          );
                          const y = 100 - (point.value / maxValue * 95);
                          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        })
                        .join(' ')}
                      stroke="#20B2AA" // Light Sea Green
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                
                {/* Aggressive scenario path (highest line) */}
                <div className="absolute bottom-0 left-0 right-0 h-full">
                  <svg width="100%" height="100%" viewBox={`0 0 ${yearsToProject} 100`} preserveAspectRatio="none">
                    <path
                      d={simulationData.scenarioResults.aggressive.path
                        .slice(0, yearsToProject + 1)
                        .map((point, i) => {
                          const x = i;
                          // Scale to percentage of max value for visualization
                          const maxValue = Math.max(
                            ...simulationData.scenarioResults.aggressive.path
                              .slice(0, yearsToProject + 1)
                              .map(p => p.value)
                          );
                          const y = 100 - (point.value / maxValue * 95);
                          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        })
                        .join(' ')}
                      stroke="#FF6347" // Tomato
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                
                {/* Highlight selected scenario */}
                <div className="absolute bottom-0 left-0 right-0 h-full">
                  <svg width="100%" height="100%" viewBox={`0 0 ${yearsToProject} 100`} preserveAspectRatio="none">
                    <path
                      d={simulationData.scenarioResults[selectedScenario].path
                        .slice(0, yearsToProject + 1)
                        .map((point, i) => {
                          const x = i;
                          // Scale to percentage of max value for visualization
                          const maxValue = Math.max(
                            ...simulationData.scenarioResults.aggressive.path
                              .slice(0, yearsToProject + 1)
                              .map(p => p.value)
                          );
                          const y = 100 - (point.value / maxValue * 95);
                          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        })
                        .join(' ')}
                      stroke={
                        selectedScenario === 'conservative' ? '#4682B4' : 
                        selectedScenario === 'moderate' ? '#20B2AA' : '#FF6347'
                      }
                      strokeWidth="3"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
              
              {/* X-axis labels */}
              <div className="h-8 flex justify-between px-2">
                {[0, Math.floor(yearsToProject / 4), Math.floor(yearsToProject / 2), 
                  Math.floor(yearsToProject * 3 / 4), yearsToProject].map((year) => (
                  <div key={year} className="text-xs text-gray-400">Year {year}</div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            <div className="flex items-center">
              <div className="w-4 h-1 bg-[#4682B4] rounded mr-2"></div>
              <span className="text-sm text-gray-300">Conservative</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-1 bg-[#20B2AA] rounded mr-2"></div>
              <span className="text-sm text-gray-300">Moderate</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-1 bg-[#FF6347] rounded mr-2"></div>
              <span className="text-sm text-gray-300">Aggressive</span>
            </div>
          </div>
          
          {/* Projection Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-[#2D3748] rounded-lg p-5">
              <h4 className="text-lg font-medium text-white mb-3">Projected Final Amount</h4>
              <div className="text-3xl font-bold mb-1">
                {formatCurrency(simulationData.scenarioResults[selectedScenario].finalAmount)}
              </div>
              <div className="text-sm text-gray-400">After {yearsToProject} years</div>
            </div>
            
            <div className="bg-[#2D3748] rounded-lg p-5">
              <h4 className="text-lg font-medium text-white mb-3">Potential Annual Income</h4>
              <div className="text-3xl font-bold mb-1">
                {formatCurrency(simulationData.scenarioResults[selectedScenario].annualIncome)}
              </div>
              <div className="text-sm text-gray-400">Using 5% withdrawal rate</div>
            </div>
            
            <div className="bg-[#2D3748] rounded-lg p-5">
              <h4 className="text-lg font-medium text-white mb-3">Simulation Success Rate</h4>
              <div className="text-3xl font-bold mb-1">
                {simulationData.scenarioResults[selectedScenario].successRate}%
              </div>
              <div className="text-sm text-gray-400">Based on {simulationData.simulationRuns} simulations</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Retirement Age Analysis */}
      <div className="bg-[#1D2939] rounded-lg overflow-hidden">
        <div className="border-b border-gray-700 p-4">
          <h3 className="text-lg font-semibold">Retirement Age Analysis</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#2D3748] rounded-lg p-5">
              <h4 className="text-lg font-medium text-white mb-3">Early Retirement</h4>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-300">Age 55</span>
                <span className="text-right font-medium">
                  {simulationData.retirementProbability.early}% Success
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-yellow-500" 
                  style={{ width: `${simulationData.retirementProbability.early}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                Early retirement requires more aggressive saving and potentially higher investment risk.
              </p>
            </div>
            
            <div className="bg-[#2D3748] rounded-lg p-5">
              <h4 className="text-lg font-medium text-white mb-3">Normal Retirement</h4>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-300">Age 65</span>
                <span className="text-right font-medium">
                  {simulationData.retirementProbability.onTime}% Success
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-green-500" 
                  style={{ width: `${simulationData.retirementProbability.onTime}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                Standard retirement age with balanced saving and moderate investment risk.
              </p>
            </div>
            
            <div className="bg-[#2D3748] rounded-lg p-5">
              <h4 className="text-lg font-medium text-white mb-3">Delayed Retirement</h4>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-300">Age 70</span>
                <span className="text-right font-medium">
                  {simulationData.retirementProbability.delayed}% Success
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-500" 
                  style={{ width: `${simulationData.retirementProbability.delayed}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                Working longer significantly increases retirement security and potential income.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Optimization Recommendations */}
      <div className="bg-[#1D2939] rounded-lg overflow-hidden">
        <div className="border-b border-gray-700 p-4">
          <h3 className="text-lg font-semibold">Optimization Recommendations</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {simulationData.optimizationSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-[#2D3748] rounded-lg p-5">
                <div className="flex items-start">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-4 ${
                    suggestion.impact === 'high' 
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-blue-900/30 text-blue-400'
                  }`}>
                    {suggestion.impact === 'high' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-white">{suggestion.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        suggestion.impact === 'high'
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-blue-900/30 text-blue-400'
                      }`}>
                        {suggestion.impact.charAt(0).toUpperCase() + suggestion.impact.slice(1)} Impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-2">{suggestion.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Data for AI trading signals and activity
const getActivityData = () => {
  return {
    tradeSignals: [
      {
        id: 'signal-001',
        symbol: 'NVDA',
        action: 'BUY',
        price: 1105.38,
        timestamp: new Date().getTime() - 25 * 60 * 1000, // 25 min ago
        confidence: 89,
        reason: 'Strong momentum following AI chip demand surge',
        status: 'new'
      },
      {
        id: 'signal-002',
        symbol: 'MSFT',
        action: 'BUY',
        price: 417.95,
        timestamp: new Date().getTime() - 55 * 60 * 1000, // 55 min ago
        confidence: 78,
        reason: 'Positive market reaction to new cloud services pricing',
        status: 'new'
      },
      {
        id: 'signal-003',
        symbol: 'AAPL',
        action: 'SELL',
        price: 213.07,
        timestamp: new Date().getTime() - 2 * 60 * 60 * 1000, // 2 hours ago
        confidence: 72,
        reason: 'Technical resistance reached at 52-week high',
        status: 'executed',
        executionDetails: {
          executionPrice: 212.95,
          executionTime: new Date().getTime() - 1.8 * 60 * 60 * 1000,
          profit: -0.06 // percentage
        }
      },
      {
        id: 'signal-004',
        symbol: 'GOOGL',
        action: 'BUY',
        price: 175.24,
        timestamp: new Date().getTime() - 3 * 60 * 60 * 1000, // 3 hours ago
        confidence: 81,
        reason: 'Oversold condition after market overreaction to earnings',
        status: 'executed',
        executionDetails: {
          executionPrice: 175.38,
          executionTime: new Date().getTime() - 2.9 * 60 * 60 * 1000,
          profit: 1.24 // percentage
        }
      },
      {
        id: 'signal-005',
        symbol: 'TSLA',
        action: 'SELL',
        price: 248.58,
        timestamp: new Date().getTime() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
        confidence: 75,
        reason: 'Increasing competition in EV market and declining margins',
        status: 'executed',
        executionDetails: {
          executionPrice: 248.62,
          executionTime: new Date().getTime() - 0.95 * 24 * 60 * 60 * 1000,
          profit: 2.15 // percentage
        }
      }
    ],
    recentActivity: [
      {
        id: 'activity-001',
        type: 'AI_TRADE',
        symbol: 'GOOGL',
        action: 'BUY',
        quantity: 5,
        price: 175.38,
        timestamp: new Date().getTime() - 2.9 * 60 * 60 * 1000,
        totalValue: 876.90,
        status: 'completed'
      },
      {
        id: 'activity-002',
        type: 'AI_TRADE',
        symbol: 'AAPL',
        action: 'SELL',
        quantity: 8,
        price: 212.95,
        timestamp: new Date().getTime() - 1.8 * 60 * 60 * 1000,
        totalValue: 1703.60,
        status: 'completed'
      },
      {
        id: 'activity-003',
        type: 'MANUAL_TRADE',
        symbol: 'AMZN',
        action: 'BUY',
        quantity: 3,
        price: 182.27,
        timestamp: new Date().getTime() - 4.5 * 60 * 60 * 1000,
        totalValue: 546.81,
        status: 'completed'
      },
      {
        id: 'activity-004',
        type: 'DIVIDEND',
        symbol: 'VIG',
        action: 'DIVIDEND',
        quantity: null,
        price: null,
        timestamp: new Date().getTime() - 2 * 24 * 60 * 60 * 1000,
        totalValue: 12.48,
        status: 'completed'
      },
      {
        id: 'activity-005',
        type: 'DEPOSIT',
        symbol: null,
        action: 'DEPOSIT',
        quantity: null,
        price: null,
        timestamp: new Date().getTime() - 5 * 24 * 60 * 60 * 1000,
        totalValue: 1000.00,
        status: 'completed'
      }
    ],
    aiPerformance: {
      totalTrades: 27,
      winRate: 74,
      averageReturn: 2.3,
      totalProfit: 1842.65,
      lastMonth: {
        trades: 12,
        winRate: 83,
        profit: 978.32
      }
    }
  };
};

// Activity tab content component
const ActivityContent = () => {
  const activityData = getActivityData();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [signalAction, setSignalAction] = useState<{ [key: string]: string }>({});
  
  // Format timestamp to readable time
  const formatTimestamp = (timestamp: number) => {
    const now = new Date().getTime();
    const diffMs = now - timestamp;
    
    if (diffMs < 60 * 1000) {
      return 'Just now';
    } else if (diffMs < 60 * 60 * 1000) {
      const minutes = Math.floor(diffMs / (60 * 1000));
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffMs < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diffMs / (60 * 60 * 1000));
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };
  
  // Handle execution of AI trade signal
  const handleExecuteSignal = (signalId: string) => {
    setSignalAction(prev => ({
      ...prev,
      [signalId]: 'executing'
    }));
    
    // Simulate API call with timeout
    setTimeout(() => {
      setSignalAction(prev => ({
        ...prev,
        [signalId]: 'executed'
      }));
      
      // In a real app, you would call the brokerage API here
      // and update the activityData state with the real result
    }, 1500);
  };
  
  // Handle ignoring AI trade signal
  const handleIgnoreSignal = (signalId: string) => {
    setSignalAction(prev => ({
      ...prev,
      [signalId]: 'ignoring'
    }));
    
    // Simulate API call with timeout
    setTimeout(() => {
      setSignalAction(prev => ({
        ...prev,
        [signalId]: 'ignored'
      }));
    }, 800);
  };
  
  // Filter signals that haven't been acted upon
  const pendingSignals = activityData.tradeSignals.filter(signal => 
    signal.status === 'new' && 
    !signalAction[signal.id]
  );
  
  // Filter recent activity based on the selected filter
  const filteredActivity = activityData.recentActivity.filter(activity => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'ai' && activity.type === 'AI_TRADE') return true;
    if (selectedFilter === 'manual' && activity.type === 'MANUAL_TRADE') return true;
    if (selectedFilter === 'dividends' && activity.type === 'DIVIDEND') return true;
    if (selectedFilter === 'transfers' && 
       (activity.type === 'DEPOSIT' || activity.type === 'WITHDRAWAL')) return true;
    return false;
  });
  
  return (
    <div className="bg-[#172033] text-white p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Trading Activity</h2>
        <div className="flex space-x-3">
          <button 
            className={`px-3 py-1.5 rounded text-sm ${
              selectedFilter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#1D2939] text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setSelectedFilter('all')}
          >
            All Activity
          </button>
          <button 
            className={`px-3 py-1.5 rounded text-sm ${
              selectedFilter === 'ai' 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#1D2939] text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setSelectedFilter('ai')}
          >
            AI Trades
          </button>
          <button 
            className={`px-3 py-1.5 rounded text-sm ${
              selectedFilter === 'manual' 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#1D2939] text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setSelectedFilter('manual')}
          >
            Manual Trades
          </button>
        </div>
      </div>
      
      {/* AI Trade Signals Card */}
      {pendingSignals.length > 0 && (
        <div className="bg-[#1D2939] rounded-lg overflow-hidden">
          <div className="border-b border-gray-700 p-4 bg-blue-900/20">
            <h3 className="text-lg font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              AI Trade Signals
            </h3>
          </div>
          <div className="p-6">
            <p className="text-gray-300 mb-6">
              Our AI has detected the following trading opportunities based on market analysis, news sentiment, and technical indicators.
            </p>
            
            <div className="space-y-6">
              {pendingSignals.map((signal) => (
                <div key={signal.id} className="bg-[#2D3748] rounded-lg p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-medium text-white flex items-center">
                        {signal.action === 'BUY' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {signal.action} {signal.symbol}
                      </h4>
                      <div className="text-sm text-gray-400 mt-1">
                        AI confidence: 
                        <span className={`ml-1 ${
                          signal.confidence > 80 ? 'text-green-400' : 
                          signal.confidence > 65 ? 'text-yellow-400' : 
                          'text-red-400'
                        }`}>
                          {signal.confidence}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mt-0.5">
                        {formatTimestamp(signal.timestamp)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold">
                        ${signal.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">Current price</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 mb-4">
                    <div className="text-sm text-gray-300">
                      <span className="font-medium">Analysis:</span> {signal.reason}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    {signalAction[signal.id] === 'executing' ? (
                      <button 
                        className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center opacity-70 cursor-not-allowed"
                        disabled
                      >
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Executing...
                      </button>
                    ) : signalAction[signal.id] === 'executed' ? (
                      <button 
                        className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center"
                        disabled
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Executed
                      </button>
                    ) : signalAction[signal.id] === 'ignoring' ? (
                      <button 
                        className="px-4 py-2 bg-gray-600 text-white rounded-md opacity-70 cursor-not-allowed"
                        disabled
                      >
                        Ignoring...
                      </button>
                    ) : signalAction[signal.id] === 'ignored' ? (
                      <button 
                        className="px-4 py-2 bg-gray-600 text-white rounded-md opacity-70 cursor-not-allowed"
                        disabled
                      >
                        Ignored
                      </button>
                    ) : (
                      <>
                        <button 
                          className="px-4 py-2 bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-md"
                          onClick={() => handleIgnoreSignal(signal.id)}
                        >
                          Ignore
                        </button>
                        <button 
                          className={`px-4 py-2 ${signal.action === 'BUY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-md`}
                          onClick={() => handleExecuteSignal(signal.id)}
                        >
                          Execute {signal.action}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* AI Performance Metrics */}
      <div className="bg-[#1D2939] rounded-lg overflow-hidden">
        <div className="border-b border-gray-700 p-4">
          <h3 className="text-lg font-semibold">AI Trading Performance</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#2D3748] rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-green-400">{activityData.aiPerformance.winRate}%</div>
              <div className="text-xs text-gray-400 mt-1">Based on {activityData.aiPerformance.totalTrades} trades</div>
            </div>
            <div className="bg-[#2D3748] rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Average Return</div>
              <div className="text-2xl font-bold text-green-400">+{activityData.aiPerformance.averageReturn}%</div>
              <div className="text-xs text-gray-400 mt-1">Per executed signal</div>
            </div>
            <div className="bg-[#2D3748] rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total Profit</div>
              <div className="text-2xl font-bold text-green-400">${activityData.aiPerformance.totalProfit.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-1">Since activation</div>
            </div>
            <div className="bg-[#2D3748] rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Last Month</div>
              <div className="text-2xl font-bold text-green-400">+${activityData.aiPerformance.lastMonth.profit.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-1">{activityData.aiPerformance.lastMonth.winRate}% win rate ({activityData.aiPerformance.lastMonth.trades} trades)</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Table */}
      <div className="bg-[#1D2939] rounded-lg overflow-hidden">
        <div className="border-b border-gray-700 p-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Details</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-800/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatTimestamp(activity.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.type === 'AI_TRADE' ? 'bg-blue-900/30 text-blue-400' : 
                        activity.type === 'MANUAL_TRADE' ? 'bg-purple-900/30 text-purple-400' : 
                        activity.type === 'DIVIDEND' ? 'bg-green-900/30 text-green-400' : 
                        'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {activity.type === 'AI_TRADE' ? 'AI Trade' : 
                         activity.type === 'MANUAL_TRADE' ? 'Manual Trade' : 
                         activity.type === 'DIVIDEND' ? 'Dividend' : 
                         activity.type.charAt(0) + activity.type.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {activity.type.includes('TRADE') ? (
                        <div>
                          <span className={activity.action === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                            {activity.action}
                          </span>
                          {' '}
                          {activity.quantity} {activity.symbol} @ ${activity.price?.toFixed(2)}
                        </div>
                      ) : activity.type === 'DIVIDEND' ? (
                        <div>Dividend payment from {activity.symbol}</div>
                      ) : (
                        <div>{activity.type}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <span className={`
                        ${activity.action === 'BUY' || activity.type === 'DEPOSIT' ? 'text-red-400' : 'text-green-400'}
                      `}>
                        {activity.action === 'BUY' || activity.type === 'DEPOSIT' ? '-' : '+'} 
                        ${activity.totalValue.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                        Completed
                      </span>
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

const getFundingData = () => {
  return {
    accounts: [
      {
        id: 1,
        name: 'Primary Checking',
        bankName: 'Chase Bank',
        accountNumber: '****1234',
        status: 'Verified',
        type: 'ACH'
      },
      {
        id: 2,
        name: 'Savings Account',
        bankName: 'Bank of America',
        accountNumber: '****5678',
        status: 'Verified',
        type: 'ACH'
      }
    ],
    pendingDeposits: [
      {
        id: 101,
        date: 'May 15, 2025',
        amount: 500.00,
        status: 'Pending',
        estimatedCompletion: 'May 17, 2025',
        source: 'Primary Checking'
      }
    ],
    recentTransactions: [
      {
        id: 201,
        date: 'May 1, 2025',
        type: 'Deposit',
        amount: 1000.00,
        status: 'Completed',
        source: 'Primary Checking'
      },
      {
        id: 202,
        date: 'Apr 15, 2025',
        type: 'Withdrawal',
        amount: 250.00,
        status: 'Completed',
        destination: 'Primary Checking'
      },
      {
        id: 203,
        date: 'Apr 1, 2025',
        type: 'Deposit',
        amount: 1000.00,
        status: 'Completed',
        source: 'Primary Checking'
      }
    ]
  };
};

const FundingContent = () => {
  const fundingData = getFundingData();
  const portfolioData = getPortfolioData();
  
  return (
    <div className="space-y-8">
      {/* Header with Add Account Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Funding Sources</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center">
          <span className="mr-2">+</span>
          Add Bank Account
        </button>
      </div>
      
      {/* Linked Accounts */}
      <div className="bg-[#1D2939] rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Linked Accounts</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-gray-400 text-left">
                <th className="pb-3 font-medium">Account Name</th>
                <th className="pb-3 font-medium">Bank</th>
                <th className="pb-3 font-medium">Account Number</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {fundingData.accounts.map(account => (
                <tr key={account.id} className="text-gray-200">
                  <td className="py-4">{account.name}</td>
                  <td className="py-4">{account.bankName}</td>
                  <td className="py-4">{account.accountNumber}</td>
                  <td className="py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {account.status}
                    </span>
                  </td>
                  <td className="py-4">{account.type}</td>
                  <td className="py-4">
                    <button className="text-blue-400 hover:text-blue-300 mr-3">Edit</button>
                    <button className="text-red-400 hover:text-red-300">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Deposit/Withdraw Card */}
      <div className="bg-[#1D2939] rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Move Money</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Deposit Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-blue-400">Deposit Funds</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-1 text-sm">From Account</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white">
                  {fundingData.accounts.map(account => (
                    <option key={account.id} value={account.id}>{account.name} ({account.bankName})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1 text-sm">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 pl-7 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1 text-sm">Frequency</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white">
                  <option>One-time</option>
                  <option>Weekly</option>
                  <option>Bi-weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
                Deposit Funds
              </button>
            </div>
          </div>
          
          {/* Withdraw Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-orange-400">Withdraw Funds</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-1 text-sm">To Account</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white">
                  {fundingData.accounts.map(account => (
                    <option key={account.id} value={account.id}>{account.name} ({account.bankName})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1 text-sm">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 pl-7 text-white"
                  />
                </div>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-2">Available to withdraw: <span className="text-white font-medium">${portfolioData.cash.toLocaleString()}</span></p>
                <p className="text-gray-400 text-sm">Funds will be available in 2-3 business days</p>
              </div>
              
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded">
                Withdraw Funds
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pending Transactions */}
      {fundingData.pendingDeposits.length > 0 && (
        <div className="bg-[#1D2939] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Pending Transactions</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-gray-400 text-left">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Estimated Completion</th>
                  <th className="pb-3 font-medium">Source/Destination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {fundingData.pendingDeposits.map(transaction => (
                  <tr key={transaction.id} className="text-gray-200">
                    <td className="py-4">{transaction.date}</td>
                    <td className="py-4">Deposit</td>
                    <td className="py-4 text-green-400">${transaction.amount.toLocaleString()}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-4">{transaction.estimatedCompletion}</td>
                    <td className="py-4">{transaction.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Transaction History */}
      <div className="bg-[#1D2939] rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        
        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-gray-800 rounded text-gray-300 text-sm">All</button>
            <button className="px-3 py-1 bg-gray-800 rounded text-gray-300 text-sm">Deposits</button>
            <button className="px-3 py-1 bg-gray-800 rounded text-gray-300 text-sm">Withdrawals</button>
          </div>
          
          <div className="flex items-center">
            <span className="text-gray-400 text-sm mr-2">Date Range:</span>
            <select className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white">
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last 6 months</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-gray-400 text-left">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Source/Destination</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {fundingData.recentTransactions.map(transaction => (
                <tr key={transaction.id} className="text-gray-200">
                  <td className="py-4">{transaction.date}</td>
                  <td className="py-4">{transaction.type}</td>
                  <td className={`py-4 ${transaction.type === 'Deposit' ? 'text-green-400' : 'text-orange-400'}`}>
                    {transaction.type === 'Deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {transaction.status}
                    </span>
                  </td>
                  <td className="py-4">{transaction.source || transaction.destination}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex justify-center">
          <button className="text-blue-400 hover:text-blue-300 text-sm">
            View More Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

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
      case 'activity':
        return <ActivityContentComponent />;
      case 'funding':
        return <FundingContent />;
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
                          <div className="font-medium">${portfolioData.startValue.toLocaleString()}</div>
                        </div>
                        
                        <div>
                          <div className="text-gray-400 text-sm">Ending value: {portfolioData.endDate}</div>
                          <div className="font-medium">${portfolioData.endValue.toLocaleString()}</div>
                        </div>
                        
                        <div>
                          <div className="text-gray-400 text-sm">Net cash flow</div>
                          <div className="font-medium">${portfolioData.netCashFlow.toLocaleString()}</div>
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
            
            {activeTab === 'activity' && <ActivityContentComponent />}
            
            {activeTab === 'tax' && <TaxAndProfitContent />}
            
            {activeTab === 'transfers' && <InKindTransferContent />}
            
            {activeTab === 'goals' && <GoalSystemContent />}
            
            {activeTab === 'simulation' && <PortfolioSimulationContent />}
          </div>
        </div>
        
        {/* AI Assistant */}
        <AiAssistantPanel />
      </div>
    </ErrorBoundary>
  );
}


