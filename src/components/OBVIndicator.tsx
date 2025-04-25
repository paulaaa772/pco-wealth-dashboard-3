'use client'

import React, { useState } from 'react';

interface OBVIndicatorProps {
  obvValue: number;
  obvSMA: number;
  period?: number;
  onPeriodChange?: (period: number) => void;
  obvEnabled?: boolean;
  onToggleOBV?: (enabled: boolean) => void;
}

const OBVIndicator: React.FC<OBVIndicatorProps> = ({
  obvValue = 0,
  obvSMA = 0,
  period = 20,
  onPeriodChange,
  obvEnabled = true,
  onToggleOBV
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [localPeriod, setLocalPeriod] = useState(period);
  
  // Determine trend direction based on OBV vs OBV SMA
  const isBullish = obvValue > obvSMA;
  
  // Calculate the strength of the signal (distance from OBV to SMA)
  const strength = Math.abs(obvValue - obvSMA);
  const normalizedStrength = Math.min(100, Math.max(0, strength / (Math.abs(obvSMA) * 0.1) * 100));
  
  const strengthText = 
    normalizedStrength > 80 ? 'Very Strong' :
    normalizedStrength > 60 ? 'Strong' :
    normalizedStrength > 40 ? 'Moderate' :
    normalizedStrength > 20 ? 'Weak' :
    'Very Weak';
  
  const handleApplySettings = () => {
    if (onPeriodChange) {
      onPeriodChange(localPeriod);
    }
    setShowSettings(false);
  };
  
  const handleToggleOBV = () => {
    if (onToggleOBV) {
      onToggleOBV(!obvEnabled);
    }
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-3 w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-gray-400">OBV Filter</h3>
          
          {/* Toggle switch */}
          <div className="ml-4 relative inline-block w-10 align-middle select-none">
            <input 
              type="checkbox" 
              checked={obvEnabled}
              onChange={handleToggleOBV}
              className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label 
              className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${
                obvEnabled ? 'bg-green-400' : 'bg-gray-500'
              }`}
            ></label>
          </div>
        </div>
        
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          {showSettings ? 'Hide Settings' : 'Settings'}
        </button>
      </div>
      
      {/* OBV Values Display */}
      <div className="p-2 bg-gray-700 rounded-md text-sm mb-2">
        <div className="flex justify-between">
          <span className="text-gray-400">OBV:</span>
          <span className={`font-semibold ${isBullish ? 'text-green-400' : 'text-red-400'}`}>
            {Math.round(obvValue).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">OBV SMA({period}):</span>
          <span className="font-semibold text-white">{Math.round(obvSMA).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Signal:</span>
          <span className={`font-semibold ${isBullish ? 'text-green-400' : 'text-red-400'}`}>
            {isBullish ? 'BULLISH' : 'BEARISH'} ({strengthText})
          </span>
        </div>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-3 p-2 bg-gray-700 rounded-md text-sm">
          <div className="mb-2">
            <label className="block text-gray-400 text-xs mb-1">SMA Period</label>
            <div className="flex items-center">
              <input 
                type="range" 
                min="5" 
                max="50" 
                value={localPeriod} 
                onChange={(e) => setLocalPeriod(parseInt(e.target.value))} 
                className="flex-grow"
              />
              <input
                type="number"
                min="5"
                max="50"
                value={localPeriod}
                onChange={(e) => setLocalPeriod(parseInt(e.target.value) || 20)}
                className="ml-2 w-12 bg-gray-600 text-white text-center p-1 rounded"
              />
            </div>
          </div>
          
          <button 
            onClick={handleApplySettings}
            className="w-full text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Apply Settings
          </button>
        </div>
      )}
      
      {/* Styling for toggle switch */}
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

export default OBVIndicator; 