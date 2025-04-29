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
  updateManualAccount: (id: string, accountData: Partial<Omit<ManualAccount, 'id' | 'totalValue'>>) => Promise<void>;
  deleteManualAccount: (id: string) => Promise<void>;
  refetchAccounts: () => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    console.log('[Context] Fetching manual accounts...');
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/manual-accounts');
      console.log(`[Context] Fetch response status: ${response.status}`);
      if (!response.ok) {
        let errorMsg = `Failed to fetch accounts: ${response.statusText}`;
        try {
          const errorBody = await response.json();
          errorMsg += ` - ${errorBody.error || 'Unknown API error'}`;
        } catch (_) {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      console.log('[Context] Raw data received from API:', data);
      const formattedData = data.map((acc: any) => ({ ...acc, id: acc._id || acc.id }));
      setManualAccounts(formattedData || []);
      console.log('[Context] Manual accounts loaded into state:', formattedData.length);
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

  const updateManualAccount = async (id: string, accountData: Partial<Omit<ManualAccount, 'id' | 'totalValue'>>) => {
    console.log(`[Context] Attempting to update account ${id} via API:`, accountData);
    setError(null);
    try {
      let dataToSend = { ...accountData };
      if (accountData.assets) {
        dataToSend.totalValue = accountData.assets.reduce((sum, asset) => sum + asset.value, 0);
      }

      const response = await fetch(`/api/manual-accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update account: ${response.statusText}`);
      }
      const updatedAccount = await response.json();
      const formattedUpdatedAccount = { ...updatedAccount, id: updatedAccount._id || updatedAccount.id };
      
      setManualAccounts(prev => 
        prev.map(acc => acc.id === id ? formattedUpdatedAccount : acc)
      );
      console.log('[Context] Account updated successfully:', formattedUpdatedAccount);
    } catch (err: any) {
      console.error(`[Context] Error updating account ${id}:`, err);
      setError(err.message || 'Failed to update account');
      throw err;
    }
  };

  const deleteManualAccount = async (id: string) => {
    console.log(`[Context] Attempting to delete account ${id} via API`);
    setError(null);
    try {
      const response = await fetch(`/api/manual-accounts/${id}`, {
        method: 'DELETE',
      });
       if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete account: ${response.statusText}`);
      }
      setManualAccounts(prev => prev.filter(acc => acc.id !== id));
      console.log(`[Context] Account ${id} deleted successfully.`);
    } catch (err: any) {
       console.error(`[Context] Error deleting account ${id}:`, err);
       setError(err.message || 'Failed to delete account');
       throw err;
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <ManualAccountsContext.Provider value={{ 
        manualAccounts, 
        isLoading, 
        error, 
        addManualAccount, 
        updateManualAccount,
        deleteManualAccount,
        refetchAccounts: fetchAccounts,
        isModalOpen,
        openModal,
        closeModal
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