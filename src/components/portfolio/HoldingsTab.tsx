'use client'

import React from 'react';
import ResponsiveDataTable from '@/components/dashboard/ResponsiveDataTable';

// Define a type for holdings (assuming it might be needed here, or import if defined globally)
// If Holding type is defined centrally, replace this with an import.
interface Holding {
  name: string;
  symbol: string;
  quantity: number;
  value: number;
  sector?: string;
  accountType?: 'taxable' | 'retirement' | 'crypto' | 'cash';
}

// Define the props for the HoldingsTab component
interface HoldingsTabProps {
  holdingsData: Holding[];
  holdingsFilter: string;
  setHoldingsFilter: (filter: string) => void;
  holdingsSortField: 'name' | 'value';
  setHoldingsSortField: (field: 'name' | 'value') => void;
  holdingsSortDirection: 'asc' | 'desc';
  setHoldingsSortDirection: (direction: 'asc' | 'desc') => void;
}

// Define the HoldingsTabContent component
const HoldingsTab: React.FC<HoldingsTabProps> = ({ 
  holdingsData, 
  holdingsFilter, 
  setHoldingsFilter, 
  holdingsSortField, 
  setHoldingsSortField, 
  holdingsSortDirection, 
  setHoldingsSortDirection 
}) => {
  // Filter the holdings based on search
  const filteredHoldings = holdingsData.filter(holding => 
    holding.name.toLowerCase().includes(holdingsFilter.toLowerCase()) || 
    holding.symbol.toLowerCase().includes(holdingsFilter.toLowerCase())
  );
  
  // Calculate total portfolio value
  const totalValue = holdingsData.reduce((sum, holding) => sum + holding.value, 0);
  
  // Define columns for the ResponsiveDataTable
  const columns = [
    { 
      header: 'Name', 
      accessor: 'name' as keyof Holding,
      isSortable: true,
      isMobileVisible: true,
      className: 'font-medium text-white'
    },
    { 
      header: 'Symbol', 
      accessor: 'symbol' as keyof Holding,
      isSortable: true,
      isMobileVisible: true
    },
    { 
      header: 'Quantity', 
      accessor: 'quantity' as keyof Holding,
      isSortable: true,
      isMobileVisible: false,
      className: 'text-right'
    },
    { 
      header: 'Value', 
      accessor: (holding: Holding) => (
        <span className="font-medium text-white">
          ${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
      isSortable: true,
      isMobileVisible: true,
      className: 'text-right'
    },
    { 
      header: '% of Portfolio', 
      accessor: (holding: Holding) => {
        const percentage = totalValue > 0 ? (holding.value / totalValue) * 100 : 0;
        return (
          <div>
            <div>{percentage.toFixed(2)}%</div>
            <div className="w-full bg-gray-700 h-1 mt-1 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-1 rounded-full" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      },
      isMobileVisible: false,
      className: 'text-right'
    }
  ];

  return (
    <div className="bg-[#172033] text-white p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">Holdings</h2>
        <p className="text-gray-400">Total Portfolio Value: ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
      
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-6 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search holdings..."
            value={holdingsFilter}
            onChange={(e) => setHoldingsFilter(e.target.value)}
            className="bg-[#1D2939] text-white border border-gray-700 rounded-md p-2 pl-8 w-full sm:w-64"
          />
          <svg className="absolute left-2 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <span className="text-gray-400 text-sm">Sort by:</span>
          <button
            onClick={() => {
              const newField = 'name';
              const newDirection = holdingsSortField === newField ? (holdingsSortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
              setHoldingsSortField(newField);
              setHoldingsSortDirection(newDirection);
            }}
            className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
              holdingsSortField === 'name' ? 'bg-blue-600 text-white' : 'bg-[#1D2939] text-gray-300'
            }`}
          >
            Name {holdingsSortField === 'name' && (holdingsSortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => {
              const newField = 'value';
              const newDirection = holdingsSortField === newField ? (holdingsSortDirection === 'asc' ? 'desc' : 'asc') : 'desc';
              setHoldingsSortField(newField);
              setHoldingsSortDirection(newDirection);
            }}
            className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
              holdingsSortField === 'value' ? 'bg-blue-600 text-white' : 'bg-[#1D2939] text-gray-300'
            }`}
          >
            Value {holdingsSortField === 'value' && (holdingsSortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>
      
      {/* Holdings Table using ResponsiveDataTable */}
      <div className="bg-[#1D2939] rounded-lg overflow-hidden p-2 sm:p-4">
        <ResponsiveDataTable 
          data={filteredHoldings}
          columns={columns}
          keyField="symbol"
          darkMode={true}
          defaultSortField={holdingsSortField}
          defaultSortDirection={holdingsSortDirection}
          emptyMessage="No holdings match your search criteria"
        />
      </div>
    </div>
  );
};

export default HoldingsTab; 