'use client';

import React from 'react';
import { FilingStatus } from './types';

interface FilingInfoFormProps {
  selectedFilingStatus: string;
  setSelectedFilingStatus: (status: string) => void;
  ordinaryIncome: number;
  setOrdinaryIncome: (income: number) => void;
  itemizedDeductions: number;
  setItemizedDeductions: (deductions: number) => void;
  filingStatuses: FilingStatus[];
}

const FilingInfoForm: React.FC<FilingInfoFormProps> = ({
  selectedFilingStatus,
  setSelectedFilingStatus,
  ordinaryIncome,
  setOrdinaryIncome,
  itemizedDeductions,
  setItemizedDeductions,
  filingStatuses
}) => {
  return (
    <div className="bg-[#2A3C61] rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Filing Information</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Filing Status
          </label>
          <select
            value={selectedFilingStatus}
            onChange={(e) => setSelectedFilingStatus(e.target.value)}
            className="w-full bg-[#1B2B4B] border border-gray-700 rounded-md py-2 px-3 text-sm"
          >
            {filingStatuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Ordinary Income
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              $
            </span>
            <input
              type="number"
              value={ordinaryIncome}
              onChange={(e) => setOrdinaryIncome(Number(e.target.value))}
              className="w-full bg-[#1B2B4B] border border-gray-700 rounded-md py-2 pl-8 pr-3 text-sm"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Itemized Deductions (if greater than standard)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              $
            </span>
            <input
              type="number"
              value={itemizedDeductions}
              onChange={(e) => setItemizedDeductions(Number(e.target.value))}
              className="w-full bg-[#1B2B4B] border border-gray-700 rounded-md py-2 pl-8 pr-3 text-sm"
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Standard deduction for {filingStatuses.find(status => status.id === selectedFilingStatus)?.name}: ${filingStatuses.find(status => status.id === selectedFilingStatus)?.standardDeduction.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilingInfoForm; 