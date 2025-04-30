'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { PolygonService, PolygonCandle } from '../../lib/market-data/PolygonService';
import TradingChart from '../../components/dashboard/TradingChart';
import CongressTradingPanel from '../../components/brokerage/CongressTradingPanel';
import BusinessInsiderTradingPanel from '../../components/brokerage/BusinessInsiderTradingPanel';
import TradingInterface from '../../components/dashboard/TradingInterface';
import PaperTradingPanel from '../../components/brokerage/PaperTradingPanel';
import { Settings } from 'lucide-react'; // Using Settings icon for Indicators button
import IndicatorModal from '@/components/brokerage/IndicatorModal'; // Import the new modal
import { calculateSMA, calculateEMA, calculateRSI, calculateMACD, calculateStochastic, calculateATR, calculateADX, calculateOBV, calculateParabolicSAR, calculatePivotPoints, calculateIchimokuCloud } from '@/lib/trading-engine/indicators'; // Import indicators
import { calculateAITrendPrediction, calculateNeuralOscillator, calculateAdaptiveMA } from '@/lib/trading-engine/ml-indicators';
import { LineData, Time, HistogramData, CandlestickData } from 'lightweight-charts'; // Import types for chart data
// Comment out toast since it's not available
// import { toast } from 'react-toastify'; // Import toast for notifications
import { usePersistentStore } from '@/hooks/usePersistentStore'; // Import persistent store
import { v4 as uuidv4 } from 'uuid';
import { AIPosition } from '@/lib/trading-engine/types'; // Import AIPosition from types

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
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputTimeout = useRef<NodeJS.Timeout | null>(null);

  // Update selected symbol whenever the parent component passes a new value
  useEffect(() => {
    if (defaultSymbol) {
      setSelectedSymbol(defaultSymbol);
    }
  }, [defaultSymbol]); // This ensures the displayed symbol stays in sync with parent state

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced API search function
  const fetchSearchResults = useCallback(async (query: string) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(`/api/search-tickers?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      const results = await response.json();
      setSearchResults(results || []);
    } catch (error) {
      console.error('Error searching symbols:', error);
      setSearchResults([]); // Clear results on error
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle input change with debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    setIsOpen(true);
    
    if (inputTimeout.current) {
      clearTimeout(inputTimeout.current);
    }
    
    // Only start searching if query is not empty
    if (query.trim()) {
       setIsSearching(true); // Show searching indicator immediately
       inputTimeout.current = setTimeout(() => {
         fetchSearchResults(query);
       }, 300); // 300ms debounce
    } else {
      setSearchResults([]); // Clear results if query is empty
      setIsSearching(false);
    }
  };

  // Handle selecting a symbol from results
  const handleSelect = (symbol: string, name: string) => {
    console.log(`Selected symbol: ${symbol}`);
    setSelectedSymbol(symbol);
    setSearchTerm(''); // Clear search term
    setSearchResults([]); // Clear results
    setIsOpen(false);
    onSymbolSelect(symbol); // Notify parent
  };

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
          placeholder={`Current: ${selectedSymbol}. Search symbols...`}
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
            {isSearching ? (
              <div className="text-center py-2 text-gray-500 dark:text-gray-400">Searching...</div>
            ) : searchTerm && searchResults.length === 0 ? (
              <div className="text-center py-2 text-gray-500 dark:text-gray-400">No matching symbols found</div>
            ) : (
              <div className="space-y-1">
                {searchResults.map(item => (
                  <div
                    key={item.symbol}
                    className={`flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded`}
                    onClick={() => handleSelect(item.symbol, item.name)}
                  >
                    <div className="font-medium">{item.symbol}</div>
                    <div className="ml-2 text-sm text-gray-500 dark:text-gray-400 truncate" title={item.name}>{item.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        Currently viewing: <span className="font-semibold">{selectedSymbol}</span>
      </div>
    </div>
  );
};

// Dynamically import remaining components with SSR disabled to avoid hydration issues
const OrderEntryPanel = dynamic(() => import('../../components/brokerage/OrderEntryPanel'), { ssr: false });
const OrderBook = dynamic(() => import('../../components/brokerage/OrderBook'), { ssr: false });
const TradeHistory = dynamic(() => import('../../components/brokerage/TradeHistory'), { ssr: false });

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

// Define structure for active indicator configuration
export interface ActiveIndicator {
  id: string; 
  type: 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'Stochastic' | 'ATR' | 'ADX' | 'OBV' | 'Parabolic SAR' | 'Pivot Points' | 'Ichimoku Cloud' | 'AI Trend Prediction' | 'Neural Oscillator' | 'Adaptive MA'; 
  period?: number;
  // MACD specific
  fastPeriod?: number;
  slowPeriod?: number;
  signalPeriod?: number;
  showSignal?: boolean; // Flag to show MACD Signal line
  showHistogram?: boolean; // Flag to show MACD Histogram
  // Stochastic specific
  kPeriod?: number;
  dPeriod?: number;
  showK?: boolean; // Flag to show %K line
  showD?: boolean; // Flag to show %D line
  // ADX specific
  showDI?: boolean; // Flag to show +DI and -DI lines
  // Parabolic SAR specific
  initialAcceleration?: number;
  maxAcceleration?: number;
  // Pivot Points specific
  pivotType?: 'daily' | 'weekly' | 'monthly';
  showR1?: boolean;
  showR2?: boolean;
  showR3?: boolean;
  showS1?: boolean;
  showS2?: boolean;
  showS3?: boolean;
  // Ichimoku Cloud specific
  tenkanPeriod?: number;
  kijunPeriod?: number;
  senkouBPeriod?: number;
  displacement?: number;
  showTenkan?: boolean;
  showKijun?: boolean;
  showCloud?: boolean;
  showChikou?: boolean;
  // ML-specific parameters
  // AI Trend Prediction
  lookbackPeriod?: number;
  forecastPeriod?: number;
  showPredictionLine?: boolean;
  showForecast?: boolean;
  // Neural Oscillator
  threshold?: number;
  showOverbought?: boolean;
  showOversold?: boolean;
  // Adaptive MA
  minPeriod?: number;
  maxPeriod?: number;
  volatilityWindow?: number;
  showPeriodIndicator?: boolean;
  // BBands specific (add later)
  stdDevMultiplier?: number;
  color?: string; // Add color property
  isVisible?: boolean; // Add visibility property
}

// Add type for indicator data to be passed to chart
export interface IndicatorData {
  id: string;        
  type: string; // Use string type to accept all indicator types and subtypes 
  data: LineData[] | HistogramData[]; // Allow HistogramData for histogram
  color?: string;    
  period?: number;   
  // Optional flags for display hints
  isSignalLine?: boolean; 
  isHistogram?: boolean;
  pane?: number; // To plot histogram on a separate pane (e.g., 1)
}

// Let's define and export ManualOrder at the beginning before the component
export interface ManualOrder {
  id: string;
  symbol: string;
  action: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  quantity: number;
  price?: number;
  status: 'open' | 'filled' | 'cancelled';
  timestamp: string;
  expiryDate?: string;
  notes?: string;
}

// Also define CandleData if needed
export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export default function BrokeragePage() {
  // Use values from the persistent store
  const {
    selectedSymbol,
    timeframe: storedTimeframe,
    candleInterval: storedCandleInterval,
    activeIndicators: storedIndicators,
    activeTab: storedActiveTab,
    refreshInterval: storedRefreshInterval,
    manualOrders: storedManualOrders,
    aiPositions: storedPositions,
    setSymbol,
    setTimeframe,
    setCandleInterval,
    setActiveIndicators,
    setActiveTab,
    setRefreshInterval,
    addManualOrder,
    updateManualOrder,
    addAIPosition: addPositionToStore,
    updateAIPosition: updatePositionInStore,
    closeAIPosition
  } = usePersistentStore();

  // Local state for UI and processing
  const [symbol, setLocalSymbol] = useState<string>(selectedSymbol || 'AAPL');
  const [timeframe, setLocalTimeframe] = useState<string>(storedTimeframe || '1D');
  const [candleInterval, setLocalCandleInterval] = useState<string>(storedCandleInterval || 'day');
  const [activeIndicators, setLocalActiveIndicators] = useState<ActiveIndicator[]>(storedIndicators || []);
  const [activeTab, setLocalActiveTab] = useState<'ai' | 'congress' | 'insiders' | 'paper'>(storedActiveTab || 'ai');
  const [refreshInterval, setLocalRefreshInterval] = useState<number>(storedRefreshInterval || 60);
  const [manualOrders, setLocalManualOrders] = useState<ManualOrder[]>(storedManualOrders || []);
  const [positions, setLocalPositions] = useState<AIPosition[]>(storedPositions || []);

  // State for stock data
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const ws = useRef<WebSocket | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
  
  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean>(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [indicatorChartData, setIndicatorChartData] = useState<IndicatorData[]>([]);
  
  // Initialize sample data only if none exists in the store
  useEffect(() => {
    if (manualOrders.length === 0) {
      initializeSampleOrders();
    }
  }, [manualOrders]);

  // Sync local state with persistent store
  useEffect(() => {
    if (symbol !== selectedSymbol) {
      setSymbol(symbol);
    }
  }, [symbol, selectedSymbol, setSymbol]);

  useEffect(() => {
    if (timeframe !== storedTimeframe) {
      setTimeframe(timeframe);
    }
  }, [timeframe, storedTimeframe, setTimeframe]);

  useEffect(() => {
    if (candleInterval !== storedCandleInterval) {
      setCandleInterval(candleInterval);
    }
  }, [candleInterval, storedCandleInterval, setCandleInterval]);

  useEffect(() => {
    if (JSON.stringify(activeIndicators) !== JSON.stringify(storedIndicators)) {
      setActiveIndicators(activeIndicators);
    }
  }, [activeIndicators, storedIndicators, setActiveIndicators]);

  useEffect(() => {
    if (activeTab !== storedActiveTab) {
      setActiveTab(activeTab);
    }
  }, [activeTab, storedActiveTab, setActiveTab]);

  useEffect(() => {
    if (refreshInterval !== storedRefreshInterval) {
      setRefreshInterval(refreshInterval);
    }
  }, [refreshInterval, storedRefreshInterval, setRefreshInterval]);

  // WebSocket Connection Logic
  useEffect(() => {
    // Don't connect if API key is invalid or missing
    if (!isApiKeyValid || !apiKey) {
      console.warn('[WS] Skipping WebSocket connection due to invalid/missing API key.');
      return;
    }
    
    // Close existing connection if symbol changes or component unmounts
    if (ws.current) {
        console.log(`[WS] Closing previous connection for symbol change or unmount.`);
        ws.current.close();
    }

    // Create new WebSocket connection
    ws.current = new WebSocket('wss://socket.polygon.io/stocks');
    console.log(`[WS] Attempting to connect for symbol: ${symbol}`);

    ws.current.onopen = () => {
      console.log('[WS] Connection opened.');
      // Authenticate
      ws.current?.send(JSON.stringify({ action: 'auth', params: apiKey }));
      console.log('[WS] Authentication message sent.');
      
      // Add a small delay before subscribing to ensure auth is processed
      setTimeout(() => {
        // Subscribe to trades for the current symbol
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ action: 'subscribe', params: `T.${symbol}` }));
          console.log(`[WS] Subscribed to trades for ${symbol}`);
        } else {
          console.error('[WS] WebSocket not open when trying to subscribe');
        }
      }, 500);
    };

    ws.current.onmessage = (event) => {
      try {
        const messages = JSON.parse(event.data);
        console.log('[WS] Received message:', messages);
        
        // Polygon sends messages in an array
        if (Array.isArray(messages)) {
          messages.forEach(message => {
            // Check for auth messages
            if (message.ev === 'status' && message.status === 'auth_success') {
              console.log('[WS] Successfully authenticated with Polygon.io');
            }
            
            // Check for subscription acknowledgments
            if (message.ev === 'status' && message.status === 'success' && message.message.includes('subscribed')) {
              console.log(`[WS] ${message.message}`);
            }
            
            // Check if it's a trade event ('T')
            if (message.ev === 'T') {
              console.log(`[WS] Trade received for ${message.sym}: $${message.p}`);
              // Update current price state if the symbol matches
              if (message.sym === symbol) {
                setCurrentPrice(message.p);
              }
            }
             // Handle other message types if needed (e.g., status messages)
             else if (message.ev === 'status') {
                 console.log(`[WS] Status message: ${message.message}`);
             }
          });
        }
      } catch (error) {
        console.error('[WS] Error parsing message:', error);
      }
    };

    ws.current.onerror = (error) => {
      console.error('[WS] WebSocket error:', error);
      setError('WebSocket connection error.'); // Optionally update UI error state
    };

    ws.current.onclose = (event) => {
      console.log(`[WS] Connection closed. Code: ${event.code}, Reason: ${event.reason}`);
      // Attempt to reconnect on connection close if not intentional
      if (event.code !== 1000) { // 1000 is normal closure
        console.log('[WS] Attempting to reconnect...');
        setTimeout(() => {
          if (isApiKeyValid && apiKey) {
            console.log('[WS] Reconnecting to WebSocket...');
            // The component will rerun this effect
          }
        }, 5000); // Try to reconnect after 5 seconds
      }
    };

    // Cleanup function: close the connection when the component unmounts or symbol changes
    return () => {
      if (ws.current) {
        console.log('[WS] Closing connection on cleanup.');
        ws.current.close();
        ws.current = null;
      }
    };

  }, [symbol, isApiKeyValid, apiKey]); // Re-run effect if symbol or API key validity changes

  // Load initial data when page loads
  useEffect(() => {
    console.log('Brokerage page initialized with persistent state');
    
    // First, check if API key is configured
    verifyApiKey();
    
    // Initial load
    if (symbol) {
      loadMarketData(symbol, timeframe, candleInterval);
    }
    
    // Start auto-refresh timer
    const interval = setInterval(() => {
      if (symbol) {
        console.log(`Auto-refreshing data for ${symbol}`);
        loadMarketData(symbol, timeframe, candleInterval, true);
        setLastUpdateTime(new Date());
      }
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [refreshInterval, timeframe, candleInterval]);

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

  // Handle manual refresh button click
  const handleManualRefresh = () => {
    console.log('Manual refresh requested');
    setIsLoading(true);
    
    // Clear any existing errors
    setError(null);
    
    // Reload market data
    loadMarketData(symbol, timeframe, candleInterval, false).then(() => {
      setLastUpdateTime(new Date());
      console.log('Manual refresh completed');
    }).catch((err) => {
      console.error('Error during manual refresh:', err);
      setError('Failed to refresh data. Please try again.');
    });
  };

  // Modify the useEffect that loads data on component mount to use only the existing state variables
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load active indicators
      const savedIndicators = localStorage.getItem('activeIndicators');
      if (savedIndicators) {
        try {
          const parsedIndicators = JSON.parse(savedIndicators);
          setActiveIndicators(parsedIndicators);
        } catch (e) {
          console.error('Failed to parse saved indicators', e);
        }
      }
      
      // Load positions
      const savedPositions = localStorage.getItem('aiPositions');
      if (savedPositions) {
        try {
          const parsedPositions = JSON.parse(savedPositions);
          setLocalPositions(parsedPositions);
        } catch (e) {
          console.error('Failed to parse saved positions', e);
        }
      }
      
      // Load manual orders
      const savedOrders = localStorage.getItem('manualOrders');
      if (savedOrders) {
        try {
          const parsedOrders = JSON.parse(savedOrders);
          setLocalManualOrders(parsedOrders);
        } catch (e) {
          console.error('Failed to parse saved orders', e);
        }
      }
      
      // Load selected symbol
      const savedSymbol = localStorage.getItem('selectedSymbol');
      if (savedSymbol) {
        setSymbol(savedSymbol);
      }
    }
    
    initializeSampleOrders();
    loadMarketData();
    verifyApiKey();
  }, []);

  // Modify the existing functions to include localStorage persistence
  const addAIPosition = (newPosition: AIPosition) => {
    const positionWithId = {
      ...newPosition,
      id: newPosition.id || `position-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const updatedPositions = [...positions, positionWithId];
    setLocalPositions(updatedPositions);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiPositions', JSON.stringify(updatedPositions));
    }
    
    setSuccessMessage(`Added new ${positionWithId.type} position for ${positionWithId.symbol}`);
  };

  const updateAIPosition = (positionId: string, updates: Partial<AIPosition>) => {
    const updatedPositions = positions.map(pos => 
      pos.id === positionId ? { ...pos, ...updates } : pos
    );
    
    setLocalPositions(updatedPositions);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiPositions', JSON.stringify(updatedPositions));
    }
  };

  const handleManualOrder = (order: ManualOrder) => {
    const orderWithId = {
      ...order,
      id: order.id || `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: order.timestamp || new Date().toISOString()
    };
    
    const updatedOrders = [...manualOrders, orderWithId];
    setLocalManualOrders(updatedOrders);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('manualOrders', JSON.stringify(updatedOrders));
    }
    
    setSuccessMessage(`${orderWithId.action} order placed for ${orderWithId.symbol}`);
  };

  const handleClosePosition = (positionId: string) => {
    const positionToClose = positions.find(pos => pos.id === positionId);
    
    if (!positionToClose) {
      setError(`Position with ID ${positionId} not found`);
      return;
    }
    
    const profit = positionToClose.type === 'buy' 
      ? (currentPrice - positionToClose.entryPrice) * positionToClose.quantity
      : (positionToClose.entryPrice - currentPrice) * positionToClose.quantity;
    
    const updatedPositions = positions.map(pos => 
      pos.id === positionId ? { 
        ...pos, 
        status: 'closed',
        exitPrice: currentPrice,
        closeDate: new Date().toISOString(),
        profit
      } : pos
    );
    
    setLocalPositions(updatedPositions);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiPositions', JSON.stringify(updatedPositions));
    }
    
    setSuccessMessage(`Closed ${positionToClose.type} position for ${positionToClose.symbol} with ${profit > 0 ? 'profit' : 'loss'} of $${Math.abs(profit).toFixed(2)}`);
  };

  const handleIndicatorsChange = (indicators: ActiveIndicator[]) => {
    setActiveIndicators(indicators);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeIndicators', JSON.stringify(indicators));
    }
  };

  // Fix the handleSymbolChange function to avoid conflicting variables
  const handleSymbolChange = async (newSymbol: string) => {
    console.log(`[BROKERAGE] Symbol changed to ${newSymbol}`);
    
    // Update the symbol state
    setSymbol(newSymbol);
    
    // Check if position already exists, create a new one if it doesn't
    const existingPosition = positions.find(p => p.symbol === newSymbol);
    if (!existingPosition) {
      const newPosition = {
        id: `position-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        symbol: newSymbol,
        type: 'buy' as const,
        entryPrice: 0,
        quantity: 0,
        timestamp: new Date().toISOString(),
        status: 'open' as const,
        strategy: 'Manual',
        confidence: 0
      };
      
      const updatedPositions = [...positions, newPosition];
      setLocalPositions(updatedPositions);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('aiPositions', JSON.stringify(updatedPositions));
      }
    }
    
    // Load market data for the new symbol
    await loadMarketData(newSymbol, timeframe, candleInterval);
    
    // Reset state related to the previous symbol
    setIndicatorChartData([]);
    setCurrentPrice(0);
    setError(null);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedSymbol', newSymbol);
    }
  };

  return (
    <div className="flex flex-col p-4 md:p-6">
      {/* Header section */}
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        {/* Left Side: Title & Search */}
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-bold mb-2">Trade Center</h1>
          <div className="w-full sm:w-64">
             <SymbolSearch
                onSymbolSelect={handleSymbolChange}
                defaultSymbol={symbol}
              />
          </div>
        </div>
        {/* Right Side: Controls */}
        <div className="w-full md:w-auto flex flex-col items-end gap-2">
           {/* Top Row: Interval / Price / Refresh / Indicators Button */}
           <div className="flex flex-wrap items-center justify-end gap-2 w-full">
              {/* Interval Buttons */}
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                 {['1m', '5m', '15m', '1h', '1D'].map((intv) => {
                   const intervalMap: {[key: string]: string} = { '1m': 'minute', '5m': 'minute', '15m': 'minute', '1h': 'hour', '1D': 'day' };
                   const apiIntervalValue = intervalMap[intv];
                   const isActive = candleInterval === apiIntervalValue;
                   return (
                      <button
                        key={intv}
                        onClick={() => handleIntervalChange(apiIntervalValue)}
                        className={`px-2 py-1 text-xs font-medium ${
                          isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                        title={`Interval: ${intv}`}
                      >
                        {intv}
                      </button>
                   );
                 })}
               </div>
               {/* Spacer */}
               <div className="flex-grow"></div> 
               {/* Indicators Button */}
               <button
                 onClick={() => setShowIndicatorModal(true)}
                 className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                 title="Indicators"
               >
                   <Settings size={20} />
               </button>
               {/* Price Display */}
               {currentPrice > 0 && (
                 <div className="text-lg font-semibold bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                   ${currentPrice.toFixed(2)}
                 </div>
               )}
               {/* Refresh Button */}
               <button 
                 onClick={handleManualRefresh}
                 className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                 disabled={isLoading}
                 title="Refresh Data"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                 </svg>
               </button>
           </div>
           {/* Bottom Row: Date Range Buttons */}
           <div className="flex gap-1 flex-wrap justify-end">
             {/* Replace 1W with 5D, keep others */}
             {['1D', '5D', '1M', '3M', 'YTD', '1Y', '5Y', 'ALL'].map((tf) => (
               <button
                 key={tf}
                 onClick={() => handleTimeframeChange(tf)}
                 className={`px-2 py-1 text-xs rounded ${
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
            60s
          </button>
          <button 
            onClick={() => handleRefreshIntervalChange(300)}
            className={`px-1 text-xs rounded-r ${refreshInterval === 300 ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
          >
            5m
          </button>
        </div>
      </div>

      {/* Main Content Area (Chart + AI Interface) - Spans 2 columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Main Content Area (Chart + AI Interface) - Spans 2 columns on large screens */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Chart Area */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
            {/* Constrain chart height, e.g., 50% of viewport height */}
            <div className="h-[55vh] w-full">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : candleData.length > 0
                ? <TradingChart
                    symbol={symbol}
                    data={candleData}
                    currentPrice={currentPrice}
                    indicatorData={indicatorChartData}
                  />
                : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">No data available</p>
                  </div>
                )}
            </div>
            {/* Portfolio value (Optional display under chart) */}
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

          {/* Trading Interface Area (Below Chart) */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
            {/* Tab navigation for AI/Congress/Insiders */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                className={`px-3 py-2 text-sm font-medium ${
                  activeTab === 'ai' 
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setLocalActiveTab('ai')}
              >
                AI
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium ${
                  activeTab === 'congress' 
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setLocalActiveTab('congress')}
              >
                Congress
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium ${
                  activeTab === 'insiders'
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setLocalActiveTab('insiders')}
              >
                Business Insider
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium ${
                  activeTab === 'paper'
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setLocalActiveTab('paper')}
              >
                Paper Trading
              </button>
            </div>
            {/* Tab content */}
            <div className="p-4 flex-grow overflow-auto">
              {activeTab === 'ai' && (
                <TradingInterface 
                  currentSymbol={symbol}
                  onSymbolChange={handleSymbolChange}
                  positions={positions}
                  onNewAIPosition={(newPos) => addPositionToStore(newPos)}
                  onClosePosition={(posId) => handleClosePosition(posId)}
                />
              )}
              {activeTab === 'congress' && (
                <CongressTradingPanel 
                  symbol={symbol}
                  onCopyTrade={handleCopyCongressTrade}
                />
              )}
              {activeTab === 'insiders' && (
                <BusinessInsiderTradingPanel 
                  symbol={symbol}
                  onCopyTrade={handleCopyInsiderTrade}
                />
              )}
              {activeTab === 'paper' && (
                <PaperTradingPanel
                  symbol={symbol}
                  positions={positions}
                  onNewPosition={(newPos: AIPosition) => addPositionToStore(newPos)}
                  onUpdatePosition={(posId: string, updatedPosition: Partial<AIPosition>) => {
                    updatePositionInStore(posId, updatedPosition);
                  }}
                  onClosePosition={(posId: string) => handleClosePosition(posId)}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Order entry panel */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 flex-shrink-0">
            <OrderEntryPanel
              symbol={symbol}
              currentPrice={currentPrice}
              onOrderSubmit={handleManualOrder}
            />
          </div>
          {/* Order book */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 flex-grow flex flex-col min-h-0">
            <h3 className="text-lg font-semibold mb-3 flex-shrink-0">Order Book</h3>
            <div className="flex-grow overflow-auto">
              <OrderBook orders={manualOrders.filter(order => order.status === 'open')} />
            </div>
          </div>
          {/* Trade history */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 flex-grow flex flex-col min-h-0">
            <h3 className="text-lg font-semibold mb-3 flex-shrink-0">Trade History</h3>
            <div className="flex-grow overflow-auto">
              <TradeHistory
                orders={manualOrders.filter(order => order.status === 'filled')}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Indicator settings modal */}
      {typeof window !== 'undefined' && (
        <IndicatorModal
          isOpen={showIndicatorModal}
          onClose={() => setShowIndicatorModal(false)}
          activeIndicators={activeIndicators}
          onIndicatorsChange={handleIndicatorsChange}
        />
      )}
      
      {/* Success message toast - Simple implementation */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-md max-w-md z-50">
          <div className="flex justify-between items-center">
            <div className="mr-4">{successMessage}</div>
            <button 
              onClick={() => setSuccessMessage('')}
              className="text-green-700 hover:text-green-900"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}