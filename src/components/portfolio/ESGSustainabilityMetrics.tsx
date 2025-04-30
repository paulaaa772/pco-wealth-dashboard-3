'use client';

import React, { useMemo } from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext'; // Import context
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data - Replace with actual data/API calls
const overallESGScore = 72; // Placeholder - Needs calculation based on holdings and real ESG data
const esgPillarScores = [
  { name: 'Environmental', score: 65 }, // Placeholder
  { name: 'Social', score: 78 },      // Placeholder
  { name: 'Governance', score: 70 },   // Placeholder
];
const mockCarbonFootprint = {
  portfolioTonsCO2e: 150, // Placeholder
  benchmarkTonsCO2e: 180, // Placeholder
};
const mockControversies = [
  { ticker: 'META', company: 'Meta Platforms', issue: 'Data Privacy Concerns', severity: 'High' }, // Placeholder
  { ticker: 'AMZN', company: 'Amazon', issue: 'Labor Practices', severity: 'Moderate' }, // Placeholder
];

// Mock ESG data per symbol (Replace with API call in a real app)
const mockSymbolESGData: Record<string, { name: string; score: number; rating: string }> = {
  'AAPL': { name: 'Apple Inc.', score: 75, rating: 'AA' },
  'MSFT': { name: 'Microsoft Corp.', score: 85, rating: 'AAA' },
  'GOOGL': { name: 'Alphabet Inc.', score: 79, rating: 'AA' },
  'AMZN': { name: 'Amazon.com, Inc.', score: 60, rating: 'A' },
  'TSLA': { name: 'Tesla, Inc.', score: 55, rating: 'BBB' },
  'JNJ': { name: 'Johnson & Johnson', score: 70, rating: 'A' },
  'PFE': { name: 'Pfizer Inc.', score: 68, rating: 'A' },
  'MRK': { name: 'Merck & Co., Inc.', score: 72, rating: 'AA' },
  'JPM': { name: 'JPMorgan Chase & Co.', score: 65, rating: 'A' },
  'BAC': { name: 'Bank of America Corp', score: 63, rating: 'A' },
  'WFC': { name: 'Wells Fargo & Company', score: 58, rating: 'BBB' },
  'XOM': { name: 'Exxon Mobil Corp.', score: 45, rating: 'BB' },
  'CVX': { name: 'Chevron Corp.', score: 48, rating: 'BB' },
  'NVDA': { name: 'NVIDIA Corp.', score: 80, rating: 'AA' },
  'ASML': { name: 'ASML Holding N.V.', score: 82, rating: 'AAA' },
  'TSM': { name: 'Taiwan Semiconductor Manufacturing Co.', score: 77, rating: 'AA' },
  'VTI': { name: 'Vanguard Total Stock Market ETF', score: 70, rating: 'A' }, // ETF scores are aggregated
  'VOO': { name: 'Vanguard S&P 500 ETF', score: 71, rating: 'A' },
  'QQQ': { name: 'Invesco QQQ Trust', score: 73, rating: 'AA' },
  'BRK.B': { name: 'Berkshire Hathaway Inc.', score: 66, rating: 'A' },
  'MELI': { name: 'MercadoLibre, Inc.', score: 69, rating: 'A' },
  'CAT': { name: 'Caterpillar Inc.', score: 62, rating: 'A' },
  'VNQ': { name: 'Vanguard Real Estate ETF', score: 64, rating: 'A' },
  'KTOS': { name: 'Kratos Defense & Security Solutions', score: 50, rating: 'BB' },
  'VST': { name: 'Vistra Corp.', score: 59, rating: 'BBB' },
  'LRCX': { name: 'Lam Research Corp.', score: 78, rating: 'AA' },
  'SRVR': { name: 'PIMCO Access Income Fund', score: 65, rating: 'A' }, // Assuming a generic score
  'NVO': { name: 'Novo Nordisk A/S', score: 88, rating: 'AAA' },
  'INTC': { name: 'Intel Corp.', score: 74, rating: 'AA' },
  'XLV': { name: 'Health Care Select Sector SPDR Fund', score: 71, rating: 'A' },
  'COST': { name: 'Costco Wholesale Corp.', score: 76, rating: 'AA' },
  'AGFY': { name: 'Agrify Corp.', score: 40, rating: 'B' }, // Lower score example
  'BTC': { name: 'Bitcoin', score: 30, rating: 'CCC' }, // Example crypto score
  'ETH': { name: 'Ethereum', score: 35, rating: 'CCC' },
  // Add more mappings
};

interface HoldingESGInfo {
    ticker: string;
    name: string;
    value: number;
    weight: number;
    score: number;
    rating: string;
}

const ESGSustainabilityMetrics: React.FC = () => {
    const { manualAccounts, isLoading } = useManualAccounts();

    // Calculate ESG stats based on holdings and mock ESG data
    const portfolioESGData = useMemo(() => {
        let totalValue = 0;
        const holdingsWithESG: HoldingESGInfo[] = [];

        manualAccounts.forEach(account => {
            account.assets.forEach(asset => {
                const esgInfo = mockSymbolESGData[asset.symbol];
                if (esgInfo) {
                    holdingsWithESG.push({
                        ticker: asset.symbol,
                        name: esgInfo.name,
                        value: asset.value,
                        weight: 0, // Will calculate later
                        score: esgInfo.score,
                        rating: esgInfo.rating,
                    });
                    totalValue += asset.value;
                }
            });
        });

        if (totalValue === 0) {
            return { topPerformers: [], bottomPerformers: [], calculatedOverallScore: 0 };
        }

        // Calculate weights and overall score
        let weightedScoreSum = 0;
        holdingsWithESG.forEach(h => {
            h.weight = (h.value / totalValue) * 100;
            weightedScoreSum += h.score * (h.weight / 100);
        });

        const calculatedOverallScore = parseFloat(weightedScoreSum.toFixed(1));

        // Sort and get top/bottom performers
        holdingsWithESG.sort((a, b) => b.score - a.score); // Sort descending by score
        const topPerformers = holdingsWithESG.slice(0, 5);
        const bottomPerformers = holdingsWithESG.slice(-5).reverse(); // Take last 5, reverse to show worst first

        return { topPerformers, bottomPerformers, calculatedOverallScore };

    }, [manualAccounts]);

  const getRatingBadgeColor = (rating: string) => {
    if (['AAA', 'AA'].includes(rating)) return 'bg-green-600 hover:bg-green-700';
    if (['A', 'BBB'].includes(rating)) return 'bg-yellow-500 hover:bg-yellow-600';
    if (['BB', 'B'].includes(rating)) return 'bg-orange-500 hover:bg-orange-600';
    return 'bg-red-600 hover:bg-red-700'; // CCC, CC, C
  };

  const getSeverityBadgeColor = (severity: string) => {
     switch (severity) {
      case 'High': return 'bg-red-600 hover:bg-red-700';
      case 'Moderate': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Low': return 'bg-green-600 hover:bg-green-700';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  if (isLoading) {
    return (
        <div className="space-y-8 py-6">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">ESG & Sustainability Metrics</h2>
          <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
       {/* ... Title remains the same ... */}
       <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">ESG & Sustainability Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score Card - Use calculated score */}
        <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Overall Portfolio ESG Score</CardTitle>
            <CardDescription className="text-gray-400">Weighted average based on holdings (using mock ESG data).</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
             {/* Use calculatedOverallScore */}
            <p className="text-5xl font-bold text-cyan-400 mb-2">{portfolioESGData.calculatedOverallScore || 'N/A'}</p>
            <Progress value={portfolioESGData.calculatedOverallScore || 0} className="w-full h-2 bg-gray-600 [&>*]:bg-cyan-500" />
            <p className="text-xs text-gray-400 mt-2">Score out of 100 (Higher is better)</p>
          </CardContent>
        </Card>

        {/* ... Pillar Scores Chart remains mock ... */}
        <Card className="md:col-span-2 bg-[#2A3C61]/30 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Score Breakdown by Pillar</CardTitle>
             <CardDescription className="text-gray-400">Placeholder - requires detailed ESG data per holding.</CardDescription>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={150}>
                <BarChart data={esgPillarScores} layout="vertical" margin={{ right: 30 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9CA3AF' }} hide />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#D1D5DB' }} width={100} />
                    <Tooltip 
                       cursor={{ fill: 'rgba(75, 85, 99, 0.3)' }}
                       contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', color: '#E5E7EB' }}
                       formatter={(value: number) => `${value}/100`}
                    />
                    <Bar dataKey="score" fill="#2DD4BF" barSize={20} />
                </BarChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

       {/* Top & Bottom Performers - Use calculated lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
            <CardHeader><CardTitle className="text-lg">Top 5 ESG Holdings</CardTitle></CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {portfolioESGData.topPerformers.length > 0 ? (
                        portfolioESGData.topPerformers.map(item => (
                            <li key={item.ticker} className="flex justify-between items-center text-sm p-2 bg-[#1B2B4B]/40 rounded">
                                <span title={item.name} className="truncate w-3/4">{item.name} ({item.ticker})</span>
                                <Badge className={`${getRatingBadgeColor(item.rating)} text-white text-xs`}>{item.rating} ({item.score})</Badge>
                            </li>
                        ))
                    ) : (
                         <li className="text-sm text-gray-400">No holdings with ESG data found.</li>
                    )}
                </ul>
            </CardContent>
        </Card>
         <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
            <CardHeader><CardTitle className="text-lg">Bottom 5 ESG Holdings</CardTitle></CardHeader>
            <CardContent>
                 <ul className="space-y-2">
                     {portfolioESGData.bottomPerformers.length > 0 ? (
                        portfolioESGData.bottomPerformers.map(item => (
                            <li key={item.ticker} className="flex justify-between items-center text-sm p-2 bg-[#1B2B4B]/40 rounded">
                                <span title={item.name} className="truncate w-3/4">{item.name} ({item.ticker})</span>
                                <Badge className={`${getRatingBadgeColor(item.rating)} text-white text-xs`}>{item.rating} ({item.score})</Badge>
                            </li>
                        ))
                     ) : (
                         <li className="text-sm text-gray-400">No holdings with ESG data found.</li>
                     )}
                </ul>
            </CardContent>
        </Card>
      </div>

      {/* ... Carbon Footprint & Controversies remain mock ... */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
            <CardHeader>
                <CardTitle className="text-lg">Est. Carbon Footprint</CardTitle>
                <CardDescription className="text-gray-400">Placeholder - requires emissions data per holding.</CardDescription>
             </CardHeader>
            <CardContent>
                 <div className="flex items-baseline gap-4">
                    <p className="text-3xl font-bold text-orange-400">{mockCarbonFootprint.portfolioTonsCO2e}</p>
                    <p className="text-sm text-gray-400"> / Benchmark: {mockCarbonFootprint.benchmarkTonsCO2e}</p>
                 </div>
                 <p className="text-xs text-gray-500 mt-2">Tons CO2e / $1M invested (Lower is better).</p>
            </CardContent>
        </Card>
         <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
            <CardHeader>
                <CardTitle className="text-lg">Controversies</CardTitle>
                 <CardDescription className="text-gray-400">Placeholder - requires controversy data feed.</CardDescription>
            </CardHeader>
            <CardContent>
                 {mockControversies.length > 0 ? (
                    <ul className="space-y-2">
                        {mockControversies.map((item, index) => (
                            <li key={index} className="text-sm p-2 bg-[#1B2B4B]/40 rounded">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium">{item.company} ({item.ticker})</span>
                                    <Badge className={`${getSeverityBadgeColor(item.severity)} text-white text-xs`}>{item.severity}</Badge>
                                </div>
                                <p className="text-xs text-gray-300">{item.issue}</p>
                            </li>
                        ))}
                    </ul>
                 ) : (
                    <p className="text-sm text-gray-400">No significant controversies detected (Placeholder).</p>
                 )}
            </CardContent>
        </Card>
       </div>

    </div>
  );
};

export default ESGSustainabilityMetrics; 