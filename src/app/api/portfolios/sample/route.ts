import { NextRequest, NextResponse } from 'next/server';
import { connectDB, MockDB } from '@/lib/mongo';
import Portfolio from '@/models/Portfolio';
import Income from '@/models/Income';
import mongoose from 'mongoose';

// Function to generate a sample portfolio with positions
async function generateSamplePortfolio() {
  // Create a random user ID for demo purposes
  const userId = 'user_' + Math.random().toString(36).substring(2, 10);
  
  // Sample positions with realistic data
  const positions = [
    {
      symbol: 'AAPL',
      quantity: 50,
      averageEntryPrice: 165.32,
      currentPrice: 178.61,
      marketValue: 8930.50,
      unrealizedPL: 665.00,
      unrealizedPLPercent: 8.04,
      costBasis: 8266.00,
      lastUpdated: new Date(),
      sector: 'Technology',
      industry: 'Consumer Electronics'
    },
    {
      symbol: 'MSFT',
      quantity: 30,
      averageEntryPrice: 290.75,
      currentPrice: 312.38,
      marketValue: 9371.40,
      unrealizedPL: 649.00,
      unrealizedPLPercent: 7.44,
      costBasis: 8722.50,
      lastUpdated: new Date(),
      sector: 'Technology',
      industry: 'Software'
    },
    {
      symbol: 'JNJ',
      quantity: 25,
      averageEntryPrice: 162.15,
      currentPrice: 158.22,
      marketValue: 3955.50,
      unrealizedPL: -98.25,
      unrealizedPLPercent: -2.42,
      costBasis: 4053.75,
      lastUpdated: new Date(),
      sector: 'Healthcare',
      industry: 'Pharmaceuticals'
    },
    {
      symbol: 'VNQ',
      quantity: 100,
      averageEntryPrice: 85.43,
      currentPrice: 92.18,
      marketValue: 9218.00,
      unrealizedPL: 675.00,
      unrealizedPLPercent: 7.90,
      costBasis: 8543.00,
      lastUpdated: new Date(),
      sector: 'Real Estate',
      industry: 'REIT'
    },
    {
      symbol: 'BND',
      quantity: 150,
      averageEntryPrice: 73.12,
      currentPrice: 71.68,
      marketValue: 10752.00,
      unrealizedPL: -216.00,
      unrealizedPLPercent: -1.97,
      costBasis: 10968.00,
      lastUpdated: new Date(),
      sector: 'Fixed Income',
      industry: 'Bond ETF'
    }
  ];
  
  // Calculate stats
  const totalValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0) + 5000; // 5000 cash
  const totalGain = positions.reduce((sum, pos) => sum + pos.unrealizedPL, 0);
  const totalCost = positions.reduce((sum, pos) => sum + pos.costBasis, 0);
  const totalGainPercent = (totalGain / totalCost) * 100;
  
  // Create portfolio stats
  const stats = {
    totalValue: totalValue,
    cashBalance: 5000,
    dayChange: 128.45,
    dayChangePercent: 0.31,
    totalGain: totalGain,
    totalGainPercent: totalGainPercent,
    annualReturn: 7.8,
    annualDividend: 842.00,
    annualDividendYield: 2.02,
    beta: 0.94,
    sharpeRatio: 1.65,
    lastUpdated: new Date()
  };
  
  // Sample asset allocation
  const assetAllocation = [
    { category: 'US Stocks', percentage: 45.6, value: 18301.90 },
    { category: 'International Stocks', percentage: 0, value: 0 },
    { category: 'Bonds', percentage: 26.77, value: 10752.00 },
    { category: 'Real Estate', percentage: 22.96, value: 9218.00 },
    { category: 'Cash', percentage: 12.45, value: 5000.00 }
  ];
  
  // If MongoDB connection is available, create a portfolio document
  const connection = await connectDB();
  
  if (connection) {
    try {
      // Create portfolio
      const portfolio = new Portfolio({
        userId,
        name: 'Main Investment Portfolio',
        description: 'My primary investment account focused on long-term growth and dividend income',
        type: 'INVESTMENT',
        positions,
        cashBalance: 5000,
        stats,
        assetAllocation,
        riskTolerance: 'MEDIUM',
        investmentStrategy: 'Balanced growth and income with focus on quality dividend stocks',
        tags: ['dividend', 'growth', 'tech']
      });
      
      await portfolio.save();
      return portfolio._id.toString();
    } catch (error) {
      console.error('Error saving portfolio to MongoDB:', error);
    }
  }
  
  // If no MongoDB connection or an error occurred, return a mock ID
  return 'mock_portfolio_' + Math.random().toString(36).substring(2, 10);
}

export async function GET(req: NextRequest) {
  try {
    // Generate a random portfolio ID if MongoDB is not available
    const mockPortfolioId = 'mock_portfolio_' + Math.random().toString(36).substring(2, 10);
    
    // Try to connect to MongoDB
    const connection = await connectDB();
    
    // If no MongoDB connection, return a mock portfolio ID
    if (!connection) {
      console.log('No MongoDB connection available, returning mock portfolio ID');
      return NextResponse.json({ 
        message: 'Using mock portfolio (MongoDB not available)', 
        portfolioId: mockPortfolioId,
        mock: true
      });
    }
    
    // Check if we already have portfolios
    const existingPortfolioCount = await Portfolio.countDocuments();
    
    if (existingPortfolioCount > 0) {
      // Return the first portfolio we find
      const portfolio = await Portfolio.findOne();
      return NextResponse.json({ 
        message: 'Using existing portfolio', 
        portfolioId: portfolio._id.toString()
      });
    }
    
    // Create a sample portfolio if none exists
    const portfolioId = await generateSamplePortfolio();
    
    return NextResponse.json({ 
      message: 'Created new sample portfolio', 
      portfolioId 
    });
    
  } catch (error) {
    console.error('Error creating sample portfolio:', error);
    
    // In case of any error, return a mock portfolio ID
    const mockPortfolioId = 'mock_portfolio_' + Math.random().toString(36).substring(2, 10);
    
    return NextResponse.json({ 
      message: 'Using mock portfolio (error occurred)', 
      portfolioId: mockPortfolioId,
      mock: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 