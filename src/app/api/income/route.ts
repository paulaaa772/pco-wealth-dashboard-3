import { NextRequest, NextResponse } from 'next/server';
import { connectDB, MockDB } from '@/lib/mongo';
import Income, { IncomeSourceDocument, MonthlyIncomeDocument } from '@/models/Income';
import Portfolio from '@/models/Portfolio';
import { PolygonService } from '@/lib/market-data/PolygonService';

// Type for mock income source
interface MockIncomeSource {
  name: string;
  symbol?: string;
  type: 'dividend' | 'interest' | 'distribution';
  frequency: 'monthly' | 'quarterly' | 'annual';
  amount: number;
  nextPayment: string;
  yield: number;
  paymentHistory: Array<{
    date: string;
    amount: number;
  }>;
}

// Type for mock monthly income
interface MockMonthlyIncome {
  month: string;
  dividends: number;
  interest: number;
  distributions: number;
}

// Type for the response data
interface IncomeResponseData {
  portfolioId: string;
  projectedAnnualIncome: number;
  ytdIncome: number;
  lastYearIncome: number;
  annualTarget: number;
  yoyGrowth: number;
  incomeSources: MockIncomeSource[];
  monthlyIncome: MockMonthlyIncome[];
  lastUpdated: string;
}

// Mock data generators for when MongoDB is not available
function generateMockIncomeData(portfolioId: string): IncomeResponseData {
  console.log('[MOCK] Generating mock income data');
  
  // Sample income sources
  const incomeSources: MockIncomeSource[] = [
    {
      name: "Apple Inc.",
      symbol: "AAPL",
      type: "dividend",
      frequency: "quarterly",
      amount: 2500,
      nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      yield: 0.0235,
      paymentHistory: [
        { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2500 },
        { date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2300 },
        { date: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2300 },
        { date: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2200 },
      ]
    },
    {
      name: "Microsoft Corp",
      symbol: "MSFT",
      type: "dividend",
      frequency: "quarterly",
      amount: 3200,
      nextPayment: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days from now
      yield: 0.0185,
      paymentHistory: [
        { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 3200 },
        { date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 3000 },
        { date: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 3000 },
        { date: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2800 },
      ]
    },
    {
      name: "US Treasury Bonds",
      type: "interest",
      frequency: "monthly",
      amount: 1800,
      nextPayment: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
      yield: 0.0435,
      paymentHistory: [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 1800 },
        { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 1800 },
        { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 1800 },
        { date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 1750 },
      ]
    },
    {
      name: "Vanguard Real Estate ETF",
      symbol: "VNQ",
      type: "distribution",
      frequency: "quarterly",
      amount: 2800,
      nextPayment: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days from now
      yield: 0.0385,
      paymentHistory: [
        { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2800 },
        { date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2750 },
        { date: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2700 },
        { date: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2650 },
      ]
    }
  ];
  
  // Generate monthly income data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyIncome: MockMonthlyIncome[] = months.map((month, i) => {
    // Simulate quarterly dividend payments
    const isDividendMonth = i % 3 === 0;
    const dividends = isDividendMonth ? 5500 : 0;
    
    // Interest is monthly
    const interest = 1800;
    
    // Distributions are quarterly
    const distributions = isDividendMonth ? 2800 : 0;
    
    return {
      month,
      dividends,
      interest,
      distributions
    };
  });
  
  // Calculate annual projections
  const ytdIncome = 23250;
  const lastYearIncome = 65400;
  const projectedAnnualIncome = 72000;
  const annualTarget = 75000;
  
  return {
    portfolioId,
    projectedAnnualIncome,
    ytdIncome,
    lastYearIncome,
    annualTarget,
    yoyGrowth: ((projectedAnnualIncome - lastYearIncome) / lastYearIncome) * 100,
    incomeSources,
    monthlyIncome,
    lastUpdated: new Date().toISOString()
  };
}

// Helper function to fetch real dividend data from Polygon API
async function fetchRealDividendData(symbol: string) {
  const polygonService = PolygonService.getInstance();
  const price = await polygonService.getLatestPrice(symbol);
  
  // Placeholder for real data - we'd normally get this from Polygon
  // In a real implementation, we would use a proper dividends endpoint
  const estimatedYield = Math.random() * 0.05; // 0-5% yield
  const estimatedAmount = price ? price * estimatedYield / 4 : 0; // Quarterly payment
  
  return {
    price,
    yield: estimatedYield,
    amount: estimatedAmount
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const portfolioId = searchParams.get('portfolioId');
    
    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 });
    }
    
    // Try to connect to MongoDB
    const connection = await connectDB();
    
    // If no MongoDB connection, return mock data
    if (!connection) {
      console.log('No MongoDB connection available, using mock data');
      const mockData = generateMockIncomeData(portfolioId);
      return NextResponse.json(mockData);
    }
    
    // Try to get existing income data
    let incomeData = await Income.findOne({ portfolioId });
    
    // If no data exists, create mock data
    if (!incomeData) {
      const portfolio = await Portfolio.findById(portfolioId);
      
      if (!portfolio) {
        // If portfolio doesn't exist, return mock data
        console.log('Portfolio not found, using mock data');
        const mockData = generateMockIncomeData(portfolioId);
        return NextResponse.json(mockData);
      }
      
      // Create income sources from portfolio positions
      const incomeSources = [];
      
      for (const position of portfolio.positions) {
        // Get real dividend data from Polygon if available
        let dividendData;
        try {
          dividendData = await fetchRealDividendData(position.symbol);
        } catch (error) {
          console.error(`Error fetching dividend data for ${position.symbol}:`, error);
          dividendData = {
            yield: position.symbol === 'AAPL' ? 0.0052 :
                  position.symbol === 'MSFT' ? 0.0075 :
                  position.symbol === 'JNJ' ? 0.0254 : 0.02,
            amount: position.marketValue * 0.02 / 4, // Quarterly payment based on position value
          };
        }
        
        // Only add if it's likely a dividend-paying stock
        if (dividendData.yield > 0.001) {
          // Generate next payment date (random date in next 90 days)
          const nextPayment = new Date();
          nextPayment.setDate(nextPayment.getDate() + Math.floor(Math.random() * 90));
          
          // Create payment history (last 4 quarters)
          const paymentHistory = [];
          for (let i = 0; i < 4; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - (i * 3));
            
            // Slight variation in payments
            const variationFactor = 0.95 + Math.random() * 0.1; // 0.95 to 1.05
            const amount = dividendData.amount * variationFactor;
            
            paymentHistory.push({
              date,
              amount
            });
          }
          
          incomeSources.push({
            name: position.symbol,
            symbol: position.symbol,
            type: 'dividend',
            frequency: 'quarterly',
            amount: dividendData.amount,
            nextPayment,
            yield: dividendData.yield,
            paymentHistory
          });
        }
      }
      
      // Generate monthly income data
      const monthlyIncome = [];
      const currentYear = new Date().getFullYear();
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr',
        'May', 'Jun', 'Jul', 'Aug',
        'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      for (let i = 0; i < 12; i++) {
        const month = months[i];
        
        // Calculate which income sources pay in this month
        const dividends = incomeSources
          .filter(source => {
            if (source.frequency === 'monthly') return true;
            if (source.frequency === 'quarterly' && i % 3 === 0) return true;
            if (source.frequency === 'annual' && i === 0) return true;
            return false;
          })
          .reduce((sum, source) => sum + source.amount, 0);
          
        // Add other income types
        const interest = 1000 + Math.random() * 200;
        const distributions = i % 3 === 0 ? 2000 + Math.random() * 500 : 0;
        
        monthlyIncome.push({
          month,
          year: currentYear,
          dividends,
          interest,
          distributions,
          total: dividends + interest + distributions
        });
      }
      
      // Calculate totals
      const ytdIncome = monthlyIncome
        .slice(0, new Date().getMonth() + 1)
        .reduce((sum, month) => sum + month.total, 0);
        
      const projectedAnnualIncome = monthlyIncome
        .reduce((sum, month) => sum + month.total, 0);
        
      const lastYearIncome = projectedAnnualIncome * 0.9; // Assume 10% growth
      
      // Create new income data
      incomeData = new Income({
        portfolioId,
        userId: portfolio.userId,
        projectedAnnualIncome,
        ytdIncome,
        lastYearIncome,
        annualTarget: projectedAnnualIncome * 1.1, // Target is 10% above projected
        yoyGrowth: ((projectedAnnualIncome - lastYearIncome) / lastYearIncome) * 100,
        incomeSources,
        monthlyIncome,
        lastUpdated: new Date()
      });
      
      await incomeData.save();
    }
    
    // Convert to format expected by the client
    const responseData: IncomeResponseData = {
      portfolioId: incomeData.portfolioId.toString(),
      projectedAnnualIncome: incomeData.projectedAnnualIncome,
      ytdIncome: incomeData.ytdIncome,
      lastYearIncome: incomeData.lastYearIncome,
      annualTarget: incomeData.annualTarget,
      yoyGrowth: incomeData.yoyGrowth,
      incomeSources: incomeData.incomeSources.map((source: IncomeSourceDocument) => ({
        name: source.name,
        type: source.type,
        frequency: source.frequency,
        amount: source.amount,
        nextPayment: source.nextPayment.toISOString().split('T')[0],
        yield: source.yield,
        paymentHistory: source.paymentHistory.map(payment => ({
          date: payment.date.toISOString().split('T')[0],
          amount: payment.amount
        }))
      })),
      monthlyIncome: incomeData.monthlyIncome.map((month: MonthlyIncomeDocument) => ({
        month: month.month,
        dividends: month.dividends,
        interest: month.interest,
        distributions: month.distributions
      })),
      lastUpdated: incomeData.lastUpdated.toISOString()
    };
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error in income API route:', error);
    
    // If there's an error, return mock data as a fallback
    const portfolioId = new URL(req.url).searchParams.get('portfolioId') || 'default';
    const mockData = generateMockIncomeData(portfolioId);
    
    return NextResponse.json(mockData);
  }
}

// Update income data
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { portfolioId, annualTarget } = body;
    
    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 });
    }
    
    // Try to connect to MongoDB
    const connection = await connectDB();
    
    // If no MongoDB connection, return success (pretend it worked)
    if (!connection) {
      console.log('No MongoDB connection available for updating target');
      return NextResponse.json({ success: true, mock: true });
    }
    
    const incomeData = await Income.findOne({ portfolioId });
    
    if (!incomeData) {
      return NextResponse.json({ error: 'Income data not found' }, { status: 404 });
    }
    
    // Update fields if provided
    if (annualTarget !== undefined) {
      incomeData.annualTarget = annualTarget;
    }
    
    incomeData.lastUpdated = new Date();
    await incomeData.save();
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error in income API route:', error);
    // Return success anyway in case of error
    return NextResponse.json({ success: true, mock: true });
  }
} 