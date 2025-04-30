'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useManualAccounts, ManualAccount, ManualAsset } from '@/context/ManualAccountsContext';

interface ManualAssetFormRow {
  id: string;
  symbol: string;
  quantity: string;
  value: string;
  costBasis?: string;
  assetType?: string;
}

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: ManualAccount | null;
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({ isOpen, onClose, account }) => {
  const { updateManualAccount } = useManualAccounts();
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [assets, setAssets] = useState<ManualAssetFormRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initialize form with account data when it changes
  useEffect(() => {
    if (account) {
      setAccountName(account.accountName);
      setAccountType(account.accountType);
      setAssets(account.assets.map(asset => ({
        id: asset.id,
        symbol: asset.symbol,
        quantity: asset.quantity.toString(),
        value: asset.value.toString(),
        costBasis: asset.costBasis?.toString(),
        assetType: asset.assetType || 'Stock'
      })));
    }
  }, [account]);

  if (!isOpen || !account) return null;

  const handleAddAssetRow = () => {
    setAssets([...assets, { id: Date.now().toString(), symbol: '', quantity: '', value: '', assetType: 'Stock' }]);
  };

  const handleAssetChange = (id: string, field: keyof Omit<ManualAssetFormRow, 'id'>, value: string) => {
    setAssets(assets.map(asset => asset.id === id ? { ...asset, [field]: value } : asset));
  };

  const handleRemoveAssetRow = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const handleSaveAccount = async () => {
    const processedAssets: ManualAsset[] = assets.map(asset => ({
        id: asset.id,
        symbol: asset.symbol.trim() || 'Unknown Asset',
        quantity: parseFloat(asset.quantity) || 0,
        value: parseFloat(asset.value) || 0,
        costBasis: asset.costBasis ? parseFloat(asset.costBasis) : undefined,
        assetType: asset.assetType as ManualAsset['assetType'] || 'Stock'
    })).filter(asset => asset.value > 0);

    if (!accountName.trim()) {
        alert('Please enter an account name.');
        return;
    }
    if (processedAssets.length === 0) {
        alert('Please add at least one asset with a valid value.');
        return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      await updateManualAccount(account.id, {
        accountName: accountName.trim(),
        accountType: accountType,
        assets: processedAssets,
      });
      onClose();
    } catch (err: any) {
      console.error("Failed to update account:", err);
      setSaveError(err.message || "Could not update account. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Edit Account</h3>
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
            <input
              type="text"
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
              required
            />
          </div>
          <div>
            <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select
              id="accountType"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
            >
              <option>Brokerage</option>
              <option>Bank Account</option>
              <option>Crypto Wallet</option>
              <option>Other</option>
            </select>
          </div>
          
          <div className="border-t pt-4 mt-4">
             <h4 className="text-md font-medium text-gray-800 mb-2">Assets / Holdings</h4>
             {assets.map((asset, index) => (
               <div key={asset.id} className="grid grid-cols-12 gap-2 mb-3 items-center">
                 <input 
                   type="text" 
                   placeholder="Symbol/Name" 
                   value={asset.symbol}
                   onChange={(e) => handleAssetChange(asset.id, 'symbol', e.target.value)}
                   className="col-span-2 border border-gray-300 rounded px-2 py-1 text-sm text-gray-900"
                 />
                 <select
                   value={asset.assetType || 'Stock'}
                   onChange={(e) => handleAssetChange(asset.id, 'assetType', e.target.value)}
                   className="col-span-2 border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white"
                 >
                   <option value="Stock">Stock</option>
                   <option value="Bond">Bond</option>
                   <option value="ETF">ETF</option>
                   <option value="Mutual Fund">Mutual Fund</option>
                   <option value="CD">CD</option>
                   <option value="Crypto">Crypto</option>
                   <option value="Cash">Cash</option>
                   <option value="Other">Other</option>
                 </select>
                 <input 
                   type="text" 
                   placeholder="Quantity" 
                   value={asset.quantity}
                   onChange={(e) => handleAssetChange(asset.id, 'quantity', e.target.value)}
                   className="col-span-2 border border-gray-300 rounded px-2 py-1 text-sm text-gray-900"
                 />
                 <div className="col-span-3 relative rounded-md shadow-sm">
                   <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                     <span className="text-gray-500 sm:text-sm">$</span>
                   </div>
                   <input 
                     type="text" 
                     placeholder="Value" 
                     value={asset.value}
                     onChange={(e) => handleAssetChange(asset.id, 'value', e.target.value)}
                     className="w-full border border-gray-300 rounded pl-6 pr-2 py-1 text-sm text-gray-900"
                   />
                 </div>
                 <div className="col-span-2 relative rounded-md shadow-sm">
                   <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                     <span className="text-gray-500 sm:text-sm">$</span>
                   </div>
                   <input 
                     type="text" 
                     placeholder="Cost Basis" 
                     value={asset.costBasis || ''}
                     onChange={(e) => handleAssetChange(asset.id, 'costBasis', e.target.value)}
                     className="w-full border border-gray-300 rounded pl-6 pr-2 py-1 text-sm text-gray-900"
                   />
                 </div>
                 <button 
                   onClick={() => handleRemoveAssetRow(asset.id)} 
                   className="col-span-1 text-red-500 hover:text-red-700 disabled:opacity-50"
                   disabled={assets.length <= 1}
                   title="Remove row"
                 >
                   <X size={16} />
                 </button>
               </div>
             ))}
             <button onClick={handleAddAssetRow} className="text-sm text-indigo-600 hover:text-indigo-800 mt-2">
               + Add another asset
             </button>
          </div>
        </div>
        {saveError && (
            <div className="text-sm text-red-600 mt-2 p-2 bg-red-50 rounded">Error: {saveError}</div>
        )}
        <div className="flex justify-between items-center pt-4 border-t">
          <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-800" disabled={isSaving}>Cancel</button>
          <button 
            onClick={handleSaveAccount}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAccountModal; 