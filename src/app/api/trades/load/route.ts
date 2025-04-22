import { connectDB } from '@/lib/mongo'
import { Trade } from '@/models/Trade'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const trades = await Trade.find().sort({ timestamp: -1 }).limit(10)
    return new Response(JSON.stringify(trades), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to load trades' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
