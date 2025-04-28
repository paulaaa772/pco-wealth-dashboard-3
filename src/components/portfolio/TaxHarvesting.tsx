import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface HarvestingOpportunity {
  symbol: string;
  unrealizedLoss: number;
  potentialSavings: number;
  costBasis: number;
  marketValue: number;
  holdingPeriod: number;
  strategy: 'immediate' | 'wait' | 'watch';
  alternativeSecurity?: string;
  washSaleDate?: string;
}

interface TaxHarvestingProps {
  opportunities: HarvestingOpportunity[];
  totalSavings: number;
  ytdHarvestedLosses: number;
  lastAnalyzed: string;
  taxRate: number;
}

export function TaxHarvesting({
  opportunities = [],
  totalSavings = 0,
  ytdHarvestedLosses = 0,
  lastAnalyzed = '',
  taxRate = 0.37
}: TaxHarvestingProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'immediate':
        return 'text-green-600';
      case 'wait':
        return 'text-yellow-600';
      case 'watch':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const chartData = opportunities.map(opp => ({
    name: opp.symbol,
    loss: Math.abs(opp.unrealizedLoss),
    savings: opp.potentialSavings
  }));

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tax Loss Harvesting Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Potential Tax Savings</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSavings)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">YTD Harvested Losses</p>
                <p className="text-2xl font-bold">{formatCurrency(ytdHarvestedLosses)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Opportunities</p>
                <p className="text-2xl font-bold">{opportunities.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Analyzed</p>
                <p className="text-2xl font-bold">{formatDate(lastAnalyzed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Harvesting Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="loss" name="Unrealized Loss" fill="#ef4444" />
                  <Bar dataKey="savings" name="Potential Savings" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Harvesting Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opportunities.map((opp, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{opp.symbol}</h3>
                    <p className={`text-sm ${getStrategyColor(opp.strategy)}`}>
                      {opp.strategy.charAt(0).toUpperCase() + opp.strategy.slice(1)} Harvest
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Potential Savings</p>
                    <p className="font-medium text-green-600">{formatCurrency(opp.potentialSavings)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Cost Basis</p>
                    <p className="font-medium">{formatCurrency(opp.costBasis)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Market Value</p>
                    <p className="font-medium">{formatCurrency(opp.marketValue)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Unrealized Loss</p>
                    <p className="font-medium text-red-600">{formatCurrency(opp.unrealizedLoss)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Holding Period</p>
                    <p className="font-medium">{opp.holdingPeriod} days</p>
                  </div>
                </div>

                {opp.alternativeSecurity && (
                  <div className="text-sm">
                    <p className="text-gray-500">Alternative Security</p>
                    <p className="font-medium">{opp.alternativeSecurity}</p>
                  </div>
                )}

                {opp.washSaleDate && (
                  <div className="text-sm">
                    <p className="text-gray-500">Wash Sale Date</p>
                    <p className="font-medium">{formatDate(opp.washSaleDate)}</p>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  disabled={opp.strategy !== 'immediate'}
                >
                  Harvest Loss
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 