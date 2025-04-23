'use client'

import { useEffect, useState } from 'react'

type Candle = {
  time: string
  open: number
  high: number
  low: number
  close: number
}

export default function TradingChart() {
  const [data, setData] = useState<Candle[]>([])

  useEffect(() => {
    setData([
      { time: '2023-01-01', open: 100, high: 110, low: 95, close: 105 },
      { time: '2023-01-02', open: 105, high: 115, low: 100, close: 110 }
    ])
  }, [])

  return (
    <div className="p-4 border rounded bg-white dark:bg-zinc-900">
      <h2 className="text-lg font-bold mb-2">Trading Chart (Test View)</h2>
      <ul className="text-sm space-y-1">
        {data.map((candle, i) => (
          <li key={i}>
            {candle.time}: O:{candle.open} H:{candle.high} L:{candle.low} C:{candle.close}
          </li>
        ))}
      </ul>
    </div>
  )
}
