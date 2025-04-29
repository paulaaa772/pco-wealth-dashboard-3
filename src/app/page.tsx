'use client';

import { Metadata } from 'next';
import React, { useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PortfolioValue from '@/components/dashboard/PortfolioValue';
import PortfolioChart from '@/components/dashboard/PortfolioChart';
import AggregationModal from '@/components/dashboard/AggregationModal';

export const metadata: Metadata = {
  title: 'Dashboard | Wealth Dashboard',
  description: 'View and manage your portfolio',
};

export default function DashboardPage() {
  const [showAggregationModal, setShowAggregationModal] = useState(false);

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
          <PortfolioValue />
          <PortfolioChart />
        </div>
      </div>
      <AggregationModal 
        isOpen={showAggregationModal} 
        onClose={handleCloseAggregationModal} 
      />
    </main>
  );
}
