'use client';

import { Info } from 'lucide-react';

// Define props interface
interface PortfolioValueProps {
  value: number; // Accept the calculated value as a prop
}

export default function PortfolioValue({ value }: PortfolioValueProps) {
  // Use the passed value prop for display
  const formattedValue = value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const date = 'Jul 19, 2024'; // Keep date static for now, can be made dynamic later

  return (
    <div className="space-y-1">
      <h2 className="text-sm font-medium text-gray-400">Quantum Wealth Portfolio</h2>
      <div className="flex items-end gap-2">
        {/* Display the formatted value from props */}
        <p className="text-4xl font-light tracking-tight">{formattedValue}</p>
        <button className="mb-1 text-gray-500 hover:text-white">
          <Info size={18} />
        </button>
      </div>
      <p className="text-xs text-gray-500">Since {date}</p>
    </div>
  );
} 