'use client'

import React, { useState, useEffect } from 'react';
import { PolygonService } from '../../lib/market-data/PolygonService';
import dynamic from 'next/dynamic';

// Import the TradingChart component with dynamic import to avoid SSR issues
const TradingChart = dynamic(
  () => import('../../components/TradingChart'),
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

  // Initialize the page
  useEffect(() => {
    console.log('Initializing brokerage page');
    try {
      // Create a new instance of PolygonService
      const service = PolygonService.getInstance();
      setPolygonService(service);
      
      // Load initial market data
      loadMarketData(service, symbol);
    } catch (err) {
      console.error('Failed to initialize brokerage page:', err);
      setError('Failed to initialize the brokerage page. Please check the console for details.');
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
    try {
      setIsLoading(true);
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
        endDateStr
      );
      
      console.log('API Response:', response);
      
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
      } else {
        console.error('Invalid response format:', response);
        setError('Invalid data format received from the API');
      }
    } catch (err) {
      console.error('Error loading market data:', err);
      setError('Failed to load market data. Please check your API key and network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle symbol change
  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSymbol(e.target.value.toUpperCase());
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (polygonService && symbol) {
      loadMarketData(polygonService, symbol);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Brokerage Dashboard</h1>
      
      {/* Symbol input form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={symbol}
            onChange={handleSymbolChange}
            placeholder="Enter symbol (e.g., AAPL)"
            className="border border-gray-300 rounded px-3 py-2 flex-1"
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Load Chart
          </button>
        </div>
      </form>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Chart container */}
      <div className="border border-gray-300 rounded p-4 h-[500px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner />
            <p className="ml-2">Loading chart data...</p>
          </div>
        ) : chartData.length > 0 ? (
          <TradingChart symbol={symbol} data={chartData} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No data available for {symbol}</p>
          </div>
        )}
      </div>
    </div>
  );
}
