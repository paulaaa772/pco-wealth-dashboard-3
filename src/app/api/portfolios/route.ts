import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongo';
import Portfolio from '@/models/Portfolio';

// GET all portfolios (with query filters)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Parse query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const type = url.searchParams.get('type');
    
    // Build query
    const query: any = {};
    if (userId) query.userId = userId;
    if (type) query.type = type;
    
    const portfolios = await Portfolio.find(query);
    
    return new Response(JSON.stringify(portfolios), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error fetching portfolios:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch portfolios' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST - create a new portfolio
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    
    // Create the portfolio
    const portfolio = await Portfolio.create(body);
    
    return new Response(JSON.stringify(portfolio), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error creating portfolio:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to create portfolio' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 