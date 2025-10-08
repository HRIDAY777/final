import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useResponsive } from '../../hooks/useResponsive';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  mobile?: boolean; // Show on mobile
  tablet?: boolean; // Show on tablet
  desktop?: boolean; // Show on desktop
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  sortable?: boolean;
  className?: string;
  emptyMessage?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  onRowClick,
  sortable = false,
  className = '',
  emptyMessage = 'No data available',
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Filter columns based on screen size
  const visibleColumns = columns.filter(column => {
    if (isMobile) return column.mobile !== false;
    if (isTablet) return column.tablet !== false;
    return column.desktop !== false;
  });

  const handleSort = (key: string) => {
    if (!sortable) return;

    setSortConfig(prev => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  if (data.length === 0) {
    return (
      <div className={`empty-state ${className}`}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className={`space-y-4 ${className}`}>
        {sortedData.map((row, index) => (
          <div
            key={index}
            className={`card-compact cursor-pointer transition-all duration-200 hover:shadow-medium ${
              onRowClick ? 'hover:bg-gray-50' : ''
            }`}
            onClick={() => onRowClick?.(row)}
          >
            {visibleColumns.map((column) => (
              <div key={column.key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span className="font-medium text-gray-600 text-sm">{column.label}:</span>
                <span className="text-gray-900 text-sm">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`table-responsive ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {visibleColumns.map((column) => (
              <th
                key={column.key}
                className={`
                  px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider
                  ${column.sortable && sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
                `}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && sortable && (
                    <div className="flex flex-col">
                      <ChevronUpIcon
                        className={`w-3 h-3 ${
                          sortConfig?.key === column.key && sortConfig?.direction === 'asc'
                            ? 'text-blue-600'
                            : 'text-gray-400'
                        }`}
                      />
                      <ChevronDownIcon
                        className={`w-3 h-3 -mt-1 ${
                          sortConfig?.key === column.key && sortConfig?.direction === 'desc'
                            ? 'text-blue-600'
                            : 'text-gray-400'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, index) => (
            <tr
              key={index}
              className={`
                transition-all duration-200
                ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              `}
              onClick={() => onRowClick?.(row)}
            >
              {visibleColumns.map((column) => (
                <td
                  key={column.key}
                  className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900"
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResponsiveTable;
