export type TradingMode = 'demo' | 'live';

export interface TradeScenario {
  id: string;
  name: string;
  description: string;
  conditions: string[];
  entryStrategy: string;
  exitStrategy: string;
  riskManagement: string;
}

export interface TradingSignal {
  symbol: string;
  type: 'buy' | 'sell';
  confidence: number;
}

export type Position = {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  timestamp: string;
  closeDate?: string;
  status: 'open' | 'closed';
  profit?: number;
};

export type PortfolioPerformance = {
  totalGain: number;
  percentageGain: number;
  timeFrame: string;
  benchmarkComparison: number;
};

export type PortfolioType = {
  id: string;
  name: string;
  positions: Position[];
  performance: PortfolioPerformance;
};

// Centralized definition of AIPosition interface
export interface AIPosition {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  quantity: number;
  timestamp: string;
  exitPrice?: number;
  closeDate?: string;
  status: 'open' | 'closed';
  profit?: number;
  stopLoss?: number;
  takeProfit?: number;
  strategy: string;
  confidence?: number;
  // Additional optional fields from AITradingPanel definition
  entryTime?: number;
  exitTime?: number;
  pnl?: number;
  pnlPercent?: number;
} 