import axios, { AxiosInstance, AxiosError } from 'axios';

const POLYGON_BASE_URL = 'https://api.polygon.io';

interface PolygonTradeResponse {
  status: string;
  request_id: string;
  results: {
    p: number;  // price
    s: number;  // size
    t: number;  // timestamp
    c: string[]; // conditions
    i: string;  // trade ID
  };
}

interface PolygonAggregateBar {
  o: number;  // open
  h: number;  // high
  l: number;  // low
  c: number;  // close
  v: number;  // volume
  t: number;  // timestamp
  vw: number; // volume weighted average price
  n: number;  // number of transactions
}

interface PolygonAggregatesResponse {
  status: string;
  request_id: string;
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: PolygonAggregateBar[];
}

export interface MarketDataService {
  getStockPrice(symbol: string): Promise<number>;
  getDailyBars(symbol: string, from: string, to: string): Promise<PolygonAggregateBar[]>;
  getAggregates(
    symbol: string,
    multiplier: number,
    timespan: string,
    from: string,
    to: string
  ): Promise<PolygonAggregateBar[]>;
}

class PolygonError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly requestId?: string
  ) {
    super(message);
    this.name = 'PolygonError';
  }
}

class PolygonMarketDataService implements MarketDataService {
  private readonly apiKey: string;
  private readonly client: AxiosInstance;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Polygon API key is required');
    }
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: POLYGON_BASE_URL,
      params: {
        apiKey: this.apiKey,
      },
    });
  }

  private handleError(error: unknown, operation: string): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const requestId = error.response?.data?.request_id;
      const message = error.response?.data?.message || error.message;
      
      throw new PolygonError(
        `${operation} failed: ${message}`,
        status,
        requestId
      );
    }
    throw error;
  }

  async getStockPrice(symbol: string): Promise<number> {
    if (!symbol) {
      throw new Error('Symbol is required');
    }

    try {
      const response = await this.client.get<PolygonTradeResponse>(`/v2/last/trade/${symbol}`);
      
      if (!response.data.results) {
        throw new PolygonError('No trade data available');
      }
      
      return response.data.results.p;
    } catch (error) {
      this.handleError(error, `Fetching stock price for ${symbol}`);
    }
  }

  async getDailyBars(symbol: string, from: string, to: string): Promise<PolygonAggregateBar[]> {
    if (!symbol || !from || !to) {
      throw new Error('Symbol, from date, and to date are required');
    }

    try {
      const response = await this.client.get<PolygonAggregatesResponse>(
        `/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}`
      );
      
      if (!response.data.results || response.data.results.length === 0) {
        return [];
      }
      
      return response.data.results;
    } catch (error) {
      this.handleError(error, `Fetching daily bars for ${symbol}`);
    }
  }

  async getAggregates(
    symbol: string,
    multiplier: number,
    timespan: string,
    from: string,
    to: string
  ): Promise<PolygonAggregateBar[]> {
    if (!symbol || !multiplier || !timespan || !from || !to) {
      throw new Error('All parameters are required');
    }

    if (!['minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'].includes(timespan)) {
      throw new Error('Invalid timespan. Must be one of: minute, hour, day, week, month, quarter, year');
    }

    try {
      const response = await this.client.get<PolygonAggregatesResponse>(
        `/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}`
      );
      
      if (!response.data.results || response.data.results.length === 0) {
        return [];
      }
      
      return response.data.results;
    } catch (error) {
      this.handleError(error, `Fetching aggregates for ${symbol}`);
    }
  }
}

// Export a factory function to create the service
export const createMarketDataService = (apiKey: string): MarketDataService => {
  return new PolygonMarketDataService(apiKey);
}; 