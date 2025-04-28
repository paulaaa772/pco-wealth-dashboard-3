import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { ResponsiveContainer as SparklineContainer, LineChart, Line } from 'recharts';

interface IncomeSource {
  name: string;
  type: 'dividend' | 'interest' | 'distribution';
  frequency: 'monthly' | 'quarterly' | 'annual';
  amount: number;
  nextPayment: string;
  yield: number;
  paymentHistory: Array<{
    date: string;
    amount: number;
  }>;
}

interface MonthlyIncome {
  month: string;
  dividends: number;
  interest: number;
  distributions: number;
}

interface PortfolioIncomeProps {
  projectedAnnualIncome: number;
  ytdIncome: number;
  lastYearIncome: number;
  incomeSources: IncomeSource[];
  monthlyIncome: MonthlyIncome[];
  annualTarget: number;
}

export function PortfolioIncome({
  projectedAnnualIncome = 0,
  ytdIncome = 0,
  lastYearIncome = 0,
  incomeSources = [],
  monthlyIncome = [],
  annualTarget = 0
}: PortfolioIncomeProps) {
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getIncomeTypeColor = (type: string) => {
    switch (type) {
      case 'dividend':
        return 'text-blue-600';
      case 'interest':
        return 'text-green-600';
      case 'distribution':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const yearOverYearGrowth = ((projectedAnnualIncome - lastYearIncome) / lastYearIncome) * 100;
  const progressToTarget = (ytdIncome / annualTarget) * 100;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projected Annual Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{formatCurrency(projectedAnnualIncome)}</p>
              <p className={`text-sm ${yearOverYearGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {yearOverYearGrowth >= 0 ? '↑' : '↓'} {formatPercent(Math.abs(yearOverYearGrowth / 100))} YoY
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>YTD Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{formatCurrency(ytdIncome)}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(progressToTarget, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">{formatPercent(progressToTarget / 100)} of target</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last Year&apos;s Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(lastYearIncome)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{incomeSources.length}</p>
            <p className="text-sm text-gray-500">Active sources</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Income Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyIncome}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="dividends" name="Dividends" stackId="a" fill="#3b82f6" />
                <Bar dataKey="interest" name="Interest" stackId="a" fill="#22c55e" />
                <Bar dataKey="distributions" name="Distributions" stackId="a" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {incomeSources.map((source, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{source.name}</CardTitle>
                <span className={`text-sm font-medium ${getIncomeTypeColor(source.type)}`}>
                  {source.type.charAt(0).toUpperCase() + source.type.slice(1)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Payment Amount</p>
                    <p className="font-medium">{formatCurrency(source.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Frequency</p>
                    <p className="font-medium">
                      {source.frequency.charAt(0).toUpperCase() + source.frequency.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Next Payment</p>
                    <p className="font-medium">{formatDate(source.nextPayment)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Yield</p>
                    <p className="font-medium">{formatPercent(source.yield)}</p>
                  </div>
                </div>

                <div className="h-[50px]">
                  <SparklineContainer width="100%" height="100%">
                    <LineChart data={source.paymentHistory}>
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </SparklineContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 