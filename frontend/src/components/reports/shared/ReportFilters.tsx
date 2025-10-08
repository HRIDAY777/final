// =============================================================================
// REPORTS SYSTEM - ADVANCED FILTERS COMPONENT
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Label from '@/components/UI/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/Select';
import Checkbox from '@/components/UI/Checkbox';
import { Badge } from '@/components/UI/Badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/UI/Popover';
import Calendar from '@/components/UI/Calendar';
import Separator from '@/components/UI/Separator';
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  Search, 
  Settings,
  RefreshCw,
  Save,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ReportStatus, ReportType, ReportFormat, ReportFilterOptions } from '@/types/reports';
import { cn } from '@/utils/cn';

// =============================================================================
// TYPES
// =============================================================================

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    required?: boolean;
  };
}

export interface ReportFiltersProps {
  filters: ReportFilterOptions;
  onFiltersChange: (filters: ReportFilterOptions) => void;
  config?: FilterConfig[];
  showAdvanced?: boolean;
  onAdvancedToggle?: (show: boolean) => void;
  onReset?: () => void;
  onSave?: (name: string) => void;
  onLoad?: (name: string) => void;
  savedFilters?: Array<{ name: string; filters: ReportFilterOptions }>;
  className?: string;
  loading?: boolean;
}

// =============================================================================
// DEFAULT FILTER CONFIG
// =============================================================================

const defaultFilterConfig: FilterConfig[] = [
  {
    key: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search reports...',
  },
  {
    key: 'status',
    label: 'Status',
    type: 'multiselect',
    options: Object.values(ReportStatus).map(status => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
    })),
  },
  {
    key: 'type',
    label: 'Type',
    type: 'multiselect',
    options: Object.values(ReportType).map(type => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
    })),
  },
  {
    key: 'format',
    label: 'Format',
    type: 'multiselect',
    options: Object.values(ReportFormat).map(format => ({
      value: format,
      label: format.toUpperCase(),
    })),
  },
  {
    key: 'date_range',
    label: 'Date Range',
    type: 'daterange',
  },
  {
    key: 'created_by',
    label: 'Created By',
    type: 'text',
    placeholder: 'Enter creator name...',
  },
  {
    key: 'file_size_min',
    label: 'Min File Size (MB)',
    type: 'number',
    validation: { min: 0 },
  },
  {
    key: 'file_size_max',
    label: 'Max File Size (MB)',
    type: 'number',
    validation: { min: 0 },
  },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ReportFilters({
  filters,
  onFiltersChange,
  config = defaultFilterConfig,
  showAdvanced = false,
  onAdvancedToggle,
  onReset,
  onSave,
  onLoad,
  savedFilters = [],
  className,
  loading = false,
}: ReportFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ReportFilterOptions>(filters);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showSavedFilters, setShowSavedFilters] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    // Calculate active filters
    const active: string[] = [];
    
    if (filters.status && filters.status.length > 0) {
      active.push(`Status: ${filters.status.join(', ')}`);
    }
    
    if (filters.type && filters.type.length > 0) {
      active.push(`Type: ${filters.type.join(', ')}`);
    }
    
    if (filters.format && filters.format.length > 0) {
      active.push(`Format: ${filters.format.join(', ')}`);
    }
    
    if (filters.date_range) {
      active.push(`Date: ${format(new Date(filters.date_range.start), 'MMM dd, yyyy')} - ${format(new Date(filters.date_range.end), 'MMM dd, yyyy')}`);
    }
    
    if (filters.created_by && filters.created_by.length > 0) {
      active.push(`Created By: ${filters.created_by.join(', ')}`);
    }
    
    setActiveFilters(active);
  }, [filters]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleFilterChange = useCallback((key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  }, [localFilters, onFiltersChange]);

  const handleDateRangeChange = useCallback((start: Date | undefined, end: Date | undefined) => {
    const newFilters = {
      ...localFilters,
      date_range: start && end ? { start: start.toISOString(), end: end.toISOString() } : undefined,
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  }, [localFilters, onFiltersChange]);

  const handleReset = useCallback(() => {
    const resetFilters: ReportFilterOptions = {};
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onReset?.();
  }, [onFiltersChange, onReset]);

  const handleSaveFilter = useCallback(() => {
    if (saveFilterName.trim()) {
      onSave?.(saveFilterName.trim());
      setSaveFilterName('');
      setShowSavedFilters(false);
    }
  }, [saveFilterName, onSave]);

  const handleLoadFilter = useCallback((savedFilter: { name: string; filters: ReportFilterOptions }) => {
    setLocalFilters(savedFilter.filters);
    onFiltersChange(savedFilter.filters);
    setShowSavedFilters(false);
  }, [onFiltersChange]);

  const removeActiveFilter = useCallback((filterText: string) => {
    // Parse and remove the specific filter
    if (filterText.startsWith('Status:')) {
      handleFilterChange('status', undefined);
    } else if (filterText.startsWith('Type:')) {
      handleFilterChange('type', undefined);
    } else if (filterText.startsWith('Format:')) {
      handleFilterChange('format', undefined);
    } else if (filterText.startsWith('Date:')) {
      handleFilterChange('date_range', undefined);
    } else if (filterText.startsWith('Created By:')) {
      handleFilterChange('created_by', undefined);
    }
  }, [handleFilterChange]);

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderFilterInput = useCallback((filter: FilterConfig) => {
    switch (filter.type) {
      case 'text':
        return (
          <Input
            placeholder={filter.placeholder}
            value={(localFilters[filter.key as keyof ReportFilterOptions] as unknown as string) || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full"
          />
        );

      case 'select':
        return (
          <Select
            value={(localFilters[filter.key as keyof ReportFilterOptions] as unknown as string) || ''}
            onValueChange={(value) => handleFilterChange(filter.key, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const currentValues = localFilters[filter.key as keyof ReportFilterOptions] as string[] || [];
        return (
          <div className="space-y-2">
            {filter.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${filter.key}-${option.value}`}
                  checked={currentValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleFilterChange(filter.key, newValues);
                  }}
                />
                <Label htmlFor={`${filter.key}-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={filter.placeholder}
            value={(localFilters[filter.key as keyof ReportFilterOptions] as unknown as string) || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full"
            min={filter.validation?.min}
            max={filter.validation?.max}
          />
        );

      case 'boolean':
        return (
          <Checkbox
            checked={(localFilters[filter.key as keyof ReportFilterOptions] as unknown as boolean) || false}
            onCheckedChange={(checked) => handleFilterChange(filter.key, checked)}
          />
        );

      case 'date':
        const dateValue = localFilters[filter.key as keyof ReportFilterOptions] as unknown as string;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dateValue && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateValue ? format(new Date(dateValue), 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateValue ? new Date(dateValue) : undefined}
                onSelect={(date) => {
                  if (date instanceof Date) {
                    handleFilterChange(filter.key, date.toISOString());
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'daterange':
        const dateRange = localFilters.date_range;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dateRange && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange
                  ? `${format(new Date(dateRange.start), 'MMM dd')} - ${format(new Date(dateRange.end), 'MMM dd, yyyy')}`
                  : 'Pick date range'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: dateRange?.start ? new Date(dateRange.start) : undefined,
                  to: dateRange?.end ? new Date(dateRange.end) : undefined,
                } as { from?: Date; to?: Date }}
                onSelect={(range) => {
                  if (range && typeof range === 'object' && 'from' in range && 'to' in range) {
                    handleDateRangeChange(range.from, range.to);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      default:
        return null;
    }
  }, [localFilters, handleFilterChange, handleDateRangeChange]);

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div className={cn('space-y-4', className)}>
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {filter}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeActiveFilter(filter)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAdvancedToggle?.(!showAdvanced)}
            className={cn(showAdvanced && 'bg-gray-100')}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilters.length}
              </Badge>
            )}
          </Button>

          {savedFilters.length > 0 && (
            <Popover open={showSavedFilters} onOpenChange={setShowSavedFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Saved
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Saved Filters</h4>
                  <div className="space-y-2">
                    {savedFilters.map((savedFilter, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleLoadFilter(savedFilter)}
                      >
                        {savedFilter.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onSave && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Save Current Filters</h4>
                  <div className="space-y-2">
                    <Input
                      placeholder="Filter name"
                      value={saveFilterName}
                      onChange={(e) => setSaveFilterName(e.target.value)}
                    />
                    <Button
                      onClick={handleSaveFilter}
                      disabled={!saveFilterName.trim()}
                      className="w-full"
                    >
                      Save Filter
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={loading}
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Reset
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Advanced Filters</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <Label htmlFor={filter.key} className="text-sm font-medium">
                    {filter.label}
                  </Label>
                  {renderFilterInput(filter)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
