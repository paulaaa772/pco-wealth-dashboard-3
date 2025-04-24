'use client'

import React, { useRef, useEffect, useState } from 'react'
import { createChart, LineStyle, CrosshairMode } from 'lightweight-charts'
import IndicatorSelector from './IndicatorSelector'
import { indicatorDefinitions } from '@/app/components/indicators/IndicatorComponents'
// Remove conflicting import and use our own interface definition
// import { ManualOrder } from './brokerage/OrderEntryPanel'

// Define interfaces for the data
export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface ManualOrder {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market' | 'stop';
  amount: number;
  price?: number;
  timestamp?: number;
  entryPrice?: number;
  limitPrice?: number;
  stopPrice?: number;
}

interface TradingChartProps {
  symbol: string;
  data: CandleData[];
  manualTrades?: ManualOrder[];
  selectedIndicators?: string[];
}

const TradingChart: React.FC<TradingChartProps> = ({ symbol, data, manualTrades = [], selectedIndicators = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chart = useRef<any>(null)
  const candleSeries = useRef<any>(null)
  const [indicators, setIndicators] = useState<string[]>(selectedIndicators)
  const [error, setError] = useState<string | null>(null)
  const [canvasDims, setCanvasDims] = useState({ width: 0, height: 0 })

  // Handle canvas resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current
        const parent = canvas.parentElement
        if (!parent) return
        
        // Get parent dimensions, subtract padding
        const parentStyle = window.getComputedStyle(parent)
        const paddingLeft = parseFloat(parentStyle.paddingLeft || '0')
        const paddingRight = parseFloat(parentStyle.paddingRight || '0')
        const paddingTop = parseFloat(parentStyle.paddingTop || '0')
        const paddingBottom = parseFloat(parentStyle.paddingBottom || '0')
        
        const width = parent.clientWidth - paddingLeft - paddingRight
        const height = parent.clientHeight - paddingTop - paddingBottom
        
        // Set canvas dimensions
        canvas.width = width
        canvas.height = height
        setCanvasDims({ width, height })
      }
    }
    
    // Initial update and add resize listener
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    return () => {
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  // Draw the chart when data or dimensions change
  useEffect(() => {
    const drawChart = () => {
      if (!canvasRef.current || !data || data.length === 0) return
      
      console.log(`Drawing chart for ${symbol} with ${data.length} data points`);
      console.log('First data point:', data[0]);
      
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Set up chart dimensions
      const margin = { top: 20, right: 60, bottom: 30, left: 60 }
      const chartWidth = canvas.width - margin.left - margin.right
      const chartHeight = canvas.height - margin.top - margin.bottom
      
      // Find min and max values
      let minPrice = Number.MAX_VALUE
      let maxPrice = Number.MIN_VALUE
      
      data.forEach(candle => {
        // Skip any invalid data points
        if (typeof candle.low !== 'number' || typeof candle.high !== 'number') {
          console.warn('Invalid candle data point:', candle);
          return;
        }
        minPrice = Math.min(minPrice, candle.low)
        maxPrice = Math.max(maxPrice, candle.high)
      })
      
      // Check if we have valid min/max values
      if (minPrice === Number.MAX_VALUE || maxPrice === Number.MIN_VALUE) {
        console.error('Could not determine price range from data');
        return;
      }
      
      // Add some padding to the min/max
      const pricePadding = (maxPrice - minPrice) * 0.1
      minPrice -= pricePadding
      maxPrice += pricePadding
      
      // Calculate scale factors
      const candleWidth = chartWidth / data.length
      const priceScale = chartHeight / (maxPrice - minPrice)
      
      // Helper function to convert price to Y coordinate
      const priceToY = (price: number) => 
        margin.top + chartHeight - (price - minPrice) * priceScale
      
      // Draw grid lines and price labels
      ctx.strokeStyle = '#444'
      ctx.fillStyle = '#aaa'
      ctx.font = '10px Arial'
      ctx.textAlign = 'right'
      
      // Draw price grid lines (horizontal)
      const priceStep = (maxPrice - minPrice) / 5
      for (let i = 0; i <= 5; i++) {
        const price = minPrice + priceStep * i
        const y = priceToY(price)
        
        ctx.beginPath()
        ctx.moveTo(margin.left, y)
        ctx.lineTo(margin.left + chartWidth, y)
        ctx.stroke()
        
        // Price label
        ctx.fillText(price.toFixed(2), margin.left - 5, y + 4)
      }
      
      // Draw time grid lines (vertical) - every 5th candle
      ctx.textAlign = 'center'
      for (let i = 0; i < data.length; i += 5) {
        const x = margin.left + i * candleWidth + candleWidth / 2
        
        ctx.beginPath()
        ctx.moveTo(x, margin.top)
        ctx.lineTo(x, margin.top + chartHeight)
        ctx.stroke()
        
        // Only show date for every 5th candle
        if (i % 5 === 0 && data[i]) {
          const dateStr = data[i].time.split('T')[0]
          ctx.fillText(dateStr, x, margin.top + chartHeight + 15)
        }
      }
      
      // Draw each candle
      data.forEach((candle, i) => {
        if (!candle || typeof candle.open !== 'number' || typeof candle.high !== 'number' ||
            typeof candle.low !== 'number' || typeof candle.close !== 'number') {
          console.warn(`Invalid candle data at index ${i}:`, candle)
          return
        }
        
        const x = margin.left + i * candleWidth
        const candleBodyWidth = Math.max(1, candleWidth * 0.8)
        const bodyX = x + (candleWidth - candleBodyWidth) / 2
        
        // Calculate y coordinates
        const openY = priceToY(candle.open)
        const closeY = priceToY(candle.close)
        const highY = priceToY(candle.high)
        const lowY = priceToY(candle.low)
        
        // Determine if bullish (green) or bearish (red)
        const isBullish = candle.close > candle.open
        ctx.fillStyle = isBullish ? '#4caf50' : '#f44336'
        ctx.strokeStyle = isBullish ? '#4caf50' : '#f44336'
        
        // Draw candle wick (high to low)
        ctx.beginPath()
        ctx.moveTo(x + candleWidth / 2, highY)
        ctx.lineTo(x + candleWidth / 2, lowY)
        ctx.stroke()
        
        // Draw candle body (open to close)
        const bodyHeight = Math.max(1, Math.abs(closeY - openY))
        const bodyY = isBullish ? closeY : openY
        
        ctx.fillRect(bodyX, bodyY, candleBodyWidth, bodyHeight)
      })
      
      // Draw current price line and label
      if (data.length > 0) {
        const currentPrice = data[data.length - 1].close
        const y = priceToY(currentPrice)
        
        // Draw line
        ctx.beginPath()
        ctx.strokeStyle = '#ffeb3b'
        ctx.setLineDash([5, 3])
        ctx.moveTo(margin.left, y)
        ctx.lineTo(margin.left + chartWidth, y)
        ctx.stroke()
        ctx.setLineDash([])
        
        // Draw price label
        ctx.fillStyle = '#ffeb3b'
        ctx.textAlign = 'left'
        ctx.fillText(`$${currentPrice.toFixed(2)}`, margin.left + chartWidth + 5, y + 4)
      }
      
      // Draw symbol and a timestamp to identify the chart
      ctx.fillStyle = '#aaa'
      ctx.font = '14px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(symbol, margin.left, margin.top - 5)
      
      // Draw timestamp
      const now = new Date()
      ctx.font = '10px Arial'
      ctx.textAlign = 'right'
      ctx.fillText(`Last updated: ${now.toLocaleTimeString()}`, margin.left + chartWidth, margin.top - 5)
    }
    
    drawChart()
  }, [symbol, data, canvasDims])

  // Cleanup chart on component unmount
  useEffect(() => {
    return () => {
      if (chart.current) {
        try { chart.current.remove(); } catch (e) {}
        chart.current = null
      }
    }
  }, [])

  // --- Rendering --- 
  return (
    <div className="w-full h-full relative">
      {(!data || data.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          No data available for {symbol}
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: (!data || data.length === 0) ? 'none' : 'block' }}
      />
      <div className="mt-2 flex-shrink-0">
        <IndicatorSelector
          onSelect={(name) => setIndicators((prev) => [...prev, name])}
        />
      </div>
    </div>
  )
}

export default TradingChart
