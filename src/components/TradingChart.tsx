'use client'

import React, { useRef, useEffect, useState } from 'react'
import { createChart, IChartApi, ISeriesApi, ChartOptions, DeepPartial, ColorType, LineStyle, CrosshairMode, Time } from 'lightweight-charts'
import IndicatorSelector from './IndicatorSelector'
import { indicatorDefinitions } from '@/app/components/indicators/IndicatorComponents'
// Remove conflicting import and use our own interface definition
// import { ManualOrder } from './brokerage/OrderEntryPanel'

// Define interfaces for the data
export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface ManualOrder {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market' | 'stop';
  amount: number;
  price?: number;
  timestamp?: number;
  entryPrice?: number;
  limitPrice?: number;
  stopPrice?: number;
}

interface TradingChartProps {
  symbol: string;
  data: CandleData[];
  manualTrades?: ManualOrder[];
  selectedIndicators?: string[];
}

const TradingChart: React.FC<TradingChartProps> = ({ symbol, data, manualTrades = [], selectedIndicators = [] }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const candleSeries = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [indicators, setIndicators] = useState<string[]>(selectedIndicators);
  const [error, setError] = useState<string | null>(null);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  
  // Format data for lightweight-charts
  const formatChartData = (data: CandleData[]) => {
    return data.map(candle => ({
      time: candle.time as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));
  };

  // Initialize chart on mount
  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;
    
    // Log first data point for debugging
    console.log(`Initializing chart for ${symbol} with ${data.length} data points`);
    console.log('First data point:', data[0]);
    
    if (chartContainerRef.current.children.length > 0) {
      chartContainerRef.current.innerHTML = '';
    }
    
    // Chart options
    const chartOptions: DeepPartial<ChartOptions> = {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: '#151924' 
        },
        textColor: '#d1d4dc',
        fontSize: 12,
        fontFamily: 'Roboto, sans-serif',
      },
      grid: {
        vertLines: {
          color: '#1c2030',
          style: LineStyle.Dotted,
        },
        horzLines: {
          color: '#1c2030',
          style: LineStyle.Dotted,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: '#3c4158',
          style: LineStyle.Solid,
        },
        horzLine: {
          width: 1,
          color: '#3c4158',
          style: LineStyle.Solid,
        },
      },
      rightPriceScale: {
        borderColor: '#1c2030',
        visible: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#1c2030',
        timeVisible: true,
        secondsVisible: false,
      },
      watermark: {
        visible: true,
        fontSize: 48,
        horzAlign: 'center',
        vertAlign: 'center',
        color: 'rgba(25, 32, 45, 0.15)',
        text: symbol,
      },
    };
    
    // Create chart instance
    chart.current = createChart(chartContainerRef.current, chartOptions);
    
    // Add candlestick series
    candleSeries.current = chart.current.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    
    const formattedData = formatChartData(data);
    
    if (formattedData.length > 0) {
      candleSeries.current.setData(formattedData);
      
      // Get last price for price line
      const lastCandle = formattedData[formattedData.length - 1];
      if (lastCandle) {
        setLastPrice(lastCandle.close);
        
        // Add price line for last price
        candleSeries.current.createPriceLine({
          price: lastCandle.close,
          color: '#f5d142',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'Last Price',
        });
      }
    }
    
    // Add markers for manual trades
    if (manualTrades && manualTrades.length > 0 && candleSeries.current) {
      const markers = manualTrades.map(trade => {
        if (!trade.timestamp) return null;
        
        // Find the closest candle time to the trade timestamp
        const tradeDate = new Date(trade.timestamp);
        const tradeTime = tradeDate.toISOString().split('T')[0];
        
        return {
          time: tradeTime as Time,
          position: trade.side === 'buy' ? 'belowBar' : 'aboveBar',
          color: trade.side === 'buy' ? '#26a69a' : '#ef5350',
          shape: trade.side === 'buy' ? 'arrowUp' : 'arrowDown',
          text: `${trade.side.toUpperCase()} ${trade.amount} @ $${trade.entryPrice?.toFixed(2) || '0.00'}`
        };
      }).filter(Boolean);
      
      if (markers.length > 0) {
        candleSeries.current.setMarkers(markers as any);
      }
    }
    
    // Handle window resize
    const handleResize = () => {
      if (chart.current && chartContainerRef.current) {
        chart.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chart.current) {
        chart.current.remove();
        chart.current = null;
      }
    };
  }, [symbol, data]);

  // Add selected indicators
  useEffect(() => {
    if (!chart.current || !candleSeries.current) return;
    
    // Reset for now - in a full implementation, we would track each indicator
    // and only add/remove as needed
    indicators.forEach(indicator => {
      // Example of adding SMA
      if (indicator === 'SMA') {
        const smaData = calculateSMA(data, 20);
        const smaLine = chart.current!.addLineSeries({
          color: '#2196F3',
          lineWidth: 2,
          priceLineVisible: false,
        });
        smaLine.setData(smaData);
      }
      
      // In a real implementation, add logic for other indicators here
    });
  }, [indicators, data]);

  // Simple SMA calculation example for demonstration
  const calculateSMA = (data: CandleData[], period: number) => {
    const result = [];
    
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      result.push({
        time: data[i].time as Time,
        value: sum / period
      });
    }
    
    return result;
  };

  return (
    <div className="w-full h-full flex flex-col">
      {error && (
        <div className="text-red-500 text-sm mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded">
          {error}
        </div>
      )}
      
      {(!data || data.length === 0) ? (
        <div className="flex-grow flex items-center justify-center text-gray-500">
          No data available for {symbol}
        </div>
      ) : (
        <div className="flex-grow min-h-[500px] relative" ref={chartContainerRef} />
      )}
      
      <div className="flex justify-between items-center mt-2">
        <div className="text-sm text-gray-400">
          {lastPrice && (
            <span>Last: <span className="text-white font-medium">${lastPrice.toFixed(2)}</span></span>
          )}
        </div>
        <IndicatorSelector
          onSelect={(name) => setIndicators((prev) => [...prev, name])}
        />
      </div>
    </div>
  );
};

export default TradingChart;

