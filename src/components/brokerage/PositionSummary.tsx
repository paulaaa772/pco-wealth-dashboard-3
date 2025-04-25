import React from 'react';

export interface Position {
  id: string;
  symbol: string;
  type: 'long' | 'short';
  entryPrice: number;
  quantity: number;
  currentPrice: number;
  entryDate: Date;
  unrealizedPnL: number;
  percentChange: number;
}

interface PositionSummaryProps {
  positions: Position[];
  onClosePosition?: (positionId: string) => void;
}

const PositionSummary: React.FC<PositionSummaryProps> = ({ positions, onClosePosition }) => {
  const totalValue = positions.reduce((sum, pos) => 
    sum + (pos.currentPrice * pos.quantity), 0);
  
  const totalPnL = positions.reduce((sum, pos) => 
    sum + pos.unrealizedPnL, 0);
  
  const calculateDuration = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    } else {
      return `${diffHours}h`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Active Positions</h3>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Value</div>
          <div className="text-lg font-semibold">${totalValue.toFixed(2)}</div>
          <div className={`text-xs font-medium ${
            totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} USD
          </div>
        </div>
      </div>
      
      {positions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Entry</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">P/L</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                {onClosePosition && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {positions.map((position) => (
                <tr key={position.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{position.symbol}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      position.type === 'long' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {position.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{position.quantity}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${position.entryPrice.toFixed(2)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${position.currentPrice.toFixed(2)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className={`${
                      position.unrealizedPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      ${Math.abs(position.unrealizedPnL).toFixed(2)}
                      <span className="text-xs ml-1">
                        ({position.unrealizedPnL >= 0 ? '+' : '-'}{Math.abs(position.percentChange).toFixed(2)}%)
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {calculateDuration(position.entryDate)}
                  </td>
                  {onClosePosition && (
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => onClosePosition(position.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 rounded text-xs font-medium transition-colors"
                      >
                        Close
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400">No active positions</p>
        </div>
      )}
    </div>
  );
};

export default PositionSummary; 