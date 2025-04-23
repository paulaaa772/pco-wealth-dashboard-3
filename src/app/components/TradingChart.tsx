'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, LineStyle, CrosshairMode } from 'lightweight-charts'
import IndicatorPanel from './IndicatorPanel'

export default function TradingChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chart = useRef<any>(null)
  const [data, setData] = useState<any[]>([])
  const [indicators, setIndicators] = useState<string[]>([])

  useEffect(() => {
    const mock = [
      { time: '2023-01-01', open: 100, high: 110, low: 95, close: 105 },
      { time: '2023-01-02', open: 105, high: 115, low: 100, close: 110 },
      { time: '2023-01-03', open: 110, high: 120, low: 105, close: 115 },
      { time: '2023-01-04', open: 115, high: 125, low: 110, close: 120 }
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

    indicators.forEach(type => {
      const color = '#' + Math.floor(Math.random()*16777215).toString(16)

      if (type === 'SMA') {
        const sma = chart.current.addLineSeries({ color, lineWidth: 2 })
        const smaData = data.map((d, i, arr) => {
          const slice = arr.slice(Math.max(i - 2, 0), i + 1)
          const avg = slice.reduce((sum, d) => sum + d.close, 0) / slice.length
          return { time: d.time, value: avg }
        })
        sma.setData(smaData)
      }

      if (type === 'EMA') {
        const ema = chart.current.addLineSeries({ color, lineWidth: 1, lineStyle: LineStyle.Dotted })
        let prev = data[0]?.close || 0
        const emaData = data.map(d => {
          const value = d.close * 0.2 + prev * 0.8
          prev = value
          return { time: d.time, value }
        })
        ema.setData(emaData)
      }

      if (type === 'RSI') {
        const rsi = chart.current.addLineSeries({ color, lineWidth: 1 })
        const rsiData = data.map((d, i) => ({ time: d.time, value: 30 + i * 3 }))
        rsi.setData(rsiData)
      }

      if (type === 'MACD') {
        const macd = chart.current.addLineSeries({ color, lineWidth: 1 })
        const macdData = data.map((d, i) => ({ time: d.time, value: d.close + (i % 2 === 0 ? 1 : -1) * 5 }))
        macd.setData(macdData)
      }

      // Add more indicator logic here as needed...
    })

    return () => chart.current.remove()
  }, [data, indicators])

  return (
    <div className="space-y-4">
      <IndicatorPanel onSelect={(name) =>
        setIndicators(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name])
      } />
      <div ref={chartRef} className="w-full h-[400px] border rounded shadow bg-white" />
    </div>
  )
}
