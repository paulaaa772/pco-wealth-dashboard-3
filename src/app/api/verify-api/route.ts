import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ status: 'error', message: 'API key is not configured' }, { status: 401 });
    }
    
    // Test the API key with a simple request to Polygon API
    try {
      const response = await axios.get(`https://api.polygon.io/v3/reference/tickers/AAPL?apiKey=${apiKey}`);
      
      if (response.data && (response.data.status === 'OK' || response.data.status === 'DELAYED')) {
        return NextResponse.json({ status: 'success', message: 'API key is valid' });
      } else {
        return NextResponse.json({ 
          status: 'error', 
          message: 'API key validation failed', 
          details: response.data?.status || 'Unknown status'
        }, { status: 401 });
      }
    } catch (error: any) {
      console.error('Error validating Polygon API key:', error);
      const status = error.response?.status || 500;
      return NextResponse.json({ 
        status: 'error', 
        message: 'API key validation failed', 
        details: error.response?.data || error.message 
      }, { status });
    }
  } catch (error: any) {
    console.error('Unexpected error during API verification:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: error.message || 'API verification failed' 
    }, { status: 500 });
  }
} 