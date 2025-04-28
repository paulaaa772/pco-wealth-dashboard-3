import React, { useRef, useEffect, useState } from 'react';

interface DataPoint {
  date: string;
  value: number;
}

interface PerformanceChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  lineColor?: string;
  areaColor?: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  title = 'Portfolio Performance',
  height = 200,
  lineColor = '#3b82f6',
  areaColor = 'rgba(59, 130, 246, 0.1)'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });

  // Update dimensions when window resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const { width } = canvasRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  // Draw chart when data or dimensions change
  useEffect(() => {
    if (!canvasRef.current || !dimensions.width || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    
    // Find min and max values for scaling
    const values = data.map(d => d.value);
    const minValue = Math.min(...values) * 0.95;
    const maxValue = Math.max(...values) * 1.05;
    const valueRange = maxValue - minValue;
    
    // Calculate points
    const points = data.map((point, index) => ({
      x: (index / (data.length - 1)) * dimensions.width,
      y: dimensions.height - ((point.value - minValue) / valueRange) * (dimensions.height * 0.8) - (dimensions.height * 0.1)
    }));
    
    // Draw area under the line
    ctx.beginPath();
    ctx.moveTo(points[0].x, dimensions.height - (dimensions.height * 0.1));
    points.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(points[points.length - 1].x, dimensions.height - (dimensions.height * 0.1));
    ctx.closePath();
    ctx.fillStyle = areaColor;
    ctx.fill();
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((point, index) => {
      if (index > 0) {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw dots at data points
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    
    // Draw latest value
    const latestValue = data[data.length - 1].value;
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`$${latestValue.toLocaleString()}`, dimensions.width - 5, points[points.length - 1].y - 10);
    
  }, [data, dimensions, lineColor, areaColor]);

  // Calculate performance metrics
  const latestValue = data.length > 0 ? data[data.length - 1].value : 0;
  const startValue = data.length > 0 ? data[0].value : 0;
  const changeAmount = latestValue - startValue;
  const changePercent = startValue !== 0 ? (changeAmount / startValue) * 100 : 0;
  const isPositive = changeAmount >= 0;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-right">
          <div className="text-xl font-bold">${latestValue.toLocaleString()}</div>
          <div className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{changeAmount.toLocaleString()} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>
      
      <div className="w-full" style={{ height: `${height}px` }}>
        <canvas 
          ref={canvasRef} 
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      
      {data.length > 0 && (
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{new Date(data[0].date).toLocaleDateString()}</span>
          <span>{new Date(data[data.length - 1].date).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
};

export default PerformanceChart; 