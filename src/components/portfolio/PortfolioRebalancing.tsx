import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

interface AssetAllocation {
  name: string;
  currentAmount: number;
  currentWeight: number;
  targetWeight: number;
  deviation: number;
  action: 'buy' | 'sell' | 'hold';
  recommendedAmount: number;
}

interface RebalancingThresholds {
  minor: number;  // e.g., 2%
  major: number;  // e.g., 5%
  critical: number;  // e.g., 10%
}

interface PortfolioRebalancingProps {
  allocations: AssetAllocation[];
  totalValue: number;
  thresholds: RebalancingThresholds;
  lastRebalanced: string;
}

const COLORS = {
  stocks: '#8884d8',
  bonds: '#82ca9d',
  cash: '#ffc658',
  commodities: '#ff8042',
  realEstate: '#a4de6c',
  international: '#d0ed57'
};

export function PortfolioRebalancing({ 
  allocations, 
  totalValue,
  thresholds,
  lastRebalanced 
}: PortfolioRebalancingProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  const getDeviationSeverity = (deviation: number) => {
    const absDeviation = Math.abs(deviation);
    if (absDeviation >= thresholds.critical) return 'critical';
    if (absDeviation >= thresholds.major) return 'major';
    if (absDeviation >= thresholds.minor) return 'minor';
    return 'none';
  };

  const getActionColor = (action: AssetAllocation['action']) => {
    switch (action) {
      case 'buy': return 'text-green-600';
      case 'sell': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getActionIcon = (action: AssetAllocation['action']) => {
    switch (action) {
      case 'buy':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'sell':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Portfolio Allocation</CardTitle>
            <span className="text-sm text-gray-500">
              Last rebalanced: {new Date(lastRebalanced).toLocaleDateString()}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Allocation Charts */}
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocations}
                    dataKey="currentWeight"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name} ${formatPercent(entry.currentWeight)}`}
                  >
                    {allocations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Pie
                    data={allocations}
                    dataKey="targetWeight"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={100}
                    label={false}
                  >
                    {allocations.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#8884d8'} 
                        opacity={0.5}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${formatPercent(value)}`,
                      name === 'currentWeight' ? 'Current' : 'Target'
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Rebalancing Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recommended Actions</h3>
              <div className="space-y-3">
                {allocations.map((allocation, index) => {
                  const severity = getDeviationSeverity(allocation.deviation);
                  return (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border ${
                        severity === 'critical' ? 'border-red-200 bg-red-50' :
                        severity === 'major' ? 'border-yellow-200 bg-yellow-50' :
                        severity === 'minor' ? 'border-blue-200 bg-blue-50' :
                        'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getActionIcon(allocation.action)}
                          <span className="font-medium">{allocation.name}</span>
                        </div>
                        <span className={`text-sm font-medium ${getActionColor(allocation.action)}`}>
                          {allocation.action === 'hold' ? 'No action needed' : 
                           `${allocation.action === 'buy' ? 'Buy' : 'Sell'} ${formatCurrency(Math.abs(allocation.recommendedAmount))}`}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Current: {formatPercent(allocation.currentWeight)}</span>
                          <span>Target: {formatPercent(allocation.targetWeight)}</span>
                          <span className={`font-medium ${
                            allocation.deviation > 0 ? 'text-red-600' : 
                            allocation.deviation < 0 ? 'text-green-600' : 
                            'text-gray-600'
                          }`}>
                            Deviation: {allocation.deviation > 0 ? '+' : ''}{formatPercent(allocation.deviation)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rebalancing Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Rebalancing Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Total Portfolio Value</div>
              <div className="text-xl font-bold">{formatCurrency(totalValue)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Assets to Rebalance</div>
              <div className="text-xl font-bold">
                {allocations.filter(a => a.action !== 'hold').length} of {allocations.length}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Total Rebalancing Amount</div>
              <div className="text-xl font-bold">
                {formatCurrency(
                  allocations
                    .filter(a => a.action !== 'hold')
                    .reduce((sum, a) => sum + Math.abs(a.recommendedAmount), 0)
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 