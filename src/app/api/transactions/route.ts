import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongo';
import Transaction from '@/models/Transaction';
import Portfolio from '@/models/Portfolio';

// GET all transactions (with query filters)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Parse query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const portfolioId = url.searchParams.get('portfolioId');
    const type = url.searchParams.get('type');
    const symbol = url.searchParams.get('symbol');
    const status = url.searchParams.get('status');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const limit = url.searchParams.get('limit');
    
    // Build query
    const query: any = {};
    if (userId) query.userId = userId;
    if (portfolioId) query.portfolioId = portfolioId;
    if (type) query.type = type;
    if (symbol) query.symbol = symbol;
    if (status) query.status = status;
    
    // Date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Create find query with pagination
    const findQuery = Transaction.find(query).sort({ date: -1 });
    
    // Apply limit if provided
    if (limit) {
      findQuery.limit(parseInt(limit));
    }
    
    const transactions = await findQuery;
    
    return new Response(JSON.stringify(transactions), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch transactions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST - create a new transaction
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    
    // Start a session to ensure atomicity
    const session = await Transaction.startSession();
    session.startTransaction();
    
    try {
      // Create the transaction
      const transaction = await Transaction.create([body], { session });
      
      // If it's a buy/sell/deposit/withdrawal, update the associated portfolio
      if (body.portfolioId && ['buy', 'sell', 'deposit', 'withdrawal'].includes(body.type)) {
        const portfolio = await Portfolio.findById(body.portfolioId).session(session);
        
        if (!portfolio) {
          throw new Error('Portfolio not found');
        }
        
        if (body.type === 'buy') {
          // Add holding or update existing
          if (body.symbol && body.quantity && body.price) {
            await portfolio.addHolding({
              symbol: body.symbol,
              name: body.symbol, // This should ideally be the full name from a lookup
              quantity: body.quantity,
              purchasePrice: body.price,
              purchaseDate: body.date || new Date()
            });
            
            // Reduce cash balance
            portfolio.cashBalance -= (body.quantity * body.price + (body.fee || 0));
            await portfolio.save({ session });
          }
        } else if (body.type === 'sell') {
          // Find the holding
          const holdingIndex = portfolio.holdings.findIndex((h: { symbol: string }) => h.symbol === body.symbol);
          
          if (holdingIndex === -1) {
            throw new Error('Holding not found in portfolio');
          }
          
          const holding = portfolio.holdings[holdingIndex];
          
          // Check if enough shares to sell
          if (holding.quantity < body.quantity) {
            throw new Error('Not enough shares to sell');
          }
          
          // Update holding quantity
          holding.quantity -= body.quantity;
          
          // Remove holding if quantity is 0
          if (holding.quantity === 0) {
            portfolio.holdings.splice(holdingIndex, 1);
          }
          
          // Increase cash balance
          portfolio.cashBalance += (body.quantity * body.price - (body.fee || 0));
          
          await portfolio.save({ session });
        } else if (body.type === 'deposit') {
          // Increase cash balance
          portfolio.cashBalance += body.amount;
          await portfolio.save({ session });
        } else if (body.type === 'withdrawal') {
          // Check if enough cash
          if (portfolio.cashBalance < body.amount) {
            throw new Error('Insufficient funds for withdrawal');
          }
          
          // Decrease cash balance
          portfolio.cashBalance -= body.amount;
          await portfolio.save({ session });
        }
      }
      
      await session.commitTransaction();
      session.endSession();
      
      return new Response(JSON.stringify(transaction[0]), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (sessionError: any) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw sessionError;
    }
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to create transaction' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 