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

type IndicatorType = 'SMA' | 'EMA' | 'RSI' | 'MACD'; // Expand as needed

interface IndicatorOption {
  type: IndicatorType;
  label: string;
  defaultParams: Omit<ActiveIndicator, 'id' | 'type'>;
}

// Define available indicators and their default parameters
const availableIndicators: IndicatorOption[] = [
  { type: 'SMA', label: 'Simple Moving Average (SMA)', defaultParams: { period: 20 } },
  { type: 'EMA', label: 'Exponential Moving Average (EMA)', defaultParams: { period: 20 } },
  // Add RSI, MACD, BBands etc. here later
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

  const handleParamChange = (id: string, param: keyof Omit<ActiveIndicator, 'id' | 'type'>, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue <= 0) return; // Basic validation

    setIndicators(indicators.map(ind => 
      ind.id === id ? { ...ind, [param]: numValue } : ind
    ));
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
                {/* Parameter Inputs - Customize based on indicator type */}
                <div className="flex items-center gap-4 text-sm">
                   {ind.type === 'SMA' || ind.type === 'EMA' || ind.type === 'RSI' ? (
                      <div className="flex items-center gap-2">
                         <label htmlFor={`${ind.id}-period`} className="text-gray-600 dark:text-gray-400">Period:</label>
                         <input 
                           type="number"
                           id={`${ind.id}-period`}
                           min="1"
                           value={ind.period || ''}
                           onChange={(e) => handleParamChange(ind.id, 'period', e.target.value)}
                           className="w-16 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-zinc-700"
                         />
                      </div>
                   ) : null}
                   {/* Add inputs for MACD params, BBands params etc. here */}
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