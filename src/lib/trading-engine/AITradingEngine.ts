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

// --- Indicator Calculation Helpers ---

const calculateSMA = (data: number[], period: number): number[] => {
  if (period <= 0 || !data || data.length < period) return [];
  const sma: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
    sma.push(sum / period);
  }
  return sma;
};

const calculateEMA = (data: number[], period: number): number[] => {
  if (period <= 0 || !data || data.length < period) return [];
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // Calculate initial SMA for the first EMA value
  let sum = 0;
  for(let i = 0; i < period; i++) {
      sum += data[i];
  }
  let previousEma = sum / period;
  ema.push(previousEma);

  // Calculate subsequent EMAs
  for (let i = period; i < data.length; i++) {
    const currentEma = (data[i] - previousEma) * multiplier + previousEma;
    ema.push(currentEma);
    previousEma = currentEma;
  }
  return ema;
};

const calculateRSI = (data: number[], period: number = 14): number[] => {
  if (period <= 0 || !data || data.length < period + 1) return [];

  const rsi: number[] = [];
  let avgGain = 0;
  let avgLoss = 0;

  // Calculate initial average gain/loss for the first period
  let firstGainSum = 0;
  let firstLossSum = 0;
  for (let i = 1; i <= period; i++) {
    const change = data[i] - data[i - 1];
    if (change > 0) {
      firstGainSum += change;
    } else {
      firstLossSum += Math.abs(change);
    }
  }
  avgGain = firstGainSum / period;
  avgLoss = firstLossSum / period;

  // Calculate first RSI value
  let rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
  rsi.push(100 - (100 / (1 + rs)));

  // Calculate subsequent RSI values using Wilder's smoothing
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    let currentGain = 0;
    let currentLoss = 0;

    if (change > 0) {
      currentGain = change;
    } else {
      currentLoss = Math.abs(change);
    }

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }

  return rsi;
};

interface MACDResult {
  macdLine: number[];
  signalLine: number[];
  histogram: number[];
}

const calculateMACD = (
  data: number[], 
  fastPeriod: number = 12, 
  slowPeriod: number = 26, 
  signalPeriod: number = 9
): MACDResult | null => {
  if (slowPeriod <= fastPeriod || signalPeriod <= 0 || !data || data.length < slowPeriod) {
    return null; // Not enough data or invalid periods
  }

  const emaFast = calculateEMA(data, fastPeriod);
  const emaSlow = calculateEMA(data, slowPeriod);

  // Align arrays: MACD line starts where the slower EMA starts
  const macdLine: number[] = [];
  const startOffset = emaFast.length - emaSlow.length; // Difference in starting points
  for (let i = 0; i < emaSlow.length; i++) {
    macdLine.push(emaFast[i + startOffset] - emaSlow[i]);
  }

  if (macdLine.length < signalPeriod) {
    return null; // Not enough MACD points for signal line
  }

  const signalLine = calculateEMA(macdLine, signalPeriod);

  // Align signal line and calculate histogram
  const histogram: number[] = [];
  const signalStartOffset = macdLine.length - signalLine.length;
  for (let i = 0; i < signalLine.length; i++) {
      histogram.push(macdLine[i + signalStartOffset] - signalLine[i]);
  }

  // Return aligned results (all starting from the same logical point)
   return {
      macdLine: macdLine.slice(signalStartOffset), // Trim beginning to match signal/hist
      signalLine: signalLine,
      histogram: histogram
   };
};

// --- AI Trading Engine Class ---

export class AITradingEngine {
  private symbol: string;
  private mode: TradingMode;
  private polygonService: PolygonService;
  
  // Strategy Parameters
  private fastSMAPeriod = 9;
  private slowSMAPeriod = 21;
  private rsiPeriod = 14;
  private rsiOverbought = 70;
  private rsiOversold = 30;
  private macdFast = 12;
  private macdSlow = 26;
  private macdSignal = 9;

  constructor(symbol: string = 'AAPL', mode: TradingMode = TradingModeEnum.DEMO) {
    this.symbol = symbol;
    this.mode = mode;
    this.polygonService = PolygonService.getInstance();
    console.log(`AI Engine initialized for ${symbol} (${mode}). Strategies: MA(${this.fastSMAPeriod}/${this.slowSMAPeriod}), RSI(${this.rsiPeriod}), MACD(${this.macdFast}/${this.macdSlow}/${this.macdSignal})`);
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
    console.log(`[AI Engine] Analyzing market for ${targetSymbol}...`);

    try {
      // 1. Fetch historical data (need enough for longest period + buffer)
      const historyNeeded = Math.max(this.slowSMAPeriod + 1, this.rsiPeriod + 1, this.macdSlow + this.macdSignal);
      const historyDays = historyNeeded + 30; // Fetch ample buffer
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - historyDays);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      console.log(`[AI Engine] Fetching candles from ${startDateStr} to ${endDateStr}`);
      const candles: PolygonCandle[] = await this.polygonService.getStockCandles(targetSymbol, startDateStr, endDateStr, 'day');

      if (!candles || candles.length < historyNeeded) {
        console.warn(`[AI Engine] Insufficient candle data for ${targetSymbol} (${candles?.length || 0} received). Needed >= ${historyNeeded}.`);
        return null;
      }
      candles.sort((a, b) => a.t - b.t); // Ensure chronological order
      const closingPrices = candles.map(candle => candle.c);
      const latestPrice = closingPrices[closingPrices.length - 1];

      // --- Strategy 1: MA Crossover --- 
      console.log(`[AI Engine] Checking MA Crossover (${this.fastSMAPeriod}/${this.slowSMAPeriod})...`);
      const fastSMA = calculateSMA(closingPrices, this.fastSMAPeriod);
      const slowSMA = calculateSMA(closingPrices, this.slowSMAPeriod);
      let maSignal: TradeSignal | null = null;

      if (fastSMA.length >= 2 && slowSMA.length >= 2) {
        const fastSMA_last = fastSMA[fastSMA.length - 1];
        const fastSMA_prev = fastSMA[fastSMA.length - 2];
        const slowSMA_last = slowSMA[slowSMA.length - 1];
        const slowSMA_prev = slowSMA[slowSMA.length - 2];

        // Bullish Crossover
        if (fastSMA_prev <= slowSMA_prev && fastSMA_last > slowSMA_last) {
          console.log(`[MA Crossover] Bullish crossover detected`);
          maSignal = {
            symbol: targetSymbol, direction: 'buy', price: latestPrice,
            confidence: 0.80, timestamp: Date.now(), strategy: `MA Crossover (${this.fastSMAPeriod}/${this.slowSMAPeriod})`
          };
        }
        // Bearish Crossover
        else if (fastSMA_prev >= slowSMA_prev && fastSMA_last < slowSMA_last) {
          console.log(`[MA Crossover] Bearish crossover detected`);
          maSignal = {
            symbol: targetSymbol, direction: 'sell', price: latestPrice,
            confidence: 0.80, timestamp: Date.now(), strategy: `MA Crossover (${this.fastSMAPeriod}/${this.slowSMAPeriod})`
          };
        }
      }
      if (maSignal) {
         console.log(`[AI Engine] MA Crossover signal generated:`, maSignal);
         return maSignal; // Prioritize MA signal for now
      }
      console.log(`[AI Engine] No MA Crossover signal.`);

      // --- Strategy 2: RSI Overbought/Oversold --- 
      console.log(`[AI Engine] Checking RSI(${this.rsiPeriod})...`);
      const rsi = calculateRSI(closingPrices, this.rsiPeriod);
      let rsiSignal: TradeSignal | null = null;

      if (rsi.length >= 2) {
        const rsi_last = rsi[rsi.length - 1];
        const rsi_prev = rsi[rsi.length - 2];
        console.log(`[RSI] Latest RSI(${this.rsiPeriod}) = ${rsi_last.toFixed(2)}`);

        // Bullish Signal: Crosses above oversold level
        if (rsi_prev <= this.rsiOversold && rsi_last > this.rsiOversold) {
          console.log(`[RSI] Bullish signal detected (crossed above ${this.rsiOversold})`);
          rsiSignal = {
            symbol: targetSymbol, direction: 'buy', price: latestPrice,
            confidence: 0.75, timestamp: Date.now(), strategy: `RSI(${this.rsiPeriod}) Oversold Exit`
          };
        }
        // Bearish Signal: Crosses below overbought level
        else if (rsi_prev >= this.rsiOverbought && rsi_last < this.rsiOverbought) {
          console.log(`[RSI] Bearish signal detected (crossed below ${this.rsiOverbought})`);
          rsiSignal = {
            symbol: targetSymbol, direction: 'sell', price: latestPrice,
            confidence: 0.75, timestamp: Date.now(), strategy: `RSI(${this.rsiPeriod}) Overbought Exit`
          };
        }
      }

      if (rsiSignal) {
        console.log(`[AI Engine] RSI signal generated:`, rsiSignal);
        return rsiSignal;
      }
      console.log(`[AI Engine] No RSI signal.`);

      // --- Strategy 3: MACD Crossover --- 
      console.log(`[AI Engine] Checking MACD(${this.macdFast}/${this.macdSlow}/${this.macdSignal})...`);
      const macdResult = calculateMACD(closingPrices, this.macdFast, this.macdSlow, this.macdSignal);
      if (macdResult && macdResult.macdLine.length >= 2) { // Need 2 points to check crossover
          const macd_last = macdResult.macdLine[macdResult.macdLine.length - 1];
          const macd_prev = macdResult.macdLine[macdResult.macdLine.length - 2];
          const signal_last = macdResult.signalLine[macdResult.signalLine.length - 1];
          const signal_prev = macdResult.signalLine[macdResult.signalLine.length - 2];
          console.log(`[MACD] Latest MACD: ${macd_last.toFixed(3)}, Signal: ${signal_last.toFixed(3)}`);

          // Bullish Crossover: MACD crosses above Signal
          if (macd_prev <= signal_prev && macd_last > signal_last) {
              const signal: TradeSignal = {
                  symbol: targetSymbol, direction: 'buy', price: latestPrice, 
                  confidence: 0.70, timestamp: Date.now(), strategy: `MACD Crossover (${this.macdFast}/${this.macdSlow}/${this.macdSignal})`
              };
              console.log(`[AI Engine] MACD signal generated:`, signal);
              return signal;
          }
          // Bearish Crossover: MACD crosses below Signal
          if (macd_prev >= signal_prev && macd_last < signal_last) {
              const signal: TradeSignal = {
                  symbol: targetSymbol, direction: 'sell', price: latestPrice, 
                  confidence: 0.70, timestamp: Date.now(), strategy: `MACD Crossover (${this.macdFast}/${this.macdSlow}/${this.macdSignal})`
              };
              console.log(`[AI Engine] MACD signal generated:`, signal);
              return signal;
          }
      }
      console.log(`[AI Engine] No MACD signal.`);

      // --- No signals from implemented strategies ---
      console.log(`[AI Engine] No signals generated for ${targetSymbol}.`);
      return null;

    } catch (error) {
      console.error(`[AI Engine] Error analyzing market for ${targetSymbol}:`, error);
      return null;
    }
  }

  calculatePositionSize(price: number, risk: number = 0.02): number {
    const accountSize = 10000; // Simulated account size
    const riskAmount = accountSize * risk;
    if (price <= 0) return 0;
    const shares = Math.floor(riskAmount / price);
    return shares > 0 ? shares : 0;
  }

  async executeTradeSignal(signal: TradeSignal): Promise<boolean> {
    console.log(`Executing ${signal.direction} signal for ${signal.symbol} at $${signal.price} (Strategy: ${signal.strategy})`);
    if (this.mode === TradingModeEnum.DEMO) {
      console.log('Demo mode: Simulating trade execution');
      await new Promise(resolve => setTimeout(resolve, 300));
      return true;
    } else {
      console.log('Live mode: Connecting to brokerage API (Not implemented)');
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Live trade simulated successfully (No actual execution)');
      return true;
    }
  }
} 