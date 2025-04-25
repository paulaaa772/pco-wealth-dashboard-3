import React, { useState, useEffect } from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, BeakerIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface CongressTrade {
  id: number;
  representative: string;
  party: string;
  state: string;
  symbol: string;
  company: string;
  type: string;
  amount: string;
  date: string;
  disclosure: string;
  performance: number;
  analysis?: {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    factors: {
      market: string;
      economic: string;
      political: string;
    };
  };
}

interface CongressTradingPanelProps {
  symbol?: string;
  onCopyTrade: (trade: CongressTrade) => void;
}

// Mock data for Congress trades
const mockCongressTrades: CongressTrade[] = [
  {
    id: 1,
    representative: 'Nancy Pelosi',
    party: 'D',
    state: 'CA',
    symbol: 'NVDA',
    company: 'NVIDIA Corporation',
    type: 'Buy',
    amount: '1,000,000-5,000,000',
    date: '2024-02-15',
    disclosure: '2024-02-28',
    performance: 12.5,
    analysis: {
      sentiment: 'bullish',
      confidence: 0.85,
      factors: {
        market: 'Strong demand for AI chips',
        economic: 'Tech spending remains resilient',
        political: 'Likely aware of upcoming AI funding bill'
      }
    }
  },
  {
    id: 2,
    representative: 'Dan Crenshaw',
    party: 'R',
    state: 'TX',
    symbol: 'TSLA',
    company: 'Tesla, Inc.',
    type: 'Sell',
    amount: '250,000-500,000',
    date: '2024-02-14',
    disclosure: '2024-02-27',
    performance: -5.2,
    analysis: {
      sentiment: 'bearish',
      confidence: 0.72,
      factors: {
        market: 'Increased EV competition',
        economic: 'Rising interest rates affecting auto loans',
        political: 'Potential reduction in EV tax credits'
      }
    }
  },
  {
    id: 3,
    representative: 'Josh Gottheimer',
    party: 'D',
    state: 'NJ',
    symbol: 'MSFT',
    company: 'Microsoft Corporation',
    type: 'Buy',
    amount: '100,000-250,000',
    date: '2024-02-13',
    disclosure: '2024-02-26',
    performance: 8.7,
    analysis: {
      sentiment: 'bullish',
      confidence: 0.78,
      factors: {
        market: 'Azure cloud growth continues',
        economic: 'Business IT spending increasing',
        political: 'Likely briefed on government cloud contracts'
      }
    }
  },
  {
    id: 4,
    representative: 'Michael McCaul',
    party: 'R',
    state: 'TX',
    symbol: 'AAPL',
    company: 'Apple Inc.',
    type: 'Buy',
    amount: '500,000-1,000,000',
    date: '2024-02-12',
    disclosure: '2024-02-25',
    performance: 3.4,
    analysis: {
      sentiment: 'bullish',
      confidence: 0.65,
      factors: {
        market: 'iPhone sales stabilizing',
        economic: 'Consumer spending still strong',
        political: 'No significant regulatory risks identified'
      }
    }
  },
];

const CongressTradingPanel: React.FC<CongressTradingPanelProps> = ({ 
  symbol, 
  onCopyTrade 
}) => {
  const [trades, setTrades] = useState<CongressTrade[]>(mockCongressTrades);
  const [filteredTrades, setFilteredTrades] = useState<CongressTrade[]>(mockCongressTrades);
  const [selectedTrade, setSelectedTrade] = useState<CongressTrade | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAutoCopyEnabled, setIsAutoCopyEnabled] = useState(false);
  const [aiThreshold, setAiThreshold] = useState(0.7); // Confidence threshold for auto-copy

  // Filter trades based on symbol prop
  useEffect(() => {
    if (symbol) {
      setFilteredTrades(trades.filter(trade => trade.symbol === symbol));
    } else {
      setFilteredTrades(trades);
    }
  }, [trades, symbol]);

  // Handle manual copy of a trade
  const handleCopyTrade = (trade: CongressTrade) => {
    console.log(`Copying trade: ${trade.type} ${trade.symbol}`);
    onCopyTrade(trade);
  };

  // Toggle auto-copy feature
  const toggleAutoCopy = () => {
    setIsAutoCopyEnabled(!isAutoCopyEnabled);
    
    // If enabling auto-copy, analyze which trades to copy
    if (!isAutoCopyEnabled) {
      const highConfidenceTrades = trades.filter(trade => 
        trade.analysis && 
        trade.analysis.confidence >= aiThreshold &&
        (trade.type === 'Buy' ? trade.analysis.sentiment === 'bullish' : trade.analysis.sentiment === 'bearish')
      );
      
      // Auto-copy high confidence trades
      if (highConfidenceTrades.length > 0) {
        console.log(`Auto-copying ${highConfidenceTrades.length} high confidence trades`);
        highConfidenceTrades.forEach(trade => onCopyTrade(trade));
      }
    }
  };

  // Show analysis for a specific trade
  const handleShowAnalysis = (trade: CongressTrade) => {
    setSelectedTrade(trade);
    setShowAnalysis(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Congress Trading</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">AI Copy Trading</span>
          <div 
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              isAutoCopyEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            onClick={toggleAutoCopy}
          >
            <span 
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAutoCopyEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} 
            />
          </div>
        </div>
      </div>
      
      {isAutoCopyEnabled && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
          <div className="flex items-center">
            <BeakerIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              AI will auto-copy trades with {Math.round(aiThreshold * 100)}%+ confidence
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="0.9"
            step="0.05"
            value={aiThreshold}
            onChange={(e) => setAiThreshold(parseFloat(e.target.value))}
            className="w-24"
          />
        </div>
      )}
      
      {/* Congress trades table */}
      <div className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Representative</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Performance</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTrades.map((trade) => (
                <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        trade.party === 'D' ? 'bg-blue-500' : 'bg-red-500'
                      }`}></span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{trade.representative}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{trade.symbol}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{trade.company}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      trade.type === 'Buy' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className={`inline-flex items-center text-sm font-medium ${
                      trade.performance >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {trade.performance >= 0 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(trade.performance)}%
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => handleShowAnalysis(trade)} 
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        title="Show AI Analysis"
                      >
                        <LightBulbIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleCopyTrade(trade)} 
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Copy Trade"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                          <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTrades.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No congress trades found for {symbol || 'any symbol'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Analysis Modal */}
      {showAnalysis && selectedTrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                AI Analysis: {selectedTrade.symbol} {selectedTrade.type}
              </h3>
              <button 
                onClick={() => setShowAnalysis(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Overall Sentiment:</span>
                <span className={`font-medium ${
                  selectedTrade.analysis?.sentiment === 'bullish' ? 'text-green-600 dark:text-green-400' :
                  selectedTrade.analysis?.sentiment === 'bearish' ? 'text-red-600 dark:text-red-400' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {selectedTrade.analysis?.sentiment.toUpperCase()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">AI Confidence:</span>
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      (selectedTrade.analysis?.confidence || 0) > 0.8 ? 'bg-green-600' :
                      (selectedTrade.analysis?.confidence || 0) > 0.6 ? 'bg-yellow-400' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${(selectedTrade.analysis?.confidence || 0) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {Math.round((selectedTrade.analysis?.confidence || 0) * 100)}%
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Factors:</h4>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400">Market Factors:</h5>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTrade.analysis?.factors.market}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400">Economic Factors:</h5>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTrade.analysis?.factors.economic}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400">Political Factors:</h5>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTrade.analysis?.factors.political}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => {
                    handleCopyTrade(selectedTrade);
                    setShowAnalysis(false);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Copy This Trade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-500 dark:text-gray-400 italic">
        Congressional trading data is delayed by disclosure rules (typically 30-45 days).
      </div>
    </div>
  );
};

export default CongressTradingPanel; 