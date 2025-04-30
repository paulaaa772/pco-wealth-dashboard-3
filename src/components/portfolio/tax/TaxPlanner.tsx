'use client';

import React, { useState, useEffect } from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext';
import { filingStatuses, TaxEstimate } from './types';
import { calculateTaxEstimate, calculatePortfolioGains } from './taxCalculations';
import FilingInfoForm from './FilingInfoForm';
import CapitalGainsForm from './CapitalGainsForm';
import TaxEstimateResults from './TaxEstimateResults';
import TaxOptimizationTips from './TaxOptimizationTips';

const TaxPlanner: React.FC = () => {
  const { manualAccounts } = useManualAccounts();
  
  // Form state
  const [selectedFilingStatus, setSelectedFilingStatus] = useState<string>('single');
  const [ordinaryIncome, setOrdinaryIncome] = useState<number>(80000);
  const [shortTermGains, setShortTermGains] = useState<number>(0);
  const [longTermGains, setLongTermGains] = useState<number>(0);
  const [itemizedDeductions, setItemizedDeductions] = useState<number>(0);
  const [usePortfolioGains, setUsePortfolioGains] = useState<boolean>(false);
  
  // Results state
  const [taxEstimate, setTaxEstimate] = useState<TaxEstimate | null>(null);

  // Calculate portfolio gains when checkbox is toggled
  useEffect(() => {
    if (usePortfolioGains && manualAccounts.length > 0) {
      const { shortTermGains: stg, longTermGains: ltg } = calculatePortfolioGains(manualAccounts);
      setShortTermGains(stg);
      setLongTermGains(ltg);
    }
  }, [usePortfolioGains, manualAccounts]);

  // Calculate tax estimate when form values change
  useEffect(() => {
    const estimate = calculateTaxEstimate(
      selectedFilingStatus,
      ordinaryIncome,
      shortTermGains,
      longTermGains,
      itemizedDeductions,
      filingStatuses
    );
    
    setTaxEstimate(estimate);
  }, [
    selectedFilingStatus,
    ordinaryIncome,
    shortTermGains,
    longTermGains,
    itemizedDeductions
  ]);

  return (
    <div className="bg-[#1E2D4E] rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Tax Planner</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Forms Section */}
        <div className="space-y-6">
          <FilingInfoForm
            selectedFilingStatus={selectedFilingStatus}
            setSelectedFilingStatus={setSelectedFilingStatus}
            ordinaryIncome={ordinaryIncome}
            setOrdinaryIncome={setOrdinaryIncome}
            itemizedDeductions={itemizedDeductions}
            setItemizedDeductions={setItemizedDeductions}
            filingStatuses={filingStatuses}
          />
          
          <CapitalGainsForm
            shortTermGains={shortTermGains}
            setShortTermGains={setShortTermGains}
            longTermGains={longTermGains}
            setLongTermGains={setLongTermGains}
            usePortfolioGains={usePortfolioGains}
            setUsePortfolioGains={setUsePortfolioGains}
          />
        </div>
        
        {/* Results Section */}
        <div className="space-y-6">
          <TaxEstimateResults
            taxEstimate={taxEstimate}
          />
          
          <TaxOptimizationTips
            ordinaryIncome={ordinaryIncome}
            shortTermGains={shortTermGains}
            longTermGains={longTermGains}
            itemizedDeductions={itemizedDeductions}
            selectedFilingStatus={selectedFilingStatus}
            filingStatuses={filingStatuses}
          />
        </div>
      </div>
      
      <div className="mt-6 text-xs text-gray-500">
        <p>This calculator provides estimates only and should not be considered tax advice. Tax rates based on 2023 IRS guidelines.</p>
      </div>
    </div>
  );
};

export default TaxPlanner; 