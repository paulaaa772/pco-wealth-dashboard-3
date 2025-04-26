import mongoose, { Schema, Document } from 'mongoose';

export interface GoalDocument extends Document {
  userId: string;
  portfolioId: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  targetDate: Date;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  contributionFrequency: 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
  contributionAmount: number;
  milestones: {
    name: string;
    targetAmount: number;
    targetDate: Date;
    isCompleted: boolean;
    completedDate?: Date;
  }[];
  notes: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema({
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true, min: 0 },
  targetDate: { type: Date, required: true },
  isCompleted: { type: Boolean, default: false },
  completedDate: { type: Date }
});

const GoalSchema = new Schema<GoalDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    portfolioId: {
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
    targetAmount: {
      type: Number,
      required: true,
      min: 0
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    targetDate: {
      type: Date,
      required: true
    },
    category: {
      type: String,
      default: 'General'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
      default: 'Not Started'
    },
    contributionFrequency: {
      type: String,
      enum: ['Weekly', 'Monthly', 'Quarterly', 'Annually'],
      default: 'Monthly'
    },
    contributionAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    milestones: [MilestoneSchema],
    notes: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Virtual for calculating progress percentage
GoalSchema.virtual('progressPercentage').get(function() {
  if (this.targetAmount === 0) return 0;
  return (this.currentAmount / this.targetAmount) * 100;
});

// Virtual for calculating remaining amount
GoalSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.targetAmount - this.currentAmount);
});

// Virtual for calculating estimated completion date
GoalSchema.virtual('estimatedCompletionDate').get(function() {
  // If already completed or no contribution, return target date
  if (this.currentAmount >= this.targetAmount || 
      this.contributionAmount <= 0) {
    return this.targetDate;
  }
  
  const remainingAmount = this.targetAmount - this.currentAmount;
  const contributionsNeeded = Math.ceil(remainingAmount / this.contributionAmount);
  
  const today = new Date();
  const estimatedDate = new Date(today);
  
  switch (this.contributionFrequency) {
    case 'Weekly':
      estimatedDate.setDate(today.getDate() + (contributionsNeeded * 7));
      break;
    case 'Monthly':
      estimatedDate.setMonth(today.getMonth() + contributionsNeeded);
      break;
    case 'Quarterly':
      estimatedDate.setMonth(today.getMonth() + (contributionsNeeded * 3));
      break;
    case 'Annually':
      estimatedDate.setFullYear(today.getFullYear() + contributionsNeeded);
      break;
    default:
      return this.targetDate;
  }
  
  return estimatedDate;
});

// Create the model if it doesn't exist or use the existing one
export const Goal = mongoose.models.Goal || 
  mongoose.model<GoalDocument>('Goal', GoalSchema);

export default Goal; 