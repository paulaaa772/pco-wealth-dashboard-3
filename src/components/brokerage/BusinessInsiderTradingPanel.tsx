import React, { useState, useEffect } from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, BeakerIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface InsiderTrade {
  id: number;
  name: string;
  title: string;
  company: string;
  symbol: string;
  type: string;
  shares: number;
  price: number;
  value: number;
  date: string;
  filing_date: string;
  performance: number;
  analysis?: {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    factors: {
      business: string;
      timing: string;
      pattern: string;
    };
  };
}

interface BusinessInsiderTradingPanelProps {
  symbol?: string;
  onCopyTrade: (trade: InsiderTrade) => void;
}

// Mock data for insider trades
const mockInsiderTrades: InsiderTrade[] = [
  {
    id: 1,
    name: 'Jensen Huang',
    title: 'CEO',
    company: 'NVIDIA Corporation',
    symbol: 'NVDA',
    type: 'Sell',
    shares: 25000,
    price: 910.25,
    value: 22756250,
    date: '2024-03-15',
    filing_date: '2024-03-17',
    performance: -2.7,
    analysis: {
      sentiment: 'neutral',
      confidence: 0.65,
      factors: {
        business: 'Regular scheduled selling for diversification',
        timing: 'After strong quarterly earnings report',
        pattern: 'Consistent sell pattern over 12 months, not indicative of negative outlook'
      }
    }
  },
  {
    id: 2,
    name: 'Tim Cook',
    title: 'CEO',
    company: 'Apple Inc.',
    symbol: 'AAPL',
    type: 'Sell',
    shares: 15000,
    price: 178.35,
    value: 2675250,
    date: '2024-03-10',
    filing_date: '2024-03-12',
    performance: 1.8,
    analysis: {
      sentiment: 'neutral',
      confidence: 0.70,
      factors: {
        business: 'Part of 10b5-1 trading plan',
        timing: 'Standard vesting schedule',
        pattern: 'Predictable selling pattern, unrelated to company outlook'
      }
    }
  },
  {
    id: 3,
    name: 'Satya Nadella',
    title: 'CEO',
    company: 'Microsoft Corporation',
    symbol: 'MSFT',
    type: 'Sell',
    shares: 12000,
    price: 415.75,
    value: 4989000,
    date: '2024-03-05',
    filing_date: '2024-03-07',
    performance: 3.2,
    analysis: {
      sentiment: 'neutral',
      confidence: 0.68,
      factors: {
        business: 'Regular diversification of holdings',
        timing: 'After stock reached all-time high',
        pattern: 'Similar to previous quarters, routine transaction'
      }
    }
  },
  {
    id: 4,
    name: 'Ted Sarandos',
    title: 'Co-CEO',
    company: 'Netflix Inc.',
    symbol: 'NFLX',
    type: 'Buy',
    shares: 2000,
    price: 610.50,
    value: 1221000,
    date: '2024-03-01',
    filing_date: '2024-03-03',
    performance: 4.5,
    analysis: {
      sentiment: 'bullish',
      confidence: 0.82,
      factors: {
        business: 'Unusual purchase outside regular compensation',
        timing: 'After temporary dip following strong subscriber growth',
        pattern: 'Rarely purchases shares on open market - strong confidence signal'
      }
    }
  },
  {
    id: 5,
    name: 'Mark Zuckerberg',
    title: 'CEO',
    company: 'Meta Platforms Inc.',
    symbol: 'META',
    type: 'Sell',
    shares: 42000,
    price: 478.20,
    value: 20084400,
    date: '2024-02-25',
    filing_date: '2024-02-27',
    performance: 5.3,
    analysis: {
      sentiment: 'neutral',
      confidence: 0.60,
      factors: {
        business: 'Part of planned selling for philanthropic initiatives',
        timing: 'After strong earnings and positive AI outlook',
        pattern: 'Continuing established selling trend'
      }
    }
  },
  {
    id: 6,
    name: 'Lisa Su',
    title: 'CEO',
    company: 'Advanced Micro Devices, Inc.',
    symbol: 'AMD',
    type: 'Buy',
    shares: 5000,
    price: 175.30,
    value: 876500,
    date: '2024-02-20',
    filing_date: '2024-02-22',
    performance: 8.7,
    analysis: {
      sentiment: 'bullish',
      confidence: 0.88,
      factors: {
        business: 'Open market purchase beyond granted shares',
        timing: 'Following market-wide chip stock selloff',
        pattern: 'Rare purchase - strong conviction in company prospects'
      }
    }
  },
  {
    id: 7,
    name: 'Jamie Dimon',
    title: 'CEO',
    company: 'JPMorgan Chase & Co.',
    symbol: 'JPM',
    type: 'Buy',
    shares: 8500,
    price: 182.45,
    value: 1550825,
    date: '2024-02-15',
    filing_date: '2024-02-17',
    performance: 2.8,
    analysis: {
      sentiment: 'bullish',
      confidence: 0.75,
      factors: {
        business: 'Significant open market purchase',
        timing: 'During banking sector uncertainty',
        pattern: 'History of buying during market fear - high conviction signal'
      }
    }
  }
];

const BusinessInsiderTradingPanel: React.FC<BusinessInsiderTradingPanelProps> = ({ 
  symbol, 
  onCopyTrade 
}) => {
  const [trades, setTrades] = useState<InsiderTrade[]>(mockInsiderTrades);
  const [filteredTrades, setFilteredTrades] = useState<InsiderTrade[]>(mockInsiderTrades);
  const [selectedTrade, setSelectedTrade] = useState<InsiderTrade | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAutoCopyEnabled, setIsAutoCopyEnabled] = useState(false);
  const [aiThreshold, setAiThreshold] = useState(0.75); // Confidence threshold for auto-copy
  const [filterBuy, setFilterBuy] = useState(true);
  const [filterSell, setFilterSell] = useState(true);

  // Filter trades based on symbol prop and buy/sell filters
  useEffect(() => {
    let filtered = trades;
    
    if (symbol) {
      filtered = filtered.filter(trade => trade.symbol === symbol);
    }
    
    if (!filterBuy) {
      filtered = filtered.filter(trade => trade.type !== 'Buy');
    }
    
    if (!filterSell) {
      filtered = filtered.filter(trade => trade.type !== 'Sell');
    }
    
    setFilteredTrades(filtered);
  }, [trades, symbol, filterBuy, filterSell]);

  // Handle manual copy of a trade
  const handleCopyTrade = (trade: InsiderTrade) => {
    console.log(`Copying insider trade: ${trade.type} ${trade.symbol}`);
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
        trade.analysis.sentiment !== 'neutral'
      );
      
      // Auto-copy high confidence non-neutral trades
      if (highConfidenceTrades.length > 0) {
        console.log(`Auto-copying ${highConfidenceTrades.length} high confidence insider trades`);
        highConfidenceTrades.forEach(trade => onCopyTrade(trade));
      }
    }
  };

  // Show analysis for a specific trade
  const handleShowAnalysis = (trade: InsiderTrade) => {
    setSelectedTrade(trade);
    setShowAnalysis(true);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format large numbers with K or M suffix
  const formatLargeNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Insider Trading</h3>
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
      
      {/* Filters and AI settings */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filters:</span>
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filterBuy}
              onChange={() => setFilterBuy(!filterBuy)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-green-600 dark:text-green-400">Buy</span>
          </label>
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filterSell}
              onChange={() => setFilterSell(!filterSell)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-red-600 dark:text-red-400">Sell</span>
          </label>
        </div>

        {isAutoCopyEnabled && (
          <div className="flex items-center space-x-2">
            <BeakerIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              AI threshold: {Math.round(aiThreshold * 100)}%
            </span>
            <input
              type="range"
              min="0.6"
              max="0.9"
              step="0.05"
              value={aiThreshold}
              onChange={(e) => setAiThreshold(parseFloat(e.target.value))}
              className="w-24"
            />
          </div>
        )}
      </div>
      
      {/* Insider trades table */}
      <div className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Insider</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTrades.map((trade) => (
                <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{trade.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{trade.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{trade.symbol}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{trade.company}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        trade.type === 'Buy' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {trade.type}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatLargeNumber(trade.shares)} shares @ {formatCurrency(trade.price)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(trade.value)}
                    </div>
                    <div className={`inline-flex items-center text-xs ${
                      trade.performance >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {trade.performance >= 0 ? (
                        <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(trade.performance)}% since filing
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
                    No insider trades found for {symbol || 'any symbol'} {!filterBuy && !filterSell ? '' : filterBuy && !filterSell ? '(Buy only)' : !filterBuy && filterSell ? '(Sell only)' : ''}
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
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  AI Analysis: {selectedTrade.name}'s Trade
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedTrade.type} {formatLargeNumber(selectedTrade.shares)} {selectedTrade.symbol} shares
                </p>
              </div>
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
                <span className="text-sm text-gray-500 dark:text-gray-400">AI Signal Strength:</span>
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      (selectedTrade.analysis?.confidence || 0) > 0.8 ? 'bg-green-600' :
                      (selectedTrade.analysis?.confidence || 0) > 0.7 ? 'bg-yellow-400' :
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
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Analysis Factors:</h4>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400">Business Context:</h5>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTrade.analysis?.factors.business}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400">Timing Analysis:</h5>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTrade.analysis?.factors.timing}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400">Pattern Recognition:</h5>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTrade.analysis?.factors.pattern}</p>
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
        Form 4 filings data. Executives must report trades within 2 business days of transaction.
      </div>
    </div>
  );
};

export default BusinessInsiderTradingPanel; 