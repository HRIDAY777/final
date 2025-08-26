import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface GeneratedReport {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  file_size: number;
  file_format: string;
  created_at: string;
  completed_at?: string;
  processing_time?: string;
  created_by: {
    name: string;
  };
  template: {
    name: string;
    report_type: string;
  };
}

export const useGeneratedReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getGeneratedReports = async (): Promise<GeneratedReport[]> => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, return mock data since the backend might not have these endpoints yet
      const mockReports: GeneratedReport[] = [
        {
          id: '1',
          name: 'Student Performance Report - January 2024',
          description: 'Monthly performance report for all students',
          status: 'completed',
          progress: 100,
          file_size: 2048576, // 2MB
          file_format: 'pdf',
          created_at: '2024-01-15T10:30:00Z',
          completed_at: '2024-01-15T10:32:00Z',
          processing_time: '2 minutes',
          created_by: { name: 'John Doe' },
          template: { name: 'Student Performance Report', report_type: 'academic' },
        },
        {
          id: '2',
          name: 'Attendance Summary - December 2023',
          description: 'Monthly attendance summary',
          status: 'completed',
          progress: 100,
          file_size: 1048576, // 1MB
          file_format: 'excel',
          created_at: '2024-01-10T14:20:00Z',
          completed_at: '2024-01-10T14:21:30Z',
          processing_time: '1.5 minutes',
          created_by: { name: 'Jane Smith' },
          template: { name: 'Attendance Summary', report_type: 'attendance' },
        },
        {
          id: '3',
          name: 'Financial Statement - Q4 2023',
          description: 'Quarterly financial statement',
          status: 'processing',
          progress: 65,
          file_size: 0,
          file_format: 'pdf',
          created_at: '2024-01-20T09:15:00Z',
          created_by: { name: 'Mike Johnson' },
          template: { name: 'Financial Statement', report_type: 'financial' },
        },
        {
          id: '4',
          name: 'Teacher Performance - 2023',
          description: 'Annual teacher performance evaluation',
          status: 'failed',
          progress: 0,
          file_size: 0,
          file_format: 'pdf',
          created_at: '2024-01-18T16:45:00Z',
          created_by: { name: 'Sarah Wilson' },
          template: { name: 'Teacher Performance', report_type: 'performance' },
        },
        {
          id: '5',
          name: 'Analytics Dashboard - January 2024',
          description: 'Comprehensive analytics dashboard',
          status: 'pending',
          progress: 0,
          file_size: 0,
          file_format: 'html',
          created_at: '2024-01-22T11:30:00Z',
          created_by: { name: 'David Brown' },
          template: { name: 'Analytics Dashboard', report_type: 'analytics' },
        },
      ];
      
      return mockReports;
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.get('/api/reports/generated/');
      // return response.data;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch generated reports');
      console.error('Error fetching generated reports:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call when backend is ready
      // await apiClient.delete(`/api/reports/generated/${id}/`);
      
      console.log('Generated report deleted:', id);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report');
      console.error('Error deleting generated report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getGeneratedReports,
    deleteReport,
    loading,
    error,
  };
};
