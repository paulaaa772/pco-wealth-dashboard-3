'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useManualAccounts, ManualAccount, ManualAsset } from '@/context/ManualAccountsContext'; // Import context hook and types
import { Edit, Trash2, Layers } from 'lucide-react';
import EditAccountModal from '@/components/dashboard/EditAccountModal';

// Define the structure for a displayable row in the holdings table
interface HoldingRow extends ManualAsset { 
  // Inherits id, symbol, quantity, value, costBasis from ManualAsset
  accountName: string;
  accountType: string;
  brokerName?: string; // For consolidated view
  accountColor?: string; // For visual grouping (optional)
  allocation: number;
  gain: number;
  gainPercent: number;
  assetType?: string; // Added for asset type
}

// Function to assign colors for grouping accounts visually
const accountColors = ['#4A90E2', '#50E3C2', '#B8E986', '#F8E71C', '#F5A623', '#BD10E0', '#9013FE', '#4A4A4A'];
let colorIndex = 0;
const accountColorMap = new Map<string, string>();

// Get broker name from account name (e.g., "M1 (Brokerage)" => "M1")
const getBrokerName = (accountName: string): string => {
  // Extract broker name before parenthesis or first space
  const brokerMatch = accountName.match(/^([^(]+)(?:\s*\(|$)/);
  return brokerMatch ? brokerMatch[1].trim() : accountName;
};

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ManualAccount | null>(null);
  const [isConsolidated, setIsConsolidated] = useState(false);
  const [assetTypeFilter, setAssetTypeFilter] = useState<string | null>(null);

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

  // --- Find accounts with similar brokers --- 
  const brokersWithMultipleAccounts = useMemo(() => {
    const brokerCounts = new Map<string, number>();
    
    // Count accounts per broker
    manualAccounts.forEach(account => {
      const brokerName = getBrokerName(account.accountName);
      brokerCounts.set(brokerName, (brokerCounts.get(brokerName) || 0) + 1);
    });
    
    // Return brokers with multiple accounts
    return new Set(
      Array.from(brokerCounts.entries())
        .filter(([_, count]) => count > 1)
        .map(([broker]) => broker)
    );
  }, [manualAccounts]);

  // --- Process accounts into rows AND Define groupedRows here --- 
  const { groups: groupedRowsGroups, accountDetails: groupedAccountDetails } = useMemo(() => {
    const groups: { [accountId: string]: HoldingRow[] } = {};
    const accountDetails: { [accountId: string]: { name: string; type: string; color: string } } = {};
    let grandTotalValue = manualAccounts.reduce((sum, acc) => sum + acc.totalValue, 0) || 1;

    if (isConsolidated && brokersWithMultipleAccounts.size > 0) {
      // Group accounts by broker
      const brokerGroups = new Map<string, ManualAccount[]>();
      
      manualAccounts.forEach(account => {
        const brokerName = getBrokerName(account.accountName);
        if (!brokerGroups.has(brokerName)) {
          brokerGroups.set(brokerName, []);
        }
        brokerGroups.get(brokerName)!.push(account);
      });
      
      // Process each broker group
      brokerGroups.forEach((accounts, brokerName) => {
        // Skip consolidation for brokers with only one account
        if (accounts.length === 1 || !brokersWithMultipleAccounts.has(brokerName)) {
          const account = accounts[0];
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
          return;
        }
        
        // Create a consolidated account ID
        const consolidatedId = `consolidated-${brokerName}`;
        const color = getAccountColor(consolidatedId);
        const firstAccount = accounts[0];
        accountDetails[consolidatedId] = { 
          name: `${brokerName} (Consolidated)`, 
          type: firstAccount.accountType, 
          color 
        };
        groups[consolidatedId] = [];
        
        // Consolidate assets across accounts
        const assetMap = new Map<string, {
          totalQuantity: number;
          totalValue: number;
          totalCostBasis: number;
          symbol: string;
          id: string;
          assetType?: string; // Add asset type to track in consolidated view
        }>();
        
        accounts.forEach(account => {
          account.assets.forEach(asset => {
            const key = asset.symbol;
            if (!assetMap.has(key)) {
              assetMap.set(key, {
                totalQuantity: 0,
                totalValue: 0, 
                totalCostBasis: 0,
                symbol: asset.symbol,
                id: `${consolidatedId}-${asset.symbol}`,
                assetType: asset.assetType // Capture asset type
              });
            }
            
            const item = assetMap.get(key)!;
            item.totalQuantity += asset.quantity;
            item.totalValue += asset.value;
            item.totalCostBasis += asset.costBasis ?? asset.value;
            // Keep asset type if present
            if (!item.assetType && asset.assetType) {
              item.assetType = asset.assetType;
            }
          });
        });
        
        // Convert consolidated assets to holding rows
        assetMap.forEach(asset => {
          const gain = asset.totalValue - asset.totalCostBasis;
          const gainPercent = asset.totalCostBasis > 0 ? (gain / asset.totalCostBasis) * 100 : 0;
          
          groups[consolidatedId].push({
            id: asset.id,
            symbol: asset.symbol,
            quantity: asset.totalQuantity,
            value: asset.totalValue,
            costBasis: asset.totalCostBasis,
            assetType: asset.assetType, // Include asset type in consolidated view
            accountName: `${brokerName} (Consolidated)`,
            brokerName: brokerName,
            accountType: firstAccount.accountType,
            accountColor: color,
            allocation: (asset.totalValue / grandTotalValue) * 100,
            gain,
            gainPercent
          });
        });
      });
    } else {
      // Original non-consolidated view
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
    }
    
    return { groups, accountDetails };
  }, [manualAccounts, isConsolidated, brokersWithMultipleAccounts]);

  // Sort holding rows based on current config and apply filters
  const sortedHoldingRows = useMemo(() => {
    let sortableItems = [...Object.values(groupedRowsGroups).flat()];
    
    // Apply asset type filter if selected
    if (assetTypeFilter) {
      sortableItems = sortableItems.filter(item => item.assetType === assetTypeFilter);
    }
    
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
  }, [groupedRowsGroups, sortConfig, assetTypeFilter]);

  // Calculate available asset types for filter
  const availableAssetTypes = useMemo(() => {
    const types = new Set<string>();
    Object.values(groupedRowsGroups).flat().forEach(row => {
      if (row.assetType) {
        types.add(row.assetType);
      }
    });
    return Array.from(types).sort();
  }, [groupedRowsGroups]);

  // Calculate overall summary metrics from processed rows
  const summary = useMemo(() => {
    const totalValue = sortedHoldingRows.reduce((sum, row) => sum + row.value, 0);
    const totalCost = sortedHoldingRows.reduce((sum, row) => sum + (row.costBasis ?? row.value), 0);
    const totalGain = totalValue - totalCost;
    const averageGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    return { totalValue, totalCost, totalGain, averageGainPercent };
  }, [sortedHoldingRows]);

  // Calculate the asset type distribution for the portfolio
  const assetTypeDistribution = useMemo(() => {
    const distribution: Record<string, { value: number; percentage: number }> = {};
    const totalValue = sortedHoldingRows.reduce((sum, row) => sum + row.value, 0);
    
    sortedHoldingRows.forEach(row => {
      const type = row.assetType || 'Unspecified';
      if (!distribution[type]) {
        distribution[type] = { value: 0, percentage: 0 };
      }
      distribution[type].value += row.value;
    });
    
    // Calculate percentages
    Object.keys(distribution).forEach(type => {
      distribution[type].percentage = (distribution[type].value / totalValue) * 100;
    });
    
    return distribution;
  }, [sortedHoldingRows]);

  // Combine loading and error states from context
  const isComponentLoading = isLoading || loading;
  const componentError = contextError || error;

  // --- Handlers for Edit/Delete (Ensure they are defined before return) --- 
  const handleEditAccount = (accountId: string) => {
      // Skip edit for consolidated accounts
      if (accountId.startsWith('consolidated-')) {
        return;
      }
      
      const account = manualAccounts.find(acc => acc.id === accountId);
      if (account) {
          console.log("Editing account:", account); 
          setSelectedAccount(account);
          setIsEditModalOpen(true);
      }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedAccount(null);
  };

  const handleDeleteAccount = async (accountId: string, accountName: string) => {
      // Skip delete for consolidated accounts
      if (accountId.startsWith('consolidated-')) {
        return;
      }
      
      if (window.confirm(`Are you sure you want to delete the account "${accountName}"?`)) {
          try {
              await deleteManualAccount(accountId);
          } catch (err) {
              console.error("Error deleting account:", err);
              alert(`Failed to delete account: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
      }
  };

  // Toggle consolidation
  const toggleConsolidation = () => {
    setIsConsolidated(!isConsolidated);
  };

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
        <div className="flex gap-4">
          {/* Asset Type Filter */}
          {availableAssetTypes.length > 0 && (
            <div className="relative">
              <select
                value={assetTypeFilter || ''}
                onChange={(e) => setAssetTypeFilter(e.target.value || null)}
                className="bg-[#2A3C61] text-gray-300 py-2 px-4 rounded-lg text-sm appearance-none pr-8 hover:bg-[#344571] transition-colors"
              >
                <option value="">All Asset Types</option>
                {availableAssetTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
            </div>
          )}
          
          {/* Consolidate toggle - only show if there are accounts that can be consolidated */}
          {brokersWithMultipleAccounts.size > 0 && (
            <button
              onClick={toggleConsolidation}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isConsolidated ? 'bg-blue-600 text-white' : 'bg-[#2A3C61] text-gray-300 hover:bg-[#344571]'
              } transition-colors text-sm`}
              title="Consolidate accounts from the same broker"
            >
              <Layers size={16} />
              {isConsolidated ? 'Individual View' : 'Consolidated View'}
            </button>
          )}
          
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#9DC4D4] hover:bg-[#8BB3C3] text-[#1B2B4B] transition-colors text-sm"
          >
            <span className="material-icons" style={{ fontSize: '1.2em' }}>add_circle</span>
            Aggregate Account
          </button>
        </div>
      </div>
      
      {/* Portfolio Summary */}
      {manualAccounts.length > 0 ? (
          <>
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
            
            {/* Asset Type Distribution */}
            {Object.keys(assetTypeDistribution).length > 0 && (
              <div className="bg-[#2A3C61] rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-3">Portfolio Composition by Asset Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(assetTypeDistribution)
                    .sort(([, a], [, b]) => b.value - a.value)
                    .map(([type, data]) => (
                      <div key={type} className="flex flex-col">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{type}</span>
                          <span className="text-sm text-gray-400">{data.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-[#1B2B4B] rounded-full h-2.5">
                          <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${data.percentage}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-400 mt-1">
                          ${data.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
      ) : (
         <div className="text-center py-6 text-gray-400 bg-[#2A3C61] rounded-lg mb-6">
             No manual accounts added yet. Click 'Aggregate Account' to add one.
         </div>
      )}
      
      {/* Holdings Table */}
      {manualAccounts.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#2A3C61] text-gray-300">
              <tr>
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
                <th className="py-3 px-4 text-left font-medium">
                  <button onClick={() => requestSort('assetType')} className="flex items-center">
                    Asset Type
                    {sortConfig.key === 'assetType' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 text-right font-medium">
                  <button onClick={() => requestSort('quantity')} className="flex items-center justify-end">
                    Quantity
                    {sortConfig.key === 'quantity' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
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
            <tbody>
              {Object.entries(groupedRowsGroups).map(([accountId, rows]) => (
                  <React.Fragment key={accountId}>
                    {/* Account Header Row */}
                    <tr className="bg-[#18233C] border-b border-t border-gray-600">
                       <td colSpan={6} className="py-2 px-4 font-semibold"> 
                          <div className="flex items-center">
                              <span 
                                className="h-2.5 w-2.5 rounded-full mr-2" 
                                style={{ backgroundColor: groupedAccountDetails[accountId]?.color }}
                              ></span>
                              <span>{groupedAccountDetails[accountId]?.name}</span>
                              <span className="text-xs text-gray-400 ml-2">({groupedAccountDetails[accountId]?.type})</span>
                              {accountId.startsWith('consolidated-') && (
                                <span className="ml-3 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">Consolidated</span>
                              )}
                          </div>
                       </td>
                       <td className="py-2 px-4 text-center">
                         <div className="flex justify-center gap-2">
                            {!accountId.startsWith('consolidated-') && (
                              <>
                                <button onClick={() => handleEditAccount(accountId)} title="Edit Account" className="text-blue-400 hover:text-blue-300">
                                  <Edit size={16} />
                                </button>
                                <button onClick={() => handleDeleteAccount(accountId, groupedAccountDetails[accountId]?.name)} title="Delete Account" className="text-red-400 hover:text-red-300">
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                         </div>
                       </td>
                    </tr>
                    {/* Asset Rows */}
                    {rows.map((row, index) => (
                      <tr key={row.id} className={`${index % 2 === 0 ? 'bg-[#2A3C61]' : 'bg-[#233150]'} hover:bg-[#344571]`}>
                        <td className="py-3 px-4 pl-8 text-sm font-medium">
                          {row.symbol}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {row.assetType ? (
                            <span className="px-2 py-0.5 text-xs bg-[#344571] text-gray-300 rounded-full">
                              {row.assetType}
                            </span>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
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
      ) : null}
      
      {/* Edit Modal */}
      <EditAccountModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        account={selectedAccount}
      />
    </div>
  );
} 