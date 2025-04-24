'use client'

import { useState, useEffect } from 'react';
import TradingChart from '../../components/TradingChart'
import TradingInterface from '../../components/dashboard/TradingInterface'
import { PolygonService } from '../../lib/market-data/PolygonService'

interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export default function BrokeragePage() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [isLoading, setIsLoading] = useState(true);
  const polygonService = PolygonService.getInstance();

  useEffect(() => {
    loadMarketData();
  }, [selectedSymbol]);

  const loadMarketData = async () => {
    try {
      setIsLoading(true);
      const to = new Date().toISOString().split('T')[0];
      const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const candles = await polygonService.getStockCandles(selectedSymbol, from, to, '1day');
      const formattedData = candles.map(candle => ({
        time: new Date(candle.t).toISOString().split('T')[0],
        open: candle.o,
        high: candle.h,
        low: candle.l,
        close: candle.c,
      }));
      
      setChartData(formattedData);
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <TradingInterface onSymbolChange={handleSymbolChange} />
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-white">Market Chart</h2>
              <div className="text-gray-400">
                {isLoading ? 'Loading...' : `${selectedSymbol} - Daily`}
              </div>
            </div>
            <div className="h-[500px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : (
                <TradingChart data={chartData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
