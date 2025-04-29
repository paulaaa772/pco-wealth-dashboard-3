'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Placeholder data structures (replace with real data/fetching later)
interface TaxLot {
  id: string;
  symbol: string;
  quantity: number;
  acquisitionDate: string;
  costBasis: number;
  currentValue: number;
  unrealizedGain: number;
  holdingPeriod: 'Short-Term' | 'Long-Term';
}

interface HarvestOpportunity {
  symbol: string;
  potentialLoss: number;
  washSaleWarning: boolean;
}

const TaxCenterPage: React.FC = () => {
  const taxYear = new Date().getFullYear() - 1
  
  const documents = [
    { name: '1099-B', status: 'Available', date: 'Feb 15, 2024' },
    { name: '1099-DIV', status: 'Available', date: 'Feb 15, 2024' },
    { name: '1099-INT', status: 'Available', date: 'Feb 15, 2024' },
    { name: 'Cost Basis', status: 'Available', date: 'Feb 15, 2024' },
  ]

  const taxLotMethods = [
    { name: 'FIFO', description: 'First In, First Out' },
    { name: 'LIFO', description: 'Last In, First Out' },
    { name: 'Specific Lot', description: 'Choose specific lots when selling' },
  ]

  // Mock data for demonstration
  const mockTaxLots: TaxLot[] = [
    {
      id: 'lot1', symbol: 'AAPL', quantity: 50, acquisitionDate: '2023-01-15',
      costBasis: 7500, currentValue: 9384, unrealizedGain: 1884, holdingPeriod: 'Long-Term'
    },
    {
      id: 'lot2', symbol: 'NVDA', quantity: 10, acquisitionDate: '2024-02-10',
      costBasis: 7000, currentValue: 9335, unrealizedGain: 2335, holdingPeriod: 'Short-Term'
    },
    {
      id: 'lot3', symbol: 'MSFT', quantity: 30, acquisitionDate: '2023-07-20',
      costBasis: 8722, currentValue: 12492, unrealizedGain: 3770, holdingPeriod: 'Short-Term'
    },
     {
      id: 'lot4', symbol: 'JNJ', quantity: 25, acquisitionDate: '2022-11-01',
      costBasis: 4053, currentValue: 3812, unrealizedGain: -241, holdingPeriod: 'Long-Term'
    },
  ];

  const mockHarvestOpportunities: HarvestOpportunity[] = [
    { symbol: 'JNJ', potentialLoss: 241, washSaleWarning: false },
    { symbol: 'BND', potentialLoss: 185, washSaleWarning: true },
  ];

  const realizedGainsYTD = 1250.75;

  return (
    <div className="min-h-screen bg-[#1B2B4B] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Tax Center</h1>
        
        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#2A3C61] rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Realized Gains YTD</h3>
            <p className={`text-2xl font-semibold ${realizedGainsYTD >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {realizedGainsYTD >= 0 ? '+' : ''}${realizedGainsYTD.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
            </p>
          </div>
          <div className="bg-[#2A3C61] rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Est. Tax Liability</h3>
            <p className="text-2xl font-semibold text-gray-300">$XXX.XX</p> 
            <p className="text-xs text-gray-500">(Coming Soon)</p>
          </div>
           <div className="bg-[#2A3C61] rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Harvestable Losses</h3>
             <p className="text-2xl font-semibold text-green-400">
               ${mockHarvestOpportunities.reduce((sum, opp) => sum + opp.potentialLoss, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </p>
          </div>
        </div>

        {/* Tax Lots Table */}
        <div className="bg-[#2A3C61] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Tax Lots</h2>
          <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-700">
               {/* ... table header ... */}
               <thead className="bg-[#1E2D4E]">
                 <tr>
                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
                   <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acquired</th>
                   <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Cost Basis</th>
                   <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Market Value</th>
                   <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Unrealized G/L</th>
                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Term</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-700">
                 {mockTaxLots.map((lot, index) => (
                   <tr key={lot.id} className={`${index % 2 === 0 ? 'bg-[#2A3C61]' : 'bg-[#233150]'}`}>
                     <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{lot.symbol}</td>
                     <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{lot.quantity}</td>
                     <td className="px-4 py-3 whitespace-nowrap text-sm">{lot.acquisitionDate}</td>
                     <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{lot.costBasis.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                     <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{lot.currentValue.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                     <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${lot.unrealizedGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                       {lot.unrealizedGain.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                     </td>
                     <td className="px-4 py-3 whitespace-nowrap text-sm">{lot.holdingPeriod}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
        
         {/* Tax Loss Harvesting Section */}
        <div className="bg-[#2A3C61] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Tax Loss Harvesting Opportunities</h2>
           {mockHarvestOpportunities.length > 0 ? (
             <div className="space-y-3">
               {mockHarvestOpportunities.map(opp => (
                 <div key={opp.symbol} className="flex justify-between items-center p-3 bg-[#1E2D4E] rounded">
                    <div>
                       <span className="font-medium">{opp.symbol}</span>
                       <span className="ml-2 text-red-400">(-{opp.potentialLoss.toLocaleString(undefined, { style: 'currency', currency: 'USD' })})</span>
                       {opp.washSaleWarning && <span className="ml-2 text-xs text-yellow-400 bg-yellow-900/30 px-1.5 py-0.5 rounded">Wash Sale Risk</span>}
                    </div>
                    <button className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">Harvest</button>
                 </div>
               ))}
             </div>
           ) : (
             <p className="text-gray-400">No significant loss harvesting opportunities detected.</p>
           )}
        </div>
        
        {/* Placeholder for Tax Documents */}
        <div className="bg-[#2A3C61] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Tax Documents</h2>
          <p className="text-gray-400">Your tax documents (e.g., 1099-B, 1099-DIV) will appear here when available.</p>
          {/* List documents when available */}
        </div>

      </div>
    </div>
  );
};

export default TaxCenterPage; 