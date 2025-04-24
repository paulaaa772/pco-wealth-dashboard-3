'use client';

import axios, { AxiosError } from 'axios';

const BASE_URL = 'https://api.polygon.io';
// Use the direct API key value for testing
const API_KEY = 'B2IYP3Pd1DdpKo9XSIkoQVlzp1sdDNHK';

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
    // Directly use the API key rather than environment variable
    this.apiKey = API_KEY;
    
    console.log('PolygonService initialized with API key length:', this.apiKey.length);
    if (!this.apiKey) {
      console.error('Polygon API key is not configured');
    } else {
      console.log('Polygon API key is configured (first 4 chars):', this.apiKey.substring(0, 4));
    }
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

  private getApiUrl(endpoint: string): string {
    const url = `${BASE_URL}${endpoint}?apiKey=${this.apiKey}`;
    console.log('API URL generated (masked):', url.replace(this.apiKey, '[HIDDEN]'));
    return url;
  }

  async getStockCandles(symbol: string, from: string, to: string, timespan = '1min'): Promise<PolygonCandle[]> {
    try {
      if (!this.apiKey) {
        console.error('No API key available for Polygon request');
        throw new Error('Polygon API key is not configured');
      }

      console.log(`Fetching ${timespan} candles for ${symbol} from ${from} to ${to}`);
      const endpoint = `/v2/aggs/ticker/${symbol}/range/1/${timespan}/${from}/${to}`;
      const url = this.getApiUrl(endpoint);
      
      console.log('Making API request to Polygon...');
      const response = await axios.get(url);
      
      console.log('Polygon API Response:', {
        status: response.status,
        statusText: response.statusText,
        hasResults: !!response.data?.results,
        resultCount: response.data?.results?.length || 0
      });
      
      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }
      
      if (!response.data || !response.data.results) {
        console.error('Invalid response format from Polygon API:', response.data);
        throw new Error('Invalid response format from API: missing results array');
      }
      
      console.log(`Received ${response.data.results.length} candles from Polygon API`);
      
      return response.data.results || [];
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching stock candles:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      throw error; // Re-throw to handle in component
    }
  }

  async getLatestPrice(symbol: string): Promise<number | null> {
    try {
      if (!this.apiKey) {
        throw new Error('Polygon API key is not configured');
      }

      console.log(`Fetching latest price for ${symbol}`);
      const endpoint = `/v2/last/trade/${symbol}`;
      const url = this.getApiUrl(endpoint);
      
      const response = await axios.get(url);
      
      console.log('Latest price response:', {
        status: response.status,
        statusText: response.statusText,
        hasResults: !!response.data?.results,
        price: response.data?.results?.p
      });
      
      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      if (!response.data || !response.data.results) {
        throw new Error('Invalid response format from API');
      }
      
      return response.data.results.p || null;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching latest price:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      throw error; // Re-throw to handle in component
    }
  }

  async getCompanyDetails(symbol: string) {
    try {
      if (!this.apiKey) {
        throw new Error('Polygon API key is not configured');
      }

      console.log(`Fetching company details for ${symbol}`);
      const endpoint = `/v3/reference/tickers/${symbol}`;
      const url = this.getApiUrl(endpoint);
      
      const response = await axios.get(url);
      
      console.log('Company details response:', {
        status: response.status,
        statusText: response.statusText,
        hasResults: !!response.data?.results
      });
      
      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      if (!response.data || !response.data.results) {
        throw new Error('Invalid response format from API');
      }
      
      return response.data.results || null;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching company details:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      throw error; // Re-throw to handle in component
    }
  }
} 