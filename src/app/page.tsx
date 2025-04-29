'use client';

// import { Metadata } from 'next'; // Metadata might cause issues in client components
import React, { useState, useMemo } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PortfolioValue from '@/components/dashboard/PortfolioValue';
import PortfolioChart from '@/components/dashboard/PortfolioChart';
import AggregationModal from '@/components/dashboard/AggregationModal';
import { useManualAccounts } from '@/context/ManualAccountsContext';

// Note: Metadata export might need to be handled differently or removed 
// when converting a page to a Client Component if it causes issues.
// Commenting out for now.
// export const metadata: Metadata = {
//   title: 'Dashboard | Wealth Dashboard',
//   description: 'View and manage your portfolio',
// };

export default function DashboardPage() {
  const [showAggregationModal, setShowAggregationModal] = useState(false);
  const { manualAccounts } = useManualAccounts();

  const totalPortfolioValue = useMemo(() => {
    return manualAccounts.reduce((sum, account) => sum + account.totalValue, 0);
  }, [manualAccounts]);
  
  const displayValue = totalPortfolioValue > 0 ? totalPortfolioValue : 9035.41;

  const handleOpenAggregationModal = () => {
    setShowAggregationModal(true);
  };

  const handleCloseAggregationModal = () => {
    setShowAggregationModal(false);
  };

  return (
    <main className="min-h-screen bg-[#1B2B4B] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardHeader onAggregateClick={handleOpenAggregationModal} />
        <div className="space-y-6">
          <PortfolioValue value={displayValue} />
          <PortfolioChart totalValue={displayValue} />
        </div>
      </div>
      <AggregationModal 
        isOpen={showAggregationModal} 
        onClose={handleCloseAggregationModal} 
      />
    </main>
  );
}
