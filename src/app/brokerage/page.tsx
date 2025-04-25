'use client'

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PolygonService, PolygonCandle } from '../../lib/market-data/PolygonService';
import TradingChart from '../../components/dashboard/TradingChart';
import AlertMessage from '../../components/dashboard/AlertMessage';

// Dynamically import components with SSR disabled to avoid hydration issues
const OrderEntryPanel = dynamic(() => import('../../components/brokerage/OrderEntryPanel'), { ssr: false });
const OrderBook = dynamic(() => import('../../components/brokerage/OrderBook'), { ssr: false });
const TradeHistory = dynamic(() => import('../../components/brokerage/TradeHistory'), { ssr: false });
const AITradingPanel = dynamic(() => import('../../components/brokerage/AITradingPanel'), { ssr: false });
const SymbolSearch = dynamic(() => import('../../components/brokerage/SymbolSearch'), { ssr: false });

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

export default function BrokeragePage() {
  const [symbol, setSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1D');
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [manualOrders, setManualOrders] = useState<ManualOrder[]>([]);
  const [aiPositions, setAiPositions] = useState<AIPosition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Brokerage page initialized');
    
    // Initial load
    if (symbol) {
      loadMarketData(symbol, timeframe);
    }

    // Add some sample orders and positions for demo
    setManualOrders([
      {
        id: '1',
        symbol: 'AAPL',
        type: 'buy',
        quantity: 10,
        price: 175.23,
        timestamp: Date.now() - 3600000,
        status: 'filled'
      },
      {
        id: '2',
        symbol: 'AAPL',
        type: 'sell',
        quantity: 5,
        price: 178.45,
        timestamp: Date.now() - 1800000,
        status: 'open'
      }
    ]);

    setAiPositions([
      {
        id: '1',
        symbol: 'AAPL',
        entryPrice: 170.45,
        quantity: 15,
        entryTime: Date.now() - 86400000,
        status: 'open',
        strategy: 'Momentum'
      }
    ]);
  }, []);

  const handleSymbolChange = (newSymbol: string) => {
    setSymbol(newSymbol);
    setIsLoading(true);
    loadMarketData(newSymbol, timeframe);
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    setIsLoading(true);
    loadMarketData(symbol, newTimeframe);
  };

  const loadMarketData = async (symbol: string, timeframe: string = '1D') => {
    setError(null);
    setIsLoading(true);
    
    try {
      console.log(`Loading market data for ${symbol} with timeframe ${timeframe}`);
      const polygonService = PolygonService.getInstance();
      
      // Get latest price
      const price = await polygonService.getLatestPrice(symbol);
      if (price !== null) {
        setCurrentPrice(price);
      } else {
        console.error('Failed to get latest price');
        setError('Failed to get latest price');
      }
      
      // Get candle data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3); // 3 months of data
      
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
        console.error('No candle data returned');
        setError('Failed to load chart data');
      }
    } catch (error: any) {
      console.error('Error loading market data:', error);
      setError(`Error: ${error.message || 'Failed to load market data'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualOrder = (order: Omit<ManualOrder, 'id' | 'timestamp' | 'status' | 'price'>) => {
    // Generate a new order with timestamp and ID
    const newOrder: ManualOrder = {
      ...order,
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'open',
      price: currentPrice,
    };

    setManualOrders(prevOrders => [...prevOrders, newOrder]);
    return newOrder;
  };

  return (
    <div className="flex flex-col">
      {/* Header section */}
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold mb-2">Trading Dashboard</h1>
          <div className="flex items-center gap-4">
            <div>
              <SymbolSearch
                onSymbolSelect={handleSymbolChange}
                defaultSymbol={symbol}
              />
            </div>
            <div className="flex gap-2">
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
            {currentPrice > 0 && (
              <div className="text-lg font-semibold">
                ${currentPrice.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4">
          <AlertMessage
            type="error"
            message={error}
            onDismiss={() => setError(null)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chart area - 2/3 width on larger screens */}
        <div className="md:col-span-2 bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
          <div className="h-[500px] w-full">
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

          {/* AI Trading Panel */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
            <AITradingPanel symbol={symbol} positions={aiPositions} />
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Order book */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
          <OrderBook orders={manualOrders} />
        </div>

        {/* Trade history */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
          <TradeHistory orders={manualOrders.filter(order => order.status === 'filled')} />
        </div>
      </div>
    </div>
  );
}
