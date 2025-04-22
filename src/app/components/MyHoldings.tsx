'use client'

type Holding = {
  ticker: string
  sector: string
  quantity: number
  avgCost: number
  currentPrice: number
}

const holdings: Holding[] = [
  { ticker: 'NVDA', sector: 'Tech', quantity: 50, avgCost: 240, currentPrice: 960 },
  { ticker: 'TSLA', sector: 'Auto', quantity: 20, avgCost: 180, currentPrice: 160 },
  { ticker: 'BTC', sector: 'Crypto', quantity: 0.5, avgCost: 20000, currentPrice: 31500 },
  { ticker: 'LLAP', sector: 'Defense', quantity: 100, avgCost: 3.2, currentPrice: 1.05 },
]

export default function MyHoldings() {
  return (
    <div className="space-y-4">
      {holdings.map((h) => {
        const gain = h.currentPrice - h.avgCost
        const value = h.quantity * h.currentPrice
        const gainText = gain >= 0 ? 'text-green-600' : 'text-red-600'

        return (
          <div
            key={h.ticker}
            className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-4 rounded shadow-sm"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">{h.ticker}</h2>
              <span className={`text-sm ${gainText}`}>
                {gain > 0 ? '▲' : '▼'} ${gain.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {h.quantity} units @ ${h.avgCost.toFixed(2)} | Sector: {h.sector}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Total Value: ${value.toLocaleString()}
            </p>
          </div>
        )
      })}
    </div>
  )
}
