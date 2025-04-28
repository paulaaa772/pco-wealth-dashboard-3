'use client'

import React, { useState } from 'react';
import {
  PlusCircle,
  CheckSquare,
  Flag,
  LineChart,
  RefreshCw,
  Download,
} from 'lucide-react';

// Data for investment goals
// This should ideally be fetched or managed via state/context
const getGoalsData = () => {
  return {
    investmentGoals: [
      {
        id: 'goal-1',
        name: 'Retirement',
        target: 1500000,
        current: 678450.33,
        targetDate: '2045-01-01',
        monthlyContribution: 1500,
        expectedReturn: 7.5,
        priority: 'high',
        type: 'retirement',
        description: 'Save for comfortable retirement with annual income of $80,000'
      },
      {
        id: 'goal-2',
        name: 'House Down Payment',
        target: 100000,
        current: 48750.25,
        targetDate: '2025-06-01',
        monthlyContribution: 2000,
        expectedReturn: 4.2,
        priority: 'high',
        type: 'purchase',
        description: 'Save for 20% down payment on a $500,000 home'
      },
      {
        id: 'goal-3',
        name: 'Education Fund',
        target: 180000,
        current: 25400.75,
        targetDate: '2035-08-01',
        monthlyContribution: 500,
        expectedReturn: 6.0,
        priority: 'medium',
        type: 'education',
        description: 'College fund for my daughter'
      },
      {
        id: 'goal-4',
        name: 'Emergency Fund',
        target: 30000,
        current: 18500.00,
        targetDate: '2024-12-31',
        monthlyContribution: 1000,
        expectedReturn: 2.5,
        priority: 'high',
        type: 'safety',
        description: '6 months of living expenses'
      }
    ],
    milestones: [
       {
        id: 'milestone-1',
        goalId: 'goal-1',
        name: 'First $100,000',
        target: 100000,
        completed: true,
        completedDate: '2020-05-15',
        description: 'Reached first $100K milestone'
      },
       {
        id: 'milestone-2',
        goalId: 'goal-1',
        name: 'Quarter Million',
        target: 250000,
        completed: true,
        completedDate: '2022-01-08',
        description: 'Reached $250K milestone'
      },
       {
        id: 'milestone-3',
        goalId: 'goal-1',
        name: 'Half Million',
        target: 500000,
        completed: true,
        completedDate: '2023-11-22',
        description: 'Reached $500K milestone'
      },
       {
        id: 'milestone-4',
        goalId: 'goal-1',
        name: 'Million Dollar Portfolio',
        target: 1000000,
        completed: false,
        projectedDate: '2030-03-15',
        description: 'Become a millionaire'
      },
       {
        id: 'milestone-5',
        goalId: 'goal-2',
        name: 'Halfway to Down Payment',
        target: 50000,
        completed: false,
        projectedDate: '2024-09-22',
        description: 'Reach 50% of down payment goal'
      }
    ],
    performanceTargets: [
       {
        id: 'perf-1',
        name: 'Annual Return',
        target: 8.0,
        current: 7.2,
        description: 'Target annual return for overall portfolio'
      },
       {
        id: 'perf-2',
        name: 'Savings Rate',
        target: 25,
        current: 22,
        description: 'Percentage of income saved for investments'
      },
       {
        id: 'perf-3',
        name: 'Expense Ratio',
        target: 0.25,
        current: 0.32,
        description: 'Average expense ratio for portfolio'
      }
    ]
  };
};

// Goals Content component
const GoalsTab = () => {
  const goalsData = getGoalsData(); 
  const [activeGoalTab, setActiveGoalTab] = useState('goals');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  
  // Calculate goal progress percentage
  const calculateProgress = (current: number, target: number) => {
    if (target <= 0) return 0; // Avoid division by zero
    return Math.min(Math.round((current / target) * 100), 100);
  };
  
  // Calculate projected end value
  const calculateProjection = (goal: any) => {
    const currentDate = new Date();
    const targetDate = new Date(goal.targetDate);
    
    const monthsRemaining = 
      (targetDate.getFullYear() - currentDate.getFullYear()) * 12 + 
      (targetDate.getMonth() - currentDate.getMonth());
    
    if (monthsRemaining <= 0) return goal.current;
    
    const monthlyRate = (1 + goal.expectedReturn / 100) ** (1 / 12) - 1;
    
    let futureValue = goal.current;
    for (let i = 0; i < monthsRemaining; i++) {
      futureValue = futureValue * (1 + monthlyRate) + goal.monthlyContribution;
    }
    
    return Math.round(futureValue);
  };
  
  // Calculate projected completion date
  const calculateCompletionDate = (goal: any) => {
    if (goal.current >= goal.target) return 'Completed';
    
    const currentDate = new Date();
    const targetDate = new Date(goal.targetDate);
    const projectedValue = calculateProjection(goal);
    
    if (projectedValue >= goal.target) {
      const monthlyRate = (1 + goal.expectedReturn / 100) ** (1 / 12) - 1;
      let futureValue = goal.current;
      let months = 0;
      
      while (futureValue < goal.target && months < 600) { // Cap at 50 years
        futureValue = futureValue * (1 + monthlyRate) + goal.monthlyContribution;
        months++;
      }
      
      const completionDate = new Date(currentDate);
      completionDate.setMonth(completionDate.getMonth() + months);
      
      return completionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    } else {
      return 'Beyond target date';
    }
  };
  
  // Calculate how much additional monthly contribution is needed
  const calculateRequiredContribution = (goal: any) => {
    if (goal.current >= goal.target) return 0;
    
    const currentDate = new Date();
    const targetDate = new Date(goal.targetDate);
    
    const monthsRemaining = 
      (targetDate.getFullYear() - currentDate.getFullYear()) * 12 + 
      (targetDate.getMonth() - currentDate.getMonth());
    
    if (monthsRemaining <= 0) {
      return Math.max(0, Math.ceil((goal.target - goal.current) / 12));
    }
    
    const monthlyRate = (1 + goal.expectedReturn / 100) ** (1 / 12) - 1;
    
    const futureValueNeeded = goal.target - goal.current * (1 + monthlyRate) ** monthsRemaining;
    
    if (monthlyRate === 0) { // Handle zero interest rate case
      return Math.max(0, Math.ceil(futureValueNeeded / monthsRemaining));
    }

    const denominator = ((1 + monthlyRate) ** monthsRemaining - 1) / monthlyRate;
    
    if (denominator === 0) { // Avoid division by zero if denominator is somehow zero
        return Math.max(0, goal.target - goal.current > 0 ? Infinity : 0); // Or handle appropriately
    }
    
    const requiredContribution = Math.max(0, Math.ceil(futureValueNeeded / denominator));
    
    return requiredContribution;
  };
  
  return (
    <div className="bg-[#172033] text-white p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Investment Goals</h2>
        <div className="flex space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
            <PlusCircle className="h-4 w-4 inline mr-1" />
            Add New Goal
          </button>
        </div>
      </div>
      
      {/* Goal Navigation Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveGoalTab('goals')}
            className={`pb-4 ${ 
              activeGoalTab === 'goals'
                ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Goals
          </button>
          <button
            onClick={() => setActiveGoalTab('milestones')}
            className={`pb-4 ${ 
              activeGoalTab === 'milestones'
                ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Milestones
          </button>
          <button
            onClick={() => setActiveGoalTab('performance')}
            className={`pb-4 ${ 
              activeGoalTab === 'performance'
                ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Performance Targets
          </button>
        </div>
      </div>
      
      {/* Goals Tab Content */}
      {activeGoalTab === 'goals' && (
        <div className="space-y-8">
          {/* Goals Summary */} 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1D2939] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Total Goals</h3>
                <span className="bg-blue-900/30 text-blue-400 rounded-full px-3 py-1 text-sm font-medium">
                  {goalsData.investmentGoals.length}
                </span>
              </div>
              <div className="text-3xl font-bold mb-1">
                ${goalsData.investmentGoals.reduce((sum: any, goal: any) => sum + goal.target, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Combined target amount</div>
            </div>

            <div className="bg-[#1D2939] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Current Progress</h3>
                <span className="bg-green-900/30 text-green-400 rounded-full px-3 py-1 text-sm font-medium">
                  {Math.round(goalsData.investmentGoals.reduce((sum: any, goal: any) => sum + goal.current, 0) / 
                  goalsData.investmentGoals.reduce((sum: any, goal: any) => sum + goal.target, 1) * 100)}%
                </span>
              </div>
              <div className="text-3xl font-bold mb-1">
                ${goalsData.investmentGoals.reduce((sum: any, goal: any) => sum + goal.current, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Combined current amount</div>
            </div>
            
            <div className="bg-[#1D2939] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Monthly Contributions</h3>
                <span className="bg-purple-900/30 text-purple-400 rounded-full px-3 py-1 text-sm font-medium">
                  Active
                </span>
              </div>
              <div className="text-3xl font-bold mb-1">
                ${goalsData.investmentGoals.reduce((sum: any, goal: any) => sum + goal.monthlyContribution, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total monthly investment</div>
            </div>
          </div>
          
          {/* Goals List */} 
          <div className="bg-[#1D2939] rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold">Your Investment Goals</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {goalsData.investmentGoals.map((goal: any) => { 
                  const progress = calculateProgress(goal.current, goal.target);
                  const projectedValue = calculateProjection(goal);
                  const projectedPercent = calculateProgress(projectedValue, goal.target);
                  const projectedDate = calculateCompletionDate(goal);
                  const progressColor = progress < 25 ? 'bg-red-500' : progress < 50 ? 'bg-yellow-500' : progress < 75 ? 'bg-blue-500' : 'bg-green-500';
                  const projectedColor = projectedPercent < 25 ? 'bg-red-500/40' : projectedPercent < 50 ? 'bg-yellow-500/40' : projectedPercent < 75 ? 'bg-blue-500/40' : 'bg-green-500/40';
                  
                  return (
                    <div 
                      key={goal.id} 
                      className="bg-[#2D3748] rounded-lg p-5 hover:bg-[#353f53] transition-colors cursor-pointer"
                      onClick={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-medium text-white">{goal.name}</h4>
                          <div className="text-sm text-gray-400 mt-1">Target: ${goal.target.toLocaleString()} by {new Date(goal.targetDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">${goal.current.toLocaleString()}</div>
                          <div className="text-sm text-gray-400">Current value</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */} 
                      <div className="mt-4 mb-2">
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1 overflow-hidden">
                          {/* Actual progress */} 
                          <div
                            className={`h-2.5 rounded-full ${progressColor}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                          {/* Projected progress (if greater than actual) */} 
                          {projectedPercent > progress && (
                            <div
                              className={`h-2.5 rounded-r-full ${projectedColor} -mt-2.5`}
                              style={{ 
                                width: `${projectedPercent - progress}%`, 
                                marginLeft: `${progress}%` 
                              }}
                            ></div>
                          )}
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{progress}% funded</span>
                          <span>Projected: {projectedPercent}%</span>
                        </div>
                      </div>
                      
                      {/* Additional details when expanded */} 
                      {selectedGoal === goal.id && (
                        <div className="mt-6 pt-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-gray-400">Target Date</div>
                                <div className="font-medium">{new Date(goal.targetDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-400">Priority</div>
                                <div className="font-medium capitalize">{goal.priority}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-400">Monthly Contribution</div>
                                <div className="font-medium">${goal.monthlyContribution.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-400">Expected Return</div>
                                <div className="font-medium">{goal.expectedReturn}%</div>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <div className="text-sm text-gray-400 mb-1">Description</div>
                              <p className="text-gray-300">{goal.description}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="text-sm text-gray-400 mb-1">Projected Completion</div>
                              <div className="font-medium">{projectedDate}</div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-gray-400 mb-1">Projected Value at Target Date</div>
                              <div className="font-medium">${projectedValue.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">
                                {projectedValue >= goal.target ? 
                                  `+$${(projectedValue - goal.target).toLocaleString()} over target` : 
                                  `-$${(goal.target - projectedValue).toLocaleString()} under target`}
                              </div>
                            </div>
                            
                            {projectedValue < goal.target && (
                              <div>
                                <div className="text-sm text-gray-400 mb-1">Recommended Monthly Contribution</div>
                                <div className="font-medium text-amber-400">
                                  ${calculateRequiredContribution(goal).toLocaleString()}
                                  <span className="text-gray-400 text-xs ml-2">
                                    (+${(calculateRequiredContribution(goal) - goal.monthlyContribution).toLocaleString()})
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            <div className="pt-2 flex space-x-2">
                              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded">
                                Edit Goal
                              </button>
                              <button className="px-3 py-1.5 bg-transparent hover:bg-gray-700 text-gray-300 border border-gray-600 text-sm rounded">
                                Add Milestone
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Milestones Tab Content */} 
      {activeGoalTab === 'milestones' && (
        <div className="space-y-8">
          <div className="bg-[#1D2939] rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold">Milestones & Achievements</h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-4">Completed Milestones</h4>
                <div className="space-y-4">
                  {goalsData.milestones
                    .filter((milestone: any) => milestone.completed)
                    .map((milestone: any) => {
                      const relatedGoal = goalsData.investmentGoals.find((g: any) => g.id === milestone.goalId);
                      return (
                        <div key={milestone.id} className="bg-[#2D3748] rounded-lg p-4 flex items-center">
                          <div className="h-10 w-10 rounded-full bg-green-900/30 text-green-400 flex items-center justify-center mr-4">
                            <CheckSquare className="h-5 w-5" />
                          </div>
                          <div className="flex-grow">
                            <h5 className="font-medium text-white">{milestone.name}</h5>
                            <div className="text-sm text-gray-400">For goal: {relatedGoal?.name || 'Unknown'}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${milestone.target.toLocaleString()}</div>
                            <div className="text-xs text-green-400">
                              Completed {milestone.completedDate && new Date(milestone.completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-4">Upcoming Milestones</h4>
                <div className="space-y-4">
                  {goalsData.milestones
                    .filter((milestone: any) => !milestone.completed)
                    .map((milestone: any) => {
                      const relatedGoal = goalsData.investmentGoals.find((g: any) => g.id === milestone.goalId);
                      const currentValue = relatedGoal?.current || 0;
                      const progress = calculateProgress(currentValue, milestone.target);
                      
                      return (
                        <div key={milestone.id} className="bg-[#2D3748] rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <div className="h-10 w-10 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center mr-4">
                              <Flag className="h-5 w-5" />
                            </div>
                            <div className="flex-grow">
                              <h5 className="font-medium text-white">{milestone.name}</h5>
                              <div className="text-sm text-gray-400">For goal: {relatedGoal?.name || 'Unknown'}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${milestone.target.toLocaleString()}</div>
                              <div className="text-xs text-blue-400">Expected {milestone.projectedDate}</div>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                              <div
                                className="h-2 rounded-full bg-blue-500"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>${currentValue.toLocaleString()} current</span>
                              <span>{progress}% progress</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Performance Targets Tab Content */} 
      {activeGoalTab === 'performance' && (
        <div className="space-y-8">
          <div className="bg-[#1D2939] rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold">Portfolio Performance Targets</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {goalsData.performanceTargets.map((target: any) => { 
                  const progress = target.target > 0 ? (target.current / target.target) * 100 : 0;
                  const isOnTarget = target.current >= target.target;
                  const progressColor = isOnTarget ? 'bg-green-500' : 'bg-amber-500';
                  
                  return (
                    <div key={target.id} className="bg-[#2D3748] rounded-lg p-5">
                      <h4 className="text-lg font-medium text-white mb-3">{target.name}</h4>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <div className="text-3xl font-bold">{target.current}%</div>
                          <div className="text-sm text-gray-400">Current</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-medium">{target.target}%</div>
                          <div className="text-sm text-gray-400">Target</div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                          <div
                            className={`h-2 rounded-full ${progressColor}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {isOnTarget ? 'On target' : `${Math.round(progress)}% of target`}
                        </div>
                      </div>
                      
                      <div className="mt-4 text-sm text-gray-300">
                        {target.description}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-[#2D3748] rounded-lg p-6">
                <h4 className="text-lg font-medium mb-4">Performance Optimization Recommendations</h4>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center mr-3 mt-0.5">
                      <LineChart className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white mb-1">Consider rebalancing your portfolio</h5>
                      <p className="text-sm text-gray-300">Your portfolio has drifted 5.2% from your target allocation. A rebalance could improve your risk-adjusted returns.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-amber-900/30 text-amber-400 flex items-center justify-center mr-3 mt-0.5">
                      <RefreshCw className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white mb-1">Review high expense ratio funds</h5>
                      <p className="text-sm text-gray-300">You could save approximately $420 per year by switching to lower-cost index funds in your retirement accounts.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-green-900/30 text-green-400 flex items-center justify-center mr-3 mt-0.5">
                      <Download className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white mb-1">Increase your savings rate</h5>
                      <p className="text-sm text-gray-300">Increasing your savings rate from 22% to 25% would allow you to reach your retirement goal 2.5 years earlier.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsTab; 