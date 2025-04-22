'use client'
import { useEffect, useRef } from 'react'
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts'

export default function AdvancedTradingChart({ data }) {
  const chartRef = useRef(null)
  const chartCreated = useRef(null)

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#333',
      },
      width: chartRef.current.clientWidth,
      height: 500,
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    })

    candleSeries.setData(data)

    // Add volume indicator
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a80',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    })
    volumeSeries.setData(data.map(d => ({
      time: d.time,
      value: d.volume,
      color: d.close >= d.open ? '#26a69a80' : '#ef535080'
    })))

    chartCreated.current = chart

    return () => {
      chart.remove()
    }
  }, [data])

  return <div ref={chartRef} className="w-full h-[500px]" />
}
