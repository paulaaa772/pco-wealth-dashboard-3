'use client'

import React, { useRef, useEffect, useState } from 'react';
import { DrawingTool } from './TradingTools';

interface Point {
  x: number;
  y: number;
  logicalX?: number; // Chart-specific logical coordinates 
  logicalY?: number; // For converting back to prices/times
}

interface DrawingObject {
  id: string;
  type: DrawingTool;
  points: Point[];
  color: string;
  lineWidth: number;
  selected: boolean;
}

interface DrawingCanvasProps {
  activeTool: DrawingTool;
  width: number;
  height: number;
  chartInstance: any; // This will be the lightweight-charts instance
  onDrawingComplete?: (drawing: DrawingObject) => void;
  onClearDrawings?: () => void;
}

const DRAWING_COLORS = [
  '#1976D2', // Blue
  '#388E3C', // Green
  '#D32F2F', // Red
  '#FFA000', // Amber
  '#7B1FA2', // Purple
  '#00796B', // Teal
];

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  activeTool,
  width,
  height,
  chartInstance,
  onDrawingComplete,
  onClearDrawings
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawings, setDrawings] = useState<DrawingObject[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingObject | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [draggingPoint, setDraggingPoint] = useState<{drawingId: string, pointIndex: number} | null>(null);
  const [selectedDrawing, setSelectedDrawing] = useState<string | null>(null);
  
  // Initialize drawing color
  const [currentColor, setCurrentColor] = useState(DRAWING_COLORS[0]);
  
  // Get next drawing ID
  const getNextId = () => `drawing-${drawings.length + 1}`;
  
  // Draw all objects on canvas
  const drawObjects = () => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw all saved drawings
    [...drawings, ...(currentDrawing ? [currentDrawing] : [])].forEach(drawing => {
      drawSingleObject(ctx, drawing);
    });
  };
  
  // Draw a single object
  const drawSingleObject = (ctx: CanvasRenderingContext2D, drawing: DrawingObject) => {
    const { type, points, color, lineWidth, selected } = drawing;
    
    // Set drawing styles
    ctx.strokeStyle = color;
    ctx.lineWidth = selected ? lineWidth + 1 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw based on drawing type
    switch (type) {
      case 'trendLine':
        if (points.length >= 2) {
          drawLine(ctx, points[0], points[1]);
        }
        break;
        
      case 'ray':
        if (points.length >= 2) {
          drawRay(ctx, points[0], points[1]);
        }
        break;
        
      case 'horizontalLine':
        if (points.length >= 1) {
          drawHorizontalLine(ctx, points[0]);
        }
        break;
        
      case 'verticalLine':
        if (points.length >= 1) {
          drawVerticalLine(ctx, points[0]);
        }
        break;
        
      case 'horizontalRay':
        if (points.length >= 2) {
          drawHorizontalRay(ctx, points[0], points[1]);
        }
        break;
      
      case 'extendedLine':
        if (points.length >= 2) {
          drawExtendedLine(ctx, points[0], points[1]);
        }
        break;
        
      case 'crossLine':
        if (points.length >= 1) {
          drawCrossLine(ctx, points[0]);
        }
        break;
        
      case 'trendAngle':
        if (points.length >= 2) {
          drawTrendAngle(ctx, points[0], points[1]);
        }
        break;
        
      case 'infoLine':
        if (points.length >= 2) {
          drawInfoLine(ctx, points[0], points[1]);
        }
        break;
        
      case 'parallelChannel':
        if (points.length >= 3) {
          drawParallelChannel(ctx, points[0], points[1], points[2]);
        }
        break;
        
      case 'flatChannel':
        if (points.length >= 2) {
          drawFlatChannel(ctx, points[0], points[1]);
        }
        break;
        
      case 'pitchfork':
        if (points.length >= 3) {
          drawPitchfork(ctx, points[0], points[1], points[2]);
        }
        break;
        
      default:
        // Draw points if nothing else
        points.forEach(point => {
          drawControlPoint(ctx, point, color);
        });
    }
    
    // Always draw control points for selected drawings
    if (selected && points.length > 0) {
      points.forEach(point => {
        drawControlPoint(ctx, point, color);
      });
    }
  };
  
  // Helper drawing functions
  const drawLine = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  };
  
  const drawRay = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    // Calculate direction vector
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // Extend the ray to the edge of the canvas
    let endX = end.x;
    let endY = end.y;
    
    // Calculate where ray intersects canvas edge
    if (Math.abs(dx) > Math.abs(dy)) {
      // Ray is more horizontal
      endX = dx > 0 ? width : 0;
      const scale = (endX - start.x) / dx;
      endY = start.y + dy * scale;
    } else {
      // Ray is more vertical
      endY = dy > 0 ? height : 0;
      const scale = (endY - start.y) / dy;
      endX = start.x + dx * scale;
    }
    
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  };
  
  const drawHorizontalLine = (ctx: CanvasRenderingContext2D, point: Point) => {
    ctx.beginPath();
    ctx.moveTo(0, point.y);
    ctx.lineTo(width, point.y);
    ctx.stroke();
    
    // Add price label
    if (chartInstance) {
      try {
        const price = chartInstance.timeScale().coordinateToPrice(point.y);
        ctx.font = '12px Arial';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.textAlign = 'left';
        ctx.fillText(`$${price.toFixed(2)}`, width - 60, point.y - 5);
      } catch (e) {
        // Ignore price conversion errors
      }
    }
  };
  
  const drawVerticalLine = (ctx: CanvasRenderingContext2D, point: Point) => {
    ctx.beginPath();
    ctx.moveTo(point.x, 0);
    ctx.lineTo(point.x, height);
    ctx.stroke();
    
    // Add date label if chart instance available
    if (chartInstance) {
      try {
        const time = chartInstance.timeScale().coordinateToTime(point.x);
        ctx.font = '12px Arial';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.textAlign = 'center';
        ctx.fillText(new Date(time * 1000).toLocaleDateString(), point.x, height - 10);
      } catch (e) {
        // Ignore time conversion errors
      }
    }
  };
  
  const drawHorizontalRay = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    // Draw a ray that extends horizontally from the start point
    const direction = end.x > start.x ? 1 : -1;
    const endX = direction > 0 ? width : 0;
    
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(endX, start.y);
    ctx.stroke();
  };
  
  const drawExtendedLine = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    // Draw a line that extends infinitely in both directions
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // Calculate endpoints at canvas edges
    let leftX = 0;
    let leftY = start.y - (dx === 0 ? 0 : (start.x * dy / dx));
    
    let rightX = width;
    let rightY = start.y + (dx === 0 ? 0 : ((width - start.x) * dy / dx));
    
    // If line is more vertical, calculate using top/bottom intersection
    if (Math.abs(dy) > Math.abs(dx)) {
      let topX = start.x - (dy === 0 ? 0 : (start.y * dx / dy));
      let topY = 0;
      
      let bottomX = start.x + (dy === 0 ? 0 : ((height - start.y) * dx / dy));
      let bottomY = height;
      
      // Use the top and bottom intersections if they're within canvas
      if (topX >= 0 && topX <= width) {
        leftX = topX;
        leftY = topY;
      }
      
      if (bottomX >= 0 && bottomX <= width) {
        rightX = bottomX;
        rightY = bottomY;
      }
    }
    
    ctx.beginPath();
    ctx.moveTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.stroke();
  };
  
  const drawCrossLine = (ctx: CanvasRenderingContext2D, point: Point) => {
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, point.y);
    ctx.lineTo(width, point.y);
    ctx.stroke();
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(point.x, 0);
    ctx.lineTo(point.x, height);
    ctx.stroke();
  };
  
  const drawTrendAngle = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    // Draw basic trendline
    drawLine(ctx, start, end);
    
    // Calculate angle
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180 / Math.PI).toFixed(1);
    
    // Draw angle arc
    const radius = 30;
    ctx.beginPath();
    ctx.arc(start.x, start.y, radius, 0, angleRad, angleRad < 0);
    ctx.stroke();
    
    // Draw angle label
    ctx.font = '12px Arial';
    ctx.fillStyle = ctx.strokeStyle;
    ctx.textAlign = 'center';
    ctx.fillText(`${angleDeg}°`, start.x + radius * Math.cos(angleRad/2), start.y + radius * Math.sin(angleRad/2));
  };
  
  const drawInfoLine = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    // Draw trendline
    drawLine(ctx, start, end);
    
    // Calculate price change
    if (chartInstance) {
      try {
        const price1 = chartInstance.priceScale().coordinateToPrice(start.y);
        const price2 = chartInstance.priceScale().coordinateToPrice(end.y);
        const change = price2 - price1;
        const percentChange = ((change / price1) * 100).toFixed(2);
        
        // Draw info label at midpoint
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        
        ctx.font = '12px Arial';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.textAlign = 'center';
        ctx.fillText(`$${Math.abs(change).toFixed(2)} (${percentChange}%)`, midX, midY - 10);
      } catch (e) {
        // Ignore price conversion errors
      }
    }
  };
  
  const drawParallelChannel = (ctx: CanvasRenderingContext2D, p1: Point, p2: Point, p3: Point) => {
    // Draw first line (p1 to p2)
    drawLine(ctx, p1, p2);
    
    // Calculate vector from p1 to p2
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    
    // Calculate parallel line through p3
    const p4 = {
      x: p3.x + dx,
      y: p3.y + dy
    };
    
    // Draw parallel line
    drawLine(ctx, p3, p4);
    
    // Draw connecting lines if needed
    ctx.setLineDash([5, 5]);
    drawLine(ctx, p1, p3);
    drawLine(ctx, p2, p4);
    ctx.setLineDash([]);
  };
  
  const drawFlatChannel = (ctx: CanvasRenderingContext2D, p1: Point, p2: Point) => {
    // Draw horizontal lines
    ctx.beginPath();
    ctx.moveTo(0, p1.y);
    ctx.lineTo(width, p1.y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, p2.y);
    ctx.lineTo(width, p2.y);
    ctx.stroke();
    
    // Fill channel
    ctx.fillStyle = `${ctx.strokeStyle}20`; // 20% opacity
    ctx.fillRect(0, Math.min(p1.y, p2.y), width, Math.abs(p2.y - p1.y));
  };
  
  const drawPitchfork = (ctx: CanvasRenderingContext2D, p1: Point, p2: Point, p3: Point) => {
    // Calculate midpoint between p2 and p3
    const midX = (p2.x + p3.x) / 2;
    const midY = (p2.y + p3.y) / 2;
    
    // Draw handle
    drawLine(ctx, p1, { x: midX, y: midY });
    
    // Draw outer tines
    drawLine(ctx, p1, p2);
    drawLine(ctx, p1, p3);
    
    // Calculate and draw median line
    const slope = (midY - p1.y) / (midX - p1.x);
    const extendedX = width;
    const extendedY = p1.y + slope * (extendedX - p1.x);
    
    drawLine(ctx, { x: midX, y: midY }, { x: extendedX, y: extendedY });
  };
  
  const drawControlPoint = (ctx: CanvasRenderingContext2D, point: Point, color: string) => {
    // Draw control point
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };
  
  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if we're clicking on an existing control point
    const clickedPoint = findControlPoint(x, y);
    if (clickedPoint) {
      // Start dragging this point
      setDraggingPoint(clickedPoint);
      setIsDrawing(false);
      return;
    }
    
    // Check if clicking on a drawing (for selection)
    if (activeTool === 'none') {
      const clickedDrawing = findDrawingAt(x, y);
      if (clickedDrawing) {
        // Select this drawing
        setSelectedDrawing(clickedDrawing);
        setDrawings(drawings.map(d => ({
          ...d,
          selected: d.id === clickedDrawing
        })));
        return;
      } else {
        // Deselect all
        setSelectedDrawing(null);
        setDrawings(drawings.map(d => ({
          ...d,
          selected: false
        })));
      }
      return;
    }
    
    // Start a new drawing
    if (activeTool !== 'none') {
      const newDrawing: DrawingObject = {
        id: getNextId(),
        type: activeTool,
        points: [{ x, y }],
        color: currentColor,
        lineWidth: 2,
        selected: true
      };
      
      setCurrentDrawing(newDrawing);
      setIsDrawing(true);
      
      // Deselect all other drawings
      setSelectedDrawing(newDrawing.id);
      setDrawings(drawings.map(d => ({ ...d, selected: false })));
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // If dragging a control point
    if (draggingPoint) {
      setDrawings(drawings.map(drawing => {
        if (drawing.id === draggingPoint.drawingId) {
          const newPoints = [...drawing.points];
          newPoints[draggingPoint.pointIndex] = { x, y };
          return { ...drawing, points: newPoints };
        }
        return drawing;
      }));
      return;
    }
    
    // If drawing a new object
    if (isDrawing && currentDrawing) {
      const drawingType = currentDrawing.type;
      let updatedDrawing = { ...currentDrawing };
      
      switch (drawingType) {
        case 'trendLine':
        case 'ray':
        case 'extendedLine':
        case 'infoLine':
        case 'trendAngle':
        case 'horizontalRay':
          // These need exactly 2 points
          if (currentDrawing.points.length === 1) {
            updatedDrawing.points = [currentDrawing.points[0], { x, y }];
          } else {
            updatedDrawing.points = [currentDrawing.points[0], { x, y }];
          }
          break;
          
        case 'horizontalLine':
          // Horizontal line just needs Y coordinate
          updatedDrawing.points = [{ x: x, y: y }];
          break;
          
        case 'verticalLine':
          // Vertical line just needs X coordinate
          updatedDrawing.points = [{ x: x, y: y }];
          break;
          
        case 'crossLine':
          // Cross line needs both coordinates
          updatedDrawing.points = [{ x, y }];
          break;
          
        case 'parallelChannel':
        case 'pitchfork':
          // These need 3 points
          if (currentDrawing.points.length === 1) {
            updatedDrawing.points = [currentDrawing.points[0], { x, y }];
          } else if (currentDrawing.points.length === 2) {
            updatedDrawing.points = [currentDrawing.points[0], currentDrawing.points[1], { x, y }];
          } else {
            // Already have 3 points, update the last one
            updatedDrawing.points = [
              currentDrawing.points[0],
              currentDrawing.points[1],
              { x, y }
            ];
          }
          break;
          
        case 'flatChannel':
          // Flat channel needs 2 Y-coordinates
          if (currentDrawing.points.length === 1) {
            updatedDrawing.points = [currentDrawing.points[0], { x, y }];
          } else {
            updatedDrawing.points = [currentDrawing.points[0], { x, y }];
          }
          break;
          
        default:
          // Default behavior: track mouse position
          if (currentDrawing.points.length === 1) {
            updatedDrawing.points = [currentDrawing.points[0], { x, y }];
          } else {
            const lastPoint = currentDrawing.points.length - 1;
            const newPoints = [...currentDrawing.points];
            newPoints[lastPoint] = { x, y };
            updatedDrawing.points = newPoints;
          }
      }
      
      setCurrentDrawing(updatedDrawing);
    }
  };
  
  const handleMouseUp = () => {
    // Finish dragging
    if (draggingPoint) {
      setDraggingPoint(null);
      return;
    }
    
    // Finish drawing
    if (isDrawing && currentDrawing) {
      // Check if drawing has enough points
      let isComplete = false;
      
      switch (currentDrawing.type) {
        case 'trendLine':
        case 'ray':
        case 'extendedLine':
        case 'infoLine':
        case 'trendAngle':
        case 'horizontalRay':
        case 'flatChannel':
          isComplete = currentDrawing.points.length >= 2;
          break;
        
        case 'horizontalLine':
        case 'verticalLine':
        case 'crossLine':
          isComplete = currentDrawing.points.length >= 1;
          break;
          
        case 'parallelChannel':
        case 'pitchfork':
          isComplete = currentDrawing.points.length >= 3;
          break;
          
        default:
          isComplete = currentDrawing.points.length >= 1;
      }
      
      if (isComplete) {
        // Add to drawings
        setDrawings([...drawings, currentDrawing]);
        
        // Notify parent
        if (onDrawingComplete) {
          onDrawingComplete(currentDrawing);
        }
      }
      
      setCurrentDrawing(null);
      setIsDrawing(false);
    }
  };
  
  const handleMouseLeave = () => {
    // Cancel current drawing or dragging when mouse leaves canvas
    if (isDrawing) {
      setIsDrawing(false);
      setCurrentDrawing(null);
    }
    
    if (draggingPoint) {
      setDraggingPoint(null);
    }
  };
  
  // Helper function to find a control point near coordinates
  const findControlPoint = (x: number, y: number) => {
    const tolerance = 10; // Pixels of tolerance for clicking a point
    
    for (let d = 0; d < drawings.length; d++) {
      const drawing = drawings[d];
      for (let p = 0; p < drawing.points.length; p++) {
        const point = drawing.points[p];
        const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
        
        if (distance <= tolerance) {
          return { drawingId: drawing.id, pointIndex: p };
        }
      }
    }
    
    return null;
  };
  
  // Helper function to check if a point is on a line
  const isPointOnLine = (x: number, y: number, start: Point, end: Point) => {
    const tolerance = 5; // Pixels of tolerance
    
    // Calculate distance from point to line
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Avoid division by zero
    if (length === 0) return false;
    
    // Distance formula: |Ax + By + C| / sqrt(A² + B²)
    // Where line equation is Ax + By + C = 0
    // A = y2 - y1, B = x1 - x2, C = x2y1 - x1y2
    const A = dy;
    const B = -dx;
    const C = dx * start.y - dy * start.x;
    
    const distance = Math.abs(A * x + B * y + C) / length;
    
    // Check if point is within the line segment's bounding box
    const minX = Math.min(start.x, end.x) - tolerance;
    const maxX = Math.max(start.x, end.x) + tolerance;
    const minY = Math.min(start.y, end.y) - tolerance;
    const maxY = Math.max(start.y, end.y) + tolerance;
    
    const isInBounds = x >= minX && x <= maxX && y >= minY && y <= maxY;
    
    return distance <= tolerance && isInBounds;
  };
  
  // Find a drawing that contains the given point
  const findDrawingAt = (x: number, y: number) => {
    for (let i = drawings.length - 1; i >= 0; i--) {
      const drawing = drawings[i];
      
      // Check based on drawing type
      switch (drawing.type) {
        case 'trendLine':
        case 'ray':
        case 'extendedLine':
        case 'infoLine':
        case 'trendAngle':
        case 'horizontalRay':
          if (drawing.points.length >= 2 && 
              isPointOnLine(x, y, drawing.points[0], drawing.points[1])) {
            return drawing.id;
          }
          break;
          
        case 'horizontalLine':
          if (drawing.points.length >= 1 && 
              Math.abs(y - drawing.points[0].y) <= 5) {
            return drawing.id;
          }
          break;
          
        case 'verticalLine':
          if (drawing.points.length >= 1 && 
              Math.abs(x - drawing.points[0].x) <= 5) {
            return drawing.id;
          }
          break;
          
        // Add checks for other types
        
        default:
          // Default: check control points
          for (const point of drawing.points) {
            const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
            if (distance <= 10) {
              return drawing.id;
            }
          }
      }
    }
    
    return null;
  };
  
  // Clear all drawings
  const clearAllDrawings = () => {
    setDrawings([]);
    setCurrentDrawing(null);
    setIsDrawing(false);
    setSelectedDrawing(null);
    setDraggingPoint(null);
    
    if (onClearDrawings) {
      onClearDrawings();
    }
  };
  
  // Effects
  
  // Redraw when size changes
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      drawObjects();
    }
  }, [width, height]);
  
  // Redraw when drawings change
  useEffect(() => {
    drawObjects();
  }, [drawings, currentDrawing]);
  
  // Clear drawings when requested
  useEffect(() => {
    if (onClearDrawings === clearAllDrawings) {
      clearAllDrawings();
    }
  }, [onClearDrawings]);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 z-10 cursor-crosshair"
      style={{ pointerEvents: activeTool === 'none' ? 'none' : 'all' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export default DrawingCanvas; 