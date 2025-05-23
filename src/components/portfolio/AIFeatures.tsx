import React, { useState, useEffect } from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext';
import AIPortfolioInsights from './ai/AIPortfolioInsights';
import AIStockForecast from './ai/AIStockForecast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AIFeatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('insights');
  const { isLoading } = useManualAccounts();
  
  // Auto-generate insights when tab is first opened
  const [autoGeneratedInsights, setAutoGeneratedInsights] = useState(false);
  
  useEffect(() => {
    // Only auto-generate once and after accounts have loaded
    if (!isLoading && !autoGeneratedInsights) {
      setAutoGeneratedInsights(true);
    }
  }, [isLoading, autoGeneratedInsights]);
  
  return (
    <div className="space-y-6 py-6">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
        AI-Powered Portfolio Analysis
      </h2>
      
      <Tabs 
        defaultValue="insights" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="bg-[#1B2B4B] border-b border-gray-700 w-full justify-start">
          <TabsTrigger 
            value="insights" 
            className="data-[state=active]:bg-[#2A3C61] data-[state=active]:text-white"
          >
            Portfolio Insights
          </TabsTrigger>
          <TabsTrigger 
            value="forecast" 
            className="data-[state=active]:bg-[#2A3C61] data-[state=active]:text-white"
          >
            Stock Forecasts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="mt-6">
          <AIPortfolioInsights />
        </TabsContent>
        
        <TabsContent value="forecast" className="mt-6">
          <AIStockForecast />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIFeatures; 