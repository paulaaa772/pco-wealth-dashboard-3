'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createChart, LineStyle, CrosshairMode } from 'lightweight-charts'
import IndicatorSelector from './IndicatorSelector'
import { indicatorDefinitions } from '@/app/components/indicators/IndicatorComponents'

interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

type Props = {
  data: ChartDataPoint[];
  symbol: string;
  selectedIndicators?: string[];
}

export default function TradingChart({ data, symbol, selectedIndicators = [] }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chart = useRef<any>(null)
  const candleSeries = useRef<any>(null)
  const [indicators, setIndicators] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // --- Resize Handling --- 
  const handleResize = useCallback(() => {
    if (chart.current && chartContainerRef.current) {
      chart.current.applyOptions({ 
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight 
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // --- Chart Initialization and Updates --- 
  useEffect(() => {
    if (!chartContainerRef.current) {
      console.error('Chart container ref is not available');
      setError('Chart container not available');
      return;
    }
    
    if (!data || data.length === 0) {
      console.error('No data provided for chart');
      // Don't set error here, parent component handles "No data" message
      // Clear existing chart if data becomes empty
       if (chart.current) {
         try { chart.current.remove(); chart.current = null; } catch(e){}
       }
      return;
    }

    setError(null); // Clear previous errors if we have data

    // Format data (do this once when data changes)
    const formattedData = data.map(item => ({
      time: typeof item.time === 'string' ? item.time : new Date(item.time).toISOString().split('T')[0],
      open: Number(item.open),
      high: Number(item.high),
      low: Number(item.low),
      close: Number(item.close),
    }));

    // Initialize chart if it doesn't exist
    if (!chart.current) {
      try {
        console.log(`Creating chart for ${symbol}`);
        chart.current = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth, // Use container width
          height: chartContainerRef.current.clientHeight, // Use container height
          layout: { background: { color: '#1a1a1a' }, textColor: '#d1d5db' },
          grid: { vertLines: { color: '#2d2d2d' }, horzLines: { color: '#2d2d2d' } },
          crosshair: { mode: CrosshairMode.Normal, vertLine: { color: '#4b5563' }, horzLine: { color: '#4b5563' } },
          timeScale: { timeVisible: true, secondsVisible: false }, // Show time on timescale
        });

        candleSeries.current = chart.current.addCandlestickSeries({
          upColor: '#22c55e', downColor: '#ef4444', borderVisible: false,
          wickUpColor: '#22c55e', wickDownColor: '#ef4444',
        });

        chart.current.timeScale().fitContent();

      } catch (err) {
        console.error('Error creating chart:', err);
        setError('Failed to create chart. Please try again.');
        return; // Stop if creation failed
      }
    }

    // Update candle series data
    if (candleSeries.current) {
        console.log('Updating chart data...');
        candleSeries.current.setData(formattedData);
        // Optional: Re-fit content if necessary, maybe only on symbol change?
        // chart.current.timeScale().fitContent(); 
    }

    // TODO: Update/Add indicators logic here if needed
    // indicators.forEach(...)

  }, [data, symbol, handleResize]); // Re-run on data/symbol change, handleResize dependency ensures latest resize logic

  // Cleanup chart on component unmount
  useEffect(() => {
    return () => {
      if (chart.current) {
        try { chart.current.remove(); } catch (e) {}
        chart.current = null;
      }
    }
  }, []);

  // --- Rendering --- 
  return (
    // Ensure outer container takes full height of its parent
    <div className="w-full h-full flex flex-col">
      {error ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-red-400 rounded-lg">
          {error}
        </div>
      ) : (
        // Chart container div - takes available space
        <div ref={chartContainerRef} className="w-full flex-grow rounded-lg overflow-hidden" />
      )}
      {/* Keep Indicator Selector separate, maybe move outside later */}
      <div className="mt-2 flex-shrink-0">
          <IndicatorSelector
            onSelect={(name) => setIndicators((prev) => [...prev, name])}
          />
      </div>
    </div>
  );
}
