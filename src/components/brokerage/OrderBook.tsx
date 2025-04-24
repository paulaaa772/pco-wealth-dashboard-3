'use client'

import React from 'react';

const OrderBook = () => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full text-gray-300">
      <h3 className="text-lg font-semibold text-white mb-3">Order Book</h3>
      {/* Placeholder content - Replace with actual data later */}
      <div className="flex justify-between text-xs mb-1 text-gray-500">
        <span>Amount (BTC)</span>
        <span>Price (USD)</span>
      </div>
      {/* Mock Asks (Sell Orders) */}
      <div className="text-red-400">
        {[...Array(5)].map((_, i) => (
          <div key={`ask-${i}`} className="flex justify-between text-sm mb-0.5">
            <span>{ (Math.random() * 0.5).toFixed(6) }</span>
            <span>{ (93000 + Math.random() * 100).toFixed(2) }</span>
          </div>
        ))}
      </div>
      <div className="text-center text-lg font-bold my-1 py-1 border-y border-gray-700 text-white">
        93000.50 {/* Mock Mid Price */}
      </div>
      {/* Mock Bids (Buy Orders) */}
      <div className="text-green-400">
        {[...Array(5)].map((_, i) => (
          <div key={`bid-${i}`} className="flex justify-between text-sm mb-0.5">
            <span>{ (Math.random() * 0.5).toFixed(6) }</span>
            <span>{ (92900 + Math.random() * 100).toFixed(2) }</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4 text-center">(Placeholder Data)</p>
    </div>
  );
};

export default OrderBook; 