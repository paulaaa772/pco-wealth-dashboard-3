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

// Generate simple local data as fallback if API fails
const generateLocalData = (symbol: string): ChartDataPoint[] => {
  console.log('Generating local fallback data for', symbol);
  const data: ChartDataPoint[] = [];
  const basePrice = symbol === 'AAPL' ? 180 : 
                   symbol === 'MSFT' ? 380 : 
                   symbol === 'GOOG' ? 140 : 100;
  
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Random price movement but trending slightly upward
    const randomFactor = 0.98 + Math.random() * 0.04; // 0.98 to 1.02
    const prevPrice = i === 29 ? basePrice : data[data.length - 1].close;
    const close = prevPrice * randomFactor;
    
    // Daily range is roughly 1-2% of price
    const rangePercent = 0.01 + Math.random() * 0.01;
    const range = close * rangePercent;
    
    data.push({
      time: dateStr,
      open: close * (0.995 + Math.random() * 0.01), // Open near previous close
      high: close + (range / 2) + Math.random() * (range / 2),
      low: close - (range / 2) - Math.random() * (range / 2),
      close: close
    });
  }
  
  return data;
};

export default function BrokeragePage() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState<boolean>(true);

  useEffect(() => {
    // Skip during SSR
    if (typeof window === 'undefined') return;

    const initPage = async () => {
      try {
        console.log('Initializing brokerage page with mock data');
        const service = PolygonService.getInstance();
        
        if (!service) {
          console.error('Failed to initialize Polygon service');
          setError('Failed to initialize market data service.');
          setIsLoading(false);
          
          // Fall back to local data
          setChartData(generateLocalData(selectedSymbol));
          return;
        }
        
        await loadMarketData(service);
      } catch (error) {
        console.error('Error initializing page:', error);
        setError('Failed to initialize the page. Using fallback data.');
        setChartData(generateLocalData(selectedSymbol));
        setIsLoading(false);
      }
    };

    initPage();
  }, []);

  useEffect(() => {
    if (selectedSymbol) {
      setIsLoading(true);
      const service = PolygonService.getInstance();
      
      if (service) {
        loadMarketData(service);
      } else {
        // Use local data if service isn't available
        setChartData(generateLocalData(selectedSymbol));
        setIsLoading(false);
      }
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
      
      try {
        const candles = await service.getStockCandles(selectedSymbol, from, to, '1day');
        console.log('Received candles:', candles?.length || 0);
        
        if (!candles || !Array.isArray(candles) || candles.length === 0) {
          console.log('No data available for symbol, using fallback data:', selectedSymbol);
          setChartData(generateLocalData(selectedSymbol));
        } else {
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
          
          console.log('Formatted data points:', formattedData?.length || 0);
          
          if (!formattedData || formattedData.length === 0) {
            console.log('Formatting failed, using fallback data');
            setChartData(generateLocalData(selectedSymbol));
          } else {
            setChartData(formattedData);
          }
        }
      } catch (error) {
        console.error('Error fetching candles, using fallback data:', error);
        setChartData(generateLocalData(selectedSymbol));
      }
    } catch (error) {
      console.error('Error loading market data:', error);
      setError('Failed to load market data. Using fallback data.');
      setChartData(generateLocalData(selectedSymbol));
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
