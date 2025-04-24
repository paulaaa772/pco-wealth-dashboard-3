import axios, { AxiosError } from 'axios';

// Make sure we're using NEXT_PUBLIC prefix for client-side access
const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
const BASE_URL = 'https://api.polygon.io';

// Debug log to check if the API key is loaded
console.log('Environment variables loaded:', {
  NEXT_PUBLIC_POLYGON_API_KEY: process.env.NEXT_PUBLIC_POLYGON_API_KEY ? 'present' : 'missing'
});

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

  private constructor() {
    // Debug log when service is initialized
    console.log('PolygonService initialized with API key present:', !!POLYGON_API_KEY);
  }

  static getInstance(): PolygonService {
    if (!this.instance) {
      this.instance = new PolygonService();
    }
    return this.instance;
  }

  async getStockCandles(symbol: string, from: string, to: string, timespan = '1min'): Promise<PolygonCandle[]> {
    try {
      if (!POLYGON_API_KEY) {
        console.error('Polygon API key is not configured');
        return [];
      }

      const url = `${BASE_URL}/v2/aggs/ticker/${symbol}/range/1/${timespan}/${from}/${to}?apiKey=${POLYGON_API_KEY}`;
      console.log('Making request to:', url.replace(POLYGON_API_KEY, '[HIDDEN]')); // Hide API key in logs
      
      const response = await axios.get(url);
      return response.data.results || [];
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching stock candles:', axiosError.response?.data || axiosError);
      return [];
    }
  }

  async getLatestPrice(symbol: string): Promise<number | null> {
    try {
      if (!POLYGON_API_KEY) {
        console.error('Polygon API key is not configured');
        return null;
      }

      const url = `${BASE_URL}/v2/last/trade/${symbol}?apiKey=${POLYGON_API_KEY}`;
      const response = await axios.get(url);
      return response.data.results.p || null;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching latest price:', axiosError.response?.data || axiosError);
      return null;
    }
  }

  async getCompanyDetails(symbol: string) {
    try {
      if (!POLYGON_API_KEY) {
        console.error('Polygon API key is not configured');
        return null;
      }

      const url = `${BASE_URL}/v3/reference/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`;
      const response = await axios.get(url);
      return response.data.results || null;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching company details:', axiosError.response?.data || axiosError);
      return null;
    }
  }
} 