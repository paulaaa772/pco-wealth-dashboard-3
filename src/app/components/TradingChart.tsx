'use client'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const TradingView = dynamic(
  () => import('lightweight-charts').then((mod) => {
    const { createChart } = mod
    return function TradingChart() {
      const chartRef = useRef<HTMLDivElement>(null)
      const [data, setData] = useState([])

      useEffect(() => {
        // Test with mock data first
        setData([
          { time: '2023-01-01', open: 100, high: 110, low: 95, close: 105 },
          { time: '2023-01-02', open: 105, high: 115, low: 100, close: 110 }
        ])
      }, [])

      useEffect(() => {
        if (!chartRef.current || data.length === 0) return

        const chart = createChart(chartRef.current, {
          width: chartRef.current.clientWidth,
          height: 400
        })
        const candleSeries = chart.addCandlestickSeries()
        candleSeries.setData(data)

        return () => chart.remove()
      }, [data])

      return (
        <div>
          <h2 className="text-xl font-bold mb-4">Test Chart</h2>
          <div ref={chartRef} className="w-full h-[400px] border" />
          <pre className="mt-4 p-2 bg-gray-100 rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )
    }
  }),
  { ssr: false }
)

export default TradingView
