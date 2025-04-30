import { FilingStatus, TaxEstimate } from './types';

/**
 * Calculate tax estimate based on financial inputs
 */
export function calculateTaxEstimate(
  selectedFilingStatus: string,
  ordinaryIncome: number,
  shortTermGains: number,
  longTermGains: number,
  itemizedDeductions: number,
  filingStatuses: FilingStatus[]
): TaxEstimate | null {
  const filingStatus = filingStatuses.find(status => status.id === selectedFilingStatus);
  if (!filingStatus) return null;

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
  
  return {
    ordinaryIncomeTax,
    shortTermTax: 0, // Already included in ordinary income tax
    longTermTax,
    niitTax,
    totalTax,
    effectiveRate
  };
}

/**
 * Calculate portfolio gains from manual accounts
 */
export function calculatePortfolioGains(manualAccounts: any[]) {
  let shortTermTotal = 0;
  let longTermTotal = 0;

  manualAccounts.forEach(account => {
    account.assets.forEach((asset: any) => {
      // Calculate unrealized gain/loss
      const costBasis = asset.costBasis || asset.value * 0.9;
      const unrealizedGain = asset.value - costBasis;

      // Assign to short or long term
      // In a real app, this would be based on acquisition date
      const isShortTerm = Math.random() > 0.5;
      
      if (isShortTerm) {
        shortTermTotal += unrealizedGain;
      } else {
        longTermTotal += unrealizedGain;
      }
    });
  });

  return { shortTermGains: shortTermTotal, longTermGains: longTermTotal };
} 