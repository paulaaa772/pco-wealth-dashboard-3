import React, { useState } from 'react';

interface AIPosition {
  id: string;
  symbol: string;
  entryPrice: number;
  quantity: number;
  entryTime: number;
  exitPrice?: number;
  exitTime?: number;
  status: 'open' | 'closed';
  pnl?: number;
  pnlPercent?: number;
  strategy: string;
}

interface AITradingPanelProps {
  symbol: string;
  positions: AIPosition[];
}

const AITradingPanel: React.FC<AITradingPanelProps> = ({ symbol, positions }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  
  const activePositions = positions.filter(position => position.status === 'open');
  
  const handleToggleAI = () => {
    setIsEnabled(!isEnabled);
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">AI Trading</h3>
      
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <div 
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            onClick={handleToggleAI}
          >
            <span 
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} 
            />
          </div>
          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        
        {isEnabled && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Risk:</label>
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
              <button
                className={`px-2 py-1 text-xs ${
                  riskLevel === 'low' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'
                }`}
                onClick={() => setRiskLevel('low')}
              >
                Low
              </button>
              <button
                className={`px-2 py-1 text-xs ${
                  riskLevel === 'medium' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'
                }`}
                onClick={() => setRiskLevel('medium')}
              >
                Med
              </button>
              <button
                className={`px-2 py-1 text-xs ${
                  riskLevel === 'high' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'
                }`}
                onClick={() => setRiskLevel('high')}
              >
                High
              </button>
            </div>
          </div>
        )}
      </div>
      
      {isEnabled && (
        <div className="py-2 px-3 mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-800 dark:text-blue-300">
          AI Trading is analyzing {symbol} with {riskLevel} risk profile
        </div>
      )}
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Active Positions</h4>
        
        {activePositions.length === 0 ? (
          <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-500 dark:text-gray-400">
            No active positions
          </div>
        ) : (
          <div className="space-y-3">
            {activePositions.map(position => {
              const currentValue = position.quantity * (position.exitPrice || 0);
              const entryValue = position.quantity * position.entryPrice;
              const profit = currentValue - entryValue;
              const profitPercent = (profit / entryValue) * 100;
              
              return (
                <div key={position.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{position.symbol}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{position.strategy} Strategy</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Opened: {formatDate(position.entryTime)}</div>
                      <div className="text-sm font-medium">
                        {position.quantity} shares @ ${position.entryPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  {position.exitPrice && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                      <div className="text-sm text-gray-700 dark:text-gray-300">Current P/L:</div>
                      <div className={`text-sm font-medium ${
                        profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {profit >= 0 ? '+' : ''}{profit.toFixed(2)} ({profitPercent.toFixed(2)}%)
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {isEnabled && (
        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
          The AI will automatically analyze patterns and execute trades based on your risk settings.
        </div>
      )}
    </div>
  );
};

export default AITradingPanel; 