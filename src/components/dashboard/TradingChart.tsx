'use client';

import { useEffect, useRef, useState } from 'react';

interface CandleData {
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  t: number; // timestamp
  v: number; // volume
}

interface TradingChartProps {
  symbol: string;
  data: CandleData[];
}

const TradingChart: React.FC<TradingChartProps> = ({ symbol, data }) => {
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

  // Draw the chart whenever data or dimensions change
  useEffect(() => {
    if (canvasRef.current && data.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate min and max values for scaling
      const prices = data.flatMap(candle => [candle.h, candle.l]);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice;
      
      // Calculate the width of each candle
      const candleWidth = Math.floor(canvas.width / data.length);
      const padding = 0.2 * candleWidth;
      const bodyWidth = candleWidth - padding * 2;
      
      // Draw the candles
      data.forEach((candle, i) => {
        const x = i * candleWidth;
        
        // Calculate y coordinates (inverted because canvas y-axis points down)
        const yHigh = canvas.height - ((candle.h - minPrice) / priceRange) * canvas.height;
        const yLow = canvas.height - ((candle.l - minPrice) / priceRange) * canvas.height;
        const yOpen = canvas.height - ((candle.o - minPrice) / priceRange) * canvas.height;
        const yClose = canvas.height - ((candle.c - minPrice) / priceRange) * canvas.height;
        
        // Determine if it's an up or down candle
        const isUp = candle.c >= candle.o;
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
      
      // Draw symbol and current price
      const lastPrice = data[data.length - 1].c;
      ctx.font = '14px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText(`${symbol}: $${lastPrice.toFixed(2)}`, 10, 20);
    }
  }, [data, dimensions, symbol]);

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