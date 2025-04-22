export function generateMockCandles(count = 200): {
  time: number
  open: number
  high: number
  low: number
  close: number
}[] {
  const candles = []
  let lastClose = 100
  
  for (let i = 0; i < count; i++) {
    const open = lastClose
    const close = open + (Math.random() - 0.5) * 10
    const high = Math.max(open, close) + Math.random() * 2
    const low = Math.min(open, close) - Math.random() * 2
    
    candles.push({
      time: (Date.now() / 1000) - (count - i) * 3600,
      open,
      high,
      low,
      close
    })
    
    lastClose = close
  }
  
  return candles
}
