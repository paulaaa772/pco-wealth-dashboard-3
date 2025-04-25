import { NextRequest } from 'next/server'

const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY!

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol') || 'AAPL'
  const multiplier = 5
  const timespan = 'minute'
  
  // Calculate dates for the last 7 days
  const today = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(today.getDate() - 7)
  
  // Format dates as YYYY-MM-DD
  const from = sevenDaysAgo.toISOString().split('T')[0]
  const to = today.toISOString().split('T')[0]
  
  console.log(`Fetching candles for ${symbol} from ${from} to ${to}`)
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&limit=1000&apiKey=${POLYGON_API_KEY}`

  try {
    console.log(`Making request to: ${url.replace(POLYGON_API_KEY, '[REDACTED]')}`)
    const res = await fetch(url)
    const data = await res.json()

    if (!data.results || !Array.isArray(data.results)) {
      console.error('No data returned from Polygon API:', data)
      return new Response(JSON.stringify({ error: 'No data returned', details: data }), { status: 500 })
    }

    console.log(`Received ${data.results.length} candles from Polygon API`)
    const candles = data.results.map((d: any) => ({
      time: d.t / 1000,
      open: d.o,
      high: d.h,
      low: d.l,
      close: d.c,
    }))

    return new Response(JSON.stringify(candles), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Failed to fetch from Polygon:', err.message)
    return new Response(JSON.stringify({ error: 'Failed to fetch from Polygon', message: err.message }), {
      status: 500,
    })
  }
}
