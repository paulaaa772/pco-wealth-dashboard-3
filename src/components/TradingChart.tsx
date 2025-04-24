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

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return

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
      time: item.time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }))

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

    return () => {
      if (chart.current) {
        chart.current.remove()
      }
    }
  }, [data, indicators])

  return (
    <div className="mt-6">
      <div ref={chartRef} className="w-full h-[400px] rounded-lg overflow-hidden" />
      <IndicatorSelector
        onSelect={(name) => setIndicators((prev) => [...prev, name])}
      />
    </div>
  )
}
