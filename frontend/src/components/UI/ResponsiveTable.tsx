import React from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
  mobileHidden?: boolean;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  keyField?: string;
  onRowClick?: (row: any) => void;
  className?: string;
  emptyMessage?: string;
}

/**
 * 100% Responsive Table Component
 * - Desktop: Traditional table layout
 * - Tablet: Compact table
 * - Mobile: Card-based layout with labels
 */
const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  keyField = 'id',
  onRowClick,
  className = '',
  emptyMessage = 'No data available'
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 md:py-16 text-gray-500">
        <p className="text-sm sm:text-base md:text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop & Tablet Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 lg:px-6 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, idx) => (
              <tr
                key={row[keyField] || idx}
                onClick={() => onRowClick?.(row)}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.map((row, idx) => (
          <div
            key={row[keyField] || idx}
            onClick={() => onRowClick?.(row)}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${
              onRowClick ? 'active:scale-98 cursor-pointer' : ''
            } transition-all`}
          >
            {columns.map((column) => {
              if (column.mobileHidden) return null;
              
              return (
                <div key={column.key} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                  <span className="text-xs font-semibold text-gray-600 flex-shrink-0 mr-3">
                    {column.label}
                  </span>
                  <span className="text-sm text-gray-900 text-right">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
};

export default ResponsiveTable;
