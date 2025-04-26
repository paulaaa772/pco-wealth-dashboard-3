import useSWR from 'swr';

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  close: number;
  low: number;
  volume: number;
}

export interface MarketDataResponse {
  symbol: string;
  candles: CandleData[];
  latestPrice?: number;
  companyName?: string;
  error?: string;
}

// Fetcher function for market data
const fetcher = async (url: string) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = new Error('Failed to fetch market data');
    error.message = `Error ${response.status}: ${response.statusText}`;
    throw error;
  }
  
  return response.json();
};

// Hook for fetching candle data
export function useStockCandles(symbol: string, timeframe: string = '1D') {
  const { data, error, isLoading, mutate } = useSWR<MarketDataResponse>(
    symbol ? `/api/polygon/candles?symbol=${symbol}&timeframe=${timeframe}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Refresh every minute for market data
      dedupingInterval: 15000, // Dedupe requests within 15 seconds
      shouldRetryOnError: true,
      errorRetryCount: 3
    }
  );
  
  // Process and format the data
  const formattedCandles = data?.candles?.map(candle => ({
    timestamp: candle.timestamp,
    open: candle.open,
    high: candle.high,
    close: candle.close,
    low: candle.low,
    volume: candle.volume,
    date: new Date(candle.timestamp)
  })) || [];
  
  return {
    data: formattedCandles,
    symbol: data?.symbol,
    error,
    isLoading,
    refresh: mutate // Function to manually refresh data
  };
}

// Hook for fetching latest price
export function useLatestPrice(symbol: string) {
  const { data, error, isLoading, mutate } = useSWR<{ symbol: string; price: number }>(
    symbol ? `/api/polygon/price?symbol=${symbol}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 15000, // Refresh every 15 seconds
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  );
  
  return {
    price: data?.price,
    symbol: data?.symbol,
    error,
    isLoading,
    refresh: mutate
  };
}

// Hook for fetching company information
export function useCompanyInfo(symbol: string) {
  const { data, error, isLoading } = useSWR<{ 
    symbol: string; 
    name: string;
    description?: string;
    sector?: string;
    industry?: string; 
  }>(
    symbol ? `/api/polygon/company?symbol=${symbol}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000, // Cache for 1 hour - company info changes rarely
    }
  );
  
  return {
    company: data,
    error,
    isLoading
  };
} 