'use client'

import React from 'react';

const TradeHistory = () => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full text-gray-300">
      <h3 className="text-lg font-semibold text-white mb-3">Trade History</h3>
       {/* Placeholder content - Replace with actual data later */}
      <div className="flex justify-between text-xs mb-1 text-gray-500">
        <span>Amount (BTC)</span>
        <span>Price (USD)</span>
        <span>Time</span>
      </div>
      <div className="overflow-y-auto h-32"> {/* Limited height */}
        {[...Array(10)].map((_, i) => {
          const isBuy = Math.random() > 0.5;
          return (
            <div key={`trade-${i}`} className={`flex justify-between text-sm mb-0.5 ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
              <span>{(Math.random() * 0.1).toFixed(6)}</span>
              <span>{(93000 + (Math.random() * 200 - 100)).toFixed(2)}</span>
              <span className="text-gray-500">{new Date(Date.now() - i * 5000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</span>
            </div>
          )
        })}
      </div>
       <p className="text-xs text-gray-500 mt-2 text-center">(Placeholder Data)</p>
    </div>
  );
};

export default TradeHistory; 