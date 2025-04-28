import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityItem {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal' | 'dividend';
  symbol?: string;
  shares?: number;
  price?: number;
  amount: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'cancelled';
}

interface PortfolioActivityProps {
  activities: ActivityItem[];
}

export function PortfolioActivity({ activities }: PortfolioActivityProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'buy':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        );
      case 'sell':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </div>
        );
      case 'deposit':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0-16l-4 4m4-4l4 4" />
            </svg>
          </div>
        );
      case 'withdrawal':
        return (
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20V4m0 16l-4-4m4 4l4-4" />
            </svg>
          </div>
        );
      case 'dividend':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getActivityDescription = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'buy':
        return `Bought ${activity.shares} shares of ${activity.symbol} at ${formatCurrency(activity.price || 0)}`;
      case 'sell':
        return `Sold ${activity.shares} shares of ${activity.symbol} at ${formatCurrency(activity.price || 0)}`;
      case 'deposit':
        return 'Cash deposit';
      case 'withdrawal':
        return 'Cash withdrawal';
      case 'dividend':
        return `Dividend received from ${activity.symbol}`;
    }
  };

  const getStatusBadge = (status: ActivityItem['status']) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completed</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
      case 'cancelled':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Cancelled</span>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              {getActivityIcon(activity.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {getActivityDescription(activity)}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric'
                    })}
                  </p>
                  {getStatusBadge(activity.status)}
                </div>
              </div>
              <div className={`text-sm font-medium ${
                activity.type === 'withdrawal' ? 'text-red-600' : 
                activity.type === 'deposit' ? 'text-green-600' : 
                'text-gray-900'
              }`}>
                {activity.type === 'withdrawal' ? '-' : activity.type === 'deposit' ? '+' : ''}
                {formatCurrency(activity.amount)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 