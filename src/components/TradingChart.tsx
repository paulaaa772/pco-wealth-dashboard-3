'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, LineStyle, CrosshairMode } from 'lightweight-charts'
import IndicatorSelector from './IndicatorSelector'
import { indicatorDefinitions } from '@/app/components/indicators/IndicatorComponents'

type Props = {
  data: any[]
  selectedIndicators?: string[]
}

export default function TradingChart({ data, selectedIndicators = [] }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chart = useRef<any>(null)
  const [indicators, setIndicators] = useState<string[]>([])

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return

    chart.current = createChart(chartRef.current, {
      height: 400,
      layout: { background: { color: '#ffffff' }, textColor: '#000' },
      grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
      crosshair: { mode: CrosshairMode.Normal },
    })

    const candleSeries = chart.current.addCandlestickSeries()
    candleSeries.setData(data)

    // Add indicators from definition map
    indicators.forEach((name) => {
      const match = indicatorDefinitions.find((i) => i.name === name)
      if (match) match.create(chart.current, data)
    })

    return () => chart.current.remove()
  }, [data, indicators])

  return (
    <div className="mt-6">
      <div ref={chartRef} className="w-full border h-[400px]" />
      <IndicatorSelector
        onSelect={(name) => setIndicators((prev) => [...prev, name])}
      />
    </div>
  )
}
