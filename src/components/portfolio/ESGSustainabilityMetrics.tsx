'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data - Replace with actual data/API calls
const overallESGScore = 72; // Example score out of 100
const esgPillarScores = [
  { name: 'Environmental', score: 65 },
  { name: 'Social', score: 78 },
  { name: 'Governance', score: 70 },
];

const topPerformers = [
  { ticker: 'MSFT', name: 'Microsoft', score: 85, rating: 'AAA' },
  { ticker: 'NVO', name: 'Novo Nordisk', score: 82, rating: 'AA' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', score: 79, rating: 'AA' },
];

const bottomPerformers = [
  { ticker: 'XOM', name: 'Exxon Mobil', score: 45, rating: 'BB' },
  { ticker: 'CVX', name: 'Chevron', score: 48, rating: 'BB' },
  { ticker: 'BA', name: 'Boeing', score: 52, rating: 'BBB' },
];

const mockCarbonFootprint = {
  portfolioTonsCO2e: 150, // Example tons of CO2 equivalent
  benchmarkTonsCO2e: 180, 
};

const mockControversies = [
  { ticker: 'META', company: 'Meta Platforms', issue: 'Data Privacy Concerns', severity: 'High' },
  { ticker: 'AMZN', company: 'Amazon', issue: 'Labor Practices', severity: 'Moderate' },
];

const ESGSustainabilityMetrics: React.FC = () => {

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

  return (
    <div className="space-y-8 py-6">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">ESG & Sustainability Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score Card */}
        <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Overall Portfolio ESG Score</CardTitle>
            <CardDescription className="text-gray-400">Weighted average based on holdings.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-5xl font-bold text-cyan-400 mb-2">{overallESGScore}</p>
            <Progress value={overallESGScore} className="w-full h-2 bg-gray-600 [&>*]:bg-cyan-500" />
            <p className="text-xs text-gray-400 mt-2">Score out of 100 (Higher is better)</p>
            {/* TODO: Add comparison to benchmark */}
          </CardContent>
        </Card>

        {/* Pillar Scores Chart */}
        <Card className="md:col-span-2 bg-[#2A3C61]/30 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Score Breakdown by Pillar</CardTitle>
             <CardDescription className="text-gray-400">Performance across Environmental, Social, and Governance factors.</CardDescription>
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

       {/* Top & Bottom Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
            <CardHeader><CardTitle className="text-lg">Top ESG Performers</CardTitle></CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {topPerformers.map(item => (
                        <li key={item.ticker} className="flex justify-between items-center text-sm p-2 bg-[#1B2B4B]/40 rounded">
                            <span>{item.name} ({item.ticker})</span>
                            <Badge className={`${getRatingBadgeColor(item.rating)} text-white text-xs`}>{item.rating}</Badge>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
         <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
            <CardHeader><CardTitle className="text-lg">Bottom ESG Performers</CardTitle></CardHeader>
            <CardContent>
                 <ul className="space-y-2">
                    {bottomPerformers.map(item => (
                        <li key={item.ticker} className="flex justify-between items-center text-sm p-2 bg-[#1B2B4B]/40 rounded">
                            <span>{item.name} ({item.ticker})</span>
                            <Badge className={`${getRatingBadgeColor(item.rating)} text-white text-xs`}>{item.rating}</Badge>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </div>

      {/* Carbon Footprint & Controversies */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
            <CardHeader>
                <CardTitle className="text-lg">Estimated Carbon Footprint</CardTitle>
                <CardDescription className="text-gray-400">Portfolio vs. Benchmark (Tons CO2e / $1M invested)</CardDescription>
             </CardHeader>
            <CardContent>
                 <div className="flex items-baseline gap-4">
                    <p className="text-3xl font-bold text-orange-400">{mockCarbonFootprint.portfolioTonsCO2e}</p>
                    <p className="text-sm text-gray-400"> / Benchmark: {mockCarbonFootprint.benchmarkTonsCO2e}</p>
                 </div>
                 <p className="text-xs text-gray-500 mt-2">Lower is generally better. Based on estimated Scope 1 & 2 emissions.</p>
                 {/* TODO: Add visualization (e.g., comparison bar) */} 
            </CardContent>
        </Card>
         <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
            <CardHeader>
                <CardTitle className="text-lg">Significant Controversies</CardTitle>
                 <CardDescription className="text-gray-400">Monitoring major ESG-related controversies.</CardDescription>
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
                    <p className="text-sm text-gray-400">No significant controversies detected in your holdings.</p>
                 )}
                 {/* TODO: Link to news sources or more details */} 
            </CardContent>
        </Card>
       </div>

    </div>
  );
};

export default ESGSustainabilityMetrics; 