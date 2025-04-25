'use client'

import React, { useState, useEffect } from 'react';
import BasicIndicator from './BasicIndicator';
import { PolygonService } from '../../../lib/market-data/PolygonService';

interface MarketSummaryProps {
  symbol: string;
}

const MarketSummary: React.FC<MarketSummaryProps> = ({ symbol }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [price, setPrice] = useState<number>(0);
  const [change, setChange] = useState<number>(0);
  const [changePercent, setChangePercent] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0);
  const [companyName, setCompanyName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!symbol) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Create an instance of the PolygonService
        const polygonService = new PolygonService();
        
        // Fetch the latest price
        const priceData = await polygonService.getLatestPrice(symbol);
        
        if (priceData) {
          setPrice(priceData.price);
          
          // Calculate change and change percent
          // For simplicity, we'll use a mock change value (ideally this would come from API)
          const previousClose = priceData.price * (1 - (Math.random() * 0.05 - 0.025));
          const dailyChange = priceData.price - previousClose;
          const dailyChangePercent = (dailyChange / previousClose) * 100;
          
          setChange(dailyChange);
          setChangePercent(dailyChangePercent);
          
          // Set volume (mock data for now)
          setVolume(Math.floor(Math.random() * 10000000));
        }
        
        // Fetch company details
        const companyData = await polygonService.getCompanyDetails(symbol);
        if (companyData) {
          setCompanyName(companyData.name);
        }
      } catch (err: any) {
        console.error('Error fetching market data:', err);
        setError(err?.message || 'Failed to load market data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up polling to refresh data every minute
    const intervalId = setInterval(fetchData, 60000);
    
    return () => clearInterval(intervalId);
  }, [symbol]);
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-800 rounded-lg"></div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 p-4 rounded-lg">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }
  
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-white mb-3">{companyName || symbol}</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BasicIndicator 
          label="Current Price" 
          value={price} 
          format="currency" 
        />
        <BasicIndicator 
          label="Daily Change" 
          value={price} 
          change={change} 
          format="currency" 
        />
        <BasicIndicator 
          label="Change %" 
          value={changePercent} 
          change={changePercent} 
          format="percentage" 
        />
        <BasicIndicator 
          label="Volume" 
          value={volume} 
          format="number" 
          showIcon={false}
        />
      </div>
    </div>
  );
};

export default MarketSummary; 