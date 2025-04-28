import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface PortfolioSummaryProps {
  portfolioValue: number;
  todayChange: number;
  todayChangePercent: number;
  allTimeReturn: number;
  allTimeReturnPercent: number;
  totalDeposits: number;
  performanceData: {
    date: string;
    value: number;
  }[];
}

export function PortfolioSummary({
  portfolioValue,
  todayChange,
  todayChangePercent,
  allTimeReturn,
  allTimeReturnPercent,
  totalDeposits,
  performanceData
}: PortfolioSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Portfolio Value */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(portfolioValue)}</div>
          <div className={`text-xs ${todayChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {todayChange >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(todayChange))} ({formatPercent(todayChangePercent)}) today
          </div>
        </CardContent>
      </Card>

      {/* Total Return */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Return</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(allTimeReturn)}</div>
          <div className={`text-xs ${allTimeReturnPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {allTimeReturnPercent >= 0 ? '↑' : '↓'} {formatPercent(allTimeReturnPercent)}
          </div>
        </CardContent>
      </Card>

      {/* Total Deposits */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalDeposits)}</div>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)} 
                />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "Value"]} 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 