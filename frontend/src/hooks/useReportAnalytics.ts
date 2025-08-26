import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface ReportAnalytics {
  total_reports: number;
  reports_this_month: number;
  reports_this_week: number;
  average_generation_time: number;
  most_popular_template: string;
  most_active_user: string;
  reports_by_type: {
    academic: number;
    attendance: number;
    financial: number;
    performance: number;
    analytics: number;
    custom: number;
  };
  reports_by_status: {
    completed: number;
    processing: number;
    failed: number;
    pending: number;
  };
  recent_activity: Array<{
    id: string;
    action: string;
    user: string;
    template: string;
    timestamp: string;
  }>;
}

export const useReportAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getReportAnalytics = async (): Promise<ReportAnalytics> => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, return mock data since the backend might not have these endpoints yet
      const mockAnalytics: ReportAnalytics = {
        total_reports: 156,
        reports_this_month: 23,
        reports_this_week: 7,
        average_generation_time: 2.5, // minutes
        most_popular_template: 'Student Performance Report',
        most_active_user: 'John Doe',
        reports_by_type: {
          academic: 45,
          attendance: 32,
          financial: 28,
          performance: 18,
          analytics: 15,
          custom: 18,
        },
        reports_by_status: {
          completed: 142,
          processing: 8,
          failed: 4,
          pending: 2,
        },
        recent_activity: [
          {
            id: '1',
            action: 'generated',
            user: 'John Doe',
            template: 'Student Performance Report',
            timestamp: '2024-01-22T10:30:00Z',
          },
          {
            id: '2',
            action: 'scheduled',
            user: 'Jane Smith',
            template: 'Attendance Summary',
            timestamp: '2024-01-22T09:15:00Z',
          },
          {
            id: '3',
            action: 'created template',
            user: 'Mike Johnson',
            template: 'Custom Analytics Dashboard',
            timestamp: '2024-01-22T08:45:00Z',
          },
          {
            id: '4',
            action: 'downloaded',
            user: 'Sarah Wilson',
            template: 'Financial Statement',
            timestamp: '2024-01-22T08:20:00Z',
          },
          {
            id: '5',
            action: 'failed',
            user: 'David Brown',
            template: 'Teacher Performance',
            timestamp: '2024-01-22T07:55:00Z',
          },
        ],
      };
      
      return mockAnalytics;
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.get('/api/reports/analytics/');
      // return response.data;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      console.error('Error fetching report analytics:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getReportAnalytics,
    loading,
    error,
  };
};
