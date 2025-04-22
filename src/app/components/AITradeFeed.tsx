'use client'

import { useEffect } from 'react'
import { useAITradeStore } from '../../hooks/useAITradeStore'

export default function AITradeFeed() {
  const trades = useAITradeStore((s) => s.trades)
  const push = useAITradeStore((s) => s.add)

  useEffect(() => {
    const interval = setInterval(() => {
      const types = ['BUY', 'SELL'] as const
      const names = ['Pelosi', 'Elon Musk', 'Tom Carper', 'Nancy Mace']
      const details = [
        'bought $500,000 of NVDA',
        'sold 10,000 shares of TSLA',
        'bought $250,000 (copied Pelosi) of AMD',
        'flagged insider trade in GOOGL',
      ]

      const type = types[Math.floor(Math.random() * types.length)]
      const name = names[Math.floor(Math.random() * names.length)]
      const detail = details[Math.floor(Math.random() * details.length)]
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      push({ type, name, detail, time })
    }, 6000)

    return () => clearInterval(interval)
  }, [push])

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Live AI Trade Feed</h2>
      <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-[200px] overflow-y-auto text-sm">
        {trades.length === 0 && <p className="text-gray-500">Waiting for trades...</p>}
        <ul className="space-y-2">
          {trades.map((trade, idx) => (
            <li
              key={idx}
              className={`p-2 rounded ${
                trade.type === 'BUY'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {trade.type === 'BUY' ? '🧠 BUY —' : '⚠️ SELL —'} {trade.name}{' '}
              <strong>{trade.detail}</strong> at {trade.time}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
