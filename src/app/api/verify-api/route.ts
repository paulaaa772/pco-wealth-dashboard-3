import { NextResponse } from 'next/server';
import { PolygonService } from '../../../lib/market-data/PolygonService';

export async function GET() {
  try {
    const polygonService = PolygonService.getInstance();
    const result = await polygonService.getCompanyDetails('AAPL');
    
    if (result) {
      return NextResponse.json({ status: 'success', message: 'API key is valid' });
    } else {
      return NextResponse.json({ status: 'error', message: 'API key is invalid or not configured' });
    }
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: 'Error verifying API key', error: error.message });
  }
} 