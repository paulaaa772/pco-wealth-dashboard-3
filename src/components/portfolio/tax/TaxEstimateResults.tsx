'use client';

import React from 'react';
import { TaxEstimate } from './types';

interface TaxEstimateResultsProps {
  taxEstimate: TaxEstimate | null;
}

const TaxEstimateResults: React.FC<TaxEstimateResultsProps> = ({ taxEstimate }) => {
  if (!taxEstimate) {
    return (
      <div className="bg-[#2A3C61] rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Tax Estimate</h3>
        <div className="text-center text-gray-400 py-4">
          Enter your information to calculate tax estimates.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2A3C61] rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Tax Estimate</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#1B2B4B] p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-400">Ordinary Income Tax</h4>
            <p className="text-xl font-semibold">
              ${taxEstimate.ordinaryIncomeTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          
          <div className="bg-[#1B2B4B] p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-400">Long-Term Capital Gains Tax</h4>
            <p className="text-xl font-semibold">
              ${taxEstimate.longTermTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#1B2B4B] p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-400">Net Investment Income Tax</h4>
            <p className="text-xl font-semibold">
              ${taxEstimate.niitTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          
          <div className="bg-[#1B2B4B] p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-400">Effective Tax Rate</h4>
            <p className="text-xl font-semibold">
              {taxEstimate.effectiveRate.toFixed(1)}%
            </p>
          </div>
        </div>
        
        <div className="bg-[#1B2B4B] p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-400">Total Estimated Tax</h4>
          <p className="text-2xl font-semibold text-white">
            ${taxEstimate.totalTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaxEstimateResults; 