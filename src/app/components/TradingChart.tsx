'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, LineStyle, CrosshairMode } from 'lightweight-charts'
import IndicatorSelector from './IndicatorSelector'

export default function TradingChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chart = useRef<any>(null)
  const [data, setData] = useState<any[]>([])
  const [indicators, setIndicators] = useState<string[]>([])

  useEffect(() => {
    const mock = [
      { time: '2023-01-01', open: 100, high: 110, low: 95, close: 105 },
      { time: '2023-01-02', open: 105, high: 115, low: 100, close: 110 },
    ]
    setData(mock)
  }, [])

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return

    chart.current = createChart(chartRef.current!, {
      height: 400,
      layout: { background: { color: '#ffffff' }, textColor: '#000' },
      grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
      crosshair: { mode: CrosshairMode.Normal },
    })

    const candleSeries = chart.current.addCandlestickSeries()
    candleSeries.setData(data)

    // Add indicators
    indicators.forEach((type) => {
      if (type === 'SMA') {
        const smaSeries = chart.current.addLineSeries({
          color: '#FF5733',
          lineStyle: LineStyle.Solid,
          lineWidth: 2,
        })

        const smaData = data.map((d, i, arr) => {
          const slice = arr.slice(Math.max(i - 2, 0), i + 1)
          const avg = slice.reduce((sum, d) => sum + d.close, 0) / slice.length
          return { time: d.time, value: avg }
        })

        smaSeries.setData(smaData)
      }

      if (type === 'EMA') {
        const emaSeries = chart.current.addLineSeries({
          color: '#007bff',
          lineStyle: LineStyle.Dotted,
          lineWidth: 2,
        })

        const emaData = []
        let prev = data[0]?.close || 0
        for (let i = 0; i < data.length; i++) {
          const d = data[i]
          const ema = (d.close * 0.2) + (prev * 0.8)
          emaData.push({ time: d.time, value: ema })
          prev = ema
        }

        emaSeries.setData(emaData)
      }
    })

    return () => chart.current.remove()
  }, [data, indicators])

  return (
    <div className="mt-6">
      <div ref={chartRef} className="w-full border h-[400px]" />
      <IndicatorSelector
        onChange={(names) => setIndicators(names)}
      />
    </div>
  )
}
