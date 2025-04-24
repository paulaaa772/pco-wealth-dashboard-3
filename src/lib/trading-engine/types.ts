export type TradingMode = 'demo' | 'live';

export interface TradeScenario {
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  position: 'long' | 'short';
  confidence: number;
  timestamp: Date;
}

export interface TradingSignal {
  symbol: string;
  scenario: TradeScenario;
  indicators: {
    rsi: number;
    volume: number;
    trend: 'bullish' | 'bearish' | 'neutral';
    atr: number;
  };
  filters: {
    volumeValid: boolean;
    trendValid: boolean;
    rsiValid: boolean;
  };
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