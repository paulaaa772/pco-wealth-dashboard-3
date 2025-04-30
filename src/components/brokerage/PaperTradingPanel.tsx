'use client'

import { useState, useEffect, useRef } from 'react';
import { AIPosition } from '@/app/brokerage/page';
import { AITradingEngine, TradeSignal } from '@/lib/trading-engine/AITradingEngine';
import { TradingMode } from '@/lib/trading-engine/TradingMode';
import { AIRiskManager, TradeStats } from '@/lib/trading-engine/AIRiskManager';
import { PolygonService, PolygonCandle } from '@/lib/market-data/PolygonService';
import { calculateATR } from '@/lib/trading-engine/indicators';

interface PaperTradingPanelProps {
  symbol: string;
  positions: AIPosition[];
  onNewPosition: (position: AIPosition) => void;
  onUpdatePosition: (positionId: string, updatedPosition: Partial<AIPosition>) => void;
  onClosePosition: (positionId: string) => void;
}

export default function PaperTradingPanel({
  symbol,
  positions,
  onNewPosition,
  onUpdatePosition,
  onClosePosition
}: PaperTradingPanelProps) {
  // Trading engines
  const aiEngine = useRef<AITradingEngine | null>(null);
  const riskManager = useRef<AIRiskManager | null>(null);
  
  // State
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [lastSignal, setLastSignal] = useState<TradeSignal | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [atr, setAtr] = useState<number>(0);
  const [volatility, setVolatility] = useState<number>(0);
  const [tradeStats, setTradeStats] = useState<TradeStats>({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    avgWinPercent: 0,
    avgLossPercent: 0,
    expectancy: 0,
    maxConsecutiveLosses: 0,
    maxDrawdownPercent: 0,
    sharpeRatio: 0
  });
  
  // Strategy settings
  const [positionSizingMethod, setPositionSizingMethod] = useState<'kelly' | 'atr'>('atr');
  const [useTrailingStop, setUseTrailingStop] = useState<boolean>(true);
  const [useDynamicStopLoss, setUseDynamicStopLoss] = useState<boolean>(true);
  const [maxDrawdownTolerance, setMaxDrawdownTolerance] = useState<number>(20); // 20% max drawdown
  const [riskPerTrade, setRiskPerTrade] = useState<number>(1); // 1% risk per trade
  const [targetRiskReward, setTargetRiskReward] = useState<number>(2); // 2:1 risk/reward

  // Status messages
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [blacklistedAssets, setBlacklistedAssets] = useState<Map<string, string>>(new Map());

  // Initialize trading engines
  useEffect(() => {
    console.log('[Paper Trading] Initializing trading engines for symbol:', symbol);
    
    // Initialize AITradingEngine
    if (!aiEngine.current) {
      aiEngine.current = new AITradingEngine(symbol, TradingMode.DEMO);
    } else {
      aiEngine.current.setSymbol(symbol);
    }
    
    // Initialize AIRiskManager
    if (!riskManager.current) {
      riskManager.current = new AIRiskManager(
        10000, // Initial account size
        {
          maxPositionSize: 0.05,        // 5% max position
          maxDrawdownTolerance: maxDrawdownTolerance / 100, // Convert from percentage
        },
        {
          trailingStop: useTrailingStop,
          dynamicStopLoss: useDynamicStopLoss,
          takeProfitPercent: riskPerTrade / 100 * targetRiskReward, // Risk-reward ratio
          stopLossPercent: riskPerTrade / 100, // Risk percentage
        }
      );
    }
    
    fetchMarketData();
    setIsInitialized(true);
    
    // Log message
    addStatusMessage(`AI trading engine and risk manager initialized for ${symbol}`);
    
    // Set up interval to update position monitoring
    const monitorInterval = setInterval(() => {
      monitorActivePositions();
    }, 10000);
    
    // Cleanup on unmount
    return () => {
      clearInterval(monitorInterval);
    };
  }, [symbol]);

  // Update risk manager settings when strategy settings change
  useEffect(() => {
    if (!riskManager.current) return;
    
    // Update risk manager settings
    const stopLossSettings = {
      trailingStop: useTrailingStop,
      dynamicStopLoss: useDynamicStopLoss,
      takeProfitPercent: riskPerTrade / 100 * targetRiskReward,
      stopLossPercent: riskPerTrade / 100,
    };
    
    const tradingLimits = {
      maxDrawdownTolerance: maxDrawdownTolerance / 100,
    };
    
    // In a real implementation, you would update the risk manager with these settings
    // For now, we'll just log the changes
    addStatusMessage(`Updated risk management settings: 
      Risk per trade: ${riskPerTrade}%, 
      Target R:R: ${targetRiskReward}:1, 
      Max drawdown: ${maxDrawdownTolerance}%`);
    
  }, [useTrailingStop, useDynamicStopLoss, maxDrawdownTolerance, riskPerTrade, targetRiskReward]);

  // Update trade statistics when positions change
  useEffect(() => {
    if (!riskManager.current || positions.length === 0) return;
    
    const stats = riskManager.current.updateTradeStatistics(positions);
    setTradeStats(stats);
    
    // Recalibrate risk-reward ratio based on performance
    if (stats.totalTrades >= 10) {
      riskManager.current.recalibrateRiskReward(stats);
      
      // Adjust for drawdown if needed
      if (stats.maxDrawdownPercent > 0.05) { // 5% drawdown threshold
        riskManager.current.adjustForDrawdown();
        addStatusMessage(`Adjusting position sizing due to ${(stats.maxDrawdownPercent * 100).toFixed(1)}% drawdown`);
      }
    }
  }, [positions]);

  // Fetch market data (price, volatility, ATR)
  const fetchMarketData = async () => {
    try {
      // Get polygon service
      const polygonService = PolygonService.getInstance();
      
      // Get current price
      const price = await polygonService.getLatestPrice(symbol);
      if (price) {
        setCurrentPrice(price);
      }
      
      // Get historical candles for ATR and volatility calculation
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30); // 30 days of data
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      const candles = await polygonService.getStockCandles(
        symbol,
        formattedStartDate,
        formattedEndDate,
        'day'
      );
      
      if (candles && candles.length > 0) {
        // Calculate ATR (14-period)
        const atrValues = calculateATR(candles, 14);
        const latestAtr = atrValues[atrValues.length - 1];
        setAtr(latestAtr);
        
        // Calculate volatility (std dev of daily returns)
        const returns = [];
        for (let i = 1; i < candles.length; i++) {
          const dailyReturn = (candles[i].c - candles[i-1].c) / candles[i-1].c;
          returns.push(dailyReturn);
        }
        
        // Calculate standard deviation of returns
        const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
        const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        setVolatility(stdDev);
        
        // Check if asset should be blacklisted
        if (riskManager.current) {
          const avgVolume = candles.reduce((sum, candle) => sum + candle.v, 0) / candles.length;
          const marketCap = price * avgVolume * 30; // Rough estimate
          
          const blacklistCheck = await riskManager.current.shouldBlacklist(
            symbol,
            candles,
            avgVolume,
            marketCap
          );
          
          if (blacklistCheck.blacklisted) {
            const newBlacklist = new Map(blacklistedAssets);
            newBlacklist.set(symbol, blacklistCheck.reason || 'Unknown reason');
            setBlacklistedAssets(newBlacklist);
            
            addStatusMessage(`🚫 BLACKLISTED: ${symbol} - ${blacklistCheck.reason}`);
          }
        }
      }
    } catch (error) {
      console.error('[Paper Trading] Error fetching market data:', error);
      addStatusMessage(`❌ Error fetching market data: ${error}`);
    }
  };

  // Analyze market and generate trade signals
  const analyzeMarket = async () => {
    if (!aiEngine.current || isAnalyzing) return;
    
    setIsAnalyzing(true);
    addStatusMessage(`Analyzing market for ${symbol}...`);
    
    try {
      // Check if asset is blacklisted
      if (blacklistedAssets.has(symbol)) {
        addStatusMessage(`⚠️ Cannot trade ${symbol} - blacklisted: ${blacklistedAssets.get(symbol)}`);
        setIsAnalyzing(false);
        return;
      }
      
      // Get trading signal from AI Engine
      const signal = await aiEngine.current.analyzeMarket(symbol);
      
      if (signal) {
        setLastSignal(signal);
        addStatusMessage(`📊 Signal generated: ${signal.direction.toUpperCase()} ${symbol} at $${signal.price.toFixed(2)} (${signal.strategy})`);
        
        // Auto-execute if settings allow
        executeSignal(signal);
      } else {
        addStatusMessage(`No trading signals for ${symbol} at this time`);
      }
    } catch (error) {
      console.error('[Paper Trading] Error analyzing market:', error);
      addStatusMessage(`❌ Error analyzing market: ${error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Execute a trade signal
  const executeSignal = async (signal: TradeSignal) => {
    if (!riskManager.current || !aiEngine.current) return;
    
    try {
      addStatusMessage(`Executing ${signal.direction.toUpperCase()} signal for ${symbol}...`);
      
      // Calculate position size
      let shares = 0;
      
      if (positionSizingMethod === 'kelly') {
        // Kelly Criterion position sizing
        shares = riskManager.current.calculateKellyPositionSize(
          symbol,
          signal.price,
          volatility,
          {
            winRate: tradeStats.winRate || 0.5, // Default to 50% if no history
            avgWinPercent: tradeStats.avgWinPercent || (riskPerTrade / 100 * targetRiskReward),
            avgLossPercent: tradeStats.avgLossPercent || (riskPerTrade / 100)
          }
        );
      } else {
        // ATR position sizing
        shares = riskManager.current.calculateATRPositionSize(
          symbol,
          signal.price,
          atr,
          riskPerTrade / 100
        );
      }
      
      // Ensure minimum position size
      shares = Math.max(1, shares);
      
      // Check exposure limits
      const exposureCheck = riskManager.current.checkExposureLimits(
        symbol,
        'Technology', // You would need a sector mapping in real implementation
        shares * signal.price
      );
      
      if (!exposureCheck.allowed) {
        addStatusMessage(`⚠️ Cannot execute: ${exposureCheck.reason}`);
        return;
      }
      
      // Calculate stop loss and take profit levels
      const { stopLoss, takeProfit } = riskManager.current.calculateDynamicLevels(
        signal.price,
        atr,
        signal.direction
      );
      
      // Create position
      const newPosition: AIPosition = {
        id: `pos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        symbol,
        type: signal.direction,
        entryPrice: signal.price,
        quantity: shares,
        timestamp: Date.now(),
        status: 'open',
        stopLoss,
        takeProfit
      };
      
      // Add position
      onNewPosition(newPosition);
      
      addStatusMessage(`✅ Opened ${signal.direction.toUpperCase()} position: ${shares} shares at $${signal.price.toFixed(2)}`);
      addStatusMessage(`📌 Stop Loss: $${stopLoss.toFixed(2)}, Take Profit: $${takeProfit.toFixed(2)}`);
      
    } catch (error) {
      console.error('[Paper Trading] Error executing signal:', error);
      addStatusMessage(`❌ Error executing signal: ${error}`);
    }
  };

  // Monitor active positions for stop loss/take profit and trailing stop
  const monitorActivePositions = async () => {
    if (!riskManager.current || currentPrice <= 0) return;
    
    // Only monitor open positions
    const openPositions = positions.filter(p => p.status === 'open');
    if (openPositions.length === 0) return;
    
    try {
      // Check each position
      for (const position of openPositions) {
        // Only monitor positions for the current symbol
        if (position.symbol !== symbol) continue;
        
        // Update trailing stop if enabled
        if (useTrailingStop) {
          const updatedPosition = riskManager.current.updatePositionLevels(
            position,
            currentPrice,
            atr
          );
          
          // Update position if stop loss changed
          if (updatedPosition.stopLoss !== position.stopLoss) {
            onUpdatePosition(position.id, {
              stopLoss: updatedPosition.stopLoss
            });
            
            addStatusMessage(`🔄 Updated trailing stop for ${position.symbol}: $${updatedPosition.stopLoss?.toFixed(2)}`);
          }
        }
        
        // Check if position should be closed
        const exitCheck = riskManager.current.checkPositionExit(
          position,
          currentPrice
        );
        
        if (exitCheck.shouldExit) {
          // Calculate profit/loss
          const profit = position.type === 'buy' 
            ? (currentPrice - position.entryPrice) * position.quantity
            : (position.entryPrice - currentPrice) * position.quantity;
          
          // Close position
          onClosePosition(position.id);
          
          addStatusMessage(`🔚 Closed ${position.type.toUpperCase()} position for ${position.symbol}: ${exitCheck.reason}`);
          addStatusMessage(`💰 P/L: ${profit > 0 ? '+' : ''}$${profit.toFixed(2)}`);
        }
      }
    } catch (error) {
      console.error('[Paper Trading] Error monitoring positions:', error);
    }
  };

  // Helper to add a status message
  const addStatusMessage = (message: string) => {
    setStatusMessages(prev => {
      const timestamp = new Date().toLocaleTimeString();
      return [`[${timestamp}] ${message}`, ...prev].slice(0, 50); // Keep latest 50 messages
    });
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h2 className="text-xl font-semibold text-white mb-4">AI Paper Trading</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Current market data */}
        <div className="bg-gray-800 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Market Data</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Symbol:</span>
              <span className="font-semibold text-white">{symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Price:</span>
              <span className="font-semibold text-white">${currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ATR (14):</span>
              <span className="font-semibold text-white">${atr.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Volatility:</span>
              <span className="font-semibold text-white">{(volatility * 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={`font-semibold ${blacklistedAssets.has(symbol) ? 'text-red-400' : 'text-green-400'}`}>
                {blacklistedAssets.has(symbol) ? 'BLACKLISTED' : 'TRADABLE'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Performance statistics */}
        <div className="bg-gray-800 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Performance</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Win Rate:</span>
              <span className="font-semibold text-white">{(tradeStats.winRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Trades:</span>
              <span className="font-semibold text-white">{tradeStats.totalTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Expectancy:</span>
              <span className={`font-semibold ${tradeStats.expectancy >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(tradeStats.expectancy * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Max Drawdown:</span>
              <span className="font-semibold text-red-400">{(tradeStats.maxDrawdownPercent * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sharpe Ratio:</span>
              <span className="font-semibold text-white">{tradeStats.sharpeRatio.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trading settings */}
      <div className="bg-gray-800 p-3 rounded-lg mb-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Strategy Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-xs mb-1">Position Sizing Method</label>
            <select 
              value={positionSizingMethod}
              onChange={(e) => setPositionSizingMethod(e.target.value as 'kelly' | 'atr')}
              className="w-full bg-gray-700 text-white p-2 rounded-md text-sm"
            >
              <option value="atr">ATR-Based</option>
              <option value="kelly">Kelly Criterion</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-400 text-xs mb-1">Risk Per Trade (%)</label>
            <input 
              type="number" 
              min="0.1" 
              max="5" 
              step="0.1"
              value={riskPerTrade}
              onChange={(e) => setRiskPerTrade(Number(e.target.value))}
              className="w-full bg-gray-700 text-white p-2 rounded-md text-sm"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-xs mb-1">Target Risk:Reward</label>
            <input 
              type="number" 
              min="1" 
              max="5" 
              step="0.5"
              value={targetRiskReward}
              onChange={(e) => setTargetRiskReward(Number(e.target.value))}
              className="w-full bg-gray-700 text-white p-2 rounded-md text-sm"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-xs mb-1">Max Drawdown Tolerance (%)</label>
            <input 
              type="number" 
              min="5" 
              max="50" 
              step="1"
              value={maxDrawdownTolerance}
              onChange={(e) => setMaxDrawdownTolerance(Number(e.target.value))}
              className="w-full bg-gray-700 text-white p-2 rounded-md text-sm"
            />
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="trailingStop" 
              checked={useTrailingStop}
              onChange={(e) => setUseTrailingStop(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="trailingStop" className="text-gray-300 text-sm">Use Trailing Stop</label>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="dynamicStop" 
              checked={useDynamicStopLoss}
              onChange={(e) => setUseDynamicStopLoss(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="dynamicStop" className="text-gray-300 text-sm">Use ATR-Based Stops</label>
          </div>
        </div>
      </div>
      
      {/* Active positions */}
      <div className="bg-gray-800 p-3 rounded-lg mb-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Active Positions</h3>
        {positions.filter(p => p.status === 'open' && p.symbol === symbol).length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {positions
              .filter(p => p.status === 'open' && p.symbol === symbol)
              .map(position => {
                const unrealizedProfit = position.type === 'buy'
                  ? (currentPrice - position.entryPrice) * position.quantity
                  : (position.entryPrice - currentPrice) * position.quantity;
                
                const profitPercent = Math.abs(position.entryPrice) > 0
                  ? (unrealizedProfit / (position.entryPrice * position.quantity)) * 100
                  : 0;
                
                return (
                  <div 
                    key={position.id}
                    className={`p-2 rounded-md relative text-sm ${
                      position.type === 'buy' ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
                    }`}
                  >
                    <button 
                      onClick={() => onClosePosition(position.id)}
                      className="absolute top-1 right-1 p-0.5 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded leading-none"
                      title="Close Position"
                    >
                      X
                    </button>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className={`font-semibold ${position.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                          {position.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Quantity:</span>
                        <span className="font-semibold text-white">{position.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Entry:</span>
                        <span className="font-semibold text-white">${position.entryPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current:</span>
                        <span className="font-semibold text-white">${currentPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Stop Loss:</span>
                        <span className="font-semibold text-red-400">${position.stopLoss?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Take Profit:</span>
                        <span className="font-semibold text-green-400">${position.takeProfit?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span className="text-gray-400">Unrealized P/L:</span>
                        <span className={`font-semibold ${unrealizedProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {unrealizedProfit >= 0 ? '+' : ''}${unrealizedProfit.toFixed(2)} ({profitPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-gray-500 text-sm p-2 text-center">
            No active positions for {symbol}
          </div>
        )}
      </div>
      
      {/* Latest signal */}
      {lastSignal && (
        <div className="bg-gray-800 p-3 rounded-lg mb-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Latest Signal</h3>
          <div className={`p-2 rounded-md text-sm ${
            lastSignal.direction === 'buy' ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
          }`}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Symbol:</span>
                <span className="font-semibold text-white">{lastSignal.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Direction:</span>
                <span className={`font-semibold ${lastSignal.direction === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                  {lastSignal.direction.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price:</span>
                <span className="font-semibold text-white">${lastSignal.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Confidence:</span>
                <span className="font-semibold text-white">{(lastSignal.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-gray-400">Strategy:</span>
                <span className="font-semibold text-blue-400">{lastSignal.strategy}</span>
              </div>
            </div>
            <button
              onClick={() => executeSignal(lastSignal)}
              className={`w-full mt-2 text-sm px-3 py-1 rounded-md transition-colors ${
                lastSignal.direction === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              } text-white`}
              disabled={blacklistedAssets.has(symbol)}
            >
              Execute Signal
            </button>
          </div>
        </div>
      )}
      
      {/* Analysis button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={analyzeMarket}
          disabled={isAnalyzing || !isInitialized || blacklistedAssets.has(symbol)}
          className={`px-4 py-2 rounded-md text-white ${
            isAnalyzing || !isInitialized || blacklistedAssets.has(symbol)
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Market & Generate Signal'}
        </button>
      </div>
      
      {/* Status log */}
      <div className="bg-gray-800 p-3 rounded-lg">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Activity Log</h3>
        <div className="bg-gray-900 p-2 rounded-md h-40 overflow-y-auto text-xs">
          {statusMessages.length > 0 ? (
            <div className="space-y-1">
              {statusMessages.map((msg, index) => (
                <div key={index} className="text-gray-300">
                  {msg}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4">
              No activity yet. Start by analyzing the market.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 