'use client';

import React, { useMemo } from 'react';
import { FilingStatus } from './types';

interface TaxOptimizationTipsProps {
  ordinaryIncome: number;
  shortTermGains: number;
  longTermGains: number;
  itemizedDeductions: number;
  selectedFilingStatus: string;
  filingStatuses: FilingStatus[];
}

const TaxOptimizationTips: React.FC<TaxOptimizationTipsProps> = ({
  ordinaryIncome,
  shortTermGains,
  longTermGains,
  itemizedDeductions,
  selectedFilingStatus,
  filingStatuses
}) => {
  // Determine which tips to show based on the user's financial situation
  const selectedStatus = useMemo(() => {
    return filingStatuses.find(status => status.id === selectedFilingStatus);
  }, [selectedFilingStatus, filingStatuses]);

  const standardDeduction = selectedStatus?.standardDeduction || 0;
  const shouldShowDeductionTip = itemizedDeductions > 0 && itemizedDeductions < standardDeduction;
  const shouldShowShortTermTip = shortTermGains > 5000;
  const shouldShow401kTip = ordinaryIncome > 100000;
  const shouldShowHarvestingTip = shortTermGains > 0 || longTermGains > 0;
  const shouldShowNiitTip = ordinaryIncome > 200000;

  return (
    <div className="bg-[#2A3C61] rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Tax Optimization Tips</h3>
      
      <div className="space-y-3">
        {shouldShow401kTip && (
          <div className="p-3 bg-[#1B2B4B] rounded-lg">
            <p className="text-sm">
              <span className="text-blue-400 font-medium">401(k) Contributions: </span>
              Maximize your 401(k) contributions to reduce your taxable income.
            </p>
          </div>
        )}
        
        {shouldShowShortTermTip && (
          <div className="p-3 bg-[#1B2B4B] rounded-lg">
            <p className="text-sm">
              <span className="text-blue-400 font-medium">Defer Short-Term Gains: </span>
              Consider holding investments for at least one year to qualify for lower long-term capital gains rates.
            </p>
          </div>
        )}
        
        {shouldShowHarvestingTip && (
          <div className="p-3 bg-[#1B2B4B] rounded-lg">
            <p className="text-sm">
              <span className="text-blue-400 font-medium">Tax-Loss Harvesting: </span>
              Offset capital gains by selling investments with losses.
            </p>
          </div>
        )}
        
        {shouldShowDeductionTip && (
          <div className="p-3 bg-[#1B2B4B] rounded-lg">
            <p className="text-sm">
              <span className="text-blue-400 font-medium">Deduction Bunching: </span>
              Consider bunching itemized deductions into a single tax year to exceed the standard deduction.
            </p>
          </div>
        )}
        
        {shouldShowNiitTip && (
          <div className="p-3 bg-[#1B2B4B] rounded-lg">
            <p className="text-sm">
              <span className="text-blue-400 font-medium">NIIT Planning: </span>
              You may be subject to the 3.8% Net Investment Income Tax. Consider tax-efficient investments in retirement accounts.
            </p>
          </div>
        )}
        
        {/* Always show this tip */}
        <div className="p-3 bg-[#1B2B4B] rounded-lg">
          <p className="text-sm">
            <span className="text-blue-400 font-medium">Consult a Professional: </span>
            For personalized tax advice, consult with a qualified tax professional.
          </p>
        </div>
        
        {/* Show this tip if no other specific tips are shown */}
        {!shouldShow401kTip && !shouldShowShortTermTip && !shouldShowHarvestingTip && 
         !shouldShowDeductionTip && !shouldShowNiitTip && (
          <div className="p-3 bg-[#1B2B4B] rounded-lg">
            <p className="text-sm">
              <span className="text-blue-400 font-medium">Tax-Advantaged Accounts: </span>
              Consider using tax-advantaged accounts like IRAs, HSAs, and 529 plans to reduce your tax liability.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxOptimizationTips; 