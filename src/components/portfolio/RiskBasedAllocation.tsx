'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data - replace with actual data fetching and calculations
const mockRiskAssessmentData = [
  { name: 'Conservative', score: 65 },
  { name: 'Moderate', score: 80 },
  { name: 'Aggressive', score: 95 },
];

const mockCurrentAllocation = [
  { name: 'Stocks', value: 60 },
  { name: 'Bonds', value: 30 },
  { name: 'Cash', value: 10 },
];

const mockRecommendedAllocation = [
  { name: 'Stocks', value: 70 },
  { name: 'Bonds', value: 25 },
  { name: 'Alternatives', value: 5 },
];

const RiskBasedAllocation: React.FC = () => {
  const [riskProfile, setRiskProfile] = useState<string>('Moderate'); // Example state

  // Placeholder for interactive elements and logic
  const handleRiskProfileChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRiskProfile(event.target.value);
    // TODO: Add logic to update recommendations based on selected risk profile
  };

  return (
    <div className="bg-[#2A3C61]/30 p-6 rounded-lg shadow-lg border border-gray-700">
      <h3 className="text-xl font-semibold mb-4 text-gray-100">Risk-Based Allocation</h3>

      {/* Risk Tolerance Assessment (Placeholder) */}
      <div className="mb-6">
        <label htmlFor="riskProfile" className="block text-sm font-medium text-gray-300 mb-2">
          Select Your Risk Profile:
        </label>
        <select
          id="riskProfile"
          value={riskProfile}
          onChange={handleRiskProfileChange}
          className="w-full p-2 rounded bg-[#1B2B4B] border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="Conservative">Conservative</option>
          <option value="Moderate">Moderate</option>
          <option value="Aggressive">Aggressive</option>
        </select>
        {/* TODO: Add a more interactive risk assessment tool */}
        <p className="text-xs text-gray-400 mt-2">Based on your profile, we recommend the following allocation.</p>
      </div>

      {/* Allocation Comparison Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="text-lg font-medium mb-2 text-gray-200">Current Allocation</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockCurrentAllocation} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9CA3AF' }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fill: '#D1D5DB' }} width={80} />
              <Tooltip
                cursor={{ fill: 'rgba(75, 85, 99, 0.3)' }}
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', color: '#E5E7EB' }}
              />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 className="text-lg font-medium mb-2 text-gray-200">Recommended ({riskProfile})</h4>
           <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockRecommendedAllocation} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9CA3AF' }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fill: '#D1D5DB' }} width={80} />
              <Tooltip
                 cursor={{ fill: 'rgba(75, 85, 99, 0.3)' }}
                 contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', color: '#E5E7EB' }}
              />
              <Bar dataKey="value" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

       {/* Efficient Frontier Placeholder */}
      <div className="mt-6 border-t border-gray-700 pt-4">
         <h4 className="text-lg font-medium mb-2 text-gray-200">Efficient Frontier (Illustrative)</h4>
         <div className="h-48 bg-[#1B2B4B]/50 rounded flex items-center justify-center text-gray-500">
            [Placeholder for Efficient Frontier Chart]
            {/* TODO: Implement D3 or Recharts scatter plot for Efficient Frontier */}
         </div>
         <p className="text-xs text-gray-400 mt-2">Visualizes optimal portfolios offering the highest expected return for a defined level of risk.</p>
      </div>

    </div>
  );
};

export default RiskBasedAllocation; 