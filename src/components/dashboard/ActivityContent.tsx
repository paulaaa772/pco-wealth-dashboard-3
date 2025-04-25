import React, { useState } from 'react';
import AITradingPanel, { TradeSignal } from './AITradingPanel';

// Recent activity type
interface Activity {
  id: string;
  type: 'AI_TRADE' | 'MANUAL_TRADE' | 'DIVIDEND' | 'DEPOSIT' | 'WITHDRAWAL';
  symbol: string | null;
  action: string;
  quantity: number | null;
  price: number | null;
  timestamp: number;
  totalValue: number;
  status: 'completed' | 'pending' | 'failed';
}

// AI performance metrics
interface AIPerformance {
  totalTrades: number;
  winRate: number;
  averageReturn: number;
  totalProfit: number;
  lastMonth: {
    trades: number;
    winRate: number;
    profit: number;
  };
}

const ActivityContent: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [recentActivity, setRecentActivity] = useState<Activity[]>([
    {
      id: 'activity-001',
      type: 'AI_TRADE',
      symbol: 'GOOGL',
      action: 'BUY',
      quantity: 5,
      price: 175.38,
      timestamp: new Date().getTime() - 2.9 * 60 * 60 * 1000,
      totalValue: 876.90,
      status: 'completed'
    },
    {
      id: 'activity-002',
      type: 'AI_TRADE',
      symbol: 'AAPL',
      action: 'SELL',
      quantity: 8,
      price: 212.95,
      timestamp: new Date().getTime() - 1.8 * 60 * 60 * 1000,
      totalValue: 1703.60,
      status: 'completed'
    },
    {
      id: 'activity-003',
      type: 'MANUAL_TRADE',
      symbol: 'AMZN',
      action: 'BUY',
      quantity: 3,
      price: 182.27,
      timestamp: new Date().getTime() - 4.5 * 60 * 60 * 1000,
      totalValue: 546.81,
      status: 'completed'
    },
    {
      id: 'activity-004',
      type: 'DIVIDEND',
      symbol: 'VIG',
      action: 'DIVIDEND',
      quantity: null,
      price: null,
      timestamp: new Date().getTime() - 2 * 24 * 60 * 60 * 1000,
      totalValue: 12.48,
      status: 'completed'
    },
    {
      id: 'activity-005',
      type: 'DEPOSIT',
      symbol: null,
      action: 'DEPOSIT',
      quantity: null,
      price: null,
      timestamp: new Date().getTime() - 5 * 24 * 60 * 60 * 1000,
      totalValue: 1000.00,
      status: 'completed'
    }
  ]);
  
  const [aiPerformance] = useState<AIPerformance>({
    totalTrades: 27,
    winRate: 74,
    averageReturn: 2.3,
    totalProfit: 1842.65,
    lastMonth: {
      trades: 12,
      winRate: 83,
      profit: 978.32
    }
  });

  // Format timestamp to readable time
  const formatTimestamp = (timestamp: number) => {
    const now = new Date().getTime();
    const diffMs = now - timestamp;
    
    if (diffMs < 60 * 1000) {
      return 'Just now';
    } else if (diffMs < 60 * 60 * 1000) {
      const minutes = Math.floor(diffMs / (60 * 1000));
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffMs < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diffMs / (60 * 60 * 1000));
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  // Handle execution of AI trade
  const handleExecuteTrade = (signal: TradeSignal) => {
    // In a real app, you would make an API call to execute the trade
    // For this demo, we'll add it to the activity list
    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      type: 'AI_TRADE',
      symbol: signal.symbol,
      action: signal.action,
      quantity: Math.floor(1000 / signal.price), // Calculate quantity based on a fixed budget
      price: signal.price,
      timestamp: Date.now(),
      totalValue: Math.floor(1000 / signal.price) * signal.price,
      status: 'completed'
    };
    
    setRecentActivity(prev => [newActivity, ...prev]);
  };

  // Filter recent activity based on the selected filter
  const filteredActivity = recentActivity.filter(activity => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'ai' && activity.type === 'AI_TRADE') return true;
    if (selectedFilter === 'manual' && activity.type === 'MANUAL_TRADE') return true;
    if (selectedFilter === 'dividends' && activity.type === 'DIVIDEND') return true;
    if (selectedFilter === 'transfers' && 
       (activity.type === 'DEPOSIT' || activity.type === 'WITHDRAWAL')) return true;
    return false;
  });

  return (
    <div className="bg-[#172033] text-white p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Trading Activity</h2>
        <div className="flex space-x-3">
          <button 
            className={`px-3 py-1.5 rounded text-sm ${
              selectedFilter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#1D2939] text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setSelectedFilter('all')}
          >
            All Activity
          </button>
          <button 
            className={`px-3 py-1.5 rounded text-sm ${
              selectedFilter === 'ai' 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#1D2939] text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setSelectedFilter('ai')}
          >
            AI Trades
          </button>
          <button 
            className={`px-3 py-1.5 rounded text-sm ${
              selectedFilter === 'manual' 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#1D2939] text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setSelectedFilter('manual')}
          >
            Manual Trades
          </button>
        </div>
      </div>
      
      {/* AI Trading Panel */}
      <AITradingPanel onExecuteTrade={handleExecuteTrade} />
      
      {/* AI Performance Metrics */}
      <div className="bg-[#1D2939] rounded-lg overflow-hidden">
        <div className="border-b border-gray-700 p-4">
          <h3 className="text-lg font-semibold">AI Trading Performance</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#2D3748] rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-green-400">{aiPerformance.winRate}%</div>
              <div className="text-xs text-gray-400 mt-1">Based on {aiPerformance.totalTrades} trades</div>
            </div>
            <div className="bg-[#2D3748] rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Average Return</div>
              <div className="text-2xl font-bold text-green-400">+{aiPerformance.averageReturn}%</div>
              <div className="text-xs text-gray-400 mt-1">Per executed signal</div>
            </div>
            <div className="bg-[#2D3748] rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total Profit</div>
              <div className="text-2xl font-bold text-green-400">${aiPerformance.totalProfit.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-1">Since activation</div>
            </div>
            <div className="bg-[#2D3748] rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Last Month</div>
              <div className="text-2xl font-bold text-green-400">+${aiPerformance.lastMonth.profit.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-1">{aiPerformance.lastMonth.winRate}% win rate ({aiPerformance.lastMonth.trades} trades)</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Table */}
      <div className="bg-[#1D2939] rounded-lg overflow-hidden">
        <div className="border-b border-gray-700 p-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Details</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-800/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatTimestamp(activity.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.type === 'AI_TRADE' ? 'bg-blue-900/30 text-blue-400' : 
                        activity.type === 'MANUAL_TRADE' ? 'bg-purple-900/30 text-purple-400' : 
                        activity.type === 'DIVIDEND' ? 'bg-green-900/30 text-green-400' : 
                        'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {activity.type === 'AI_TRADE' ? 'AI Trade' : 
                         activity.type === 'MANUAL_TRADE' ? 'Manual Trade' : 
                         activity.type === 'DIVIDEND' ? 'Dividend' : 
                         activity.type.charAt(0) + activity.type.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {activity.type.includes('TRADE') && activity.symbol ? (
                        <div>
                          <span className={activity.action === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                            {activity.action}
                          </span>
                          {' '}
                          {activity.quantity} {activity.symbol} @ ${activity.price?.toFixed(2)}
                        </div>
                      ) : activity.type === 'DIVIDEND' && activity.symbol ? (
                        <div>Dividend payment from {activity.symbol}</div>
                      ) : (
                        <div>{activity.action}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <span className={`
                        ${activity.action === 'BUY' || activity.type === 'DEPOSIT' ? 'text-red-400' : 'text-green-400'}
                      `}>
                        {activity.action === 'BUY' || activity.type === 'DEPOSIT' ? '-' : '+'} 
                        ${activity.totalValue.toFixed(2)}
                      </span>
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
  );
};

export default ActivityContent; 