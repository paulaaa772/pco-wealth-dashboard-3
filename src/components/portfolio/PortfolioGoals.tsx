import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Milestone {
  id: string;
  label: string;
  targetAmount: number;
  targetDate: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  currentAmount: number;
  targetAmount: number;
  startDate: string;
  targetDate: string;
  category: 'retirement' | 'savings' | 'investment' | 'education' | 'other';
  milestones: Milestone[];
}

interface PortfolioGoalsProps {
  goals: Goal[];
}

export function PortfolioGoals({ goals }: PortfolioGoalsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getTimeRemaining = (targetDate: string) => {
    const remaining = new Date(targetDate).getTime() - new Date().getTime();
    const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day left';
    if (days < 30) return `${days} days left`;
    if (days < 365) return `${Math.round(days / 30)} months left`;
    return `${Math.round(days / 365)} years left`;
  };

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'retirement':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'savings':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'investment':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'education':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            
            return (
              <div key={goal.id} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    goal.category === 'retirement' ? 'bg-purple-100 text-purple-600' :
                    goal.category === 'savings' ? 'bg-blue-100 text-blue-600' :
                    goal.category === 'investment' ? 'bg-green-100 text-green-600' :
                    goal.category === 'education' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getCategoryIcon(goal.category)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{goal.title}</h3>
                    <p className="text-sm text-gray-500">{goal.description}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span className="text-gray-500">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        progress >= 100 ? 'bg-green-500' :
                        progress >= 75 ? 'bg-blue-500' :
                        progress >= 50 ? 'bg-yellow-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{progress}% complete</span>
                    <span>{getTimeRemaining(goal.targetDate)}</span>
                  </div>
                </div>

                {/* Milestones */}
                {goal.milestones.length > 0 && (
                  <div className="pl-4 space-y-2">
                    {goal.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          milestone.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                        }`}>
                          {milestone.completed && (
                            <svg className="w-3 h-3 text-white mx-auto" viewBox="0 0 12 12">
                              <path
                                fill="currentColor"
                                d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{milestone.label}</p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(milestone.targetAmount)} by {new Date(milestone.targetDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 