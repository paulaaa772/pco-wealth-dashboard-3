'use client'

import { useMemo } from 'react'

type Holding = {
  name: string
  ticker: string
  sector: string
  value: number
  change: number
}

export default function PortfolioSummaryBar({ holdings }: { holdings: Holding[] }) {
  const totalValue = useMemo(() => holdings.reduce((sum, h) => sum + h.value, 0), [holdings])
  const totalChange = useMemo(() => holdings.reduce((sum, h) => sum + (h.value * h.change / 100), 0), [holdings])
  const changePercent = totalValue > 0 ? (totalChange / totalValue) * 100 : 0

  return (
    <div className="bg-gray-50 dark:bg-zinc-800 px-6 py-4 rounded-lg border border-gray-200 dark:border-zinc-700 shadow">
      <div className="flex justify-between items-center flex-wrap text-sm font-medium">
        <div className="mb-1 mr-4">
          <span className="text-gray-600 dark:text-gray-300">Total Portfolio Value:</span>{' '}
          <span className="text-black dark:text-white text-lg">${totalValue.toLocaleString()}</span>
        </div>
        <div className="mb-1 mr-4">
          <span className="text-gray-600 dark:text-gray-300">Total Gain/Loss:</span>{' '}
          <span className={changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
            {changePercent >= 0 ? '+' : ''}
            {changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  )
}
