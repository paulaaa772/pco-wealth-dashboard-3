import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface AssetAllocation {
  name: string;
  currentWeight: number;
  targetWeight: number;
  color: string;
}

interface RebalanceAction {
  asset: string;
  action: 'buy' | 'sell';
  amount: number;
  severity: 'minor' | 'major' | 'critical';
  currentWeight: number;
  targetWeight: number;
  deviation: number;
}

interface PortfolioRebalancingProps {
  allocations: AssetAllocation[];
  actions: RebalanceAction[];
  portfolioValue: number;
  lastRebalanced: string;
  deviationThresholds: {
    minor: number;
    major: number;
    critical: number;
  };
}

export function PortfolioRebalancing({
  allocations = [],
  actions = [],
  portfolioValue = 0,
  lastRebalanced = '',
  deviationThresholds = { minor: 0.02, major: 0.05, critical: 0.1 }
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600';
      case 'major':
        return 'text-yellow-600';
      case 'minor':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const totalRebalancingAmount = actions.reduce((sum, action) => sum + action.amount, 0);
  const assetsNeedingRebalance = actions.length;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current vs Target Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocations}
                    dataKey="currentWeight"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    label
                  >
                    {allocations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Pie
                    data={allocations}
                    dataKey="targetWeight"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={95}
                    label
                  >
                    {allocations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} opacity={0.5} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatPercent(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rebalancing Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Portfolio Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(portfolioValue)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assets to Rebalance</p>
                  <p className="text-2xl font-bold">{assetsNeedingRebalance}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Rebalancing Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalRebalancingAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Rebalanced</p>
                  <p className="text-2xl font-bold">{new Date(lastRebalanced).toLocaleDateString()}</p>
                </div>
              </div>
              <Button className="w-full">Rebalance Portfolio</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rebalancing Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actions.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{action.asset}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-sm ${action.action === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                      {action.action.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatCurrency(action.amount)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {formatPercent(action.currentWeight)} → {formatPercent(action.targetWeight)}
                    </span>
                    <span className={`text-sm font-medium ${getSeverityColor(action.severity)}`}>
                      {action.deviation > 0 ? '+' : ''}{formatPercent(action.deviation)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {action.severity.charAt(0).toUpperCase() + action.severity.slice(1)} deviation
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 