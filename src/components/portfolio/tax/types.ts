export interface TaxRate {
  rate: number;
  minIncome: number;
  maxIncome: number;
}

export interface FilingStatus {
  id: string;
  name: string;
  standardDeduction: number;
  ordinaryRates: TaxRate[];
  longTermRates: TaxRate[];
}

export interface TaxEstimate {
  ordinaryIncomeTax: number;
  shortTermTax: number;
  longTermTax: number;
  niitTax: number;
  totalTax: number;
  effectiveRate: number;
}

// Static 2023 tax data
export const filingStatuses: FilingStatus[] = [
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