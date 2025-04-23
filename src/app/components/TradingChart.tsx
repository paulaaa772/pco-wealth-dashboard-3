'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const TradingView = dynamic(() =>
  import('lightweight-charts').then(mod => mod.createChart)
)

export default function TradingChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    setData([
      { time: '2023-01-01', open: 100, high: 110, low: 95, close: 105 },
      { time: '2023-01-02', open: 105, high: 115, low: 100, close: 110 }
    ])
  }, [])

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    import('lightweight-charts').then(({ createChart }) => {
      const chart = createChart(chartRef.current!, {
        width: chartRef.current!.clientWidth,
        height: 400,
        layout: {
          background: { color: '#ffffff' },
          textColor: '#333333'
        }
      })

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350'
      })

      const safeData = Array.isArray(data) ? data : []
      candleSeries.setData(safeData)

      const handleResize = () => {
        if (chartRef.current) {
          chart.applyOptions({ width: chartRef.current.clientWidth })
        }
      }

      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chart.remove()
      }
    })
  }, [data])

  return (
    <div ref={chartRef} className="w-full h-[400px]" />
  )
}
