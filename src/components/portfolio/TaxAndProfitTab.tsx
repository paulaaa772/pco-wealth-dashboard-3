'use client'

import React from 'react';

// Define a type for holdings (assuming it might be needed here, or import if defined globally)
// If Holding type is defined centrally, replace this with an import.
interface Holding {
  name: string;
  symbol: string;
  quantity: number;
  value: number;
  sector?: string;
  accountType?: 'taxable' | 'retirement' | 'crypto' | 'cash';
}

// This mock data needs to be accessible. Either pass as prop, import, or use context/state management.
// For now, defining it here for simplicity based on the original structure.
let holdingsData: Holding[] = [
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
const TaxAndProfitTab = () => {
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

export default TaxAndProfitTab; 