import mongoose, { Schema, Document } from 'mongoose';

export interface InvestmentDocument extends Document {
  userId: string;
  symbol: string;
  name: string;
  shares: number;
  price: number;
  date: Date;
  sector: string;
  category: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvestmentSchema = new Schema<InvestmentDocument>(
  {
    userId: { 
      type: String, 
      required: true, 
      index: true 
    },
    symbol: { 
      type: String, 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    shares: { 
      type: Number, 
      required: true 
    },
    price: { 
      type: Number, 
      required: true 
    },
    date: { 
      type: Date, 
      required: true 
    },
    sector: { 
      type: String, 
      default: 'Unknown' 
    },
    category: { 
      type: String, 
      default: 'Stock' 
    },
    type: { 
      type: String, 
      default: 'Buy' 
    },
  },
  { 
    timestamps: true 
  }
);

// Create the model if it doesn't exist or use the existing one
export const Investment = mongoose.models.Investment || 
  mongoose.model<InvestmentDocument>('Investment', InvestmentSchema);

export default Investment; 