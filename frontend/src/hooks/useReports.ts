// =============================================================================
// REPORTS SYSTEM - ADVANCED CUSTOM HOOKS
// =============================================================================

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { apiService } from '@/services/api';
import {
  ReportTemplate,
  GeneratedReport,
  ScheduledReport,
  ReportAnalytics,
  ReportStatus,
  ReportType,
  ReportFormat,
  ReportFrequency,
  ReportFilterOptions,
  ReportSortOptions,
  ReportPagination,
  ReportApiResponse,
  ReportExportOptions,
  ReportNotification,
  ReportComment,
  ReportShare,
  ReportAuditLog,
  isReportStatus,
  isReportType,
  isReportFormat,
  isReportFrequency
} from '@/types/reports';

// =============================================================================
// BASE HOOKS
// =============================================================================

/**
 * Custom hook for managing API requests with caching and error handling
 */
export const useApiRequest = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
    gcTime?: number;
  }
) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [key],
    queryFn: fetcher,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Custom hook for managing mutations with optimistic updates
 */
export const useApiMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: string[];
  }
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
  });
};

// =============================================================================
// REPORT TEMPLATES HOOKS
// =============================================================================

/**
 * Hook for managing report templates
 */
export const useReportTemplates = () => {
  const queryClient = useQueryClient();

  // Get all templates
  const getTemplates = useCallback(async (): Promise<ReportTemplate[]> => {
    const response = await apiService.get<ReportApiResponse<ReportTemplate[]>>('/reports/templates/');
    return response.data;
  }, []);

  // Get template by ID
  const getTemplate = useCallback(async (id: string): Promise<ReportTemplate> => {
    const response = await apiService.get<ReportApiResponse<ReportTemplate>>(`/reports/templates/${id}/`);
    return response.data;
  }, []);

  // Create template
  const createTemplate = useCallback(async (template: Partial<ReportTemplate>): Promise<ReportTemplate> => {
    const response = await apiService.post<ReportApiResponse<ReportTemplate>>('/reports/templates/', template);
    return response.data;
  }, []);

  // Update template
  const updateTemplate = useCallback(async (id: string, template: Partial<ReportTemplate>): Promise<ReportTemplate> => {
    const response = await apiService.put<ReportApiResponse<ReportTemplate>>(`/reports/templates/${id}/`, template);
    return response.data;
  }, []);

  // Delete template
  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    await apiService.delete(`/reports/templates/${id}/`);
  }, []);

  // Duplicate template
  const duplicateTemplate = useCallback(async (id: string, name: string): Promise<ReportTemplate> => {
    const response = await apiService.post<ReportApiResponse<ReportTemplate>>(`/reports/templates/${id}/duplicate/`, { name });
    return response.data;
  }, []);

  // Export template
  const exportTemplate = useCallback(async (id: string, format: ReportFormat): Promise<Blob> => {
    const response = await apiService.get(`/reports/templates/${id}/export/`, {
      params: { format },
      responseType: 'blob'
    });
    return response as Blob;
  }, []);

  // Import template
  const importTemplate = useCallback(async (file: File): Promise<ReportTemplate> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiService.post<ReportApiResponse<ReportTemplate>>('/reports/templates/import/', formData);
    return response.data;
  }, []);

  return {
    getTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    exportTemplate,
    importTemplate,
  };
};

/**
 * Hook for using report templates with caching
 */
export const useReportTemplatesQuery = (options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) => {
  const { getTemplates } = useReportTemplates();

  return useApiRequest(
    'report-templates',
    getTemplates,
    options
  );
};

/**
 * Hook for using a single report template
 */
export const useReportTemplateQuery = (id: string, options?: {
  enabled?: boolean;
}) => {
  const { getTemplate } = useReportTemplates();

  return useApiRequest(
    `report-template-${id}`,
    () => getTemplate(id),
    { enabled: options?.enabled && !!id }
  );
};

// =============================================================================
// GENERATED REPORTS HOOKS
// =============================================================================

/**
 * Hook for managing generated reports
 */
export const useGeneratedReports = () => {
  const queryClient = useQueryClient();

  // Get all generated reports
  const getGeneratedReports = useCallback(async (filters?: ReportFilterOptions): Promise<GeneratedReport[]> => {
    const response = await apiService.get<ReportApiResponse<GeneratedReport[]>>('/reports/generated/', {
      params: filters
    });
    return response.data;
  }, []);

  // Get generated report by ID
  const getGeneratedReport = useCallback(async (id: string): Promise<GeneratedReport> => {
    const response = await apiService.get<ReportApiResponse<GeneratedReport>>(`/reports/generated/${id}/`);
    return response.data;
  }, []);

  // Generate report
  const generateReport = useCallback(async (templateId: string, parameters: Record<string, any>): Promise<GeneratedReport> => {
    const response = await apiService.post<ReportApiResponse<GeneratedReport>>('/reports/generate/', {
      template_id: templateId,
      parameters
    });
    return response.data;
  }, []);

  // Delete generated report
  const deleteReport = useCallback(async (id: string): Promise<void> => {
    await apiService.delete(`/reports/generated/${id}/`);
  }, []);

  // Download report
  const downloadReport = useCallback(async (id: string, options?: ReportExportOptions): Promise<Blob> => {
    const response = await apiService.get(`/reports/generated/${id}/download/`, {
      params: options,
      responseType: 'blob'
    });
    return response as Blob;
  }, []);

  // Share report
  const shareReport = useCallback(async (id: string, shareData: Partial<ReportShare>): Promise<ReportShare> => {
    const response = await apiService.post<ReportApiResponse<ReportShare>>(`/reports/generated/${id}/share/`, shareData);
    return response.data;
  }, []);

  // Get report progress
  const getReportProgress = useCallback(async (id: string): Promise<{ progress: number; status: ReportStatus }> => {
    const response = await apiService.get<ReportApiResponse<{ progress: number; status: ReportStatus }>>(`/reports/generated/${id}/progress/`);
    return response.data;
  }, []);

  return {
    getGeneratedReports,
    getGeneratedReport,
    generateReport,
    deleteReport,
    downloadReport,
    shareReport,
    getReportProgress,
  };
};

/**
 * Hook for using generated reports with caching
 */
export const useGeneratedReportsQuery = (filters?: ReportFilterOptions, options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) => {
  const { getGeneratedReports } = useGeneratedReports();

  return useApiRequest(
    `generated-reports-${JSON.stringify(filters || {})}`,
    () => getGeneratedReports(filters),
    options
  );
};

/**
 * Hook for using a single generated report
 */
export const useGeneratedReportQuery = (id: string, options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) => {
  const { getGeneratedReport } = useGeneratedReports();

  return useApiRequest(
    `generated-report-${id}`,
    () => getGeneratedReport(id),
    { 
      enabled: options?.enabled && !!id,
      refetchInterval: options?.refetchInterval ?? 5000 // Poll every 5 seconds for progress
    }
  );
};

// =============================================================================
// SCHEDULED REPORTS HOOKS
// =============================================================================

/**
 * Hook for managing scheduled reports
 */
export const useScheduledReports = () => {
  const queryClient = useQueryClient();

  // Get all scheduled reports
  const getScheduledReports = useCallback(async (filters?: ReportFilterOptions): Promise<ScheduledReport[]> => {
    const response = await apiService.get<ReportApiResponse<ScheduledReport[]>>('/reports/scheduled/', {
      params: filters
    });
    return response.data;
  }, []);

  // Get scheduled report by ID
  const getScheduledReport = useCallback(async (id: string): Promise<ScheduledReport> => {
    const response = await apiService.get<ReportApiResponse<ScheduledReport>>(`/reports/scheduled/${id}/`);
    return response.data;
  }, []);

  // Create scheduled report
  const createScheduledReport = useCallback(async (scheduleData: Partial<ScheduledReport>): Promise<ScheduledReport> => {
    const response = await apiService.post<ReportApiResponse<ScheduledReport>>('/reports/scheduled/', scheduleData);
    return response.data;
  }, []);

  // Update scheduled report
  const updateScheduledReport = useCallback(async (id: string, scheduleData: Partial<ScheduledReport>): Promise<ScheduledReport> => {
    const response = await apiService.put<ReportApiResponse<ScheduledReport>>(`/reports/scheduled/${id}/`, scheduleData);
    return response.data;
  }, []);

  // Delete scheduled report
  const deleteScheduledReport = useCallback(async (id: string): Promise<void> => {
    await apiService.delete(`/reports/scheduled/${id}/`);
  }, []);

  // Pause scheduled report
  const pauseScheduledReport = useCallback(async (id: string): Promise<void> => {
    await apiService.patch(`/reports/scheduled/${id}/pause/`);
  }, []);

  // Resume scheduled report
  const resumeScheduledReport = useCallback(async (id: string): Promise<void> => {
    await apiService.patch(`/reports/scheduled/${id}/resume/`);
  }, []);

  // Run scheduled report now
  const runScheduledReportNow = useCallback(async (id: string): Promise<void> => {
    await apiService.post(`/reports/scheduled/${id}/run-now/`);
  }, []);

  return {
    getScheduledReports,
    getScheduledReport,
    createScheduledReport,
    updateScheduledReport,
    deleteScheduledReport,
    pauseScheduledReport,
    resumeScheduledReport,
    runScheduledReportNow,
  };
};

/**
 * Hook for using scheduled reports with caching
 */
export const useScheduledReportsQuery = (filters?: ReportFilterOptions, options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) => {
  const { getScheduledReports } = useScheduledReports();

  return useApiRequest(
    `scheduled-reports-${JSON.stringify(filters || {})}`,
    () => getScheduledReports(filters),
    options
  );
};

// =============================================================================
// REPORT ANALYTICS HOOKS
// =============================================================================

/**
 * Hook for managing report analytics
 */
export const useReportAnalytics = () => {
  // Get report analytics
  const getReportAnalytics = useCallback(async (): Promise<ReportAnalytics> => {
    const response = await apiService.get<ReportApiResponse<ReportAnalytics>>('/reports/analytics/');
    return response.data;
  }, []);

  // Get analytics by date range
  const getAnalyticsByDateRange = useCallback(async (startDate: string, endDate: string): Promise<ReportAnalytics> => {
    const response = await apiService.get<ReportApiResponse<ReportAnalytics>>('/reports/analytics/', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  }, []);

  // Get performance metrics
  const getPerformanceMetrics = useCallback(async (): Promise<ReportAnalytics['performance_metrics']> => {
    const response = await apiService.get<ReportApiResponse<ReportAnalytics['performance_metrics']>>('/reports/analytics/performance/');
    return response.data;
  }, []);

  // Get user analytics
  const getUserAnalytics = useCallback(async (): Promise<ReportAnalytics['user_analytics']> => {
    const response = await apiService.get<ReportApiResponse<ReportAnalytics['user_analytics']>>('/reports/analytics/users/');
    return response.data;
  }, []);

  return {
    getReportAnalytics,
    getAnalyticsByDateRange,
    getPerformanceMetrics,
    getUserAnalytics,
  };
};

/**
 * Hook for using report analytics with caching
 */
export const useReportAnalyticsQuery = (options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) => {
  const { getReportAnalytics } = useReportAnalytics();

  return useApiRequest(
    'report-analytics',
    getReportAnalytics,
    options
  );
};

// =============================================================================
// REPORT COMMENTS HOOKS
// =============================================================================

/**
 * Hook for managing report comments
 */
export const useReportComments = () => {
  // Get comments for a report
  const getComments = useCallback(async (reportId: string): Promise<ReportComment[]> => {
    const response = await apiService.get<ReportApiResponse<ReportComment[]>>(`/reports/${reportId}/comments/`);
    return response.data;
  }, []);

  // Add comment
  const addComment = useCallback(async (reportId: string, content: string, parentId?: string): Promise<ReportComment> => {
    const response = await apiService.post<ReportApiResponse<ReportComment>>(`/reports/${reportId}/comments/`, {
      content,
      parent_id: parentId
    });
    return response.data;
  }, []);

  // Update comment
  const updateComment = useCallback(async (reportId: string, commentId: string, content: string): Promise<ReportComment> => {
    const response = await apiService.put<ReportApiResponse<ReportComment>>(`/reports/${reportId}/comments/${commentId}/`, {
      content
    });
    return response.data;
  }, []);

  // Delete comment
  const deleteComment = useCallback(async (reportId: string, commentId: string): Promise<void> => {
    await apiService.delete(`/reports/${reportId}/comments/${commentId}/`);
  }, []);

  // Like comment
  const likeComment = useCallback(async (reportId: string, commentId: string): Promise<void> => {
    await apiService.post(`/reports/${reportId}/comments/${commentId}/like/`);
  }, []);

  return {
    getComments,
    addComment,
    updateComment,
    deleteComment,
    likeComment,
  };
};

// =============================================================================
// REPORT NOTIFICATIONS HOOKS
// =============================================================================

/**
 * Hook for managing report notifications
 */
export const useReportNotifications = () => {
  // Get notifications
  const getNotifications = useCallback(async (): Promise<ReportNotification[]> => {
    const response = await apiService.get<ReportApiResponse<ReportNotification[]>>('/reports/notifications/');
    return response.data;
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    await apiService.patch(`/reports/notifications/${notificationId}/read/`);
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (): Promise<void> => {
    await apiService.patch('/reports/notifications/mark-all-read/');
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string): Promise<void> => {
    await apiService.delete(`/reports/notifications/${notificationId}/`);
  }, []);

  return {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};

// =============================================================================
// REPORT AUDIT LOGS HOOKS
// =============================================================================

/**
 * Hook for managing report audit logs
 */
export const useReportAuditLogs = () => {
  // Get audit logs for a report
  const getAuditLogs = useCallback(async (reportId: string): Promise<ReportAuditLog[]> => {
    const response = await apiService.get<ReportApiResponse<ReportAuditLog[]>>(`/reports/${reportId}/audit-logs/`);
    return response.data;
  }, []);

  // Get all audit logs
  const getAllAuditLogs = useCallback(async (filters?: ReportFilterOptions): Promise<ReportAuditLog[]> => {
    const response = await apiService.get<ReportApiResponse<ReportAuditLog[]>>('/reports/audit-logs/', {
      params: filters
    });
    return response.data;
  }, []);

  return {
    getAuditLogs,
    getAllAuditLogs,
  };
};

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook for managing report filters and sorting
 */
export const useReportFilters = () => {
  const [filters, setFilters] = useState<ReportFilterOptions>({});
  const [sorting, setSorting] = useState<ReportSortOptions>({ field: 'created_at', direction: 'desc' });
  const [pagination, setPagination] = useState<ReportPagination>({ page: 1, limit: 20, total: 0, total_pages: 0 });

  const updateFilters = useCallback((newFilters: Partial<ReportFilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filters change
  }, []);

  const updateSorting = useCallback((newSorting: ReportSortOptions) => {
    setSorting(newSorting);
  }, []);

  const updatePagination = useCallback((newPagination: Partial<ReportPagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSorting({ field: 'created_at', direction: 'desc' });
    setPagination({ page: 1, limit: 20, total: 0, total_pages: 0 });
  }, []);

  return {
    filters,
    sorting,
    pagination,
    updateFilters,
    updateSorting,
    updatePagination,
    resetFilters,
  };
};

/**
 * Hook for managing report search with debouncing
 */
export const useReportSearch = (delay: number = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, delay]);

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
  };
};

/**
 * Hook for managing report file uploads
 */
export const useReportFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiService.post<ReportApiResponse<{ file_url: string }>>('/reports/upload/', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgress(progress);
          onProgress?.(progress);
        },
      });

      return response.data.file_url;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, []);

  return {
    uploading,
    progress,
    uploadFile,
  };
};

/**
 * Hook for managing report real-time updates
 */
export const useReportRealTime = (reportId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!reportId) return;

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/reports/${reportId}/`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastUpdate(new Date());
      
      // Handle different types of updates
      switch (data.type) {
        case 'progress_update':
          // Update progress in cache
          break;
        case 'status_update':
          // Update status in cache
          break;
        case 'completion':
          // Handle completion
          break;
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [reportId]);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return {
    isConnected,
    lastUpdate,
    sendMessage,
  };
};
