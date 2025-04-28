import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface RiskMetric {
  name: string;
  value: number;
  change: number;
  description: string;
}

interface SectorRisk {
  sector: string;
  allocation: number;
  risk: number;
  return: number;
}

interface PortfolioAnalyticsProps {
  performanceData: Array<{
    date: string;
    portfolioValue: number;
    benchmarkValue: number;
  }>;
  riskMetrics: RiskMetric[];
  sectorRisks: SectorRisk[];
}

export function PortfolioAnalytics({ 
  performanceData = [], 
  riskMetrics = [], 
  sectorRisks = [] 
}: PortfolioAnalyticsProps) {
  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;
  const getChangeColor = (value: number) => value >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance vs Benchmark</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis 
                  tickFormatter={formatPercent}
                />
                <Tooltip
                  formatter={(value: number) => formatPercent(value)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="portfolioValue"
                  name="Portfolio"
                  stroke="#4F46E5"
                  fill="url(#portfolioGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="benchmarkValue"
                  name="Benchmark"
                  stroke="#10B981"
                  fill="url(#benchmarkGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{metric.name}</h3>
                    <p className="text-sm text-gray-500">{metric.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPercent(metric.value)}</p>
                    <p className={`text-sm ${getChangeColor(metric.change)}`}>
                      {metric.change > 0 ? '+' : ''}{formatPercent(metric.change)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sector Risk Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sectorRisks.map((sector, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{sector.sector}</span>
                    <span className={getChangeColor(sector.return)}>
                      {formatPercent(sector.return)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${sector.allocation * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Allocation: {formatPercent(sector.allocation)}</span>
                    <span>Risk: {formatPercent(sector.risk)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 