'use client'

// AIRiskManager.ts - Advanced risk management system for AI trading

import { AIPosition } from '@/lib/trading-engine/types';
import { PolygonCandle } from '../market-data/PolygonService';

export interface KellyParams {
  winRate: number;      // Historical win rate (0-1)
  avgWinPercent: number; // Average win as percentage (e.g., 0.05 for 5%)
  avgLossPercent: number; // Average loss as percentage (e.g., 0.03 for 3%)
}

export interface TradeStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgWinPercent: number;
  avgLossPercent: number;
  expectancy: number;  // Average expected return per trade
  maxConsecutiveLosses: number;
  maxDrawdownPercent: number;
  sharpeRatio: number; // Risk-adjusted return
}

export interface TradingLimits {
  maxPositionSize: number;        // Maximum position size (percentage of capital)
  maxSectorExposure: number;      // Maximum exposure to a single sector (percentage)
  maxAssetExposure: number;       // Maximum exposure to a single asset (percentage)
  maxCorrelatedExposure: number;  // Maximum exposure to correlated assets (percentage)
  maxDrawdownTolerance: number;   // Maximum drawdown tolerance (percentage)
}

export interface StopLossTakeProfit {
  stopLossPercent: number;      // Fixed stop loss percentage
  takeProfitPercent: number;    // Fixed take profit percentage
  dynamicStopLoss: boolean;     // Whether to use dynamic (ATR-based) stop loss
  dynamicTakeProfit: boolean;   // Whether to use dynamic (ATR-based) take profit
  trailingStop: boolean;        // Whether to use trailing stop loss
  atrMultiplier: number;        // Multiplier for ATR-based stops
  minStopLossPercent: number;   // Minimum stop loss percentage (floor)
  maxStopLossPercent: number;   // Maximum stop loss percentage (ceiling)
}

// Blacklist criteria for assets
export interface BlacklistCriteria {
  lowLiquidity: boolean;        // Blacklist low liquidity assets
  highVolatility: boolean;      // Blacklist excessively volatile assets
  patterns: {
    pumpAndDump: boolean;       // Detect pump and dump patterns
    manipulationSigns: boolean; // Signs of market manipulation
  };
  minAvgVolume: number;         // Minimum average volume threshold
  minMarketCap: number;         // Minimum market cap threshold
}

export class AIRiskManager {
  private accountSize: number;
  private currentDrawdown: number = 0;
  private maxDrawdownExperienced: number = 0;
  private consecutiveLosses: number = 0;
  private maxConsecutiveLosses: number = 0;
  private tradingLimits: TradingLimits;
  private stopLossSettings: StopLossTakeProfit;
  private blacklistCriteria: BlacklistCriteria;
  private blacklistedAssets: Set<string> = new Set();
  private tradeHistory: AIPosition[] = [];
  private sectorExposure: Map<string, number> = new Map();
  private assetExposure: Map<string, number> = new Map();
  private correlationMatrix: Map<string, Map<string, number>> = new Map();
  private currentEquity: number;

  constructor(
    initialAccountSize: number = 10000,
    tradingLimits: Partial<TradingLimits> = {},
    stopLossSettings: Partial<StopLossTakeProfit> = {},
    blacklistCriteria: Partial<BlacklistCriteria> = {}
  ) {
    this.accountSize = initialAccountSize;
    this.currentEquity = initialAccountSize;
    
    // Default trading limits
    this.tradingLimits = {
      maxPositionSize: tradingLimits.maxPositionSize || 0.05,       // 5% of account per position
      maxSectorExposure: tradingLimits.maxSectorExposure || 0.20,   // 20% max in any sector
      maxAssetExposure: tradingLimits.maxAssetExposure || 0.10,     // 10% max in any asset
      maxCorrelatedExposure: tradingLimits.maxCorrelatedExposure || 0.30, // 30% max in correlated assets
      maxDrawdownTolerance: tradingLimits.maxDrawdownTolerance || 0.20  // 20% max drawdown
    };

    // Default stop loss and take profit settings
    this.stopLossSettings = {
      stopLossPercent: stopLossSettings.stopLossPercent || 0.02,      // 2% fixed stop loss
      takeProfitPercent: stopLossSettings.takeProfitPercent || 0.04,  // 4% fixed take profit
      dynamicStopLoss: stopLossSettings.dynamicStopLoss !== undefined ? 
                      stopLossSettings.dynamicStopLoss : true,        // Use ATR by default
      dynamicTakeProfit: stopLossSettings.dynamicTakeProfit !== undefined ? 
                        stopLossSettings.dynamicTakeProfit : true,    // Use ATR by default
      trailingStop: stopLossSettings.trailingStop !== undefined ? 
                   stopLossSettings.trailingStop : false,             // No trailing stop by default
      atrMultiplier: stopLossSettings.atrMultiplier || 2.0,           // 2x ATR for stops
      minStopLossPercent: stopLossSettings.minStopLossPercent || 0.01, // 1% minimum stop loss
      maxStopLossPercent: stopLossSettings.maxStopLossPercent || 0.05  // 5% maximum stop loss
    };

    // Default blacklist criteria
    this.blacklistCriteria = {
      lowLiquidity: blacklistCriteria.lowLiquidity !== undefined ? 
                    blacklistCriteria.lowLiquidity : true,          // Filter out low liquidity
      highVolatility: blacklistCriteria.highVolatility !== undefined ? 
                     blacklistCriteria.highVolatility : true,       // Filter out high volatility
      patterns: {
        pumpAndDump: blacklistCriteria.patterns?.pumpAndDump !== undefined ? 
                    blacklistCriteria.patterns.pumpAndDump : true,  // Detect pump & dump
        manipulationSigns: blacklistCriteria.patterns?.manipulationSigns !== undefined ?
                          blacklistCriteria.patterns.manipulationSigns : true // Detect manipulation
      },
      minAvgVolume: blacklistCriteria.minAvgVolume || 100000,       // Minimum daily volume
      minMarketCap: blacklistCriteria.minMarketCap || 50000000      // $50M minimum market cap
    };

    console.log('[AI Risk Manager] Initialized with account size:', initialAccountSize);
  }

  // Calculate position size using Kelly Criterion
  public calculateKellyPositionSize(
    symbol: string,
    price: number,
    volatility: number,
    params: KellyParams
  ): number {
    console.log(`[Kelly Criterion] Calculating position size for ${symbol} at $${price}`);
    
    try {
      // Basic Kelly formula: f* = (p*b - q)/b where:
      // f* = fraction of bankroll to bet
      // p = probability of winning (win rate)
      // q = probability of losing (1 - p)
      // b = odds received on the bet (avg win / avg loss)
      
      const winRate = params.winRate;
      const lossRate = 1 - winRate;
      const payoffRatio = params.avgWinPercent / params.avgLossPercent;
      
      let kellyPercentage = (winRate * payoffRatio - lossRate) / payoffRatio;
      
      // Apply 'half Kelly' for more conservative sizing
      kellyPercentage = kellyPercentage * 0.5;
      
      // Apply limits and volatility adjustment
      kellyPercentage = Math.max(0, kellyPercentage); // Ensure non-negative
      kellyPercentage = Math.min(kellyPercentage, this.tradingLimits.maxPositionSize); // Cap at max position size
      
      // Adjust for volatility - reduce position size in more volatile assets
      const volatilityAdjustment = 1 - (volatility * 0.5); // Higher volatility = lower adjustment factor
      kellyPercentage *= volatilityAdjustment;
      
      // Reduce position size if in drawdown
      if (this.currentDrawdown > 0.05) { // More than 5% drawdown
        const drawdownFactor = 1 - (this.currentDrawdown / this.tradingLimits.maxDrawdownTolerance);
        kellyPercentage *= Math.max(0.25, drawdownFactor); // At least 25% of original size
      }
      
      // Reduce if consecutive losses
      if (this.consecutiveLosses > 2) {
        const consecutiveLossFactor = Math.pow(0.8, this.consecutiveLosses - 2); // Reduce by 20% per consecutive loss
        kellyPercentage *= consecutiveLossFactor;
      }
      
      // Calculate final position size in currency amount
      const positionAmount = this.currentEquity * kellyPercentage;
      
      // Convert to number of shares (rounded down)
      const shares = Math.floor(positionAmount / price);
      
      console.log(`[Kelly Criterion] Position size: ${kellyPercentage.toFixed(4)} (${shares} shares at $${price})`);
      return shares;
    } catch (error) {
      console.error('[Kelly Criterion] Error calculating position size:', error);
      // Fallback to a conservative position size
      return Math.floor(this.currentEquity * 0.01 / price);
    }
  }

  // Calculate position size using ATR (Average True Range)
  public calculateATRPositionSize(
    symbol: string,
    price: number,
    atr: number,
    riskPercentage: number = 0.01 // Default to 1% risk per trade
  ): number {
    console.log(`[ATR Position Sizing] Calculating position size for ${symbol} at $${price}, ATR: ${atr}`);
    
    try {
      // ATR-based position sizing:
      // Position size = (Account risk amount) / (ATR * ATR multiplier)
      // Where account risk amount = account size * risk percentage
      
      const accountRiskAmount = this.currentEquity * riskPercentage;
      const atrStop = atr * this.stopLossSettings.atrMultiplier;
      
      // Dollar risk per share
      const riskPerShare = atrStop * price;
      
      // Calculate position size
      let shares = Math.floor(accountRiskAmount / riskPerShare);
      
      // Apply maximum position size limit
      const maxShares = Math.floor(this.currentEquity * this.tradingLimits.maxPositionSize / price);
      shares = Math.min(shares, maxShares);
      
      console.log(`[ATR Position Sizing] Position size: ${shares} shares (Risk: $${accountRiskAmount.toFixed(2)}, Stop distance: $${atrStop.toFixed(2)})`);
      return shares;
    } catch (error) {
      console.error('[ATR Position Sizing] Error calculating position size:', error);
      // Fallback to a conservative position size
      return Math.floor(this.currentEquity * 0.01 / price);
    }
  }

  // Calculate dynamic stop loss and take profit levels based on ATR
  public calculateDynamicLevels(
    price: number,
    atr: number,
    direction: 'buy' | 'sell'
  ): { stopLoss: number; takeProfit: number } {
    try {
      // For long positions:
      // Stop loss = Entry price - (ATR * multiplier)
      // Take profit = Entry price + (ATR * multiplier * risk-reward ratio)
      
      // For short positions:
      // Stop loss = Entry price + (ATR * multiplier)
      // Take profit = Entry price - (ATR * multiplier * risk-reward ratio)
      
      const atrMultiplier = this.stopLossSettings.atrMultiplier;
      const riskRewardRatio = this.stopLossSettings.takeProfitPercent / this.stopLossSettings.stopLossPercent;
      
      const atrAmount = atr * atrMultiplier;
      
      let stopLoss: number;
      let takeProfit: number;
      
      if (direction === 'buy') {
        // Long position
        stopLoss = price - atrAmount;
        takeProfit = price + (atrAmount * riskRewardRatio);
      } else {
        // Short position
        stopLoss = price + atrAmount;
        takeProfit = price - (atrAmount * riskRewardRatio);
      }
      
      // Apply minimum and maximum stop loss thresholds
      const stopLossDistance = Math.abs(price - stopLoss) / price;
      
      if (stopLossDistance < this.stopLossSettings.minStopLossPercent) {
        // Stop loss is too tight, widen it
        stopLoss = direction === 'buy' 
          ? price * (1 - this.stopLossSettings.minStopLossPercent)
          : price * (1 + this.stopLossSettings.minStopLossPercent);
      } else if (stopLossDistance > this.stopLossSettings.maxStopLossPercent) {
        // Stop loss is too wide, tighten it
        stopLoss = direction === 'buy'
          ? price * (1 - this.stopLossSettings.maxStopLossPercent)
          : price * (1 + this.stopLossSettings.maxStopLossPercent);
      }
      
      // Recalculate take profit based on the adjusted stop loss to maintain the risk-reward ratio
      const adjustedRisk = Math.abs(price - stopLoss);
      takeProfit = direction === 'buy'
        ? price + (adjustedRisk * riskRewardRatio)
        : price - (adjustedRisk * riskRewardRatio);
      
      return { stopLoss, takeProfit };
    } catch (error) {
      console.error('[Dynamic Levels] Error calculating dynamic levels:', error);
      // Fallback to fixed percentages
      return {
        stopLoss: direction === 'buy' 
          ? price * (1 - this.stopLossSettings.stopLossPercent) 
          : price * (1 + this.stopLossSettings.stopLossPercent),
        takeProfit: direction === 'buy'
          ? price * (1 + this.stopLossSettings.takeProfitPercent)
          : price * (1 - this.stopLossSettings.takeProfitPercent)
      };
    }
  }

  // Adjust risk parameters based on drawdown
  public adjustForDrawdown(): void {
    if (this.currentDrawdown >= this.tradingLimits.maxDrawdownTolerance) {
      // Halt trading
      console.warn(`[Drawdown Control] TRADING HALTED: Current drawdown (${(this.currentDrawdown * 100).toFixed(2)}%) exceeds tolerance (${(this.tradingLimits.maxDrawdownTolerance * 100).toFixed(2)}%)`);
      // Here you would implement logic to stop trading until account recovers
      return;
    }
    
    // Scale down position size based on drawdown severity
    const drawdownFactor = 1 - (this.currentDrawdown / this.tradingLimits.maxDrawdownTolerance);
    const adjustedMaxPositionSize = this.tradingLimits.maxPositionSize * drawdownFactor;
    
    console.log(`[Drawdown Control] Adjusting max position size: ${(this.tradingLimits.maxPositionSize * 100).toFixed(2)}% → ${(adjustedMaxPositionSize * 100).toFixed(2)}% due to ${(this.currentDrawdown * 100).toFixed(2)}% drawdown`);
    
    // Temporarily update the trading limits (will reset when drawdown improves)
    this.tradingLimits.maxPositionSize = adjustedMaxPositionSize;
  }

  // Recalibrate risk-reward ratio based on win rate
  public recalibrateRiskReward(stats: TradeStats): void {
    console.log('[Recalibration] Recalibrating risk-reward ratio based on performance statistics');
    
    try {
      // Basic concept: If win rate is high but average win is small,
      // shift towards higher risk-reward. If win rate is low but avg win is high,
      // reduce risk-reward ratio to increase win rate.
      
      // Ideal risk-reward ratio based on Kelly criterion: (win rate / (1 - win rate))
      const idealRiskReward = stats.winRate / (1 - stats.winRate);
      
      // Current risk-reward ratio
      const currentRiskReward = this.stopLossSettings.takeProfitPercent / this.stopLossSettings.stopLossPercent;
      
      // Blend current and ideal with bias towards current (stability)
      const newRiskReward = currentRiskReward * 0.7 + idealRiskReward * 0.3;
      
      // Constrain to reasonable bounds (1.0 to 5.0)
      const adjustedRiskReward = Math.max(1.0, Math.min(5.0, newRiskReward));
      
      // Update take profit percentage while keeping stop loss the same
      const newTakeProfit = this.stopLossSettings.stopLossPercent * adjustedRiskReward;
      
      console.log(`[Recalibration] Risk-reward ratio: ${currentRiskReward.toFixed(2)} → ${adjustedRiskReward.toFixed(2)}`);
      console.log(`[Recalibration] Take profit percentage: ${(this.stopLossSettings.takeProfitPercent * 100).toFixed(2)}% → ${(newTakeProfit * 100).toFixed(2)}%`);
      
      this.stopLossSettings.takeProfitPercent = newTakeProfit;
      
      // If expectancy is negative, consider widening stop loss or adjusting strategy
      if (stats.expectancy < 0 && stats.totalTrades > 20) {
        console.warn('[Recalibration] WARNING: Negative expectancy detected! Consider adjusting strategy.');
      }
    } catch (error) {
      console.error('[Recalibration] Error recalibrating risk-reward ratio:', error);
    }
  }

  // Check if adding a position would violate exposure limits
  public checkExposureLimits(
    symbol: string,
    sector: string,
    amount: number
  ): { allowed: boolean; reason?: string } {
    const percentOfAccount = amount / this.currentEquity;
    
    // Check asset exposure limit
    const currentAssetExposure = this.assetExposure.get(symbol) || 0;
    if (currentAssetExposure + percentOfAccount > this.tradingLimits.maxAssetExposure) {
      return {
        allowed: false,
        reason: `Max asset exposure exceeded for ${symbol}: ${((currentAssetExposure + percentOfAccount) * 100).toFixed(2)}% > ${(this.tradingLimits.maxAssetExposure * 100).toFixed(2)}%`
      };
    }
    
    // Check sector exposure limit
    const currentSectorExposure = this.sectorExposure.get(sector) || 0;
    if (currentSectorExposure + percentOfAccount > this.tradingLimits.maxSectorExposure) {
      return {
        allowed: false,
        reason: `Max sector exposure exceeded for ${sector}: ${((currentSectorExposure + percentOfAccount) * 100).toFixed(2)}% > ${(this.tradingLimits.maxSectorExposure * 100).toFixed(2)}%`
      };
    }
    
    // Check correlated asset exposure (simplified implementation)
    const correlatedAssets = this.getCorrelatedAssets(symbol);
    const correlatedExposure = this.calculateCorrelatedExposure(correlatedAssets);
    if (correlatedExposure + percentOfAccount > this.tradingLimits.maxCorrelatedExposure) {
      return {
        allowed: false,
        reason: `Max correlated exposure exceeded for assets related to ${symbol}: ${((correlatedExposure + percentOfAccount) * 100).toFixed(2)}% > ${(this.tradingLimits.maxCorrelatedExposure * 100).toFixed(2)}%`
      };
    }
    
    return { allowed: true };
  }
  
  // Get list of assets correlated with the given symbol
  private getCorrelatedAssets(symbol: string): string[] {
    // This would be expanded with real correlation data
    // For now, return empty array simulating no correlated assets
    return [];
  }
  
  // Calculate exposure to correlated assets
  private calculateCorrelatedExposure(symbols: string[]): number {
    // Sum exposure across all correlated assets
    return symbols.reduce((total, symbol) => {
      return total + (this.assetExposure.get(symbol) || 0);
    }, 0);
  }

  // Check if an asset should be blacklisted
  public async shouldBlacklist(
    symbol: string,
    candles: PolygonCandle[],
    averageVolume: number,
    marketCap: number
  ): Promise<{ blacklisted: boolean; reason?: string }> {
    // Check if already blacklisted
    if (this.blacklistedAssets.has(symbol)) {
      return { 
        blacklisted: true, 
        reason: `${symbol} is already blacklisted` 
      };
    }
    
    // Check minimum volume
    if (this.blacklistCriteria.lowLiquidity && averageVolume < this.blacklistCriteria.minAvgVolume) {
      this.blacklistedAssets.add(symbol);
      return { 
        blacklisted: true, 
        reason: `Low liquidity: Average volume (${averageVolume}) below threshold (${this.blacklistCriteria.minAvgVolume})` 
      };
    }
    
    // Check minimum market cap
    if (marketCap < this.blacklistCriteria.minMarketCap) {
      this.blacklistedAssets.add(symbol);
      return { 
        blacklisted: true, 
        reason: `Small cap: Market cap ($${(marketCap/1000000).toFixed(2)}M) below threshold ($${(this.blacklistCriteria.minMarketCap/1000000).toFixed(2)}M)` 
      };
    }
    
    // Check for excessive volatility
    if (this.blacklistCriteria.highVolatility && candles.length > 0) {
      const volatility = this.calculateVolatility(candles);
      // Blacklist extremely volatile assets (e.g., >10% daily volatility)
      if (volatility > 0.10) {
        this.blacklistedAssets.add(symbol);
        return { 
          blacklisted: true, 
          reason: `High volatility: ${(volatility * 100).toFixed(2)}% exceeds threshold` 
        };
      }
    }
    
    // Check for pump and dump patterns
    if (this.blacklistCriteria.patterns.pumpAndDump && candles.length >= 20) {
      if (this.detectPumpAndDump(candles)) {
        this.blacklistedAssets.add(symbol);
        return { 
          blacklisted: true, 
          reason: `Pump and dump pattern detected` 
        };
      }
    }
    
    // Check for manipulation signs
    if (this.blacklistCriteria.patterns.manipulationSigns && candles.length >= 30) {
      if (this.detectManipulation(candles)) {
        this.blacklistedAssets.add(symbol);
        return { 
          blacklisted: true, 
          reason: `Signs of market manipulation detected` 
        };
      }
    }
    
    return { blacklisted: false };
  }
  
  // Calculate volatility from historical candles
  private calculateVolatility(candles: PolygonCandle[]): number {
    // Simple implementation: calculate standard deviation of daily returns
    if (candles.length < 2) return 0;
    
    const returns: number[] = [];
    for (let i = 1; i < candles.length; i++) {
      const dailyReturn = (candles[i].c - candles[i-1].c) / candles[i-1].c;
      returns.push(dailyReturn);
    }
    
    // Calculate average return
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    
    // Calculate variance
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    
    // Standard deviation
    return Math.sqrt(variance);
  }
  
  // Detect pump and dump patterns
  private detectPumpAndDump(candles: PolygonCandle[]): boolean {
    if (candles.length < 20) return false;
    
    // Look for rapid price increase followed by sharp decline
    // Simplified algorithm: check if there was >20% rise within 3 days,
    // followed by >15% decline within the next 3 days
    
    for (let i = 3; i < candles.length - 3; i++) {
      // Calculate 3-day rise
      const threeDayRise = (candles[i].c - candles[i-3].c) / candles[i-3].c;
      
      // If sharp rise detected, check for subsequent fall
      if (threeDayRise > 0.20) {
        const subsequentFall = (candles[i+3].c - candles[i].c) / candles[i].c;
        
        if (subsequentFall < -0.15) {
          return true; // Pump and dump pattern detected
        }
      }
    }
    
    return false;
  }
  
  // Detect market manipulation signs
  private detectManipulation(candles: PolygonCandle[]): boolean {
    if (candles.length < 30) return false;
    
    // Look for suspicious patterns like:
    // 1. Abnormal volume spikes without news
    // 2. Irregular price movements contrary to market trend
    // 3. Patterns of price pushing near key levels
    
    // Simplified implementation: check for extreme volume spikes (>5x average)
    const volumes = candles.map(c => c.v);
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    
    for (let i = 0; i < volumes.length; i++) {
      if (volumes[i] > avgVolume * 5) {
        // Check if price moved significantly
        const priceChange = Math.abs(candles[i].c - candles[i].o) / candles[i].o;
        
        // If huge volume but small price movement, potential manipulation
        if (priceChange < 0.01) {
          return true;
        }
      }
    }
    
    return false;
  }

  // Update trade statistics based on closed trades
  public updateTradeStatistics(positions: AIPosition[]): TradeStats {
    // Filter to closed positions only
    const closedPositions = positions.filter(p => p.status === 'closed' && p.profit !== undefined);
    
    // Calculate basic statistics
    const totalTrades = closedPositions.length;
    const winningTrades = closedPositions.filter(p => (p.profit || 0) > 0).length;
    const losingTrades = closedPositions.filter(p => (p.profit || 0) <= 0).length;
    const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;
    
    // Calculate profit/loss percentages
    const winningPositions = closedPositions.filter(p => (p.profit || 0) > 0);
    const losingPositions = closedPositions.filter(p => (p.profit || 0) <= 0);
    
    const avgWinPercent = winningPositions.length > 0 
      ? winningPositions.reduce((sum, p) => sum + ((p.profit || 0) / (p.entryPrice * p.quantity)), 0) / winningPositions.length
      : 0;
      
    const avgLossPercent = losingPositions.length > 0
      ? Math.abs(losingPositions.reduce((sum, p) => sum + ((p.profit || 0) / (p.entryPrice * p.quantity)), 0) / losingPositions.length)
      : 0;
    
    // Calculate expectancy: (Win Rate × Average Win) - (Loss Rate × Average Loss)
    const expectancy = (winRate * avgWinPercent) - ((1 - winRate) * avgLossPercent);
    
    // Calculate max consecutive losses
    let currentConsecutiveLosses = 0;
    let maxConsecutiveLosses = 0;
    
    // Sort by timestamp to preserve order
    const sortedPositions = [...closedPositions].sort((a, b) => a.timestamp - b.timestamp);
    
    for (const position of sortedPositions) {
      if ((position.profit || 0) <= 0) {
        currentConsecutiveLosses++;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentConsecutiveLosses);
      } else {
        currentConsecutiveLosses = 0;
      }
    }
    
    // Update current consecutive losses tracker
    this.consecutiveLosses = currentConsecutiveLosses;
    this.maxConsecutiveLosses = Math.max(this.maxConsecutiveLosses, maxConsecutiveLosses);
    
    // Calculate maximum drawdown (simplified)
    const maxDrawdown = this.calculateMaxDrawdown(sortedPositions);
    
    // Calculate simplified Sharpe ratio (if enough trades)
    const sharpeRatio = this.calculateSharpeRatio(sortedPositions);
    
    // Return comprehensive stats
    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      avgWinPercent,
      avgLossPercent,
      expectancy,
      maxConsecutiveLosses,
      maxDrawdownPercent: maxDrawdown,
      sharpeRatio
    };
  }
  
  // Calculate maximum drawdown from position history
  private calculateMaxDrawdown(positions: AIPosition[]): number {
    if (positions.length < 2) return 0;
    
    // Reconstruct equity curve
    let peak = this.accountSize;
    let currentEquity = this.accountSize;
    let maxDrawdownPercent = 0;
    
    for (const position of positions) {
      const profit = position.profit || 0;
      currentEquity += profit;
      
      // Update peak if equity increases
      if (currentEquity > peak) {
        peak = currentEquity;
      }
      
      // Calculate drawdown from peak
      if (peak > 0) {
        const drawdown = (peak - currentEquity) / peak;
        maxDrawdownPercent = Math.max(maxDrawdownPercent, drawdown);
      }
    }
    
    // Update class drawdown state
    this.currentDrawdown = peak > 0 ? (peak - currentEquity) / peak : 0;
    this.maxDrawdownExperienced = maxDrawdownPercent;
    
    // Update current equity
    this.currentEquity = currentEquity;
    
    return maxDrawdownPercent;
  }
  
  // Calculate simplified Sharpe ratio
  private calculateSharpeRatio(positions: AIPosition[]): number {
    if (positions.length < 30) return 0; // Need sufficient data
    
    // Extract returns
    const returns = positions.map(p => {
      const positionValue = p.entryPrice * p.quantity;
      return positionValue > 0 ? (p.profit || 0) / positionValue : 0;
    });
    
    // Calculate average return
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    
    // Calculate standard deviation of returns
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate annualized Sharpe ratio (assuming each trade is ~5 days apart)
    const annualizationFactor = Math.sqrt(252 / 5); // 252 trading days per year
    
    // Risk-free rate (simplified to 0)
    const riskFreeRate = 0;
    
    // Sharpe ratio = (Avg Return - Risk Free Rate) / StdDev * Annualization
    return stdDev > 0 ? (avgReturn - riskFreeRate) / stdDev * annualizationFactor : 0;
  }

  // Monitor and update existing positions (dynamic stop loss)
  public updatePositionLevels(
    position: AIPosition,
    currentPrice: number,
    atr: number
  ): AIPosition {
    // Only update open positions
    if (position.status !== 'open') return position;
    
    const updatedPosition = { ...position };
    
    // Implement trailing stop if enabled
    if (this.stopLossSettings.trailingStop) {
      const direction = position.type;
      const entryPrice = position.entryPrice;
      const currentStopLoss = position.stopLoss || 0;
      
      if (direction === 'buy') {
        // For long positions, if price has moved up, adjust stop upward
        if (currentPrice > entryPrice) {
          const trailingDistance = atr * this.stopLossSettings.atrMultiplier;
          const newStopLevel = currentPrice - trailingDistance;
          
          // Only move stop up, never down
          if (currentStopLoss === 0 || newStopLevel > currentStopLoss) {
            updatedPosition.stopLoss = newStopLevel;
          }
        }
      } else {
        // For short positions, if price has moved down, adjust stop downward
        if (currentPrice < entryPrice) {
          const trailingDistance = atr * this.stopLossSettings.atrMultiplier;
          // Calculate new stop level - ensure it's not too far from current price
          const newStopLevel = Math.min(
            currentPrice + trailingDistance,
            entryPrice * 1.2 // Cap at 20% above entry price as safety measure
          );
          
          // Only move stop down, never up
          if (currentStopLoss === 0 || (newStopLevel < currentStopLoss && newStopLevel > currentPrice)) {
            updatedPosition.stopLoss = newStopLevel;
          }
        }
      }
    }
    
    return updatedPosition;
  }

  // Check if position should be closed based on stop loss/take profit
  public checkPositionExit(
    position: AIPosition,
    currentPrice: number
  ): { shouldExit: boolean; reason?: string } {
    if (position.status !== 'open') {
      return { shouldExit: false };
    }
    
    const direction = position.type;
    const stopLoss = position.stopLoss || 0;
    
    // Check for stop loss hit
    if (stopLoss > 0) {
      if (direction === 'buy' && currentPrice <= stopLoss) {
        return { 
          shouldExit: true, 
          reason: `Stop loss triggered: ${currentPrice.toFixed(2)} <= ${stopLoss.toFixed(2)}` 
        };
      }
      
      if (direction === 'sell' && currentPrice >= stopLoss) {
        return { 
          shouldExit: true, 
          reason: `Stop loss triggered: ${currentPrice.toFixed(2)} >= ${stopLoss.toFixed(2)}` 
        };
      }
    }
    
    // Check for take profit (if defined)
    const takeProfit = position.takeProfit || 0;
    if (takeProfit > 0) {
      if (direction === 'buy' && currentPrice >= takeProfit) {
        return { 
          shouldExit: true, 
          reason: `Take profit triggered: ${currentPrice.toFixed(2)} >= ${takeProfit.toFixed(2)}` 
        };
      }
      
      if (direction === 'sell' && currentPrice <= takeProfit) {
        return { 
          shouldExit: true, 
          reason: `Take profit triggered: ${currentPrice.toFixed(2)} <= ${takeProfit.toFixed(2)}` 
        };
      }
    }
    
    return { shouldExit: false };
  }
} 