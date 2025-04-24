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

interface BollingerBandsResult {
  upperBand: number[];
  middleBand: number[]; // SMA
  lowerBand: number[];
}

const calculateBollingerBands = (
  data: number[], 
  period: number = 20, 
  stdDevMultiplier: number = 2
): BollingerBandsResult | null => {
  if (period <= 0 || stdDevMultiplier <= 0 || !data || data.length < period) {
    return null;
  }

  const middleBand = calculateSMA(data, period);
  if (middleBand.length === 0) return null; // SMA calculation failed

  const upperBand: number[] = [];
  const lowerBand: number[] = [];
  
  // Standard deviation calculation needs to align with SMA output
  const dataOffset = data.length - middleBand.length; // SMA starts later than raw data

  for (let i = 0; i < middleBand.length; i++) {
    const slice = data.slice(i + dataOffset - period + 1, i + dataOffset + 1);
    if (slice.length !== period) continue; // Should not happen if logic is correct
    
    const mean = middleBand[i];
    const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    upperBand.push(mean + stdDevMultiplier * stdDev);
    lowerBand.push(mean - stdDevMultiplier * stdDev);
  }

  if (upperBand.length !== middleBand.length) {
      console.error("[BBands] Length mismatch between bands!");
      return null; // Error condition
  }

  return { upperBand, middleBand, lowerBand };
};

// Helper for Wilder's Smoothing (used in RSI and ADX)
const wilderSmoothing = (data: number[], period: number): number[] => {
    if (period <= 0 || !data || data.length < period) return [];
    const smoothed: number[] = [];
    let sum = 0;
    // Calculate initial average for the first period
    for(let i = 0; i < period; i++) {
        sum += data[i];
    }
    smoothed.push(sum / period); // Use simple average for first point

    // Apply Wilder's smoothing for subsequent points
    for (let i = period; i < data.length; i++) {
        const previousSmoothed = smoothed[smoothed.length - 1];
        const currentSmoothed = (previousSmoothed * (period - 1) + data[i]) / period;
        smoothed.push(currentSmoothed);
    }
    return smoothed;
};

interface ADXResult {
    adx: number[];
    plusDI: number[];
    minusDI: number[];
}

const calculateADX = (candles: PolygonCandle[], period: number = 14): ADXResult | null => {
    if (period <= 0 || !candles || candles.length < period + 1) return null;

    const trueRanges: number[] = [];
    const plusDMs: number[] = [];
    const minusDMs: number[] = [];

    for (let i = 1; i < candles.length; i++) {
        const high = candles[i].h;
        const low = candles[i].l;
        const close = candles[i].c;
        const prevHigh = candles[i - 1].h;
        const prevLow = candles[i - 1].l;
        const prevClose = candles[i - 1].c;

        // True Range (TR)
        const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
        trueRanges.push(tr);

        // Directional Movement (+DM, -DM)
        const moveUp = high - prevHigh;
        const moveDown = prevLow - low;

        let plusDM = 0;
        let minusDM = 0;
        if (moveUp > moveDown && moveUp > 0) {
            plusDM = moveUp;
        }
        if (moveDown > moveUp && moveDown > 0) {
            minusDM = moveDown;
        }
        plusDMs.push(plusDM);
        minusDMs.push(minusDM);
    }
    
    if (trueRanges.length < period || plusDMs.length < period || minusDMs.length < period) return null;

    // Smoothed TR, +DM, -DM
    const smoothedTR = wilderSmoothing(trueRanges, period);
    const smoothedPlusDM = wilderSmoothing(plusDMs, period);
    const smoothedMinusDM = wilderSmoothing(minusDMs, period);
    
    if (smoothedTR.length === 0 || smoothedPlusDM.length !== smoothedTR.length || smoothedMinusDM.length !== smoothedTR.length) return null;

    // Directional Indicators (+DI, -DI)
    const plusDI: number[] = [];
    const minusDI: number[] = [];
    for (let i = 0; i < smoothedTR.length; i++) {
        // Avoid division by zero if smoothedTR is 0 (can happen in flat markets)
        const diPlus = smoothedTR[i] === 0 ? 0 : (smoothedPlusDM[i] / smoothedTR[i]) * 100;
        const diMinus = smoothedTR[i] === 0 ? 0 : (smoothedMinusDM[i] / smoothedTR[i]) * 100;
        plusDI.push(diPlus);
        minusDI.push(diMinus);
    }

    // Directional Movement Index (DX)
    const dx: number[] = [];
    for (let i = 0; i < plusDI.length; i++) {
        const diSum = plusDI[i] + minusDI[i];
        const dxValue = diSum === 0 ? 0 : (Math.abs(plusDI[i] - minusDI[i]) / diSum) * 100;
        dx.push(dxValue);
    }
    
    if (dx.length < period) return null; // Need enough DX values for ADX smoothing

    // Average Directional Index (ADX)
    const adx = wilderSmoothing(dx, period);

    // Align outputs (ADX starts later than +/-DI)
    const adxStartOffset = plusDI.length - adx.length;

    return {
        adx: adx,
        plusDI: plusDI.slice(adxStartOffset),
        minusDI: minusDI.slice(adxStartOffset)
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
  private bbandsPeriod = 20;
  private bbandsStdDev = 2;
  private adxPeriod = 14;
  private adxTrendThreshold = 25; // Example threshold for trend strength

  constructor(symbol: string = 'AAPL', mode: TradingMode = TradingModeEnum.DEMO) {
    this.symbol = symbol;
    this.mode = mode;
    this.polygonService = PolygonService.getInstance();
    console.log(`AI Engine initialized for ${symbol} (${mode}). Strategies: MA(${this.fastSMAPeriod}/${this.slowSMAPeriod}), RSI(${this.rsiPeriod}), MACD(${this.macdFast}/${this.macdSlow}/${this.macdSignal}), BBands(${this.bbandsPeriod}/${this.bbandsStdDev}), ADX(${this.adxPeriod})`);
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
      // 1. Fetch historical data
      const historyNeeded = Math.max(
          this.slowSMAPeriod + 1, 
          this.rsiPeriod + 1, 
          this.macdSlow + this.macdSignal, 
          this.bbandsPeriod, // BBands period needed
          this.adxPeriod + this.adxPeriod // ADX needs period + period for smoothing DX
      );
      const historyDays = historyNeeded + 40; // Ample buffer
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
      const prevPrice = closingPrices[closingPrices.length - 2]; // Need previous price for BBands cross check

      // Calculate ADX (needs full candle data)
      console.log(`[AI Engine] Calculating ADX(${this.adxPeriod})...`);
      const adxResult = calculateADX(candles, this.adxPeriod);
      let adxValue = 0;
      let plusDIValue = 0;
      let minusDIValue = 0;
      if (adxResult && adxResult.adx.length > 0) {
          adxValue = adxResult.adx[adxResult.adx.length - 1];
          plusDIValue = adxResult.plusDI[adxResult.plusDI.length - 1];
          minusDIValue = adxResult.minusDI[adxResult.minusDI.length - 1];
          console.log(`[ADX] Latest ADX: ${adxValue.toFixed(2)}, +DI: ${plusDIValue.toFixed(2)}, -DI: ${minusDIValue.toFixed(2)}`);
      } else {
          console.warn(`[ADX] Calculation failed or insufficient data.`);
      }
      
      // Determine if market is trending based on ADX
      const isTrending = adxValue > this.adxTrendThreshold;
      console.log(`[AI Engine] Market Trending (ADX > ${this.adxTrendThreshold}): ${isTrending}`);

      // --- Strategy Checks (Potentially use ADX as filter) --- 

      // Strategy 1: MA Crossover (Only if Trending?)
      // if (isTrending) {
          const maSignal = this.checkMACrossover(closingPrices, targetSymbol, latestPrice);
          if (maSignal) return maSignal;
      // }

      // Strategy 2: RSI (Less reliable in strong trends? Use differently?)
      const rsiSignal = this.checkRSIConditions(closingPrices, targetSymbol, latestPrice);
      if (rsiSignal) return rsiSignal;
      
      // Strategy 3: MACD Crossover (Only if Trending?)
      // if (isTrending) {
          const macdSignal = this.checkMACDCrossover(closingPrices, targetSymbol, latestPrice);
          if (macdSignal) return macdSignal;
      // }
      
      // Strategy 4: Bollinger Bands (Better for ranging? Use if NOT isTrending?)
      // if (!isTrending) {
          const bbandsSignal = this.checkBollingerBands(closingPrices, targetSymbol, latestPrice);
          if (bbandsSignal) return bbandsSignal;
      // }

      // --- No signals triggered ---
      console.log(`[AI Engine] No signals generated for ${targetSymbol}.`);
      return null;

    } catch (error) {
      console.error(`[AI Engine] Error analyzing market for ${targetSymbol}:`, error);
      return null;
    }
  }

  // --- Helper methods for individual strategy checks --- 
  // ... (checkMACrossover, checkRSIConditions, checkMACDCrossover remain the same) ...
  
  // Renamed for consistency
  private checkBollingerBands(closingPrices: number[], targetSymbol: string, latestPrice: number): TradeSignal | null {
     console.log(`[AI Engine] Checking Bollinger Bands (${this.bbandsPeriod}/${this.bbandsStdDev})...`);
     const bbandsResult = calculateBollingerBands(closingPrices, this.bbandsPeriod, this.bbandsStdDev);
      if (bbandsResult && bbandsResult.upperBand.length >= 2) {
          const upperBand_last = bbandsResult.upperBand[bbandsResult.upperBand.length - 1];
          const lowerBand_last = bbandsResult.lowerBand[bbandsResult.lowerBand.length - 1];
          const prevPrice = closingPrices[closingPrices.length - 2]; // Get previous price here
          console.log(`[BBands] Latest Close: ${latestPrice.toFixed(2)}, Upper: ${upperBand_last.toFixed(2)}, Lower: ${lowerBand_last.toFixed(2)}`);
          // Sell Signal: Price crosses ABOVE Upper Band 
          if (latestPrice > upperBand_last /* && prevPrice <= upperBand_prev - More strict */) { 
              return { symbol: targetSymbol, direction: 'sell', price: latestPrice, confidence: 0.65, timestamp: Date.now(), strategy: `BBands (${this.bbandsPeriod}/${this.bbandsStdDev}) Upper Cross` };
          }
          // Buy Signal: Price crosses BELOW Lower Band
          if (latestPrice < lowerBand_last /* && prevPrice >= lowerBand_prev - More strict */) {
              return { symbol: targetSymbol, direction: 'buy', price: latestPrice, confidence: 0.65, timestamp: Date.now(), strategy: `BBands (${this.bbandsPeriod}/${this.bbandsStdDev}) Lower Cross` };
          }
      }
      console.log(`[AI Engine] No BBands signal.`);
      return null;
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