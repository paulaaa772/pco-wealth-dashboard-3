'use client'

import { useAITradeStore } from '../../hooks/useAITradeStore'

type Props = {
  name: string
  party: string
  ticker: string
  action: 'Buy' | 'Sell'
  amount: string
  date: string
  sector: string
}

export default function CongressTradeCard({
  name,
  party,
  ticker,
  action,
  amount,
  date,
  sector,
}: Props) {
  const push = useAITradeStore((s) => s.add)

  const handleCopy = () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    push({
      type: action.toUpperCase() as 'BUY' | 'SELL',
      name,
      detail: `${action.toLowerCase()} ${amount} of ${ticker}`,
      time,
    })
  }

  return (
    <div className="border p-4 rounded shadow-sm space-y-1 text-sm bg-white">
      <p>
        <span className="text-lg">🏛️</span>{' '}
        <strong>
          {name} ({party})
        </strong>
      </p>
      <p>
        {action === 'Buy' ? '🟢' : '🔴'} <strong>{action} {ticker}</strong> ({sector})
      </p>
      <p className="text-gray-600 text-xs">{amount} on {date}</p>
      <button
        onClick={handleCopy}
        className="mt-2 text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Copy Trade
      </button>
    </div>
  )
}
