'use client';

import { useEffect, useRef, useState } from 'react';

// The original polygon data format
interface PolygonCandle {
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  t: number; // timestamp
  v: number; // volume
}

// The brokerage page data format
interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradingChartProps {
  symbol: string;
  data: CandleData[] | PolygonCandle[];
  currentPrice?: number;
}

const TradingChart: React.FC<TradingChartProps> = ({ symbol, data, currentPrice }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Set up the canvas dimensions
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const parent = canvas.parentElement;
      
      if (parent) {
        const { width, height } = parent.getBoundingClientRect();
        setDimensions({ width, height });
        canvas.width = width;
        canvas.height = height;
      }
    }
  }, []);

  // Determine if data is in PolygonCandle format (has 'o' property)
  const isPolygonFormat = (data: any[]): data is PolygonCandle[] => {
    return data.length > 0 && 'o' in data[0];
  };

  // Draw the chart whenever data or dimensions change
  useEffect(() => {
    if (canvasRef.current && data.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Map data to a consistent format for drawing
      const formattedData = isPolygonFormat(data)
        ? data.map(candle => ({
            high: candle.h,
            low: candle.l,
            open: candle.o,
            close: candle.c,
            timestamp: candle.t,
            volume: candle.v
          }))
        : data.map(candle => ({
            high: candle.high,
            low: candle.low,
            open: candle.open,
            close: candle.close,
            timestamp: candle.timestamp,
            volume: candle.volume
          }));
      
      // Calculate min and max values for scaling
      const prices = formattedData.flatMap(candle => [candle.high, candle.low]);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice;
      
      // Calculate the width of each candle
      const candleWidth = Math.floor(canvas.width / formattedData.length);
      const padding = 0.2 * candleWidth;
      const bodyWidth = candleWidth - padding * 2;
      
      // Draw the candles
      formattedData.forEach((candle, i) => {
        const x = i * candleWidth;
        
        // Calculate y coordinates (inverted because canvas y-axis points down)
        const yHigh = canvas.height - ((candle.high - minPrice) / priceRange) * canvas.height;
        const yLow = canvas.height - ((candle.low - minPrice) / priceRange) * canvas.height;
        const yOpen = canvas.height - ((candle.open - minPrice) / priceRange) * canvas.height;
        const yClose = canvas.height - ((candle.close - minPrice) / priceRange) * canvas.height;
        
        // Determine if it's an up or down candle
        const isUp = candle.close >= candle.open;
        const color = isUp ? 'green' : 'red';
        
        // Draw the wick (high-low line)
        ctx.beginPath();
        ctx.moveTo(x + candleWidth / 2, yHigh);
        ctx.lineTo(x + candleWidth / 2, yLow);
        ctx.strokeStyle = color;
        ctx.stroke();
        
        // Draw the body (open-close rectangle)
        ctx.fillStyle = color;
        ctx.fillRect(
          x + padding,
          Math.min(yOpen, yClose),
          bodyWidth,
          Math.abs(yClose - yOpen) || 1 // at least 1px height
        );
      });
      
      // Draw symbol and price info
      ctx.font = '14px Arial';
      ctx.fillStyle = 'white';
      
      // Draw background for text
      ctx.fillRect(5, 5, 150, 25);
      
      // Draw text
      ctx.fillStyle = 'black';
      const displayPrice = currentPrice || (formattedData[formattedData.length - 1]?.close);
      ctx.fillText(`${symbol}: $${displayPrice?.toFixed(2) || 'N/A'}`, 10, 20);
    }
  }, [data, dimensions, symbol, currentPrice]);

  return (
    <div className="relative w-full h-full">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
    </div>
  );
};

export default TradingChart; 