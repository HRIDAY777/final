import React from 'react';
import { cn } from '@/utils/cn';

interface TableProps {
  className?: string;
  children: React.ReactNode;
}

interface TableHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface TableBodyProps {
  className?: string;
  children: React.ReactNode;
}

interface TableRowProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

interface TableHeadProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

interface TableCellProps {
  className?: string;
  children: React.ReactNode;
  colSpan?: number;
  onClick?: () => void;
}

const Table: React.FC<TableProps> = ({ className, children }) => {
  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full caption-bottom text-sm">
        {children}
      </table>
    </div>
  );
};

const TableHeader: React.FC<TableHeaderProps> = ({ className, children }) => {
  return (
    <thead className={cn("[&_tr]:border-b", className)}>
      {children}
    </thead>
  );
};

const TableBody: React.FC<TableBodyProps> = ({ className, children }) => {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)}>
      {children}
    </tbody>
  );
};

const TableRow: React.FC<TableRowProps> = ({ className, children, onClick }) => {
  return (
    <tr 
      className={cn(
        "border-b transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-50",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

const TableHead: React.FC<TableHeadProps> = ({ className, children, onClick }) => {
  return (
    <th 
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0",
        onClick && "cursor-pointer hover:bg-gray-50",
        className
      )}
      onClick={onClick}
    >
      {children}
    </th>
  );
};

const TableCell: React.FC<TableCellProps> = ({ className, children, colSpan, onClick }) => {
  return (
    <td 
      className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
      colSpan={colSpan}
      onClick={onClick}
    >
      {children}
    </td>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
