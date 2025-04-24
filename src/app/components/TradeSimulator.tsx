'use client'

import { useState } from 'react'
import { useTradeSimStore } from '@/hooks/useTradeSimStore'

export default function TradeSimulator() {
  const [symbol, setSymbol] = useState('')
  const [action, setAction] = useState<'Buy' | 'Sell'>('Buy')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')

  const addTrade = useTradeSimStore((s) => s.addTrade)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addTrade({ symbol, action, quantity: +quantity, price: +price })
    setSymbol('')
    setQuantity('')
    setPrice('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 text-sm">
      <h3 className="font-semibold">💸 Simulate Trade</h3>

      <input
        placeholder="Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="w-full border rounded px-2 py-1"
      />

      <select
        value={action}
        onChange={(e) => setAction(e.target.value as 'Buy' | 'Sell')}
        className="w-full border rounded px-2 py-1"
      >
        <option value="Buy">Buy</option>
        <option value="Sell">Sell</option>
      </select>

      <input
        placeholder="Quantity"
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-full border rounded px-2 py-1"
      />

      <input
        placeholder="Price"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full border rounded px-2 py-1"
      />

      <button type="submit" className="w-full bg-blue-600 text-white py-1 rounded">
        Simulate Trade
      </button>
    </form>
  )
}
