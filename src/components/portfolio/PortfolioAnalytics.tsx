import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface PerformanceMetric {
  date: string;
  value: number;
  benchmark: number;
}

interface RiskMetric {
  label: string;
  value: number;
  change: number;
  description: string;
}

interface SectorExposure {
  sector: string;
  allocation: number;
  risk: number;
}

interface PortfolioAnalyticsProps {
  performanceData: PerformanceMetric[];
  riskMetrics: RiskMetric[];
  sectorExposure: SectorExposure[];
  sharpeRatio: number;
  beta: number;
  alpha: number;
  volatility: number;
  maxDrawdown: number;
  trackingError: number;
}

export function PortfolioAnalytics({
  performanceData,
  riskMetrics,
  sectorExposure,
  sharpeRatio,
  beta,
  alpha,
  volatility,
  maxDrawdown,
  trackingError
}: PortfolioAnalyticsProps) {
  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  const formatDecimal = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Performance vs Benchmark */}
      <Card>
        <CardHeader>
          <CardTitle>Performance vs Benchmark</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                />
                <YAxis 
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(2)}%`, 'Return']}
                  labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="Portfolio" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  name="Benchmark" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Key Risk Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Risk Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Sharpe Ratio</dt>
                <dd className="text-sm font-medium">{formatDecimal(sharpeRatio)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Beta</dt>
                <dd className="text-sm font-medium">{formatDecimal(beta)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Alpha</dt>
                <dd className="text-sm font-medium">{formatPercent(alpha)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Volatility</dt>
                <dd className="text-sm font-medium">{formatPercent(volatility)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Max Drawdown</dt>
                <dd className="text-sm font-medium">{formatPercent(maxDrawdown)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Tracking Error</dt>
                <dd className="text-sm font-medium">{formatPercent(trackingError)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Sector Risk Exposure */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Sector Risk Exposure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sectorExposure}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sector" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Exposure']}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="allocation"
                    name="Allocation"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                  <Area
                    type="monotone"
                    dataKey="risk"
                    name="Risk"
                    stackId="2"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Metrics Details */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {riskMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <span className={`text-sm font-medium ${
                    metric.change > 0 ? 'text-green-600' : 
                    metric.change < 0 ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {metric.change > 0 ? '↑' : metric.change < 0 ? '↓' : '–'} {formatPercent(Math.abs(metric.value))}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 