import axios, { AxiosError, AxiosInstance } from 'axios';

// Mock data generator functions
const generateMockCandles = (symbol: string, from: string, to: string, assetType?: string) => {
  console.log(`[MOCK] Generating candles for ${symbol} (${assetType || 'unknown type'}) from ${from} to ${to}`);
  
  const data = [];
  // More realistic price points for common symbols
  const basePrice = symbol === 'AAPL' ? 186.3 : 
                   symbol === 'MSFT' ? 403.8 : 
                   symbol === 'GOOG' ? 142.5 : 
                   symbol === 'AMZN' ? 185.2 :
                   symbol === 'TSLA' ? 183.8 :
                   symbol === 'JPM' ? 182.4 :
                   symbol === 'V' ? 276.1 :
                   symbol === 'META' ? 474.5 :
                   symbol === 'NVDA' ? 1028.6 :
                   symbol === 'BRK.B' ? 410.3 :
                   symbol === 'SPY' ? 528.4 :
                   symbol === 'QQQ' ? 439.7 :
                   symbol === 'VTI' ? 254.9 :
                   symbol === 'VOO' ? 483.5 :
                   symbol === 'VGSH' ? 57.9 :
                   symbol === 'BND' ? 72.3 : 
                   symbol === 'BLACKROCK EQUITY INDEX FUND' ? 112.3 :
                   symbol === 'BLACKROCK US DEBT INDEX FUND' ? 79.6 :
                   Math.random() * 100 + 50;
  
  // Convert dates to timestamps
  const fromDate = new Date(from);
  const toDate = new Date(to);
  
  // Calculate number of days
  const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24));
  
  // Set trend based on asset type and symbol for more consistency
  let trendRate;
  
  // Use asset type as primary classifier if available
  if (assetType === 'Bond') {
    // Bonds have been flat to slightly down
    trendRate = -0.00008 + (Math.random() * 0.00016);
  } else if (assetType === 'ETF') {
    if (symbol.match(/^(BND|AGG|VGSH|VCIT|TLT)/)) {
      // Bond ETFs
      trendRate = -0.00005 + (Math.random() * 0.0001);
    } else if (symbol.match(/^(SPY|VOO|VTI|IVV)/)) {
      // Index ETFs have steady growth
      trendRate = 0.00032 + (Math.random() * 0.00018);
    } else if (symbol.match(/^(QQQ|VGT|XLK)/)) {
      // Tech ETFs have done better
      trendRate = 0.00045 + (Math.random() * 0.00025);
    } else {
      // General ETFs
      trendRate = 0.00025 + (Math.random() * 0.0002);
    }
  } else if (assetType === 'Stock') {
    if (symbol.match(/^(AAPL|MSFT|GOOG|AMZN|NVDA|META)/)) {
      // Big tech stocks have done well
      trendRate = 0.00052 + (Math.random() * 0.00048);
    } else if (symbol.match(/^(JPM|BAC|WFC|C|GS)/)) {
      // Financial stocks 
      trendRate = 0.00038 + (Math.random() * 0.00032);
    } else {
      // Other stocks
      trendRate = 0.00025 + (Math.random() * 0.00045);
    }
  } else if (assetType === 'Mutual Fund') {
    // Mutual funds tend to be less volatile
    trendRate = 0.00028 + (Math.random() * 0.00022);
  } else if (assetType === 'Crypto') {
    // Crypto is highly volatile
    trendRate = 0.00065 + (Math.random() * 0.001 - 0.0005);
  } else {
    // Fallback to symbol-based classification if no asset type
    if (symbol.match(/^(BND|AGG|BOND|TLT)/)) {
      // Bonds have been flat to slightly down
      trendRate = -0.00005 + (Math.random() * 0.0001);
    } else if (symbol.match(/^(AAPL|MSFT|GOOG|AMZN|NVDA|META)/)) {
      // Big tech stocks have done well
      trendRate = 0.0005 + (Math.random() * 0.0005);
    } else if (symbol.match(/^(SPY|VOO|VTI|QQQ)/)) {
      // Index funds have steady growth
      trendRate = 0.0003 + (Math.random() * 0.0002);
    } else {
      // General stocks vary more
      trendRate = 0.0001 + (Math.random() * 0.0006 - 0.0003);
    }
  }
  
  // Seed with sine wave for cyclical patterns
  let currentPrice = basePrice;
  let seed = Math.random() * 1000; // Random starting point in the cycle
  
  for (let i = 0; i < daysDiff; i++) {
    const date = new Date(fromDate);
    date.setDate(fromDate.getDate() + i);
    
    // Skip weekends (simplified)
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Apply trend with realistic fluctuation
    // Base daily movement on trend + sine wave + random noise
    const cyclicalComponent = Math.sin(seed + i * 0.2) * 0.002; // Cyclical pattern
    const randomNoise = (Math.random() - 0.5) * 0.003; // Random daily noise
    const dailyReturn = trendRate + cyclicalComponent + randomNoise;
    
    currentPrice = currentPrice * (1 + dailyReturn);
    
    // Daily range (more volatile for growth stocks, less for bonds/index)
    let rangePercent;
    if (symbol.match(/^(BND|AGG|BOND)/)) {
      rangePercent = 0.001 + Math.random() * 0.002; // Low volatility
    } else if (symbol.match(/^(TSLA|NVDA)/)) {
      rangePercent = 0.01 + Math.random() * 0.02; // High volatility
    } else {
      rangePercent = 0.005 + Math.random() * 0.01; // Medium volatility
    }
    
    const range = currentPrice * rangePercent;
    
    const open = currentPrice * (0.997 + Math.random() * 0.006);
    const high = currentPrice + (range / 2) + Math.random() * (range / 2);
    const low = currentPrice - (range / 2) - Math.random() * (range / 2);
    const close = currentPrice;
    
    // Volume also varies by stock type
    let baseVolume;
    if (symbol.match(/^(AAPL|MSFT|AMZN|TSLA|SPY)/)) {
      baseVolume = 5000000 + Math.random() * 10000000; // High volume
    } else if (symbol.match(/^(BND|AGG|BOND)/)) {
      baseVolume = 200000 + Math.random() * 500000; // Low volume
    } else {
      baseVolume = 1000000 + Math.random() * 3000000; // Medium volume
    }
    
    data.push({
      o: parseFloat(open.toFixed(2)),
      h: parseFloat(high.toFixed(2)),
      l: parseFloat(low.toFixed(2)),
      c: parseFloat(close.toFixed(2)),
      t: date.getTime(),
      v: Math.floor(baseVolume),
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

  async getStockCandles(
      symbol: string, 
      from: string, 
      to: string, 
      timespan = 'day', 
      multiplier = 1, // Add multiplier with default
      assetType?: string // Add asset type parameter
    ): Promise<PolygonCandle[] | null> {
    if (this.useMockData) {
      // Use mock data only if explicitly configured (no API key)
      console.log(`[MOCK] Fetching ${multiplier} ${timespan} candles for ${symbol} (${assetType || 'unknown type'}) (No API Key)`);
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockData = generateMockCandles(symbol, from, to, assetType);
      console.log(`[MOCK] Generated ${mockData.length} candles for ${symbol}`);
      return mockData;
    }
    
    try {
      console.log(`[POLYGON] Fetching ${multiplier} ${timespan} candles for ${symbol} from ${from} to ${to}`);
      if (!this.client) throw new Error('API client not initialized');
      
      // Include multiplier in the endpoint path
      const endpoint = `/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}`;
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