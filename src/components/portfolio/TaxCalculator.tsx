'use client';

import React, { useState, useEffect } from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext';

interface TaxRate {
  rate: number;
  minIncome: number;
  maxIncome: number;
}

interface FilingStatus {
  id: string;
  name: string;
  standardDeduction: number;
  ordinaryRates: TaxRate[];
  longTermRates: TaxRate[];
}

interface TaxEstimate {
  ordinaryIncomeTax: number;
  shortTermTax: number;
  longTermTax: number;
  niitTax: number;
  totalTax: number;
  effectiveRate: number;
}

// 2023 Tax Rates
const filingStatuses: FilingStatus[] = [
  {
    id: 'single',
    name: 'Single',
    standardDeduction: 13850,
    ordinaryRates: [
      { rate: 0.10, minIncome: 0, maxIncome: 11000 },
      { rate: 0.12, minIncome: 11001, maxIncome: 44725 },
      { rate: 0.22, minIncome: 44726, maxIncome: 95375 },
      { rate: 0.24, minIncome: 95376, maxIncome: 182100 },
      { rate: 0.32, minIncome: 182101, maxIncome: 231250 },
      { rate: 0.35, minIncome: 231251, maxIncome: 578125 },
      { rate: 0.37, minIncome: 578126, maxIncome: Infinity }
    ],
    longTermRates: [
      { rate: 0.00, minIncome: 0, maxIncome: 44625 },
      { rate: 0.15, minIncome: 44626, maxIncome: 492300 },
      { rate: 0.20, minIncome: 492301, maxIncome: Infinity }
    ]
  },
  {
    id: 'mfj',
    name: 'Married Filing Jointly',
    standardDeduction: 27700,
    ordinaryRates: [
      { rate: 0.10, minIncome: 0, maxIncome: 22000 },
      { rate: 0.12, minIncome: 22001, maxIncome: 89450 },
      { rate: 0.22, minIncome: 89451, maxIncome: 190750 },
      { rate: 0.24, minIncome: 190751, maxIncome: 364200 },
      { rate: 0.32, minIncome: 364201, maxIncome: 462500 },
      { rate: 0.35, minIncome: 462501, maxIncome: 693750 },
      { rate: 0.37, minIncome: 693751, maxIncome: Infinity }
    ],
    longTermRates: [
      { rate: 0.00, minIncome: 0, maxIncome: 89250 },
      { rate: 0.15, minIncome: 89251, maxIncome: 553850 },
      { rate: 0.20, minIncome: 553851, maxIncome: Infinity }
    ]
  },
  {
    id: 'hoh',
    name: 'Head of Household',
    standardDeduction: 20800,
    ordinaryRates: [
      { rate: 0.10, minIncome: 0, maxIncome: 15700 },
      { rate: 0.12, minIncome: 15701, maxIncome: 59850 },
      { rate: 0.22, minIncome: 59851, maxIncome: 95350 },
      { rate: 0.24, minIncome: 95351, maxIncome: 182100 },
      { rate: 0.32, minIncome: 182101, maxIncome: 231250 },
      { rate: 0.35, minIncome: 231251, maxIncome: 578100 },
      { rate: 0.37, minIncome: 578101, maxIncome: Infinity }
    ],
    longTermRates: [
      { rate: 0.00, minIncome: 0, maxIncome: 59750 },
      { rate: 0.15, minIncome: 59751, maxIncome: 523050 },
      { rate: 0.20, minIncome: 523051, maxIncome: Infinity }
    ]
  }
];

const TaxCalculator: React.FC = () => {
  const { manualAccounts } = useManualAccounts();
  const [selectedFilingStatus, setSelectedFilingStatus] = useState<string>('single');
  const [ordinaryIncome, setOrdinaryIncome] = useState<number>(80000);
  const [shortTermGains, setShortTermGains] = useState<number>(0);
  const [longTermGains, setLongTermGains] = useState<number>(0);
  const [itemizedDeductions, setItemizedDeductions] = useState<number>(0);
  const [taxEstimate, setTaxEstimate] = useState<TaxEstimate | null>(null);
  const [usePortfolioGains, setUsePortfolioGains] = useState<boolean>(false);

  // Calculate portfolio gains from manual accounts
  useEffect(() => {
    if (usePortfolioGains && manualAccounts.length > 0) {
      let shortTermTotal = 0;
      let longTermTotal = 0;

      manualAccounts.forEach(account => {
        account.assets.forEach(asset => {
          // For demonstration purposes, we'll assume assets held for less than a year
          // are short-term and those over a year are long-term
          // In a real application, you would check the acquisition date

          // Calculate unrealized gain/loss
          const costBasis = asset.costBasis || asset.value * 0.9;
          const unrealizedGain = asset.value - costBasis;

          // Assign to short or long term (simplistically based on symbol for demo)
          // In a real app, this would be based on acquisition date
          const isShortTerm = Math.random() > 0.5;
          
          if (isShortTerm) {
            shortTermTotal += unrealizedGain;
          } else {
            longTermTotal += unrealizedGain;
          }
        });
      });

      setShortTermGains(shortTermTotal);
      setLongTermGains(longTermTotal);
    }
  }, [usePortfolioGains, manualAccounts]);

  // Calculate tax estimate
  useEffect(() => {
    const filingStatus = filingStatuses.find(status => status.id === selectedFilingStatus);
    if (!filingStatus) return;

    // Determine whether to use standard or itemized deductions
    const deduction = Math.max(filingStatus.standardDeduction, itemizedDeductions);
    
    // Calculate taxable ordinary income
    const taxableOrdinaryIncome = Math.max(0, ordinaryIncome - deduction);
    
    // Short-term gains are taxed as ordinary income
    const totalOrdinaryIncome = taxableOrdinaryIncome + shortTermGains;
    
    // Calculate ordinary income tax
    let ordinaryIncomeTax = 0;
    let remainingIncome = totalOrdinaryIncome;
    
    for (const bracket of filingStatus.ordinaryRates) {
      const taxableAmountInBracket = Math.min(
        remainingIncome,
        bracket.maxIncome - bracket.minIncome + 1
      );
      
      if (taxableAmountInBracket > 0) {
        ordinaryIncomeTax += taxableAmountInBracket * bracket.rate;
        remainingIncome -= taxableAmountInBracket;
      }
      
      if (remainingIncome <= 0) break;
    }
    
    // Calculate long-term capital gains tax
    // Long-term capital gains tax brackets are based on total income
    const totalIncome = ordinaryIncome + longTermGains + shortTermGains;
    const taxableIncomeForLTCG = Math.max(0, totalIncome - deduction);
    
    let longTermTax = 0;
    let remainingLTCG = longTermGains;
    
    // Find the LTCG tax bracket based on taxable income
    let ltcgBracket = 0;
    for (let i = 0; i < filingStatus.longTermRates.length; i++) {
      if (taxableIncomeForLTCG > filingStatus.longTermRates[i].minIncome) {
        ltcgBracket = i;
      }
    }
    
    // Apply the LTCG tax rate
    longTermTax = remainingLTCG * filingStatus.longTermRates[ltcgBracket].rate;
    
    // Calculate Net Investment Income Tax (NIIT) - 3.8% on investment income for high earners
    const niitThreshold = selectedFilingStatus === 'mfj' ? 250000 : 200000;
    const niitTaxableAmount = Math.max(0, totalIncome - niitThreshold);
    const niitTax = niitTaxableAmount > 0 ? (shortTermGains + longTermGains) * 0.038 : 0;
    
    // Calculate total tax and effective rate
    const totalTax = ordinaryIncomeTax + longTermTax + niitTax;
    const effectiveRate = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;
    
    setTaxEstimate({
      ordinaryIncomeTax,
      shortTermTax: 0, // Already included in ordinary income tax
      longTermTax,
      niitTax,
      totalTax,
      effectiveRate
    });
    
  }, [
    selectedFilingStatus,
    ordinaryIncome,
    shortTermGains,
    longTermGains,
    itemizedDeductions
  ]);

  return (
    <div className="bg-[#1E2D4E] rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Tax Calculator</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
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
        </div>
        
        {/* Results Section */}
        <div className="space-y-6">
          <div className="bg-[#2A3C61] rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Tax Estimate</h3>
            
            {taxEstimate && (
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
            )}
          </div>
          
          <div className="bg-[#2A3C61] rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Tax Optimization Tips</h3>
            
            <div className="space-y-3">
              {ordinaryIncome > 100000 && (
                <div className="p-3 bg-[#1B2B4B] rounded-lg">
                  <p className="text-sm">
                    <span className="text-blue-400 font-medium">401(k) Contributions: </span>
                    Maximize your 401(k) contributions to reduce your taxable income.
                  </p>
                </div>
              )}
              
              {shortTermGains > 5000 && (
                <div className="p-3 bg-[#1B2B4B] rounded-lg">
                  <p className="text-sm">
                    <span className="text-blue-400 font-medium">Defer Short-Term Gains: </span>
                    Consider holding investments for at least one year to qualify for lower long-term capital gains rates.
                  </p>
                </div>
              )}
              
              {(shortTermGains > 0 || longTermGains > 0) && (
                <div className="p-3 bg-[#1B2B4B] rounded-lg">
                  <p className="text-sm">
                    <span className="text-blue-400 font-medium">Tax-Loss Harvesting: </span>
                    Offset capital gains by selling investments with losses.
                  </p>
                </div>
              )}
              
              {itemizedDeductions > 0 && itemizedDeductions < filingStatuses.find(status => status.id === selectedFilingStatus)!.standardDeduction && (
                <div className="p-3 bg-[#1B2B4B] rounded-lg">
                  <p className="text-sm">
                    <span className="text-blue-400 font-medium">Deduction Bunching: </span>
                    Consider bunching itemized deductions into a single tax year to exceed the standard deduction.
                  </p>
                </div>
              )}
              
              {ordinaryIncome > 200000 && (
                <div className="p-3 bg-[#1B2B4B] rounded-lg">
                  <p className="text-sm">
                    <span className="text-blue-400 font-medium">NIIT Planning: </span>
                    You may be subject to the 3.8% Net Investment Income Tax. Consider tax-efficient investments in retirement accounts.
                  </p>
                </div>
              )}
              
              <div className="p-3 bg-[#1B2B4B] rounded-lg">
                <p className="text-sm">
                  <span className="text-blue-400 font-medium">Consult a Professional: </span>
                  For personalized tax advice, consult with a qualified tax professional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-xs text-gray-500">
        <p>This calculator provides estimates only and should not be considered tax advice. Tax rates based on 2023 IRS guidelines.</p>
      </div>
    </div>
  );
};

export default TaxCalculator; 