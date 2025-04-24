'use client'

type Props = {
  symbol: string
  setSymbol: (s: string) => void
}

export default function TickerSelector({ symbol, setSymbol }: Props) {
  const options = ['AAPL', 'MSFT', 'TSLA', 'QQQ', 'BTC-USD', 'ETH-USD']

  return (
    <select
      value={symbol}
      onChange={(e) => setSymbol(e.target.value)}
      className="border rounded px-2 py-1 text-sm"
    >
      {options.map((ticker) => (
        <option key={ticker} value={ticker}>
          {ticker}
        </option>
      ))}
    </select>
  )
}
