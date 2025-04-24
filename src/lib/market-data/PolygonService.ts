import axios from 'axios';

const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
const BASE_URL = 'https://api.polygon.io';

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

  private constructor() {}

  static getInstance(): PolygonService {
    if (!this.instance) {
      this.instance = new PolygonService();
    }
    return this.instance;
  }

  async getStockCandles(symbol: string, from: string, to: string, timespan = '1min'): Promise<PolygonCandle[]> {
    try {
      const response = await axios.get(
        `${BASE_URL}/v2/aggs/ticker/${symbol}/range/1/${timespan}/${from}/${to}`,
        {
          params: {
            apiKey: POLYGON_API_KEY,
            adjusted: true,
          },
        }
      );
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching stock candles:', error);
      return [];
    }
  }

  async getLatestPrice(symbol: string): Promise<number | null> {
    try {
      const response = await axios.get(
        `${BASE_URL}/v2/last/trade/${symbol}`,
        {
          params: {
            apiKey: POLYGON_API_KEY,
          },
        }
      );
      return response.data.results.p || null;
    } catch (error) {
      console.error('Error fetching latest price:', error);
      return null;
    }
  }

  async getCompanyDetails(symbol: string) {
    try {
      const response = await axios.get(
        `${BASE_URL}/v3/reference/tickers/${symbol}`,
        {
          params: {
            apiKey: POLYGON_API_KEY,
          },
        }
      );
      return response.data.results || null;
    } catch (error) {
      console.error('Error fetching company details:', error);
      return null;
    }
  }
} 