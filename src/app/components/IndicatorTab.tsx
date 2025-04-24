'use client'

import { useState } from 'react'

export default function IndicatorTab({ onSelect }: { onSelect: (name: string) => void }) {
  const [expanded, setExpanded] = useState(false)

  const indicators = [
    'SMA', 'EMA', 'WMA', 'MACD', 'ADX', 'Parabolic SAR', 'Linear Regression',
    'Ichimoku', 'Supertrend', 'HMA', 'DMI',
    'RSI', 'Stochastic Oscillator', 'CCI', 'Chande Momentum', 'ROC', 'Williams %R',
    'Momentum', 'Awesome Oscillator', 'TRIX',
    'Bollinger Bands', 'ATR', 'Keltner Channels', 'Donchian Channel', 'Standard Deviation', 'Volatility Stop',
    'OBV', 'VPT', 'CMF', 'A/D Line', 'MFI', 'Volume Oscillator', 'Force Index', 'EOM',
    'Pivot Points', 'Fibonacci', 'Gann Levels', 'Supply/Demand Zones', 'Trendlines', 'Candlestick Patterns',
    'Advance/Decline Line', 'McClellan Oscillator', 'Arms Index', 'High-Low Index', 'Put/Call Ratio',
    'QQE', 'Laguerre RSI', 'Fisher Transform', 'Schaff Trend Cycle', 'Ultimate Oscillator', 'Z-Score', 'T3 MA', 'RVI'
  ]

  return (
    <div className="mt-4 bg-zinc-800 text-white rounded p-2 w-full">
      <button
        className="w-full text-left font-semibold text-sm px-2 py-1 bg-zinc-700 rounded hover:bg-zinc-600"
        onClick={() => setExpanded(!expanded)}
      >
        📈 Indicators {expanded ? '▲' : '▼'}
      </button>
      {expanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3">
          {indicators.map((name) => (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className="bg-zinc-900 hover:bg-blue-600 text-xs px-3 py-2 rounded"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
