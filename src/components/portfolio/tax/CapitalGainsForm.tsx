'use client';

import React from 'react';

interface CapitalGainsFormProps {
  shortTermGains: number;
  setShortTermGains: (gains: number) => void;
  longTermGains: number;
  setLongTermGains: (gains: number) => void;
  usePortfolioGains: boolean;
  setUsePortfolioGains: (use: boolean) => void;
}

const CapitalGainsForm: React.FC<CapitalGainsFormProps> = ({
  shortTermGains,
  setShortTermGains,
  longTermGains,
  setLongTermGains,
  usePortfolioGains,
  setUsePortfolioGains
}) => {
  return (
    <div className="bg-[#2A3C61] rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Capital Gains</h3>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="usePortfolioGains"
            checked={usePortfolioGains}
            onChange={(e) => setUsePortfolioGains(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded"
          />
          <label htmlFor="usePortfolioGains" className="ml-2 block text-sm">
            Use portfolio unrealized gains
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Short-Term Capital Gains
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              $
            </span>
            <input
              type="number"
              value={shortTermGains}
              onChange={(e) => setShortTermGains(Number(e.target.value))}
              disabled={usePortfolioGains}
              className={`w-full bg-[#1B2B4B] border border-gray-700 rounded-md py-2 pl-8 pr-3 text-sm ${usePortfolioGains ? 'opacity-50' : ''}`}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Long-Term Capital Gains
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              $
            </span>
            <input
              type="number"
              value={longTermGains}
              onChange={(e) => setLongTermGains(Number(e.target.value))}
              disabled={usePortfolioGains}
              className={`w-full bg-[#1B2B4B] border border-gray-700 rounded-md py-2 pl-8 pr-3 text-sm ${usePortfolioGains ? 'opacity-50' : ''}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapitalGainsForm; 