'use client'

import TradingChart from '../../components/TradingChart'
import TradingInterface from '../../components/dashboard/TradingInterface'

export default function BrokeragePage() {
  const mockData = [
    { time: '2023-01-01', open: 100, high: 110, low: 95, close: 105 },
    { time: '2023-01-02', open: 105, high: 115, low: 100, close: 110 },
    // Add more mock data points for better visualization
    { time: '2023-01-03', open: 110, high: 120, low: 105, close: 115 },
    { time: '2023-01-04', open: 115, high: 125, low: 110, close: 120 },
    { time: '2023-01-05', open: 120, high: 130, low: 115, close: 125 },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <TradingInterface />
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Market Chart</h2>
            <div className="h-[500px]">
              <TradingChart data={mockData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
