'use client'

import { PolygonService } from '../market-data/PolygonService';
import { TradingMode, TradingSignal, Position, TradeScenario } from './types';

export class AITradingEngine {
  private mode: TradingMode;
  private polygonService: PolygonService | null;

  constructor(mode: TradingMode = 'demo') {
    this.mode = mode;
    this.polygonService = PolygonService.getInstance();
  }

  async analyzeMarket(symbol: string): Promise<TradingSignal | null> {
    try {
      if (!this.polygonService) {
        console.error('Market data service not available');
        return null;
      }

      const lastPrice = await this.polygonService.getLatestPrice(symbol);
      if (!lastPrice) return null;

      // Generate a trading scenario based on symbol and market data
      const scenario = this.generateTradingScenario(symbol, lastPrice);
      
      return {
        symbol,
        scenario
      };
    } catch (error) {
      console.error('Error analyzing market:', error);
      return null;
    }
  }

  private generateTradingScenario(symbol: string, currentPrice: number): TradeScenario {
    // This is a simplified mock implementation
    // In a real system, this would use technical analysis algorithms
    
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