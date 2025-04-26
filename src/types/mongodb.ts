// MongoDB response types
export interface Position {
  symbol: string;
  quantity: number;
  averageEntryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  sector?: string;
  industry?: string;
  costBasis: number;
  lastUpdated: string;
}

export interface AssetAllocationEntry {
  category: string;
  percentage: number;
  value: number;
}

export interface PerformanceHistoryEntry {
  date: string;
  value: number;
  cashFlow: number;
}

export interface PortfolioResponse {
  _id: string;
  userId: string;
  name: string;
  description: string;
  stats: {
    totalValue: number;
    cashBalance: number;
    dayChange: number;
    dayChangePercent: number;
    totalGain: number;
    totalGainPercent: number;
    annualReturn: number;
    annualDividend: number;
    annualDividendYield: number;
    beta: number;
    sharpeRatio: number;
    lastUpdated: string;
  };
  cashBalance: number;
  positions: Position[];
  assetAllocation: AssetAllocationEntry[];
  performanceHistory: PerformanceHistoryEntry[];
} 