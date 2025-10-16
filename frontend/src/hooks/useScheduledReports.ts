import { useState } from 'react';

interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  frequency: string;
  status: string;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  last_run?: string;
  next_run?: string;
  created_at: string;
  created_by: {
    name: string;
  };
  template: {
    name: string;
    report_type: string;
  };
  recipients_count: number;
}

export const useScheduledReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getScheduledReports = async (): Promise<ScheduledReport[]> => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, return mock data since the backend might not have these endpoints yet
      const mockReports: ScheduledReport[] = [
        {
          id: '1',
          name: 'Weekly Student Performance',
          description: 'Weekly performance reports for all students',
          frequency: 'weekly',
          status: 'active',
          is_active: true,
          start_date: '2024-01-01T00:00:00Z',
          last_run: '2024-01-15T09:00:00Z',
          next_run: '2024-01-22T09:00:00Z',
          created_at: '2024-01-01T10:30:00Z',
          created_by: { name: 'John Doe' },
          template: { name: 'Student Performance Report', report_type: 'academic' },
          recipients_count: 5,
        },
        {
          id: '2',
          name: 'Monthly Attendance Report',
          description: 'Monthly attendance summary for administration',
          frequency: 'monthly',
          status: 'active',
          is_active: true,
          start_date: '2024-01-01T00:00:00Z',
          last_run: '2024-01-01T08:00:00Z',
          next_run: '2024-02-01T08:00:00Z',
          created_at: '2024-01-01T14:20:00Z',
          created_by: { name: 'Jane Smith' },
          template: { name: 'Attendance Summary', report_type: 'attendance' },
          recipients_count: 3,
        },
        {
          id: '3',
          name: 'Quarterly Financial Statement',
          description: 'Quarterly financial reports for board members',
          frequency: 'quarterly',
          status: 'paused',
          is_active: false,
          start_date: '2024-01-01T00:00:00Z',
          last_run: '2023-10-01T10:00:00Z',
          next_run: '2024-04-01T10:00:00Z',
          created_at: '2024-01-01T09:15:00Z',
          created_by: { name: 'Mike Johnson' },
          template: { name: 'Financial Statement', report_type: 'financial' },
          recipients_count: 8,
        },
        {
          id: '4',
          name: 'Daily System Health',
          description: 'Daily system health and performance metrics',
          frequency: 'daily',
          status: 'active',
          is_active: true,
          start_date: '2024-01-01T00:00:00Z',
          last_run: '2024-01-21T06:00:00Z',
          next_run: '2024-01-22T06:00:00Z',
          created_at: '2024-01-01T16:45:00Z',
          created_by: { name: 'Sarah Wilson' },
          template: { name: 'System Analytics', report_type: 'analytics' },
          recipients_count: 2,
        },
        {
          id: '5',
          name: 'Annual Teacher Evaluation',
          description: 'Annual teacher performance evaluation reports',
          frequency: 'yearly',
          status: 'completed',
          is_active: false,
          start_date: '2023-01-01T00:00:00Z',
          end_date: '2023-12-31T23:59:59Z',
          last_run: '2023-12-31T17:00:00Z',
          created_at: '2023-01-01T11:30:00Z',
          created_by: { name: 'David Brown' },
          template: { name: 'Teacher Performance', report_type: 'performance' },
          recipients_count: 12,
        },
      ];
      
      return mockReports;
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.get('/api/reports/scheduled/');
      // return response.data;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scheduled reports');
      console.error('Error fetching scheduled reports:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const pauseReport = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/reports/scheduled/${id}/pause/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to pause report');
      }
      
      console.log('Scheduled report paused:', id);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause report');
      console.error('Error pausing scheduled report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resumeReport = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/reports/scheduled/${id}/resume/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to resume report');
      }
      
      console.log('Scheduled report resumed:', id);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume report');
      console.error('Error resuming scheduled report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/reports/scheduled/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete report');
      }
      
      console.log('Scheduled report deleted:', id);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report');
      console.error('Error deleting scheduled report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getScheduledReports,
    pauseReport,
    resumeReport,
    deleteReport,
    loading,
    error,
  };
};
