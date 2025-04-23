'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'

type Candle = {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export default function TradingChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  const seriesRef = useRef<any>(null)
  const [symbol, setSymbol] = useState('AAPL')
  const [data, setData] = useState<Candle[]>([])

  useEffect(() => {
    if (!chartRef.current) return

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 400,
      layout: { background: { color: '#fff' }, textColor: '#333' },
      grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
      crosshair: { mode: 0 }
    })

    const candlestickSeries = chart.addCandlestickSeries()
    seriesRef.current = candlestickSeries

    return () => chart.remove()
  }, [])

  useEffect(() => {
    if (!seriesRef.current) return

    const fetchData = async () => {
      const res = await fetch(`/api/polygon/candles?symbol=${symbol}`)
      const candles = await res.json()
      setData(candles)
      seriesRef.current.setData(candles)
    }

    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [symbol])

  return (
    <div className="p-4">
      <h2 className="text-md font-semibold mb-2">Live Chart</h2>
      <select
        className="border p-1 mb-2"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      >
        <option value="AAPL">AAPL</option>
        <option value="TSLA">TSLA</option>
        <option value="BTC-USD">BTC</option>
        <option value="ETH-USD">ETH</option>
      </select>
      <div ref={chartRef} />
    </div>
  )
}
