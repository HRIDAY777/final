import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface ReportStats {
  templates: number;
  generated: number;
  scheduled: number;
  thisMonth: number;
}

export const useReports = () => {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For now, return mock data since the backend might not have these endpoints yet
      const mockStats: ReportStats = {
        templates: 12,
        generated: 45,
        scheduled: 8,
        thisMonth: 15,
      };
      
      setStats(mockStats);
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.get('/api/reports/stats/');
      // setStats(response.data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report stats');
      console.error('Error fetching report stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: getStats,
  };
};
