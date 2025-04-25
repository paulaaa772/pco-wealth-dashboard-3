'use client'

import React, { useState } from 'react';
import { AITradingEngine } from '@/lib/trading-engine/AITradingEngine';

interface ADXIndicatorProps {
  aiEngine: React.RefObject<AITradingEngine>;
  adxValue: number;
  plusDI: number;
  minusDI: number;
}

const ADXIndicator: React.FC<ADXIndicatorProps> = ({ 
  aiEngine, 
  adxValue = 0, 
  plusDI = 0, 
  minusDI = 0 
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [period, setPeriod] = useState(14);
  const [threshold, setThreshold] = useState(25);
  const [filterEnabled, setFilterEnabled] = useState(true);
  const [crossoverEnabled, setCrossoverEnabled] = useState(true);
  
  // Determine ADX trend strength
  let trendStrength = 'Weak';
  let trendColor = 'text-gray-400';
  
  if (adxValue >= 50) {
    trendStrength = 'Very Strong';
    trendColor = 'text-purple-500 font-bold';
  } else if (adxValue >= 40) {
    trendStrength = 'Strong';
    trendColor = 'text-blue-500 font-semibold';
  } else if (adxValue >= 25) {
    trendStrength = 'Moderate';
    trendColor = 'text-green-500';
  } else if (adxValue >= 15) {
    trendStrength = 'Weak';
    trendColor = 'text-yellow-500';
  } else {
    trendStrength = 'Very Weak';
    trendColor = 'text-gray-400';
  }
  
  // Determine trend direction
  const trendDirection = plusDI > minusDI ? 'Bullish' : 'Bearish';
  const directionColor = plusDI > minusDI ? 'text-green-500' : 'text-red-500';

  const handleApplyConfig = () => {
    if (aiEngine.current) {
      aiEngine.current.configureADX(period, threshold, filterEnabled, crossoverEnabled);
      setShowConfig(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3 w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-400">ADX Indicator</h3>
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          {showConfig ? 'Hide Config' : 'Configure'}
        </button>
      </div>
      
      {/* ADX Value Display */}
      <div className="p-2 bg-gray-700 rounded-md text-sm mb-2">
        <div className="flex justify-between">
          <span className="text-gray-400">ADX:</span>
          <span className={trendColor}>{adxValue.toFixed(1)} ({trendStrength})</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Trend:</span>
          <span className={directionColor}>{trendDirection}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">DI+:</span>
          <span className="text-green-400">{plusDI.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">DI-:</span>
          <span className="text-red-400">{minusDI.toFixed(1)}</span>
        </div>
      </div>
      
      {/* Configuration Panel */}
      {showConfig && (
        <div className="mt-3 p-2 bg-gray-700 rounded-md text-sm">
          <div className="mb-2">
            <label className="block text-gray-400 text-xs mb-1">ADX Period</label>
            <input 
              type="range" 
              min="5" 
              max="50" 
              value={period} 
              onChange={(e) => setPeriod(parseInt(e.target.value))} 
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5</span>
              <span>{period}</span>
              <span>50</span>
            </div>
          </div>
          
          <div className="mb-2">
            <label className="block text-gray-400 text-xs mb-1">Trend Threshold</label>
            <input 
              type="range" 
              min="10" 
              max="50" 
              value={threshold} 
              onChange={(e) => setThreshold(parseInt(e.target.value))} 
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>10</span>
              <span>{threshold}</span>
              <span>50</span>
            </div>
          </div>
          
          <div className="flex justify-between mb-2">
            <label className="text-gray-400 text-xs">ADX Trend Filter</label>
            <div className="relative inline-block w-10 align-middle select-none">
              <input 
                type="checkbox" 
                checked={filterEnabled}
                onChange={() => setFilterEnabled(!filterEnabled)}
                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label 
                className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${
                  filterEnabled ? 'bg-green-400' : 'bg-gray-500'
                }`}
              ></label>
            </div>
          </div>
          
          <div className="flex justify-between mb-3">
            <label className="text-gray-400 text-xs">DI+/DI- Crossover Signals</label>
            <div className="relative inline-block w-10 align-middle select-none">
              <input 
                type="checkbox" 
                checked={crossoverEnabled}
                onChange={() => setCrossoverEnabled(!crossoverEnabled)}
                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label 
                className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${
                  crossoverEnabled ? 'bg-green-400' : 'bg-gray-500'
                }`}
              ></label>
            </div>
          </div>
          
          <button 
            onClick={handleApplyConfig}
            className="w-full text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Apply Configuration
          </button>
        </div>
      )}
      
      {/* Add some custom styling for toggle switches */}
      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #68D391;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #68D391;
        }
        .toggle-label {
          transition: background-color 0.2s ease;
        }
        .toggle-checkbox {
          right: 0;
          z-index: 1;
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default ADXIndicator; 