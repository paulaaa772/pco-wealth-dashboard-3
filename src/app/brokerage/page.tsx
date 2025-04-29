'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { PolygonService, PolygonCandle } from '../../lib/market-data/PolygonService';
import TradingChart from '../../components/dashboard/TradingChart';
import CongressTradingPanel from '../../components/brokerage/CongressTradingPanel';
import BusinessInsiderTradingPanel from '../../components/brokerage/BusinessInsiderTradingPanel';
import TradingInterface from '../../components/dashboard/TradingInterface';

// Create a simple AlertMessage component inline since it's missing
const AlertMessage = ({ 
  type, 
  message, 
  onDismiss 
}: { 
  type: 'warning' | 'error' | 'success' | 'info'; 
  message: string; 
  onDismiss: () => void;
}) => (
  <div className={`p-4 rounded-md ${
    type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' : 
    type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
    type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
    'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
  }`}>
    <div className="flex justify-between items-center">
      <div>{message}</div>
      <button 
        onClick={onDismiss}
        className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
      >
        <span className="sr-only">Dismiss</span>
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
);

// Simplified inline implementation of SymbolSearch
const SymbolSearch = ({ 
  onSymbolSelect, 
  defaultSymbol = 'AAPL' 
}: { 
  onSymbolSelect: (symbol: string) => void; 
  defaultSymbol?: string;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputTimeout = useRef<NodeJS.Timeout | null>(null);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const popularSymbols = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'WMT', name: 'Walmart Inc.' },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    
    // Debounce search to avoid excessive searching
    if (inputTimeout.current) {
      clearTimeout(inputTimeout.current);
    }
    
    // If you want to implement API search, you can add it here
    inputTimeout.current = setTimeout(() => {
      // This is where you would call an API to search for symbols
      // For now, we're just using the local popularSymbols list
      console.log('Searching for:', e.target.value);
    }, 300);
  };

  const handleSelect = (symbol: string) => {
    console.log(`Selected symbol: ${symbol}`);
    setSelectedSymbol(symbol);
    setSearchTerm('');
    setIsOpen(false);
    onSymbolSelect(symbol);
  };

  // Filter symbols based on search term
  const filteredSymbols = popularSymbols.filter(item => 
    searchTerm === '' || 
    item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder={`Search (${selectedSymbol})`}
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          aria-label="Search for stock symbols"
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {searchTerm ? 'Search Results' : 'Popular Symbols'}
            </div>
            <div className="space-y-1">
              {filteredSymbols.length > 0 ? (
                filteredSymbols.map(item => (
                  <div
                    key={item.symbol}
                    className={`flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded ${
                      item.symbol === selectedSymbol ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => handleSelect(item.symbol)}
                  >
                    <div className="font-medium">{item.symbol}</div>
                    <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">{item.name}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-2 text-gray-500 dark:text-gray-400">
                  No matching symbols found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Dynamically import remaining components with SSR disabled to avoid hydration issues
const OrderEntryPanel = dynamic(() => import('../../components/brokerage/OrderEntryPanel'), { ssr: false });
const OrderBook = dynamic(() => import('../../components/brokerage/OrderBook'), { ssr: false });
const TradeHistory = dynamic(() => import('../../components/brokerage/TradeHistory'), { ssr: false });

// Stock data interfaces
export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

// Order and position interfaces
export interface ManualOrder {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: number;
  status: 'open' | 'filled' | 'canceled';
}

export interface AIPosition {
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

// Add handling for Congress trades
export interface CongressTrade {
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

// Add handling for Business Insider trades
export interface InsiderTrade {
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

export default function BrokeragePage() {
  // State for stock data
  const [symbol, setSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1D');
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  
  // Orders and positions
  const [manualOrders, setManualOrders] = useState<ManualOrder[]>([]);
  const [aiPositions, setAiPositions] = useState<AIPosition[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean>(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [refreshInterval, setRefreshInterval] = useState<number>(60); // seconds
  const [activeTab, setActiveTab] = useState<'ai' | 'congress' | 'insiders'>('ai'); // Tab navigation state
  
  // Add state for copied Congress trades
  const [copiedCongressTrades, setCopiedCongressTrades] = useState<CongressTrade[]>([]);
  
  // Add state for copied insider trades
  const [copiedInsiderTrades, setCopiedInsiderTrades] = useState<InsiderTrade[]>([]);

  // Load initial data when page loads
  useEffect(() => {
    console.log('Brokerage page initialized');
    
    // First, check if API key is configured
    verifyApiKey();
    
    // Initial load
    if (symbol) {
      loadMarketData(symbol, timeframe);
    }

    // Add sample orders for demo
    initializeSampleOrders();
    
    // Start auto-refresh timer
    const interval = setInterval(() => {
      if (symbol) {
        console.log(`Auto-refreshing data for ${symbol}`);
        loadMarketData(symbol, timeframe, true);
        setLastUpdateTime(new Date());
      }
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Initialize sample orders and positions
  const initializeSampleOrders = () => {
    const now = Date.now();
    
    setManualOrders([
      {
        id: '1',
        symbol: 'AAPL',
        type: 'buy',
        quantity: 10,
        price: 175.23,
        timestamp: now - 3600000,
        status: 'filled'
      },
      {
        id: '2',
        symbol: 'AAPL',
        type: 'sell',
        quantity: 5,
        price: 178.45,
        timestamp: now - 1800000,
        status: 'open'
      }
    ]);

    setAiPositions([
      {
        id: '1',
        symbol: 'AAPL',
        type: 'buy',
        entryPrice: 170.45,
        quantity: 15,
        timestamp: now - 86400000,
        status: 'open',
      }
    ]);
  };

  // Verify the API key
  const verifyApiKey = async () => {
    try {
      console.log('Verifying API key...');
      const response = await fetch('/api/verify-api');
      const data = await response.json();
      
      if (!data.valid) {
        console.error('API key validation failed:', data.message);
        setIsApiKeyValid(false);
        setError('API key not properly configured. Using demo data instead.');
      } else {
        console.log('API key validation successful');
        setIsApiKeyValid(true);
      }
    } catch (err) {
      console.error('Error checking API key:', err);
      setIsApiKeyValid(false);
      setError('Could not verify API configuration. Using demo data instead.');
    }
  };

  // Handle symbol changes from search
  const handleSymbolChange = useCallback((newSymbol: string) => {
    console.log('Symbol changed to:', newSymbol);
    setSymbol(newSymbol);
    setIsLoading(true);
    setError(null);
    loadMarketData(newSymbol, timeframe);
    
    // Update positions for the new symbol
    const now = Date.now();
    setAiPositions(prev => {
      // Keep existing positions
      const existing = [...prev];
      
      // Add a position for the new symbol if none exists
      if (!existing.some(p => p.symbol === newSymbol && p.status === 'open')) {
        existing.push({
          id: `position-${now}`,
          symbol: newSymbol,
          type: 'buy',
          entryPrice: generateSimulatedPrice(newSymbol),
          quantity: Math.floor(5 + Math.random() * 15),
          timestamp: now - Math.floor(Math.random() * 604800000), // Random time in the last week
          status: 'open',
        });
      }
      
      return existing;
    });
  }, [timeframe]);

  // Handle timeframe changes
  const handleTimeframeChange = useCallback((newTimeframe: string) => {
    console.log('Timeframe changed to:', newTimeframe);
    setTimeframe(newTimeframe);
    setIsLoading(true);
    loadMarketData(symbol, newTimeframe);
  }, [symbol]);

  // Set the refresh interval
  const handleRefreshIntervalChange = (seconds: number) => {
    console.log(`Setting refresh interval to ${seconds} seconds`);
    setRefreshInterval(seconds);
  };

  // Handle manual refresh button click
  const handleManualRefresh = () => {
    console.log('Manual refresh requested');
    setIsLoading(true);
    
    // Clear any existing errors
    setError(null);
    
    // Reload market data
    loadMarketData(symbol, timeframe, false).then(() => {
      setLastUpdateTime(new Date());
      console.log('Manual refresh completed');
    }).catch((err) => {
      console.error('Error during manual refresh:', err);
      setError('Failed to refresh data. Please try again.');
    });
  };

  // Load market data from API or generate demo data
  const loadMarketData = async (symbol: string, timeframe: string = '1D', isAutoRefresh = false) => {
    if (!isAutoRefresh) {
      setError(null);
    }
    setIsLoading(true);
    
    try {
      console.log(`[BROKERAGE] Loading market data for ${symbol} (${timeframe})`);
      const polygonService = PolygonService.getInstance();
      
      // Get latest price
      console.log(`[BROKERAGE] Calling polygonService.getLatestPrice for ${symbol}`);
      const price = await polygonService.getLatestPrice(symbol);
      console.log(`[BROKERAGE] Received latest price for ${symbol}:`, price);
      
      if (price !== null) {
        setCurrentPrice(price);
        console.log(`[BROKERAGE] State updated with latest price: ${price}`);
      } else {
        console.error('[BROKERAGE] Failed to get latest price, using simulated data');
        if (!isAutoRefresh) {
          setError('Failed to get latest price. Using demo data.');
        }
        setCurrentPrice(generateSimulatedPrice(symbol));
      }
      
      // Get candle data
      const endDate = new Date();
      const startDate = new Date();
      
      // Adjust start date based on timeframe
      switch(timeframe) {
        case '1D':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '1W':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '1M':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case '3M':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'YTD':
          startDate.setMonth(0);
          startDate.setDate(1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 3);
      }
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      console.log(`Fetching candles from ${formattedStartDate} to ${formattedEndDate}`);
      const rawCandleData = await polygonService.getStockCandles(
        symbol,
        formattedStartDate,
        formattedEndDate
      );
      
      if (rawCandleData && rawCandleData.length > 0) {
        console.log(`Received ${rawCandleData.length} candles for ${symbol}`);
        
        // Convert PolygonCandle to CandleData format
        const formattedCandleData: CandleData[] = rawCandleData.map((candle: PolygonCandle) => ({
          timestamp: candle.t,
          open: candle.o,
          high: candle.h,
          low: candle.l,
          close: candle.c,
          volume: candle.v
        }));
        
        setCandleData(formattedCandleData);
      } else {
        console.error('No candle data returned, using demo data');
        
        if (!isAutoRefresh) {
          if (!isApiKeyValid) {
            setError('Using demo data - API key not configured');
          } else {
            setError('Failed to load chart data. Using demo data.');
          }
        }
        
        // Generate demo candle data
        setCandleData(generateDemoCandleData(symbol, startDate, endDate));
      }
    } catch (error: any) {
      console.error('[BROKERAGE] Error in loadMarketData:', error);
      if (!isAutoRefresh) {
        setError(`Error: ${error.message || 'Failed to load market data'}. Using demo data.`);
      }
      
      // Generate demo data if real data fails
      setCurrentPrice(generateSimulatedPrice(symbol));
      setCandleData(generateDemoCandleData(symbol));
    } finally {
      setIsLoading(false);
      setLastUpdateTime(new Date());
    }
  };

  // Generate a simulated price for a symbol
  const generateSimulatedPrice = (symbol: string): number => {
    // Base prices for common stocks
    const basePrices: Record<string, number> = {
      'AAPL': 175.23,
      'MSFT': 420.45,
      'GOOGL': 162.87,
      'AMZN': 183.92,
      'TSLA': 172.63,
      'NVDA': 930.12,
      'META': 475.81,
      'JPM': 182.45,
      'V': 278.32,
      'WMT': 62.15,
      'JNJ': 152.78,
      'PG': 165.92,
      'UNH': 526.38,
      'XOM': 113.55,
      'HD': 342.80
    };
    
    // Use the base price or generate a random one if symbol not found
    const basePrice = basePrices[symbol] || 100 + Math.random() * 200;
    
    // Add a small random variation
    return parseFloat((basePrice + (Math.random() * 4 - 2)).toFixed(2));
  };

  // Generate realistic demo candle data
  const generateDemoCandleData = (symbol: string, startDate?: Date, endDate?: Date): CandleData[] => {
    const candles: CandleData[] = [];
    const basePrice = generateSimulatedPrice(symbol);
    const now = endDate || new Date();
    const start = startDate || new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000)); // Default to 60 days
    
    // Calculate number of days between dates
    const dayDiff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const numCandles = Math.max(20, dayDiff);
    
    // Generate candles
    let prevClose = basePrice;
    for (let i = numCandles; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Simulate realistic price movement based on previous close
      // Use a random walk with momentum and mean reversion
      const dailyVolatility = basePrice * 0.02; // 2% daily volatility
      const meanReversionFactor = 0.3; // Pull toward basePrice
      const momentumFactor = 0.2; // Continue previous direction
      const randomFactor = Math.random() * 2 - 1; // Random component
      
      // Calculate today's movement
      const distanceFromBase = prevClose - basePrice;
      const meanReversion = -meanReversionFactor * distanceFromBase / basePrice;
      const dailyChange = dailyVolatility * (randomFactor + meanReversion);
      
      // Generate OHLC values
      const open = prevClose;
      const direction = Math.random() > 0.5 ? 1 : -1;
      const range = dailyVolatility * (0.5 + Math.random() * 0.5);
      const high = Math.max(open, open + dailyChange) + (range * 0.5);
      const low = Math.min(open, open + dailyChange) - (range * 0.5);
      const close = open + dailyChange;
      
      // Update prevClose for next iteration
      prevClose = close;
      
      candles.push({
        timestamp: date.getTime(),
        open,
        high,
        low,
        close,
        volume: Math.floor(1000000 + Math.random() * 9000000)
      });
    }
    
    return candles;
  };

  // Handle manual order submission
  const handleManualOrder = (order: Omit<ManualOrder, 'id' | 'timestamp' | 'status' | 'price'>) => {
    console.log('Submitting manual order:', order);
    
    const newOrderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    // Generate a new order with timestamp and ID, initially 'open'
    const newOrder: ManualOrder = {
      ...order,
      id: newOrderId,
      timestamp: now,
      status: 'open',
      price: currentPrice, // Use current market price for simulation
    };

    // Add the 'open' order immediately to state
    setManualOrders(prevOrders => [...prevOrders, newOrder]);
    
    // Simulate order filling after a delay
    const fillDelay = 1500; // 1.5 seconds
    setTimeout(() => {
      setManualOrders(prevOrders => 
        prevOrders.map(ord => 
          ord.id === newOrderId 
            ? { ...ord, status: 'filled', timestamp: Date.now() } // Update status and timestamp
            : ord
        )
      );
      console.log(`Simulated filling order: ${newOrderId}`);
      // Optionally trigger a notification for filled order here
    }, fillDelay);
    
    // Show a toast or notification for submission here (optional)
    console.log(`Order ${newOrderId} submitted with status 'open'.`);
    
    return newOrder; // Return the initially submitted order object
  };

  // Calculate the total value of owned shares
  const calculatePortfolioValue = () => {
    let portfolioValue = 0;
    
    // Add value from filled buy orders
    const filledBuys = manualOrders.filter(order => order.status === 'filled' && order.type === 'buy');
    const filledSells = manualOrders.filter(order => order.status === 'filled' && order.type === 'sell');
    
    for (const order of filledBuys) {
      if (order.symbol === symbol) {
        portfolioValue += order.quantity * currentPrice;
      }
    }
    
    // Subtract value from filled sell orders
    for (const order of filledSells) {
      if (order.symbol === symbol) {
        portfolioValue -= order.quantity * currentPrice;
      }
    }
    
    return portfolioValue;
  };

  // Format the last update time
  const formatLastUpdate = () => {
    return lastUpdateTime.toLocaleTimeString();
  };

  // Handle copying a trade from a Congress member
  const handleCopyCongressTrade = (trade: CongressTrade) => {
    // Add to copied trades list
    setCopiedCongressTrades(prev => [...prev, trade]);
    
    // Create a corresponding manual order
    const newOrder: Omit<ManualOrder, 'id' | 'timestamp' | 'status' | 'price'> = {
      symbol: trade.symbol,
      type: trade.type.toLowerCase() as 'buy' | 'sell',
      quantity: calculateQuantityFromAmount(trade.amount),
    };
    
    // Submit the order
    handleManualOrder(newOrder);
  };
  
  // Helper to estimate quantity based on amount range
  const calculateQuantityFromAmount = (amountRange: string): number => {
    // Parse amount range like "1,000,000-5,000,000"
    const amounts = amountRange.split('-').map(a => 
      parseInt(a.replace(/[^0-9]/g, ''))
    );
    
    // Use the lower end of the range and divide by current price to get shares
    const estimatedAmount = amounts[0] || 100000;
    const price = currentPrice || generateSimulatedPrice(symbol);
    
    // Calculate quantity (minimum 1 share)
    return Math.max(1, Math.floor(estimatedAmount / price));
  };

  // Handle copying a business insider trade
  const handleCopyInsiderTrade = (trade: InsiderTrade) => {
    // Add to copied trades list
    setCopiedInsiderTrades(prev => [...prev, trade]);
    
    // Create a corresponding manual order
    const newOrder: Omit<ManualOrder, 'id' | 'timestamp' | 'status' | 'price'> = {
      symbol: trade.symbol,
      type: trade.type.toLowerCase() as 'buy' | 'sell',
      quantity: trade.shares,
    };
    
    // Submit the order
    handleManualOrder(newOrder);
  };

  return (
    <div className="flex flex-col">
      {/* Header section */}
      <div className="mb-4 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Trading Dashboard</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-full sm:w-64">
              <SymbolSearch
                onSymbolSelect={handleSymbolChange}
                defaultSymbol={symbol}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['1D', '1W', '1M', '3M', 'YTD'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => handleTimeframeChange(tf)}
                  className={`px-3 py-1 text-sm rounded ${
                    timeframe === tf
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {currentPrice > 0 && (
            <div className="text-xl font-semibold bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
              ${currentPrice.toFixed(2)}
            </div>
          )}
          <button 
            onClick={handleManualRefresh}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4">
          <AlertMessage
            type="warning"
            message={error}
            onDismiss={() => setError(null)}
          />
        </div>
      )}

      {/* Last updated indicator */}
      <div className="mb-2 text-right text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center text-xs text-gray-500 space-x-2">
          <button
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="p-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded flex items-center text-gray-800 dark:text-gray-300 disabled:opacity-50"
            title="Refresh data"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <span>
            Last updated: {formatLastUpdate()} (refreshes every {refreshInterval}s)
          </span>
        </div>
        <div className="inline-flex ml-2">
          <button 
            onClick={() => handleRefreshIntervalChange(30)}
            className={`px-1 text-xs rounded-l ${refreshInterval === 30 ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
          >
            30s
          </button>
          <button 
            onClick={() => handleRefreshIntervalChange(60)}
            className={`px-1 text-xs ${refreshInterval === 60 ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
          >
            1m
          </button>
          <button 
            onClick={() => handleRefreshIntervalChange(300)}
            className={`px-1 text-xs rounded-r ${refreshInterval === 300 ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
          >
            5m
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chart area - 2/3 width on larger screens */}
        <div className="md:col-span-2 bg-white dark:bg-zinc-800 rounded-lg shadow p-4 flex flex-col">
          <div className="flex-grow h-full w-full min-h-[400px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : candleData.length > 0 ? (
              <TradingChart
                symbol={symbol}
                data={candleData}
                currentPrice={currentPrice}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No data available</p>
              </div>
            )}
          </div>
          
          {/* Portfolio value - Ensure this doesn't take space away from chart */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Portfolio Value ({symbol})
              </div>
              <div className="text-lg font-semibold">
                ${calculatePortfolioValue().toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar - 1/3 width */}
        <div className="space-y-4">
          {/* Order entry */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
            <OrderEntryPanel
              symbol={symbol}
              currentPrice={currentPrice}
              onOrderSubmit={handleManualOrder}
            />
          </div>

          {/* Trading tools with tabs */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow">
            {/* Tab navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                className={`px-3 py-2 text-sm font-medium ${
                  activeTab === 'ai' 
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('ai')}
              >
                AI Trading
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium ${
                  activeTab === 'congress' 
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('congress')}
              >
                Congress
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium ${
                  activeTab === 'insiders' 
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('insiders')}
              >
                Insiders
              </button>
            </div>
            
            {/* Tab content */}
            <div className="p-4">
              {activeTab === 'ai' ? (
                <TradingInterface 
                  currentSymbol={symbol}
                  onSymbolChange={handleSymbolChange}
                  positions={aiPositions}
                  onNewAIPosition={(newPos) => setAiPositions(prev => [...prev, newPos])}
                  onClosePosition={(posId) => setAiPositions(prev => prev.filter(p => p.id !== posId))}
                />
              ) : activeTab === 'congress' ? (
                <CongressTradingPanel 
                  symbol={symbol} 
                  onCopyTrade={handleCopyCongressTrade} 
                />
              ) : (
                <BusinessInsiderTradingPanel 
                  symbol={symbol} 
                  onCopyTrade={handleCopyInsiderTrade} 
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Order book */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
          <OrderBook orders={manualOrders.filter(order => order.status === 'open')} />
        </div>

        {/* Trade history */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
          <TradeHistory orders={manualOrders.filter(order => order.status === 'filled')} />
        </div>
      </div>
    </div>
  );
}
