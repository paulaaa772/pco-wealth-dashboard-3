import axios, { AxiosError, AxiosInstance } from 'axios';

// Mock data generator functions
const generateMockCandles = (symbol: string, from: string, to: string) => {
  console.log(`[MOCK] Generating candles for ${symbol} from ${from} to ${to}`);
  
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
  console.log(`[MOCK] Generating price for ${symbol}`);
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
  console.log(`[MOCK] Generating company details for ${symbol}`);
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
  private apiKey: string | null = null;
  private client: AxiosInstance | null = null;
  private useMockData: boolean = false;
  
  private constructor() {
    // Get API key from environment variables
    this.apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY || null;
    
    // Determine if we should use mock data
    if (!this.apiKey) {
      console.log('[POLYGON] No API key found, using mock data');
      this.useMockData = true;
    } else {
      console.log('[POLYGON] API key found, using real Polygon API');
      
      // Set up axios client with base URL and default params
      this.client = axios.create({
        baseURL: 'https://api.polygon.io',
        params: {
          apiKey: this.apiKey
        }
      });
    }
  }

  static getInstance(): PolygonService {
    if (!this.instance) {
      console.log('[POLYGON] Creating new PolygonService instance');
      this.instance = new PolygonService();
    }
    return this.instance;
  }

  async getStockCandles(symbol: string, from: string, to: string, timespan = 'day'): Promise<PolygonCandle[] | null> {
    if (this.useMockData) {
      // Use mock data only if explicitly configured (no API key)
      console.log(`[MOCK] Fetching ${timespan} candles for ${symbol} (No API Key)`);
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockData = generateMockCandles(symbol, from, to);
      console.log(`[MOCK] Generated ${mockData.length} candles for ${symbol}`);
      return mockData;
    }
    
    try {
      console.log(`[POLYGON] Fetching ${timespan} candles for ${symbol} from ${from} to ${to}`);
      if (!this.client) throw new Error('API client not initialized');
      
      const endpoint = `/v2/aggs/ticker/${symbol}/range/1/${timespan}/${from}/${to}`;
      const apiKeyPreview = this.apiKey ? `${this.apiKey.substring(0, 4)}...` : 'null';
      console.log(`[POLYGON] Calling endpoint: ${endpoint} with key ${apiKeyPreview}`);
      
      const response = await this.client.get(endpoint);
      
      // Accept 'OK' or 'DELAYED' status if results exist
      if ((response.data.status === 'OK' || response.data.status === 'DELAYED') && response.data.resultsCount > 0 && response.data.results) {
        if (response.data.status === 'DELAYED') {
            console.warn(`[POLYGON] Using DELAYED data for ${symbol} (${from} to ${to})`);
        }
        console.log(`[POLYGON] Received ${response.data.results.length} candles from API (Status: ${response.data.status})`);
        return response.data.results.map((candle: any) => ({
          o: candle.o,
          h: candle.h,
          l: candle.l,
          c: candle.c,
          t: candle.t,
          v: candle.v
        }));
      } else if (response.data.status === 'OK' || response.data.status === 'DELAYED') {
         console.warn(`[POLYGON] API returned ${response.data.status} status but no results for ${symbol} (${from} to ${to}). Returning null.`);
         return null; // No data found for the range
      } else {
         // Handle other non-OK statuses from Polygon if necessary
         console.error(`[POLYGON] API Error Status: ${response.data.status} for ${symbol}`, response.data);
         // Consider throwing a specific error or returning null based on status
         return null; 
      }
    } catch (error) {
      console.error(`[POLYGON] Network/Request Error fetching candles for ${symbol}:`, error);
      // Log specific Axios error details if available
       if (axios.isAxiosError(error)) {
         console.error(`[POLYGON] Axios Error Details: Status=${error.response?.status}, Data=`, error.response?.data);
       }
      // **Crucially, return null here instead of mock data**
      return null; 
    }
  }

  async getLatestPrice(symbol: string): Promise<number | null> {
    if (this.useMockData) {
      console.log(`[MOCK] Fetching latest price for ${symbol} (No API Key)`);
      await new Promise(resolve => setTimeout(resolve, 300));
      const mockPrice = generateMockPrice(symbol);
      console.log(`[MOCK] Generated mock price: ${mockPrice}`);
      return mockPrice;
    }
    
    try {
      console.log(`[POLYGON SVC] Attempting to fetch latest price for ${symbol}`);
      if (!this.client) {
          console.error('[POLYGON SVC] API client not initialized!');
          throw new Error('API client not initialized');
      }
      
      const response = await this.client.get(`/v2/last/trade/${symbol}`);
      console.log(`[POLYGON SVC] Raw response for ${symbol} latest price:`, JSON.stringify(response.data, null, 2));
      
      // Check if status is OK or DELAYED and if results exist
      if ((response.data.status === 'OK' || response.data.status === 'DELAYED') && response.data.results && typeof response.data.results.p === 'number') {
        const price = response.data.results.p;
        console.log(`[POLYGON SVC] Successfully extracted latest price for ${symbol}: ${price}`);
        return price;
      } else {
        console.warn(`[POLYGON SVC] API returned unexpected status or no valid price data for ${symbol}. Status: ${response.data.status}, Results:`, response.data.results);
        return null;
      }
    } catch (error) {
      console.error(`[POLYGON SVC] Error fetching latest price for ${symbol}:`, error);
       if (axios.isAxiosError(error)) {
         console.error(`[POLYGON SVC] Axios Error Details: Status=${error.response?.status}, Data=`, error.response?.data);
       }
      return null;
    }
  }

  async getCompanyDetails(symbol: string): Promise<CompanyDetails> {
    if (this.useMockData) {
      // Use mock data
      console.log(`[MOCK] Fetching company details for ${symbol}`);
      await new Promise(resolve => setTimeout(resolve, 400));
      const mockDetails = generateMockCompanyDetails(symbol);
      console.log('[MOCK] Generated mock company details');
      return mockDetails;
    }
    
    try {
      console.log(`[POLYGON] Fetching company details for ${symbol}`);
      
      if (!this.client) {
        throw new Error('API client not initialized');
      }
      
      const response = await this.client.get(`/v3/reference/tickers/${symbol}`);
      
      if (response.data.status === 'OK' && response.data.results) {
        const result = response.data.results;
        console.log(`[POLYGON] Received company details for ${symbol}`);
        
        return {
          name: result.name || `${symbol} Inc.`,
          description: result.description || `No description available for ${symbol}`,
          market_cap: result.market_cap || 0,
          employees: result.total_employees || 0,
          industry: result.sic_description || 'N/A'
        };
      } else {
        console.warn('[POLYGON] API returned no company data, falling back to mock data');
        return generateMockCompanyDetails(symbol);
      }
    } catch (error) {
      console.error('[POLYGON] Error fetching company details, falling back to mock data:', error);
      return generateMockCompanyDetails(symbol);
    }
  }
} 