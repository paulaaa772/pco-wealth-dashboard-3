'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useManualAccounts, ManualAccount, ManualAsset } from '@/context/ManualAccountsContext'; // Import context hook and types
import { Edit, Trash2 } from 'lucide-react';

// Define the structure for a displayable row in the holdings table
interface HoldingRow extends ManualAsset { 
  // Inherits id, symbol, quantity, value, costBasis from ManualAsset
  accountName: string;
  accountType: string;
  accountColor?: string; // For visual grouping (optional)
  allocation: number;
  gain: number;
  gainPercent: number;
}

// Function to assign colors for grouping accounts visually
const accountColors = ['#4A90E2', '#50E3C2', '#B8E986', '#F8E71C', '#F5A623', '#BD10E0', '#9013FE', '#4A4A4A'];
let colorIndex = 0;
const accountColorMap = new Map<string, string>();

// Force rebuild comment
const getAccountColor = (accountId: string): string => {
  if (!accountColorMap.has(accountId)) {
    accountColorMap.set(accountId, accountColors[colorIndex % accountColors.length]);
    colorIndex++;
  }
  return accountColorMap.get(accountId)!;
};

export function PortfolioHoldings() {
  // Use context hook to get accounts AND modal controls AND delete function
  const { manualAccounts, isLoading, error: contextError, openModal, deleteManualAccount } = useManualAccounts(); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof HoldingRow;
    direction: 'ascending' | 'descending';
  }>({ key: 'value', direction: 'descending' });

  // Handle sorting
  const requestSort = (key: keyof HoldingRow) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // --- Process accounts into rows AND Define groupedRows here --- 
  const { groups: groupedRowsGroups, accountDetails: groupedAccountDetails } = useMemo(() => {
      const groups: { [accountId: string]: HoldingRow[] } = {};
      const accountDetails: { [accountId: string]: { name: string; type: string; color: string } } = {};
      let grandTotalValue = manualAccounts.reduce((sum, acc) => sum + acc.totalValue, 0) || 1;

      manualAccounts.forEach(account => {
        const color = getAccountColor(account.id);
        accountDetails[account.id] = { name: account.accountName, type: account.accountType, color };
        groups[account.id] = [];
        account.assets.forEach(asset => {
          const costBasis = asset.costBasis ?? asset.value; 
          const gain = asset.value - costBasis;
          const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0;
          groups[account.id].push({
            ...asset,
            accountName: account.accountName,
            accountType: account.accountType,
            accountColor: color,
            allocation: (asset.value / grandTotalValue) * 100,
            gain,
            gainPercent
          });
        });
      });
      return { groups, accountDetails }; // Return both pieces
  }, [manualAccounts]);

  // Sort holding rows based on current config
  const sortedHoldingRows = useMemo(() => {
    const sortableItems = [...Object.values(groupedRowsGroups).flat()];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        // Add checks/defaults for potential undefined values
        const valA = a[sortConfig.key] ?? (typeof a[sortConfig.key] === 'number' ? 0 : ''); 
        const valB = b[sortConfig.key] ?? (typeof b[sortConfig.key] === 'number' ? 0 : '');
        
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [groupedRowsGroups, sortConfig]);

  // Calculate overall summary metrics from processed rows
  const summary = useMemo(() => {
    const totalValue = sortedHoldingRows.reduce((sum, row) => sum + row.value, 0);
    const totalCost = sortedHoldingRows.reduce((sum, row) => sum + (row.costBasis ?? row.value), 0);
    const totalGain = totalValue - totalCost;
    const averageGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    return { totalValue, totalCost, totalGain, averageGainPercent };
  }, [sortedHoldingRows]);

  // Combine loading and error states from context
  const isComponentLoading = isLoading || loading;
  const componentError = contextError || error;

  // --- Handlers for Edit/Delete (Ensure they are defined before return) --- 
  const handleEditAccount = (accountId: string) => {
      const account = manualAccounts.find(acc => acc.id === accountId);
      if (account) {
          console.log("Editing account:", account); 
          alert("Edit functionality coming soon!");
      }
  };

  const handleDeleteAccount = async (accountId: string, accountName: string) => {
      if (window.confirm(`Are you sure you want to delete the account "${accountName}"?`)) {
          try {
              await deleteManualAccount(accountId);
          } catch (err) {
              console.error("Error deleting account:", err);
              alert(`Failed to delete account: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
      }
  }; // <-- Add semicolon here

  if (isComponentLoading) {
    return (
      <div className="bg-[#1E2D4E] rounded-lg p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (componentError) {
    return (
      <div className="bg-[#1E2D4E] rounded-lg p-6">
        <div className="text-red-500 p-4 rounded-lg">
          <h3 className="text-xl font-bold mb-2">Error</h3>
          <p>{componentError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1E2D4E] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Investment Holdings</h2>
        {/* Add the button here */}
        <button
          onClick={openModal} // Use openModal from context
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#9DC4D4] hover:bg-[#8BB3C3] text-[#1B2B4B] transition-colors text-sm"
        >
          <span className="material-icons" style={{ fontSize: '1.2em' }}>add_circle</span>
          Aggregate Account
        </button>
      </div>
      
      {/* Portfolio Summary - Conditionally render based on manualAccounts from context */}
      {manualAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#2A3C61] rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total Value</div>
              <div className="text-2xl font-bold">${summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-[#2A3C61] rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total Cost</div>
              <div className="text-2xl font-bold">${summary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-[#2A3C61] rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total Gain/Loss</div>
              <div className={`text-2xl font-bold ${summary.totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${summary.totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-[#2A3C61] rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Average Return</div>
              <div className={`text-2xl font-bold ${summary.averageGainPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {summary.averageGainPercent.toFixed(2)}%
              </div>
            </div>
          </div>
      ) : (
         <div className="text-center py-6 text-gray-400 bg-[#2A3C61] rounded-lg mb-6">
             No manual accounts added yet. Click 'Aggregate Account' to add one.
         </div>
      )}
      
      {/* Holdings Table - Use groupedRowsGroups and groupedAccountDetails */}
      {manualAccounts.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#2A3C61] text-gray-300">
              <tr>
                {/* Add Account Name column */}
                <th className="py-3 px-4 text-left font-medium">
                   <button onClick={() => requestSort('accountName')} className="flex items-center">
                     Account
                     {sortConfig.key === 'accountName' && (
                       <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                     )}
                   </button>
                </th>
                <th className="py-3 px-4 text-left font-medium">
                  <button onClick={() => requestSort('symbol')} className="flex items-center">
                    Symbol/Asset
                    {sortConfig.key === 'symbol' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                 {/* Remove Category Header - can add back if needed */}
                {/* <th className="py-3 px-4 text-left font-medium">... Category ...</th> */}
                <th className="py-3 px-4 text-right font-medium">
                  <button onClick={() => requestSort('quantity')} className="flex items-center justify-end">
                    Quantity
                    {sortConfig.key === 'quantity' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                {/* Remove Price Header - value is more important */}
                {/* <th className="py-3 px-4 text-right font-medium">... Price ...</th> */}
                <th className="py-3 px-4 text-right font-medium">
                  <button onClick={() => requestSort('value')} className="flex items-center justify-end">
                    Market Value
                    {sortConfig.key === 'value' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                 <th className="py-3 px-4 text-right font-medium">
                  <button onClick={() => requestSort('gain')} className="flex items-center justify-end">
                    Gain/Loss
                    {sortConfig.key === 'gain' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 text-right font-medium">
                  <button onClick={() => requestSort('allocation')} className="flex items-center justify-end">
                    Allocation
                    {sortConfig.key === 'allocation' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
              </tr>
            </thead>
            {/* Iterate through accounts first */}
            <tbody>
              {/* Correctly iterate using the defined variable */}
              {Object.entries(groupedRowsGroups).map(([accountId, rows]) => (
                  <React.Fragment key={accountId}>
                    {/* Account Header Row - Use groupedAccountDetails */}
                    <tr className="bg-[#18233C] border-b border-t border-gray-600">
                       <td colSpan={5} className="py-2 px-4 font-semibold"> 
                          <div className="flex items-center">
                              <span className="h-2.5 w-2.5 rounded-full mr-2" style={{ backgroundColor: groupedAccountDetails[accountId]?.color }}></span>
                              <span>{groupedAccountDetails[accountId]?.name}</span>
                              <span className="text-xs text-gray-400 ml-2">({groupedAccountDetails[accountId]?.type})</span>
                          </div>
                       </td>
                       <td className="py-2 px-4 text-center">
                         <div className="flex justify-center gap-2">
                            <button onClick={() => handleEditAccount(accountId)} title="Edit Account" className="text-blue-400 hover:text-blue-300">
                               <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteAccount(accountId, groupedAccountDetails[accountId]?.name)} title="Delete Account" className="text-red-400 hover:text-red-300">
                               <Trash2 size={16} />
                            </button>
                         </div>
                       </td>
                    </tr>
                    {/* Asset Rows */}
                    {rows.map((row, index) => (
                      <tr key={row.id} className={`${index % 2 === 0 ? 'bg-[#2A3C61]' : 'bg-[#233150]'} hover:bg-[#344571]`}>
                        <td className="py-3 px-4 pl-8 text-sm font-medium">{row.symbol}</td> {/* Indented symbol */}
                        <td className="py-3 px-4 text-right text-sm">{row.quantity.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-sm">${row.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className={`py-3 px-4 text-right text-sm ${row.gain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ${row.gain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <span className="text-xs ml-1">({row.gainPercent.toFixed(2)}%)</span>
                        </td>
                        <td className="py-3 px-4 text-right text-sm">{row.allocation.toFixed(2)}%</td>
                        <td className="py-3 px-4 text-center">{/* Actions per asset? */}</td>
                      </tr>
                    ))}
                  </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 