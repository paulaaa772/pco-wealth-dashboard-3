'use client'

import React, { useState, useEffect } from 'react';
import { PolygonService } from '../../lib/market-data/PolygonService';
import dynamic from 'next/dynamic';
import TradingInterface from '../../components/dashboard/TradingInterface';
import OrderBook from '@/components/brokerage/OrderBook';
import TradeHistory from '@/components/brokerage/TradeHistory';
import OrderEntryPanel from '@/components/brokerage/OrderEntryPanel';
import { Maximize2 } from 'lucide-react';
import { ManualOrder } from '@/components/brokerage/OrderEntryPanel';
import { Position } from '@/lib/trading-engine/AITradingEngine';
import MarketSummary from '../components/indicators/MarketSummary';

// Import the TradingChart component with dynamic import to avoid SSR issues
const TradingChart = dynamic(
  () => import('@/components/TradingChart'),
  { ssr: false }
);

// Define a spinner component for loading states
const Spinner = () => (
  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto my-4"></div>
);

// Define the data interfaces
interface CandleData {
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  t: number; // timestamp
  v: number; // volume
}

// Interface for the chart component
interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export default function BrokeragePage() {
  const [symbol, setSymbol] = useState('AAPL');
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polygonService, setPolygonService] = useState<PolygonService | null>(null);
  const [isChartFullScreen, setIsChartFullScreen] = useState(false);
  const [manualTrades, setManualTrades] = useState<ManualOrder[]>([]);
  const [aiPositions, setAiPositions] = useState<Position[]>([]);

  // Initialize the page
  useEffect(() => {
    console.log('Initializing brokerage page');
    try {
      // Check if API key is defined
      const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
      if (!apiKey) {
        console.warn('No Polygon API key found in environment variables');
        setError('Polygon API key is missing. Please add it to your environment variables.');
      } else {
        console.log('Polygon API key is available:', apiKey.substring(0, 4) + '...');
      }
      
      const service = PolygonService.getInstance();
      setPolygonService(service);
      
      // Load initial market data
      loadMarketData(service, symbol);
      
      // Set up interval for live data updates (every 30 seconds)
      const dataRefreshInterval = setInterval(() => {
        if (polygonService) {
          console.log('Refreshing market data...');
          loadMarketData(polygonService, symbol);
        }
      }, 30000); // 30 seconds
      
      return () => {
        clearInterval(dataRefreshInterval);
      };
    } catch (err: any) {
      console.error('Failed to initialize brokerage page:', err);
      setError(`Failed to initialize: ${err.message}`);
      setIsLoading(false);
    }
  }, []);

  // Load market data when symbol changes
  useEffect(() => {
    if (polygonService && symbol) {
      loadMarketData(polygonService, symbol);
    }
  }, [symbol, polygonService]);

  // Function to load market data
  const loadMarketData = async (service: PolygonService, sym: string) => {
    if (!service) {
      console.error('Polygon service is not initialized');
      setError('Service not initialized. Please refresh the page.');
      setIsLoading(false);
      return;
    }

    try {
      if (!isLoading) setIsLoading(true);
      setError(null);
      
      console.log(`Loading market data for ${sym}`);
      
      // Get the current date and date 30 days ago
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      // Format dates as YYYY-MM-DD
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Fetch candle data
      const response = await service.getStockCandles(
        sym,
        startDateStr,
        endDateStr,
        'day'
      );
      
      console.log('API Response length:', response?.length);
      
      if (response && response.length > 0) {
        // Store raw data
        setCandleData(response);
        
        // Map API response to the format needed by the chart
        const formattedData = response.map((candle: CandleData) => ({
          time: new Date(candle.t).toISOString().split('T')[0],
          open: candle.o,
          high: candle.h,
          low: candle.l,
          close: candle.c
        }));
        
        setChartData(formattedData);
        console.log('Chart data formatted successfully:', formattedData.length, 'data points');
        
        // Log the first data point to verify format
        if (formattedData.length > 0) {
          console.log('Sample data point:', formattedData[0]);
        }
      } else {
        console.error('Invalid response format or empty response:', response);
        setError('No data received for this symbol. Check API key or try another symbol.');
        setChartData([]);
      }
    } catch (err: any) {
      console.error('Error loading market data:', err);
      setError(`Failed to load market data: ${err.message || 'Unknown error'}`);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle symbol change initiated from the TradingInterface component
  const handleSymbolChange = (newSymbol: string) => {
    if (!newSymbol || newSymbol.trim() === '') {
      console.error('Invalid symbol provided');
      return;
    }
    
    console.log('BrokeragePage: Symbol changed to', newSymbol);
    setSymbol(newSymbol.toUpperCase().trim());
    
    if (polygonService) {
      loadMarketData(polygonService, newSymbol.toUpperCase().trim());
    }
  };

  const toggleFullScreen = () => {
    setIsChartFullScreen(!isChartFullScreen);
    console.log("Toggle fullscreen:", isChartFullScreen);
  };

  // Get the latest closing price from chart data
  const latestClosePrice = chartData.length > 0 ? chartData[chartData.length - 1].close : null;

  // Handler for manual order simulation from OrderEntryPanel
  const handleManualOrder = (order: ManualOrder) => {
    console.log('[BrokeragePage] Received manual order simulation:', order);
    // Add timestamp and current price
    setManualTrades(prev => [...prev, { 
      ...order, 
      timestamp: Date.now(),
      entryPrice: latestClosePrice || 0
    }]);
  };

  // Handler for AI opening a new position
  const handleNewAIPosition = (newPosition: Position) => {
    console.log('[BrokeragePage] Adding new AI position:', newPosition);
    setAiPositions(prev => [...prev, newPosition]);
  };

  // Handler for closing AI positions
  const handleCloseAIPosition = (positionId: string) => {
    console.log('[BrokeragePage] Closing position:', positionId);
    setAiPositions(prev => 
      prev.map(pos => 
        pos.id === positionId 
          ? { 
              ...pos, 
              status: 'closed', 
              closeDate: new Date(),
              exitPrice: latestClosePrice || pos.entryPrice,
              profit: latestClosePrice 
                ? (pos.type === 'buy' 
                  ? (latestClosePrice - pos.entryPrice) * pos.quantity 
                  : (pos.entryPrice - latestClosePrice) * pos.quantity)
                : 0
            } 
          : pos
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <MarketSummary symbol={symbol} />
          
          <div className={`bg-gray-900 rounded-lg p-1 flex flex-col ${isChartFullScreen ? 'h-[80vh]' : 'h-[60vh]'} relative`}>
            <button 
              onClick={toggleFullScreen}
              className="absolute top-2 right-2 z-10 p-1 bg-gray-700/50 hover:bg-gray-600/80 rounded text-gray-300"
              title={isChartFullScreen ? "Minimize Chart" : "Maximize Chart"}
            >
              <Maximize2 size={18} />
            </button>

            {error && !isLoading && (
              <div className="bg-red-900/30 border border-red-700 text-red-400 px-3 py-1 rounded mb-2 text-sm">
                {error}
              </div>
            )}
            {isLoading ? (
              <div className="flex-grow flex items-center justify-center">
                <Spinner />
                <p className="ml-2 text-gray-400">Loading chart data...</p>
              </div>
            ) : chartData.length > 0 ? (
              <div className="flex-grow h-full w-full min-h-0">
                <TradingChart 
                  symbol={symbol} 
                  data={chartData} 
                  manualTrades={manualTrades}
                />
              </div>
            ) : (
              <div className="flex-grow flex items-center justify-center">
                <p className="text-gray-500">{error || `No data available for ${symbol}`}</p>
              </div>
            )}
          </div>

          <div className="">
            <TradingInterface 
              currentSymbol={symbol} 
              onSymbolChange={handleSymbolChange}
              positions={aiPositions}
              onClosePosition={handleCloseAIPosition}
              onNewAIPosition={handleNewAIPosition}
            />
          </div>
        </div>
        <div className="lg:col-span-1 flex flex-col gap-4 h-full">
          <div className="flex-1 min-h-0"><OrderBook symbol={symbol} latestPrice={latestClosePrice} /></div>
          <div className="flex-1 min-h-0"><TradeHistory symbol={symbol} positions={aiPositions} /></div>
          <div className="flex-1 min-h-0">
            <OrderEntryPanel 
              symbol={symbol} 
              onPlaceOrder={handleManualOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
