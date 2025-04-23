'use client'

import { useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'

export default function TradingChart() {
  const chartRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#eee' },
        horzLines: { color: '#eee' },
      },
    })

    const candleSeries = chart.addCandlestickSeries()
    candleSeries.setData([
      { time: '2023-01-01', open: 100, high: 110, low: 95, close: 105 },
      { time: '2023-01-02', open: 105, high: 115, low: 100, close: 110 }
    ])

    return () => chart.remove()
  }, [])

  return (
    <div className="border w-full h-[400px]" ref={chartRef} />
  )
}
