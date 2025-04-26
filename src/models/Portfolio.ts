import mongoose, { Schema, Document } from 'mongoose';

export interface PositionDocument {
  symbol: string;
  quantity: number;
  averageEntryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  lastUpdated: Date;
  sector?: string;
  industry?: string;
  costBasis: number;
}

export interface TransactionDocument {
  symbol: string;
  transactionType: 'BUY' | 'SELL' | 'DIVIDEND' | 'DEPOSIT' | 'WITHDRAWAL' | 'FEE';
  quantity: number;
  price: number;
  amount: number;
  fees: number;
  date: Date;
  notes: string;
}

export interface AssetAllocationDocument {
  category: string;
  percentage: number;
  value: number;
}

export interface PortfolioStatsDocument {
  totalValue: number;
  cashBalance: number;
  dayChange: number;
  dayChangePercent: number;
  totalGain: number;
  totalGainPercent: number;
  annualReturn: number;
  annualDividend: number;
  annualDividendYield: number;
  beta: number;
  sharpeRatio: number;
  lastUpdated: Date;
}

export interface PortfolioDocument extends Document {
  userId: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  type: 'PERSONAL' | 'RETIREMENT' | 'EDUCATION' | 'INVESTMENT' | 'OTHER';
  currency: string;
  positions: PositionDocument[];
  transactions: TransactionDocument[];
  assetAllocation: AssetAllocationDocument[];
  stats: PortfolioStatsDocument;
  cashBalance: number;
  benchmarkIndex: string;
  riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
  investmentStrategy: string;
  performanceHistory: {
    date: Date;
    value: number;
    cashFlow: number;
  }[];
  tags: string[];
}

const PositionSchema = new Schema<PositionDocument>({
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  averageEntryPrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  marketValue: { type: Number, required: true },
  unrealizedPL: { type: Number, required: true },
  unrealizedPLPercent: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
  sector: { type: String },
  industry: { type: String },
  costBasis: { type: Number, required: true }
}, { _id: false });

const TransactionSchema = new Schema<TransactionDocument>({
  symbol: { type: String, required: true },
  transactionType: { 
    type: String, 
    required: true,
    enum: ['BUY', 'SELL', 'DIVIDEND', 'DEPOSIT', 'WITHDRAWAL', 'FEE']
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  fees: { type: Number, default: 0 },
  date: { type: Date, required: true, default: Date.now },
  notes: { type: String, default: '' }
}, { _id: true, timestamps: true });

const AssetAllocationSchema = new Schema<AssetAllocationDocument>({
  category: { type: String, required: true },
  percentage: { type: Number, required: true },
  value: { type: Number, required: true }
}, { _id: false });

const PortfolioStatsSchema = new Schema<PortfolioStatsDocument>({
  totalValue: { type: Number, required: true },
  cashBalance: { type: Number, required: true },
  dayChange: { type: Number, default: 0 },
  dayChangePercent: { type: Number, default: 0 },
  totalGain: { type: Number, default: 0 },
  totalGainPercent: { type: Number, default: 0 },
  annualReturn: { type: Number, default: 0 },
  annualDividend: { type: Number, default: 0 },
  annualDividendYield: { type: Number, default: 0 },
  beta: { type: Number, default: 1 },
  sharpeRatio: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const PerformanceHistorySchema = new Schema({
  date: { type: Date, required: true },
  value: { type: Number, required: true },
  cashFlow: { type: Number, default: 0 }
}, { _id: false });

const PortfolioSchema = new Schema<PortfolioDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    enum: ['PERSONAL', 'RETIREMENT', 'EDUCATION', 'INVESTMENT', 'OTHER'],
    default: 'PERSONAL'
  },
  currency: {
    type: String,
    default: 'USD'
  },
  positions: [PositionSchema],
  transactions: [TransactionSchema],
  assetAllocation: [AssetAllocationSchema],
  stats: {
    type: PortfolioStatsSchema,
    default: () => ({})
  },
  cashBalance: {
    type: Number,
    default: 0
  },
  benchmarkIndex: {
    type: String,
    default: 'SPY'
  },
  riskTolerance: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
  investmentStrategy: {
    type: String,
    default: ''
  },
  performanceHistory: [PerformanceHistorySchema],
  tags: [{
    type: String
  }]
}, { timestamps: true });

// Virtual for calculating total invested amount
PortfolioSchema.virtual('totalInvested').get(function() {
  return this.positions.reduce((total, position) => {
    return total + (position.quantity * position.averageEntryPrice);
  }, 0);
});

// Virtual for calculating current portfolio value
PortfolioSchema.virtual('currentValue').get(function() {
  const positionsValue = this.positions.reduce((total, position) => {
    return total + position.marketValue;
  }, 0);
  
  return positionsValue + this.cashBalance;
});

// Create the model if it doesn't exist or use the existing one
export const Portfolio = mongoose.models.Portfolio || 
  mongoose.model<PortfolioDocument>('Portfolio', PortfolioSchema);

export default Portfolio; 