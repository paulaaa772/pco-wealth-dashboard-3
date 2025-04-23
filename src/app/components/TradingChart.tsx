import { useState, useEffect, useRef } from 'react'
import { createChart, IChartApi, Time, LineStyle } from 'lightweight-charts'
import { IndicatorComponents } from './indicators/IndicatorComponents'

export default function TradingChart({ data, selectedIndicators = [] }) {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const chartApi = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!chartRef.current) return
    chartApi.current?.remove()
    chartApi.current = createChart(chartRef.current, {
      height: 400,
      layout: { background: { color: '#000' }, textColor: '#fff' },
      grid: { vertLines: { color: '#222' }, horzLines: { color: '#222' } },
      timeScale: { borderColor: '#333' },
    })

    const series = chartApi.current.addCandlestickSeries()
    series.setData(data)

    // 🔍 Debugging: log selectedIndicators and Component check
    console.log('Selected Indicators:', selectedIndicators)

    selectedIndicators.forEach((name: string) => {
      const Comp = IndicatorComponents[name]
      if (typeof Comp !== 'function') {
        console.warn(`Skipping invalid indicator: ${name}`, Comp)
        return
      }
      Comp(chartApi.current!, data)
    })
  }, [data, selectedIndicators])

  return <div ref={chartRef} className="w-full h-[400px]" />
}
