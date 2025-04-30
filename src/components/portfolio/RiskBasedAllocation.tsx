'use client';

import React, { useState, useMemo } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    ScatterChart, Scatter, Label 
} from 'recharts';
import { useManualAccounts } from '@/context/ManualAccountsContext'; // Import context
import RiskQuestionnaire, { RiskProfile } from './RiskQuestionnaire'; // Import Questionnaire
import { Button } from "@/components/ui/button"; // Import Button for toggle

// Mock data for recommendations (can be dynamic later)
const mockRecommendedAllocation = [
  { name: 'Stocks', value: 70 },
  { name: 'Bonds', value: 25 },
  { name: 'Alternatives', value: 5 },
];

// Helper function to map account type to broad asset class
const mapAccountTypeToAssetClass = (accountType: string): string => {
  switch (accountType) {
    case 'Brokerage':
    case '401k': // Assuming 401k holds mostly stocks/funds
    case 'IRA': // Assuming IRA holds mostly stocks/funds
      return 'Stocks/Funds';
    case 'Bank Account':
    case 'Savings':
      return 'Cash';
    case 'Crypto Wallet':
      return 'Alternatives';
    case 'Real Estate': // If you add this type later
       return 'Real Estate';
    // Add more specific mappings if needed, e.g., based on asset symbols within accounts
    default:
      return 'Other';
  }
};

// Mock data for Efficient Frontier (replace with actual calculation)
const efficientFrontierData = [
  { risk: 8, return: 5 },
  { risk: 9, return: 6 },
  { risk: 10, return: 7 },
  { risk: 11, return: 7.8 },
  { risk: 12, return: 8.5 },
  { risk: 13, return: 9.1 },
  { risk: 14, return: 9.6 },
  { risk: 15, return: 10 },
  { risk: 16, return: 10.3 },
  { risk: 17, return: 10.5 },
];

// Mock data for current portfolio position (replace with actual calculation)
const currentPortfolioPosition = [{ risk: 14.5, return: 9.0, name: 'Current' }];

// Define recommended allocations per profile (replace with actual logic)
const recommendedAllocations: Record<RiskProfile, { name: string; value: number }[]> = {
  Conservative: [
    { name: 'Stocks/Funds', value: 40 },
    { name: 'Bonds', value: 40 }, // Higher bonds
    { name: 'Cash', value: 15 },
    { name: 'Alternatives', value: 5 },
  ],
  Moderate: [
    { name: 'Stocks/Funds', value: 60 },
    { name: 'Bonds', value: 25 },
    { name: 'Cash', value: 10 },
    { name: 'Alternatives', value: 5 },
  ],
  Aggressive: [
    { name: 'Stocks/Funds', value: 80 },
    { name: 'Bonds', value: 10 }, // Lower bonds
    { name: 'Cash', value: 5 },
    { name: 'Alternatives', value: 5 },
  ],
};

const RiskBasedAllocation: React.FC = () => {
  const { manualAccounts, isLoading } = useManualAccounts();
  const [determinedProfile, setDeterminedProfile] = useState<RiskProfile | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState<boolean>(false);

  // Calculate current allocation from real data
  const currentAllocation = useMemo(() => {
    const allocationMap: Record<string, number> = {};
    let totalValue = 0;

    manualAccounts.forEach(account => {
      const assetClass = mapAccountTypeToAssetClass(account.accountType);
      allocationMap[assetClass] = (allocationMap[assetClass] || 0) + account.totalValue;
      totalValue += account.totalValue;
    });

    if (totalValue === 0) return [];

    return Object.entries(allocationMap).map(([name, value]) => ({
      name,
      value: parseFloat(((value / totalValue) * 100).toFixed(1)),
    }));
  }, [manualAccounts]);

  // Get recommended allocation based on determined profile
  const recommendedAllocation = useMemo(() => {
      return recommendedAllocations[determinedProfile || 'Moderate']; // Default to Moderate if no profile
  }, [determinedProfile]);

  // Handler for questionnaire callback
  const handleProfileDetermined = (profile: RiskProfile) => {
    setDeterminedProfile(profile);
    setShowQuestionnaire(false); // Hide questionnaire after profile is determined
    console.log("Risk profile determined:", profile);
  };

  if (isLoading) {
     return (
        <div className="bg-[#2A3C61]/30 p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-gray-100">Risk-Based Allocation</h3>
          <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
     );
  }

  return (
    <div className="bg-[#2A3C61]/30 p-6 rounded-lg shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-100">Risk-Based Allocation</h3>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => setShowQuestionnaire(!showQuestionnaire)}
          className="text-sm border-blue-500 text-blue-300 hover:bg-blue-900/30 hover:text-blue-200"
        >
          {showQuestionnaire ? 'Hide' : 'Determine'} Risk Profile
        </Button>
      </div>

      {/* Conditionally render Questionnaire */} 
      {showQuestionnaire && (
         <div className="mb-6">
            <RiskQuestionnaire onProfileDetermined={handleProfileDetermined} />
         </div>
      )}

      {/* Allocation Comparison Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="text-lg font-medium mb-2 text-gray-200">Current Allocation</h4>
          <ResponsiveContainer width="100%" height={200}>
             {/* Use calculated currentAllocation data */}
            <BarChart data={currentAllocation} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9CA3AF' }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fill: '#D1D5DB' }} width={100} />
              <Tooltip
                cursor={{ fill: 'rgba(75, 85, 99, 0.3)' }}
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', color: '#E5E7EB' }}
                 formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 className="text-lg font-medium mb-2 text-gray-200">Recommended ({determinedProfile || 'Default: Moderate'})</h4>
           <ResponsiveContainer width="100%" height={200}>
             {/* Use determined profile in title and recommended allocation data */}
            <BarChart data={recommendedAllocation} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9CA3AF' }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fill: '#D1D5DB' }} width={100} />
              <Tooltip
                 cursor={{ fill: 'rgba(75, 85, 99, 0.3)' }}
                 contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', color: '#E5E7EB' }}
                 formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Bar dataKey="value" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Efficient Frontier Implementation */}
      <div className="mt-6 border-t border-gray-700 pt-4">
         <h4 className="text-lg font-medium mb-2 text-gray-200">Efficient Frontier (Illustrative)</h4>
         <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid stroke="#4B5563" strokeDasharray="3 3" />
                <XAxis 
                    type="number" 
                    dataKey="risk" 
                    name="Risk (Volatility %)" 
                    unit="%" 
                    tick={{ fill: '#9CA3AF' }}
                    domain={['dataMin - 1', 'dataMax + 1']}
                 >
                     <Label value="Risk (Volatility %)" offset={-15} position="insideBottom" fill="#9CA3AF"/>
                 </XAxis>
                <YAxis 
                    type="number" 
                    dataKey="return" 
                    name="Expected Return %" 
                    unit="%" 
                    tick={{ fill: '#9CA3AF' }}
                    domain={['dataMin - 1', 'dataMax + 1']}
                 >
                     <Label value="Expected Return %" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#9CA3AF' }} />
                 </YAxis>
                <Tooltip 
                    cursor={{ strokeDasharray: '3 3', stroke: '#777' }}
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', color: '#E5E7EB' }}
                     formatter={(value: number, name: string) => [`${value}%`, name]}
                />
                {/* Frontier Curve */}
                <Scatter name="Efficient Frontier" data={efficientFrontierData} fill="#8884d8" line={{ stroke: '#8884d8' }} />
                {/* Current Portfolio Point */}
                <Scatter name="Current Portfolio" data={currentPortfolioPosition} fill="#FFC658" />
                 {/* TODO: Add Recommended Portfolio Point based on risk profile */}
            </ScatterChart>
         </ResponsiveContainer>
         <p className="text-xs text-gray-400 mt-2">Visualizes optimal portfolios offering the highest expected return for a defined level of risk. Your current portfolio position is marked (Illustrative).</p>
      </div>

    </div>
  );
};

export default RiskBasedAllocation; 