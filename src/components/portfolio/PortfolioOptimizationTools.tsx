'use client';

import React, { useState } from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext';
import RiskBasedAllocation from './RiskBasedAllocation';
import RebalancingEngine from './RebalancingEngine';
import DiversificationAnalysis from './DiversificationAnalysis';
import ScenarioAnalysis from './ScenarioAnalysis';
import AIInsightsSummary from './AIInsightsSummary';
import PortfolioOptimization from './PortfolioOptimization';
import TaxLotOptimizer from './TaxLotOptimizer';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PortfolioOptimizationTools: React.FC = () => {
  const { manualAccounts, isLoading } = useManualAccounts();
  const [activeSection, setActiveSection] = useState<string>('all');

  // Helper function to scroll to a section
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveSection(sectionId);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 py-6">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Portfolio Optimization Suite</h2>
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      <div className="border-b border-gray-700 pb-2">
        <h2 className="text-2xl font-bold text-white mb-3">Portfolio Optimization Suite</h2>
        <p className="text-gray-400 mb-4">
          Optimize your portfolio with advanced tools for allocation, diversification, rebalancing, and scenario testing.
        </p>
        
        {/* Main navigation using tabs */}
        <Tabs defaultValue="optimization" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 mb-4">
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="optimization">Portfolio Optimization</TabsTrigger>
            <TabsTrigger value="tax-lots">Tax Lot Optimizer</TabsTrigger>
            <TabsTrigger value="risk-allocation">Risk Allocation</TabsTrigger>
            <TabsTrigger value="rebalancing">Rebalancing</TabsTrigger>
            <TabsTrigger value="diversification">Diversification</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights">
            <div id="insights">
              <AIInsightsSummary manualAccounts={manualAccounts} />
            </div>
          </TabsContent>
          
          <TabsContent value="optimization">
            <div id="optimization">
              <PortfolioOptimization />
            </div>
          </TabsContent>
          
          <TabsContent value="tax-lots">
            <div id="tax-lots">
              <TaxLotOptimizer />
            </div>
          </TabsContent>
          
          <TabsContent value="risk-allocation">
            <div id="risk-allocation">
              <RiskBasedAllocation />
            </div>
          </TabsContent>
          
          <TabsContent value="rebalancing">
            <div id="rebalancing">
              <RebalancingEngine />
            </div>
          </TabsContent>
          
          <TabsContent value="diversification">
            <div id="diversification">
              <DiversificationAnalysis />
            </div>
          </TabsContent>
          
          <TabsContent value="scenarios">
            <div id="scenarios">
              <ScenarioAnalysis />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Summary panel at bottom */}
      <div className="bg-[#2A3C61]/30 p-6 rounded-lg shadow-lg border border-gray-700 mt-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-100">Optimization Strategy Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1B2B4B]/60 p-3 rounded border border-gray-700">
            <h4 className="text-md font-medium mb-1 text-gray-200">Key Observations</h4>
            <ul className="text-sm text-gray-400 list-disc ml-4 space-y-1">
              <li>Your portfolio risk level aligns with a {manualAccounts.length > 0 ? 'Moderate' : 'Default'} risk profile</li>
              <li>Portfolio rebalancing opportunities identified in {manualAccounts.length > 0 ? '2' : '0'} asset classes</li>
              <li>Diversification could be improved with additional asset exposure</li>
              <li>Modern Portfolio Theory analysis shows potential for improved risk-adjusted returns</li>
              <li>Tax-loss harvesting opportunities identified in {manualAccounts.length > 0 ? 'select securities' : 'demo securities'}</li>
            </ul>
          </div>
          <div className="bg-[#1B2B4B]/60 p-3 rounded border border-gray-700">
            <h4 className="text-md font-medium mb-1 text-gray-200">Next Steps</h4>
            <ul className="text-sm text-gray-400 list-disc ml-4 space-y-1">
              <li>Review the Modern Portfolio Theory optimizer for better allocation</li>
              <li>Evaluate tax-lot selling opportunities to minimize tax impact</li>
              <li>Review and consider the suggested portfolio adjustments</li>
              <li>Explore the scenario analysis to test portfolio resilience</li>
              <li>Implement rebalancing recommendations gradually to minimize costs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOptimizationTools; 