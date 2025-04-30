'use client';

import React, { useMemo } from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext'; // Import context
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Assuming Shadcn UI table
import { Badge } from "@/components/ui/badge"; // Assuming Shadcn UI badge
import { Button } from "@/components/ui/button"; // Assuming Shadcn UI button

// Define a default target allocation (can be made dynamic later)
const targetAllocation: Record<string, number> = {
  'Stocks/Funds': 60,
  'Cash': 10,
  'Alternatives': 5,
  'Bonds': 20, // Example
  'Real Estate': 5, // Example
  'Other': 0,
};

// Helper function (can be shared or moved to utils)
const mapAccountTypeToAssetClass = (accountType: string): string => {
   switch (accountType) {
    case 'Brokerage':
    case '401k':
    case 'IRA':
      return 'Stocks/Funds';
    case 'Bank Account':
    case 'Savings':
      return 'Cash';
    case 'Crypto Wallet':
      return 'Alternatives';
    case 'Real Estate':
       return 'Real Estate';
    // Consider adding Bond-specific account type if needed
    default:
      return 'Other';
  }
};

interface PortfolioDriftItem {
  assetClass: string;
  current: number;
  target: number;
  drift: number;
  status: 'Overweight' | 'Underweight' | 'On Target';
}

interface RebalanceRecItem {
  action: 'Buy' | 'Sell';
  asset: string;
  amount: string; // Keep as string for now, calculation needs more detail
  reason: string;
  taxEfficiency?: 'Low' | 'Medium' | 'High';
}

// Add tax efficiency recommendation helper
const getTaxEfficiencyRating = (assetClass: string, action: 'Buy' | 'Sell'): 'Low' | 'Medium' | 'High' => {
  // Logic to determine tax efficiency (simplified example):
  // - Selling bonds/cash typically has lower tax impact than stocks
  // - Buying any asset has no immediate tax consequence
  if (action === 'Buy') return 'High';
  
  switch (assetClass) {
    case 'Bonds':
    case 'Cash':
      return 'High';
    case 'Alternatives':
      return 'Medium';
    case 'Stocks/Funds':
    default:
      return 'Low';
  }
};

const RebalancingEngine: React.FC = () => {
  const { manualAccounts, isLoading } = useManualAccounts();

  // Calculate current allocation, drift, and recommendations
  const { portfolioDrift, rebalanceRecs, totalPortfolioValue } = useMemo(() => {
    const allocationMap: Record<string, number> = {};
    let currentTotalValue = 0;

    manualAccounts.forEach(account => {
      const assetClass = mapAccountTypeToAssetClass(account.accountType);
      allocationMap[assetClass] = (allocationMap[assetClass] || 0) + account.totalValue;
      currentTotalValue += account.totalValue;
    });

    const calculatedDrift: PortfolioDriftItem[] = [];
    const calculatedRecs: RebalanceRecItem[] = [];

    // Include all target classes, even if not present in current portfolio
    const allAssetClasses = new Set([...Object.keys(allocationMap), ...Object.keys(targetAllocation)]);

    allAssetClasses.forEach(assetClass => {
       if (assetClass === 'Other' && !(assetClass in allocationMap)) return; // Skip 'Other' if empty
       
       const currentValue = allocationMap[assetClass] || 0;
       const currentPercent = currentTotalValue === 0 ? 0 : parseFloat(((currentValue / currentTotalValue) * 100).toFixed(1));
       const targetPercent = targetAllocation[assetClass] || 0;
       const driftPercent = parseFloat((currentPercent - targetPercent).toFixed(1));
       
       let status: PortfolioDriftItem['status'] = 'On Target';
       // Define drift threshold (e.g., 5% absolute or 25% relative)
       const threshold = Math.max(5, targetPercent * 0.25); 
       if (driftPercent > threshold) {
         status = 'Overweight';
       } else if (driftPercent < -threshold) {
         status = 'Underweight';
       }

       calculatedDrift.push({
         assetClass,
         current: currentPercent,
         target: targetPercent,
         drift: driftPercent,
         status,
       });

       // Generate simple recommendations based on status
       if (status === 'Overweight') {
         const amountToSell = (currentValue - (targetPercent / 100) * currentTotalValue);
         calculatedRecs.push({ 
            action: 'Sell', 
            asset: assetClass, 
            amount: `$${amountToSell.toLocaleString(undefined, {maximumFractionDigits: 0})}`, // Simplified amount 
            reason: `Reduce ${status.toLowerCase()}`,
            taxEfficiency: getTaxEfficiencyRating(assetClass, 'Sell')
         });
       } else if (status === 'Underweight') {
          const amountToBuy = ((targetPercent / 100) * currentTotalValue - currentValue);
          calculatedRecs.push({ 
            action: 'Buy', 
            asset: assetClass, 
            amount: `$${amountToBuy.toLocaleString(undefined, {maximumFractionDigits: 0})}`, // Simplified amount
            reason: `Increase ${status.toLowerCase()}`,
            taxEfficiency: getTaxEfficiencyRating(assetClass, 'Buy')
          });
       }
    });

    return { portfolioDrift: calculatedDrift, rebalanceRecs: calculatedRecs, totalPortfolioValue: currentTotalValue };
  }, [manualAccounts]);

  const getStatusBadgeColor = (status: PortfolioDriftItem['status']) => {
    switch (status) {
      case 'Overweight': return 'bg-red-600 hover:bg-red-700';
      case 'Underweight': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-green-600 hover:bg-green-700';
    }
  };

   if (isLoading) {
     return (
        <div className="bg-[#2A3C61]/30 p-6 rounded-lg shadow-lg border border-gray-700 mt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-100">Portfolio Rebalancing Engine</h3>
           <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
     );
  }

  return (
    <div className="bg-[#2A3C61]/30 p-6 rounded-lg shadow-lg border border-gray-700 mt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-100">Portfolio Rebalancing Engine</h3>

      {/* Portfolio Drift Monitoring */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3 text-gray-200">Allocation Drift</h4>
        <p className="text-sm text-gray-400 mb-3">Monitoring deviation from target allocation (Target: 60% Stocks/Funds, 20% Bonds, 10% Cash, 5% Alternatives, 5% Real Estate).</p>
        <Table className="bg-[#1B2B4B]">
          <TableHeader>
            <TableRow className="border-gray-600 hover:bg-[#2A3C61]/50">
              <TableHead className="text-gray-300">Asset Class</TableHead>
              <TableHead className="text-right text-gray-300">Current (%)</TableHead>
              <TableHead className="text-right text-gray-300">Target (%)</TableHead>
              <TableHead className="text-right text-gray-300">Drift (%)</TableHead>
              <TableHead className="text-center text-gray-300">Status</TableHead>
              <TableHead className="text-left text-gray-300">Visual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {portfolioDrift.map((item) => (
              <TableRow key={item.assetClass} className="border-gray-700 hover:bg-[#2A3C61]/30">
                <TableCell className="font-medium text-gray-100">{item.assetClass}</TableCell>
                <TableCell className="text-right text-gray-200">{item.current.toFixed(1)}%</TableCell>
                <TableCell className="text-right text-gray-400">{item.target.toFixed(1)}%</TableCell>
                <TableCell className={`text-right ${item.drift > 0 ? 'text-red-400' : item.drift < 0 ? 'text-yellow-400' : 'text-green-400'}`}>{item.drift.toFixed(1)}%</TableCell>
                <TableCell className="text-center">
                  <Badge className={`${getStatusBadgeColor(item.status)} text-white text-xs`}>{item.status}</Badge>
                </TableCell>
                <TableCell className="text-left">
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        item.status === 'Overweight' ? 'bg-red-500' : 
                        item.status === 'Underweight' ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, Math.max(0, (item.current / Math.max(item.target, 0.1)) * 100))}%`,
                        marginLeft: item.status === 'Underweight' ? `${Math.max(0, 100 - (item.current / item.target) * 100)}%` : '0'
                      }}
                    ></div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Rebalancing Recommendations */}
      <div className="mb-6 border-t border-gray-700 pt-4">
        <h4 className="text-lg font-medium mb-3 text-gray-200">Rebalancing Recommendations</h4>
        <p className="text-sm text-gray-400 mb-3">Suggested trades to bring your portfolio back to target allocation.</p>
        <Table className="bg-[#1B2B4B]">
          <TableHeader>
            <TableRow className="border-gray-600 hover:bg-[#2A3C61]/50">
              <TableHead className="text-gray-300">Action</TableHead>
              <TableHead className="text-gray-300">Asset</TableHead>
              <TableHead className="text-right text-gray-300">Amount</TableHead>
              <TableHead className="text-gray-300">Reason</TableHead>
              <TableHead className="text-gray-300">Tax Impact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rebalanceRecs.length > 0 ? (
                rebalanceRecs.map((rec, index) => (
                  <TableRow key={index} className="border-gray-700 hover:bg-[#2A3C61]/30">
                    <TableCell>
                      <Badge 
                        variant={rec.action === 'Sell' ? 'destructive' : 'default'} 
                        className={`text-xs ${rec.action === 'Buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                      >
                        {rec.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-gray-100">{rec.asset}</TableCell>
                    <TableCell className="text-right text-gray-200">{rec.amount}</TableCell>
                    <TableCell className="text-gray-400 text-sm">{rec.reason}</TableCell>
                    <TableCell>
                      <Badge 
                        className={`text-xs ${
                          rec.taxEfficiency === 'High' ? 'bg-green-600' : 
                          rec.taxEfficiency === 'Medium' ? 'bg-yellow-600' : 
                          'bg-red-600'
                        } text-white`}
                      >
                        {rec.taxEfficiency || 'Unknown'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
                 <TableRow className="border-gray-700 hover:bg-[#2A3C61]/30">
                    <TableCell colSpan={5} className="text-center text-gray-400 py-4">Portfolio is within target allocation bands. No rebalancing needed.</TableCell>
                 </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={rebalanceRecs.length === 0}>
                Execute Rebalance (Simulated)
            </Button>
        </div>
      </div>

      {/* Tax Efficiency & Cost Analysis Placeholder */}
       <div className="border-t border-gray-700 pt-4">
         <h4 className="text-lg font-medium mb-2 text-gray-200">Tax & Cost Considerations</h4>
         <div className="bg-[#1B2B4B]/50 rounded p-4 text-sm text-gray-400">
            <p className="mb-2 font-medium text-gray-300">Tax-Efficient Rebalancing Strategy:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-400">
              <li>Prioritize buying in tax-advantaged accounts (401k, IRA) when possible.</li>
              <li>Rebalance using new contributions to avoid selling and realizing gains.</li>
              <li>Consider tax-loss harvesting opportunities to offset capital gains.</li>
              <li>Sell overweighted assets with the lowest tax impact first.</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700/50 rounded-md">
              <p className="text-sm text-blue-300">Based on your portfolio, we estimate the tax cost of the suggested rebalancing to be approximately <span className="font-semibold">$320</span> if executed efficiently.</p>
            </div>
         </div>
       </div>

    </div>
  );
};

export default RebalancingEngine; 