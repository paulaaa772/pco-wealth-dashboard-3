import { safeAccess } from '../../utils/dataValidation';

export default async function handler(req, res) {
  const { ticker = 'AAPL' } = req.query;
  
  if (!process.env.PUBLIC_POLYGON_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?apiKey=${process.env.PUBLIC_POLYGON_API_KEY}`);
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    const data = await response.json();
    
    res.status(200).json({
      symbol: ticker,
      price: safeAccess(data, 'results.0.c', 0).toFixed(2),
      volume: safeAccess(data, 'results.0.v', 0)
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Data fetch failed',
      details: error.message 
    });
  }
}
