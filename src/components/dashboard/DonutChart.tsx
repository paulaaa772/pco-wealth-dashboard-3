'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  darkMode?: boolean;
  showLegend?: boolean;
  onSliceClick?: (sliceName: string) => void;
}

const defaultData = [
  { name: 'Technology', value: 20, color: '#4169E1' }, // Royal Blue
  { name: 'Healthcare', value: 15, color: '#9370DB' }, // Medium Purple
  { name: 'Financial Services', value: 10, color: '#20B2AA' }, // Light Sea Green
  { name: 'Consumer Discretionary', value: 12, color: '#3CB371' }, // Medium Sea Green
  { name: 'Communication', value: 9, color: '#FF6347' }, // Tomato
  { name: 'Industrials', value: 8, color: '#6495ED' }, // Cornflower Blue
  { name: 'Other Sectors', value: 26, color: '#A9A9A9' } // Dark Gray
];

const DonutChart: React.FC<DonutChartProps> = ({
  data = defaultData,
  width = 300,
  height = 300,
  innerRadius: propsInnerRadius = 60,
  outerRadius: propsOuterRadius = 100,
  darkMode = false,
  showLegend = true,
  onSliceClick
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ width, height });
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  
  // Calculate inner and outer radius based on container size
  const innerRadius = isMobile ? propsInnerRadius * 0.7 : propsInnerRadius;
  const outerRadius = isMobile ? propsOuterRadius * 0.7 : propsOuterRadius;
  
  // Check if on mobile and adjust chart size
  useEffect(() => {
    const checkIsMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      
      // If we're on mobile, make the chart smaller
      if (chartRef.current) {
        const containerWidth = chartRef.current.clientWidth;
        const newSize = isMobileView 
          ? Math.min(containerWidth, Math.min(width, height) * 0.8) 
          : Math.min(containerWidth, Math.min(width, height));
        
        setChartSize({
          width: newSize,
          height: newSize
        });
      }
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [width, height]);
  
  // Calculate total value from all sectors
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Sort data by value (descending)
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  // Calculate angles and arcs
  let currentAngle = 0;
  const sectors = sortedData.map(item => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...item,
      startAngle,
      endAngle
    };
  });

  // Convert angle to radians
  const angleToRadians = (angle: number) => (angle * Math.PI) / 180;

  // Calculate coordinates on the circle
  const getCoordinates = (angle: number, radius: number) => {
    const centerX = chartSize.width / 2;
    const centerY = chartSize.height / 2;
    const x = centerX + radius * Math.cos(angleToRadians(angle - 90));
    const y = centerY + radius * Math.sin(angleToRadians(angle - 90));
    return { x, y };
  };

  // Draw each sector's arc
  const drawSector = (sector: any) => {
    const centerX = chartSize.width / 2;
    const centerY = chartSize.height / 2;
    const startCoord = getCoordinates(sector.startAngle, outerRadius);
    const endCoord = getCoordinates(sector.endAngle, outerRadius);
    const largeArcFlag = sector.endAngle - sector.startAngle <= 180 ? 0 : 1;

    // SVG path
    const path = [
      `M ${centerX},${centerY}`,
      `L ${startCoord.x},${startCoord.y}`,
      `A ${outerRadius},${outerRadius} 0 ${largeArcFlag} 1 ${endCoord.x},${endCoord.y}`,
      'Z'
    ].join(' ');

    return path;
  };

  // Draw inner circle for the donut effect
  const drawInnerCircle = () => {
    const centerX = chartSize.width / 2;
    const centerY = chartSize.height / 2;
    return {
      cx: centerX,
      cy: centerY,
      r: innerRadius
    };
  };

  // Add value labels
  const getLabelPosition = (sector: any) => {
    const midAngle = (sector.startAngle + sector.endAngle) / 2;
    const labelRadius = (innerRadius + outerRadius) / 2;
    const pos = getCoordinates(midAngle, labelRadius);
    return pos;
  };

  // Check if a point is within a sector
  const isPointInSector = (x: number, y: number, sector: any) => {
    const centerX = chartSize.width / 2;
    const centerY = chartSize.height / 2;
    
    // Get vector from center to point
    const dx = x - centerX;
    const dy = y - centerY;
    
    // Get distance from center
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if point is within donut
    if (distance < innerRadius || distance > outerRadius) {
      return false;
    }
    
    // Get angle of point (in degrees)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Convert to 0-360 range
    angle = (angle + 90) % 360;
    if (angle < 0) angle += 360;
    
    // Check if angle is within sector
    if (sector.startAngle <= sector.endAngle) {
      return angle >= sector.startAngle && angle <= sector.endAngle;
    } else {
      return angle >= sector.startAngle || angle <= sector.endAngle;
    }
  };

  // Handler for mouse move to detect which sector the pointer is over
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartRef.current) return;
    
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    for (const sector of sectors) {
      if (isPointInSector(x, y, sector)) {
        setHoveredSector(sector.name);
        return;
      }
    }
    
    setHoveredSector(null);
  };
  
  // Handler for mouse leave
  const handleMouseLeave = () => {
    setHoveredSector(null);
  };
  
  // Handler for click on a sector
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartRef.current || !onSliceClick) return;
    
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    for (const sector of sectors) {
      if (isPointInSector(x, y, sector)) {
        onSliceClick(sector.name);
        return;
      }
    }
  };

  const textClass = darkMode ? 'fill-white' : 'fill-gray-800';
  const bgClass = darkMode ? 'fill-[#1D2939]' : 'fill-white';
  const legendTextClass = darkMode ? 'text-gray-300' : 'text-gray-700';
  const containerClass = `flex flex-col items-center ${isMobile ? 'mx-auto' : ''}`;

  return (
    <div className={containerClass} ref={chartRef}>
      <div style={{ position: 'relative', width: chartSize.width, height: chartSize.height }}>
        <svg 
          width={chartSize.width} 
          height={chartSize.height} 
          viewBox={`0 0 ${chartSize.width} ${chartSize.height}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{ cursor: onSliceClick ? 'pointer' : 'default' }}
        >
          {/* Sectors */}
          {sectors.map((sector, index) => {
            const isHovered = sector.name === hoveredSector;
            const scale = isHovered ? 1.05 : 1;
            const translateX = isHovered ? (chartSize.width / 2) * 0.03 * Math.cos(angleToRadians((sector.startAngle + sector.endAngle) / 2 - 90)) : 0;
            const translateY = isHovered ? (chartSize.height / 2) * 0.03 * Math.sin(angleToRadians((sector.startAngle + sector.endAngle) / 2 - 90)) : 0;
            
            return (
              <path
                key={`sector-${index}`}
                d={drawSector(sector)}
                fill={sector.color}
                stroke={darkMode ? '#172033' : '#fff'}
                strokeWidth={1}
                transform={isHovered ? `translate(${translateX}, ${translateY}) scale(${scale})` : ''}
                style={{ 
                  transition: 'transform 0.2s ease', 
                  filter: isHovered ? 'brightness(1.1)' : 'none',
                  opacity: hoveredSector && !isHovered ? 0.7 : 1
                }}
              />
            );
          })}

          {/* Inner Circle */}
          <circle
            {...drawInnerCircle()}
            className={bgClass}
          />

          {/* Value Labels (show only for sectors with enough space) */}
          {sectors.map((sector, index) => {
            const angleSize = sector.endAngle - sector.startAngle;
            // Only show label if the sector is big enough
            if (angleSize > 25) {
              const pos = getLabelPosition(sector);
              return (
                <text
                  key={`label-${index}`}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-xs font-medium ${textClass}`}
                  style={{
                    fontSize: isMobile ? '8px' : '10px'  
                  }}
                >
                  {sector.value}%
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className={`mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm ${isMobile ? 'text-xs' : ''}`}>
          {sortedData.map((item, index) => (
            <div 
              key={`legend-${index}`} 
              className="flex items-center cursor-pointer" 
              onClick={() => onSliceClick?.(item.name)}
              onMouseEnter={() => setHoveredSector(item.name)}
              onMouseLeave={() => setHoveredSector(null)}
              style={{ opacity: hoveredSector && hoveredSector !== item.name ? 0.7 : 1 }}
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className={`truncate ${legendTextClass}`} style={{ maxWidth: isMobile ? '80px' : '120px' }}>
                {item.name}
              </span>
              <span className={`ml-1 ${legendTextClass}`}>{item.value}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonutChart; 