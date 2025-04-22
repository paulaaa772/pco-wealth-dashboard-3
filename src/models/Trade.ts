import mongoose from 'mongoose'

const TradeSchema = new mongoose.Schema({
  symbol: String,
  type: { type: String, enum: ['BUY', 'SELL'] },
  amount: Number,
  detail: String,
  timestamp: { type: Date, default: Date.now }
})

export const Trade = mongoose.models.Trade || mongoose.model('Trade', TradeSchema)
