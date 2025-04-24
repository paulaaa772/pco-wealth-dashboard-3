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

// Generate mock data for fallback when API fails
const generateMockData = (symbol: string): ChartDataPoint[] => {
  console.log('Generating mock data for', symbol);
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
  const [polygonService, setPolygonService] = useState<PolygonService | null>(null);
  const [useMockData, setUseMockData] = useState<boolean>(false);

  useEffect(() => {
    // Skip during SSR
    if (typeof window === 'undefined') return;

    const initPage = async () => {
      try {
        console.log('Initializing brokerage page');
        const service = PolygonService.getInstance();
        setPolygonService(service);
        
        if (service) {
          console.log('Polygon service initialized successfully');
          await loadMarketData(service);
        } else {
          console.error('Failed to initialize Polygon service');
          setError('Failed to initialize market data service.');
          setIsLoading(false);
          
          // Fall back to mock data after a brief delay
          setTimeout(() => {
            console.log('Falling back to mock data');
            setChartData(generateMockData(selectedSymbol));
            setError('Using demo data (API connection failed)');
            setUseMockData(true);
            setIsLoading(false);
          }, 1000);
        }
      } catch (error) {
        console.error('Error initializing page:', error);
        setError('Failed to initialize the page. Please check your API key configuration.');
        setIsLoading(false);
        
        // Fall back to mock data after a brief delay
        setTimeout(() => {
          console.log('Falling back to mock data after error');
          setChartData(generateMockData(selectedSymbol));
          setError('Using demo data (API connection failed)');
          setUseMockData(true);
          setIsLoading(false);
        }, 1000);
      }
    };

    initPage();
  }, []);

  useEffect(() => {
    if (useMockData) {
      console.log('Using mock data for symbol change:', selectedSymbol);
      setChartData(generateMockData(selectedSymbol));
      return;
    }
    
    if (polygonService && selectedSymbol) {
      loadMarketData(polygonService);
    }
  }, [selectedSymbol, useMockData]);

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
        console.log('Received candles:', candles);
        
        if (!candles || !Array.isArray(candles) || candles.length === 0) {
          console.log('No data available for symbol:', selectedSymbol);
          throw new Error('No data available for this symbol');
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
        
        console.log('Formatted data:', formattedData);
        
        if (formattedData.length === 0) {
          throw new Error('Invalid data received from server');
        }
        
        setChartData(formattedData);
        setUseMockData(false);
      } catch (apiError) {
        console.error('API request failed, falling back to mock data:', apiError);
        const mockData = generateMockData(selectedSymbol);
        setChartData(mockData);
        setError('Using demo data - API connection failed');
        setUseMockData(true);
      }
      
    } catch (error) {
      console.error('Error loading market data:', error);
      setError('Failed to load market data. Using demo mode.');
      
      // Fall back to mock data
      const mockData = generateMockData(selectedSymbol);
      setChartData(mockData);
      setUseMockData(true);
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
          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
              <p className="text-red-500">{error}</p>
              {useMockData && (
                <p className="text-gray-400 mt-2 text-sm">
                  Using simulated data for demonstration. Real API access is currently unavailable.
                </p>
              )}
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
