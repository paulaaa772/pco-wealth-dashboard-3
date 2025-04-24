'use client'

import { useState } from 'react'

const indicatorList = [
  'RSI', 'MACD', 'Bollinger Bands', 'EMA', 'SMA', 'ATR', 'ADX'
]

export default function IndicatorSelector({ onChange }: { onChange: (selected: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([])

  const toggleIndicator = (name: string) => {
    const updated = selected.includes(name)
      ? selected.filter(i => i !== name)
      : [...selected, name]
    setSelected(updated)
    onChange(updated)
  }

  return (
    <div className="p-2 border rounded bg-white dark:bg-zinc-800">
      <h2 className="font-bold mb-2">📊 Indicators</h2>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {indicatorList.map(name => (
          <button
            key={name}
            onClick={() => toggleIndicator(name)}
            className={`px-2 py-1 border rounded ${
              selected.includes(name)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-zinc-700 dark:text-white'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}
