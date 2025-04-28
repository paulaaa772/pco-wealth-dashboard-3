import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface MetricData {
  label: string;
  value: number;
  change: number;
  changePercent: number;
  trend: Array<{ value: number }>;
  prefix?: string;
  suffix?: string;
}

interface PortfolioMetricsProps {
  metrics: MetricData[];
}

export function PortfolioMetrics({ metrics }: PortfolioMetricsProps) {
  const formatValue = (value: number, prefix?: string, suffix?: string) => {
    const formattedValue = new Intl.NumberFormat('en-US', {
      style: prefix === '$' ? 'currency' : 'decimal',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(value));

    return `${prefix || ''}${formattedValue}${suffix || ''}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-2xl font-bold">
                  {formatValue(metric.value, metric.prefix, metric.suffix)}
                </div>
                <div className={`text-xs ${metric.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.change >= 0 ? '↑' : '↓'} {formatValue(metric.change, metric.prefix, metric.suffix)}
                  {' '}({metric.changePercent >= 0 ? '+' : ''}{metric.changePercent.toFixed(2)}%)
                </div>
              </div>
              
              {/* Sparkline Chart */}
              <div className="h-[64px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metric.trend}>
                    <defs>
                      <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop 
                          offset="5%" 
                          stopColor={metric.change >= 0 ? '#22c55e' : '#ef4444'} 
                          stopOpacity={0.34}
                        />
                        <stop 
                          offset="95%" 
                          stopColor={metric.change >= 0 ? '#22c55e' : '#ef4444'} 
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={metric.change >= 0 ? '#22c55e' : '#ef4444'}
                      strokeWidth={2}
                      fill={`url(#gradient-${index})`}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 