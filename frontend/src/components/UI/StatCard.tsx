import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  colorClass?: string; // e.g., 'bg-blue-100 text-blue-700'
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, colorClass = 'bg-blue-100 text-blue-700' }) => {
  return (
    <div className="bg-white rounded-lg shadow-soft p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        {icon ? (
          <div className={`p-3 rounded-lg ${colorClass}`}>{icon}</div>
        ) : null}
      </div>
      {typeof change !== 'undefined' && (
        <p className="text-xs text-gray-500 mt-2">{change}</p>
      )}
    </div>
  );
};


