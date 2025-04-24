'use client'

import TradingChart from '../components/TradingChart'

export default function BrokeragePage() {
  const mockData = [
    { time: '2023-01-01', open: 100, high: 110, low: 95, close: 105 },
    { time: '2023-01-02', open: 105, high: 115, low: 100, close: 110 },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <TradingChart data={mockData} />
    </div>
  )
}
