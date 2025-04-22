'use client'

import { useState } from 'react'

const holdings = [
  { name: 'NVIDIA', symbol: 'NVDA', sector: 'Tech', value: 2300, change: 5.1 },
  { name: 'Apple', symbol: 'AAPL', sector: 'Tech', value: 1800, change: -1.2 },
  { name: 'Alphabet', symbol: 'GOOGL', sector: 'Tech', value: 1200, change: 2.3 },
  { name: 'Terran Orbital', symbol: 'LLAP', sector: 'Defense', value: 500, change: 8.8 },
  { name: 'MicroStrategy', symbol: 'MSTR', sector: 'Bitcoin', value: 1100, change: 6.9 },
]

export default function PortfolioPage() {
  const [filter, setFilter] = useState('All')
  const filtered = filter === 'All' ? holdings : holdings.filter(h => h.sector === filter)

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)
  const totalChange = holdings.reduce((sum, h) => sum + (h.value * h.change) / 100, 0)
  const sectors = ['All', ...new Set(holdings.map(h => h.sector))]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Portfolio</h1>
        <select
          className="border px-2 py-1 rounded text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {sectors.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Holdings Summary */}
        <div className="md:col-span-2">
          <div className="mb-4 border rounded-lg p-4 bg-white shadow-sm">
            <div className="text-gray-600 text-sm">Total Portfolio Value</div>
            <div className="text-2xl font-semibold">${totalValue.toLocaleString()}</div>
            <div className={`text-sm ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChange >= 0 ? '+' : ''}
              {((totalChange / totalValue) * 100).toFixed(2)}%
            </div>
          </div>

          {filtered.map((h) => (
            <div key={h.symbol} className="flex justify-between items-center p-4 border rounded-lg mb-3 bg-white shadow-sm">
              <div>
                <div className="text-sm text-gray-600">{h.sector}</div>
                <div className="font-semibold text-lg">
                  {h.name}{' '}
                  <span className="text-sm text-gray-400">({h.symbol})</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${h.value.toLocaleString()}</div>
                <div className={`text-sm ${h.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {h.change >= 0 ? '+' : ''}
                  {h.change.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Donut Allocation Chart */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-md font-semibold mb-4">Portfolio Allocation</h2>
          <div className="w-full flex justify-center">
            <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center text-sm text-gray-500">
              Coming Soon
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
