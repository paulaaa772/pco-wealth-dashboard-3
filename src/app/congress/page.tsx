'use client'

import { useState } from 'react'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

type Trade = {
  id: number
  representative: string
  party: string
  state: string
  symbol: string
  company: string
  type: string
  amount: string
  date: string
  disclosure: string
  performance: number
}

const mockTrades: Trade[] = [
  {
    id: 1,
    representative: 'Nancy Pelosi',
    party: 'D',
    state: 'CA',
    symbol: 'NVDA',
    company: 'NVIDIA Corporation',
    type: 'Buy',
    amount: '1,000,000-5,000,000',
    date: '2024-02-15',
    disclosure: '2024-02-28',
    performance: 12.5
  },
  {
    id: 2,
    representative: 'Dan Crenshaw',
    party: 'R',
    state: 'TX',
    symbol: 'TSLA',
    company: 'Tesla, Inc.',
    type: 'Sell',
    amount: '250,000-500,000',
    date: '2024-02-14',
    disclosure: '2024-02-27',
    performance: -5.2
  },
  {
    id: 3,
    representative: 'Josh Gottheimer',
    party: 'D',
    state: 'NJ',
    symbol: 'MSFT',
    company: 'Microsoft Corporation',
    type: 'Buy',
    amount: '100,000-250,000',
    date: '2024-02-13',
    disclosure: '2024-02-26',
    performance: 8.7
  },
  {
    id: 4,
    representative: 'Michael McCaul',
    party: 'R',
    state: 'TX',
    symbol: 'AAPL',
    company: 'Apple Inc.',
    type: 'Buy',
    amount: '500,000-1,000,000',
    date: '2024-02-12',
    disclosure: '2024-02-25',
    performance: 3.4
  },
]

const stats = [
  { name: 'Total Trades', value: '156', change: '+23% vs. last month' },
  { name: 'Average Trade Size', value: '$750,000', change: '+12% vs. last month' },
  { name: 'Most Active Trader', value: 'Nancy Pelosi', subtext: '23 trades this month' },
  { name: 'Top Traded Stock', value: 'NVDA', subtext: '$12.5M total volume' },
]

export default function Congress() {
  const [sectorFilter, setSectorFilter] = useState('All')

  const sectors = Array.from(new Set(mockTrades.map((t) => t.symbol)))

  const filteredTrades = mockTrades.filter(
    (t) => sectorFilter === 'All' || t.symbol === sectorFilter
  )

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Congress Trading</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Track and analyze trading activity by members of Congress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-lg bg-white dark:bg-zinc-800 px-6 py-5 shadow"
          >
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-xl font-semibold text-gray-900 dark:text-white">
                {stat.value}
                {stat.subtext && (
                  <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.subtext}
                  </span>
                )}
              </div>
              {stat.change && (
                <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0">
                  {stat.change}
                </div>
              )}
            </dd>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-zinc-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-zinc-800 sm:text-sm sm:leading-6"
              placeholder="Search by representative, symbol, or company..."
            />
          </div>
        </div>
        <div className="flex gap-4">
          <select className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-zinc-800 sm:text-sm sm:leading-6">
            <option>All Parties</option>
            <option>Democrat</option>
            <option>Republican</option>
          </select>
          <select className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-zinc-800 sm:text-sm sm:leading-6">
            <option>All Types</option>
            <option>Buy</option>
            <option>Sell</option>
          </select>
        </div>
      </div>

      {/* Trades Table */}
      <div className="rounded-lg bg-white dark:bg-zinc-800 shadow">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Trades</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Latest disclosed trades by members of Congress
              </p>
            </div>
          </div>
          <div className="mt-6 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-0">Representative</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Party/State</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Symbol</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">Trade Date</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                    {filteredTrades.map((trade) => (
                      <tr key={trade.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-0">
                          {trade.representative}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                            trade.party === 'D' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {trade.party}
                          </span>
                          <span className="ml-2">{trade.state}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{trade.symbol}</div>
                            <div className="text-gray-500 dark:text-gray-400">{trade.company}</div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                            trade.type === 'Buy' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500 dark:text-gray-400">
                          ${trade.amount}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500 dark:text-gray-400">
                          <div>{new Date(trade.date).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-400">
                            Disclosed: {new Date(trade.disclosure).toLocaleDateString()}
                          </div>
                        </td>
                        <td className={`whitespace-nowrap px-3 py-4 text-sm text-right ${
                          trade.performance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          <div className="flex items-center justify-end">
                            {trade.performance >= 0 ? (
                              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                            )}
                            {Math.abs(trade.performance)}%
                          </div>
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
