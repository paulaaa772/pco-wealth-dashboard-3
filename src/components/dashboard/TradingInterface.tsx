'use client'

import { useState, useEffect, useRef } from 'react';
import { AITradingEngine, TradeSignal } from '@/lib/trading-engine/AITradingEngine';
import { TradingMode } from '@/lib/trading-engine/TradingMode';

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
  positions: Position[]; // Receive positions from parent
  onClosePosition: (positionId: string) => void; // Callback to parent to close
  onNewAIPosition: (position: Position) => void; // Callback when AI creates position
}

export default function TradingInterface({ 
    onSymbolChange, 
    currentSymbol = 'AAPL', 
    positions, // Use prop
    onClosePosition, // Use prop
    onNewAIPosition // Use prop
}: TradingInterfaceProps) {
  // Setup state for the trading interface
  const [mode, setMode] = useState<TradingMode>(TradingMode.DEMO);
  const [symbol, setSymbol] = useState<string>(currentSymbol);
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);
  const [lastSignal, setLastSignal] = useState<TradeSignal | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [performance, setPerformance] = useState({
    winRate: 0,
    profitLoss: 0,
    totalTrades: 0,
  });
  const aiEngine = useRef<AITradingEngine | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Recalculate performance whenever the positions prop changes
  useEffect(() => {
      console.log("[TRADING UI] Positions prop updated, recalculating performance.");
      updatePerformanceDisplay(positions);
  }, [positions]);

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

  // Re-analyze when AI is toggled ON, if not already analyzing
  useEffect(() => {
    if (aiEnabled && !isAnalyzing) {
      analyzeMarket();
    }
  }, [aiEnabled]);

  // Handle symbol change from input
  const handleSymbolChange = () => {
    if (!inputRef.current) return;
    
    const newSymbol = inputRef.current.value.trim().toUpperCase();
    if (newSymbol && newSymbol !== symbol && newSymbol.length <= 5) {
      console.log('[TRADING UI] Symbol changed to:', newSymbol);
      setSymbol(newSymbol);
      onSymbolChange(newSymbol); // Notify parent
      if (aiEngine.current) aiEngine.current.setSymbol(newSymbol); // Update engine symbol
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
      
      const signal = await aiEngine.current.analyzeMarket();
      
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
      console.log(`[TRADING UI] Attempting to execute ${signal.direction} signal for ${signal.symbol}`);
      
      // Ensure aiEngine exists
      if (!aiEngine.current) {
        console.error('[TRADING UI] AI Engine not initialized!');
        return;
      }

      const success = await aiEngine.current.executeTradeSignal(signal);
      
      if (success) {
        console.log(`[TRADING UI] ${signal.direction} signal execution successful (Simulated).`);
        const shares = aiEngine.current.calculatePositionSize(signal.price);
        
        if (shares <= 0) {
          console.warn('[TRADING UI] Calculated position size is zero or less. No position opened.');
          return;
        }

        const newPosition: Position = {
          symbol: signal.symbol,
          type: signal.direction,
          entryPrice: signal.price,
          quantity: shares,
          timestamp: Date.now(),
          id: `pos-${Date.now()}`,
          status: 'open' // Mark position as open
        };
        
        // Instead of setPositions, call the parent's handler
        onNewAIPosition(newPosition); 
        console.log('[TRADING UI] Notified parent of new AI position:', newPosition);
      }
    } catch (error) {
      console.error('[TRADING UI] Error executing trade signal:', error);
      setErrorMessage('Error executing trade signal.');
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

  // Renamed to avoid confusion, recalculates display based on props
  const updatePerformanceDisplay = (currentPositions: Position[]) => {
      let closedTrades = currentPositions.filter(p => p.status === 'closed' && p.profit !== undefined);
      let totalPnl = closedTrades.reduce((sum, trade) => sum + (trade.profit ?? 0), 0);
      let wins = closedTrades.filter(p => (p.profit ?? 0) > 0).length;
      let totalClosed = closedTrades.length;
      // Count open trades towards total count if needed, or adjust definition
      let totalOpenedOrClosed = currentPositions.length; 

      setPerformance({
          winRate: totalClosed > 0 ? wins / totalClosed : 0,
          profitLoss: Math.round(totalPnl * 100) / 100,
          totalTrades: totalOpenedOrClosed // Display total positions attempted/managed
      });
      console.log(`[TRADING UI] Performance updated: Trades=${totalOpenedOrClosed}, Wins=${wins}, P/L=${totalPnl.toFixed(2)}`);
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
    <div className="bg-gray-900 rounded-lg p-4">
      <h2 className="text-2xl font-semibold text-white mb-4">Trading Interface</h2>
      
      <div className="flex flex-wrap md:flex-nowrap gap-4 mb-4">
        <div className="bg-gray-800 rounded-lg p-3 w-full md:w-auto md:min-w-[250px]">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Symbol Controls</h3>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              ref={inputRef}
              defaultValue={symbol}
              className="flex-1 bg-gray-700 text-white p-2 rounded-lg text-sm"
              placeholder="Symbol"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSymbolChange();
                }
              }}
            />
            <button 
              onClick={handleSymbolChange}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
            >
              Search
            </button>
          </div>
          <div className="flex justify-between text-xs">
            <button 
              onClick={toggleMode} 
              className={`px-2 py-1 rounded-md ${
                mode === TradingMode.DEMO ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {mode === TradingMode.DEMO ? 'Demo' : 'Live'} Mode
            </button>
            <button 
              onClick={toggleAI} 
              className={`px-2 py-1 rounded-md ${
                aiEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
              } text-white`}
            >
              AI: {aiEnabled ? 'On' : 'Off'}
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3 flex-grow">
          <h3 className="text-sm font-medium text-gray-400 mb-2">AI Signal</h3>
          {isAnalyzing ? (
            <div className="flex items-center justify-center h-16">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </div>
          ) : lastSignal ? (
            <div className={`p-2 rounded-md text-sm ${
              lastSignal.direction === 'buy' ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
            }`}>
              <div className="flex justify-between">
                <span className="text-gray-400">Symbol:</span>
                <span className="font-semibold text-white">{lastSignal.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Position:</span>
                <span className={`font-semibold ${
                  lastSignal.direction === 'buy' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {lastSignal.direction.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Entry:</span>
                <span className="font-semibold text-white">${lastSignal.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Strategy:</span>
                <span className="font-semibold text-blue-400 text-xs">{lastSignal.strategy}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-16 text-gray-500 text-sm">
              No signals available
            </div>
          )}
          {errorMessage && (
            <div className="mt-2 p-1 text-xs bg-red-900/30 border border-red-700 rounded-md text-red-400">
              {errorMessage}
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3 w-full md:w-auto md:min-w-[200px]">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Performance</h3>
          <div className="p-2 bg-gray-700 rounded-md text-sm mb-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Win Rate:</span>
              <span className="font-semibold text-white">{(performance.winRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">P/L:</span>
              <span className={`font-semibold ${
                performance.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${performance.profitLoss.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Trades:</span>
              <span className="font-semibold text-white">{performance.totalTrades}</span>
            </div>
          </div>
          <button 
            onClick={() => analyzeMarket()}
            disabled={isAnalyzing}
            className={`w-full text-sm px-3 py-1 rounded-md ${
              isAnalyzing ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
          </button>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Active Positions</h3>
        {positions.filter(p => p.status === 'open').length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {positions.filter(p => p.status === 'open').map(position => (
              <div 
                key={position.id}
                className={`p-2 rounded-md relative text-sm ${
                  position.type === 'buy' ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
                }`}
              >
                <button 
                  onClick={() => onClosePosition(position.id)}
                  className="absolute top-1 right-1 p-0.5 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded leading-none"
                  title="Close Position (Demo)"
                >
                  X
                </button>
                <div className="flex justify-between">
                  <span className="text-gray-400">Symbol:</span>
                  <span className="font-semibold text-white">{position.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className={`font-semibold ${
                    position.type === 'buy' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {position.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Entry:</span>
                  <span className="font-semibold text-white">${position.entryPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Size:</span>
                  <span className="font-semibold text-white">{position.quantity} sh</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-16 text-gray-500 text-sm">
            No active positions
          </div>
        )}
      </div>
    </div>
  );
} 