import { addMonths, format, subMonths } from 'date-fns';

export interface PerformanceMetric {
  date: string;
  portfolioValue: number;
  benchmarkValue: number;
  cumulativeReturn: number;
  benchmarkReturn: number;
}

export interface RiskMetric {
  period: string;
  alpha: number;
  beta: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
}

export interface SectorAllocation {
  sector: string;
  weight: number;
  return: number;
}

export function generateMockPerformanceData(months: number = 60): PerformanceMetric[] {
  const data: PerformanceMetric[] = [];
  let portfolioValue = 1000000; // Starting with $1M
  let benchmarkValue = 1000000;
  const startDate = subMonths(new Date(), months);

  for (let i = 0; i <= months; i++) {
    const currentDate = addMonths(startDate, i);
    const monthlyReturn = (Math.random() * 4 - 1) / 100; // Random return between -1% and 3%
    const benchmarkMonthlyReturn = (Math.random() * 3 - 0.5) / 100; // Random return between -0.5% and 2.5%

    portfolioValue *= (1 + monthlyReturn);
    benchmarkValue *= (1 + benchmarkMonthlyReturn);

    data.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      portfolioValue: Math.round(portfolioValue),
      benchmarkValue: Math.round(benchmarkValue),
      cumulativeReturn: ((portfolioValue / 1000000) - 1) * 100,
      benchmarkReturn: ((benchmarkValue / 1000000) - 1) * 100
    });
  }

  return data;
}

export function generateMockRiskMetrics(): RiskMetric[] {
  return [
    {
      period: 'YTD',
      alpha: 2.5,
      beta: 0.95,
      sharpeRatio: 1.8,
      maxDrawdown: -8.5,
      volatility: 12.5
    },
    {
      period: '1 Year',
      alpha: 3.1,
      beta: 0.92,
      sharpeRatio: 2.1,
      maxDrawdown: -12.3,
      volatility: 14.2
    },
    {
      period: '3 Years',
      alpha: 2.8,
      beta: 0.98,
      sharpeRatio: 1.9,
      maxDrawdown: -15.7,
      volatility: 13.8
    }
  ];
}

export function generateMockSectorAllocations(): SectorAllocation[] {
  return [
    { sector: 'Technology', weight: 28.5, return: 22.4 },
    { sector: 'Healthcare', weight: 15.3, return: 12.8 },
    { sector: 'Financials', weight: 13.7, return: 8.5 },
    { sector: 'Consumer Disc.', weight: 11.2, return: -3.2 },
    { sector: 'Industrials', weight: 9.8, return: 15.6 },
    { sector: 'Communication', weight: 8.4, return: 18.9 },
    { sector: 'Materials', weight: 5.2, return: 7.3 },
    { sector: 'Energy', weight: 4.6, return: -5.8 },
    { sector: 'Utilities', weight: 2.3, return: 4.2 },
    { sector: 'Real Estate', weight: 1.0, return: 6.7 }
  ];
}

export function calculateReturns(performanceData: PerformanceMetric[]) {
  if (performanceData.length === 0) return { ytdReturn: 0, oneYearReturn: 0, threeYearReturn: 0, fiveYearReturn: 0, totalReturn: 0 };

  const latest = performanceData[performanceData.length - 1];
  const startOfYear = performanceData.find(d => d.date.startsWith(new Date().getFullYear().toString())) || latest;
  const oneYearAgo = performanceData.find(d => d.date === format(subMonths(new Date(), 12), 'yyyy-MM-dd')) || latest;
  const threeYearsAgo = performanceData.find(d => d.date === format(subMonths(new Date(), 36), 'yyyy-MM-dd')) || latest;
  const fiveYearsAgo = performanceData.find(d => d.date === format(subMonths(new Date(), 60), 'yyyy-MM-dd')) || latest;
  const first = performanceData[0];

  return {
    ytdReturn: ((latest.portfolioValue / startOfYear.portfolioValue) - 1) * 100,
    oneYearReturn: ((latest.portfolioValue / oneYearAgo.portfolioValue) - 1) * 100,
    threeYearReturn: (Math.pow(latest.portfolioValue / threeYearsAgo.portfolioValue, 1/3) - 1) * 100,
    fiveYearReturn: (Math.pow(latest.portfolioValue / fiveYearsAgo.portfolioValue, 1/5) - 1) * 100,
    totalReturn: ((latest.portfolioValue / first.portfolioValue) - 1) * 100
  };
} 