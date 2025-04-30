import mongoose, { Schema, Document } from 'mongoose';

// Subdocument schema for assets within an account
const ManualAssetSchema = new Schema({
  id: { type: String, required: true }, // Keep the original row ID if needed, or generate new ObjectId
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  value: { type: Number, required: true },
  costBasis: { type: Number },
  assetType: { type: String, enum: ['Stock', 'Bond', 'ETF', 'Mutual Fund', 'CD', 'Crypto', 'Cash', 'Other'] },
}, { _id: false }); // Don't create separate _id for subdocuments unless needed

// Main schema for the ManualAccount
export interface ManualAccountDocument extends Document {
  userId: string; // To associate account with a user later
  accountName: string;
  accountType: string;
  assets: {
    id: string;
    symbol: string;
    quantity: number;
    value: number;
    costBasis?: number;
    assetType?: 'Stock' | 'Bond' | 'ETF' | 'Mutual Fund' | 'CD' | 'Crypto' | 'Cash' | 'Other';
  }[];
  totalValue: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ManualAccountSchema = new Schema<ManualAccountDocument>(
  {
    userId: { type: String, required: true, index: true, default: 'user_placeholder' }, // Add default for now
    accountName: { type: String, required: true },
    accountType: { type: String, required: true },
    assets: [ManualAssetSchema], // Embed the asset schema
    totalValue: { type: Number, required: true },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt
);

// Create model or retrieve existing one
export const ManualAccountModel = mongoose.models.ManualAccount || 
  mongoose.model<ManualAccountDocument>('ManualAccount', ManualAccountSchema);

export default ManualAccountModel; 