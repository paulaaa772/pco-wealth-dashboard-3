import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongo'
import Trade from '@/models/Trade'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    await connectDB()
    const trade = await Trade.create(body)
    return new Response(JSON.stringify({ success: true, trade }), { status: 201 })
  } catch (err: any) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
