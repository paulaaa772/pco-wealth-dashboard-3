'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Assuming Shadcn UI table
import { Badge } from "@/components/ui/badge"; // Assuming Shadcn UI badge
import { Button } from "@/components/ui/button"; // Assuming Shadcn UI button

// Mock data - replace with actual data
const mockPortfolioDrift = [
  { assetClass: 'Large Cap Stocks', current: 45, target: 40, drift: 5, status: 'Overweight' },
  { assetClass: 'International Stocks', current: 18, target: 20, drift: -2, status: 'Underweight' },
  { assetClass: 'Bonds', current: 28, target: 30, drift: -2, status: 'Underweight' },
  { assetClass: 'Real Estate', current: 9, target: 10, drift: -1, status: 'Underweight' },
];

const mockRebalanceRecs = [
  { action: 'Sell', asset: 'Large Cap Stocks', amount: '$5,000', reason: 'Reduce overweight' },
  { action: 'Buy', asset: 'International Stocks', amount: '$2,000', reason: 'Increase underweight' },
  { action: 'Buy', asset: 'Bonds', amount: '$2,000', reason: 'Increase underweight' },
  { action: 'Buy', asset: 'Real Estate', amount: '$1,000', reason: 'Increase underweight' },
];

const RebalancingEngine: React.FC = () => {

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Overweight': return 'bg-red-600 hover:bg-red-700';
      case 'Underweight': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-green-600 hover:bg-green-700'; // Assuming 'On Target' or similar
    }
  };

  return (
    <div className="bg-[#2A3C61]/30 p-6 rounded-lg shadow-lg border border-gray-700 mt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-100">Portfolio Rebalancing Engine</h3>

      {/* Portfolio Drift Monitoring */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3 text-gray-200">Allocation Drift</h4>
        <p className="text-sm text-gray-400 mb-3">Monitoring deviation from your target asset allocation.</p>
        <Table className="bg-[#1B2B4B]">
          <TableHeader>
            <TableRow className="border-gray-600 hover:bg-[#2A3C61]/50">
              <TableHead className="text-gray-300">Asset Class</TableHead>
              <TableHead className="text-right text-gray-300">Current (%)</TableHead>
              <TableHead className="text-right text-gray-300">Target (%)</TableHead>
              <TableHead className="text-right text-gray-300">Drift (%)</TableHead>
              <TableHead className="text-center text-gray-300">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPortfolioDrift.map((item) => (
              <TableRow key={item.assetClass} className="border-gray-700 hover:bg-[#2A3C61]/30">
                <TableCell className="font-medium text-gray-100">{item.assetClass}</TableCell>
                <TableCell className="text-right text-gray-200">{item.current.toFixed(1)}%</TableCell>
                <TableCell className="text-right text-gray-400">{item.target.toFixed(1)}%</TableCell>
                <TableCell className={`text-right ${item.drift > 0 ? 'text-red-400' : 'text-green-400'}`}>{item.drift.toFixed(1)}%</TableCell>
                <TableCell className="text-center">
                  <Badge className={`${getStatusBadgeColor(item.status)} text-white text-xs`}>{item.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* TODO: Add visual drift indicators (e.g., progress bars or small charts) */}
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockRebalanceRecs.map((rec, index) => (
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Execute Rebalance (Simulated)</Button>
        </div>
        {/* TODO: Add estimated cost and tax impact analysis */}
      </div>

      {/* Tax Efficiency & Cost Analysis Placeholder */}
       <div className="border-t border-gray-700 pt-4">
         <h4 className="text-lg font-medium mb-2 text-gray-200">Tax & Cost Considerations</h4>
         <div className="bg-[#1B2B4B]/50 rounded p-4 text-sm text-gray-400">
            <p>• Estimated Tax Impact: [Placeholder]</p>
            <p>• Estimated Trading Costs: [Placeholder]</p>
            <p>• Consider tax-loss harvesting opportunities before rebalancing.</p>
             {/* TODO: Add detailed analysis and specific lot selection suggestions */}
         </div>
       </div>

    </div>
  );
};

export default RebalancingEngine; 