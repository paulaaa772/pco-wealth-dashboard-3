'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assuming Shadcn UI Select

// Mock Data - Replace with actual simulation results
const mockMonteCarloData = [
  { year: 2024, low: 95000, average: 110000, high: 125000 },
  { year: 2025, low: 100000, average: 125000, high: 145000 },
  { year: 2026, low: 105000, average: 140000, high: 170000 },
  { year: 2027, low: 110000, average: 155000, high: 195000 },
  { year: 2028, low: 115000, average: 170000, high: 220000 },
];

const mockHistoricalData = [
  { year: 2008, portfolioValue: 80000, event: 'Global Financial Crisis' },
  { year: 2009, portfolioValue: 110000 },
  // ... add more historical points
  { year: 2020, portfolioValue: 150000, event: 'COVID-19 Pandemic' },
  { year: 2021, portfolioValue: 180000 },
];

const ScenarioAnalysis: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('monteCarlo');

  const handleScenarioChange = (value: string) => {
    setSelectedScenario(value);
    // TODO: Add logic to fetch/display data for the selected scenario
  };

  return (
    <div className="bg-[#2A3C61]/30 p-6 rounded-lg shadow-lg border border-gray-700 mt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-100">Scenario Analysis Tools</h3>

      {/* Scenario Selection */}
      <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-300">Select Analysis Type:</label>
          <Select value={selectedScenario} onValueChange={handleScenarioChange}>
            <SelectTrigger className="w-[220px] bg-[#1B2B4B] border-gray-600 text-white">
              <SelectValue placeholder="Select Scenario" />
            </SelectTrigger>
            <SelectContent className="bg-[#1B2B4B] border-gray-600 text-white">
              <SelectItem value="monteCarlo" className="hover:bg-[#2A3C61]">Monte Carlo Simulation</SelectItem>
              <SelectItem value="historical" className="hover:bg-[#2A3C61]">Historical Backtest</SelectItem>
              <SelectItem value="custom" className="hover:bg-[#2A3C61]">Custom Scenario</SelectItem>
            </SelectContent>
          </Select>
           <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Run Simulation</Button>
      </div>

      {/* Display Area based on Selection */}
      <div className="border-t border-gray-700 pt-4">
        {selectedScenario === 'monteCarlo' && (
          <div>
            <h4 className="text-lg font-medium mb-3 text-gray-200">Monte Carlo Projection (5 Years)</h4>
            <p className="text-sm text-gray-400 mb-4">Simulates potential future portfolio values based on market volatility.</p>
             <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockMonteCarloData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis dataKey="year" tick={{ fill: '#9CA3AF' }} />
                    <YAxis tick={{ fill: '#9CA3AF' }} tickFormatter={(value) => `$${(value / 1000)}k`} />
                    <Tooltip 
                        formatter={(value: number) => `$${value.toLocaleString()}`}
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', color: '#E5E7EB' }}
                    />
                    <Legend wrapperStyle={{ color: '#D1D5DB' }}/>
                    <Line type="monotone" dataKey="low" stroke="#F87171" name="Pessimistic" dot={false} />
                    <Line type="monotone" dataKey="average" stroke="#3B82F6" name="Average" dot={false} strokeWidth={2}/>
                    <Line type="monotone" dataKey="high" stroke="#34D399" name="Optimistic" dot={false}/>
                </LineChart>
             </ResponsiveContainer>
          </div>
        )}

        {selectedScenario === 'historical' && (
          <div>
             <h4 className="text-lg font-medium mb-3 text-gray-200">Historical Scenario Backtest</h4>
             <p className="text-sm text-gray-400 mb-4">Shows how your current portfolio might have performed during past market events.</p>
              <div className="h-60 bg-[#1B2B4B]/50 rounded flex items-center justify-center text-gray-500">
                  [Placeholder for Historical Backtest Chart/Table]
                  {/* TODO: Implement visualization for historical data */}
              </div>
               <p className="text-xs text-gray-400 mt-2">Simulated performance during events like the 2008 Crisis, Dot-com Bubble, etc.</p>
          </div>
        )}

        {selectedScenario === 'custom' && (
          <div>
             <h4 className="text-lg font-medium mb-3 text-gray-200">Build Custom Scenario</h4>
             <p className="text-sm text-gray-400 mb-4">Define your own market conditions (e.g., interest rate changes, inflation spike) and see the potential impact.</p>
              <div className="h-40 bg-[#1B2B4B]/50 rounded flex items-center justify-center text-gray-500">
                  [Placeholder for Custom Scenario Input Form & Results]
                  {/* TODO: Implement form for users to define parameters and display results */}
              </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ScenarioAnalysis; 