import { connectDB } from '../../../lib/mongo'
import Transaction from '../../../models/Transaction'

export default async function handler(req, res) {
  await connectDB()

  if (req.method === 'GET') {
    const transactions = await Transaction.find().sort({ timestamp: -1 }).limit(50)
    return res.status(200).json(transactions)
  }

  if (req.method === 'POST') {
    const { userId, ticker, type, price, quantity } = req.body
    const transaction = new Transaction({ userId, ticker, type, price, quantity })
    await transaction.save()
    return res.status(201).json(transaction)
  }

  res.status(405).end()
}
