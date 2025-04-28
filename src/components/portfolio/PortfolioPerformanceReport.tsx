import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface PerformanceMetric {
  date: string;
  portfolioValue: number;
  benchmarkValue: number;
  cumulativeReturn: number;
  benchmarkReturn: number;
}

interface RiskMetric {
  period: string;
  alpha: number;
  beta: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
}

interface SectorAllocation {
  sector: string;
  weight: number;
  return: number;
}

interface PortfolioPerformanceProps {
  performanceData: PerformanceMetric[];
  riskMetrics: RiskMetric[];
  sectorAllocations: SectorAllocation[];
  totalReturn: number;
  ytdReturn: number;
  oneYearReturn: number;
  threeYearReturn: number;
  fiveYearReturn: number;
  benchmarkName: string;
}

export function PortfolioPerformanceReport({
  performanceData,
  riskMetrics,
  sectorAllocations,
  totalReturn,
  ytdReturn,
  oneYearReturn,
  threeYearReturn,
  fiveYearReturn,
  benchmarkName
}: PortfolioPerformanceProps) {
  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getReturnColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">YTD Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getReturnColor(ytdReturn)}`}>
              {formatPercent(ytdReturn)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">1Y Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getReturnColor(oneYearReturn)}`}>
              {formatPercent(oneYearReturn)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">3Y Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getReturnColor(threeYearReturn)}`}>
              {formatPercent(threeYearReturn)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">5Y Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getReturnColor(fiveYearReturn)}`}>
              {formatPercent(fiveYearReturn)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getReturnColor(totalReturn)}`}>
              {formatPercent(totalReturn)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance vs {benchmarkName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(2)}%`, 'Return']}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Legend />
                <Area
                  name="Portfolio"
                  type="monotone"
                  dataKey="cumulativeReturn"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                />
                <Area
                  name={benchmarkName}
                  type="monotone"
                  dataKey="benchmarkReturn"
                  stroke="#6b7280"
                  fill="#6b7280"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {riskMetrics.map((metric, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-500 mb-2">{metric.period}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Alpha</span>
                    <span className="font-medium">{formatPercent(metric.alpha)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Beta</span>
                    <span className="font-medium">{metric.beta.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sharpe Ratio</span>
                    <span className="font-medium">{metric.sharpeRatio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Drawdown</span>
                    <span className="font-medium text-red-600">{formatPercent(metric.maxDrawdown)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volatility</span>
                    <span className="font-medium">{formatPercent(metric.volatility)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sector Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Sector Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sectorAllocations.map((sector, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-32 text-sm">{sector.sector}</div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${sector.weight}%` }}
                    />
                  </div>
                </div>
                <div className="w-24 text-right">
                  <span className={`font-medium ${getReturnColor(sector.return)}`}>
                    {formatPercent(sector.return)}
                  </span>
                </div>
                <div className="w-24 text-right text-gray-500">
                  {formatPercent(sector.weight)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 