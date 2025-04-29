'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  DeepPartial,
  ChartOptions,
  HistogramSeriesOptions,
  PriceLineOptions,
  IPriceLine,
} from 'lightweight-charts';

// The original polygon data format
interface PolygonCandle {
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  t: number; // timestamp
  v: number; // volume
}

// The brokerage page data format
interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradingChartProps {
  symbol: string;
  data: CandleData[] | PolygonCandle[];
  currentPrice?: number;
}

const TradingChart: React.FC<TradingChartProps> = ({ symbol, data, currentPrice }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const priceLineRef = useRef<IPriceLine | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    // Only initialize the chart once
    if (!chartRef.current && chartContainerRef.current) {
      // Create the chart
      const options: DeepPartial<ChartOptions> = {
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
        layout: {
          background: { color: '#253248' },
          textColor: 'rgba(255, 255, 255, 0.9)',
        },
        grid: {
          vertLines: {
            color: 'rgba(197, 203, 206, 0.1)',
          },
          horzLines: {
            color: 'rgba(197, 203, 206, 0.1)',
          },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: 'rgba(197, 203, 206, 0.3)',
        },
        timeScale: {
          borderColor: 'rgba(197, 203, 206, 0.3)',
          timeVisible: true,
          secondsVisible: false,
        },
      };

      chartRef.current = createChart(chartContainerRef.current, options);

      // Add candlestick series
      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      // Add volume series
      const volumeOptions: DeepPartial<HistogramSeriesOptions> = {
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      };
      
      volumeSeriesRef.current = chartRef.current.addHistogramSeries(volumeOptions);
      
      // Set the scale margin for the volume series
      volumeSeriesRef.current.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      // Handle resize
      resizeObserverRef.current = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        chartRef.current?.applyOptions({ width, height });
        chartRef.current?.timeScale().fitContent();
      });

      resizeObserverRef.current.observe(chartContainerRef.current);
    }

    return () => {
      // Clean up
      if (resizeObserverRef.current && chartContainerRef.current) {
        resizeObserverRef.current.unobserve(chartContainerRef.current);
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
        volumeSeriesRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !volumeSeriesRef.current || data.length === 0) return;

    const isPolygonFormat = 'o' in data[0];
    
    // Format the data for the chart
    const formattedCandleData = isPolygonFormat 
      ? (data as PolygonCandle[]).map(candle => ({
          time: Math.floor(candle.t / 1000) as any,
          open: candle.o,
          high: candle.h,
          low: candle.l,
          close: candle.c,
        }))
      : (data as CandleData[]).map(candle => ({
          time: Math.floor(candle.timestamp / 1000) as any,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }));

    const formattedVolumeData = isPolygonFormat
      ? (data as PolygonCandle[]).map(candle => ({
          time: Math.floor(candle.t / 1000) as any,
          value: candle.v,
          color: candle.c >= candle.o ? '#26a69a' : '#ef5350',
        }))
      : (data as CandleData[]).map(candle => ({
          time: Math.floor(candle.timestamp / 1000) as any,
          value: candle.volume,
          color: candle.close >= candle.open ? '#26a69a' : '#ef5350',
        }));

    // Set the data
    seriesRef.current.setData(formattedCandleData);
    volumeSeriesRef.current.setData(formattedVolumeData);

    // Remove the previous price line if it exists
    if (priceLineRef.current) {
      seriesRef.current.removePriceLine(priceLineRef.current);
      priceLineRef.current = null;
    }

    // Add a new price line for the current price if available
    if (currentPrice && seriesRef.current) {
      const newPriceLineOptions: PriceLineOptions = {
        price: currentPrice,
        color: 'rgba(220, 220, 220, 0.8)',
        lineWidth: 1,
        lineStyle: 2,
        lineVisible: true,
        axisLabelVisible: true,
        title: 'Current',
        axisLabelColor: '#ffffff',
        axisLabelTextColor: '#000000',
      };
      priceLineRef.current = seriesRef.current.createPriceLine(newPriceLineOptions);
    }

    // Fit the content to view
    chartRef.current?.timeScale().fitContent();

  }, [data, currentPrice]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={chartContainerRef} 
        className="w-full h-full"
      />
      <div className="absolute top-2 left-2 bg-gray-900 bg-opacity-75 text-white px-3 py-1 rounded">
        {symbol}: ${currentPrice?.toFixed(2) || (data.length > 0 ? 
          ('c' in data[data.length - 1] 
            ? (data[data.length - 1] as PolygonCandle).c.toFixed(2)
            : (data[data.length - 1] as CandleData).close.toFixed(2))
          : 'N/A')}
      </div>
    </div>
  );
};

export default TradingChart; 