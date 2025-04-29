'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  BarChart,
  Bar,
  ComposedChart,
  Scatter
} from 'recharts';
import { startOfYear, subDays, subMonths, subYears, format, parseISO, isValid } from 'date-fns';

// Define major market indices for benchmark comparison
const BENCHMARKS = [
  { id: 'sp500', name: 'S&P 500', color: '#10B981', returnYTD: 25.3, return1Y: 31.2, return3Y: 9.8, return5Y: 15.1 },
  { id: 'nasdaq', name: 'NASDAQ', color: '#3B82F6', returnYTD: 29.7, return1Y: 37.5, return3Y: 8.1, return5Y: 19.8 },
  { id: 'djia', name: 'Dow Jones', color: '#EF4444', returnYTD: 18.9, return1Y: 25.6, return3Y: 7.2, return5Y: 12.4 },
];

// Time range options
const TIME_RANGES = [
  { id: '1m', label: '1M', days: 30 },
  { id: '3m', label: '3M', days: 90 },
  { id: '6m', label: '6M', days: 180 },
  { id: 'ytd', label: 'YTD', daysFunc: () => Math.ceil((Date.now() - startOfYear(new Date()).getTime()) / (1000 * 60 * 60 * 24)) },
  { id: '1y', label: '1Y', days: 365 },
  { id: '3y', label: '3Y', days: 365 * 3 },
  { id: '5y', label: '5Y', days: 365 * 5 },
  { id: 'max', label: 'MAX', days: 365 * 10 }, // Using 10 years as "max" for mock data
];

// Generate sample performance history for portfolio with varying volatility based on time ranges
function generateHistoricalData(totalDays: number, currentValue: number) {
  const data = [];
  const startDate = subDays(new Date(), totalDays);
  let value = currentValue / (1 + (Math.random() * 0.3 + 0.1)); // Start with lower value
  
  // Generate more frequent data points for recent history, less frequent for older history
  for (let i = totalDays; i >= 0; i--) {
    const date = subDays(new Date(), i);
    
    // Add more volatility for older data
    const dailyChange = (Math.random() * 2 - 1) * (i > 90 ? 0.005 : 0.003);
    value = value * (1 + dailyChange);
    
    // Only include a subset of points to prevent overloading the chart
    if (i === 0 || i === totalDays || i % Math.max(1, Math.floor(totalDays / 100)) === 0) {
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        value: Math.round(value * 100) / 100
      });
    }
  }
  
  return data;
}

// Define analytics component
export default function EnhancedPerformanceAnalytics() {
  const { manualAccounts, isLoading } = useManualAccounts();
  const [selectedTimeRange, setSelectedTimeRange] = useState('1y');
  const [selectedBenchmarks, setSelectedBenchmarks] = useState(['sp500']);
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
  
  // Calculate total portfolio value
  const totalPortfolioValue = useMemo(() => {
    return manualAccounts.reduce((sum, account) => sum + account.totalValue, 0);
  }, [manualAccounts]);
  
  // Generate historical performance data
  const historicalData = useMemo(() => {
    const selectedRange = TIME_RANGES.find(r => r.id === selectedTimeRange) || TIME_RANGES[4]; // Default to 1Y
    const days = selectedRange.daysFunc ? selectedRange.daysFunc() : selectedRange.days;
    
    return generateHistoricalData(days, totalPortfolioValue);
  }, [selectedTimeRange, totalPortfolioValue]);
  
  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (historicalData.length < 2) return { totalReturn: 0, annualizedReturn: 0, volatility: 0, maxDrawdown: 0, sharpeRatio: 0 };
    
    const startValue = historicalData[0].value;
    const endValue = historicalData[historicalData.length - 1].value;
    const totalReturn = ((endValue / startValue) - 1) * 100;
    
    // Calculate daily returns for volatility
    const returns = [];
    for (let i = 1; i < historicalData.length; i++) {
      const prevValue = historicalData[i-1].value;
      const currValue = historicalData[i].value;
      returns.push((currValue / prevValue) - 1);
    }
    
    // Calculate volatility (standard deviation of returns)
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized
    
    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = historicalData[0].value;
    
    for (const point of historicalData) {
      if (point.value > peak) {
        peak = point.value;
      }
      
      const drawdown = ((peak - point.value) / peak) * 100;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
    
    // Calculate Sharpe ratio (assuming risk-free rate of 2%)
    const riskFreeRate = 2;
    const selectedRange = TIME_RANGES.find(r => r.id === selectedTimeRange) || TIME_RANGES[4];
    const days = selectedRange.daysFunc ? selectedRange.daysFunc() : selectedRange.days;
    const yearsElapsed = days / 365;
    
    // Annualized return calculation
    const annualizedReturn = yearsElapsed > 0
      ? (Math.pow((endValue / startValue), 1 / yearsElapsed) - 1) * 100
      : totalReturn;
      
    const sharpeRatio = volatility > 0 ? (annualizedReturn - riskFreeRate) / volatility : 0;
    
    return {
      totalReturn,
      annualizedReturn,
      volatility,
      maxDrawdown,
      sharpeRatio
    };
  }, [historicalData, selectedTimeRange]);
  
  // Prepare chart data with benchmarks
  const chartData = useMemo(() => {
    if (historicalData.length === 0) return [];
    
    // Start with portfolio data
    const result = historicalData.map(point => {
      const chartPoint = { date: point.date, portfolio: point.value };
      
      // Add benchmarks
      selectedBenchmarks.forEach(benchmarkId => {
        const benchmark = BENCHMARKS.find(b => b.id === benchmarkId);
        if (benchmark) {
          // Add randomized values for the benchmark based on its historical performance
          const startValue = 100;
          const endValue = startValue * (1 + (benchmark.return1Y / 100));
          const daysSinceStart = Math.round((parseISO(point.date).getTime() - parseISO(historicalData[0].date).getTime()) / (1000 * 60 * 60 * 24));
          const progress = daysSinceStart / 365;
          
          // Add some randomness to the benchmark
          const randomFactor = 1 + (Math.random() * 0.1 - 0.05);
          const benchmarkValue = startValue + (endValue - startValue) * progress * randomFactor;
          
          chartPoint[benchmarkId] = benchmarkValue;
        }
      });
      
      return chartPoint;
    });
    
    return result;
  }, [historicalData, selectedBenchmarks]);
  
  // Normalize chart data to show percentage change instead of absolute values
  const normalizedChartData = useMemo(() => {
    if (chartData.length === 0) return [];
    
    const firstPoint = chartData[0];
    const startPortfolioValue = firstPoint.portfolio;
    
    return chartData.map(point => {
      const result = { date: point.date };
      
      // Calculate percent change for portfolio
      result.portfolio = ((point.portfolio / startPortfolioValue) - 1) * 100;
      
      // Calculate percent change for benchmarks
      selectedBenchmarks.forEach(benchmarkId => {
        if (point[benchmarkId] !== undefined && firstPoint[benchmarkId] !== undefined) {
          result[benchmarkId] = ((point[benchmarkId] / firstPoint[benchmarkId]) - 1) * 100;
        }
      });
      
      return result;
    });
  }, [chartData]);
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-[#1E2D4E] rounded-lg p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[#1E2D4E] rounded-lg p-6">
      <div className="flex flex-col space-y-6">
        {/* Performance Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#2A3C61] rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-1">Total Portfolio Value</h4>
            <p className="text-2xl font-semibold text-white">
              ${totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="bg-[#2A3C61] rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-1">Total Return</h4>
            <p className={`text-2xl font-semibold ${performanceMetrics.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {performanceMetrics.totalReturn.toFixed(2)}%
            </p>
          </div>
          
          <div className="bg-[#2A3C61] rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-1">Annualized Return</h4>
            <p className={`text-2xl font-semibold ${performanceMetrics.annualizedReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {performanceMetrics.annualizedReturn.toFixed(2)}%
            </p>
          </div>
          
          <div className="bg-[#2A3C61] rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-1">Volatility</h4>
            <p className="text-2xl font-semibold text-white">
              {performanceMetrics.volatility.toFixed(2)}%
            </p>
          </div>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex justify-between">
          <div className="flex space-x-1 bg-[#2A3C61] rounded-lg p-1">
            {TIME_RANGES.map(range => (
              <button
                key={range.id}
                onClick={() => setSelectedTimeRange(range.id)}
                className={`px-3 py-1 rounded-md ${
                  selectedTimeRange === range.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-[#344571]'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          <div className="flex space-x-1 bg-[#2A3C61] rounded-lg p-1">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 rounded-md ${
                chartType === 'area' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-[#344571]'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded-md ${
                chartType === 'line' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-[#344571]'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded-md ${
                chartType === 'bar' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-[#344571]'
              }`}
            >
              Bar
            </button>
          </div>
        </div>
        
        {/* Performance Chart */}
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={normalizedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  {BENCHMARKS.map(benchmark => (
                    <linearGradient key={benchmark.id} id={`${benchmark.id}Gradient`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={benchmark.color} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={benchmark.color} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    if (!isValid(parseISO(date))) return '';
                    return format(parseISO(date), 'MMM dd');
                  }}
                  stroke="#9CA3AF"
                />
                <YAxis 
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                  stroke="#9CA3AF"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F9FAFB' }}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
                  labelFormatter={(date) => {
                    if (!isValid(parseISO(date))) return '';
                    return format(parseISO(date), 'MMMM d, yyyy');
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="portfolio" 
                  name="Portfolio" 
                  stroke="#4F46E5" 
                  fill="url(#portfolioGradient)" 
                  strokeWidth={2}
                />
                {selectedBenchmarks.map(benchmarkId => {
                  const benchmark = BENCHMARKS.find(b => b.id === benchmarkId);
                  if (!benchmark) return null;
                  
                  return (
                    <Area 
                      key={benchmark.id}
                      type="monotone" 
                      dataKey={benchmark.id} 
                      name={benchmark.name} 
                      stroke={benchmark.color} 
                      fill={`url(#${benchmark.id}Gradient)`} 
                      strokeWidth={2}
                    />
                  );
                })}
              </AreaChart>
            ) : chartType === 'line' ? (
              <LineChart data={normalizedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    if (!isValid(parseISO(date))) return '';
                    return format(parseISO(date), 'MMM dd');
                  }}
                  stroke="#9CA3AF"
                />
                <YAxis 
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                  stroke="#9CA3AF"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F9FAFB' }}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
                  labelFormatter={(date) => {
                    if (!isValid(parseISO(date))) return '';
                    return format(parseISO(date), 'MMMM d, yyyy');
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="portfolio" 
                  name="Portfolio" 
                  stroke="#4F46E5" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                {selectedBenchmarks.map(benchmarkId => {
                  const benchmark = BENCHMARKS.find(b => b.id === benchmarkId);
                  if (!benchmark) return null;
                  
                  return (
                    <Line 
                      key={benchmark.id}
                      type="monotone" 
                      dataKey={benchmark.id} 
                      name={benchmark.name} 
                      stroke={benchmark.color} 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  );
                })}
              </LineChart>
            ) : (
              <BarChart data={normalizedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    if (!isValid(parseISO(date))) return '';
                    return format(parseISO(date), 'MMM dd');
                  }}
                  stroke="#9CA3AF"
                />
                <YAxis 
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                  stroke="#9CA3AF"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F9FAFB' }}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
                  labelFormatter={(date) => {
                    if (!isValid(parseISO(date))) return '';
                    return format(parseISO(date), 'MMMM d, yyyy');
                  }}
                />
                <Legend />
                <Bar dataKey="portfolio" name="Portfolio" fill="#4F46E5" />
                {selectedBenchmarks.map(benchmarkId => {
                  const benchmark = BENCHMARKS.find(b => b.id === benchmarkId);
                  if (!benchmark) return null;
                  
                  return (
                    <Bar key={benchmark.id} dataKey={benchmark.id} name={benchmark.name} fill={benchmark.color} />
                  );
                })}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Benchmark Selection */}
        <div className="bg-[#2A3C61] rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Benchmark Comparison</h3>
          <div className="flex flex-wrap gap-3">
            {BENCHMARKS.map(benchmark => (
              <div key={benchmark.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`benchmark-${benchmark.id}`}
                  checked={selectedBenchmarks.includes(benchmark.id)}
                  onChange={() => {
                    if (selectedBenchmarks.includes(benchmark.id)) {
                      setSelectedBenchmarks(selectedBenchmarks.filter(id => id !== benchmark.id));
                    } else {
                      setSelectedBenchmarks([...selectedBenchmarks, benchmark.id]);
                    }
                  }}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`benchmark-${benchmark.id}`} className="text-sm font-medium text-gray-300">
                  {benchmark.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#2A3C61] rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Risk Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Max Drawdown</span>
                <span className="text-sm font-medium text-red-500">-{performanceMetrics.maxDrawdown.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Volatility (Annualized)</span>
                <span className="text-sm font-medium">{performanceMetrics.volatility.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Sharpe Ratio</span>
                <span className="text-sm font-medium">{performanceMetrics.sharpeRatio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Best Day</span>
                <span className="text-sm font-medium text-green-500">+{(Math.random() * 3 + 1).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Worst Day</span>
                <span className="text-sm font-medium text-red-500">-{(Math.random() * 3 + 1).toFixed(2)}%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#2A3C61] rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Return Comparison</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Portfolio (YTD)</span>
                <span className={`text-sm font-medium ${performanceMetrics.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(performanceMetrics.totalReturn * 0.75).toFixed(2)}%
                </span>
              </div>
              
              {BENCHMARKS.map(benchmark => (
                <div key={benchmark.id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{benchmark.name} (YTD)</span>
                  <span className={`text-sm font-medium ${benchmark.returnYTD >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {benchmark.returnYTD.toFixed(2)}%
                  </span>
                </div>
              ))}
              
              <div className="pt-2 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Portfolio (1Y)</span>
                  <span className={`text-sm font-medium ${performanceMetrics.annualizedReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {performanceMetrics.annualizedReturn.toFixed(2)}%
                  </span>
                </div>
                
                {BENCHMARKS.map(benchmark => (
                  <div key={`${benchmark.id}-1y`} className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-400">{benchmark.name} (1Y)</span>
                    <span className={`text-sm font-medium ${benchmark.return1Y >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {benchmark.return1Y.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 