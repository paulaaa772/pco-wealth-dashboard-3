import React, { useState, useEffect } from 'react';

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
  stopLoss?: number;
  takeProfit?: number;
}

interface AITradingPanelProps {
  symbol: string;
  positions: AIPosition[];
}

const strategies = [
  'Momentum', 'Mean Reversion', 'Trend Following', 'Breakout', 'Sentiment Analysis'
];

const AITradingPanel: React.FC<AITradingPanelProps> = ({ symbol, positions }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [activePositions, setActivePositions] = useState<AIPosition[]>(positions.filter(position => position.status === 'open'));
  const [analysisStatus, setAnalysisStatus] = useState<string>('idle');
  const [currentStrategy, setCurrentStrategy] = useState<string>(strategies[0]);
  
  // Simulate real-time analysis when enabled
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isEnabled) {
      setAnalysisStatus('analyzing');
      
      // Simulate occasional strategy changes
      timer = setInterval(() => {
        const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
        setCurrentStrategy(randomStrategy);
        
        // Occasionally update position price and P&L
        setActivePositions(currentPositions => 
          currentPositions.map(pos => {
            if (pos.symbol === symbol) {
              // Random price fluctuation between -1% and +1%
              const priceChange = pos.entryPrice * (Math.random() * 0.02 - 0.01);
              const newExitPrice = pos.entryPrice + priceChange;
              const pnl = (newExitPrice - pos.entryPrice) * pos.quantity;
              const pnlPercent = (pnl / (pos.entryPrice * pos.quantity)) * 100;
              
              return {
                ...pos,
                exitPrice: newExitPrice,
                pnl,
                pnlPercent
              };
            }
            return pos;
          })
        );
      }, 5000);
    } else {
      setAnalysisStatus('idle');
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isEnabled, symbol]);
  
  // Update when positions prop changes
  useEffect(() => {
    setActivePositions(positions.filter(position => position.status === 'open'));
  }, [positions]);
  
  const handleToggleAI = () => {
    setIsEnabled(!isEnabled);
  };
  
  const createNewPosition = () => {
    if (!isEnabled) return;
    
    const newPosition: AIPosition = {
      id: `position-${Date.now()}`,
      symbol,
      entryPrice: parseFloat((170 + Math.random() * 10).toFixed(2)),
      quantity: Math.floor(5 + Math.random() * 20),
      entryTime: Date.now(),
      status: 'open',
      strategy: currentStrategy
    };
    
    setActivePositions(prev => [...prev, newPosition]);
  };
  
  const closePosition = (positionId: string) => {
    setActivePositions(prev => {
      // First map to change status
      const updatedPositions: AIPosition[] = prev.map(pos => {
        if (pos.id === positionId) {
          const pnl = ((pos.exitPrice || pos.entryPrice) - pos.entryPrice) * pos.quantity;
          return {
            ...pos,
            status: 'closed' as const,
            exitTime: Date.now(),
            pnl
          };
        }
        return pos;
      });
      
      // Then filter out closed positions
      return updatedPositions.filter(pos => pos.status === 'open');
    });
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">AI Trading</h3>
      
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <div 
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
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
        <div className="py-2 px-3 mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-800 dark:text-blue-300 flex items-center justify-between">
          <div>
            AI Trading is analyzing {symbol} with {riskLevel} risk profile
            {analysisStatus === 'analyzing' && (
              <span className="inline-block ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            )}
          </div>
          {riskLevel !== 'low' && (
            <button 
              onClick={createNewPosition}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Simulate Signal
            </button>
          )}
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Active Positions</h4>
          {activePositions.length > 0 && (
            <button 
              onClick={() => closePosition(activePositions[0].id)}
              className="text-xs text-red-600 hover:text-red-800 dark:text-red-400"
            >
              Close Position
            </button>
          )}
        </div>
        
        {activePositions.length === 0 ? (
          <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-500 dark:text-gray-400">
            No active positions
          </div>
        ) : (
          <div className="space-y-3">
            {activePositions.map(position => {
              const currentValue = position.quantity * (position.exitPrice || position.entryPrice);
              const entryValue = position.quantity * position.entryPrice;
              const profit = currentValue - entryValue;
              const profitPercent = position.pnlPercent || (profit / entryValue) * 100;
              
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
                        {position.quantity} shares @ {formatCurrency(position.entryPrice)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">Current P/L:</div>
                    <div className={`text-sm font-medium ${
                      profitPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {profit >= 0 ? '+' : ''}{formatCurrency(profit)} ({profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 italic">
        The AI will automatically analyze patterns and execute trades based on your risk settings.
      </div>
    </div>
  );
};

export default AITradingPanel; 