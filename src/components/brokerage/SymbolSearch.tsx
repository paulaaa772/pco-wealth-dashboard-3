import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SymbolSearchProps {
  onSymbolSelect: (symbol: string) => void;
  defaultSymbol?: string;
}

const popularSymbols = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'TSLA', 'NVDA', 'META'];

const SymbolSearch: React.FC<SymbolSearchProps> = ({ 
  onSymbolSelect, 
  defaultSymbol = 'AAPL' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    setSelectedSymbol(symbol);
    setSearchTerm('');
    setIsOpen(false);
    onSymbolSelect(symbol);
  };

  // Filter symbols based on search term
  const filteredSymbols = popularSymbols.filter(symbol => 
    symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={`Search (${selectedSymbol})`}
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Popular Symbols</div>
            <div className="grid grid-cols-3 gap-1">
              {popularSymbols.map(symbol => (
                <button
                  key={symbol}
                  className={`text-left px-2 py-1 rounded-md text-sm ${
                    symbol === selectedSymbol 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => handleSelect(symbol)}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
          
          {searchTerm && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Search Results</div>
              {filteredSymbols.length > 0 ? (
                filteredSymbols.map(symbol => (
                  <button
                    key={symbol}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSelect(symbol)}
                  >
                    {symbol}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No results found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SymbolSearch; 