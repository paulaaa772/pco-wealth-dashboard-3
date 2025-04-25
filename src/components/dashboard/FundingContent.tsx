'use client';

import React, { useState } from 'react';
import { CreditCard, PlusCircle, AlignJustify, Repeat, Calendar, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';

// Bank account interface
interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  type: 'checking' | 'savings';
  primary: boolean;
  verified: boolean;
}

// Transaction interface
interface Transaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'recurring' | 'dividend';
  status: 'completed' | 'pending' | 'failed';
  amount: number;
  fromAccount?: string;
  toAccount?: string;
  description?: string;
}

// Recurring transfer interface
interface RecurringTransfer {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  fromAccount: string;
  toAccount: string;
  nextDate: string;
  active: boolean;
  day?: number;
}

interface FundingMethod {
  id: string;
  type: 'bank' | 'card' | 'crypto';
  name: string;
  lastFour?: string;
  accountType?: string;
  icon: string;
}

const FundingContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'recurring' | 'accounts' | 'history'>('deposit');
  
  // Form states
  const [amount, setAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedDepositAccount, setSelectedDepositAccount] = useState<string>('');
  const [selectedWithdrawAccount, setSelectedWithdrawAccount] = useState<string>('');
  const [recurringAmount, setRecurringAmount] = useState<string>('');
  const [recurringFrequency, setRecurringFrequency] = useState<string>('monthly');
  const [processing, setProcessing] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Mock bank accounts data
  const [bankAccounts] = useState<BankAccount[]>([
    {
      id: 'acct1',
      name: 'Primary Checking',
      accountNumber: '****4832',
      routingNumber: '021000021',
      bankName: 'Bank of America',
      type: 'checking',
      primary: true,
      verified: true
    },
    {
      id: 'acct2',
      name: 'Savings Account',
      accountNumber: '****7645',
      routingNumber: '021000021',
      bankName: 'Bank of America',
      type: 'savings',
      primary: false,
      verified: true
    },
    {
      id: 'acct3',
      name: 'Chase Checking',
      accountNumber: '****9876',
      routingNumber: '322271627',
      bankName: 'Chase',
      type: 'checking',
      primary: false,
      verified: true
    }
  ]);
  
  // Mock transactions
  const [transactions] = useState<Transaction[]>([
    {
      id: 'tx1',
      date: '2024-05-28',
      type: 'deposit',
      status: 'completed',
      amount: 1000.00,
      fromAccount: 'Primary Checking',
      toAccount: 'Brokerage',
      description: 'Monthly investment'
    },
    {
      id: 'tx2',
      date: '2024-05-15',
      type: 'withdrawal',
      status: 'completed',
      amount: 500.00,
      fromAccount: 'Brokerage',
      toAccount: 'Primary Checking',
      description: 'Emergency withdrawal'
    },
    {
      id: 'tx3',
      date: '2024-05-10',
      type: 'recurring',
      status: 'completed',
      amount: 250.00,
      fromAccount: 'Primary Checking',
      toAccount: 'Brokerage',
      description: 'Weekly recurring investment'
    },
    {
      id: 'tx4',
      date: '2024-06-01',
      type: 'deposit',
      status: 'pending',
      amount: 2500.00,
      fromAccount: 'Savings Account',
      toAccount: 'Brokerage',
      description: 'Investment deposit'
    },
    {
      id: 'tx5',
      date: '2024-04-30',
      type: 'dividend',
      status: 'completed',
      amount: 32.15,
      toAccount: 'Brokerage',
      description: 'Dividend payment'
    }
  ]);
  
  // Mock recurring transfers
  const [recurringTransfers] = useState<RecurringTransfer[]>([
    {
      id: 'rec1',
      type: 'deposit',
      amount: 250.00,
      frequency: 'weekly',
      fromAccount: 'Primary Checking',
      toAccount: 'Brokerage',
      nextDate: '2024-06-07',
      active: true,
      day: 5 // Friday
    },
    {
      id: 'rec2',
      type: 'deposit',
      amount: 1000.00,
      frequency: 'monthly',
      fromAccount: 'Primary Checking',
      toAccount: 'Brokerage',
      nextDate: '2024-07-01',
      active: true,
      day: 1
    },
    {
      id: 'rec3',
      type: 'withdrawal',
      amount: 500.00,
      frequency: 'monthly',
      fromAccount: 'Brokerage',
      toAccount: 'Savings Account',
      nextDate: '2024-06-15',
      active: false,
      day: 15
    }
  ]);
  
  // Mock funding methods
  const fundingMethods: FundingMethod[] = [
    { id: '1', type: 'bank', name: 'Chase Bank', lastFour: '4321', accountType: 'Checking', icon: '🏦' },
    { id: '2', type: 'card', name: 'Visa', lastFour: '8765', icon: '💳' },
    { id: '3', type: 'crypto', name: 'Bitcoin Wallet', icon: '₿' },
  ];
  
  // Mock transaction history
  const transactionHistory: Transaction[] = [
    { id: 't1', date: '2023-06-15', type: 'deposit', amount: 5000, status: 'completed', method: 'Chase Bank' },
    { id: 't2', date: '2023-05-28', type: 'withdrawal', amount: 2000, status: 'completed', method: 'Chase Bank' },
    { id: 't3', date: '2023-05-10', type: 'deposit', amount: 10000, status: 'completed', method: 'Bitcoin Wallet' },
    { id: 't4', date: '2023-04-22', type: 'deposit', amount: 1500, status: 'failed', method: 'Visa' },
    { id: 't5', date: '2023-04-05', type: 'withdrawal', amount: 3000, status: 'pending', method: 'Chase Bank' },
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate API call for funding
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setAmount('');
    }, 1500);
  };
  
  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Get transaction badge color
  const getTransactionBadgeColor = (type: string, status: string) => {
    if (status === 'pending') return 'bg-yellow-900/30 text-yellow-400';
    if (status === 'failed') return 'bg-red-900/30 text-red-400';
    
    switch (type) {
      case 'deposit':
        return 'bg-green-900/30 text-green-400';
      case 'withdrawal':
        return 'bg-red-900/30 text-red-400';
      case 'recurring':
        return 'bg-blue-900/30 text-blue-400';
      case 'dividend':
        return 'bg-purple-900/30 text-purple-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };
  
  const renderDepositWithdrawForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            name="amount"
            id="amount"
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Funding Method</label>
        <div className="space-y-3">
          {fundingMethods.map((method) => (
            <div
              key={method.id}
              className={`border rounded-lg p-4 cursor-pointer ${
                selectedMethod === method.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
              }`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <p className="font-medium">{method.name}</p>
                    {method.lastFour && (
                      <p className="text-sm text-gray-500">
                        {method.accountType ? `${method.accountType} •••• ` : '•••• '}{method.lastFour}
                      </p>
                    )}
                  </div>
                </div>
                {selectedMethod === method.id && (
                  <span className="text-indigo-600">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          + Add New Funding Method
        </button>
      </div>
      
      <div>
        <button
          type="submit"
          disabled={!amount || !selectedMethod}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            !amount || !selectedMethod
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {activeTab === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
        </button>
      </div>
    </form>
  );
  
  const renderTransactionHistory = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Method
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactionHistory.map((transaction) => (
            <tr key={transaction.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(transaction.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  transaction.type === 'deposit'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${transaction.amount.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.method}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  transaction.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : transaction.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  return (
    <div className="bg-[#172033] text-white p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Funding & Transfers</h2>
        <div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
            <PlusCircle className="h-4 w-4 inline mr-1" />
            Link New Account
          </button>
        </div>
      </div>
      
      {/* Funding Tabs */}
      <div className="bg-[#1D2939] rounded-lg overflow-hidden">
        <div className="border-b border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex items-center px-6 py-4 ${
                activeTab === 'deposit'
                  ? 'bg-[#2D3748] text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Deposit
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex items-center px-6 py-4 ${
                activeTab === 'withdraw'
                  ? 'bg-[#2D3748] text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Withdraw
            </button>
            <button
              onClick={() => setActiveTab('recurring')}
              className={`flex items-center px-6 py-4 ${
                activeTab === 'recurring'
                  ? 'bg-[#2D3748] text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Repeat className="h-4 w-4 mr-2" />
              Recurring
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`flex items-center px-6 py-4 ${
                activeTab === 'accounts'
                  ? 'bg-[#2D3748] text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Accounts
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center px-6 py-4 ${
                activeTab === 'history'
                  ? 'bg-[#2D3748] text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <AlignJustify className="h-4 w-4 mr-2" />
              History
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Deposit Form */}
          {activeTab === 'deposit' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Deposit Funds</h3>
              <p className="text-gray-400 mb-6">
                Transfer money from your bank account to your brokerage account to invest in securities.
              </p>
              
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                  <p>Funding request submitted successfully! Your account will be updated once the transaction is processed.</p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="underline text-sm mt-2"
                  >
                    Add more funds
                  </button>
                </div>
              )}
              
              {!success && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                        Amount to Fund
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="text"
                          id="amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                          placeholder="0.00"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">USD</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-2">
                        Funding Method
                      </label>
                      <select
                        id="method"
                        value={selectedMethod}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="bank">Bank Transfer (ACH)</option>
                        <option value="wire">Wire Transfer</option>
                        <option value="card">Debit Card</option>
                      </select>
                    </div>
                    
                    <div className="mt-8">
                      <button
                        type="submit"
                        disabled={processing || !amount}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 ${
                          processing || !amount ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        }`}
                      >
                        {processing ? 'Processing...' : 'Submit Funding Request'}
                      </button>
                    </div>
                  </form>
                  
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Funding Information</h3>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      <li className="mb-2">Bank transfers (ACH) typically take 1-3 business days to process</li>
                      <li className="mb-2">Wire transfers are usually completed within 24 hours</li>
                      <li className="mb-2">Debit card transfers are processed immediately but may have lower limits</li>
                      <li className="mb-2">Minimum funding amount: $100</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Withdraw Form */}
          {activeTab === 'withdraw' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Withdraw Funds</h3>
              <p className="text-gray-400 mb-6">
                Transfer money from your brokerage account to your bank account.
              </p>
              
              {renderDepositWithdrawForm()}
            </div>
          )}
          
          {/* Recurring Transfers */}
          {activeTab === 'recurring' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Recurring Transfers</h3>
              <p className="text-gray-400 mb-6">
                Set up automatic recurring transfers to regularly fund your investment account.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#2D3748] rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-5 w-5 text-blue-400 mr-2" />
                    <h4 className="text-md font-medium">Active Schedules</h4>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {recurringTransfers.filter(t => t.active).length}
                  </div>
                  <div className="text-sm text-gray-400">Recurring transfers</div>
                </div>
                
                <div className="bg-[#2D3748] rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <DollarSign className="h-5 w-5 text-green-400 mr-2" />
                    <h4 className="text-md font-medium">Monthly Total</h4>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    ${recurringTransfers
                      .filter(t => t.active && t.type === 'deposit')
                      .reduce((sum, t) => {
                        if (t.frequency === 'weekly') return sum + (t.amount * 4);
                        if (t.frequency === 'biweekly') return sum + (t.amount * 2);
                        if (t.frequency === 'monthly') return sum + t.amount;
                        if (t.frequency === 'quarterly') return sum + (t.amount / 3);
                        return sum;
                      }, 0)
                      .toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">Total monthly investment</div>
                </div>
                
                <div className="bg-[#2D3748] rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <Repeat className="h-5 w-5 text-purple-400 mr-2" />
                    <h4 className="text-md font-medium">Next Transfer</h4>
                  </div>
                  <div className="text-xl font-bold text-white mb-1">
                    {recurringTransfers
                      .filter(t => t.active)
                      .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())[0]?.nextDate 
                      ? formatDate(recurringTransfers
                          .filter(t => t.active)
                          .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())[0].nextDate)
                      : 'None scheduled'}
                  </div>
                  <div className="text-sm text-gray-400">Next automatic transfer</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* New Recurring Transfer Form */}
                <div className="bg-[#2D3748] rounded-lg p-5">
                  <h4 className="text-lg font-medium mb-4">Create New Recurring Transfer</h4>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Transfer Type</label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input 
                            type="radio" 
                            name="transferType" 
                            value="deposit" 
                            className="text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-700 bg-[#2D3748]"
                            defaultChecked 
                          />
                          <span className="ml-2 text-gray-300">Deposit</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input 
                            type="radio" 
                            name="transferType" 
                            value="withdraw" 
                            className="text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-700 bg-[#2D3748]" 
                          />
                          <span className="ml-2 text-gray-300">Withdraw</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">From Account</label>
                      <select className="w-full bg-[#313e57] text-white border border-gray-700 rounded-md px-3 py-2">
                        {bankAccounts.map(account => (
                          <option key={account.id} value={account.id}>
                            {account.bankName} - {account.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">To Account</label>
                      <select className="w-full bg-[#313e57] text-white border border-gray-700 rounded-md px-3 py-2">
                        <option>Brokerage Account</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-400">$</span>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full bg-[#313e57] text-white border border-gray-700 rounded-md px-3 py-2 pl-7"
                          value={recurringAmount}
                          onChange={(e) => setRecurringAmount(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Frequency</label>
                      <select 
                        className="w-full bg-[#313e57] text-white border border-gray-700 rounded-md px-3 py-2"
                        value={recurringFrequency}
                        onChange={(e) => setRecurringFrequency(e.target.value)}
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Starting Date</label>
                      <input
                        type="date"
                        className="w-full bg-[#313e57] text-white border border-gray-700 rounded-md px-3 py-2"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    
                    <div className="pt-2">
                      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md">
                        Create Recurring Transfer
                      </button>
                    </div>
                  </form>
                </div>
                
                {/* Active Recurring Transfers */}
                <div>
                  <h4 className="text-lg font-medium mb-4">Active Recurring Transfers</h4>
                  
                  <div className="space-y-4">
                    {recurringTransfers.filter(transfer => transfer.active).map(transfer => (
                      <div key={transfer.id} className="bg-[#2D3748] rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-white">${transfer.amount.toFixed(2)} {transfer.frequency}</h5>
                            <div className="text-sm text-gray-400 mt-1">
                              Next: {formatDate(transfer.nextDate)}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transfer.type === 'deposit' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                            }`}>
                              {transfer.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-sm">
                          <div className="flex items-center">
                            <ArrowRight className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-gray-300">
                              {transfer.fromAccount} to {transfer.toAccount}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex space-x-2">
                          <button className="text-xs border border-gray-600 text-gray-300 hover:bg-gray-700 px-2 py-1 rounded">
                            Edit
                          </button>
                          <button className="text-xs border border-red-900 text-red-400 hover:bg-red-900/20 px-2 py-1 rounded">
                            Pause
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {recurringTransfers.filter(transfer => transfer.active).length === 0 && (
                      <div className="bg-[#2D3748] rounded-lg p-4 text-center text-gray-400">
                        No active recurring transfers
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Linked Accounts */}
          {activeTab === 'accounts' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Linked Bank Accounts</h3>
              <p className="text-gray-400 mb-6">
                Manage your linked bank accounts for deposits and withdrawals.
              </p>
              
              <div className="space-y-4">
                {bankAccounts.map(account => (
                  <div key={account.id} className="bg-[#2D3748] rounded-lg p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-white flex items-center">
                          {account.bankName} - {account.name}
                          {account.primary && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-900/30 text-blue-400 text-xs rounded-full">Primary</span>
                          )}
                        </h4>
                        <div className="text-sm text-gray-400 mt-1">
                          Account: {account.accountNumber}
                        </div>
                        <div className="text-sm text-gray-400">
                          Routing: {account.routingNumber}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          account.verified ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                        }`}>
                          {account.verified ? 'Verified' : 'Pending Verification'}
                        </span>
                        <div className="text-sm text-gray-400 mt-1 capitalize">
                          {account.type} Account
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-3">
                      {!account.primary && (
                        <button className="text-xs border border-blue-600 text-blue-400 hover:bg-blue-900/20 px-3 py-1.5 rounded">
                          Set as Primary
                        </button>
                      )}
                      <button className="text-xs border border-gray-600 text-gray-300 hover:bg-gray-700 px-3 py-1.5 rounded">
                        Edit
                      </button>
                      <button className="text-xs border border-red-600 text-red-400 hover:bg-red-900/20 px-3 py-1.5 rounded">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Link New Bank Account
                </button>
              </div>
            </div>
          )}
          
          {/* Transaction History */}
          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
              <p className="text-gray-400 mb-6">
                View your transaction history.
              </p>
              
              {renderTransactionHistory()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FundingContent; 