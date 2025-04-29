import mongoose, { Schema, Document } from 'mongoose';

export interface IncomeSourceDocument {
  name: string;
  symbol?: string;
  type: 'dividend' | 'interest' | 'distribution';
  frequency: 'monthly' | 'quarterly' | 'annual';
  amount: number;
  nextPayment: Date;
  yield: number;
  paymentHistory: {
    date: Date;
    amount: number;
  }[];
}

export interface MonthlyIncomeDocument {
  month: string;
  year: number;
  dividends: number;
  interest: number;
  distributions: number;
  total: number;
}

export interface IncomeDocument extends Document {
  portfolioId: mongoose.Types.ObjectId;
  userId: string;
  projectedAnnualIncome: number;
  ytdIncome: number;
  lastYearIncome: number;
  annualTarget: number;
  yoyGrowth: number;
  incomeSources: IncomeSourceDocument[];
  monthlyIncome: MonthlyIncomeDocument[];
  lastUpdated: Date;
}

const IncomeSourceSchema = new Schema<IncomeSourceDocument>({
  name: { type: String, required: true },
  symbol: { type: String },
  type: { 
    type: String, 
    required: true,
    enum: ['dividend', 'interest', 'distribution']
  },
  frequency: { 
    type: String, 
    required: true,
    enum: ['monthly', 'quarterly', 'annual']
  },
  amount: { type: Number, required: true },
  nextPayment: { type: Date, required: true },
  yield: { type: Number, required: true },
  paymentHistory: [{
    date: { type: Date, required: true },
    amount: { type: Number, required: true }
  }]
}, { _id: true });

const MonthlyIncomeSchema = new Schema<MonthlyIncomeDocument>({
  month: { type: String, required: true },
  year: { type: Number, required: true },
  dividends: { type: Number, default: 0 },
  interest: { type: Number, default: 0 },
  distributions: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { _id: false });

const IncomeSchema = new Schema<IncomeDocument>({
  portfolioId: {
    type: Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  projectedAnnualIncome: {
    type: Number,
    default: 0
  },
  ytdIncome: {
    type: Number,
    default: 0
  },
  lastYearIncome: {
    type: Number,
    default: 0
  },
  annualTarget: {
    type: Number,
    default: 0
  },
  yoyGrowth: {
    type: Number,
    default: 0
  },
  incomeSources: [IncomeSourceSchema],
  monthlyIncome: [MonthlyIncomeSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create the model if it doesn't exist or use the existing one
export const Income = mongoose.models.Income || 
  mongoose.model<IncomeDocument>('Income', IncomeSchema);

export default Income; 