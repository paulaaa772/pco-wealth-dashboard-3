// Cache-bust comment: 2024-04-24 15:00
'use client'

import { PolygonService, PolygonCandle } from '../market-data/PolygonService';
import { TradingMode as TradingModeEnum } from './TradingMode';
// Import necessary calculation functions and types from indicators.ts
import {
    calculateSMA,
    calculateEMA,
    calculateRSI,
    calculateMACD,
    MACDResult,
    calculateBollingerBands,
    BollingerBandsResult,
    calculateADX,
    ADXResult,
    calculateStochastic,
    StochasticResult,
    calculateOBV
} from './indicators';

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
  private stochasticKPeriod = 14;
  private stochasticDPeriod = 3;
  private stochasticOverbought = 80;
  private stochasticOversold = 20;
  private obvSmaPeriod = 20; // For calculating SMA of OBV later

  constructor(symbol: string = 'AAPL', mode: TradingMode = TradingModeEnum.DEMO) {
    this.symbol = symbol;
    this.mode = mode;
    this.polygonService = PolygonService.getInstance();
    console.log(`AI Engine initialized for ${symbol} (${mode}). Strategies: MA(${this.fastSMAPeriod}/${this.slowSMAPeriod}), RSI(${this.rsiPeriod}), MACD(${this.macdFast}/${this.macdSlow}/${this.macdSignal}), BBands(${this.bbandsPeriod}/${this.bbandsStdDev}), ADX(${this.adxPeriod}), Stoch(${this.stochasticKPeriod}/${this.stochasticDPeriod}), OBV`);
  }

  // --- Helper methods for individual strategy checks --- 

  // Refactored to accept pre-calculated indicator values and the current index
  private checkMACrossover(
      fastSMA: number[], 
      slowSMA: number[], 
      index: number, // Index corresponding to the CURRENT bar in the original closingPrices array
      targetSymbol: string, 
      currentPrice: number
  ): TradeSignal | null {
      // We need index-1 and index-2 relative to the original closingPrices.
      // Need to map this back to the SMA array indices.
      // SMA arrays are shorter than closingPrices. SMA calculation requires 'period' bars.
      // SMA value at index `k` corresponds to closing price at index `k + period - 1`
      // So, closing price at index `i` corresponds to SMA index `k = i - period + 1`
      
      // Map current index `i` to corresponding indices in the SMA arrays
      const fastSMAIndex = index - this.fastSMAPeriod + 1;
      const slowSMAIndex = index - this.slowSMAPeriod + 1;

      // Check if we have enough data points in the SMA arrays for the required indices
      // Need current (k) and previous (k-1) points for both SMAs.
      if (fastSMAIndex < 1 || slowSMAIndex < 1 || fastSMAIndex >= fastSMA.length || slowSMAIndex >= slowSMA.length) {
          // console.log(`[MA Cross] Index out of bounds. i=${index}, fastK=${fastSMAIndex}, slowK=${slowSMAIndex}`);
          return null; // Not enough historical SMA data for comparison at this index
      }

      // Get the relevant SMA values using the mapped indices
      const fastSMA_last = fastSMA[fastSMAIndex];
      const fastSMA_prev = fastSMA[fastSMAIndex - 1];
      const slowSMA_last = slowSMA[slowSMAIndex];
      const slowSMA_prev = slowSMA[slowSMAIndex - 1];
      
      // console.log(`[MA Cross @ idx ${index}] F_prev:${fastSMA_prev?.toFixed(2)}, F_last:${fastSMA_last?.toFixed(2)}, S_prev:${slowSMA_prev?.toFixed(2)}, S_last:${slowSMA_last?.toFixed(2)}`);

      // Bullish Crossover
      if (fastSMA_prev <= slowSMA_prev && fastSMA_last > slowSMA_last) {
          // console.log(`[MA Crossover @ idx ${index}] Bullish crossover detected`);
          return {
            symbol: targetSymbol, direction: 'buy', price: currentPrice, // Use price at index i
            confidence: 0.80, timestamp: Date.now(), // Timestamp would be candle time in backtest
            strategy: `MA Crossover (${this.fastSMAPeriod}/${this.slowSMAPeriod})`
          };
      }
      // Bearish Crossover
      if (fastSMA_prev >= slowSMA_prev && fastSMA_last < slowSMA_last) {
          // console.log(`[MA Crossover @ idx ${index}] Bearish crossover detected`);
          return {
            symbol: targetSymbol, direction: 'sell', price: currentPrice,
            confidence: 0.80, timestamp: Date.now(),
            strategy: `MA Crossover (${this.fastSMAPeriod}/${this.slowSMAPeriod})`
          };
      }
      
      return null; // No crossover signal at this index
  }

  // Refactored for backtesting
  private checkRSIConditions(
      rsi: number[], // Pass calculated RSI array
      index: number, 
      targetSymbol: string, 
      currentPrice: number
  ): TradeSignal | null {
      console.log(`[AI Engine] Checking RSI(${this.rsiPeriod})...`);
      // Map current index `i` to corresponding index in the indicator array
      // RSI calculation needs period+1 bars, result length is data.length - period
      const rsiIndex = index - this.rsiPeriod;

      if (rsiIndex < 1 || rsiIndex >= rsi.length) { // Need k and k-1
           // console.log(`[RSI @ idx ${index}] Index out of bounds. rsiIndex=${rsiIndex}, rsiLen=${rsi.length}`);
           return null; 
      }

      const rsi_last = rsi[rsiIndex];
      const rsi_prev = rsi[rsiIndex - 1];
      // console.log(`[RSI @ idx ${index}] Prev: ${rsi_prev?.toFixed(2)}, Last: ${rsi_last?.toFixed(2)}`);
      
      if (rsi_prev <= this.rsiOversold && rsi_last > this.rsiOversold) {
        return {
          symbol: targetSymbol, direction: 'buy', price: currentPrice,
          confidence: 0.75, timestamp: Date.now(), // Use candle time in backtest
          strategy: `RSI(${this.rsiPeriod}) Oversold Exit`
        };
      }
      if (rsi_prev >= this.rsiOverbought && rsi_last < this.rsiOverbought) {
        return {
          symbol: targetSymbol, direction: 'sell', price: currentPrice,
          confidence: 0.75, timestamp: Date.now(),
          strategy: `RSI(${this.rsiPeriod}) Overbought Exit`
        };
      }
      console.log(`[AI Engine] No RSI signal.`);
      return null; 
  }

  // Refactored for backtesting
  private checkMACDCrossover(
      macdResult: MACDResult | null, // Pass calculated MACD result object
      index: number, 
      targetSymbol: string, 
      currentPrice: number
  ): TradeSignal | null {
      console.log(`[AI Engine] Checking MACD(${this.macdFast}/${this.macdSlow}/${this.macdSignal})...`);
      if (!macdResult) {
          console.warn(`[MACD @ idx ${index}] MACD result is null.`);
          return null;
      }
      // Map current index `i` to corresponding index in the indicator arrays
      // This depends heavily on how calculateMACD aligns its output arrays.
      // Assuming the returned arrays (macdLine, signalLine) start at the same conceptual time point.
      // The offset needed is the total lookback required *before* the first *aligned* output point.
      const macdLookback = this.macdSlow + this.macdSignal - 2; // Lookback before first point of macdLine/signalLine
      const macdIndex = index - macdLookback; 

      if (macdIndex < 1 || macdIndex >= macdResult.macdLine.length) { // Need k and k-1
           // console.log(`[MACD @ idx ${index}] Index out of bounds. macdIndex=${macdIndex}, macdLen=${macdResult.macdLine.length}`);
           return null;
      }
      
      const macd_last = macdResult.macdLine[macdIndex];
      const macd_prev = macdResult.macdLine[macdIndex - 1];
      const signal_last = macdResult.signalLine[macdIndex];
      const signal_prev = macdResult.signalLine[macdIndex - 1];
      // console.log(`[MACD @ idx ${index}] M_prev:${macd_prev?.toFixed(2)}, M_last:${macd_last?.toFixed(2)}, S_prev:${signal_prev?.toFixed(2)}, S_last:${signal_last?.toFixed(2)}`);

      if (macd_prev <= signal_prev && macd_last > signal_last) {
          return {
            symbol: targetSymbol, direction: 'buy', price: currentPrice, 
            confidence: 0.70, timestamp: Date.now(), 
            strategy: `MACD Crossover (${this.macdFast}/${this.macdSlow}/${this.macdSignal})`
          };
      }
      if (macd_prev >= signal_prev && macd_last < signal_last) {
          return {
            symbol: targetSymbol, direction: 'sell', price: currentPrice, 
            confidence: 0.70, timestamp: Date.now(), 
            strategy: `MACD Crossover (${this.macdFast}/${this.macdSlow}/${this.macdSignal})`
          };
      }
      console.log(`[AI Engine] No MACD signal.`);
      return null; 
  }

  // Refactored for backtesting
  private checkBollingerBands(
      bbandsResult: BollingerBandsResult | null, // Pass calculated BBands result object
      index: number, 
      targetSymbol: string, 
      currentPrice: number,
      prevPrice?: number // Optional: previous price for stricter crossing check
  ): TradeSignal | null {
     console.log(`[AI Engine] Checking Bollinger Bands (${this.bbandsPeriod}/${this.bbandsStdDev})...`);
     if (!bbandsResult) {
         console.warn(`[BBands @ idx ${index}] BBands result is null.`);
         return null;
     }
     // Map current index `i` to corresponding index in the indicator array
     // BBands calc needs period bars, result length is data.length - period + 1
     const bbandsIndex = index - this.bbandsPeriod + 1;

      if (bbandsIndex < 0 || bbandsIndex >= bbandsResult.upperBand.length) { // Only need current point k
          // console.log(`[BBands @ idx ${index}] Index out of bounds. bbandsIndex=${bbandsIndex}, bbandsLen=${bbandsResult.upperBand.length}`);
          return null;
      }

      const upperBand_last = bbandsResult.upperBand[bbandsIndex];
      const lowerBand_last = bbandsResult.lowerBand[bbandsIndex];
      // const upperBand_prev = bbandsIndex > 0 ? bbandsResult.upperBand[bbandsIndex - 1] : null;
      // const lowerBand_prev = bbandsIndex > 0 ? bbandsResult.lowerBand[bbandsIndex - 1] : null;
      
      // console.log(`[BBands @ idx ${index}] C:${currentPrice.toFixed(2)}, U:${upperBand_last?.toFixed(2)}, L:${lowerBand_last?.toFixed(2)}`);

      // Sell Signal: Current price crosses ABOVE Upper Band 
      if (currentPrice > upperBand_last /* && prevPrice && upperBand_prev && prevPrice <= upperBand_prev */) { 
          return { 
              symbol: targetSymbol, direction: 'sell', price: currentPrice, 
              confidence: 0.65, timestamp: Date.now(), 
              strategy: `BBands (${this.bbandsPeriod}/${this.bbandsStdDev}) Upper Cross` 
          };
      }
      // Buy Signal: Current price crosses BELOW Lower Band
      if (currentPrice < lowerBand_last /* && prevPrice && lowerBand_prev && prevPrice >= lowerBand_prev */) {
          return { 
              symbol: targetSymbol, direction: 'buy', price: currentPrice, 
              confidence: 0.65, timestamp: Date.now(), 
              strategy: `BBands (${this.bbandsPeriod}/${this.bbandsStdDev}) Lower Cross` 
          };
      }
      console.log(`[AI Engine] No BBands signal.`);
      return null; 
  }

  // Refactored for backtesting
  private checkStochastic(
      stochResult: StochasticResult | null, // Pass calculated Stoch result object
      index: number,
      targetSymbol: string,
      currentPrice: number
  ): TradeSignal | null {
      console.log(`[AI Engine] Checking Stochastic (${this.stochasticKPeriod}/${this.stochasticDPeriod})...`);
      if (!stochResult) {
          console.warn(`[Stoch @ idx ${index}] Stoch result is null.`);
          return null;
      }
      // Map current index `i` 
      // Stoch calc needs kPeriod + dPeriod - 1 bars. Result length depends on alignment.
      // Assuming calculateStochastic returns arrays aligned from a common start point
      const commonIndicatorOffset = this.stochasticKPeriod + this.stochasticDPeriod - 2; // Approx start delay
      const stochIndex = index - commonIndicatorOffset;

        if (stochIndex < 1 || stochIndex >= stochResult.percentK.length) { 
             // console.log(`[Stoch @ idx ${index}] Index out of bounds. stochIndex=${stochIndex}, stochLen=${stochResult.percentK.length}`);
             return null;
        }
        
        const k_last = stochResult.percentK[stochIndex];
        const k_prev = stochResult.percentK[stochIndex - 1];
        const d_last = stochResult.percentD[stochIndex];
        const d_prev = stochResult.percentD[stochIndex - 1];
        // console.log(`[Stoch @ idx ${index}] K_prev:${k_prev?.toFixed(2)}, K_last:${k_last?.toFixed(2)}, D_prev:${d_prev?.toFixed(2)}, D_last:${d_last?.toFixed(2)}`);

        if (k_prev <= d_prev && k_last > d_last && k_prev < this.stochasticOversold && d_prev < this.stochasticOversold) {
            return { 
                symbol: targetSymbol, direction: 'buy', price: currentPrice, 
                confidence: 0.70, timestamp: Date.now(), 
                strategy: `Stoch (${this.stochasticKPeriod}/${this.stochasticDPeriod}) Oversold Cross` 
            };
        }
        if (k_prev >= d_prev && k_last < d_last && k_prev > this.stochasticOverbought && d_prev > this.stochasticOverbought) {
            return { 
                symbol: targetSymbol, direction: 'sell', price: currentPrice, 
                confidence: 0.70, timestamp: Date.now(), 
                strategy: `Stoch (${this.stochasticKPeriod}/${this.stochasticDPeriod}) Overbought Cross` 
            };
        }
        console.log(`[AI Engine] No Stoch signal.`);
        return null;
  }

  // --- Main Analysis Method (Adjusted to call refactored helpers) --- 
  async analyzeMarket(symbol?: string): Promise<TradeSignal | null> {
    const targetSymbol = symbol || this.symbol;
    console.log(`[AI Engine] Analyzing market for ${targetSymbol}... (Live Signal)`);

    try {
        // 1. Fetch historical data
        const historyNeeded = Math.max(
            this.slowSMAPeriod + 1, 
            this.rsiPeriod + 1, 
            this.macdSlow + this.macdSignal, 
            this.bbandsPeriod, 
            this.adxPeriod + this.adxPeriod,
            this.stochasticKPeriod + this.stochasticDPeriod,
            this.obvSmaPeriod 
        );
        const historyDays = historyNeeded + 40;

        // ** FINAL DYNAMIC DATE CALCULATION - Using toLocaleDateString **
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - historyDays);

        // Format YYYY-MM-DD using locale conversion (less prone to timezone issues for DATE ONLY)
        // Note: Specify 'en-CA' for guaranteed YYYY-MM-DD, or rely on server locale carefully.
        const formatDate = (date: Date): string => {
            return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
        }
        const startDateStr = formatDate(startDate);
        const endDateStr = formatDate(endDate);
        // ** END DYNAMIC DATE FIX **

        console.log(`[AI Engine] ---> FETCHING CANDLES from ${startDateStr} to ${endDateStr} <---`);
        const candles: PolygonCandle[] | null = await this.polygonService.getStockCandles(targetSymbol, startDateStr, endDateStr, 'day');
        
        // Updated Check: Explicitly check for null return from service
        if (candles === null) {
            console.error(`[AI Engine] !!! FAILED TO FETCH REAL CANDLES for ${targetSymbol} from ${startDateStr} to ${endDateStr}. Check API Key/Entitlements.`);
            this.setError(`Failed to fetch market data for ${targetSymbol}. Check API key or network.`); // Update UI error state
            return null; 
        } else if (candles.length < historyNeeded) {
            console.warn(`[AI Engine] Insufficient REAL candle data for ${targetSymbol} (${candles.length} received). Needed >= ${historyNeeded}.`);
            this.setError(`Insufficient history for ${targetSymbol} analysis.`); // Update UI error state
            return null;
        }
        
        // Clear any previous error message if data fetch is successful
        this.setError(null); 
        
        console.log(`[AI Engine] Successfully fetched ${candles.length} real candles for ${targetSymbol}.`);
        candles.sort((a, b) => a.t - b.t); 
        const closingPrices = candles.map(candle => candle.c);
        const latestIndex = closingPrices.length - 1;
        if (latestIndex < 1) return null; 
        const latestPrice = closingPrices[latestIndex];
        const prevPrice = closingPrices[latestIndex - 1]; 

        // 2. Calculate All Indicators Needed for Live signal check
        console.log(`[AI Engine] Calculating all indicators for live check...`);
        const fastSMA = calculateSMA(closingPrices, this.fastSMAPeriod);
        const slowSMA = calculateSMA(closingPrices, this.slowSMAPeriod);
        const rsi = calculateRSI(closingPrices, this.rsiPeriod);
        const macdResult = calculateMACD(closingPrices, this.macdFast, this.macdSlow, this.macdSignal);
        const bbandsResult = calculateBollingerBands(closingPrices, this.bbandsPeriod, this.bbandsStdDev);
        const stochResult = calculateStochastic(candles, this.stochasticKPeriod, this.stochasticDPeriod);
        const adxResult = calculateADX(candles, this.adxPeriod);
        const obv = calculateOBV(candles);
        
        let adxValue = 0;
        if (adxResult && adxResult.adx.length > 0) {
            adxValue = adxResult.adx[adxResult.adx.length - 1];
            console.log(`[ADX] Latest ADX: ${adxValue.toFixed(2)}`);
        } else {
            console.warn(`[ADX] Live calculation failed.`);
        }
        const isTrending = adxValue > this.adxTrendThreshold;
        console.log(`[AI Engine] Market Trending (ADX > ${this.adxTrendThreshold}): ${isTrending}`);
        
        // Calculate OBV SMA if needed for filtering
        let latestObv = obv.length > 0 ? obv[obv.length - 1] : 0;
        let obvSmaValue = 0;
        if (obv.length >= this.obvSmaPeriod) {
           const obvSma = calculateSMA(obv, this.obvSmaPeriod);
           if (obvSma.length > 0) obvSmaValue = obvSma[obvSma.length - 1];
        }
        console.log(`[OBV] Latest OBV: ${latestObv}, SMA(${this.obvSmaPeriod}): ${obvSmaValue.toFixed(0)}`);
        
        // --- Strategy Checks with ADX Filter --- 
        
        // Trend-Following Strategies (MA, MACD)
        if (isTrending) {
            console.log("[AI Engine] Trend detected (ADX > threshold), checking trend strategies...");
            const maSignal = this.checkMACrossover(fastSMA, slowSMA, latestIndex, targetSymbol, latestPrice);
            if (maSignal) return maSignal;

            const macdSignal = this.checkMACDCrossover(macdResult, latestIndex, targetSymbol, latestPrice);
            if (macdSignal) return macdSignal;
        } else {
            console.log("[AI Engine] No trend detected (ADX <= threshold), skipping trend strategies.");
        }

        // Mean-Reversion / Oscillator Strategies (RSI, BBands)
        if (!isTrending) {
            console.log("[AI Engine] Range detected (ADX <= threshold), checking mean-reversion strategies...");
            const rsiSignal = this.checkRSIConditions(rsi, latestIndex, targetSymbol, latestPrice);
            if (rsiSignal) return rsiSignal;

            const bbandsSignal = this.checkBollingerBands(bbandsResult, latestIndex, targetSymbol, latestPrice, prevPrice);
            if (bbandsSignal) return bbandsSignal;
        } else {
             console.log("[AI Engine] Trend detected (ADX > threshold), skipping mean-reversion strategies.");
        }
        
        // Stochastic Oscillator (Check regardless of trend for now)
        const stochSignal = this.checkStochastic(stochResult, latestIndex, targetSymbol, latestPrice);
        if (stochSignal) return stochSignal;

      // --- No signals --- 
      console.log(`[AI Engine] No live signal generated for ${targetSymbol}.`);
      return null;

    } catch (error) {
        console.error(`[AI Engine] Error analyzing market for ${targetSymbol}:`, error);
        this.setError(`Analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`); // Update UI error state
        return null;
    }
  }

  // --- Other Methods --- 
  setSymbol(symbol: string): void { this.symbol = symbol; }
  setMode(mode: TradingMode): void { this.mode = mode; }
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

  // Need to pass the setError function from the component if we want to update UI state
  // For now, errors are logged, but not directly shown in UI from engine errors
  private setError(message: string | null) {
      // Placeholder - In a real scenario, this might use a callback passed during construction
      console.log("[AITradingEngine] Setting error state (placeholder):", message);
  }
} 