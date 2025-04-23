'use client'

import { useEffect, useRef } from 'react'
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickData
} from 'lightweight-charts'

type Props = {
  data: CandlestickData[]
}

export default function AdvancedTradingChart({ data }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartCreated = useRef<any>(null)

  useEffect(() => {
    if (!chartRef.current || chartCreated.current) return

    const chart = createChart(chartRef.current, {
      height: 300,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333'
      },
      grid: {
        vertLines: { color: '#eee' },
        horzLines: { color: '#eee' }
      },
      crosshair: {
        mode: CrosshairMode.Normal
      }
    })

    const series = chart.addCandlestickSeries()
    series.setData(data)
    chartCreated.current = true
  }, [data])

  return <div ref={chartRef} className="w-full border rounded" />
}
