'use client'

import { useEffect, useRef, useState } from 'react'

export default function TradingChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const fetchCandles = async () => {
      try {
        const res = await fetch(`/api/polygon/candles?symbol=AAPL`)
        const candles = await res.json()
        setData(candles)
      } catch (err) {
        console.error('Failed to load candles:', err)
      }
    }
    fetchCandles()
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

      candleSeries.setData(Array.isArray(data) ? data : [])

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
    <div>
      <h2 className="text-md font-semibold">Live Chart</h2>
      <div ref={chartRef} className="w-full h-[400px] border" />
    </div>
  )
}
