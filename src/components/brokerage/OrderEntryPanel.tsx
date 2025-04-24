'use client'

import React, { useState } from 'react';

const OrderEntryPanel = () => {
  const [orderType, setOrderType] = useState('limit'); // limit, market, stop
  const [side, setSide] = useState('buy'); // buy, sell

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full text-gray-300">
      <div className="flex mb-4 border-b border-gray-700">
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
      <div className="flex justify-around mb-4 text-sm">
        <button onClick={() => setOrderType('limit')} className={orderType === 'limit' ? 'text-white font-semibold' : 'text-gray-500'}>Limit</button>
        <button onClick={() => setOrderType('market')} className={orderType === 'market' ? 'text-white font-semibold' : 'text-gray-500'}>Market</button>
        <button onClick={() => setOrderType('stop')} className={orderType === 'stop' ? 'text-white font-semibold' : 'text-gray-500'}>Stop Limit</button>
      </div>

      {/* Input Fields (Placeholders) */}
      {orderType === 'limit' && (
        <div className="mb-3">
          <label className="block text-xs text-gray-500 mb-1">Limit Price (USD)</label>
          <input type="number" placeholder="93000.00" className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white" />
        </div>
      )}
      {orderType === 'stop' && (
        <div className="mb-3">
          <label className="block text-xs text-gray-500 mb-1">Stop Price (USD)</label>
          <input type="number" placeholder="92800.00" className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white" />
        </div>
      )}
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">Amount (BTC)</label>
        <input type="number" placeholder="0.001" className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white" />
      </div>
      {/* Add other relevant inputs like TP/SL, Amount % etc. later */}

      {/* Submit Button */}
      <button className={`w-full p-3 rounded font-bold mt-4 ${side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}>
        {side === 'buy' ? 'Buy BTC' : 'Sell BTC'}
      </button>
      <p className="text-xs text-gray-500 mt-2 text-center">(Placeholder Panel)</p>

    </div>
  );
};

export default OrderEntryPanel; 