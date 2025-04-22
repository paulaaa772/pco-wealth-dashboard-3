'use client'
import { useEffect, useState } from 'react'

export default function MarketTicker() {
  const [prices, setPrices] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/polygon?ticker=AAPL,MSFT,TSLA')
      const data = await res.json()
      setPrices(data)
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex gap-8 overflow-x-auto py-2">
      {Object.entries(prices).map(([ticker, price]) => (
        <div key={ticker} className="shrink-0">
          <span className="font-medium">{ticker}</span>
          <span className="ml-2 text-emerald-600">${price?.toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}
