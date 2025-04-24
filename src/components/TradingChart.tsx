'use client'

import { useEffect, useRef, useState } from 'react'
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
  selectedIndicators?: string[];
}

export default function TradingChart({ data, selectedIndicators = [] }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chart = useRef<any>(null)
  const [indicators, setIndicators] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!chartRef.current) {
      console.error('Chart container ref is not available');
      return;
    }
    
    if (!data || data.length === 0) {
      console.error('No data provided for chart');
      setError('No data available to display chart');
      return;
    }

    try {
      console.log('Creating chart with data points:', data.length);
      
      // Clean up previous chart instance
      if (chart.current) {
        chart.current.remove();
      }

      // Create new chart instance
      chart.current = createChart(chartRef.current, {
        height: 400,
        layout: {
          background: { color: '#1a1a1a' },
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: { color: '#2d2d2d' },
          horzLines: { color: '#2d2d2d' },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            color: '#4b5563',
            labelBackgroundColor: '#4b5563',
          },
          horzLine: {
            color: '#4b5563',
            labelBackgroundColor: '#4b5563',
          },
        },
      })

      // Format data for the chart
      const formattedData = data.map(item => ({
        time: typeof item.time === 'string' ? item.time : new Date(item.time).toISOString().split('T')[0],
        open: Number(item.open),
        high: Number(item.high),
        low: Number(item.low),
        close: Number(item.close),
      }));

      console.log('Formatted data for chart:', formattedData.length);

      // Add candlestick series
      const candleSeries = chart.current.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      })
      
      candleSeries.setData(formattedData)

      // Add indicators
      indicators.forEach((name) => {
        const match = indicatorDefinitions.find((i) => i.name === name)
        if (match) match.create(chart.current, formattedData)
      })

      // Fit the chart content
      chart.current.timeScale().fitContent()
      
      setError(null);
    } catch (err) {
      console.error('Error creating chart:', err);
      setError('Failed to create chart. Please try again.');
    }

    return () => {
      if (chart.current) {
        chart.current.remove()
      }
    }
  }, [data, indicators])

  return (
    <div className="mt-6">
      {error ? (
        <div className="w-full h-[400px] rounded-lg flex items-center justify-center bg-gray-800 text-red-400">
          {error}
        </div>
      ) : (
        <div ref={chartRef} className="w-full h-[400px] rounded-lg overflow-hidden" />
      )}
      <IndicatorSelector
        onSelect={(name) => setIndicators((prev) => [...prev, name])}
      />
    </div>
  )
}
