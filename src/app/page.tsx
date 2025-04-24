import { Metadata } from 'next';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PortfolioValue from '@/components/dashboard/PortfolioValue';
import PortfolioChart from '@/components/dashboard/PortfolioChart';

export const metadata: Metadata = {
  title: 'Dashboard | Wealth Dashboard',
  description: 'View and manage your portfolio',
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#1B2B4B] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardHeader />
        <div className="space-y-6">
          <PortfolioValue />
          <PortfolioChart />
        </div>
      </div>
    </main>
  );
}
