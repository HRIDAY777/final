// =============================================================================
// REPORTS SYSTEM - ADVANCED SHARED TABLE COMPONENT
// =============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/UI/Table';
import { Button } from '@/components/UI/Button';
import { Badge } from '@/components/UI/Badge';
import Input from '@/components/UI/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/Select';
import Checkbox from '@/components/UI/Checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/UI/DropdownMenu';
import { Card, CardContent, CardHeader } from '@/components/UI/Card';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Share, 
  Calendar,
  Clock,
  FileText,
  User,
  Settings,
  RefreshCw
} from 'lucide-react';
import { ReportStatus, ReportType, ReportFormat } from '@/types/reports';
import { cn } from '@/utils/cn';

// =============================================================================
// TYPES
// =============================================================================

export interface ReportTableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
  formatter?: (value: any) => string;
}

export interface ReportTableProps<T = any> {
  data: T[];
  columns: ReportTableColumn<T>[];
  loading?: boolean;
  error?: string | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
  sorting?: {
    field: string;
    direction: 'asc' | 'desc';
    onSort: (field: string, direction: 'asc' | 'desc') => void;
  };
  filtering?: {
    filters: Record<string, any>;
    onFilterChange: (filters: Record<string, any>) => void;
  };
  selection?: {
    selectedRows: string[];
    onSelectionChange: (selectedRows: string[]) => void;
    selectable?: boolean;
  };
  actions?: {
    onView?: (row: T) => void;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    onDuplicate?: (row: T) => void;
    onShare?: (row: T) => void;
    onDownload?: (row: T) => void;
    customActions?: Array<{
      label: string;
      icon: React.ReactNode;
      onClick: (row: T) => void;
      disabled?: (row: T) => boolean;
    }>;
  };
  searchable?: boolean;
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  refreshable?: boolean;
  onRefresh?: () => void;
  exportable?: boolean;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  bulkActions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: (selectedRows: T[]) => void;
    disabled?: boolean;
  }>;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const getStatusColor = (status: ReportStatus) => {
  const colors = {
    [ReportStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [ReportStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [ReportStatus.PROCESSING]: 'bg-blue-100 text-blue-800',
    [ReportStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [ReportStatus.FAILED]: 'bg-red-100 text-red-800',
    [ReportStatus.CANCELLED]: 'bg-gray-100 text-gray-600',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getTypeColor = (type: ReportType) => {
  const colors = {
    [ReportType.ACADEMIC]: 'bg-blue-100 text-blue-800',
    [ReportType.ATTENDANCE]: 'bg-green-100 text-green-800',
    [ReportType.FINANCIAL]: 'bg-purple-100 text-purple-800',
    [ReportType.PERFORMANCE]: 'bg-orange-100 text-orange-800',
    [ReportType.ANALYTICS]: 'bg-indigo-100 text-indigo-800',
    [ReportType.CUSTOM]: 'bg-gray-100 text-gray-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

const getFormatIcon = (format: ReportFormat) => {
  const icons = {
    [ReportFormat.PDF]: '📄',
    [ReportFormat.EXCEL]: '📊',
    [ReportFormat.CSV]: '📋',
    [ReportFormat.JSON]: '🔧',
    [ReportFormat.XML]: '📄',
    [ReportFormat.HTML]: '🌐',
  };
  return icons[format] || '📄';
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ReportTable<T extends { id: string; [key: string]: any }>({
  data,
  columns,
  loading = false,
  error = null,
  pagination,
  sorting,
  filtering,
  selection,
  actions,
  searchable = false,
  onSearch,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data available',
  className,
  rowClassName,
  onRowClick,
  refreshable = false,
  onRefresh,
  exportable = false,
  onExport,
  bulkActions = [],
}: ReportTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    onSearch?.(term);
  }, [onSearch]);

  const handleSort = useCallback((field: string) => {
    if (!sorting) return;
    
    const currentDirection = sorting.field === field ? sorting.direction : 'asc';
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    sorting.onSort(field, newDirection);
  }, [sorting]);

  const handleRowClick = useCallback((row: T) => {
    onRowClick?.(row);
  }, [onRowClick]);

  const handleSelectRow = useCallback((rowId: string, checked: boolean) => {
    if (!selection) return;
    
    const newSelected = checked
      ? [...selection.selectedRows, rowId]
      : selection.selectedRows.filter(id => id !== rowId);
    
    selection.onSelectionChange(newSelected);
  }, [selection]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (!selection) return;
    
    const newSelected = checked ? data.map(row => row.id) : [];
    selection.onSelectionChange(newSelected);
  }, [selection, data]);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const isAllSelected = useMemo(() => {
    if (!selection || data.length === 0) return false;
    return selection.selectedRows.length === data.length;
  }, [selection, data]);

  const isIndeterminate = useMemo(() => {
    if (!selection || data.length === 0) return false;
    return selection.selectedRows.length > 0 && selection.selectedRows.length < data.length;
  }, [selection, data]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(row =>
      columns.some(column => {
        const value = row[column.key];
        if (value == null) return false;
        
        const stringValue = column.formatter 
          ? column.formatter(value)
          : String(value);
        
        return stringValue.toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns]);

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderCell = useCallback((column: ReportTableColumn<T>, row: T, index: number) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row, index);
    }

    // Default renderers for common types
    if (column.key === 'status' && typeof value === 'string') {
      return (
        <Badge className={cn('text-xs', getStatusColor(value as ReportStatus))}>
          {value}
        </Badge>
      );
    }

    if (column.key === 'type' && typeof value === 'string') {
      return (
        <Badge className={cn('text-xs', getTypeColor(value as ReportType))}>
          {value}
        </Badge>
      );
    }

    if (column.key === 'format' && typeof value === 'string') {
      return (
        <div className="flex items-center gap-2">
          <span>{getFormatIcon(value as ReportFormat)}</span>
          <span className="text-sm font-medium">{value.toUpperCase()}</span>
        </div>
      );
    }

    if (column.key === 'file_size' && typeof value === 'number') {
      return <span className="text-sm text-gray-600">{formatFileSize(value)}</span>;
    }

    if (column.key === 'created_at' || column.key === 'updated_at' || column.key === 'completed_at') {
      return <span className="text-sm text-gray-600">{formatDate(value)}</span>;
    }

    if (column.key === 'progress' && typeof value === 'number') {
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 w-8">{value}%</span>
        </div>
      );
    }

    if (column.formatter) {
      return <span>{column.formatter(value)}</span>;
    }

    return <span>{value}</span>;
  }, []);

  const renderActions = useCallback((row: T) => {
    if (!actions) return null;

    const actionItems = [];

    if (actions.onView) {
      actionItems.push({
        label: 'View',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => actions.onView!(row),
      });
    }

    if (actions.onEdit) {
      actionItems.push({
        label: 'Edit',
        icon: <Edit className="w-4 h-4" />,
        onClick: () => actions.onEdit!(row),
      });
    }

    if (actions.onDuplicate) {
      actionItems.push({
        label: 'Duplicate',
        icon: <Copy className="w-4 h-4" />,
        onClick: () => actions.onDuplicate!(row),
      });
    }

    if (actions.onShare) {
      actionItems.push({
        label: 'Share',
        icon: <Share className="w-4 h-4" />,
        onClick: () => actions.onShare!(row),
      });
    }

    if (actions.onDownload) {
      actionItems.push({
        label: 'Download',
        icon: <Download className="w-4 h-4" />,
        onClick: () => actions.onDownload!(row),
      });
    }

    if (actions.customActions) {
      actionItems.push(...actions.customActions);
    }

    if (actions.onDelete) {
      actionItems.push({
        label: 'Delete',
        icon: <Trash2 className="w-4 h-4" />,
        onClick: () => actions.onDelete!(row),
        className: 'text-red-600',
      });
    }

    if (actionItems.length === 0) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actionItems.map((item, index) => (
            <DropdownMenuItem
              key={index}
              onClick={item.onClick}
              disabled={item.disabled?.(row)}
              className={item.className}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, [actions]);

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <FileText className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600">{error}</p>
            {onRefresh && (
              <Button onClick={onRefresh} className="mt-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Reports</h3>
            {selection && selection.selectedRows.length > 0 && (
              <Badge variant="secondary">
                {selection.selectedRows.length} selected
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            )}
            
            {filtering && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(showFilters && 'bg-gray-100')}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            )}
            
            {exportable && onExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onExport('csv')}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport('excel')}>
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport('pdf')}>
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {refreshable && onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selection && selection.selectedRows.length > 0 && bulkActions.length > 0 && (
          <div className="flex items-center gap-2 pt-4 border-t">
            <span className="text-sm text-gray-600">Bulk Actions:</span>
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => action.onClick(data.filter(row => selection.selectedRows.includes(row.id)))}
                disabled={action.disabled}
              >
                {action.icon}
                <span className="ml-2">{action.label}</span>
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {selection?.selectable && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      column.sortable && 'cursor-pointer hover:bg-gray-50',
                      column.width && `w-${column.width}`,
                      column.align && `text-${column.align}`
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {column.sortable && sorting && (
                        <div className="flex flex-col">
                          <ChevronUp 
                            className={cn(
                              'w-3 h-3',
                              sorting.field === column.key && sorting.direction === 'asc'
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            )}
                          />
                          <ChevronDown 
                            className={cn(
                              'w-3 h-3 -mt-1',
                              sorting.field === column.key && sorting.direction === 'desc'
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
                
                {actions && (
                  <TableHead className="w-12">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (selection?.selectable ? 1 : 0) + (actions ? 1 : 0)}>
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (selection?.selectable ? 1 : 0) + (actions ? 1 : 0)}>
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
                      <p className="text-gray-600">{emptyMessage}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      onRowClick && 'cursor-pointer hover:bg-gray-50',
                      rowClassName?.(row, index)
                    )}
                    onClick={() => handleRowClick(row)}
                  >
                    {selection?.selectable && (
                      <TableCell>
                        <Checkbox
                          checked={selection.selectedRows.includes(row.id)}
                          onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}
                    
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn(
                          column.align && `text-${column.align}`,
                          column.width && `w-${column.width}`
                        )}
                      >
                        {renderCell(column, row, index)}
                      </TableCell>
                    ))}
                    
                                         {actions && (
                       <TableCell>
                         <div onClick={(e) => e.stopPropagation()}>
                           {renderActions(row)}
                         </div>
                       </TableCell>
                     )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Select
                value={pagination.limit.toString()}
                onValueChange={(value) => pagination.onLimitChange(parseInt(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                
                <span className="px-3 py-2 text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
