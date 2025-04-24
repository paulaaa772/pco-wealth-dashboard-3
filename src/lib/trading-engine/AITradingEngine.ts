'use client'

import { PolygonService } from '../market-data/PolygonService';
import { TradingMode, TradingSignal, Position, TradeScenario } from './types';

export class AITradingEngine {
  private mode: TradingMode;
  private polygonService: PolygonService;

  constructor(mode: TradingMode = 'demo') {
    this.mode = mode;
    this.polygonService = PolygonService.getInstance();
    console.log('[MOCK AI] Trading engine initialized in', mode, 'mode');
  }

  async analyzeMarket(symbol: string): Promise<TradingSignal | null> {
    try {
      console.log('[MOCK AI] Analyzing market for', symbol);

      // Get price data from our mock service
      const lastPrice = await this.polygonService.getLatestPrice(symbol);
      console.log('[MOCK AI] Current price for', symbol, 'is', lastPrice);

      // Generate a trading scenario based on symbol and market data
      const scenario = this.generateTradingScenario(symbol, lastPrice);
      console.log('[MOCK AI] Generated trading scenario:', scenario);
      
      return {
        symbol,
        scenario
      };
    } catch (error) {
      console.error('[MOCK AI] Error analyzing market:', error);
      return null;
    }
  }

  private generateTradingScenario(symbol: string, currentPrice: number): TradeScenario {
    // This is a simplified mock implementation
    
    // Randomly decide position type
    const rand = Math.random();
    const position = rand < 0.5 ? 'long' : 'short';
    
    // Create random values for demo purposes
    const confidence = Math.random() * 0.5 + 0.5; // Between 0.5 and 1.0
    const entryPrice = currentPrice;
    const stopLoss = position === 'long' 
      ? currentPrice * (1 - Math.random() * 0.05) // 0-5% below for long
      : currentPrice * (1 + Math.random() * 0.05); // 0-5% above for short
    const takeProfit = position === 'long'
      ? currentPrice * (1 + Math.random() * 0.1) // 0-10% above for long
      : currentPrice * (1 - Math.random() * 0.1); // 0-10% below for short
    
    return {
      position,
      confidence,
      entryPrice,
      stopLoss,
      takeProfit,
      timeframe: '1d',
    };
  }

  calculatePositionSize(capital: number, risk: number, entryPrice: number, stopLoss: number): number {
    const riskAmount = capital * risk;
    const priceDifference = Math.abs(entryPrice - stopLoss);
    const positionSize = riskAmount / priceDifference;
    return Math.floor(positionSize);
  }
} 