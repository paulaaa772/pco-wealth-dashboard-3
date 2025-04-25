'use client';

import React, { useEffect, useRef } from 'react';

interface SectorAllocation {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data?: SectorAllocation[];
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

const defaultData = [
  { name: 'Technology', value: 35, color: '#4F46E5' },
  { name: 'Healthcare', value: 20, color: '#7C3AED' },
  { name: 'Financials', value: 15, color: '#10B981' },
  { name: 'Consumer Discretionary', value: 12, color: '#F59E0B' },
  { name: 'Communication Services', value: 10, color: '#EF4444' },
  { name: 'Other', value: 8, color: '#9CA3AF' }
];

const DonutChart: React.FC<DonutChartProps> = ({
  data = defaultData,
  width = 300,
  height = 300,
  innerRadius = 75,
  outerRadius = 130
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate center position
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Start angle at top (negative PI/2)
    let startAngle = -Math.PI / 2;
    
    // Draw each sector
    data.forEach(sector => {
      // Calculate angles
      const sectorAngle = (sector.value / totalValue) * 2 * Math.PI;
      const endAngle = startAngle + sectorAngle;
      
      // Draw sector
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.closePath();
      
      // Set colors
      ctx.fillStyle = sector.color;
      ctx.fill();
      
      // Increment start angle for next sector
      startAngle = endAngle;
    });
    
    // Draw inner circle to create donut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    
    // Draw center text
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${totalValue}%`, centerX, centerY - 12);
    
    ctx.fillStyle = '#6B7280';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('Allocated', centerX, centerY + 12);
    
  }, [data, width, height, innerRadius, outerRadius, totalValue]);
  
  return (
    <div className="relative">
      <canvas 
        ref={canvasRef}
        width={width}
        height={height}
        className="mx-auto"
      />
      
      <div className="grid grid-cols-2 gap-y-2 gap-x-8 mt-4">
        {data.map((sector, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: sector.color }}
            />
            <div className="text-sm flex justify-between w-full">
              <span className="text-gray-700">{sector.name}</span>
              <span className="font-medium">{sector.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart; 