'use client'

import TradingChart from './TradingChart'
import AITradeFeed from './AITradeFeed'
import TradeFeed from './TradeFeed'

type Props = {
  onClose: () => void
}

export default function MaximizedChartPanel({ onClose }: Props) {
  return (
    <div className="absolute inset-0 z-50 bg-white p-6 shadow-xl rounded-lg overflow-y-auto border border-blue-400"> 
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Full Chart & AI Trade Feed</h2>
        <button onClick={onClose} className="text-blue-600 text-sm underline">
          Close
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TradingChart />
        <div>
          <AITradeFeed />
          <TradeFeed />
        </div>
      </div>
    </div>
  )
}
