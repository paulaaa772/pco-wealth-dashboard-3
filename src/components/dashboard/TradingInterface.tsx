import { useState, useEffect } from 'react';
import { AITradingEngine } from '../../lib/trading-engine/AITradingEngine';
import { TradingMode, TradingSignal, Position } from '../../lib/trading-engine/types';
import { PolygonService } from '../../lib/market-data/PolygonService';

interface TradingInterfaceProps {
  onSymbolChange?: (symbol: string) => void;
}

export default function TradingInterface({ onSymbolChange }: TradingInterfaceProps) {
  const [mode, setMode] = useState<TradingMode>('demo');
  const [symbol, setSymbol] = useState<string>('');
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);
  const [lastSignal, setLastSignal] = useState<TradingSignal | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [performance, setPerformance] = useState({
    winRate: 0,
    profitLoss: 0,
  });

  const aiEngine = new AITradingEngine(mode);
  const polygonService = PolygonService.getInstance();

  useEffect(() => {
    if (aiEnabled) {
      const interval = setInterval(async () => {
        if (symbol) {
          await analyzeMarket();
        }
      }, 60000); // Analyze every minute when AI is enabled
      return () => clearInterval(interval);
    }
  }, [aiEnabled, symbol]);

  const handleSymbolChange = (newSymbol: string) => {
    const upperSymbol = newSymbol.toUpperCase();
    setSymbol(upperSymbol);
    onSymbolChange?.(upperSymbol);
  };

  const analyzeMarket = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      if (!symbol) {
        setError('Please enter a symbol');
        return;
      }

      const signal = await aiEngine.analyzeMarket(symbol);
      if (signal) {
        setLastSignal(signal);
        if (aiEnabled) {
          await executeTradeSignal(signal);
        }
      } else {
        setError('No trading signals available');
      }
    } catch (err) {
      setError('Error analyzing market');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const executeTradeSignal = async (signal: TradingSignal) => {
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
      // Implement real trading logic here
      console.log('Live trading not implemented yet');
    }
  };

  const calculatePositionSize = (signal: TradingSignal): number => {
    // Simple position sizing based on confidence
    const baseSize = 100; // Base position size in shares
    return Math.round(baseSize * signal.scenario.confidence);
  };

  const updatePerformance = () => {
    const closedPositions = positions.filter(p => p.realizedPnL !== 0);
    const winners = closedPositions.filter(p => p.realizedPnL > 0).length;
    const winRate = closedPositions.length > 0 ? (winners / closedPositions.length) * 100 : 0;
    
    const totalPnL = positions.reduce((sum, pos) => sum + pos.realizedPnL + pos.unrealizedPnL, 0);
    
    setPerformance({
      winRate,
      profitLoss: totalPnL,
    });
  };

  const handleModeToggle = () => {
    setMode(mode === 'demo' ? 'live' : 'demo');
    aiEngine.setMode(mode === 'demo' ? 'live' : 'demo');
  };

  const handleAIToggle = () => {
    setAiEnabled(!aiEnabled);
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
                onClick={analyzeMarket}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">AI Signals</h3>
            {lastSignal ? (
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
            <div className="space-y-2">
              {positions.length > 0 ? (
                positions.map((position, index) => (
                  <div key={index} className="border-b border-gray-700 pb-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">{position.symbol}</span>
                      <span className={`${
                        position.unrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        ${position.unrealizedPnL.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{position.quantity} shares @ ${position.entryPrice.toFixed(2)}</span>
                      <span className="text-gray-400">{position.type.toUpperCase()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No active positions</p>
              )}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-300">Win Rate</p>
                <p className="text-2xl text-white">{performance.winRate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-300">Profit/Loss</p>
                <p className={`text-2xl ${
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