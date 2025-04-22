'use client'
import { useEffect, useRef } from 'react'

export default function TradingChart() {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Mock data - replace with real API data later
    const mockData = [
      { time: '2025-04-01', open: 180, high: 185, low: 178, close: 183 },
      { time: '2025-04-02', open: 183, high: 190, low: 182, close: 188 },
      { time: '2025-04-03', open: 188, high: 192, low: 186, close: 190 }
    ]

    import('lightweight-charts').then(({ createChart }) => {
      const chart = createChart(chartRef.current!, {
        width: chartRef.current!.clientWidth,
        height: 400,
        layout: {
          background: { color: '#ffffff' },
          textColor: '#333333',
        }
      })

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      })

      candleSeries.setData(mockData)

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
  }, [])

  return <div ref={chartRef} className="w-full h-[400px]" />
}
