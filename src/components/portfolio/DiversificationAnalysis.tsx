'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'; // Example charting library
import { Badge } from "@/components/ui/badge";

// Mock Data - Replace with actual calculations
const mockCorrelationData = [
  // Placeholder structure for heatmap data
  { asset1: 'US Stocks', asset2: 'Intl Stocks', correlation: 0.7 },
  { asset1: 'US Stocks', asset2: 'Bonds', correlation: 0.2 },
  // ... more correlation pairs
];

const mockConcentrationData = [
  { sector: 'Technology', weight: 35, benchmark: 25, status: 'High Concentration' },
  { sector: 'Healthcare', weight: 15, benchmark: 18, status: 'Normal' },
  // ... more sectors
];

const mockGeoDistribution = [
  { name: 'North America', value: 65 },
  { name: 'Europe', value: 20 },
  { name: 'Asia', value: 10 },
  { name: 'Other', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DiversificationAnalysis: React.FC = () => {

  const diversificationScore = 78; // Example Score

  const getConcentrationBadge = (status: string) => {
    return status === 'High Concentration' ? 
           <Badge className="bg-orange-600 hover:bg-orange-700 text-white text-xs">High</Badge> : 
           <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs">Normal</Badge>;
  };

  return (
    <div className="bg-[#2A3C61]/30 p-6 rounded-lg shadow-lg border border-gray-700 mt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-100">Diversification Analysis</h3>

      {/* Diversification Score */}
      <div className="mb-6 text-center bg-[#1B2B4B]/60 p-4 rounded-lg">
          <h4 className="text-lg font-medium mb-2 text-gray-200">Overall Diversification Score</h4>
          <p className="text-4xl font-bold text-cyan-400">{diversificationScore}/100</p>
          <p className="text-sm text-gray-400 mt-1">A measure of how well your assets are spread across different classes and regions.</p>
          {/* TODO: Add recommendations based on score */} 
      </div>

      {/* Asset Correlation Heatmap Placeholder */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3 text-gray-200">Asset Correlation</h4>
         <div className="h-48 bg-[#1B2B4B]/50 rounded flex items-center justify-center text-gray-500">
            [Placeholder for Correlation Heatmap]
            {/* TODO: Implement heatmap visualization (e.g., using D3 or a dedicated library) */}
         </div>
        <p className="text-xs text-gray-400 mt-2">Shows how similarly different assets in your portfolio move in price. Lower correlations generally mean better diversification.</p>
      </div>

      {/* Concentration Risk */}
      <div className="mb-6 border-t border-gray-700 pt-4">
        <h4 className="text-lg font-medium mb-3 text-gray-200">Concentration Risk</h4>
         {mockConcentrationData.map(item => (
            <div key={item.sector} className="flex justify-between items-center p-2 mb-1 bg-[#1B2B4B]/40 rounded">
                <span className="text-sm text-gray-200">{item.sector}</span>
                <div>
                    <span className="text-sm text-gray-100 mr-2">{item.weight}%</span>
                    {getConcentrationBadge(item.status)}
                </div>
            </div>
         ))}
         <p className="text-xs text-gray-400 mt-2">Highlights significant overexposure to specific sectors or industries compared to benchmarks.</p>
         {/* TODO: Add table or more detailed breakdown */} 
      </div>

      {/* Geographic & Asset Class Distribution */}
      <div className="border-t border-gray-700 pt-4">
        <h4 className="text-lg font-medium mb-3 text-gray-200">Geographic Distribution</h4>
         <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={mockGeoDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {mockGeoDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', color: '#E5E7EB' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* TODO: Add Asset Class Distribution chart as well */} 
           <p className="text-xs text-gray-400 mt-2 text-center">Breakdown of your portfolio by geographic region.</p>
      </div>

    </div>
  );
};

export default DiversificationAnalysis; 