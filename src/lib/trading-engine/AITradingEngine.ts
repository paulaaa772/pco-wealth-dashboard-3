'use client'

import { PolygonService, PolygonCandle } from '../market-data/PolygonService';
import { TradingMode as TradingModeEnum } from './TradingMode';

// Define TradingMode type locally if the import causes issues
export type TradingMode = 'demo' | 'live';

export interface TradeSignal {
  symbol: string;
  direction: 'buy' | 'sell';
  price: number; // Entry price for the signal
  confidence: number;
  timestamp: number;
  strategy: string; // Added strategy identifier
}

// Helper function to calculate Simple Moving Average (SMA)
const calculateSMA = (data: number[], period: number): number[] => {
  if (period <= 0 || !data || data.length < period) {
    return [];
  }
  const sma: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
    sma.push(sum / period);
  }
  return sma;
};

export class AITradingEngine {
  private symbol: string;
  private mode: TradingMode;
  private polygonService: PolygonService;
  private fastSMAPeriod = 9;
  private slowSMAPeriod = 21;

  constructor(symbol: string = 'AAPL', mode: TradingMode = TradingModeEnum.DEMO) {
    this.symbol = symbol;
    this.mode = mode;
    this.polygonService = PolygonService.getInstance();
    console.log(`AI Trading Engine initialized for ${symbol} in ${mode} mode with MA Crossover (${this.fastSMAPeriod}/${this.slowSMAPeriod})`);
  }

  setSymbol(symbol: string): void {
    this.symbol = symbol;
    console.log(`Trading symbol updated to: ${symbol}`);
  }

  setMode(mode: TradingMode): void {
    this.mode = mode;
    console.log(`Trading mode updated to: ${mode}`);
  }

  async analyzeMarket(symbol?: string): Promise<TradeSignal | null> {
    const targetSymbol = symbol || this.symbol;
    console.log(`[MA Crossover] Analyzing market for ${targetSymbol}...`);

    try {
      // 1. Fetch historical data (need enough for the longest period + 1)
      const historyDays = this.slowSMAPeriod + 20; // Fetch extra days to ensure enough trading days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - historyDays);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      console.log(`[MA Crossover] Fetching candles from ${startDateStr} to ${endDateStr}`);
      const candles: PolygonCandle[] = await this.polygonService.getStockCandles(
        targetSymbol,
        startDateStr,
        endDateStr,
        'day' // Ensure daily candles
      );

      if (!candles || candles.length < this.slowSMAPeriod + 1) {
        console.warn(`[MA Crossover] Insufficient candle data for ${targetSymbol} (${candles?.length || 0} received). Needed ${this.slowSMAPeriod + 1}.`);
        return null;
      }

      // Sort candles just in case API doesn't guarantee order
      candles.sort((a, b) => a.t - b.t);

      // 2. Extract closing prices
      const closingPrices = candles.map(candle => candle.c);
      const latestPrice = closingPrices[closingPrices.length - 1];

      // 3. Calculate SMAs
      const fastSMA = calculateSMA(closingPrices, this.fastSMAPeriod);
      const slowSMA = calculateSMA(closingPrices, this.slowSMAPeriod);

      // Ensure we have enough SMA points to check the crossover
      // Since slowSMA is longer, it determines the number of points.
      // We need at least 2 points for both fast and slow to compare the last two.
      if (fastSMA.length < 2 || slowSMA.length < 2) {
         console.warn(`[MA Crossover] Not enough SMA points calculated for ${targetSymbol}.`);
         return null;
      }

      // Get the last two points for comparison
      // Adjust index because calculateSMA returns fewer points than input data
      const fastSMA_last = fastSMA[fastSMA.length - 1];
      const fastSMA_prev = fastSMA[fastSMA.length - 2];
      const slowSMA_last = slowSMA[slowSMA.length - 1];
      const slowSMA_prev = slowSMA[slowSMA.length - 2];

      console.log(`[MA Crossover] Latest SMAs for ${targetSymbol}: Fast(${this.fastSMAPeriod})=${fastSMA_last.toFixed(2)}, Slow(${this.slowSMAPeriod})=${slowSMA_last.toFixed(2)}`);
      console.log(`[MA Crossover] Previous SMAs for ${targetSymbol}: Fast(${this.fastSMAPeriod})=${fastSMA_prev.toFixed(2)}, Slow(${this.slowSMAPeriod})=${slowSMA_prev.toFixed(2)}`);


      // 4. Check for Crossover Signal
      let direction: 'buy' | 'sell' | null = null;

      // Bullish Crossover (Fast crosses above Slow)
      if (fastSMA_prev <= slowSMA_prev && fastSMA_last > slowSMA_last) {
        console.log(`[MA Crossover] Bullish crossover detected for ${targetSymbol}`);
        direction = 'buy';
      }
      // Bearish Crossover (Fast crosses below Slow)
      else if (fastSMA_prev >= slowSMA_prev && fastSMA_last < slowSMA_last) {
        console.log(`[MA Crossover] Bearish crossover detected for ${targetSymbol}`);
        direction = 'sell';
      }

      if (direction) {
        const signal: TradeSignal = {
          symbol: targetSymbol,
          direction: direction,
          price: latestPrice,
          confidence: 0.85, // Assign higher confidence for clear crossover
          timestamp: Date.now(),
          strategy: `MA Crossover (${this.fastSMAPeriod}/${this.slowSMAPeriod})`
        };
        console.log(`[MA Crossover] Signal generated:`, signal);
        return signal;
      } else {
        console.log(`[MA Crossover] No crossover signal detected for ${targetSymbol}`);
        return null;
      }

    } catch (error) {
      console.error(`[MA Crossover] Error analyzing market for ${targetSymbol}:`, error);
      // Optionally, fall back to mock/random or return null
      return null;
    }
  }

  calculatePositionSize(price: number, risk: number = 0.02): number {
    const accountSize = 10000; // Simulated account size
    const riskAmount = accountSize * risk;
    
    // Basic position sizing - ensure price is not zero
    if (price <= 0) return 0;
    const shares = Math.floor(riskAmount / price);
    return shares > 0 ? shares : 0; // Return 0 if shares calculation is negative/zero
  }

  async executeTradeSignal(signal: TradeSignal): Promise<boolean> {
    console.log(`Executing ${signal.direction} signal for ${signal.symbol} at $${signal.price} (Strategy: ${signal.strategy})`);

    if (this.mode === TradingModeEnum.DEMO) {
      console.log('Demo mode: Simulating trade execution');
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      return true;
    } else {
      console.log('Live mode: Connecting to brokerage API (Not implemented)');
      // Real brokerage integration would go here
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Live trade simulated successfully (No actual execution)');
      return true; // Simulate success for now
    }
  }
} 