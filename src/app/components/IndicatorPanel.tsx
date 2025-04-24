'use client'

type Props = {
  selected: string[]
  onChange: (selected: string[]) => void
}

const ALL_INDICATORS = [
  'SMA', 'EMA', 'WMA', 'MACD', 'ADX', 'Parabolic SAR', 'Ichimoku Cloud',
  'Linear Regression', 'Supertrend', 'HMA', 'DMI',
  'RSI', 'Stochastic Oscillator', 'CCI', 'Chande Momentum', 'ROC',
  'Williams %R', 'Momentum', 'Awesome Oscillator', 'TRIX',
  'Bollinger Bands', 'ATR', 'Keltner Channels', 'Donchian Channel',
  'Std Dev', 'Volatility Stop',
  'OBV', 'VPT', 'CMF', 'A/D Line', 'MFI', 'Volume Oscillator', 'Force Index', 'EOM',
  'Pivot Points', 'Fibonacci Levels', 'Gann Levels', 'Supply/Demand',
  'Trendlines', 'Chart Patterns', 'Candlestick Patterns',
  'Advance/Decline Line', 'McClellan Osc', 'TRIN', 'High-Low Index', 'Put/Call Ratio',
  'QQE', 'Laguerre RSI', 'Fisher Transform', 'Schaff Trend Cycle',
  'Ultimate Oscillator', 'Z-Score', 'T3 MA', 'RVI'
]

export default function IndicatorPanel({ selected, onChange }: Props) {
  const toggle = (name: string) => {
    const exists = selected.includes(name)
    const next = exists
      ? selected.filter((s) => s !== name)
      : [...selected, name]
    onChange(next)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 px-4 py-3 bg-zinc-900 text-white border border-zinc-700 rounded-md">
      {ALL_INDICATORS.map((name) => (
        <button
          key={name}
          onClick={() => toggle(name)}
          className={`text-sm px-3 py-1 rounded border ${
            selected.includes(name)
              ? 'bg-blue-600 border-blue-500'
              : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-600'
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  )
}
