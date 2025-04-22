import { NextRequest } from 'next/server'

type PolygonCandle = {
  t: number // timestamp
  o: number // open
  h: number // high
  l: number // low
  c: number // close
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol') || 'AAPL'
  const timespan = 'minute'
  const multiplier = 5
  const limit = 100
  const today = new Date().toISOString().split('T')[0]

  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${today}/${today}?adjusted=true&sort=asc&limit=${limit}&apiKey=${process.env.POLYGON_API_KEY}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (!data.results || !Array.isArray(data.results)) {
      return new Response(JSON.stringify({ error: 'No data returned' }), { status: 500 })
    }

    const formatted = data.results.map((d: PolygonCandle) => ({
      time: Math.floor(d.t / 1000),
      open: d.o,
      high: d.h,
      low: d.l,
      close: d.c,
    }))

    return new Response(JSON.stringify(formatted), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), { status: 500 })
  }
}
