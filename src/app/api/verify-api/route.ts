import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
    
    console.log('API verification - Checking API key existence');
    
    if (!apiKey) {
      console.error('API key is not configured in environment');
      return NextResponse.json({ 
        status: 'error', 
        message: 'API key is not configured',
        env: process.env.NODE_ENV 
      }, { status: 401 });
    }
    
    console.log('API verification - API key found, testing with Polygon API');
    
    // Test the API key with a simple request to Polygon API
    try {
      const url = `https://api.polygon.io/v3/reference/tickers/AAPL?apiKey=${apiKey}`;
      console.log(`Making request to: ${url.replace(apiKey, '[REDACTED]')}`);
      
      const response = await axios.get(url);
      
      if (response.data && (response.data.status === 'OK' || response.data.status === 'DELAYED')) {
        console.log('API verification - Success: Polygon API responded with valid data');
        return NextResponse.json({ 
          status: 'success', 
          message: 'API key is valid',
          env: process.env.NODE_ENV
        });
      } else {
        console.error('API verification - Error: Unexpected data structure from Polygon API', response.data);
        return NextResponse.json({ 
          status: 'error', 
          message: 'API key validation failed', 
          details: response.data?.status || 'Unknown status',
          env: process.env.NODE_ENV
        }, { status: 401 });
      }
    } catch (error: any) {
      console.error('Error validating Polygon API key:', error.message);
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      
      const status = error.response?.status || 500;
      return NextResponse.json({ 
        status: 'error', 
        message: 'API key validation failed', 
        details: error.response?.data || error.message,
        env: process.env.NODE_ENV
      }, { status });
    }
  } catch (error: any) {
    console.error('Unexpected error during API verification:', error.message);
    return NextResponse.json({ 
      status: 'error', 
      message: error.message || 'API verification failed',
      env: process.env.NODE_ENV
    }, { status: 500 });
  }
} 