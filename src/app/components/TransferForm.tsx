'use client'

import { useState } from 'react'

export default function TransferForm() {
  const [destination, setDestination] = useState('')
  const [asset, setAsset] = useState('')
  const [amount, setAmount] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Transferring ${amount} of ${asset} to ${destination}`)
  }

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Transfer Assets</h2>
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div>
          <label className="block mb-1 font-medium">Destination</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          >
            <option value="">Select...</option>
            <option value="Brokerage A">Brokerage A</option>
            <option value="Brokerage B">Brokerage B</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Asset</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
          >
            <option value="">Select...</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="NVDA">NVDA</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Amount</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 w-full hover:bg-blue-700"
        >
          Submit Transfer
        </button>
      </form>
    </div>
  )
}
