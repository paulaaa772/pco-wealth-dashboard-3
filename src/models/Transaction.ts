import mongoose from 'mongoose'

const TransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  ticker: { type: String, required: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
})

export default mongoose.models?.Transaction || mongoose.model('Transaction', TransactionSchema)
