import mongoose, { Schema, Document } from 'mongoose';

export interface InvestmentGoalDocument extends Document {
  userId: string;
  portfolioId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: 'RETIREMENT' | 'EDUCATION' | 'HOME' | 'VACATION' | 'EMERGENCY' | 'OTHER';
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  targetDate: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  isCompleted: boolean;
  contributionFrequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  contributionAmount: number;
  riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
  inflationRate: number;
  expectedReturnRate: number;
  milestones: {
    title: string;
    description: string;
    targetAmount: number;
    targetDate: Date;
    isCompleted: boolean;
  }[];
  progressHistory: {
    date: Date;
    amount: number;
    contribution: number;
    return: number;
  }[];
  notes: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  targetAmount: { type: Number, required: true },
  targetDate: { type: Date, required: true },
  isCompleted: { type: Boolean, default: false }
}, { _id: true, timestamps: true });

const ProgressHistorySchema = new Schema({
  date: { type: Date, required: true, default: Date.now },
  amount: { type: Number, required: true },
  contribution: { type: Number, default: 0 },
  return: { type: Number, default: 0 }
}, { _id: false });

const InvestmentGoalSchema = new Schema<InvestmentGoalDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  portfolioId: {
    type: Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['RETIREMENT', 'EDUCATION', 'HOME', 'VACATION', 'EMERGENCY', 'OTHER'],
    default: 'OTHER'
  },
  targetAmount: {
    type: Number,
    required: true
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  contributionFrequency: {
    type: String,
    enum: ['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'],
    default: 'MONTHLY'
  },
  contributionAmount: {
    type: Number,
    default: 0
  },
  riskTolerance: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
  inflationRate: {
    type: Number,
    default: 2.5 // 2.5% default inflation rate
  },
  expectedReturnRate: {
    type: Number,
    default: 7 // 7% default expected return rate
  },
  milestones: [MilestoneSchema],
  progressHistory: [ProgressHistorySchema],
  notes: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Virtual for progress percentage
InvestmentGoalSchema.virtual('progressPercentage').get(function() {
  if (this.targetAmount <= 0) return 0;
  return Math.min(100, (this.currentAmount / this.targetAmount) * 100);
});

// Virtual for time remaining in days
InvestmentGoalSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const targetDate = new Date(this.targetDate);
  
  // Calculate difference in milliseconds
  const diffMs = targetDate.getTime() - today.getTime();
  
  // Convert to days
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
});

// Virtual for required monthly contribution
InvestmentGoalSchema.virtual('requiredMonthlyContribution').get(function() {
  const today = new Date();
  const targetDate = new Date(this.targetDate);
  
  // Calculate months remaining
  const monthsRemaining = Math.max(
    0, 
    ((targetDate.getFullYear() - today.getFullYear()) * 12) + 
    (targetDate.getMonth() - today.getMonth())
  );
  
  if (monthsRemaining <= 0) return 0;
  
  const amountNeeded = this.targetAmount - this.currentAmount;
  if (amountNeeded <= 0) return 0;
  
  // Simple calculation without compound interest
  return amountNeeded / monthsRemaining;
});

// Method to check if goal is on track
InvestmentGoalSchema.methods.isOnTrack = function(): boolean {
  // Calculate expected current amount based on time elapsed
  const startDate = new Date(this.startDate);
  const targetDate = new Date(this.targetDate);
  const today = new Date();
  
  const totalDays = (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const elapsedDays = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (totalDays <= 0 || elapsedDays < 0) return false;
  
  const expectedProgress = (elapsedDays / totalDays) * this.targetAmount;
  
  return this.currentAmount >= expectedProgress;
};

// Create the model if it doesn't exist or use the existing one
export const InvestmentGoal = mongoose.models.InvestmentGoal || 
  mongoose.model<InvestmentGoalDocument>('InvestmentGoal', InvestmentGoalSchema);

export default InvestmentGoal; 