'use client';

import React, { useState, useMemo } from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { format, addMonths, addYears, differenceInMonths } from 'date-fns';

// Define interfaces for our goals
interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  color: string;
  category: 'retirement' | 'education' | 'major_purchase' | 'emergency' | 'other';
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: Date;
  completed: boolean;
}

interface ProjectedDataPoint {
  date: string;
  amount: number;
  goal?: number;
}

// Generate sample goals for demonstration
const generateSampleGoals = (): FinancialGoal[] => {
  return [
    {
      id: '1',
      name: 'Retirement Fund',
      targetAmount: 1000000,
      currentAmount: 350000,
      targetDate: addYears(new Date(), 15),
      color: '#4F46E5',
      category: 'retirement',
      milestones: [
        {
          id: '1-1',
          name: 'Initial 401k Match',
          targetAmount: 50000,
          targetDate: addYears(new Date(), -2),
          completed: true
        },
        {
          id: '1-2',
          name: 'Emergency Buffer',
          targetAmount: 300000,
          targetDate: addYears(new Date(), -1),
          completed: true
        },
        {
          id: '1-3',
          name: 'Mid-career Goal',
          targetAmount: 500000,
          targetDate: addYears(new Date(), 5),
          completed: false
        },
        {
          id: '1-4',
          name: 'Pre-retirement Target',
          targetAmount: 750000,
          targetDate: addYears(new Date(), 10),
          completed: false
        }
      ]
    },
    {
      id: '2',
      name: 'Home Down Payment',
      targetAmount: 100000,
      currentAmount: 42000,
      targetDate: addYears(new Date(), 2),
      color: '#10B981',
      category: 'major_purchase',
      milestones: [
        {
          id: '2-1',
          name: 'Initial Savings',
          targetAmount: 10000,
          targetDate: addYears(new Date(), -1),
          completed: true
        },
        {
          id: '2-2',
          name: 'Half-way Point',
          targetAmount: 50000,
          targetDate: addMonths(new Date(), 6),
          completed: false
        }
      ]
    },
    {
      id: '3',
      name: 'Children\'s Education',
      targetAmount: 120000,
      currentAmount: 15000,
      targetDate: addYears(new Date(), 10),
      color: '#F59E0B',
      category: 'education',
      milestones: [
        {
          id: '3-1',
          name: 'Initial 529 Plan',
          targetAmount: 10000,
          targetDate: addYears(new Date(), -1),
          completed: true
        },
        {
          id: '3-2',
          name: 'Elementary Education Fund',
          targetAmount: 30000,
          targetDate: addYears(new Date(), 2),
          completed: false
        },
        {
          id: '3-3',
          name: 'High School Preparation',
          targetAmount: 60000,
          targetDate: addYears(new Date(), 5),
          completed: false
        }
      ]
    }
  ];
};

// Calculate projection data for charts
const generateProjectionData = (goal: FinancialGoal): ProjectedDataPoint[] => {
  const data: ProjectedDataPoint[] = [];
  const today = new Date();
  
  // Calculate monthly contribution needed
  const monthsRemaining = differenceInMonths(goal.targetDate, today);
  const amountRemaining = goal.targetAmount - goal.currentAmount;
  const monthlyContribution = monthsRemaining > 0 ? amountRemaining / monthsRemaining : 0;
  
  // Generate projected data points
  let currentDate = new Date();
  let currentAmount = goal.currentAmount;
  
  // Start with historical data (mock for demo)
  for (let i = 12; i > 0; i--) {
    const historyDate = addMonths(today, -i);
    const historicalAmount = goal.currentAmount * (1 - (i / 24)); // Simplified mock history
    
    data.push({
      date: format(historyDate, 'yyyy-MM-dd'),
      amount: Math.max(0, historicalAmount),
      goal: goal.targetAmount
    });
  }
  
  // Add current point
  data.push({
    date: format(currentDate, 'yyyy-MM-dd'),
    amount: currentAmount,
    goal: goal.targetAmount
  });
  
  // Add future projections
  for (let i = 1; i <= Math.min(60, monthsRemaining); i++) {
    currentDate = addMonths(today, i);
    currentAmount += monthlyContribution;
    
    data.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      amount: currentAmount,
      goal: goal.targetAmount
    });
    
    // Stop if we've reached the target date
    if (currentDate >= goal.targetDate) break;
  }
  
  return data;
};

// Generate recommendations based on goal progress
const generateRecommendations = (goal: FinancialGoal): string[] => {
  const recommendations: string[] = [];
  const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
  const today = new Date();
  const monthsRemaining = differenceInMonths(goal.targetDate, today);
  const amountRemaining = goal.targetAmount - goal.currentAmount;
  const monthlyContribution = monthsRemaining > 0 ? amountRemaining / monthsRemaining : 0;
  
  // Basic recommendations based on progress
  if (progressPercentage < 25) {
    recommendations.push(`Consider increasing monthly contributions to $${Math.ceil(monthlyContribution)} to stay on track`);
    recommendations.push('Explore automatic contribution increases to accelerate progress');
  } else if (progressPercentage < 50) {
    recommendations.push(`You're making good progress! A monthly contribution of $${Math.ceil(monthlyContribution)} will keep you on track`);
    recommendations.push('Review your investment allocation to ensure it aligns with your timeline');
  } else if (progressPercentage < 75) {
    recommendations.push(`You're well on your way! Continue with $${Math.ceil(monthlyContribution)} monthly to reach your goal`);
    recommendations.push('Consider if your target amount is still adequate for your needs');
  } else {
    recommendations.push('You\'re almost there! Start planning for how you\'ll utilize these funds');
    recommendations.push('Consider if you should increase your target based on current financial conditions');
  }
  
  // Category-specific recommendations
  switch (goal.category) {
    case 'retirement':
      recommendations.push('Ensure you\'re maximizing tax-advantaged retirement accounts');
      break;
    case 'education':
      recommendations.push('Look into tax-advantaged 529 plans for education savings');
      break;
    case 'major_purchase':
      recommendations.push('Consider a high-yield savings account for short-term goals');
      break;
    case 'emergency':
      recommendations.push('Keep emergency funds accessible in liquid investments');
      break;
  }
  
  return recommendations;
};

export default function GoalTrackingDashboard() {
  const { manualAccounts, isLoading } = useManualAccounts();
  const [goals, setGoals] = useState<FinancialGoal[]>(generateSampleGoals());
  const [selectedGoalId, setSelectedGoalId] = useState<string>(goals[0]?.id || '');
  
  // Calculate total portfolio value from accounts
  const totalPortfolioValue = useMemo(() => {
    return manualAccounts.reduce((sum, account) => sum + account.totalValue, 0);
  }, [manualAccounts]);
  
  // Get the selected goal
  const selectedGoal = goals.find(goal => goal.id === selectedGoalId) || goals[0];
  
  // Generate projection data for the selected goal
  const projectionData = useMemo(() => {
    if (!selectedGoal) return [];
    return generateProjectionData(selectedGoal);
  }, [selectedGoal]);
  
  // Generate recommendations for the selected goal
  const recommendations = useMemo(() => {
    if (!selectedGoal) return [];
    return generateRecommendations(selectedGoal);
  }, [selectedGoal]);
  
  // Calculate if the goal is on track
  const isOnTrack = useMemo(() => {
    if (!selectedGoal) return false;
    
    const today = new Date();
    const totalDuration = differenceInMonths(selectedGoal.targetDate, new Date(2020, 0, 1)); // Assuming start date
    const elapsedDuration = differenceInMonths(today, new Date(2020, 0, 1));
    const expectedProgress = elapsedDuration / totalDuration;
    const actualProgress = selectedGoal.currentAmount / selectedGoal.targetAmount;
    
    return actualProgress >= expectedProgress;
  }, [selectedGoal]);
  
  if (isLoading) {
    return (
      <div className="bg-[#1E2D4E] rounded-lg p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[#1E2D4E] rounded-lg p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Financial Goals</h2>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white">
            Add New Goal
          </button>
        </div>
        
        {/* Goal Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map(goal => (
            <div 
              key={goal.id}
              onClick={() => setSelectedGoalId(goal.id)}
              className={`cursor-pointer p-4 rounded-lg border-2 ${
                selectedGoalId === goal.id 
                  ? `border-${goal.color.replace('#', '')} bg-opacity-20 bg-[${goal.color}]` 
                  : 'border-gray-700 bg-[#2A3C61]'
              }`}
            >
              <h3 className="font-semibold text-lg">{goal.name}</h3>
              <div className="mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-medium">{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                  <div 
                    className="h-2.5 rounded-full" 
                    style={{
                      width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%`,
                      backgroundColor: goal.color
                    }}
                  ></div>
                </div>
              </div>
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-gray-400">Current</span>
                <span className="font-medium">${goal.currentAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Target</span>
                <span className="font-medium">${goal.targetAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-400">Target Date</span>
                <span className="font-medium">{format(goal.targetDate, 'MMM yyyy')}</span>
              </div>
            </div>
          ))}
        </div>
        
        {selectedGoal && (
          <>
            {/* Goal Details & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#2A3C61] rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{selectedGoal.name} Projection</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isOnTrack ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'
                  }`}>
                    {isOnTrack ? 'On Track' : 'Needs Attention'}
                  </div>
                </div>
                
                {/* Projection Chart */}
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={selectedGoal.color} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={selectedGoal.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(new Date(date), 'MMM yyyy')}
                        stroke="#9CA3AF"
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                        stroke="#9CA3AF"
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F9FAFB' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                        labelFormatter={(date) => format(new Date(date), 'MMMM yyyy')}
                      />
                      <ReferenceLine 
                        y={selectedGoal.targetAmount} 
                        label={{ value: 'Target', position: 'right', fill: '#F9FAFB' }} 
                        stroke="#F9FAFB" 
                        strokeDasharray="3 3" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        name="Projected Amount" 
                        stroke={selectedGoal.color} 
                        fillOpacity={1}
                        fill="url(#colorAmount)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Current Status */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="p-3 bg-[#1E2D4E] rounded-lg">
                    <h4 className="text-sm text-gray-400">Current Amount</h4>
                    <p className="text-xl font-semibold mt-1">${selectedGoal.currentAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-[#1E2D4E] rounded-lg">
                    <h4 className="text-sm text-gray-400">Remaining</h4>
                    <p className="text-xl font-semibold mt-1">${(selectedGoal.targetAmount - selectedGoal.currentAmount).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-[#1E2D4E] rounded-lg">
                    <h4 className="text-sm text-gray-400">Target Date</h4>
                    <p className="text-xl font-semibold mt-1">{format(selectedGoal.targetDate, 'MMM yyyy')}</p>
                  </div>
                </div>
              </div>
              
              {/* Recommendations */}
              <div className="bg-[#2A3C61] rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
                <div className="space-y-4">
                  {recommendations.map((recommendation, index) => (
                    <div key={index} className="p-3 bg-[#1E2D4E] rounded-lg">
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
                
                {/* Monthly Contribution Needed */}
                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-400 mb-1">Suggested Monthly Contribution</h4>
                  <p className="text-2xl font-bold">
                    ${Math.ceil((selectedGoal.targetAmount - selectedGoal.currentAmount) / 
                      Math.max(1, differenceInMonths(selectedGoal.targetDate, new Date()))).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    to reach your goal by {format(selectedGoal.targetDate, 'MMMM yyyy')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Milestones */}
            <div className="bg-[#2A3C61] rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-4">Milestones</h3>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-700"></div>
                
                <div className="space-y-6">
                  {selectedGoal.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex items-start relative ml-6">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-6 mt-1.5 w-5 h-5 rounded-full border-2 ${
                        milestone.completed 
                          ? 'border-green-500 bg-green-500/20' 
                          : 'border-gray-600 bg-gray-800'
                      }`}></div>
                      
                      <div className={`flex-1 p-3 rounded-lg ${
                        milestone.completed ? 'bg-green-900/10 border border-green-800/30' : 'bg-[#1E2D4E]'
                      }`}>
                        <div className="flex justify-between">
                          <h4 className="font-medium">{milestone.name}</h4>
                          <span className={`text-sm font-medium ${
                            milestone.completed ? 'text-green-400' : 'text-gray-400'
                          }`}>
                            {milestone.completed ? 'Completed' : format(milestone.targetDate, 'MMM yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">Target: ${milestone.targetAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 