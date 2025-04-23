'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'

export default function TradingChart() {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const [symbol, setSymbol] = useState('AAPL')
  const [candles, setCandles] = useState([])

  useEffect(() => {
    const fetchCandles = async () => {
      const res = await fetch(`/api/polygon/candles?symbol=${symbol}`)
      const data = await res.json()
      setCandles(data)
    }
    fetchCandles()
  }, [symbol])

  useEffect(() => {
    if (!chartRef.current || candles.length === 0) return

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 400,
      layout: { textColor: '#333', background: { color: '#ffffff' } },
    })

    const candleSeries = chart.addCandlestickSeries()
    candleSeries.setData(candles)

    return () => chart.remove()
  }, [candles])

  return (
    <div className="space-y-4">
      <select
        className="border px-2 py-1 text-sm"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      >
        <option value="AAPL">AAPL</option>
        <option value="MSFT">MSFT</option>
        <option value="TSLA">TSLA</option>
        <option value="NVDA">NVDA</option>
        <option value="BTC-USD">BTC</option>
        <option value="ETH-USD">ETH</option>
      </select>

      <div ref={chartRef} className="w-full h-[400px] border" />
    </div>
  )
}
