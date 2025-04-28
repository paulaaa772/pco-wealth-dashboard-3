import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface IncomeSource {
  symbol: string;
  name: string;
  type: 'dividend' | 'interest' | 'distribution';
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  yield: number;
  nextPaymentDate: string;
  paymentHistory: {
    date: string;
    amount: number;
  }[];
}

interface MonthlyIncome {
  month: string;
  dividends: number;
  interest: number;
  distributions: number;
  total: number;
}

interface PortfolioIncomeProps {
  incomeSources: IncomeSource[];
  monthlyIncome: MonthlyIncome[];
  projectedAnnualIncome: number;
  lastYearIncome: number;
  ytdIncome: number;
  incomeGrowth: number;
}

export function PortfolioIncome({
  incomeSources,
  monthlyIncome,
  projectedAnnualIncome,
  lastYearIncome,
  ytdIncome,
  incomeGrowth
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
    }).format(value / 100);
  };

  const getNextPayment = (source: IncomeSource) => {
    const nextDate = new Date(source.nextPaymentDate);
    const today = new Date();
    const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return `${formatCurrency(source.amount)} in ${daysUntil} days`;
  };

  const getIncomeTypeColor = (type: IncomeSource['type']) => {
    switch (type) {
      case 'dividend': return 'text-blue-600';
      case 'interest': return 'text-green-600';
      case 'distribution': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getFrequencyLabel = (frequency: IncomeSource['frequency']) => {
    switch (frequency) {
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'semi-annual': return 'Semi-Annual';
      case 'annual': return 'Annual';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Income Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Projected Annual Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(projectedAnnualIncome)}</div>
            <p className={`text-sm ${incomeGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {incomeGrowth >= 0 ? '↑' : '↓'} {formatPercent(Math.abs(incomeGrowth))} vs last year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">YTD Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(ytdIncome)}</div>
            <p className="text-sm text-gray-500">
              {formatPercent((ytdIncome / projectedAnnualIncome) * 100)} of annual target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Last Year Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(lastYearIncome)}</div>
            <p className="text-sm text-gray-500">Total income received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Income Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incomeSources.length}</div>
            <p className="text-sm text-gray-500">Active income streams</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Income Chart */}
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
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar name="Dividends" dataKey="dividends" stackId="a" fill="#3b82f6" />
                <Bar name="Interest" dataKey="interest" stackId="a" fill="#22c55e" />
                <Bar name="Distributions" dataKey="distributions" stackId="a" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Income Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Income Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incomeSources.map((source, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{source.symbol}</h4>
                    <p className="text-sm text-gray-500">{source.name}</p>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${getIncomeTypeColor(source.type)}`}>
                      {formatCurrency(source.amount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getFrequencyLabel(source.frequency)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-gray-500">Yield: </span>
                    <span className="font-medium">{formatPercent(source.yield)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Next Payment: </span>
                    <span className="font-medium">{getNextPayment(source)}</span>
                  </div>
                </div>

                {/* Payment History Chart */}
                <div className="h-[100px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={source.paymentHistory}>
                      <YAxis 
                        domain={['dataMin', 'dataMax']}
                        hide={true}
                      />
                      <XAxis 
                        dataKey="date"
                        hide={true}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Payment']}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke={
                          source.type === 'dividend' ? '#3b82f6' :
                          source.type === 'interest' ? '#22c55e' :
                          '#a855f7'
                        }
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 