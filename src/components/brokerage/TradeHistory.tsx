'use client'

import React from 'react';
import { Position } from '@/lib/trading-engine/AITradingEngine';

interface TradeHistoryProps {
    symbol?: string;
    positions: Position[];
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ symbol = 'BTC', positions }) => {
  const sortedTrades = [...positions]
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full text-gray-300 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-3 flex-shrink-0">Trade History (AI)</h3>
      <div className="flex justify-between text-xs mb-1 text-gray-500 flex-shrink-0">
        <span>Amount ({symbol})</span>
        <span>Price (USD)</span>
        <span>Time</span>
      </div>
      <div className="flex-grow overflow-y-auto pr-1"> 
        {sortedTrades.length > 0 ? sortedTrades.map((trade) => {
          const isBuy = trade.type === 'buy';
          const tradeTime = trade.timestamp ? new Date(trade.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'}) : '--:--:--';
          return (
            <div key={trade.id} className={`flex justify-between text-sm mb-0.5 ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
              <span>{trade.quantity.toFixed(6)}</span>
              <span>{trade.entryPrice.toFixed(2)}</span>
              <span className="text-gray-500">{tradeTime}</span>
            </div>
          )
        }) : (
            <div className="text-center text-sm text-gray-500 pt-4">No AI trade history yet.</div>
        )}
      </div>
    </div>
  );
};

export default TradeHistory; 