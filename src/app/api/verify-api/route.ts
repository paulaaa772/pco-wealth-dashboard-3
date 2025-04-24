import { NextResponse } from 'next/server';
import { PolygonService } from '../../../lib/market-data/PolygonService';

export async function GET() {
  try {
    const polygonService = PolygonService.getInstance();
    
    if (!polygonService) {
      return NextResponse.json({ status: 'error', message: 'Failed to initialize Polygon service' }, { status: 500 });
    }
    
    const result = await polygonService.getCompanyDetails('AAPL');
    
    if (result) {
      return NextResponse.json({ status: 'success', message: 'API key is valid' });
    } else {
      return NextResponse.json({ status: 'error', message: 'API key is invalid or service is not available' }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message || 'API verification failed' }, { status: 500 });
  }
} 