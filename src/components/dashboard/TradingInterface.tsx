'use client'

import { useState, useEffect } from 'react';
import { AITradingEngine } from '../../lib/trading-engine/AITradingEngine';
import { TradingMode, TradingSignal, Position } from '../../lib/trading-engine/types';
import { PolygonService } from '../../lib/market-data/PolygonService';

interface TradingInterfaceProps {
  onSymbolChange?: (symbol: string) => void;
}

export default function TradingInterface({ onSymbolChange }: TradingInterfaceProps) {
  const [mode, setMode] = useState<TradingMode>('demo');
  const [symbol, setSymbol] = useState<string>('AAPL');
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);
  const [lastSignal, setLastSignal] = useState<TradingSignal | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [performance, setPerformance] = useState({
    winRate: 0,
    profitLoss: 0,
  });

  useEffect(() => {
    const initInterface = async () => {
      try {
        console.log('TradingInterface mounted');
        if (!symbol) {
          console.error('No symbol provided');
          return;
        }
        await analyzeMarket();
      } catch (error) {
        console.error('Error initializing interface:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize interface');
      }
    };

    initInterface();
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (aiEnabled && symbol) {
      console.log('AI trading enabled for symbol:', symbol);
      intervalId = setInterval(async () => {
        try {
          await analyzeMarket();
        } catch (error) {
          console.error('Error in AI trading interval:', error);
          setError(error instanceof Error ? error.message : 'AI trading error');
          setAiEnabled(false); // Disable AI trading on error
        }
      }, 60000); // Analyze every minute when AI is enabled
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [aiEnabled, symbol]);

  const handleSymbolChange = (newSymbol: string) => {
    if (!newSymbol) {
      setError('Symbol cannot be empty');
      return;
    }

    console.log('Symbol input changed:', newSymbol);
    const upperSymbol = newSymbol.toUpperCase();
    setSymbol(upperSymbol);
    setError(null);
    onSymbolChange?.(upperSymbol);
  };

  const analyzeMarket = async () => {
    if (!symbol) {
      setError('Please enter a symbol');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      console.log('Analyzing market for symbol:', symbol);
      const aiEngine = new AITradingEngine(mode);
      
      if (!aiEngine) {
        throw new Error('Failed to initialize AI engine');
      }

      const signal = await aiEngine.analyzeMarket(symbol);
      
      if (signal) {
        console.log('Received trading signal:', signal);
        setLastSignal(signal);
        if (aiEnabled) {
          await executeTradeSignal(signal);
        }
      } else {
        console.log('No trading signals available');
        setError('No trading signals available');
      }
    } catch (err) {
      console.error('Error analyzing market:', err);
      setError(err instanceof Error ? err.message : 'Error analyzing market');
      setLastSignal(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const executeTradeSignal = async (signal: TradingSignal) => {
    if (!signal || !signal.scenario) {
      console.error('Invalid signal received');
      return;
    }

    try {
      console.log('Executing trade signal:', signal);
      if (mode === 'demo') {
        // Simulate trade execution in demo mode
        const newPosition: Position = {
          symbol: signal.symbol,
          quantity: calculatePositionSize(signal),
          entryPrice: signal.scenario.entryPrice,
          currentPrice: signal.scenario.entryPrice,
          entryDate: new Date(),
          lastUpdated: new Date(),
          type: signal.scenario.position,
          stopLoss: signal.scenario.stopLoss,
          takeProfit: signal.scenario.takeProfit,
          unrealizedPnL: 0,
          realizedPnL: 0,
        };

        setPositions(prev => [...prev, newPosition]);
        updatePerformance();
      } else {
        console.log('Live trading not implemented yet');
      }
    } catch (error) {
      console.error('Error executing trade signal:', error);
      setError(error instanceof Error ? error.message : 'Failed to execute trade');
    }
  };

  const calculatePositionSize = (signal: TradingSignal): number => {
    if (!signal.scenario || typeof signal.scenario.confidence !== 'number') {
      return 100; // Default size if confidence is not available
    }
    const baseSize = 100;
    return Math.round(baseSize * signal.scenario.confidence);
  };

  const updatePerformance = () => {
    try {
      const closedPositions = positions.filter(p => p.realizedPnL !== 0);
      const winners = closedPositions.filter(p => p.realizedPnL > 0).length;
      const winRate = closedPositions.length > 0 ? (winners / closedPositions.length) * 100 : 0;
      const totalPnL = positions.reduce((sum, pos) => sum + (pos.realizedPnL + pos.unrealizedPnL), 0);
      
      setPerformance({
        winRate,
        profitLoss: totalPnL,
      });
    } catch (error) {
      console.error('Error updating performance:', error);
    }
  };

  const handleModeToggle = () => {
    const newMode = mode === 'demo' ? 'live' : 'demo';
    console.log('Trading mode changed to:', newMode);
    setMode(newMode);
    setError(null);
  };

  const handleAIToggle = () => {
    const newState = !aiEnabled;
    console.log('AI trading toggled:', newState);
    setAiEnabled(newState);
    setError(null);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">AI Trading Dashboard</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-300">Mode:</span>
            <button
              onClick={handleModeToggle}
              className={`px-4 py-2 rounded-md ${
                mode === 'demo'
                  ? 'bg-blue-600 text-white'
                  : 'bg-green-600 text-white'
              }`}
            >
              {mode.toUpperCase()}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-300">AI Trading:</span>
            <button
              onClick={handleAIToggle}
              className={`px-4 py-2 rounded-md ${
                aiEnabled
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-600 text-white'
              }`}
            >
              {aiEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">Symbol Search</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={symbol}
                onChange={(e) => handleSymbolChange(e.target.value)}
                placeholder="Enter symbol (e.g., AAPL)"
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-md"
              />
              <button 
                className={`px-6 py-2 rounded-md ${
                  isAnalyzing 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
                onClick={() => analyzeMarket()}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">AI Signals</h3>
            {lastSignal && lastSignal.scenario ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Signal Type:</span>
                  <span className="text-white">{lastSignal.scenario.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Confidence:</span>
                  <span className="text-white">{Math.round(lastSignal.scenario.confidence * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Entry Price:</span>
                  <span className="text-white">${lastSignal.scenario.entryPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Stop Loss:</span>
                  <span className="text-white">${lastSignal.scenario.stopLoss.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Take Profit:</span>
                  <span className="text-white">${lastSignal.scenario.takeProfit.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No signals available</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">Active Positions</h3>
            {positions.length > 0 ? (
              <div className="space-y-2">
                {positions.map((position, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-300">{position.symbol}</span>
                    <span className="text-white">{position.quantity} shares</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No active positions</p>
            )}
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-300">Win Rate</p>
                <p className="text-2xl font-semibold text-white">
                  {performance.winRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-gray-300">Profit/Loss</p>
                <p className={`text-2xl font-semibold ${
                  performance.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  ${performance.profitLoss.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 