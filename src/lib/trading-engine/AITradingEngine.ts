'use client'

import { PolygonService } from '../market-data/PolygonService';
import { TradingMode, TradingSignal, Position, TradeScenario } from './types';
import { TradingMode as TradingModeEnum } from './TradingMode';

export interface TradeSignal {
  symbol: string;
  direction: 'buy' | 'sell';
  price: number;
  confidence: number;
  timestamp: number;
}

export class AITradingEngine {
  private symbol: string;
  private mode: TradingMode;
  private polygonService: PolygonService;

  constructor(symbol: string = 'AAPL', mode: TradingMode = TradingModeEnum.DEMO) {
    this.symbol = symbol;
    this.mode = mode;
    this.polygonService = PolygonService.getInstance();
    console.log(`AI Trading Engine initialized for ${symbol} in ${mode} mode`);
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
    console.log(`Analyzing market for ${targetSymbol}...`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulated delay

    // Increase signal generation chance to 70%
    if (Math.random() > 0.3) { 
      const isBuy = Math.random() > 0.5;
      const signal: TradeSignal = {
        symbol: targetSymbol,
        direction: isBuy ? 'buy' : 'sell',
        price: parseFloat((100 + Math.random() * 50).toFixed(2)),
        confidence: parseFloat((0.6 + Math.random() * 0.4).toFixed(2)), // Keep confidence random
        timestamp: Date.now()
      };
      console.log(`Signal generated: ${signal.direction} ${signal.symbol} at $${signal.price} (${(signal.confidence * 100).toFixed(0)}% confidence)`);
      return signal;
    }

    console.log(`No trading signals for ${targetSymbol}`);
    return null;
  }

  calculatePositionSize(price: number, risk: number = 0.02): number {
    // Simple position sizing based on risk percentage
    const accountSize = 10000; // Simulated account size
    const riskAmount = accountSize * risk;
    const shares = Math.floor(riskAmount / price);
    return shares;
  }

  async executeTradeSignal(signal: TradeSignal): Promise<boolean> {
    console.log(`Executing ${signal.direction} signal for ${signal.symbol} at $${signal.price}`);
    
    if (this.mode === TradingModeEnum.DEMO) {
      console.log('Demo mode: Simulating trade execution');
      // Simulate successful trade execution
      await new Promise(resolve => setTimeout(resolve, 300));
      return true;
    } else {
      console.log('Live mode: Connecting to brokerage API');
      // In a real implementation, this would connect to a brokerage API
      // For now, we're just simulating a successful trade
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Live trade executed successfully');
      return true;
    }
  }
} 