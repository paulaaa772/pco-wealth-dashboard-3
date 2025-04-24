export default async function handler(req, res) {
  const { symbol = 'AAPL' } = req.query

  if (!process.env.POLYGON_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/minute/2023-04-01/2023-04-01?apiKey=${process.env.POLYGON_API_KEY}`
    const response = await fetch(url)
    const json = await response.json()

    const candles = json.results?.map((d) => ({
      time: d.t / 1000,
      open: d.o,
      high: d.h,
      low: d.l,
      close: d.c,
    }))

    res.status(200).json({ candles })
  } catch (error) {
    res.status(500).json({ error: 'Failed to load data', details: error.message })
  }
}
