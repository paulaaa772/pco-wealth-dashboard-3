import axios, { AxiosError } from 'axios';

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

  private constructor() {
    console.log('PolygonService initialized with API key:', POLYGON_API_KEY); // Debug log
  }

  static getInstance(): PolygonService {
    if (!this.instance) {
      this.instance = new PolygonService();
    }
    return this.instance;
  }

  async getStockCandles(symbol: string, from: string, to: string, timespan = '1min'): Promise<PolygonCandle[]> {
    try {
      const url = `${BASE_URL}/v2/aggs/ticker/${symbol}/range/1/${timespan}/${from}/${to}?apiKey=${POLYGON_API_KEY}`;
      console.log('Making request to:', url); // Debug log
      const response = await axios.get(url);
      console.log('API Response:', response.data); // Debug log
      return response.data.results || [];
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching stock candles:', axiosError.response?.data || axiosError);
      return [];
    }
  }

  async getLatestPrice(symbol: string): Promise<number | null> {
    try {
      const url = `${BASE_URL}/v2/last/trade/${symbol}?apiKey=${POLYGON_API_KEY}`;
      console.log('Making request to:', url); // Debug log
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
      const url = `${BASE_URL}/v3/reference/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`;
      console.log('Making request to:', url); // Debug log
      const response = await axios.get(url);
      return response.data.results || null;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching company details:', axiosError.response?.data || axiosError);
      return null;
    }
  }
} 