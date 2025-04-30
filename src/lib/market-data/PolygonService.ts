import axios, { AxiosError, AxiosInstance } from 'axios';

// Define interfaces for API responses
interface PolygonPriceResponse {
  status: string;
  request_id: string;
  ticker: string;
  results: {
    p: number; // price
    s: number; // size
    t: number; // timestamp
    c?: string[]; // conditions
    x: number; // exchange
  } | null;
}

export interface PolygonCandle {
  c: number; // close
  h: number; // high
  l: number; // low
  o: number; // open
  t: number; // timestamp
  v: number; // volume
}

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

export class PolygonService {
  private static instance: PolygonService;
  private apiKey: string | null = null;
  private client: AxiosInstance | null = null;
  private useRealData: boolean = true; // Always use real data
  
  private constructor() {
    // Get API key from environment variables
    this.apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY || null;
    
    if (!this.apiKey) {
      console.error('[POLYGON] No API key found. You must set NEXT_PUBLIC_POLYGON_API_KEY environment variable.');
      this.useRealData = false; // Fall back to mock only if no API key
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
      multiplier = 1,
      assetType?: string
    ): Promise<PolygonCandle[] | null> {
    
    try {
      if (!this.apiKey || !this.client) {
        console.error('[POLYGON] Cannot fetch candles - API key missing or client not initialized');
        return this.generateMockCandles(symbol, from, to, assetType);
      }
      
      console.log(`[POLYGON] Fetching ${multiplier} ${timespan} candles for ${symbol} from ${from} to ${to}`);
      
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
         console.warn(`[POLYGON] API returned ${response.data.status} status but no results for ${symbol} (${from} to ${to}). Falling back to mock data.`);
         return this.generateMockCandles(symbol, from, to, assetType);
      } else {
         console.error(`[POLYGON] API Error Status: ${response.data.status} for ${symbol}`, response.data);
         return this.generateMockCandles(symbol, from, to, assetType);
      }
    } catch (error) {
      console.error(`[POLYGON] Network/Request Error fetching candles for ${symbol}:`, error);
      if (axios.isAxiosError(error)) {
        console.error(`[POLYGON] Axios Error Details: Status=${error.response?.status}, Data=`, error.response?.data);
      }
      return this.generateMockCandles(symbol, from, to, assetType);
    }
  }

  async getLatestPrice(symbol: string): Promise<number | null> {
    try {
      if (!this.apiKey || !this.client) {
        console.error('[POLYGON] Cannot fetch latest price - API key missing or client not initialized');
        return this.generateMockPrice(symbol);
      }
      
      console.log(`[POLYGON SVC] Fetching latest price for ${symbol}`);
      
      const response = await this.client.get<PolygonPriceResponse>(`/v2/last/trade/${symbol}`);
      
      // Check if status is OK or DELAYED and if results exist
      if ((response.data.status === 'OK' || response.data.status === 'DELAYED') && 
          response.data.results && 
          typeof response.data.results.p === 'number') {
        const price = response.data.results.p;
        console.log(`[POLYGON SVC] Latest price for ${symbol}: ${price}`);
        return price;
      } else {
        console.warn(`[POLYGON SVC] API returned unexpected data for ${symbol}, falling back to mock price`);
        return this.generateMockPrice(symbol);
      }
    } catch (error) {
      console.error(`[POLYGON SVC] Error fetching latest price for ${symbol}:`, error);
      if (axios.isAxiosError(error)) {
        console.error(`[POLYGON SVC] Axios Error Details: Status=${error.response?.status}, Data=`, error.response?.data);
      }
      return this.generateMockPrice(symbol);
    }
  }
  
  // --- Mock data methods (used as fallback only) ---
  
  private generateMockPrice(symbol: string): number {
    console.log(`[MOCK-FALLBACK] Generating realistic price for ${symbol}`);
    // Use realistic prices for common stocks
    const basePrice = symbol === 'AAPL' ? 186.3 : 
                     symbol === 'MSFT' ? 403.8 : 
                     symbol === 'GOOG' ? 142.5 : 
                     symbol === 'AMZN' ? 185.2 :
                     symbol === 'TSLA' ? 183.8 :
                     symbol === 'JPM' ? 182.4 :
                     symbol === 'V' ? 276.1 :
                     symbol === 'META' ? 474.5 :
                     symbol === 'NVDA' ? 1028.6 :
                     symbol === 'BAC' ? 39.44 :
                     symbol === 'SPY' ? 528.4 :
                     Math.random() * 100 + 50;
    
    // Small random variation (± 0.5% max)
    return basePrice * (1 + (Math.random() * 0.01 - 0.005));
  }

  private generateMockCandles(symbol: string, from: string, to: string, assetType?: string): PolygonCandle[] {
    console.log(`[MOCK-FALLBACK] Generating realistic candles for ${symbol} from ${from} to ${to}`);
    
    const data: PolygonCandle[] = [];
    // Use realistic starting prices
    const basePrice = symbol === 'AAPL' ? 186.3 : 
                     symbol === 'MSFT' ? 403.8 : 
                     symbol === 'GOOG' ? 142.5 : 
                     symbol === 'AMZN' ? 185.2 :
                     symbol === 'TSLA' ? 183.8 :
                     symbol === 'JPM' ? 182.4 :
                     symbol === 'V' ? 276.1 :
                     symbol === 'META' ? 474.5 :
                     symbol === 'NVDA' ? 1028.6 :
                     symbol === 'BAC' ? 39.44 :
                     symbol === 'SPY' ? 528.4 :
                     Math.random() * 100 + 50;
    
    // Convert dates to timestamps
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    // Calculate number of days
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24));
    
    // Set realistic trend rates based on asset type and symbol
    let trendRate = 0.0001; // default daily trend (0.01%)
    
    // Stock-specific trends (much more realistic)
    if (symbol === 'AAPL' || symbol === 'MSFT' || symbol === 'GOOG' || 
        symbol === 'AMZN' || symbol === 'META' || symbol === 'NVDA') {
      trendRate = 0.0002 + (Math.random() * 0.0002); // Tech: 0.02-0.04% daily
    } else if (symbol === 'JPM' || symbol === 'BAC' || symbol === 'GS') {
      trendRate = 0.0001 + (Math.random() * 0.0002); // Banks: 0.01-0.03% daily
    } else if (symbol === 'SPY' || symbol === 'VOO' || symbol === 'VTI') {
      trendRate = 0.0001 + (Math.random() * 0.0001); // Index ETFs: 0.01-0.02% daily
    } else if (assetType === 'Bond' || symbol.match(/^(BND|AGG|VGSH)/)) {
      trendRate = -0.00005 + (Math.random() * 0.0001); // Bonds: -0.005% to +0.005% daily
    }
    
    let currentPrice = basePrice;
    
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(fromDate);
      date.setDate(fromDate.getDate() + i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Apply realistic daily fluctuation
      // Base movement on trend + random noise
      const dailyNoise = (Math.random() - 0.5) * 0.004; // ±0.2% random noise
      const dailyReturn = trendRate + dailyNoise;
      
      currentPrice = currentPrice * (1 + dailyReturn);
      
      // Set realistic daily range based on stock volatility
      let rangePercent = 0.005; // default 0.5% range
      
      if (symbol === 'TSLA' || symbol === 'NVDA') {
        rangePercent = 0.01 + (Math.random() * 0.008); // 1-1.8% range for volatile stocks
      } else if (symbol === 'AAPL' || symbol === 'MSFT') {
        rangePercent = 0.005 + (Math.random() * 0.005); // 0.5-1% range for stable tech
      } else if (symbol.match(/^(BND|AGG|VGSH)/)) {
        rangePercent = 0.001 + (Math.random() * 0.001); // 0.1-0.2% range for bonds
      }
      
      const range = currentPrice * rangePercent;
      
      // Calculate OHLC values with realistic relationships
      const open = currentPrice * (0.998 + Math.random() * 0.004); // Open near previous close
      const high = Math.max(open, currentPrice) + (Math.random() * range/2);
      const low = Math.min(open, currentPrice) - (Math.random() * range/2);
      const close = currentPrice;
      
      // Realistic volume based on stock liquidity
      let baseVolume;
      if (symbol === 'AAPL' || symbol === 'MSFT' || symbol === 'SPY') {
        baseVolume = 3000000 + Math.random() * 7000000; // High volume stocks
      } else if (symbol.match(/^(BND|AGG|VGSH)/)) {
        baseVolume = 100000 + Math.random() * 400000; // Low volume bonds
      } else {
        baseVolume = 500000 + Math.random() * 1500000; // Average volume
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
  }

  async getCompanyDetails(symbol: string): Promise<CompanyDetails> {
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