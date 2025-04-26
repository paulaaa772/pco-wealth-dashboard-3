import useSWR from 'swr';

// Define the portfolio data structure
export interface PortfolioData {
  _id?: string;
  name: string;
  userId?: string;
  cashBalance: number;
  totalValue: number;
  stats: {
    totalValue: number;
    initialInvestment?: number;
    annualReturn?: number;
    dailyChange?: number;
  };
  assetAllocation: {
    category: string;
    percentage: number;
  }[];
  positions: {
    symbol: string;
    name?: string;
    quantity: number;
    averagePrice?: number;
    marketValue: number;
    unrealizedPL?: number;
    sector?: string;
  }[];
  performanceHistory: {
    date: string;
    value: number;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

// Define a fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    // Create a better error that includes the status
    const error = new Error('Failed to fetch portfolio data');
    error.message = `Error ${response.status}: ${response.statusText}`;
    throw error;
  }
  
  return response.json();
};

// The main portfolio data hook
export function usePortfolioData(id?: string) {
  const url = id 
    ? `/api/portfolios/${id}` 
    : '/api/portfolios';
    
  const { data, error, isLoading, isValidating, mutate } = useSWR<PortfolioData[] | PortfolioData>(
    url, 
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Refresh every minute
      dedupingInterval: 30000, // Dedupe requests within 30 seconds
      shouldRetryOnError: true,
      errorRetryCount: 3
    }
  );
  
  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate, // Allows manual revalidation
    portfolio: Array.isArray(data) ? data[0] : data, // Convenience access to first portfolio
  };
}

// A hook specifically for the net worth chart data
export function useNetWorthChartData() {
  const { data, error, isLoading } = usePortfolioData();
  
  // Process data for the chart
  const chartData = data && Array.isArray(data) && data[0]?.performanceHistory 
    ? data[0].performanceHistory.map(entry => ({
        date: new Date(entry.date),
        value: entry.value
      }))
    : [];
  
  return {
    chartData,
    error,
    isLoading
  };
}

// A hook for allocation data
export function useAllocationData() {
  const { data, error, isLoading } = usePortfolioData();
  
  // Transform allocation data for the DonutChart component
  const allocationData = data && Array.isArray(data) && data[0]?.assetAllocation
    ? data[0].assetAllocation.map((allocation, index) => {
        const colors = [
          '#4169E1', '#9370DB', '#20B2AA', '#3CB371', '#FF6347', 
          '#6495ED', '#A9A9A9', '#FFD700', '#8A2BE2', '#32CD32',
          '#FF4500', '#4682B4', '#7B68EE', '#2E8B57', '#CD5C5C'
        ];
        
        return {
          name: allocation.category,
          value: allocation.percentage,
          color: colors[index % colors.length]
        };
      })
    : [];
  
  return {
    allocationData,
    error,
    isLoading
  };
}

// A hook for holdings data
export function useHoldingsData() {
  const { data, error, isLoading } = usePortfolioData();
  
  // Transform positions into holdings format
  const holdings = data && Array.isArray(data) && data[0]?.positions
    ? data[0].positions.map(position => ({
        name: position.name || position.symbol,
        symbol: position.symbol,
        quantity: position.quantity,
        value: position.marketValue,
        sector: position.sector || 'Unknown',
        accountType: 'taxable' as 'taxable' | 'retirement' | 'crypto' | 'cash' // Fixed typing
      }))
    : [];
  
  return {
    holdings,
    error,
    isLoading
  };
} 