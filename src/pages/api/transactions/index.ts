import { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '../../../lib/mongo'
import Transaction from '../../../models/Transaction'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB()

  if (req.method === 'GET') {
    const transactions = await Transaction.find({})
    return res.status(200).json(transactions)
  }

  if (req.method === 'POST') {
    const transaction = await Transaction.create(req.body)
    return res.status(201).json(transaction)
  }

  res.status(405).end()
}
