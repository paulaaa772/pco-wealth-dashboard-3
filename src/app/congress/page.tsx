'use client'

import { useState } from 'react'

type Trade = {
  id: number
  chamber: 'House' | 'Senate'
  name: string
  party: string
  action: 'Bought' | 'Sold'
  ticker: string
  sector: string
  amount: string
  date: string
  note: string
}

const mockTrades: Trade[] = [
  {
    id: 1,
    chamber: 'Senate',
    name: 'Tom Carper',
    party: 'D',
    action: 'Bought',
    ticker: 'MSFT',
    sector: 'Tech',
    amount: '$100,001–$250,000',
    date: '2025-04-20',
    note: 'AI copied this trade for NVDA on 4/21.',
  },
  {
    id: 2,
    chamber: 'Senate',
    name: 'John Thune',
    party: 'R',
    action: 'Sold',
    ticker: 'XOM',
    sector: 'Energy',
    amount: '$15,001–$50,000',
    date: '2025-04-18',
    note: 'Flagged for energy selloff.',
  },
  {
    id: 3,
    chamber: 'House',
    name: 'Nancy Pelosi',
    party: 'D',
    action: 'Bought',
    ticker: 'NVDA',
    sector: 'Tech',
    amount: '$500,000',
    date: '2025-04-19',
    note: 'High volume detected. AI copied trade.',
  },
  {
    id: 4,
    chamber: 'House',
    name: 'Marjorie Taylor Greene',
    party: 'R',
    action: 'Sold',
    ticker: 'RTX',
    sector: 'Defense',
    amount: '$1,001–$15,000',
    date: '2025-04-17',
    note: 'Matched drop in sector ETF. AI ignored.',
  },
]

export default function CongressPage() {
  const [sectorFilter, setSectorFilter] = useState('All')

  const sectors = Array.from(new Set(mockTrades.map((t) => t.sector)))

  const filteredTrades = mockTrades.filter(
    (t) => sectorFilter === 'All' || t.sector === sectorFilter
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Congress Trading Tracker</h1>
        <div>
          <label className="mr-2 text-sm font-medium">Filter by Sector:</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
          >
            <option value="All">All</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTrades.map((t) => (
          <div
            key={t.id}
            className={`border rounded-lg p-4 shadow-sm ${
              t.action === 'Bought' ? 'border-green-400' : 'border-red-400'
            }`}
          >
            <p className="font-medium">
              🏛 <span className="font-bold">{t.name}</span> ({t.party}) <br />
              <span className={t.action === 'Bought' ? 'text-green-700' : 'text-red-700'}>
                {t.action} {t.ticker} ({t.sector})
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-1">{t.amount} on {t.date}</p>
            <p className="text-xs text-gray-500 italic mt-2">{t.note}</p>
            <button className="mt-3 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
              Copy Trade
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
