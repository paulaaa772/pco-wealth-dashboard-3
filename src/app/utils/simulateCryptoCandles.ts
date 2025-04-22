import { CandlestickData, Time } from 'lightweight-charts'

export function generateMockCandles(start: number, count: number): CandlestickData[] {
  const candles: CandlestickData[] = []
  let base = 29500 + Math.random() * 1000
  for (let i = 0; i < count; i++) {
    const open = base + Math.random() * 100 - 50
    const high = open + Math.random() * 50
    const low = open - Math.random() * 50
    const close = low + Math.random() * (high - low)
    candles.push({
      time: (start + i * 60) as Time,
      open,
      high,
      low,
      close,
    })
    base = close
  }
  return candles
}
