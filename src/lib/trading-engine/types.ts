export type TradingMode = 'demo' | 'live';

export interface TradeScenario {
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  position: 'long' | 'short';
  confidence: number;
  timeframe: string;
}

export interface TradingSignal {
  symbol: string;
  scenario: TradeScenario;
}

export type Position = {
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  entryDate: Date;
  lastUpdated: Date;
  type: 'long' | 'short';
  stopLoss?: number;
  takeProfit?: number;
  unrealizedPnL: number;
  realizedPnL: number;
};

export type PortfolioPerformance = {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  allTime: number;
};

export type PortfolioType = {
  id: string;
  name: string;
  type: 'long-term' | 'active-trading';
  balance: number;
  positions: Position[];
  performance: PortfolioPerformance;
}; 