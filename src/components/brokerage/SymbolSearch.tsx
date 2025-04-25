import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SymbolSearchProps {
  onSymbolSelect: (symbol: string) => void;
  defaultSymbol?: string;
}

// Extended list of popular stock symbols with names
const popularSymbols = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'PG', name: 'Procter & Gamble Co.' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.' },
  { symbol: 'HD', name: 'Home Depot Inc.' },
  { symbol: 'BAC', name: 'Bank of America Corp.' },
  { symbol: 'MA', name: 'Mastercard Inc.' },
  { symbol: 'DIS', name: 'Walt Disney Co.' },
  { symbol: 'ADBE', name: 'Adobe Inc.' },
  { symbol: 'PFE', name: 'Pfizer Inc.' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'XOM', name: 'Exxon Mobil Corp.' },
  { symbol: 'INTC', name: 'Intel Corporation' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.' },
  { symbol: 'CMCSA', name: 'Comcast Corporation' },
  { symbol: 'PEP', name: 'PepsiCo Inc.' }
];

const SymbolSearch: React.FC<SymbolSearchProps> = ({ 
  onSymbolSelect, 
  defaultSymbol = 'AAPL' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (symbol: string) => {
    console.log(`Selected symbol: ${symbol}`);
    setSelectedSymbol(symbol);
    setSearchTerm('');
    setIsOpen(false);
    onSymbolSelect(symbol);
    
    // Focus back on the input after selection
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Filter symbols based on search term
  const filteredSymbols = popularSymbols.filter(item => 
    item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={`Search (${selectedSymbol})`}
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {searchTerm ? (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Search Results</div>
              {filteredSymbols.length > 0 ? (
                <div className="space-y-1">
                  {filteredSymbols.map(item => (
                    <div
                      key={item.symbol}
                      className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded"
                      onClick={() => handleSelect(item.symbol)}
                    >
                      <div className="font-medium">{item.symbol}</div>
                      <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">{item.name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No results found
                </div>
              )}
            </div>
          ) : (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Popular Symbols</div>
              <div className="grid grid-cols-2 gap-1">
                {popularSymbols.slice(0, 10).map(item => (
                  <div
                    key={item.symbol}
                    className={`flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded ${
                      item.symbol === selectedSymbol 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                        : ''
                    }`}
                    onClick={() => handleSelect(item.symbol)}
                  >
                    <div className="font-medium mr-2">{item.symbol}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SymbolSearch; 