'use client';

import axios, { AxiosError } from 'axios';

const BASE_URL = 'https://api.polygon.io';
const API_KEY = 'B2IYP3Pd1DdpKo9XSIkoQVlzp1sdDNHK'; // Hard-coded for testing

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
    this.apiKey = API_KEY;
    
    if (!this.apiKey) {
      console.error('Polygon API key is not configured');
    } else {
      console.log('Polygon API key is configured');
    }
  }

  static getInstance(): PolygonService | null {
    if (typeof window === 'undefined') {
      // Skip during SSR/build
      return null;
    }
    
    try {
      if (!this.instance) {
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
    return url;
  }

  async getStockCandles(symbol: string, from: string, to: string, timespan = '1min'): Promise<PolygonCandle[]> {
    try {
      if (!this.apiKey) {
        throw new Error('Polygon API key is not configured');
      }

      const endpoint = `/v2/aggs/ticker/${symbol}/range/1/${timespan}/${from}/${to}`;
      const url = this.getApiUrl(endpoint);
      
      console.log('Fetching candles for:', symbol);
      const response = await axios.get(url);
      
      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      if (!response.data || !response.data.results) {
        throw new Error('Invalid response format from API');
      }
      
      console.log('API Response Status:', response.status);
      console.log('Received candles count:', response.data.results.length);
      
      return response.data.results || [];
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching stock candles:', {
        status: axiosError.response?.status,
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

      const endpoint = `/v2/last/trade/${symbol}`;
      const url = this.getApiUrl(endpoint);
      
      console.log('Fetching latest price for:', symbol);
      const response = await axios.get(url);
      
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

      const endpoint = `/v3/reference/tickers/${symbol}`;
      const url = this.getApiUrl(endpoint);
      
      console.log('Fetching company details for:', symbol);
      const response = await axios.get(url);
      
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
        data: axiosError.response?.data,
        message: axiosError.message
      });
      throw error; // Re-throw to handle in component
    }
  }
} 