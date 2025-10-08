import React from 'react';

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void; // eslint-disable-line no-unused-vars
  right?: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({ searchPlaceholder = 'Search...', searchValue, onSearchChange, right }) => {
  return (
    <div className="bg-white rounded-lg shadow-soft p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center sticky top-3 z-10">
      <div className="flex-1">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow focus:shadow-md"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      {right}
    </div>
  );
};


