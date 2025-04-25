'use client'

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PolygonService } from '../../lib/market-data/PolygonService';
import MarketSummary from '../components/indicators/MarketSummary';
import SymbolSearch from '../../components/brokerage/SymbolSearch';
import OrderBook from '../../components/brokerage/OrderBook';
import TradeHistory from '../../components/brokerage/TradeHistory';
import OrderEntryPanel from '../../components/brokerage/OrderEntryPanel';
import AITradingPanel from '../../components/brokerage/AITradingPanel';
import AlertMessage from '../../components/dashboard/AlertMessage';

// Dynamically load the TradingChart with SSR disabled to avoid hydration issues
const TradingChart = dynamic(() => import('../../components/dashboard/TradingChart'), { ssr: false });

// Define interface for candle data
export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  close: number;
  low: number;
  volume: number;
}

// Define interface for manual orders
export interface ManualOrder {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  status: 'open' | 'filled' | 'canceled';
  timestamp: number;
}

// Define interface for AI positions
export interface AIPosition {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  entryTimestamp: number;
  exitTimestamp?: number;
  profit?: number;
  status: 'open' | 'closed';
  reason: string;
}

export default function BrokeragePage() {
  const [symbol, setSymbol] = useState<string>('AAPL');
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<string>('1D');
  const [manualOrders, setManualOrders] = useState<ManualOrder[]>([]);
  const [aiPositions, setAiPositions] = useState<AIPosition[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  
  // Initialize page and load market data
  useEffect(() => {
    console.log('Brokerage page initialized');
    loadMarketData();
    
    // Load market data every minute
    const interval = setInterval(loadMarketData, 60000);
    return () => clearInterval(interval);
  }, [symbol, timeframe]);
  
  // Load market data for the selected symbol and timeframe
  const loadMarketData = async () => {
    if (!symbol) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading market data for ${symbol} with timeframe ${timeframe}`);
      const polygonService = new PolygonService();
      
      // Get latest price
      const priceData = await polygonService.getLatestPrice(symbol);
      if (priceData !== null) {
        setCurrentPrice(priceData.price);
      }
      
      // Get candle data
      const candles = await polygonService.getStockCandles(symbol, timeframe);
      if (candles && candles.length > 0) {
        setCandleData(candles);
        console.log(`Loaded ${candles.length} candles for ${symbol}`);
      } else {
        console.warn('No candle data returned');
        setError('No data available for this symbol and timeframe');
      }
    } catch (err: any) {
      console.error('Error loading market data:', err);
      setError(`Failed to load market data: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle symbol change
  const handleSymbolChange = (newSymbol: string) => {
    setSymbol(newSymbol);
    setError(null);
  };
  
  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    setError(null);
  };
  
  // Handle manual order submission
  const handleManualOrder = (order: Omit<ManualOrder, 'id' | 'timestamp' | 'status' | 'price'>) => {
    const newOrder: ManualOrder = {
      ...order,
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'open',
      price: currentPrice, // Use current price for the order
    };
    
    setManualOrders([newOrder, ...manualOrders]);
    return newOrder;
  };
  
  // Handle AI position
  const handleAIPosition = (position: Omit<AIPosition, 'id' | 'entryTimestamp' | 'entryPrice'>) => {
    const newPosition: AIPosition = {
      ...position,
      id: `position-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryTimestamp: Date.now(),
      entryPrice: currentPrice,
      status: 'open',
    };
    
    setAiPositions([newPosition, ...aiPositions]);
    return newPosition;
  };
  
  // Close AI position
  const closeAIPosition = (positionId: string, reason: string) => {
    setAiPositions(
      aiPositions.map(pos => 
        pos.id === positionId
          ? {
              ...pos,
              exitPrice: currentPrice,
              exitTimestamp: Date.now(),
              status: 'closed',
              profit: pos.type === 'buy'
                ? (currentPrice - pos.entryPrice) * pos.quantity
                : (pos.entryPrice - currentPrice) * pos.quantity,
              reason: reason
            }
          : pos
      )
    );
  };
  
  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <SymbolSearch currentSymbol={symbol} onSymbolChange={handleSymbolChange} />
      </div>
      
      <MarketSummary symbol={symbol} />
      
      {error && (
        <AlertMessage 
          type="error"
          title="Data Loading Error"
          message={error}
          className="mb-6"
        />
      )}
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{symbol} Chart</h2>
              <div className="flex space-x-2">
                {['1D', '1W', '1M', '3M', '1Y'].map(tf => (
                  <button
                    key={tf}
                    className={`px-3 py-1 rounded-md ${timeframe === tf ? 'bg-blue-600' : 'bg-gray-800'}`}
                    onClick={() => handleTimeframeChange(tf)}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-[400px] w-full">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <TradingChart 
                  data={candleData} 
                  symbol={symbol} 
                  currentPrice={currentPrice}
                />
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <OrderBook symbol={symbol} />
            <TradeHistory symbol={symbol} />
          </div>
        </div>
        
        <div>
          <div className="mb-6">
            <OrderEntryPanel 
              symbol={symbol} 
              currentPrice={currentPrice} 
              onOrderSubmit={handleManualOrder}
            />
          </div>
          
          <div>
            <AITradingPanel 
              symbol={symbol}
              currentPrice={currentPrice}
              onPositionOpen={handleAIPosition}
              onPositionClose={closeAIPosition}
              activePositions={aiPositions.filter(p => p.status === 'open')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
