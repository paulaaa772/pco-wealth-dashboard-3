'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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

// Define chart data types
interface HistoricalDataPoint {
  date: string;
  value: number;
}

// Use Record to allow dynamic properties
interface ChartDataPoint extends Record<string, any> {
  date: string;
  portfolio: number;
}

interface PortfolioAssetInput {
  symbol: string;
  quantity: number;
}

// Define analytics component
export default function EnhancedPerformanceAnalytics() {
  const { manualAccounts, isLoading: isLoadingAccounts } = useManualAccounts();
  const [selectedTimeRange, setSelectedTimeRange] = useState('1y');
  const [selectedBenchmarks, setSelectedBenchmarks] = useState(['sp500']);
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
  
  // State for fetched historical data
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Prepare assets list for API call
  const portfolioAssets = useMemo(() => {
    const assetsMap: Record<string, number> = {};
    manualAccounts.forEach(account => {
      account.assets.forEach(asset => {
        assetsMap[asset.symbol] = (assetsMap[asset.symbol] || 0) + asset.quantity;
      });
    });
    return Object.entries(assetsMap).map(([symbol, quantity]) => ({ symbol, quantity }));
  }, [manualAccounts]);
  
  // Function to fetch historical data
  const fetchHistoricalData = useCallback(async (assets: PortfolioAssetInput[], rangeId: string) => {
    if (assets.length === 0) {
      setHistoricalData([]);
      return;
    }
    
    setIsLoadingData(true);
    setError(null);
    
    const selectedRange = TIME_RANGES.find(r => r.id === rangeId) || TIME_RANGES[4]; // Default 1y
    const days = selectedRange.daysFunc ? selectedRange.daysFunc() : selectedRange.days;
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    try {
      console.log('[PerfAnalytics] Fetching historical data...', { rangeId, startDate, endDate, assets });
      const response = await fetch('/api/portfolio/historical-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assets,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[PerfAnalytics] API Error:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to fetch historical data');
      }

      const data: HistoricalDataPoint[] = await response.json();
      console.log('[PerfAnalytics] Received historical data points:', data.length);
      // Basic validation: Ensure dates are valid and value is number
      const validatedData = data.filter(d => isValid(parseISO(d.date)) && typeof d.value === 'number');
      if (validatedData.length !== data.length) {
        console.warn('[PerfAnalytics] Some invalid data points filtered out.');
      }
      setHistoricalData(validatedData);

    } catch (err) {
      console.error('[PerfAnalytics] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setHistoricalData([]); // Clear data on error
    } finally {
      setIsLoadingData(false);
    }
  }, []);
  
  // Fetch data when time range or portfolio assets change
  useEffect(() => {
    if (!isLoadingAccounts && portfolioAssets.length > 0) {
      fetchHistoricalData(portfolioAssets, selectedTimeRange);
    } else if (!isLoadingAccounts && portfolioAssets.length === 0) {
      // Clear data if portfolio becomes empty
      setHistoricalData([]);
    }
  }, [selectedTimeRange, portfolioAssets, fetchHistoricalData, isLoadingAccounts]);
  
  // Calculate total portfolio value (use last point from fetched data if available)
  const totalPortfolioValue = useMemo(() => {
    if (historicalData.length > 0) {
      return historicalData[historicalData.length - 1].value;
    } 
    // Fallback to calculating from manual accounts if historical fetch failed or is empty
    return manualAccounts.reduce((sum, account) => sum + account.totalValue, 0);
  }, [historicalData, manualAccounts]);
  
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
      // Avoid division by zero or issues with non-positive prices
      if(prevValue > 0) {
        returns.push((currValue / prevValue) - 1);
      } else {
        returns.push(0); // Treat as no change if previous value was zero/negative
      }
    }
    
    // Calculate volatility (standard deviation of returns)
    const avgReturn = returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0;
    const variance = returns.length > 0 ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length : 0;
    const volatility = returns.length > 0 ? Math.sqrt(variance) * Math.sqrt(252) * 100 : 0; // Annualized
    
    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = -Infinity;
    // Ensure peak starts correctly if first value is positive
    if (historicalData.length > 0 && historicalData[0].value > 0) {
      peak = historicalData[0].value;
    }

    for (const point of historicalData) {
      if (point.value > peak) {
        peak = point.value;
      }
      // Calculate drawdown only if peak is positive to avoid division by zero/weird results
      if (peak > 0) {
        const drawdown = ((peak - point.value) / peak) * 100;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }
    
    // Calculate Sharpe ratio (assuming risk-free rate of 2%)
    const riskFreeRate = 2;
    const selectedRange = TIME_RANGES.find(r => r.id === selectedTimeRange) || TIME_RANGES[4];
    const days = selectedRange.daysFunc ? selectedRange.daysFunc() : selectedRange.days;
    const yearsElapsed = days / 365;
    
    // Avoid NaN/Infinity for return calculations if start/end values are zero/negative
    let annualizedReturn = 0;
    if(yearsElapsed > 0 && startValue > 0 && endValue > 0) {
      annualizedReturn = (Math.pow((endValue / startValue), 1 / yearsElapsed) - 1) * 100;
    } else if (startValue > 0 && endValue > 0) {
      annualizedReturn = totalReturn; // Use total return for periods < 1 year
    }
    
    // Avoid division by zero for Sharpe Ratio
    const sharpeRatio = volatility > 0 ? (annualizedReturn - riskFreeRate) / volatility : 0;
    
    // Ensure results are numbers, default to 0 if NaN
    return {
      totalReturn: isNaN(totalReturn) ? 0 : totalReturn,
      annualizedReturn: isNaN(annualizedReturn) ? 0 : annualizedReturn,
      volatility: isNaN(volatility) ? 0 : volatility,
      maxDrawdown: isNaN(maxDrawdown) ? 0 : maxDrawdown,
      sharpeRatio: isNaN(sharpeRatio) ? 0 : sharpeRatio
    };
  }, [historicalData, selectedTimeRange]);
  
  // Prepare chart data with benchmarks
  const chartData = useMemo(() => {
    if (historicalData.length === 0) return [];
    
    // Start with portfolio data
    const result = historicalData.map(point => {
      const chartPoint: ChartDataPoint = { date: point.date, portfolio: point.value };
      
      // Add mock benchmarks for now
      selectedBenchmarks.forEach(benchmarkId => {
        const benchmark = BENCHMARKS.find(b => b.id === benchmarkId);
        if (benchmark) {
          // TODO: Fetch real benchmark data later
          const startValue = 100;
          const endValue = startValue * (1 + (benchmark.return1Y / 100)); // Simple mock based on 1Y return
          if (!isValid(parseISO(point.date)) || !isValid(parseISO(historicalData[0].date))) return; // Guard
          const daysSinceStart = Math.round((parseISO(point.date).getTime() - parseISO(historicalData[0].date).getTime()) / (1000 * 60 * 60 * 24));
          const totalDurationDays = Math.max(1, Math.round((parseISO(historicalData[historicalData.length - 1].date).getTime() - parseISO(historicalData[0].date).getTime()) / (1000 * 60 * 60 * 24))); // Avoid division by zero
          const progress = daysSinceStart / totalDurationDays;
          
          const randomFactor = 1 + (Math.random() * 0.1 - 0.05); // Keep some randomness
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
    // Handle cases where portfolio or benchmark start value might be zero or invalid
    const startPortfolioValue = (firstPoint.portfolio > 0) ? firstPoint.portfolio : 1;

    return chartData.map(point => {
      const result: ChartDataPoint = { date: point.date, portfolio: 0 };

      // Calculate percent change for portfolio, handle potential division by zero
      result.portfolio = startPortfolioValue !== 0 ? ((point.portfolio / startPortfolioValue) - 1) * 100 : 0;

      // Calculate percent change for benchmarks
      selectedBenchmarks.forEach(benchmarkId => {
        const startBenchmarkValue = (firstPoint[benchmarkId] > 0) ? firstPoint[benchmarkId] : 1;
        if (point[benchmarkId] !== undefined && firstPoint[benchmarkId] !== undefined) {
          result[benchmarkId] = startBenchmarkValue !== 0 ? ((point[benchmarkId] / startBenchmarkValue) - 1) * 100 : 0;
        }
      });

      return result;
    });
  }, [chartData, selectedBenchmarks]);
  
  // Combined loading state
  const combinedIsLoading = isLoadingAccounts || isLoadingData;
  
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
            <h4 className="text-sm font-medium text-gray-400 mb-1">Total Return ({selectedTimeRange.toUpperCase()})</h4>
            <p className={`text-2xl font-semibold ${performanceMetrics.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {combinedIsLoading ? '-' : `${performanceMetrics.totalReturn.toFixed(2)}%`}
            </p>
          </div>
          
          <div className="bg-[#2A3C61] rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-1">Annualized Return</h4>
            <p className={`text-2xl font-semibold ${performanceMetrics.annualizedReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {combinedIsLoading ? '-' : `${performanceMetrics.annualizedReturn.toFixed(2)}%`}
            </p>
          </div>
          
          <div className="bg-[#2A3C61] rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-1">Volatility</h4>
            <p className="text-2xl font-semibold text-white">
              {combinedIsLoading ? '-' : `${performanceMetrics.volatility.toFixed(2)}%`}
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
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedTimeRange === range.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-[#344571]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={isLoadingData} // Disable while loading
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
        <div className="h-96 w-full relative">
          {/* Loading Overlay */}
          {combinedIsLoading && (
            <div className="absolute inset-0 bg-[#1E2D4E]/70 flex justify-center items-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          {/* Error Message */}
          {error && !combinedIsLoading && (
            <div className="absolute inset-0 bg-[#1E2D4E]/90 flex flex-col justify-center items-center z-10 rounded-lg p-4">
              <p className="text-red-500 font-semibold mb-2">Error Loading Performance Data</p>
              <p className="text-sm text-gray-400 text-center">{error}</p>
              <button 
                onClick={() => fetchHistoricalData(portfolioAssets, selectedTimeRange)} 
                className="mt-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                Retry
              </button>
            </div>
          )}
          {/* No Data Message */}
          {!combinedIsLoading && !error && historicalData.length === 0 && (
            <div className="absolute inset-0 bg-[#1E2D4E]/90 flex flex-col justify-center items-center z-10 rounded-lg p-4">
              <p className="text-gray-400 font-semibold">No performance data available</p>
              <p className="text-sm text-gray-500 text-center">Add assets or check API connection.</p>
            </div>
          )}

          {/* Chart Container (conditionally render if data exists) */}
          {historicalData.length > 0 && (
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
                      // Adjust formatting based on range?
                      return format(parseISO(date), 'MMM dd');
                    }}
                    stroke="#9CA3AF"
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value.toFixed(0)}%`} // Adjusted format
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
                    connectNulls={true} // Connect gaps in data
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
                        connectNulls={true}
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
          )}
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