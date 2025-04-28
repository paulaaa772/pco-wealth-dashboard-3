'use client'

import React, { useState } from 'react';

// Data and helper functions for Transfer content
// This should ideally be fetched or managed via state/context
const getTransferData = () => {
  return {
    pendingTransfers: [
      {
        id: 'tr-001',
        type: 'deposit',
        amount: 2500,
        source: 'Bank of America (...4832)',
        destination: 'Individual Brokerage',
        status: 'pending',
        initiatedDate: '2024-06-15',
        estimatedCompletionDate: '2024-06-17'
      }
    ],
    recentTransfers: [
      {
        id: 'tr-105',
        type: 'deposit',
        amount: 1000,
        source: 'Bank of America (...4832)',
        destination: 'Individual Brokerage',
        status: 'completed',
        initiatedDate: '2024-05-28',
        completedDate: '2024-05-30'
      },
      {
        id: 'tr-104',
        type: 'withdrawal',
        amount: 500,
        source: 'Individual Brokerage',
        destination: 'Bank of America (...4832)',
        status: 'completed',
        initiatedDate: '2024-05-15',
        completedDate: '2024-05-17'
      },
      {
        id: 'tr-103',
        type: 'deposit',
        amount: 3000,
        source: 'Chase (...7645)',
        destination: 'IRA Account',
        status: 'completed',
        initiatedDate: '2024-04-12',
        completedDate: '2024-04-14'
      },
      {
        id: 'tr-102',
        type: 'transfer',
        amount: 1500,
        source: 'Individual Brokerage',
        destination: 'IRA Account',
        status: 'completed',
        initiatedDate: '2024-03-20',
        completedDate: '2024-03-22'
      }
    ],
    accounts: [
      { id: 'acc-1', name: 'Individual Brokerage', balance: 45782.61, type: 'brokerage' },
      { id: 'acc-2', name: 'IRA Account', balance: 32145.89, type: 'retirement' },
      { id: 'acc-3', name: 'Bank of America (...4832)', balance: 8245.32, type: 'bank' },
      { id: 'acc-4', name: 'Chase (...7645)', balance: 3520.14, type: 'bank' }
    ],
    externalBrokerages: [
      { name: 'Robinhood', logo: '/robinhood-logo.png' },
      { name: 'Fidelity', logo: '/fidelity-logo.png' },
      { name: 'Charles Schwab', logo: '/schwab-logo.png' },
      { name: 'Vanguard', logo: '/vanguard-logo.png' },
      { name: 'TD Ameritrade', logo: '/td-ameritrade-logo.png' },
      { name: 'E*TRADE', logo: '/etrade-logo.png' },
      { name: 'Interactive Brokers', logo: '/ibkr-logo.png' },
      { name: 'Webull', logo: '/webull-logo.png' }
    ]
  };
};

// Content component for Transfers tab
const TransfersTab = () => {
  const transferData = getTransferData();
  const [activeTransferTab, setActiveTransferTab] = useState('money');
  
  return (
    <div className="bg-[#172033] text-white p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Transfers & Funding</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
          View Transaction History
        </button>
      </div>
      
      {/* Transfer Type Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTransferTab('money')}
            className={`pb-4 ${ 
              activeTransferTab === 'money'
                ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Money Transfers
          </button>
          <button
            onClick={() => setActiveTransferTab('inkind')}
            className={`pb-4 ${ 
              activeTransferTab === 'inkind'
                ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            In-Kind Transfers
          </button>
        </div>
      </div>
      
      {/* Money Transfer Content */}
      {activeTransferTab === 'money' && (
        <div className="space-y-8">
          {/* Money Movement Card */}
          <div className="bg-[#1D2939] rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold">Move Money</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">From</label>
                    <select className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md px-3 py-2">
                      {transferData.accounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.name} (${account.balance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">To</label>
                    <select className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md px-3 py-2">
                      {transferData.accounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400">$</span>
                      <input
                        type="text"
                        placeholder="0.00"
                        className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md px-3 py-2 pl-7"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">Frequency</label>
                    <select className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md px-3 py-2">
                      <option>One-time</option>
                      <option>Weekly</option>
                      <option>Bi-weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">Date</label>
                    <input
                      type="date"
                      className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md">
                      Preview Transfer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pending Transfers */}
          {transferData.pendingTransfers.length > 0 && (
            <div className="bg-[#1D2939] rounded-lg overflow-hidden">
              <div className="border-b border-gray-700 p-4">
                <h3 className="text-lg font-semibold">Pending Transfers</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">From/To</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {transferData.pendingTransfers.map((transfer) => (
                        <tr key={transfer.id} className="hover:bg-gray-800/30">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {transfer.initiatedDate}
                            <div className="text-xs text-gray-500">Est. completion: {transfer.estimatedCompletionDate}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ 
                              transfer.type === 'deposit' ? 'bg-green-900/30 text-green-400' : 
                              transfer.type === 'withdrawal' ? 'bg-red-900/30 text-red-400' : 
                              'bg-blue-900/30 text-blue-400'
                            }`}>
                              {transfer.type.charAt(0).toUpperCase() + transfer.type.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            <div>From: {transfer.source}</div>
                            <div>To: {transfer.destination}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-white">
                            ${transfer.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400">
                              Pending
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <button className="text-red-400 hover:text-red-300">
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Recent Transfers */}
          <div className="bg-[#1D2939] rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold">Recent Transfers</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">From/To</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {transferData.recentTransfers.map((transfer) => (
                      <tr key={transfer.id} className="hover:bg-gray-800/30">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {transfer.initiatedDate}
                          <div className="text-xs text-gray-500">Completed: {transfer.completedDate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ 
                            transfer.type === 'deposit' ? 'bg-green-900/30 text-green-400' : 
                            transfer.type === 'withdrawal' ? 'bg-red-900/30 text-red-400' : 
                            'bg-blue-900/30 text-blue-400'
                          }`}>
                            {transfer.type.charAt(0).toUpperCase() + transfer.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div>From: {transfer.source}</div>
                          <div>To: {transfer.destination}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-white">
                          ${transfer.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* In-Kind Transfer Content */}
      {activeTransferTab === 'inkind' && (
        <div className="space-y-8">
          <div className="bg-[#1D2939] rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold">Transfer Your Portfolio</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-6">
                Transfer your securities from another brokerage to your account without selling. This preserves your cost basis and avoids tax consequences.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">Transfer From</label>
                    <select className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md px-3 py-2">
                      <option value="">Select a brokerage</option>
                      {transferData.externalBrokerages.map((brokerage, index) => (
                        <option key={index} value={brokerage.name}>
                          {brokerage.name}
                        </option>
                      ))}
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">Account Number at Other Brokerage</label>
                    <input
                      type="text"
                      placeholder="Enter account number"
                      className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">Transfer To</label>
                    <select className="w-full bg-[#2D3748] text-white border border-gray-700 rounded-md px-3 py-2">
                      {transferData.accounts
                        .filter(account => account.type === 'brokerage' || account.type === 'retirement')
                        .map(account => (
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">Transfer Type</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="full-transfer"
                          name="transfer-type"
                          className="text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-700 bg-[#2D3748]"
                          defaultChecked
                        />
                        <label htmlFor="full-transfer" className="text-white">Full Transfer (All securities and cash)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="partial-transfer"
                          name="transfer-type"
                          className="text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-700 bg-[#2D3748]"
                        />
                        <label htmlFor="partial-transfer" className="text-white">Partial Transfer (Select specific assets)</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md">
                      Start Transfer Process
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                      You&apos;ll need to upload account statements in the next step for verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1D2939] rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold">Transfer Progress</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-300 mb-4">You have no in-kind transfers in progress.</p>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                  Start a New Transfer
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1D2939] rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold">Common Questions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-white mb-2">How long does an in-kind transfer take?</h4>
                  <p className="text-gray-300 text-sm">
                    Most transfers complete within 5-7 business days. Complex portfolios or issues with the sending institution may cause delays.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-2">Are there any fees for transferring my account?</h4>
                  <p className="text-gray-300 text-sm">
                    We do not charge any fees for incoming transfers. However, your current brokerage may charge an outgoing transfer fee, typically between $50-$75.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-2">Can I trade during the transfer process?</h4>
                  <p className="text-gray-300 text-sm">
                    For full account transfers, your positions will be frozen at the sending institution during the transfer process. For partial transfers, only the specific assets being transferred may be restricted.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-2">What if I have unsupported securities?</h4>
                  <p className="text-gray-300 text-sm">
                    If we don&apos;t support certain securities in your current portfolio, you have options to liquidate them before transfer or we can help you transfer them elsewhere.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransfersTab; 