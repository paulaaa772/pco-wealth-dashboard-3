'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

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
  isLoading: boolean;
  error: string | null;
  addManualAccount: (account: Omit<ManualAccount, 'id' | 'totalValue'>) => Promise<void>;
  refetchAccounts: () => void;
}

const ManualAccountsContext = createContext<ManualAccountsContextType | undefined>(undefined);

// --- Provider Component --- 

interface ManualAccountsProviderProps {
  children: ReactNode;
}

export const ManualAccountsProvider: React.FC<ManualAccountsProviderProps> = ({ children }) => {
  const [manualAccounts, setManualAccounts] = useState<ManualAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    console.log('[Context] Fetching manual accounts...');
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/manual-accounts');
      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.statusText}`);
      }
      const data = await response.json();
      const formattedData = data.map((acc: any) => ({ ...acc, id: acc._id || acc.id }));
      setManualAccounts(formattedData || []);
      console.log('[Context] Manual accounts loaded:', formattedData.length);
    } catch (err: any) {
      console.error('[Context] Error fetching accounts:', err);
      setError(err.message || 'Failed to load accounts');
      setManualAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addManualAccount = async (accountData: Omit<ManualAccount, 'id' | 'totalValue'>) => {
    console.log('[Context] Attempting to add manual account via API:', accountData);
    setError(null);
    try {
      const response = await fetch('/api/manual-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save account: ${response.statusText}`);
      }

      const newAccount = await response.json();
      const formattedNewAccount = { ...newAccount, id: newAccount._id || newAccount.id };
      setManualAccounts(prevAccounts => [...prevAccounts, formattedNewAccount]);
      console.log('[Context] Manual account added successfully:', formattedNewAccount);
    } catch (err: any) {
      console.error('[Context] Error adding account:', err);
      setError(err.message || 'Failed to save account');
      throw err;
    }
  };

  return (
    <ManualAccountsContext.Provider value={{ 
        manualAccounts, 
        isLoading, 
        error, 
        addManualAccount, 
        refetchAccounts: fetchAccounts
    }}>
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