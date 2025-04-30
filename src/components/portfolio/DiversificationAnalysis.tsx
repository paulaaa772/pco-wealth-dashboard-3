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

// Mock Correlation Matrix Data (replace with actual calculations/API)
const assetClasses = ['US Stocks', 'Intl Stocks', 'Bonds', 'Real Estate', 'Crypto'];
const mockCorrelationMatrix = [
  [1.00, 0.75, 0.15, 0.40, 0.30], // US Stocks vs All
  [0.75, 1.00, 0.20, 0.50, 0.35], // Intl Stocks vs All
  [0.15, 0.20, 1.00, 0.25, 0.05], // Bonds vs All
  [0.40, 0.50, 0.25, 1.00, 0.15], // Real Estate vs All
  [0.30, 0.35, 0.05, 0.15, 1.00], // Crypto vs All
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#A569BD', '#F1948A', '#76D7C4'];

interface ConcentrationItem {
    sector: string;
    weight: number;
    benchmark: number;
    status: string;
}

// Function to get color based on correlation value (-1 to 1)
function getCorrelationColor(value: number): string {
    if (value > 0.7) return 'bg-red-700';
    if (value > 0.4) return 'bg-red-500';
    if (value > 0.1) return 'bg-yellow-500';
    if (value > -0.1) return 'bg-gray-500'; // Near zero
    if (value > -0.4) return 'bg-blue-500';
    return 'bg-blue-700'; // Low or negative
}

// Add recommendation interface
interface DiversificationRecommendation {
  type: 'Critical' | 'Important' | 'Suggested';
  recommendation: string;
  rationale: string;
}

const DiversificationAnalysis: React.FC = () => {
  const { manualAccounts, isLoading } = useManualAccounts();
  
  // Calculate diversification metrics and score
  const { 
    sectorConcentration, 
    geoDistribution, 
    totalPortfolioValue, 
    diversificationScore, 
    recommendations 
  } = useMemo(() => {
    const sectorMap: Record<string, number> = {};
    const geoMap: Record<string, number> = {};
    let currentTotalValue = 0;
    const recs: DiversificationRecommendation[] = [];

    manualAccounts.forEach(account => {
        account.assets.forEach(asset => {
            const sector = mockSymbolToSector[asset.symbol] || 'Unknown Sector';
            const region = mockSymbolToGeo[asset.symbol] || 'Unknown Region';
            sectorMap[sector] = (sectorMap[sector] || 0) + asset.value;
            geoMap[region] = (geoMap[region] || 0) + asset.value;
            currentTotalValue += asset.value;
        });
    });

    if (currentTotalValue === 0) return { 
      sectorConcentration: [], 
      geoDistribution: [], 
      totalPortfolioValue: 0,
      diversificationScore: 0,
      recommendations: [] 
    };

    // Calculate sector concentration
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

    // Calculate geographic distribution
    const calculatedGeo = Object.entries(geoMap).map(([name, value]) => ({
        name,
        value: parseFloat(((value / currentTotalValue) * 100).toFixed(1)),
    })).sort((a, b) => b.value - a.value);
    
    // Generate diversification recommendations
    const highConcentrationSectors = calculatedConcentration.filter(item => item.status === 'High Concentration');
    
    // Check for sector concentration issues
    if (highConcentrationSectors.length > 0) {
      const topSector = highConcentrationSectors[0];
      recs.push({
        type: 'Critical',
        recommendation: `Reduce exposure to ${topSector.sector} sector`,
        rationale: `${topSector.sector} represents ${topSector.weight.toFixed(1)}% of your portfolio, which is ${(topSector.weight - topSector.benchmark).toFixed(1)}% above benchmark.`
      });
    }
    
    // Check for geographic diversification
    if (calculatedGeo.length > 0 && calculatedGeo[0].value > 85) {
      recs.push({
        type: 'Important',
        recommendation: `Increase geographic diversification beyond ${calculatedGeo[0].name}`,
        rationale: `${calculatedGeo[0].value.toFixed(1)}% of your portfolio is concentrated in ${calculatedGeo[0].name}.`
      });
    }
    
    // Check for number of assets
    const uniqueAssets = new Set(manualAccounts.flatMap(a => a.assets.map(asset => asset.symbol))).size;
    if (uniqueAssets < 10) {
      recs.push({
        type: 'Important',
        recommendation: 'Increase the number of individual assets',
        rationale: `Your portfolio contains only ${uniqueAssets} unique assets. Consider adding more for better diversification.`
      });
    }
    
    // Check for additional asset classes
    const assetClassCount = new Set(Object.values(sectorMap).filter(v => v > 0)).size;
    if (assetClassCount < 4) {
      recs.push({
        type: 'Suggested',
        recommendation: 'Add exposure to more asset classes',
        rationale: 'Adding uncorrelated asset classes can improve overall portfolio resilience.'
      });
    }
    
    // Calculate dynamic diversification score (0-100)
    // Factors: sector concentration, geographic spread, number of assets, asset class diversity
    const sectorScore = Math.min(100, Math.max(0, 100 - (highConcentrationSectors.length * 15))); // Deduct for each concentrated sector
    const geoScore = Math.min(100, Math.max(0, 100 - Math.max(0, calculatedGeo[0]?.value - 65))); // Deduct for geographic concentration
    const assetCountScore = Math.min(100, Math.max(0, uniqueAssets * 5)); // More assets = better score, up to 20
    const assetClassScore = Math.min(100, Math.max(0, assetClassCount * 20)); // More asset classes = better score
    
    // Weighted average of scores (can adjust weights based on importance)
    const calculatedScore = Math.round(
      (sectorScore * 0.4) + 
      (geoScore * 0.3) + 
      (assetCountScore * 0.2) + 
      (assetClassScore * 0.1)
    );
    
    return { 
      sectorConcentration: calculatedConcentration, 
      geoDistribution: calculatedGeo, 
      totalPortfolioValue: currentTotalValue,
      diversificationScore: calculatedScore,
      recommendations: recs
    };

  }, [manualAccounts]);


  const getConcentrationBadge = (status: string) => {
    return status === 'High Concentration' ? 
           <Badge className="bg-orange-600 hover:bg-orange-700 text-white text-xs">High</Badge> : 
           <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs">Normal</Badge>;
  };
  
  const getRecommendationBadge = (type: DiversificationRecommendation['type']) => {
    switch (type) {
      case 'Critical':
        return <Badge className="bg-red-600 hover:bg-red-700 text-white text-xs">Critical</Badge>;
      case 'Important':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs">Important</Badge>;
      case 'Suggested':
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-xs">Suggested</Badge>;
      default:
        return null;
    }
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

      {/* Diversification Score with dynamic calculation */}
      <div className="mb-6 text-center bg-[#1B2B4B]/60 p-4 rounded-lg">
          <h4 className="text-lg font-medium mb-2 text-gray-200">Overall Diversification Score</h4>
          <p className="text-4xl font-bold text-cyan-400">{diversificationScore}/100</p>
          <div className="w-full bg-gray-700 h-2 rounded-full mt-2">
            <div 
              className={`h-2 rounded-full ${
                diversificationScore > 80 ? 'bg-green-500' : 
                diversificationScore > 60 ? 'bg-cyan-500' : 
                diversificationScore > 40 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`} 
              style={{ width: `${diversificationScore}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {diversificationScore > 80 ? 'Well-diversified portfolio' :
             diversificationScore > 60 ? 'Moderately diversified portfolio' :
             diversificationScore > 40 ? 'Portfolio needs diversification improvements' :
             'Poorly diversified portfolio'}
          </p>
      </div>
      
      {/* Diversification Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6 border-t border-gray-700 pt-4">
          <h4 className="text-lg font-medium mb-3 text-gray-200">Improvement Recommendations</h4>
          {recommendations.map((rec, index) => (
            <div key={index} className="mb-3 bg-[#1B2B4B]/60 p-3 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  {getRecommendationBadge(rec.type)}
                  <h5 className="font-medium text-white">{rec.recommendation}</h5>
                </div>
              </div>
              <p className="text-sm text-gray-400">{rec.rationale}</p>
            </div>
          ))}
        </div>
      )}

      {/* Asset Correlation Heatmap Implementation */}
      <div className="mb-6 border-t border-gray-700 pt-4">
        <h4 className="text-lg font-medium mb-3 text-gray-200">Asset Class Correlation (Illustrative)</h4>
         <div className="overflow-x-auto">
             <div className="inline-block min-w-full align-middle">
                <div className="relative">
                    {/* Column Headers */}
                    <div className="flex sticky top-0 z-10 bg-[#2A3C61]">
                        <div className="w-28 flex-shrink-0 px-2 py-1 border-b border-r border-gray-700 text-xs font-medium text-gray-400"></div>
                        {assetClasses.map(header => (
                            <div key={header} className="w-24 flex-shrink-0 px-2 py-1 text-center border-b border-r border-gray-700 text-xs font-medium text-gray-300 truncate" title={header}>{header}</div>
                        ))}
                    </div>
                    {/* Heatmap Rows */}
                    {assetClasses.map((rowHeader, rowIndex) => (
                        <div key={rowHeader} className="flex">
                            {/* Row Header */}
                            <div className="w-28 flex-shrink-0 px-2 py-1 text-left border-b border-r border-gray-700 text-xs font-medium text-gray-300 truncate sticky left-0 bg-[#2A3C61]" title={rowHeader}>{rowHeader}</div>
                            {/* Cells */}
                            {mockCorrelationMatrix[rowIndex].map((value, colIndex) => (
                                <div 
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`w-24 h-10 flex-shrink-0 flex items-center justify-center border-b border-r border-gray-700 text-xs font-medium text-white ${getCorrelationColor(value)}`}
                                    title={`${rowHeader} / ${assetClasses[colIndex]}`}
                                >
                                    {value.toFixed(2)}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
             </div>
         </div>
        <p className="text-xs text-gray-400 mt-2">Shows how similarly different asset classes move. Lower/negative values (blue) indicate better diversification potential than high positive values (red).</p>
      </div>

      {/* Concentration Risk - Use calculated data */}
      <div className="mb-6 border-t border-gray-700 pt-4">
        <h4 className="text-lg font-medium mb-3 text-gray-200">Sector Concentration Risk</h4>
         {sectorConcentration.map(item => (
            <div key={item.sector} className="flex justify-between items-center p-2 mb-1 bg-[#1B2B4B]/40 rounded text-sm">
                <span className="text-gray-200 w-1/3 truncate" title={item.sector}>{item.sector}</span>
                <div className="w-1/3 px-2">
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${item.status === 'High Concentration' ? 'bg-orange-500' : 'bg-green-500'}`}
                      style={{ width: `${item.weight}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-1/3 justify-end">
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