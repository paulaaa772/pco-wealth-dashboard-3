import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY; // Use the key available on the server

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!POLYGON_API_KEY) {
    return NextResponse.json({ error: 'API key not configured on server' }, { status: 500 });
  }

  if (!query) {
    return NextResponse.json({ error: 'Search query parameter (q) is required' }, { status: 400 });
  }

  try {
    const searchUrl = `https://api.polygon.io/v3/reference/tickers`;
    const response = await axios.get(searchUrl, {
      params: {
        apiKey: POLYGON_API_KEY,
        search: query,
        active: true, // Only search for active tickers
        market: 'stocks', // Focus on stocks
        limit: 10 // Limit results for dropdown
      }
    });

    if (response.data && response.data.results) {
      // Format results slightly for the dropdown
      const formattedResults = response.data.results.map((ticker: any) => ({
        symbol: ticker.ticker,
        name: ticker.name,
      }));
      return NextResponse.json(formattedResults);
    } else {
      return NextResponse.json([]); // Return empty array if no results
    }

  } catch (error: any) {
    console.error('[API /search-tickers] Error fetching from Polygon:', error.response?.data || error.message);
    // Don't expose detailed errors to the client
    return NextResponse.json({ error: 'Failed to fetch ticker data' }, { status: 500 });
  }
} 