import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongo';
import Goal from '@/models/Goal';

// GET all goals (with query filters)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Parse query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    
    // Build query
    const query: any = {};
    if (userId) query.userId = userId;
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    const goals = await Goal.find(query).sort({ priority: 1, targetDate: 1 });
    
    return new Response(JSON.stringify(goals), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error fetching goals:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch goals' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST - create a new goal
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    
    // Create the goal
    const goal = await Goal.create(body);
    
    return new Response(JSON.stringify(goal), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error creating goal:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to create goal' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 