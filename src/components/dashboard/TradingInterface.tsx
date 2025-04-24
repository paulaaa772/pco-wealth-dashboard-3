'use client'

import { useState, useEffect, useRef } from 'react';
import { AITradingEngine, TradeSignal } from '../../lib/trading-engine/AITradingEngine';
import { TradingMode } from '../../lib/trading-engine/TradingMode';

// Define the Position interface locally since the imported one has issues
interface Position {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  quantity: number;
  timestamp: number;
  exitPrice?: number;
  closeDate?: Date;
  status?: 'open' | 'closed';
  profit?: number;
  stopLoss?: number;
}

export interface TradingInterfaceProps {
  onSymbolChange: (symbol: string) => void;
  currentSymbol?: string; // Add this prop for two-way binding
}

export default function TradingInterface({ onSymbolChange, currentSymbol = 'AAPL' }: TradingInterfaceProps) {
  // Setup state for the trading interface
  const [mode, setMode] = useState<TradingMode>(TradingMode.DEMO);
  const [symbol, setSymbol] = useState<string>(currentSymbol);
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);
  const [lastSignal, setLastSignal] = useState<TradeSignal | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [performance, setPerformance] = useState({
    winRate: 0,
    profitLoss: 0,
    totalTrades: 0,
  });
  const aiEngine = useRef<AITradingEngine | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // When currentSymbol prop changes, update our local state
  useEffect(() => {
    if (currentSymbol && currentSymbol !== symbol) {
      console.log('[TRADING UI] External symbol update:', currentSymbol);
      setSymbol(currentSymbol);
    }
  }, [currentSymbol, symbol]);

  // On component mount
  useEffect(() => {
    console.log('[TRADING UI] Component mounted with symbol:', symbol);
    aiEngine.current = new AITradingEngine(symbol, mode);
    
    // Initial market analysis
    analyzeMarket();
    
    // If AI is enabled, we'll analyze the market every 30 seconds
    let interval: NodeJS.Timeout | null = null;
    if (aiEnabled) {
      interval = setInterval(() => {
        if (!isAnalyzing) {
          analyzeMarket();
        }
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Handle symbol change from input
  const handleSymbolChange = () => {
    if (!inputRef.current) return;
    
    const newSymbol = inputRef.current.value.trim().toUpperCase();
    if (newSymbol && newSymbol !== symbol && newSymbol.length <= 5) {
      console.log('[TRADING UI] Symbol changed to:', newSymbol);
      setSymbol(newSymbol);
      onSymbolChange(newSymbol); // Notify parent
      analyzeMarket(newSymbol);
    }
  };

  // Analyze market for current symbol
  const analyzeMarket = async (symbolToAnalyze = symbol) => {
    try {
      setIsAnalyzing(true);
      setErrorMessage(null);
      
      console.log('[TRADING UI] Analyzing market for:', symbolToAnalyze);
      
      if (!aiEngine.current) {
        console.log('[TRADING UI] Initializing AI engine');
        aiEngine.current = new AITradingEngine(symbolToAnalyze, mode);
      }
      
      const signal = await aiEngine.current.analyzeMarket(symbolToAnalyze);
      
      if (signal) {
        console.log('[TRADING UI] Signal received:', signal);
        setLastSignal(signal);
        
        // Auto-execute signals in demo mode
        if (mode === TradingMode.DEMO && aiEnabled) {
          executeTradeSignal(signal);
        }
      } else {
        console.log('[TRADING UI] No trading signals available');
      }
    } catch (error) {
      console.error('[TRADING UI] Error analyzing market:', error);
      setErrorMessage('Failed to analyze market data');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Execute a trade signal
  const executeTradeSignal = async (signal: TradeSignal) => {
    try {
      console.log(`Executing ${signal.direction} signal for ${signal.symbol}`);
      
      const success = await aiEngine.current!.executeTradeSignal(signal);
      
      if (success) {
        // For demo purposes, simulate the position
        const shares = aiEngine.current!.calculatePositionSize(signal.price);
        
        const newPosition: Position = {
          symbol: signal.symbol,
          type: signal.direction,
          entryPrice: signal.price,
          quantity: shares,
          timestamp: Date.now(),
          id: `pos-${Date.now()}`
        };
        
        setPositions(prevPositions => [...prevPositions, newPosition]);
        
        // Update performance tracking
        updatePerformance();
      }
    } catch (error) {
      console.error('Error executing trade signal:', error);
    }
  };

  // Calculate position size based on risk
  const calculatePositionSize = (price: number): number => {
    // We'll use a fixed account balance for demo purposes
    const accountBalance = 10000;
    const riskPerTrade = 0.02; // 2% risk per trade
    
    // Simple position sizing based on price
    return Math.floor(accountBalance * riskPerTrade / price);
  };

  // Close a position (simulated in demo mode)
  const closePosition = (position: Position) => {
    console.log('[TRADING UI] Closing position:', position);
    
    // Calculate a random exit price (±2%)
    const exitPrice = position.entryPrice * (0.98 + Math.random() * 0.04);
    
    // Update the position
    const updatedPosition: Position = {
      ...position,
      exitPrice,
      closeDate: new Date(),
      status: 'closed',
      profit: (exitPrice - position.entryPrice) * position.quantity * (position.type === 'buy' ? 1 : -1),
    };
    
    // Update our positions list
    setPositions(prevPositions => 
      prevPositions.map(p => p.id === position.id ? updatedPosition : p)
    );
    
    // Update performance metrics
    updatePerformance(updatedPosition);
  };

  // Update performance metrics based on closed positions
  const updatePerformance = (closedPosition?: Position) => {
    if (closedPosition && !closedPosition.profit) return;
    
    setPerformance(prev => {
      if (!closedPosition) return prev;
      
      const totalTrades = prev.totalTrades + 1;
      const isWin = closedPosition.profit! > 0;
      const wins = prev.winRate * prev.totalTrades + (isWin ? 1 : 0);
      const newWinRate = totalTrades > 0 ? wins / totalTrades : 0;
      const newProfitLoss = prev.profitLoss + closedPosition.profit!;
      
      return {
        winRate: Math.round(newWinRate * 100) / 100,
        profitLoss: Math.round(newProfitLoss * 100) / 100,
        totalTrades,
      };
    });
  };

  // Toggle between demo and live modes
  const toggleMode = () => {
    const newMode = mode === TradingMode.DEMO ? TradingMode.LIVE : TradingMode.DEMO;
    console.log('[TRADING UI] Mode changed:', newMode);
    setMode(newMode);
    
    if (aiEngine.current) {
      aiEngine.current.setMode(newMode);
    }
  };

  // Toggle AI trading on/off
  const toggleAI = () => {
    console.log('[TRADING UI] AI trading toggled:', !aiEnabled);
    setAiEnabled(!aiEnabled);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-white mb-4">Trading Interface</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2">Symbol</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              ref={inputRef}
              defaultValue={symbol}
              className="flex-1 bg-gray-700 text-white p-2 rounded-lg"
              placeholder="Enter stock symbol"
            />
            <button 
              onClick={handleSymbolChange}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Search
            </button>
          </div>
          <div className="mt-4 flex justify-between">
            <button 
              onClick={toggleMode} 
              className={`px-3 py-1 rounded-lg ${
                mode === TradingMode.DEMO ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {mode === TradingMode.DEMO ? 'Demo Mode' : 'Live Mode'}
            </button>
            <button 
              onClick={toggleAI} 
              className={`px-3 py-1 rounded-lg ${
                aiEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
              } text-white`}
            >
              AI: {aiEnabled ? 'On' : 'Off'}
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2">AI Signal</h3>
          {isAnalyzing ? (
            <div className="flex items-center justify-center h-16">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          ) : lastSignal ? (
            <div className={`p-3 rounded-lg ${
              lastSignal.direction === 'buy' ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
            }`}>
              <div className="flex justify-between">
                <span className="text-gray-300">Symbol:</span>
                <span className="font-semibold text-white">{lastSignal.symbol}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-300">Position:</span>
                <span className={`font-semibold ${
                  lastSignal.direction === 'buy' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {lastSignal.direction.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-300">Entry:</span>
                <span className="font-semibold text-white">${lastSignal.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-300">Confidence:</span>
                <span className="font-semibold text-blue-400">{(lastSignal.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-16 text-gray-500">
              No signals available
            </div>
          )}
          {mode === TradingMode.DEMO && lastSignal && (
            <button 
              onClick={() => executeTradeSignal(lastSignal)}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Execute Signal
            </button>
          )}
          {errorMessage && (
            <div className="mt-4 p-2 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
              {errorMessage}
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2">Performance</h3>
          <div className="p-3 bg-gray-700 rounded-lg">
            <div className="flex justify-between">
              <span className="text-gray-300">Win Rate:</span>
              <span className="font-semibold text-white">{(performance.winRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-300">P/L:</span>
              <span className={`font-semibold ${
                performance.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${performance.profitLoss.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-300">Trades:</span>
              <span className="font-semibold text-white">{performance.totalTrades}</span>
            </div>
          </div>
          <button 
            onClick={() => analyzeMarket()}
            disabled={isAnalyzing}
            className={`mt-4 w-full ${
              isAnalyzing 
                ? 'bg-blue-700/50 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white px-4 py-2 rounded-lg`}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Market'}
          </button>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-4">Active Positions</h3>
        {positions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {positions.filter(p => !p.status || p.status === 'open').map(position => (
              <div 
                key={position.id}
                className={`p-3 rounded-lg ${
                  position.type === 'buy' ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
                }`}
              >
                <div className="flex justify-between">
                  <span className="text-gray-300">Symbol:</span>
                  <span className="font-semibold text-white">{position.symbol}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-300">Type:</span>
                  <span className={`font-semibold ${
                    position.type === 'buy' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {position.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-300">Entry:</span>
                  <span className="font-semibold text-white">${position.entryPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-300">Size:</span>
                  <span className="font-semibold text-white">{position.quantity} shares</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-16 text-gray-500">
            No active positions
          </div>
        )}
      </div>
    </div>
  );
} 