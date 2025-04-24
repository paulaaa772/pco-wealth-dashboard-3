'use client'

import React, { useState } from 'react';

// Define props if we need to pass data or functions down later
interface OrderEntryPanelProps {
    symbol?: string; // e.g., BTC, AAPL
    baseCurrency?: string; // e.g., USD
    // Add a function prop later to actually handle the order submission simulation
    // onPlaceOrder: (order: ManualOrder) => void;
}

// Simple structure for the simulated order
interface ManualOrder {
    symbol: string;
    side: 'buy' | 'sell';
    type: 'limit' | 'market' | 'stop';
    amount: number;
    limitPrice?: number;
    stopPrice?: number;
}

const OrderEntryPanel: React.FC<OrderEntryPanelProps> = ({ 
    symbol = 'BTC', // Default symbol for placeholders
    baseCurrency = 'USD' 
}) => {
  const [orderType, setOrderType] = useState('limit'); // limit, market, stop
  const [side, setSide] = useState<'buy' | 'sell'>('buy'); // buy, sell
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handlePlaceOrder = () => {
      setStatusMessage(null); // Clear previous message
      const orderAmount = parseFloat(amount);
      const orderLimitPrice = parseFloat(limitPrice);
      const orderStopPrice = parseFloat(stopPrice);

      if (isNaN(orderAmount) || orderAmount <= 0) {
          setStatusMessage('Error: Invalid amount.');
          return;
      }
      
      let simulatedOrder: ManualOrder = {
        symbol: symbol,
        side: side,
        type: orderType,
        amount: orderAmount,
      };

      if (orderType === 'limit') {
          if (isNaN(orderLimitPrice) || orderLimitPrice <= 0) {
             setStatusMessage('Error: Invalid limit price.');
             return;
          }
          simulatedOrder.limitPrice = orderLimitPrice;
      } else if (orderType === 'stop') {
           if (isNaN(orderStopPrice) || orderStopPrice <= 0) {
             setStatusMessage('Error: Invalid stop price.');
             return;
          } 
          // Stop-limit often requires a limit price too, simplifying for now
          simulatedOrder.stopPrice = orderStopPrice;
          // Placeholder for limit price in a real stop-limit
          if (!isNaN(orderLimitPrice) && orderLimitPrice > 0) {
              simulatedOrder.limitPrice = orderLimitPrice;
          } else {
              // Default: use stop price as limit for simple stop-limit
              simulatedOrder.limitPrice = orderStopPrice; 
          }
      }
      // Market orders just need amount

      console.log('--- Manual Order Simulation ---', simulatedOrder);
      setStatusMessage(`Simulated ${side.toUpperCase()} ${orderType.toUpperCase()} order placed for ${orderAmount} ${symbol}.`);
      
      // Clear inputs after simulation
      setLimitPrice('');
      setStopPrice('');
      setAmount('');

      // Hide status message after a few seconds
      setTimeout(() => setStatusMessage(null), 4000);

      // TODO: Later, call a prop function like onPlaceOrder(simulatedOrder)
      // to notify the parent component to update positions or chart visuals.
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full text-gray-300 flex flex-col">
      {/* Buy/Sell Tabs */}
      <div className="flex mb-4 border-b border-gray-700 flex-shrink-0">
        <button 
          onClick={() => setSide('buy')} 
          className={`flex-1 pb-2 text-center font-semibold ${side === 'buy' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-500'}`}
        >
          Buy
        </button>
        <button 
          onClick={() => setSide('sell')} 
          className={`flex-1 pb-2 text-center font-semibold ${side === 'sell' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-500'}`}
        >
          Sell
        </button>
      </div>

      {/* Order Type Selector */}
      <div className="flex justify-around mb-4 text-sm flex-shrink-0">
        <button onClick={() => setOrderType('limit')} className={`px-2 py-1 rounded ${orderType === 'limit' ? 'bg-gray-600 text-white font-semibold' : 'text-gray-500 hover:text-gray-300'}`}>Limit</button>
        <button onClick={() => setOrderType('market')} className={`px-2 py-1 rounded ${orderType === 'market' ? 'bg-gray-600 text-white font-semibold' : 'text-gray-500 hover:text-gray-300'}`}>Market</button>
        <button onClick={() => setOrderType('stop')} className={`px-2 py-1 rounded ${orderType === 'stop' ? 'bg-gray-600 text-white font-semibold' : 'text-gray-500 hover:text-gray-300'}`}>Stop Limit</button>
      </div>

      {/* Input Fields Area - Allows scrolling if content overflows */}
      <div className="flex-grow overflow-y-auto pr-1"> {/* Added padding-right for scrollbar */} 
          {orderType === 'limit' && (
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">Limit Price ({baseCurrency})</label>
              <input 
                type="number" 
                placeholder="Enter price" 
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
          {orderType === 'stop' && (
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">Stop Price ({baseCurrency})</label>
              <input 
                type="number" 
                placeholder="Enter stop price" 
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
               />
               {/* Optional Limit for Stop Limit */}
               <label className="block text-xs text-gray-400 mt-2 mb-1">Limit Price (Optional for Stop Limit)</label>
               <input 
                 type="number" 
                 placeholder="Defaults to stop price" 
                 value={limitPrice} // Reuse limitPrice state for stop-limit's limit
                 onChange={(e) => setLimitPrice(e.target.value)}
                 className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
               />
            </div>
          )}
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Amount ({symbol})</label>
            <input 
              type="number" 
              placeholder="Enter amount" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {/* Placeholder for % amount buttons */}
          <div className="flex justify-between text-xs text-gray-400 mb-4">
              <span>Amount %:</span>
              <button className="hover:text-white">25%</button>
              <button className="hover:text-white">50%</button>
              <button className="hover:text-white">75%</button>
              <button className="hover:text-white">Max</button>
          </div>

          {/* Add other relevant inputs like TP/SL later */}
      </div>
      
      {/* Status Message */}
      <div className="h-6 mt-2 flex-shrink-0"> {/* Fixed height for status */}
        {statusMessage && (
            <p className={`text-xs ${statusMessage.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
              {statusMessage}
            </p>
        )}
       </div>

      {/* Submit Button */}
      <div className="mt-auto pt-2 flex-shrink-0"> {/* Pushes button to bottom */} 
          <button 
            onClick={handlePlaceOrder}
            className={`w-full p-3 rounded font-bold ${side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white text-sm uppercase`}
          >
            {side === 'buy' ? `Buy ${symbol}` : `Sell ${symbol}`}
          </button>
      </div>
    </div>
  );
};

export default OrderEntryPanel; 