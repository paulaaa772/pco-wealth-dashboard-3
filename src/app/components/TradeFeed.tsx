'use client'

import { useEffect, useState } from 'react'

type Trade = {
  _id: string
  symbol: string
  type: 'BUY' | 'SELL'
  amount: number
  detail: string
  timestamp: string
}

export default function TradeFeed() {
  const [trades, setTrades] = useState<Trade[]>([])

  useEffect(() => {
    fetch('/api/trades/load')
      .then(res => res.json())
      .then(data => setTrades(data))
      .catch(err => console.error('Failed to load trades:', err))
  }, [])

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">📈 Live Trades from MongoDB</h2>
      <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-[200px] overflow-y-auto text-sm">
        {trades.length === 0 ? (
          <p className="text-gray-500">No recent trades yet...</p>
        ) : (
          <ul className="space-y-2">
            {trades.map(trade => (
              <li
                key={trade._id}
                className={`p-2 rounded ${
                  trade.type === 'BUY'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {trade.type === 'BUY' ? '🟢 BUY' : '🔻 SELL'} — <strong>{trade.symbol}</strong> {trade.detail} ({trade.amount})<br />
                <span className="text-xs text-gray-500">{new Date(trade.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
