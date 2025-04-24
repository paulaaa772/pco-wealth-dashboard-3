import axios, { AxiosError } from 'axios';

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
    this.apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY || '';
    if (!this.apiKey) {
      console.error('Polygon API key is not configured in environment variables');
    }
  }

  static getInstance(): PolygonService {
    if (!this.instance) {
      this.instance = new PolygonService();
    }
    return this.instance;
  }

  private getApiUrl(endpoint: string): string {
    return `${BASE_URL}${endpoint}?apiKey=${this.apiKey}`;
  }

  async getStockCandles(symbol: string, from: string, to: string, timespan = '1min'): Promise<PolygonCandle[]> {
    try {
      if (!this.apiKey) {
        console.error('Polygon API key is not configured');
        return [];
      }

      const endpoint = `/v2/aggs/ticker/${symbol}/range/1/${timespan}/${from}/${to}`;
      const url = this.getApiUrl(endpoint);
      console.log('API Key present:', !!this.apiKey);
      console.log('Making request to:', url.replace(this.apiKey, '[HIDDEN]'));
      
      const response = await axios.get(url);
      console.log('Response status:', response.status);
      return response.data.results || [];
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching stock candles:', axiosError.response?.data || axiosError);
      return [];
    }
  }

  async getLatestPrice(symbol: string): Promise<number | null> {
    try {
      if (!this.apiKey) {
        console.error('Polygon API key is not configured');
        return null;
      }

      const endpoint = `/v2/last/trade/${symbol}`;
      const url = this.getApiUrl(endpoint);
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
      if (!this.apiKey) {
        console.error('Polygon API key is not configured');
        return null;
      }

      const endpoint = `/v3/reference/tickers/${symbol}`;
      const url = this.getApiUrl(endpoint);
      const response = await axios.get(url);
      return response.data.results || null;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching company details:', axiosError.response?.data || axiosError);
      return null;
    }
  }
} 