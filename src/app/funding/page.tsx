"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FundingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success
      setIsProcessing(false);
      setAmount('');
      setMessage(`Your ${activeTab} of $${amount} was processed successfully.`);
    } catch (error) {
      setIsProcessing(false);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Funding</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <ul className="flex flex-wrap -mb-px">
              <li className="mr-2">
                <button 
                  onClick={() => setActiveTab('deposit')}
                  className={`inline-block py-4 px-4 text-sm font-medium text-center border-b-2 ${
                    activeTab === 'deposit' 
                      ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' 
                      : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Deposit
                </button>
              </li>
              <li className="mr-2">
                <button 
                  onClick={() => setActiveTab('withdrawal')}
                  className={`inline-block py-4 px-4 text-sm font-medium text-center border-b-2 ${
                    activeTab === 'withdrawal' 
                      ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' 
                      : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Withdrawal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`inline-block py-4 px-4 text-sm font-medium text-center border-b-2 ${
                    activeTab === 'history' 
                      ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' 
                      : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  History
                </button>
              </li>
            </ul>
          </div>

          {message && (
            <div className={`p-4 mb-6 rounded-md ${message.includes('error') ? 'bg-red-100 text-red-700 dark:bg-red-200 dark:text-red-800' : 'bg-green-100 text-green-700 dark:bg-green-200 dark:text-green-800'}`}>
              {message}
            </div>
          )}

          {(activeTab === 'deposit' || activeTab === 'withdrawal') && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount ($)
                </label>
                <input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {activeTab === 'deposit' ? 'Payment Method' : 'Withdrawal Method'}
                </label>
                <select
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="crypto">Cryptocurrency</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !amount}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isProcessing || !amount
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isProcessing ? 'Processing...' : activeTab === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
              </button>
            </form>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="rounded-md bg-gray-50 dark:bg-gray-700 p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Transactions</h3>
                <div className="mt-4">
                  <div className="border-t border-gray-200 dark:border-gray-600">
                    <div className="py-3 flex justify-between">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        <div className="font-medium">Deposit</div>
                        <div className="text-gray-500 dark:text-gray-400">Bank Transfer</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">+$5,000.00</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">May 15, 2023</div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600">
                    <div className="py-3 flex justify-between">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        <div className="font-medium">Withdrawal</div>
                        <div className="text-gray-500 dark:text-gray-400">Bank Transfer</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-red-600 dark:text-red-400">-$2,000.00</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">April 28, 2023</div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600">
                    <div className="py-3 flex justify-between">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        <div className="font-medium">Deposit</div>
                        <div className="text-gray-500 dark:text-gray-400">Credit Card</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">+$1,000.00</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">April 10, 2023</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 