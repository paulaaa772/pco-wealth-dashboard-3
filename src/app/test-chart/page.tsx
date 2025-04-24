'use client'
import TradingChart from '@/components/TradingChart'

const sampleData = [
  { time: '2024-01-01', open: 100, high: 105, low: 98, close: 103, volume: 1000 },
  { time: '2024-01-02', open: 103, high: 108, low: 102, close: 107, volume: 1200 },
  { time: '2024-01-03', open: 107, high: 110, low: 105, close: 106, volume: 900 },
];

export default function TestChart() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Chart Test</h1>
      <TradingChart data={sampleData} symbol="TEST" />
    </div>
  )
}
