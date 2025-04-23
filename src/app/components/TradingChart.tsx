'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import { BsBarChart } from 'react-icons/bs'

const INDICATORS = [
  'SMA', 'EMA', 'WMA', 'MACD', 'ADX', 'Parabolic SAR', 'Linear Regression',
  'Ichimoku', 'Supertrend', 'HMA', 'DMI', 'RSI', 'Stochastic Oscillator', 'CCI',
  'Chande Momentum', 'ROC', 'Williams %R', 'Momentum', 'Awesome Oscillator', 'TRIX',
  'Bollinger Bands', 'ATR', 'Keltner Channels', 'Donchian Channel', 'Standard Deviation',
  'Volatility Stop', 'OBV', 'VPT', 'CMF', 'A/D Line', 'MFI', 'Volume Oscillator', 'Force Index',
  'EOM', 'Pivot Points', 'Fibonacci', 'Gann Levels', 'Supply/Demand Zones',
  'Trendlines', 'Candlestick Patterns', 'Advance/Decline Line', 'McClellan Oscillator',
  'Arms Index', 'High-Low Index', 'Put/Call Ratio', 'QQE', 'Laguerre RSI', 'Fisher Transform',
  'Schaff Trend Cycle', 'Ultimate Oscillator', 'Z-Score', 'T3 MA', 'RVI'
]

export default function TradingChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chart = useRef<any>(null)
  const [showIndicators, setShowIndicators] = useState(false)

  useEffect(() => {
    if (!chartRef.current) return
    chart.current = createChart(chartRef.current, {
      height: 400,
      layout: { background: { color: '#fff' }, textColor: '#000' },
      grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
    })

    const candleSeries = chart.current.addCandlestickSeries()
    candleSeries.setData([
      { time: '2023-01-01', open: 100, high: 110, low: 95, close: 105 },
      { time: '2023-01-02', open: 105, high: 115, low: 100, close: 110 }
    ])

    return () => chart.current?.remove()
  }, [])

  return (
    <div className="w-full space-y-4">
      <div ref={chartRef} className="w-full border h-[400px]" />

      {/* Toggle Button */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer bg-zinc-800 dark:bg-zinc-900 text-white rounded-md w-fit hover:bg-zinc-700 transition"
        onClick={() => setShowIndicators(!showIndicators)}
      >
        <BsBarChart />
        <span className="text-sm font-semibold">Indicators</span>
        {showIndicators ? <IoIosArrowUp /> : <IoIosArrowDown />}
      </div>

      {/* Indicator Panel */}
      {showIndicators && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 bg-zinc-900 text-white rounded-md p-4 border border-zinc-700">
          {INDICATORS.map((name) => (
            <button
              key={name}
              className="px-3 py-1 text-sm rounded-md bg-zinc-800 hover:bg-zinc-700 transition border border-zinc-700"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}