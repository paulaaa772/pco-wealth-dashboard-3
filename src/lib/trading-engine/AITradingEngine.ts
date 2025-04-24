import { TradingMode, TradeScenario, TradingSignal, Position } from './types';
import { PolygonService, PolygonCandle } from '../market-data/PolygonService';

export class AITradingEngine {
  private mode: TradingMode;
  private readonly ATR_MULTIPLIER = 2;
  private readonly RSI_OVERBOUGHT = 70;
  private readonly RSI_OVERSOLD = 30;
  private readonly VOLUME_THRESHOLD = 1.5;
  private polygonService: PolygonService;

  constructor(mode: TradingMode = 'demo') {
    this.mode = mode;
    this.polygonService = PolygonService.getInstance();
  }

  async analyzeMarket(symbol: string): Promise<TradingSignal | null> {
    try {
      // Get historical data for analysis
      const to = new Date().toISOString().split('T')[0];
      const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const historicalData = await this.polygonService.getStockCandles(symbol, from, to, '1day');
      
      if (historicalData.length === 0) {
        console.error('No historical data available for analysis');
        return null;
      }

      const indicators = await this.calculateIndicators(historicalData);
      const scenario = await this.generateTradeScenario(symbol, historicalData, indicators);
      
      const filters = this.applyFilters(indicators);
      if (!this.validateFilters(filters)) {
        return null;
      }

      return {
        symbol,
        scenario,
        indicators,
        filters
      };
    } catch (error) {
      console.error('Error analyzing market:', error);
      return null;
    }
  }

  private async calculateIndicators(data: PolygonCandle[]) {
    const closes = data.map(candle => candle.c);
    const volumes = data.map(candle => candle.v);

    const rsi = this.calculateRSI(closes);
    const volume = this.calculateRelativeVolume(volumes);
    const trend = this.determineTrend(closes);
    const atr = this.calculateATR(data);

    return {
      rsi,
      volume,
      trend,
      atr
    };
  }

  private calculateRSI(prices: number[], period: number = 14): number {
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < period + 1; i++) {
      const difference = prices[i] - prices[i - 1];
      if (difference >= 0) {
        gains += difference;
      } else {
        losses -= difference;
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    for (let i = period + 1; i < prices.length; i++) {
      const difference = prices[i] - prices[i - 1];
      if (difference >= 0) {
        avgGain = (avgGain * 13 + difference) / 14;
        avgLoss = (avgLoss * 13) / 14;
      } else {
        avgGain = (avgGain * 13) / 14;
        avgLoss = (avgLoss * 13 - difference) / 14;
      }
    }

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateRelativeVolume(volumes: number[]): number {
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const currentVolume = volumes[volumes.length - 1];
    return currentVolume / avgVolume;
  }

  private determineTrend(prices: number[]): 'bullish' | 'bearish' | 'neutral' {
    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = this.calculateSMA(prices, 50);
    
    if (sma20 > sma50) return 'bullish';
    if (sma20 < sma50) return 'bearish';
    return 'neutral';
  }

  private calculateSMA(prices: number[], period: number): number {
    return prices.slice(-period).reduce((a, b) => a + b, 0) / period;
  }

  private calculateATR(data: PolygonCandle[], period: number = 14): number {
    const trs = data.map((candle, i) => {
      if (i === 0) return candle.h - candle.l;
      
      const previousClose = data[i - 1].c;
      const tr = Math.max(
        candle.h - candle.l,
        Math.abs(candle.h - previousClose),
        Math.abs(candle.l - previousClose)
      );
      return tr;
    });

    return this.calculateSMA(trs, period);
  }

  private async generateTradeScenario(symbol: string, data: PolygonCandle[], indicators: any): Promise<TradeScenario> {
    const lastPrice = await this.polygonService.getLatestPrice(symbol) || data[data.length - 1].c;
    const atrValue = indicators.atr;
    const position = indicators.rsi < 40 ? 'long' : indicators.rsi > 60 ? 'short' : 'long';

    return {
      entryPrice: lastPrice,
      stopLoss: position === 'long' ? 
        lastPrice - (atrValue * this.ATR_MULTIPLIER) :
        lastPrice + (atrValue * this.ATR_MULTIPLIER),
      takeProfit: position === 'long' ?
        lastPrice + (atrValue * this.ATR_MULTIPLIER * 1.5) :
        lastPrice - (atrValue * this.ATR_MULTIPLIER * 1.5),
      position,
      confidence: this.calculateConfidence(indicators),
      timestamp: new Date()
    };
  }

  private calculateConfidence(indicators: any): number {
    let confidence = 0.5; // Base confidence

    // Adjust based on RSI
    if (indicators.rsi < 30 || indicators.rsi > 70) confidence += 0.1;
    if (indicators.rsi < 20 || indicators.rsi > 80) confidence += 0.1;

    // Adjust based on volume
    if (indicators.volume > this.VOLUME_THRESHOLD) confidence += 0.1;
    if (indicators.volume > this.VOLUME_THRESHOLD * 2) confidence += 0.1;

    // Adjust based on trend alignment
    if (indicators.trend !== 'neutral') confidence += 0.1;

    return Math.min(confidence, 0.9); // Cap at 90% confidence
  }

  private applyFilters(indicators: any) {
    return {
      volumeValid: indicators.volume > this.VOLUME_THRESHOLD,
      trendValid: indicators.trend !== 'neutral',
      rsiValid: indicators.rsi < this.RSI_OVERBOUGHT && indicators.rsi > this.RSI_OVERSOLD
    };
  }

  private validateFilters(filters: any): boolean {
    return filters.volumeValid && filters.trendValid && filters.rsiValid;
  }

  public setMode(mode: TradingMode) {
    this.mode = mode;
  }

  public getMode(): TradingMode {
    return this.mode;
  }
} 