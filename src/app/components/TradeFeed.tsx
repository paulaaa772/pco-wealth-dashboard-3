'use client'

import { useTradeSimStore } from '@/hooks/useTradeSimStore'

export default function TradeFeed() {
  const trades = useTradeSimStore((s) => s.trades.slice().reverse())

  if (trades.length === 0) return <p className="text-gray-500 text-sm">No trades yet.</p>

  return (
    <div className="text-sm mt-4 space-y-2 max-h-[200px] overflow-y-auto">
      <h3 className="font-semibold mb-2">📈 Trade History</h3>
      {trades.map((t, i) => (
        <div
          key={i}
          className={`border px-3 py-2 rounded shadow-sm ${
            t.action === 'Buy'
              ? 'bg-green-100 text-green-800 border-green-300'
              : 'bg-red-100 text-red-800 border-red-300'
          }`}
        >
          <strong>{t.action}</strong> {t.quantity} <span className="font-mono">{t.symbol}</span> @ ${t.price} — {t.timestamp}
        </div>
      ))}
    </div>
  )
}
