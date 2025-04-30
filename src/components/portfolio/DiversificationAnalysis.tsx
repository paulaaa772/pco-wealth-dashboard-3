'use client';

import React, { useMemo } from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext'; // Import context
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from "@/components/ui/badge";

// Mock mappings (replace with API or more robust logic)
const mockSymbolToSector: Record<string, string> = {
  'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology',
  'AMZN': 'Consumer Discretionary', 'TSLA': 'Consumer Discretionary',
  'JNJ': 'Healthcare', 'PFE': 'Healthcare', 'MRK': 'Healthcare',
  'JPM': 'Financials', 'BAC': 'Financials', 'WFC': 'Financials',
  'XOM': 'Energy', 'CVX': 'Energy',
  'NVDA': 'Technology', 'ASML': 'Technology', 'TSM': 'Technology',
  'VTI': 'Broad Market', 'VOO': 'Broad Market', 'QQQ': 'Broad Market',
  'BRK.B': 'Financials',
  'MELI': 'Consumer Discretionary',
  'CAT': 'Industrials',
  'VNQ': 'Real Estate',
  'KTOS': 'Industrials',
  'VST': 'Utilities',
  'LRCX': 'Technology',
  'SRVR': 'Real Estate', // Assuming data center REIT
  'NVO': 'Healthcare',
  'INTC': 'Technology',
  'XLV': 'Healthcare', // Sector ETF
  'COST': 'Consumer Staples',
  'AGFY': 'Industrials', // Agrify - Vertical Farming
  'BTC': 'Crypto',
  'ETH': 'Crypto',
  // Add more mappings as needed
};

const mockSymbolToGeo: Record<string, string> = {
  'AAPL': 'North America', 'MSFT': 'North America', 'GOOGL': 'North America',
  'AMZN': 'North America', 'TSLA': 'North America',
  'JNJ': 'North America', 'PFE': 'North America', 'MRK': 'North America',
  'JPM': 'North America', 'BAC': 'North America', 'WFC': 'North America',
  'XOM': 'North America', 'CVX': 'North America',
  'NVDA': 'North America',
  'VTI': 'North America', 'VOO': 'North America', 'QQQ': 'North America',
  'BRK.B': 'North America',
  'MELI': 'Latin America', // MercadoLibre
  'CAT': 'North America',
  'VNQ': 'North America',
  'KTOS': 'North America',
  'VST': 'North America',
  'LRCX': 'North America',
  'SRVR': 'North America',
  'INTC': 'North America',
  'XLV': 'North America',
  'COST': 'North America',
  'AGFY': 'North America',
  'ASML': 'Europe', // Netherlands
  'NVO': 'Europe', // Denmark
  'TSM': 'Asia', // Taiwan
   'BTC': 'Global',
  'ETH': 'Global',
  // Default to North America or Global if unknown
};

// Mock benchmark for concentration (e.g., S&P 500 weights)
const benchmarkSectorWeights: Record<string, number> = {
    'Technology': 28,
    'Healthcare': 14,
    'Financials': 13,
    'Consumer Discretionary': 10,
    'Communication Services': 9,
    'Industrials': 8,
    'Consumer Staples': 6,
    'Energy': 4,
    'Utilities': 3,
    'Real Estate': 3,
    'Materials': 2,
    'Broad Market': 0, // ETFs might be handled differently
    'Crypto': 0,
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#A569BD', '#F1948A', '#76D7C4'];

interface ConcentrationItem {
    sector: string;
    weight: number;
    benchmark: number;
    status: string;
}

const DiversificationAnalysis: React.FC = () => {
  const { manualAccounts, isLoading } = useManualAccounts();
  const diversificationScore = 78; // Keep as placeholder

  // Calculate Sector Concentration & Geographic Distribution
  const { sectorConcentration, geoDistribution, totalPortfolioValue } = useMemo(() => {
    const sectorMap: Record<string, number> = {};
    const geoMap: Record<string, number> = {};
    let currentTotalValue = 0;

    manualAccounts.forEach(account => {
        account.assets.forEach(asset => {
            const sector = mockSymbolToSector[asset.symbol] || 'Unknown Sector';
            const region = mockSymbolToGeo[asset.symbol] || 'Unknown Region';
            sectorMap[sector] = (sectorMap[sector] || 0) + asset.value;
            geoMap[region] = (geoMap[region] || 0) + asset.value;
            currentTotalValue += asset.value;
        });
    });

    if (currentTotalValue === 0) return { sectorConcentration: [], geoDistribution: [], totalPortfolioValue: 0 };

    const calculatedConcentration: ConcentrationItem[] = Object.entries(sectorMap).map(([sector, value]) => {
        const weight = parseFloat(((value / currentTotalValue) * 100).toFixed(1));
        const benchmark = benchmarkSectorWeights[sector] || 0;
        // Simple concentration check (e.g., > 5% over benchmark or > 20% absolute)
        const isConcentrated = weight > Math.max(benchmark + 5, 20);
        return {
            sector,
            weight,
            benchmark,
            status: isConcentrated ? 'High Concentration' : 'Normal',
        };
    }).sort((a, b) => b.weight - a.weight); // Sort by weight desc

    const calculatedGeo = Object.entries(geoMap).map(([name, value]) => ({
        name,
        value: parseFloat(((value / currentTotalValue) * 100).toFixed(1)),
    })).sort((a, b) => b.value - a.value);

    return { sectorConcentration: calculatedConcentration, geoDistribution: calculatedGeo, totalPortfolioValue: currentTotalValue };

  }, [manualAccounts]);


  const getConcentrationBadge = (status: string) => {
    return status === 'High Concentration' ? 
           <Badge className="bg-orange-600 hover:bg-orange-700 text-white text-xs">High</Badge> : 
           <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs">Normal</Badge>;
  };

   if (isLoading) {
     return (
         <div className="bg-[#2A3C61]/30 p-6 rounded-lg shadow-lg border border-gray-700 mt-6">
             <h3 className="text-xl font-semibold mb-4 text-gray-100">Diversification Analysis</h3>
             <div className="flex justify-center items-center h-60">
                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
             </div>
         </div>
     );
   }

  return (
    <div className="bg-[#2A3C61]/30 p-6 rounded-lg shadow-lg border border-gray-700 mt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-100">Diversification Analysis</h3>

      {/* Diversification Score */}
      <div className="mb-6 text-center bg-[#1B2B4B]/60 p-4 rounded-lg">
          <h4 className="text-lg font-medium mb-2 text-gray-200">Overall Diversification Score</h4>
          <p className="text-4xl font-bold text-cyan-400">{diversificationScore}/100</p>
          <p className="text-sm text-gray-400 mt-1">Measure of asset spread (Placeholder Score).</p>
      </div>

      {/* Asset Correlation Heatmap Placeholder */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3 text-gray-200">Asset Correlation</h4>
         <div className="h-48 bg-[#1B2B4B]/50 rounded flex items-center justify-center text-gray-500">
            [Placeholder for Correlation Heatmap]
         </div>
        <p className="text-xs text-gray-400 mt-2">Shows how similarly different assets move. Lower correlations improve diversification.</p>
      </div>

      {/* Concentration Risk - Use calculated data */}
      <div className="mb-6 border-t border-gray-700 pt-4">
        <h4 className="text-lg font-medium mb-3 text-gray-200">Sector Concentration Risk</h4>
         {sectorConcentration.map(item => (
            <div key={item.sector} className="flex justify-between items-center p-2 mb-1 bg-[#1B2B4B]/40 rounded text-sm">
                <span className="text-gray-200 w-1/2 truncate" title={item.sector}>{item.sector}</span>
                <div className="flex items-center gap-2">
                    <span className="text-gray-100 w-12 text-right">{item.weight.toFixed(1)}%</span>
                    {getConcentrationBadge(item.status)}
                </div>
            </div>
         ))}
         <p className="text-xs text-gray-400 mt-2">Highlights significant overexposure to specific sectors compared to benchmarks.</p>
      </div>

      {/* Geographic Distribution - Use calculated data */}
      <div className="border-t border-gray-700 pt-4">
        <h4 className="text-lg font-medium mb-3 text-gray-200">Geographic Distribution</h4>
         <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={geoDistribution} // Use calculated geoDistribution
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name} ${value.toFixed(0)}%`}
              >
                {geoDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', color: '#E5E7EB' }}
                 formatter={(value: number) => `${value.toFixed(1)}%`}
              />
            </PieChart>
          </ResponsiveContainer>
           <p className="text-xs text-gray-400 mt-2 text-center">Breakdown of your portfolio by estimated geographic region.</p>
      </div>

    </div>
  );
};

export default DiversificationAnalysis; 