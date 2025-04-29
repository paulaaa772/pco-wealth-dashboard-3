'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

// --- Interfaces --- 

// Asset within a manually added account
export interface ManualAsset {
  id: string;      // Unique ID for the asset row (e.g., timestamp)
  symbol: string;  // Ticker symbol or asset name (e.g., 'AAPL', 'Bitcoin')
  quantity: number; // Number of shares/units
  value: number;    // Current market value of this holding
  // Add cost basis if needed for performance calculations later
  costBasis?: number; 
}

// Represents a manually added account
export interface ManualAccount {
  id: string;           // Unique ID for the account
  accountName: string;
  accountType: string; // e.g., 'Brokerage', 'Bank Account', 'Crypto Wallet'
  assets: ManualAsset[];
  totalValue: number; // Calculated total value of assets in this account
}

// --- Context Definition --- 

interface ManualAccountsContextType {
  manualAccounts: ManualAccount[];
  addManualAccount: (account: Omit<ManualAccount, 'id' | 'totalValue'>) => void;
  // TODO: Add functions for updating/deleting accounts if needed later
}

const ManualAccountsContext = createContext<ManualAccountsContextType | undefined>(undefined);

// --- Provider Component --- 

interface ManualAccountsProviderProps {
  children: ReactNode;
}

export const ManualAccountsProvider: React.FC<ManualAccountsProviderProps> = ({ children }) => {
  const [manualAccounts, setManualAccounts] = useState<ManualAccount[]>([]);

  const addManualAccount = (accountData: Omit<ManualAccount, 'id' | 'totalValue'>) => {
    const totalValue = accountData.assets.reduce((sum, asset) => sum + asset.value, 0);
    const newAccount: ManualAccount = {
      ...accountData,
      id: `manual-${Date.now()}`,
      totalValue,
    };
    setManualAccounts(prevAccounts => [...prevAccounts, newAccount]);
    console.log('[Context] Added Manual Account:', newAccount);
  };

  return (
    <ManualAccountsContext.Provider value={{ manualAccounts, addManualAccount }}>
      {children}
    </ManualAccountsContext.Provider>
  );
};

// --- Custom Hook --- 

export const useManualAccounts = (): ManualAccountsContextType => {
  const context = useContext(ManualAccountsContext);
  if (context === undefined) {
    throw new Error('useManualAccounts must be used within a ManualAccountsProvider');
  }
  return context;
}; 