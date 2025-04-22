'use client'

import TradingChart from '../components/TradingChart'
import TransferForm from '../components/TransferForm'
import { useState } from 'react'
import MaximizedChartPanel from '../components/MaximizedChartPanel'

export default function BrokeragePage() {
  const [showFullChart, setShowFullChart] = useState(false)

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Left: Signals */}
      <div className="w-1/5 space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-md font-semibold">AI + Insider Signals</h2>
            <button
              className="text-xs text-blue-600 underline"
              onClick={() => alert('Maximize signals TBD')}
            >
              Maximize
            </button>
          </div>
          <ul className="text-sm mt-2 list-disc list-inside space-y-1">
            <li>✅ Copying Nancy Pelosi’s latest trades</li>
            <li>✅ Monitoring Elon Musk insider buys</li>
            <li>✅ Sector rotation: Defense → AI</li>
          </ul>
        </div>
      </div>

      {/* Center: Chart */}
      <div className="flex-1 relative">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-md font-semibold">Live Chart</h2>
          <button
            className="text-xs text-blue-600 underline"
            onClick={() => setShowFullChart(true)}
          >
            Maximize
          </button>
        </div>
        <TradingChart />
      </div>

      {/* Right: Transfer */}
      <div className="w-1/5 bg-white border border-gray-200 rounded-lg p-4 relative">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-md font-semibold">Trade + Transfer</h2>
          <button
            className="text-xs text-blue-600 underline"
            onClick={() => alert('Maximize transfer TBD')}
          >
            Maximize
          </button>
        </div>
        <div className="text-sm text-gray-600 mb-4">
          💰 Balance: <strong>$50,000</strong>
          <br />
          📝 Active Bot: <strong>Enabled</strong>
        </div>
        <TransferForm />
      </div>

      {/* Modal: Max Chart + Feed */}
      {showFullChart && (
        <MaximizedChartPanel onClose={() => setShowFullChart(false)} />
      )}
    </div>
  )
}

import TradeFeed from '../components/TradeFeed'

{/* Show Live Mongo Trade Feed */}
<div className="mt-6">
  <TradeFeed />
</div>
