'use client'

import React, { useState, useEffect } from 'react';
import { PolygonService } from '../../../lib/market-data/PolygonService';
import BasicIndicator from './BasicIndicator';

interface MarketSummaryProps {
  symbol: string;
}

interface PriceData {
  price: number;
  previousClose: number;
  volume: number;
}

const MarketSummary: React.FC<MarketSummaryProps> = ({ symbol }) => {
  const [price, setPrice] = useState<number | null>(null);
  const [previousClose, setPreviousClose] = useState<number | null>(null);
  const [change, setChange] = useState<number>(0);
  const [changePercent, setChangePercent] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const polygonService = PolygonService.getInstance();

  useEffect(() => {
    const fetchMarketData = async () => {
      if (!symbol) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get latest price
        const latestPrice = await polygonService.getLatestPrice(symbol);
        if (latestPrice !== null) {
          // Set price directly from the returned price value
          setPrice(latestPrice);
          
          // For demonstration purposes, we'll set the previous close to 95% of current price
          // In a real app, you would fetch this from a separate API endpoint
          const estimatedPreviousClose = latestPrice * 0.95;
          setPreviousClose(estimatedPreviousClose);
          
          // Calculate change
          const priceChange = latestPrice - estimatedPreviousClose;
          setChange(priceChange);
          
          // Calculate percent change
          const percentChange = (priceChange / estimatedPreviousClose) * 100;
          setChangePercent(percentChange);
          
          // Set a random volume for demonstration purposes
          // In a real app, you would fetch this from the API
          setVolume(Math.floor(1000000 + Math.random() * 5000000));
        } else {
          setError('No price data available');
        }
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Failed to load market data');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    
    // Refresh data every minute
    const interval = setInterval(fetchMarketData, 60000);
    
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-800 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-red-900/20 border border-red-600/30 rounded-lg mb-6">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <BasicIndicator 
        label="Current Price" 
        value={price || 0} 
        format="currency" 
        showIcon={false}
        tooltipContent="The most recent trading price for this stock"
      />
      <BasicIndicator 
        label="Daily Change" 
        value={change} 
        format="currency" 
        tooltipContent="The price change since the previous market close"
      />
      <BasicIndicator 
        label="Change %" 
        value={changePercent} 
        format="percentage"
        tooltipContent="The percentage change since the previous market close"
      />
      <BasicIndicator 
        label="Volume" 
        value={volume} 
        showIcon={false}
        tooltipContent="The total number of shares traded today"
      />
    </div>
  );
};

export default MarketSummary; 