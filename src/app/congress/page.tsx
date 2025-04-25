'use client'

import React, { useState } from 'react'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface CongressMember {
  id: string;
  name: string;
  party: string;
  chamber: string;
  imageUrl: string;
  transactions: number;
  avgValue: number;
}

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

const mockCongressMembers: CongressMember[] = [
  {
    id: '1',
    name: 'Nancy Pelosi',
    party: 'Democratic',
    chamber: 'House',
    imageUrl: 'https://via.placeholder.com/150',
    transactions: 23,
    avgValue: 2500000
  },
  {
    id: '2',
    name: 'Dan Crenshaw',
    party: 'Republican',
    chamber: 'House',
    imageUrl: 'https://via.placeholder.com/150',
    transactions: 15,
    avgValue: 350000
  },
  {
    id: '3',
    name: 'Josh Gottheimer',
    party: 'Democratic',
    chamber: 'House',
    imageUrl: 'https://via.placeholder.com/150',
    transactions: 12,
    avgValue: 175000
  },
  {
    id: '4',
    name: 'Michael McCaul',
    party: 'Republican',
    chamber: 'House',
    imageUrl: 'https://via.placeholder.com/150',
    transactions: 18,
    avgValue: 750000
  },
  {
    id: '5',
    name: 'Elizabeth Warren',
    party: 'Democratic',
    chamber: 'Senate',
    imageUrl: 'https://via.placeholder.com/150',
    transactions: 7,
    avgValue: 125000
  },
  {
    id: '6',
    name: 'Ted Cruz',
    party: 'Republican',
    chamber: 'Senate',
    imageUrl: 'https://via.placeholder.com/150',
    transactions: 9,
    avgValue: 430000
  },
  {
    id: '7',
    name: 'Bernie Sanders',
    party: 'Independent',
    chamber: 'Senate',
    imageUrl: 'https://via.placeholder.com/150',
    transactions: 5,
    avgValue: 95000
  }
];

const stats = [
  { name: 'Total Trades', value: '156', change: '+23% vs. last month' },
  { name: 'Average Trade Size', value: '$750,000', change: '+12% vs. last month' },
  { name: 'Most Active Trader', value: 'Nancy Pelosi', subtext: '23 trades this month' },
  { name: 'Top Traded Stock', value: 'NVDA', subtext: '$12.5M total volume' },
]

export default function Congress() {
  const [selectedMember, setSelectedMember] = useState<CongressMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [partyFilter, setPartyFilter] = useState('');
  const [chamberFilter, setChamberFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sectorFilter, setSectorFilter] = useState('All')

  const sectors = Array.from(new Set(mockTrades.map((t) => t.symbol)))

  const filteredTrades = mockTrades.filter(
    (t) => sectorFilter === 'All' || t.symbol === sectorFilter
  )

  // Filter congress members based on search query and filters
  const filteredMembers = mockCongressMembers.filter(member => {
    return (
      (searchQuery === '' || member.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (partyFilter === '' || member.party === partyFilter) &&
      (chamberFilter === '' || member.chamber === chamberFilter)
    );
  });

  const handleMemberSelect = (member: CongressMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

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

      {/* Add search and filter controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col">
          <label htmlFor="search" className="mb-1 text-sm font-medium">Search Members</label>
          <input
            id="search"
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="partyFilter" className="mb-1 text-sm font-medium">Party</label>
          <select
            id="partyFilter"
            value={partyFilter}
            onChange={(e) => setPartyFilter(e.target.value)}
            className="p-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Parties</option>
            <option value="Democratic">Democratic</option>
            <option value="Republican">Republican</option>
            <option value="Independent">Independent</option>
          </select>
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="chamberFilter" className="mb-1 text-sm font-medium">Chamber</label>
          <select
            id="chamberFilter"
            value={chamberFilter}
            onChange={(e) => setChamberFilter(e.target.value)}
            className="p-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Chambers</option>
            <option value="Senate">Senate</option>
            <option value="House">House</option>
          </select>
        </div>
      </div>

      {/* Congress Members Grid */}
      <div className="rounded-lg bg-white dark:bg-zinc-800 shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Congress Members</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredMembers.map((member) => (
            <div 
              key={member.id} 
              className="bg-gray-50 dark:bg-zinc-700 rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-100 dark:hover:bg-zinc-600 cursor-pointer transition"
              onClick={() => handleMemberSelect(member)}
            >
              <div className="flex-shrink-0">
                <img 
                  src={member.imageUrl} 
                  alt={member.name} 
                  className="h-16 w-16 rounded-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white font-medium">{member.name}</h3>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium mr-2 ${
                    member.party === 'Democratic' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                    member.party === 'Republican' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {member.party}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{member.chamber}</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {member.transactions} trades | Avg: ${member.avgValue.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Member Details Modal */}
      {isModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <img 
                  src={selectedMember.imageUrl} 
                  alt={selectedMember.name} 
                  className="h-20 w-20 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedMember.name}</h2>
                  <div className="flex items-center mt-1">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium mr-2 ${
                      selectedMember.party === 'Democratic' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                      selectedMember.party === 'Republican' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {selectedMember.party}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">{selectedMember.chamber}</span>
                  </div>
                </div>
              </div>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setIsModalOpen(false)}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{selectedMember.transactions}</p>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Value</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">${selectedMember.avgValue.toLocaleString()}</p>
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Trades</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                <thead>
                  <tr>
                    <th scope="col" className="py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Symbol</th>
                    <th scope="col" className="py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                    <th scope="col" className="py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                    <th scope="col" className="py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                  {/* Filter trades for this member */}
                  {mockTrades
                    .filter(trade => trade.representative === selectedMember.name)
                    .map((trade) => (
                    <tr key={trade.id}>
                      <td className="py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="font-medium text-gray-900 dark:text-white">{trade.symbol}</div>
                        <div className="text-xs">{trade.company}</div>
                      </td>
                      <td className="py-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          trade.type === 'Buy' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-right text-gray-500 dark:text-gray-400">
                        ${trade.amount}
                      </td>
                      <td className="py-4 text-sm text-right text-gray-500 dark:text-gray-400">
                        {new Date(trade.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {mockTrades.filter(trade => trade.representative === selectedMember.name).length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No trades found for this member
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
