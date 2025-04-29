import { NextResponse } from 'next/server';
import { PolygonService } from '../../../lib/market-data/PolygonService';

export async function GET() {
  // Log the key being used by the server environment
  const serverSideApiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
  console.log('[VERIFY-API] Key found by process.env:', serverSideApiKey ? `${serverSideApiKey.substring(0, 4)}...` : 'NONE');
  
  try {
    console.log('[VERIFY-API] Getting PolygonService instance...');
    const polygonService = PolygonService.getInstance();
    
    if (!polygonService) {
      console.error('[VERIFY-API] Failed to get Polygon service instance');
      return NextResponse.json({ valid: false, status: 'error', message: 'Failed to initialize Polygon service' }, { status: 500 });
    }
    
    console.log("[VERIFY-API] Calling getCompanyDetails('AAPL')...");
    const result = await polygonService.getCompanyDetails('AAPL');
    console.log('[VERIFY-API] getCompanyDetails result received:', !!result);
    
    // Basic check: Did we get *any* result object back?
    if (result) { 
      console.log('[VERIFY-API] Verification check passed (result exists).');
      return NextResponse.json({ valid: true, status: 'success', message: 'API key is valid' });
    } else {
      console.warn('[VERIFY-API] Verification failed - getCompanyDetails returned null or undefined.');
      return NextResponse.json({ valid: false, status: 'error', message: 'API key check failed or service unavailable' }, { status: 401 });
    }
  } catch (error: any) {
    console.error('[VERIFY-API] Error during verification:', error);
    return NextResponse.json({ valid: false, status: 'error', message: error.message || 'API verification failed' }, { status: 500 });
  }
} 