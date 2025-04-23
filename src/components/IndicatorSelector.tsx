'use client'

import { useState } from 'react'

const INDICATORS = [
  'SMA',
  'EMA',
  'RSI',
  'MACD',
  'BollingerBands',
  'ATR',
  'ADX'
]

export default function IndicatorSelector({ onSelect }: { onSelect: (indicator: string) => void }) {
  const [selected, setSelected] = useState<string>('')

  return (
    <div className="mt-4 flex gap-2 items-center">
      <label className="text-sm font-medium">Add Indicator:</label>
      <select
        className="border rounded px-2 py-1 text-sm"
        value={selected}
        onChange={(e) => {
          const value = e.target.value
          setSelected(value)
          if (value) onSelect(value)
        }}
      >
        <option value="">Select...</option>
        {INDICATORS.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}
