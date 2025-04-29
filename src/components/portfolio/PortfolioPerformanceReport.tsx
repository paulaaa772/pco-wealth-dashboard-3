import { useState, useEffect } from 'react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import NetWorthChart from '../dashboard/NetWorthChart';
import { PerformanceMetric, RiskMetric, SectorAllocation } from '@/lib/portfolio/mockPerformanceData';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ScaleIcon, ChartPieIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface PortfolioPerformanceProps {
  totalValue?: number;
  performanceData: PerformanceMetric[];
  riskMetrics: RiskMetric[];
  sectorAllocations: SectorAllocation[];
  totalReturn: number;
  ytdReturn: number;
  oneYearReturn: number;
  threeYearReturn: number;
  fiveYearReturn: number;
  benchmarkName?: string;
  isLoading?: boolean;
}

export function PortfolioPerformanceReport({
  totalValue,
  performanceData = [],
  riskMetrics = [],
  sectorAllocations = [],
  totalReturn = 0,
  ytdReturn = 0,
  oneYearReturn = 0,
  threeYearReturn = 0,
  fiveYearReturn = 0,
  benchmarkName = 'S&P 500',
  isLoading = false,
}: PortfolioPerformanceProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Validate data
      if (!Array.isArray(performanceData) || !Array.isArray(riskMetrics) || !Array.isArray(sectorAllocations)) {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [performanceData, riskMetrics, sectorAllocations]);

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

  const displayTotalValue = totalValue ?? performanceData[performanceData.length - 1]?.portfolioValue ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-700">
        Error loading portfolio performance: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Value Card */}
        <div className="bg-[#1E2D4E] rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-1">Total Portfolio Value</h4>
          <p className="text-2xl font-semibold text-white">{formatCurrency(displayTotalValue)}</p> 
        </div>
        
        {/* Total Return Card */}
        <div className="bg-[#1E2D4E] rounded-lg p-4">
           <h4 className="text-sm font-medium text-gray-400 mb-1">Total Return</h4>
           <p className={`text-2xl font-semibold ${getReturnColor(totalReturn)}`}>{formatPercent(totalReturn)}</p>
        </div>

        {/* YTD Return Card */}
        <div className="bg-[#1E2D4E] rounded-lg p-4">
           <h4 className="text-sm font-medium text-gray-400 mb-1">YTD Return</h4>
           <p className={`text-2xl font-semibold ${getReturnColor(ytdReturn)}`}>{formatPercent(ytdReturn)}</p>
        </div>

        {/* Benchmark placeholder (or dynamically show 1Y return) */}
        <div className="bg-[#1E2D4E] rounded-lg p-4">
           <h4 className="text-sm font-medium text-gray-400 mb-1">1-Year Return</h4>
           <p className={`text-2xl font-semibold ${getReturnColor(oneYearReturn)}`}>{formatPercent(oneYearReturn)}</p>
        </div>
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
                  tickFormatter={(value) => formatPercent(value)}
                />
                <Tooltip
                  formatter={(value: number) => formatPercent(value)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="cumulativeReturn"
                  name="Portfolio"
                  stroke="#4F46E5"
                  fillOpacity={1}
                  fill="url(#portfolioGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="benchmarkReturn"
                  name={benchmarkName}
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#benchmarkGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risk Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskMetrics.map((metric, index) => (
                <div key={index} className="grid grid-cols-2 gap-4">
                  <div className="text-sm text-gray-500">{metric.period}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-500">Alpha</div>
                      <div>{formatPercent(metric.alpha)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Beta</div>
                      <div>{metric.beta.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Sharpe</div>
                      <div>{metric.sharpeRatio.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Max DD</div>
                      <div className="text-red-600">{formatPercent(metric.maxDrawdown)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sector Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Sector Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sectorAllocations.map((allocation, index) => (
                <div key={index} className="grid grid-cols-3 gap-4">
                  <div className="text-sm">{allocation.sector}</div>
                  <div className="text-right">{formatPercent(allocation.weight)}</div>
                  <div className={`text-right ${getReturnColor(allocation.return)}`}>
                    {formatPercent(allocation.return)}
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