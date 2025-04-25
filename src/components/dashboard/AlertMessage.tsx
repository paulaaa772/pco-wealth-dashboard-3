import React from 'react';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';

export type AlertType = 'success' | 'warning' | 'error' | 'info';

interface AlertMessageProps {
  type: AlertType;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ 
  type, 
  message, 
  onDismiss,
  className = '' 
}) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error':
        return 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'info':
      default:
        return 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-5 w-5" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className={`rounded-md p-4 ${getAlertStyles()} ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm">{message}</p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex bg-transparent rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <span className="sr-only">Dismiss</span>
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertMessage; 