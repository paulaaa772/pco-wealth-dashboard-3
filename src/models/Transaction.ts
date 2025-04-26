import mongoose from 'mongoose'

const TransactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  portfolioId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Portfolio'
  },
  type: { 
    type: String, 
    enum: ['buy', 'sell', 'deposit', 'withdrawal', 'dividend', 'interest', 'fee', 'transfer', 'other'],
    required: true 
  },
  symbol: { type: String },
  quantity: { type: Number },
  price: { type: Number },
  amount: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  date: { type: Date, default: Date.now, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  source: { type: String }, // For transfers, deposits, withdrawals
  destination: { type: String }, // For transfers
  notes: { type: String },
  // For tax purposes
  taxYear: { type: Number },
  isWashSale: { type: Boolean, default: false },
  isTaxable: { type: Boolean, default: true },
  gainLoss: { type: Number }, // For sales
}, {
  timestamps: true
})

// Index for efficient queries
TransactionSchema.index({ userId: 1, date: -1 })
TransactionSchema.index({ portfolioId: 1, date: -1 })
TransactionSchema.index({ type: 1, date: -1 })
TransactionSchema.index({ symbol: 1, date: -1 })

export default mongoose.models?.Transaction || mongoose.model('Transaction', TransactionSchema)
