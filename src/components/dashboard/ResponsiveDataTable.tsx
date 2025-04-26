'use client';

import React, { useState } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  isSortable?: boolean;
  isMobileVisible?: boolean;
}

interface ResponsiveDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  darkMode?: boolean;
  defaultSortField?: keyof T;
  defaultSortDirection?: 'asc' | 'desc';
}

function ResponsiveDataTable<T>({
  data,
  columns,
  keyField,
  onRowClick,
  emptyMessage = "No data available",
  darkMode = false,
  defaultSortField,
  defaultSortDirection = 'desc'
}: ResponsiveDataTableProps<T>) {
  const [sortField, setSortField] = useState<keyof T | null>(defaultSortField || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  
  // Handle sorting
  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortField) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === bValue) return 0;
      
      // Handle nulls and undefined
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      const compareResult = 
        typeof aValue === 'string' && typeof bValue === 'string'
          ? aValue.localeCompare(bValue)
          : aValue < bValue 
            ? -1 
            : 1;
            
      return sortDirection === 'asc' ? compareResult : -compareResult;
    });
  }, [data, sortField, sortDirection]);
  
  // Get cell value (handle function accessors)
  const getCellValue = (row: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor] as React.ReactNode;
  };
  
  // Get visible columns for mobile
  const mobileVisibleColumns = columns.filter(column => 
    column.isMobileVisible !== false
  );
  
  // CSS classes based on dark mode
  const tableClass = darkMode 
    ? "min-w-full divide-y divide-gray-700" 
    : "min-w-full divide-y divide-gray-200";
    
  const headerClass = darkMode 
    ? "bg-gray-800/50" 
    : "bg-gray-50";
    
  const headerCellClass = darkMode 
    ? "px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider" 
    : "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
    
  const rowClass = darkMode 
    ? "hover:bg-gray-800/30" 
    : "hover:bg-gray-50";
    
  const cellClass = darkMode 
    ? "px-4 py-4 whitespace-nowrap text-sm text-gray-300" 
    : "px-4 py-4 whitespace-nowrap text-sm text-gray-500";
    
  const sortIconClass = darkMode 
    ? "ml-1 text-gray-400" 
    : "ml-1 text-gray-500";
    
  const emptyMessageClass = darkMode 
    ? "text-center py-8 text-gray-400" 
    : "text-center py-8 text-gray-500";
    
  const mobileCardClass = darkMode 
    ? "bg-gray-800/30 rounded-lg p-4 mb-4" 
    : "bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200";

  return (
    <div>
      {/* Desktop version - Regular table */}
      <div className="hidden md:block overflow-x-auto">
        <table className={tableClass}>
          <thead className={headerClass}>
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  className={`${headerCellClass} ${column.className || ''}`}
                  onClick={() => column.isSortable && typeof column.accessor === 'string' && handleSort(column.accessor)}
                  style={column.isSortable ? { cursor: 'pointer' } : undefined}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.isSortable && sortField === column.accessor && (
                      <span className={sortIconClass}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedData.length > 0 ? (
              sortedData.map(row => (
                <tr 
                  key={String(row[keyField])} 
                  className={rowClass}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={onRowClick ? { cursor: 'pointer' } : undefined}
                >
                  {columns.map((column, cellIndex) => (
                    <td 
                      key={cellIndex} 
                      className={`${cellClass} ${column.className || ''}`}
                    >
                      {getCellValue(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className={emptyMessageClass}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile version - Card-based layout */}
      <div className="md:hidden">
        {sortedData.length > 0 ? (
          sortedData.map(row => (
            <div 
              key={String(row[keyField])} 
              className={mobileCardClass}
              onClick={() => onRowClick && onRowClick(row)}
              style={onRowClick ? { cursor: 'pointer' } : undefined}
            >
              {mobileVisibleColumns.map((column, index) => (
                <div key={index} className="flex justify-between py-1 border-b border-gray-700 last:border-b-0">
                  <span className="text-xs font-medium text-gray-400">{column.header}</span>
                  <span className="text-sm text-right">{getCellValue(row, column)}</span>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className={emptyMessageClass}>{emptyMessage}</div>
        )}
      </div>
    </div>
  );
}

export default ResponsiveDataTable; 