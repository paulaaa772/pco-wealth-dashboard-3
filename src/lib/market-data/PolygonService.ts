import axios, { AxiosError } from 'axios';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
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
  private apiKey: string;

  private constructor() {
    // Get API key from runtime config
    this.apiKey = publicRuntimeConfig.NEXT_PUBLIC_POLYGON_API_KEY || '';
    
    if (!this.apiKey) {
      console.error('Polygon API key is not configured in environment variables');
    } else {
      console.log('Polygon API key is configured');
    }
  }

  static getInstance(): PolygonService {
    if (!this.instance) {
      this.instance = new PolygonService();
    }
    return this.instance;
  }

  private getApiUrl(endpoint: string): string {
    const url = `${BASE_URL}${endpoint}?apiKey=${this.apiKey}`;
    console.log('Generated API URL:', url.replace(this.apiKey, '[HIDDEN]'));
    return url;
  }

  async getStockCandles(symbol: string, from: string, to: string, timespan = '1min'): Promise<PolygonCandle[]> {
    try {
      if (!this.apiKey) {
        throw new Error('Polygon API key is not configured');
      }

      const endpoint = `/v2/aggs/ticker/${symbol}/range/1/${timespan}/${from}/${to}`;
      const url = this.getApiUrl(endpoint);
      
      const response = await axios.get(url);
      console.log('API Response Status:', response.status);
      return response.data.results || [];
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching stock candles:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      return [];
    }
  }

  async getLatestPrice(symbol: string): Promise<number | null> {
    try {
      if (!this.apiKey) {
        throw new Error('Polygon API key is not configured');
      }

      const endpoint = `/v2/last/trade/${symbol}`;
      const url = this.getApiUrl(endpoint);
      const response = await axios.get(url);
      return response.data.results.p || null;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching latest price:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      return null;
    }
  }

  async getCompanyDetails(symbol: string) {
    try {
      if (!this.apiKey) {
        throw new Error('Polygon API key is not configured');
      }

      const endpoint = `/v3/reference/tickers/${symbol}`;
      const url = this.getApiUrl(endpoint);
      const response = await axios.get(url);
      return response.data.results || null;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching company details:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      return null;
    }
  }
} 