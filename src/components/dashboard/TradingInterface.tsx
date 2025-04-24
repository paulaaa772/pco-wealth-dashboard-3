import { useState } from 'react';
import { AITradingEngine } from '../../lib/trading-engine/AITradingEngine';
import { TradingMode, TradingSignal } from '../../lib/trading-engine/types';

export default function TradingInterface() {
  const [mode, setMode] = useState<TradingMode>('demo');
  const [symbol, setSymbol] = useState<string>('');
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);
  const [lastSignal, setLastSignal] = useState<TradingSignal | null>(null);

  const handleModeToggle = () => {
    setMode(mode === 'demo' ? 'live' : 'demo');
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
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Enter symbol (e.g., AAPL)"
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-md"
              />
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                Analyze
              </button>
            </div>
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
                  <span className="text-white">{lastSignal.scenario.confidence * 100}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Entry Price:</span>
                  <span className="text-white">${lastSignal.scenario.entryPrice}</span>
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
              <p className="text-gray-400">No active positions</p>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-300">Win Rate</p>
                <p className="text-2xl text-white">0%</p>
              </div>
              <div>
                <p className="text-gray-300">Profit/Loss</p>
                <p className="text-2xl text-green-500">$0.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 