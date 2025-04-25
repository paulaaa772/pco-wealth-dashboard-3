import React, { useState } from 'react';

// Type for trade signals
export interface TradeSignal {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  price: number;
  timestamp: number;
  confidence: number;
  reason: string;
  status: 'new' | 'executed' | 'ignored';
  executionDetails?: {
    executionPrice: number;
    executionTime: number;
    profit: number;
  };
}

interface AITradingPanelProps {
  onExecuteTrade?: (signal: TradeSignal) => void;
}

const AITradingPanel: React.FC<AITradingPanelProps> = ({ onExecuteTrade }) => {
  const [signalAction, setSignalAction] = useState<{ [key: string]: string }>({});

  // Sample data for trade signals - in a real app, this would come from your backend
  const tradeSignals: TradeSignal[] = [
    {
      id: 'signal-001',
      symbol: 'NVDA',
      action: 'BUY',
      price: 1105.38,
      timestamp: new Date().getTime() - 25 * 60 * 1000, // 25 min ago
      confidence: 89,
      reason: 'Strong momentum following AI chip demand surge',
      status: 'new'
    },
    {
      id: 'signal-002',
      symbol: 'MSFT',
      action: 'BUY',
      price: 417.95,
      timestamp: new Date().getTime() - 55 * 60 * 1000, // 55 min ago
      confidence: 78,
      reason: 'Positive market reaction to new cloud services pricing',
      status: 'new'
    },
    {
      id: 'signal-003',
      symbol: 'AAPL',
      action: 'SELL',
      price: 213.07,
      timestamp: new Date().getTime() - 2 * 60 * 60 * 1000, // 2 hours ago
      confidence: 72,
      reason: 'Technical resistance reached at 52-week high',
      status: 'executed',
      executionDetails: {
        executionPrice: 212.95,
        executionTime: new Date().getTime() - 1.8 * 60 * 60 * 1000,
        profit: -0.06 // percentage
      }
    }
  ];

  // Format timestamp to readable time
  const formatTimestamp = (timestamp: number) => {
    const now = new Date().getTime();
    const diffMs = now - timestamp;
    
    if (diffMs < 60 * 1000) {
      return 'Just now';
    } else if (diffMs < 60 * 60 * 1000) {
      const minutes = Math.floor(diffMs / (60 * 1000));
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffMs < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diffMs / (60 * 60 * 1000));
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };
  
  // Handle execution of AI trade signal
  const handleExecuteSignal = (signal: TradeSignal) => {
    setSignalAction(prev => ({
      ...prev,
      [signal.id]: 'executing'
    }));
    
    // Simulate API call with timeout
    setTimeout(() => {
      setSignalAction(prev => ({
        ...prev,
        [signal.id]: 'executed'
      }));
      
      if (onExecuteTrade) {
        onExecuteTrade(signal);
      }
    }, 1500);
  };
  
  // Handle ignoring AI trade signal
  const handleIgnoreSignal = (signalId: string) => {
    setSignalAction(prev => ({
      ...prev,
      [signalId]: 'ignoring'
    }));
    
    // Simulate API call with timeout
    setTimeout(() => {
      setSignalAction(prev => ({
        ...prev,
        [signalId]: 'ignored'
      }));
    }, 800);
  };
  
  // Filter signals that haven't been acted upon
  const pendingSignals = tradeSignals.filter(signal => 
    signal.status === 'new' && 
    !signalAction[signal.id]
  );

  // If there are no pending signals, show a message
  if (pendingSignals.length === 0) {
    return (
      <div className="bg-[#1D2939] rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">AI Trading Signals</h3>
        <p className="text-gray-300">No new trading signals available right now. Check back later for AI-powered trade recommendations.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1D2939] rounded-lg overflow-hidden text-white">
      <div className="border-b border-gray-700 p-4 bg-blue-900/20">
        <h3 className="text-lg font-semibold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          AI Trade Signals
        </h3>
      </div>
      
      <div className="p-6">
        <p className="text-gray-300 mb-6">
          Our AI has detected the following trading opportunities based on market analysis, news sentiment, and technical indicators.
        </p>
        
        <div className="space-y-6">
          {pendingSignals.map((signal) => (
            <div key={signal.id} className="bg-[#2D3748] rounded-lg p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-medium text-white flex items-center">
                    {signal.action === 'BUY' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {signal.action} {signal.symbol}
                  </h4>
                  <div className="text-sm text-gray-400 mt-1">
                    AI confidence: 
                    <span className={`ml-1 ${
                      signal.confidence > 80 ? 'text-green-400' : 
                      signal.confidence > 65 ? 'text-yellow-400' : 
                      'text-red-400'
                    }`}>
                      {signal.confidence}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-0.5">
                    {formatTimestamp(signal.timestamp)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold">
                    ${signal.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">Current price</div>
                </div>
              </div>
              
              <div className="mt-2 mb-4">
                <div className="text-sm text-gray-300">
                  <span className="font-medium">Analysis:</span> {signal.reason}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                {signalAction[signal.id] === 'executing' ? (
                  <button 
                    className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center opacity-70 cursor-not-allowed"
                    disabled
                  >
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Executing...
                  </button>
                ) : signalAction[signal.id] === 'executed' ? (
                  <button 
                    className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center"
                    disabled
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Executed
                  </button>
                ) : signalAction[signal.id] === 'ignoring' ? (
                  <button 
                    className="px-4 py-2 bg-gray-600 text-white rounded-md opacity-70 cursor-not-allowed"
                    disabled
                  >
                    Ignoring...
                  </button>
                ) : signalAction[signal.id] === 'ignored' ? (
                  <button 
                    className="px-4 py-2 bg-gray-600 text-white rounded-md opacity-70 cursor-not-allowed"
                    disabled
                  >
                    Ignored
                  </button>
                ) : (
                  <>
                    <button 
                      className="px-4 py-2 bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-md"
                      onClick={() => handleIgnoreSignal(signal.id)}
                    >
                      Ignore
                    </button>
                    <button 
                      className={`px-4 py-2 ${signal.action === 'BUY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-md`}
                      onClick={() => handleExecuteSignal(signal)}
                    >
                      Execute {signal.action}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AITradingPanel; 