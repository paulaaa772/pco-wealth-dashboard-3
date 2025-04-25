import { NextRequest } from 'next/server'

const POLYGON_API_KEY = process.env.POLYGON_API_KEY!

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol') || 'AAPL'
  const multiplier = 5
  const timespan = 'minute'
  const from = '2023-04-19'
  const to = '2023-04-19'
  
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&limit=1000&apiKey=${POLYGON_API_KEY}`

  try {
    const res = await fetch(url)
    const data = await res.json()

    if (!data.results || !Array.isArray(data.results)) {
      return new Response(JSON.stringify({ error: 'No data returned' }), { status: 500 })
    }

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
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch from Polygon' }), {
      status: 500,
    })
  }
}
