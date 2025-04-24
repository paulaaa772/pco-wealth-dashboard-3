'use client'

import React from 'react'; // Removed useState, useEffect

interface OrderBookProps {
    symbol?: string; 
    latestPrice?: number | null; // Pass latest known price from parent
}

const OrderBook: React.FC<OrderBookProps> = ({ symbol = 'BTC', latestPrice }) => {

  // Remove internal state and useEffect for fetching quote
  // const [latestQuote, setLatestQuote] = useState<{ bid: number, ask: number } | null>(null);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  // useEffect(() => { ... fetchQuote logic removed ... }, [symbol]);

  // Calculate mid-price based on passed prop
  let midPrice = '--.--';
  let simulatedBid = 92900; // Default mock bids/asks
  let simulatedAsk = 93100;
  
  if (latestPrice && typeof latestPrice === 'number') {
      const spread = latestPrice * 0.0005; 
      simulatedAsk = latestPrice + spread / 2;
      simulatedBid = latestPrice - spread / 2;
      midPrice = ((simulatedBid + simulatedAsk) / 2).toFixed(2);
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full text-gray-300 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-3 flex-shrink-0">Order Book</h3>
      <div className="flex justify-between text-xs mb-1 text-gray-500 flex-shrink-0">
        <span>Amount ({symbol})</span>
        <span>Price (USD)</span>
      </div>
      
      {/* Asks (Sell Orders) - Static Mock Data (uses simulatedAsk) */}
      <div className="text-red-400 flex-grow overflow-y-auto order-1"> 
        {[...Array(15)].map((_, i) => (
          <div key={`ask-${i}`} className="flex justify-between text-sm mb-0.5">
            <span>{(Math.random() * 0.5).toFixed(6)}</span>
            <span>{( simulatedAsk + (Math.random() * 100) ).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Mid Price Display (no loading/error state needed here now) */}
      <div className={`text-center text-lg font-bold my-1 py-1 border-y border-gray-700 flex-shrink-0 order-2 text-white`}>
         { midPrice }
      </div>

      {/* Bids (Buy Orders) - Static Mock Data (uses simulatedBid) */}
      <div className="text-green-400 flex-grow overflow-y-auto order-3"> 
        {[...Array(15)].map((_, i) => (
          <div key={`bid-${i}`} className="flex justify-between text-sm mb-0.5">
            <span>{(Math.random() * 0.5).toFixed(6)}</span>
            <span>{( simulatedBid - (Math.random() * 100) ).toFixed(2)}</span>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default OrderBook; 