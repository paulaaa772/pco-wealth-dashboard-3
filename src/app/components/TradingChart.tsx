'use client'

import { useEffect, useRef, useState } from 'react'
import {
  createChart,
  IChartApi,
  LineStyle,
  CrosshairMode,
  CandlestickData
} from 'lightweight-charts'
import IndicatorSelector from './IndicatorSelector'
import { indicatorDefinitions } from './indicators/IndicatorComponents'

type Props = {
  data: CandlestickData[]
  selectedIndicators?: string[]
}

export default function TradingChart({ data, selectedIndicators = [] }: Props) {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const chartApi = useRef<IChartApi | null>(null)
  const [indicators, setIndicators] = useState<string[]>(selectedIndicators)

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return

    chartApi.current = createChart(chartRef.current, {
      height: 400,
      layout: { background: { color: '#ffffff' }, textColor: '#000' },
      grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
      crosshair: { mode: CrosshairMode.Normal },
    })

    const candleSeries = chartApi.current.addCandlestickSeries()
    candleSeries.setData(data)

    indicators.forEach((name) => {
      const match = indicatorDefinitions.find((i) => i.name === name)
      if (match && chartApi.current) match.create(chartApi.current, data)
    })

    return () => chartApi.current?.remove()
  }, [data, indicators])

  return (
    <div className="mt-6">
      <div ref={chartRef} className="w-full border h-[400px]" />
      <IndicatorSelector
        onChange={(names: string[]) => setIndicators(names)}
      />
    </div>
  )
}
