import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongo';
import Portfolio from '@/models/Portfolio';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const portfolio = await Portfolio.findById(params.id);
    
    if (!portfolio) {
      return new Response(JSON.stringify({ error: 'Portfolio not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(portfolio), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error fetching portfolio:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch portfolio' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await req.json();
    
    const portfolio = await Portfolio.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!portfolio) {
      return new Response(JSON.stringify({ error: 'Portfolio not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(portfolio), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error updating portfolio:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to update portfolio' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const portfolio = await Portfolio.findByIdAndDelete(params.id);
    
    if (!portfolio) {
      return new Response(JSON.stringify({ error: 'Portfolio not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ success: true, message: 'Portfolio deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error deleting portfolio:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to delete portfolio' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 