'use client'

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import TradingInterface from '../../components/dashboard/TradingInterface';
import { PolygonService } from '../../lib/market-data/PolygonService';

// Dynamically import TradingChart with no SSR to avoid hydration issues
const TradingChart = dynamic(() => import('../../components/TradingChart'), {
  ssr: false,
});

interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export default function BrokeragePage() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [polygonService, setPolygonService] = useState<PolygonService | null>(null);
  const [useMockData, setUseMockData] = useState<boolean>(true); // Always use mock data for testing

  useEffect(() => {
    // Skip during SSR
    if (typeof window === 'undefined') return;

    const initPage = async () => {
      try {
        console.log('Initializing brokerage page with mock data');
        const service = PolygonService.getInstance();
        setPolygonService(service);
        
        if (service) {
          console.log('Polygon service initialized successfully');
          await loadMarketData(service);
        } else {
          console.error('Failed to initialize Polygon service');
          setError('Failed to initialize market data service.');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing page:', error);
        setError('Failed to initialize the page.');
        setIsLoading(false);
      }
    };

    initPage();
  }, []);

  useEffect(() => {
    if (polygonService && selectedSymbol) {
      loadMarketData(polygonService);
    }
  }, [selectedSymbol]);

  const loadMarketData = async (service: PolygonService) => {
    if (!selectedSymbol) {
      console.error('No symbol selected');
      setError('Please select a symbol');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Loading market data for symbol:', selectedSymbol);

      // Calculate date range (last 30 days)
      const to = new Date().toISOString().split('T')[0];
      const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      console.log('Date range:', { from, to });
      
      const candles = await service.getStockCandles(selectedSymbol, from, to, '1day');
      console.log('Received candles:', candles.length);
      
      if (!candles || !Array.isArray(candles) || candles.length === 0) {
        console.log('No data available for symbol:', selectedSymbol);
        setError('No data available for this symbol');
        setChartData([]);
        return;
      }

      const formattedData = candles.map(candle => {
        if (!candle || typeof candle.t === 'undefined') {
          console.error('Invalid candle data:', candle);
          return null;
        }
        
        return {
          time: new Date(candle.t).toISOString().split('T')[0],
          open: Number(candle.o) || 0,
          high: Number(candle.h) || 0,
          low: Number(candle.l) || 0,
          close: Number(candle.c) || 0,
        };
      }).filter(Boolean) as ChartDataPoint[];
      
      console.log('Formatted data points:', formattedData.length);
      
      if (formattedData.length === 0) {
        setError('Invalid data received from server');
        return;
      }
      
      setChartData(formattedData);
      
    } catch (error) {
      console.error('Error loading market data:', error);
      setError('Failed to load market data. Please try again.');
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSymbolChange = (symbol: string) => {
    if (symbol && symbol !== selectedSymbol) {
      console.log('Symbol changed to:', symbol);
      setSelectedSymbol(symbol.toUpperCase());
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
            <h3 className="text-blue-300 font-medium">Demo Mode</h3>
            <p className="text-blue-200 mt-1">
              Using simulated market data for testing. All data is generated locally and does not reflect real market conditions.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
              <p className="text-red-500">{error}</p>
            </div>
          )}
          
          <TradingInterface onSymbolChange={handleSymbolChange} />
          
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-white">Market Chart</h2>
              <div className="text-gray-400">
                {isLoading ? 'Loading...' : `${selectedSymbol} - Daily`}
              </div>
            </div>
            <div className="h-[500px] relative">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : chartData.length > 0 ? (
                <TradingChart data={chartData} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
