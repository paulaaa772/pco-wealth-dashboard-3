'use client'

import React, { useState, useEffect } from 'react';
import { PolygonService } from '@/lib/market-data/PolygonService'; // Assuming path alias is set up

interface OrderBookProps {
    symbol?: string; // Pass symbol down
}

const OrderBook: React.FC<OrderBookProps> = ({ symbol = 'BTC' }) => {
  const [latestQuote, setLatestQuote] = useState<{ bid: number, ask: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!symbol) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const polygonService = PolygonService.getInstance();
        // NOTE: PolygonService doesn't have a dedicated 'getQuote' method in our current code.
        // We'll *simulate* getting a quote using getLatestPrice for now.
        // A real implementation would likely use a different endpoint or websocket.
        
        const price = await polygonService.getLatestPrice(symbol);
        if (price) {
            // Simulate bid/ask spread around the latest price
            const spread = price * 0.0005; // Example spread
            setLatestQuote({ ask: price + spread / 2, bid: price - spread / 2 });
        } else {
             setError('Could not fetch quote.');
        }
      } catch (err: any) {
        console.error('Error fetching quote for Order Book:', err);
        setError('Failed to load quote.');
        setLatestQuote(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
    // Optionally add a timer to refresh the quote periodically
    // const interval = setInterval(fetchQuote, 10000); // e.g., every 10 seconds
    // return () => clearInterval(interval);

  }, [symbol]);

  const midPrice = latestQuote ? ((latestQuote.bid + latestQuote.ask) / 2).toFixed(2) : '--.--';

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full text-gray-300 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-3 flex-shrink-0">Order Book</h3>
      <div className="flex justify-between text-xs mb-1 text-gray-500 flex-shrink-0">
        <span>Amount ({symbol})</span>
        <span>Price (USD)</span>
      </div>
      
      {/* Asks (Sell Orders) - Static Mock Data */}
      <div className="text-red-400 flex-grow overflow-y-auto order-1"> {/* Order matters for flex layout */} 
        {[...Array(15)].map((_, i) => (
          <div key={`ask-${i}`} className="flex justify-between text-sm mb-0.5">
            <span>{(Math.random() * 0.5).toFixed(6)}</span>
            {/* Generate asks slightly above the simulated mid/latest price */} 
            <span>{( (latestQuote?.ask || 93100) + (Math.random() * 100) ).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Mid Price Display */}
      <div className={`text-center text-lg font-bold my-1 py-1 border-y border-gray-700 flex-shrink-0 order-2 ${isLoading ? 'text-gray-500' : 'text-white'}`}>
         {isLoading ? 'Loading...' : midPrice }
         {error && <span className="text-red-500 text-xs ml-2">({error})</span>}
      </div>

      {/* Bids (Buy Orders) - Static Mock Data */}
      <div className="text-green-400 flex-grow overflow-y-auto order-3"> {/* Order matters for flex layout */} 
        {[...Array(15)].map((_, i) => (
          <div key={`bid-${i}`} className="flex justify-between text-sm mb-0.5">
            <span>{(Math.random() * 0.5).toFixed(6)}</span>
             {/* Generate bids slightly below the simulated mid/latest price */} 
            <span>{( (latestQuote?.bid || 92900) - (Math.random() * 100) ).toFixed(2)}</span>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default OrderBook; 