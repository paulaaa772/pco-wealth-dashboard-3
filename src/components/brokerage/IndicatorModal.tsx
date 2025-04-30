'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { ActiveIndicator } from '@/app/brokerage/page'; // Import type from page

interface IndicatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIndicators: ActiveIndicator[];
  onChange: (newIndicators: ActiveIndicator[]) => void;
}

// Define IndicatorType including all indicators
type IndicatorType = 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'Stochastic' | 'ATR' | 'ADX' | 'OBV' | 'Parabolic SAR' | 'Pivot Points' | 'Ichimoku Cloud';

interface IndicatorOption {
  type: IndicatorType;
  label: string;
  defaultParams: Omit<ActiveIndicator, 'id' | 'type'>;
}

// Define available indicators
const availableIndicators: IndicatorOption[] = [
  { type: 'SMA', label: 'Simple Moving Average (SMA)', defaultParams: { period: 20 } },
  { type: 'EMA', label: 'Exponential Moving Average (EMA)', defaultParams: { period: 20 } },
  { type: 'RSI', label: 'Relative Strength Index (RSI)', defaultParams: { period: 14 } },
  { 
    type: 'MACD', 
    label: 'Moving Average Conv/Div (MACD)', 
    defaultParams: { 
      fastPeriod: 12, 
      slowPeriod: 26, 
      signalPeriod: 9, 
      showSignal: true, // Default to showing signal
      showHistogram: true // Default to showing histogram
    } 
  },
  {
    type: 'Stochastic',
    label: 'Stochastic Oscillator',
    defaultParams: {
      kPeriod: 14,
      dPeriod: 3,
      showK: true,
      showD: true
    }
  },
  {
    type: 'ATR',
    label: 'Average True Range (ATR)',
    defaultParams: {
      period: 14
    }
  },
  {
    type: 'ADX',
    label: 'Average Directional Index (ADX)',
    defaultParams: {
      period: 14,
      showDI: true
    }
  },
  {
    type: 'OBV',
    label: 'On-Balance Volume (OBV)',
    defaultParams: {} // OBV doesn't require any parameters
  },
  {
    type: 'Parabolic SAR',
    label: 'Parabolic SAR',
    defaultParams: {
      initialAcceleration: 0.02,
      maxAcceleration: 0.2
    }
  },
  {
    type: 'Pivot Points',
    label: 'Pivot Points',
    defaultParams: {
      pivotType: 'daily',
      showR1: true,
      showR2: true,
      showR3: true,
      showS1: true,
      showS2: true,
      showS3: true
    }
  },
  {
    type: 'Ichimoku Cloud',
    label: 'Ichimoku Cloud',
    defaultParams: {
      tenkanPeriod: 9,
      kijunPeriod: 26,
      senkouBPeriod: 52,
      displacement: 26,
      showTenkan: true,
      showKijun: true,
      showCloud: true,
      showChikou: true
    }
  },
];

const IndicatorModal: React.FC<IndicatorModalProps> = ({ 
    isOpen, 
    onClose, 
    currentIndicators, 
    onChange 
}) => {
  const [indicators, setIndicators] = useState<ActiveIndicator[]>(currentIndicators);
  const [selectedIndicatorToAdd, setSelectedIndicatorToAdd] = useState<IndicatorType | '' >('');

  // Update local state if props change from parent
  useEffect(() => {
    setIndicators(currentIndicators);
  }, [currentIndicators]);

  if (!isOpen) return null;

  const handleAddIndicator = () => {
    if (!selectedIndicatorToAdd) return;
    const option = availableIndicators.find(opt => opt.type === selectedIndicatorToAdd);
    if (!option) return;
    
    const newIndicator: ActiveIndicator = {
      id: `${option.type}-${Date.now()}`, // Simple unique ID
      type: option.type,
      ...option.defaultParams // Spread default parameters
    };
    setIndicators([...indicators, newIndicator]);
    setSelectedIndicatorToAdd(''); // Reset dropdown
  };

  const handleRemoveIndicator = (id: string) => {
    setIndicators(indicators.filter(ind => ind.id !== id));
  };

  const handleParamChange = (
      id: string, 
      param: keyof Omit<ActiveIndicator, 'id' | 'type'>, 
      value: string | boolean // Value from input (string or boolean)
    ) => {
    setIndicators(indicators.map(ind => {
      if (ind.id === id) {
        let updatedValue: number | boolean | undefined;

        if (typeof value === 'boolean') {
          // Directly assign if it's a boolean (from checkbox)
          updatedValue = value;
        } else {
          // It's a string from a number input
          if (value.trim() === '') {
            // Allow clearing the input (set param to undefined)
            updatedValue = undefined;
          } else {
            const numValue = parseInt(value, 10);
            // Only assign if it's a valid positive number
            if (!isNaN(numValue) && numValue > 0) {
              updatedValue = numValue;
            } else {
              // If invalid number string, keep the existing value (don't update)
              return ind; 
            }
          }
        }
        // Return the updated indicator object
        return { ...ind, [param]: updatedValue };
      }
      // If ID doesn't match, return the original indicator
      return ind;
    }));
  };

  const handleApplyChanges = () => {
    onChange(indicators); // Pass the updated list to the parent
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 max-w-2xl w-full relative max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-300 dark:border-zinc-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Configure Indicators</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content Area (Scrollable) */}
        <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4">
          {/* Add Indicator Section */}
          <div className="flex items-end gap-2 mb-4 pb-4 border-b border-gray-300 dark:border-zinc-700">
            <div className="flex-grow">
              <label htmlFor="indicatorSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Add Indicator
              </label>
              <select
                id="indicatorSelect"
                value={selectedIndicatorToAdd}
                onChange={(e) => setSelectedIndicatorToAdd(e.target.value as IndicatorType | '')}
                className="w-full border border-gray-300 dark:border-zinc-600 rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-zinc-800"
              >
                <option value="">Select Indicator...</option>
                {availableIndicators.map(opt => (
                   <option key={opt.type} value={opt.type}>{opt.label}</option>
                ))}
              </select>
            </div>
            <button 
                onClick={handleAddIndicator}
                disabled={!selectedIndicatorToAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
             >
               <Plus size={18} className="mr-1" /> Add
            </button>
          </div>

          {/* Active Indicators List */}
          <div className="space-y-3">
            {indicators.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No indicators added yet.</p>
            )}
            {indicators.map(ind => (
              <div key={ind.id} className="p-3 border border-gray-300 dark:border-zinc-700 rounded-md bg-gray-50 dark:bg-zinc-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800 dark:text-white">{ind.type}</span>
                  <button onClick={() => handleRemoveIndicator(ind.id)} className="text-red-500 hover:text-red-700">
                     <Trash2 size={16} />
                  </button>
                </div>
                {/* Parameter Inputs - Updated for indicator specific fields */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mt-2">
                   {/* Period Input (SMA, EMA, RSI) */}
                   {(ind.type === 'SMA' || ind.type === 'EMA' || ind.type === 'RSI') && ind.period !== undefined && (
                      <div className="flex items-center gap-1">
                         <label htmlFor={`${ind.id}-period`} className="text-gray-600 dark:text-gray-400">Period:</label>
                         <input 
                           type="number" id={`${ind.id}-period`} min="1"
                           value={ind.period} 
                           onChange={(e) => handleParamChange(ind.id, 'period', e.target.value)}
                           className="w-16 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-zinc-700"
                         />
                      </div>
                   )}
                   {/* MACD Inputs */}
                   {ind.type === 'MACD' && (
                     <>
                       <div className="flex items-center gap-1">
                          <label htmlFor={`${ind.id}-fast`} className="text-gray-600 dark:text-gray-400">Fast:</label>
                          <input 
                            type="number" id={`${ind.id}-fast`} min="1"
                            value={ind.fastPeriod || ''} 
                            onChange={(e) => handleParamChange(ind.id, 'fastPeriod', e.target.value)}
                            className="w-16 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-zinc-700"
                          />
                       </div>
                        <div className="flex items-center gap-1">
                          <label htmlFor={`${ind.id}-slow`} className="text-gray-600 dark:text-gray-400">Slow:</label>
                          <input 
                            type="number" id={`${ind.id}-slow`} min="1"
                            value={ind.slowPeriod || ''} 
                            onChange={(e) => handleParamChange(ind.id, 'slowPeriod', e.target.value)}
                            className="w-16 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-zinc-700"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <label htmlFor={`${ind.id}-signal`} className="text-gray-600 dark:text-gray-400">Signal:</label>
                          <input 
                            type="number" id={`${ind.id}-signal`} min="1"
                            value={ind.signalPeriod || ''} 
                            onChange={(e) => handleParamChange(ind.id, 'signalPeriod', e.target.value)}
                            className="w-16 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-zinc-700"
                          />
                        </div>
                        {/* Toggle for Signal Line */} 
                        <div className="flex items-center gap-1">
                            <input 
                               type="checkbox" 
                               id={`${ind.id}-showSignal`}
                               checked={!!ind.showSignal} 
                               onChange={(e) => handleParamChange(ind.id, 'showSignal', e.target.checked)}
                               className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 dark:checked:bg-indigo-500"
                              />
                             <label htmlFor={`${ind.id}-showSignal`} className="text-gray-600 dark:text-gray-400">Show Signal Line</label>
                        </div>
                        {/* Toggle for Histogram */} 
                        <div className="flex items-center gap-1">
                           <input 
                              type="checkbox" 
                              id={`${ind.id}-showHisto`}
                              checked={!!ind.showHistogram} 
                              onChange={(e) => handleParamChange(ind.id, 'showHistogram', e.target.checked)}
                              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 dark:checked:bg-indigo-500"
                            />
                           <label htmlFor={`${ind.id}-showHisto`} className="text-gray-600 dark:text-gray-400">Show Histogram</label>
                        </div>
                     </>
                   )}
                   {/* Stochastic Inputs */}
                   {ind.type === 'Stochastic' && (
                     <>
                       <div className="flex items-center gap-1">
                          <label htmlFor={`${ind.id}-kperiod`} className="text-gray-600 dark:text-gray-400">K Period:</label>
                          <input 
                            type="number" id={`${ind.id}-kperiod`} min="1"
                            value={ind.kPeriod || ''} 
                            onChange={(e) => handleParamChange(ind.id, 'kPeriod', e.target.value)}
                            className="w-16 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-zinc-700"
                          />
                       </div>
                       <div className="flex items-center gap-1">
                          <label htmlFor={`${ind.id}-dperiod`} className="text-gray-600 dark:text-gray-400">D Period:</label>
                          <input 
                            type="number" id={`${ind.id}-dperiod`} min="1"
                            value={ind.dPeriod || ''} 
                            onChange={(e) => handleParamChange(ind.id, 'dPeriod', e.target.value)}
                            className="w-16 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-zinc-700"
                          />
                       </div>
                       {/* Toggle for K Line */} 
                       <div className="flex items-center gap-1">
                          <input 
                             type="checkbox" 
                             id={`${ind.id}-showK`}
                             checked={!!ind.showK} 
                             onChange={(e) => handleParamChange(ind.id, 'showK', e.target.checked)}
                             className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 dark:checked:bg-indigo-500"
                            />
                           <label htmlFor={`${ind.id}-showK`} className="text-gray-600 dark:text-gray-400">Show %K Line</label>
                       </div>
                       {/* Toggle for D Line */} 
                       <div className="flex items-center gap-1">
                          <input 
                             type="checkbox" 
                             id={`${ind.id}-showD`}
                             checked={!!ind.showD} 
                             onChange={(e) => handleParamChange(ind.id, 'showD', e.target.checked)}
                             className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 dark:checked:bg-indigo-500"
                           />
                           <label htmlFor={`${ind.id}-showD`} className="text-gray-600 dark:text-gray-400">Show %D Line</label>
                       </div>
                     </>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4 border-t border-gray-300 dark:border-zinc-700">
          <button 
             onClick={handleApplyChanges}
             className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndicatorModal; 