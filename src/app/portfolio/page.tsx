'use client'

import { useState } from 'react'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

const holdings = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 1000,
    avgPrice: 175.25,
    currentPrice: 182.50,
    value: 182500,
    gain: 7250,
    gainPercent: 4.14,
    allocation: 7.42
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    shares: 500,
    avgPrice: 350.75,
    currentPrice: 380.50,
    value: 190250,
    gain: 14875,
    gainPercent: 8.48,
    allocation: 7.74
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    shares: 300,
    avgPrice: 125.50,
    currentPrice: 140.25,
    value: 42075,
    gain: 4425,
    gainPercent: 11.75,
    allocation: 1.71
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    shares: 400,
    avgPrice: 145.75,
    currentPrice: 155.50,
    value: 62200,
    gain: 3900,
    gainPercent: 6.69,
    allocation: 2.53
  },
  // Add more holdings as needed
]

const metrics = [
  { name: 'Total Value', value: '$2,457,892.54' },
  { name: 'Day Change', value: '+$15,824.31 (0.64%)', positive: true },
  { name: 'Total Gain/Loss', value: '+$457,892.54 (22.89%)', positive: true },
  { name: 'Dividend Yield', value: '2.34%' },
]

export default function Portfolio() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Portfolio</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Detailed view of your investment holdings and performance
        </p>
      </div>

      {/* Portfolio Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className="rounded-lg bg-white dark:bg-zinc-800 px-6 py-5 shadow"
          >
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.name}</dt>
            <dd className={`mt-1 text-xl font-semibold ${
              metric.positive ? 'text-green-600 dark:text-green-400' :
              metric.positive === false ? 'text-red-600 dark:text-red-400' :
              'text-gray-900 dark:text-white'
            }`}>
              {metric.value}
            </dd>
          </div>
        ))}
      </div>

      {/* Holdings Table */}
      <div className="rounded-lg bg-white dark:bg-zinc-800 shadow">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Holdings</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                A detailed list of all your investment positions
              </p>
            </div>
          </div>
          <div className="mt-6 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-0">Symbol</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">Shares</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">Avg Price</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">Current Price</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">Value</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">Gain/Loss</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">Allocation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                    {holdings.map((holding) => (
                      <tr key={holding.symbol}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-0">
                          {holding.symbol}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{holding.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500 dark:text-gray-400">{holding.shares.toLocaleString()}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500 dark:text-gray-400">${holding.avgPrice.toFixed(2)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500 dark:text-gray-400">${holding.currentPrice.toFixed(2)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500 dark:text-gray-400">${holding.value.toLocaleString()}</td>
                        <td className={`whitespace-nowrap px-3 py-4 text-sm text-right ${
                          holding.gain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          <div className="flex items-center justify-end">
                            {holding.gain >= 0 ? (
                              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                            )}
                            ${Math.abs(holding.gain).toLocaleString()} ({Math.abs(holding.gainPercent).toFixed(2)}%)
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500 dark:text-gray-400">
                          {holding.allocation.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
