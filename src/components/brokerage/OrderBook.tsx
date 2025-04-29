'use client'

import React from 'react';

export interface Order {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: number;
  status: 'open' | 'filled' | 'canceled';
}

interface OrderBookProps {
  orders: Order[];
}

const OrderBook: React.FC<OrderBookProps> = ({ orders }) => {
  const openOrders = orders.filter(order => order.status === 'open');

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Open Orders</h3>
      
      {openOrders.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          No open orders. Use the panel above to place an order.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {openOrders.map((order, index) => (
                <tr key={order.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-700`}>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {order.symbol}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-md font-medium ${
                      order.type === 'buy' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {order.type === 'buy' ? 'Buy' : 'Sell'}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    {order.quantity}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    ${order.price.toFixed(2)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    ${(order.quantity * order.price).toFixed(2)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                    {new Date(order.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderBook; 