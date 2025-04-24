'use client'

import { useState } from 'react'

const symbols = ['AAPL', 'MSFT', 'TSLA', 'NVDA', 'AMZN']

export default function TradeSimulator() {
  const [symbol, setSymbol] = useState('AAPL')
  const [action, setAction] = useState<'Buy' | 'Sell'>('Buy')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trade = { symbol, action, quantity: Number(quantity), price: Number(price) }
    console.log('Simulated Trade:', trade)
    alert(`Simulated ${action} of ${quantity} ${symbol} @ $${price}`)
  }

  return (
    <div>
      <h2 className="text-md font-semibold mb-2">🧪 Trade Simulator</h2>
      <form onSubmit={handleSubmit} className="space-y-2 text-sm">
        <div>
          <label className="block mb-1">Ticker</label>
          <select value={symbol} onChange={e => setSymbol(e.target.value)} className="w-full border px-2 py-1 rounded">
            {symbols.map(sym => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setAction('Buy')} className={`flex-1 px-2 py-1 rounded border ${action === 'Buy' ? 'bg-green-500 text-white' : ''}`}>Buy</button>
          <button type="button" onClick={() => setAction('Sell')} className={`flex-1 px-2 py-1 rounded border ${action === 'Sell' ? 'bg-red-500 text-white' : ''}`}>Sell</button>
        </div>
        <div>
          <label className="block mb-1">Quantity</label>
          <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div>
          <label className="block mb-1">Price</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full border px-2 py-1 rounded" required />
        </div>
        <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700">Submit Trade</button>
      </form>
    </div>
  )
}
