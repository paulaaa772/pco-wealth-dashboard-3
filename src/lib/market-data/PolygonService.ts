'use client';

import axios, { AxiosError } from 'axios';

// Mock data generator functions
const generateMockCandles = (symbol: string, from: string, to: string) => {
  console.log(`Generating mock candles for ${symbol} from ${from} to ${to}`);
  
  const data = [];
  const basePrice = symbol === 'AAPL' ? 180 : 
                   symbol === 'MSFT' ? 380 : 
                   symbol === 'GOOG' ? 140 : 100;
  
  // Convert dates to timestamps
  const fromDate = new Date(from);
  const toDate = new Date(to);
  
  // Calculate number of days
  const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24));
  
  let currentPrice = basePrice;
  for (let i = 0; i < daysDiff; i++) {
    const date = new Date(fromDate);
    date.setDate(fromDate.getDate() + i);
    
    // Skip weekends (simplified)
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Random price movement but trending slightly upward
    const randomFactor = 0.98 + Math.random() * 0.04; // 0.98 to 1.02
    currentPrice = currentPrice * randomFactor;
    
    // Daily range is roughly 1-2% of price
    const rangePercent = 0.01 + Math.random() * 0.01;
    const range = currentPrice * rangePercent;
    
    const open = currentPrice * (0.995 + Math.random() * 0.01);
    const high = currentPrice + (range / 2) + Math.random() * (range / 2);
    const low = currentPrice - (range / 2) - Math.random() * (range / 2);
    const close = currentPrice;
    
    data.push({
      o: open,
      h: high,
      l: low,
      c: close,
      t: date.getTime(),
      v: Math.floor(1000000 + Math.random() * 5000000), // Volume between 1M and 6M
    });
  }
  
  return data;
};

const generateMockPrice = (symbol: string) => {
  const basePrice = symbol === 'AAPL' ? 180.42 : 
                   symbol === 'MSFT' ? 379.89 : 
                   symbol === 'GOOG' ? 141.12 : 
                   symbol === 'AMZN' ? 175.23 :
                   symbol === 'TSLA' ? 194.77 :
                   Math.floor(50 + Math.random() * 200);
  
  return basePrice + (Math.random() * 2 - 1); // Add small random variation
};

interface CompanyDetails {
  name: string;
  description: string;
  market_cap: number;
  employees: number;
  industry: string;
}

const generateMockCompanyDetails = (symbol: string): CompanyDetails => {
  const companies: Record<string, CompanyDetails> = {
    'AAPL': {
      name: 'Apple Inc.',
      description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
      market_cap: 2800000000000,
      employees: 154000,
      industry: 'Technology',
    },
    'MSFT': {
      name: 'Microsoft Corporation',
      description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
      market_cap: 2600000000000,
      employees: 181000,
      industry: 'Technology',
    },
    'GOOG': {
      name: 'Alphabet Inc.',
      description: 'Alphabet Inc. provides various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.',
      market_cap: 1700000000000,
      employees: 156000,
      industry: 'Technology',
    },
    'AMZN': {
      name: 'Amazon.com, Inc.',
      description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions through online and physical stores worldwide.',
      market_cap: 1500000000000,
      employees: 1540000,
      industry: 'Retail',
    },
    'TSLA': {
      name: 'Tesla, Inc.',
      description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.',
      market_cap: 620000000000,
      employees: 127000,
      industry: 'Automotive',
    },
  };
  
  return companies[symbol as keyof typeof companies] || {
    name: `${symbol} Inc.`,
    description: `${symbol} Inc. is a mock company for demonstration purposes.`,
    market_cap: Math.floor(1000000000 + Math.random() * 10000000000),
    employees: Math.floor(1000 + Math.random() * 100000),
    industry: 'Various',
  };
};

export interface PolygonCandle {
  c: number; // close
  h: number; // high
  l: number; // low
  o: number; // open
  t: number; // timestamp
  v: number; // volume
}

export class PolygonService {
  private static instance: PolygonService;
  private mockedMode: boolean = true;

  private constructor() {
    console.log('PolygonService initialized in mock mode');
  }

  static getInstance(): PolygonService | null {
    if (typeof window === 'undefined') {
      // Skip during SSR/build
      return null;
    }
    
    try {
      if (!this.instance) {
        console.log('Creating new PolygonService instance');
        this.instance = new PolygonService();
      }
      return this.instance;
    } catch (error) {
      console.error('Failed to initialize PolygonService:', error);
      return null;
    }
  }

  async getStockCandles(symbol: string, from: string, to: string, timespan = '1min'): Promise<PolygonCandle[]> {
    try {
      console.log(`Fetching ${timespan} candles for ${symbol} from ${from} to ${to}`);
      
      if (this.mockedMode) {
        console.log('Using mocked data for candles');
        // Add a slight delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockData = generateMockCandles(symbol, from, to);
        console.log(`Generated ${mockData.length} mock candles`);
        return mockData;
      }
      
      // This code would never run in mocked mode
      throw new Error('API access disabled');
    } catch (error) {
      console.error('Error fetching stock candles:', error);
      // Always return mock data even on error
      return generateMockCandles(symbol, from, to);
    }
  }

  async getLatestPrice(symbol: string): Promise<number | null> {
    try {
      console.log(`Fetching latest price for ${symbol}`);
      
      if (this.mockedMode) {
        console.log('Using mocked data for price');
        // Add a slight delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockPrice = generateMockPrice(symbol);
        console.log(`Generated mock price: ${mockPrice}`);
        return mockPrice;
      }
      
      // This code would never run in mocked mode
      throw new Error('API access disabled');
    } catch (error) {
      console.error('Error fetching latest price:', error);
      // Always return mock data even on error
      return generateMockPrice(symbol);
    }
  }

  async getCompanyDetails(symbol: string) {
    try {
      console.log(`Fetching company details for ${symbol}`);
      
      if (this.mockedMode) {
        console.log('Using mocked data for company details');
        // Add a slight delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const mockDetails = generateMockCompanyDetails(symbol);
        console.log('Generated mock company details');
        return mockDetails;
      }
      
      // This code would never run in mocked mode
      throw new Error('API access disabled');
    } catch (error) {
      console.error('Error fetching company details:', error);
      // Always return mock data even on error
      return generateMockCompanyDetails(symbol);
    }
  }
} 