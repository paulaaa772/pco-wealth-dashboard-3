import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export interface PillarScore {
  name: string;
  score: number;
  description?: string;
}

interface ESGPillarBreakdownProps {
  pillarScores: PillarScore[];
  isLoading?: boolean;
}

const ESGPillarBreakdown: React.FC<ESGPillarBreakdownProps> = ({ 
  pillarScores, 
  isLoading = false 
}) => {
  // Helper to get the color based on score
  const getBarColor = (score: number): string => {
    if (score >= 80) return "#22c55e"; // green-500
    if (score >= 60) return "#2dd4bf"; // cyan-500
    if (score >= 40) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  // Custom tooltip for pillar descriptions
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1F2937] border border-gray-700 p-2 rounded text-sm">
          <p className="font-semibold text-white">{data.name}</p>
          <p className="text-cyan-400">{data.score} / 100</p>
          {data.description && (
            <p className="text-gray-400 mt-1 max-w-xs">{data.description}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-[#2A3C61]/30 border-gray-700 text-white md:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Score Breakdown by Pillar</CardTitle>
        <CardDescription className="text-gray-400">
          ESG components evaluated individually
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={pillarScores.map(p => ({
                ...p,
                fill: getBarColor(p.score)
              }))}
              layout="vertical"
              margin={{ right: 20, top: 5, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                domain={[0, 100]} 
                tick={{ fill: '#9CA3AF' }} 
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: '#D1D5DB' }} 
                width={110}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(75, 85, 99, 0.3)' }}
              />
              <Bar 
                dataKey="score" 
                barSize={20} 
                radius={[0, 4, 4, 0]}
                // Use the fill property from the mapped data
                fill="#PLACEHOLDER" // This gets overridden by item.fill
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ESGPillarBreakdown; 