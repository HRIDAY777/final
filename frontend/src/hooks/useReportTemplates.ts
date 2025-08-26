import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  report_type: string;
  format: string;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  created_by: {
    name: string;
  };
}

interface CreateTemplateData {
  name: string;
  description: string;
  report_type: string;
  format: string;
  is_public: boolean;
}

export const useReportTemplates = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTemplates = async (): Promise<ReportTemplate[]> => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, return mock data since the backend might not have these endpoints yet
      const mockTemplates: ReportTemplate[] = [
        {
          id: '1',
          name: 'Student Performance Report',
          description: 'Comprehensive report on student academic performance',
          report_type: 'academic',
          format: 'pdf',
          is_public: true,
          is_active: true,
          created_at: '2024-01-15T10:30:00Z',
          created_by: { name: 'John Doe' },
        },
        {
          id: '2',
          name: 'Attendance Summary',
          description: 'Monthly attendance summary for all students',
          report_type: 'attendance',
          format: 'excel',
          is_public: false,
          is_active: true,
          created_at: '2024-01-10T14:20:00Z',
          created_by: { name: 'Jane Smith' },
        },
        {
          id: '3',
          name: 'Financial Statement',
          description: 'Quarterly financial statement and budget analysis',
          report_type: 'financial',
          format: 'pdf',
          is_public: false,
          is_active: true,
          created_at: '2024-01-05T09:15:00Z',
          created_by: { name: 'Mike Johnson' },
        },
        {
          id: '4',
          name: 'Teacher Performance',
          description: 'Teacher performance evaluation and metrics',
          report_type: 'performance',
          format: 'pdf',
          is_public: false,
          is_active: true,
          created_at: '2024-01-12T16:45:00Z',
          created_by: { name: 'Sarah Wilson' },
        },
      ];
      
      return mockTemplates;
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.get('/api/reports/templates/');
      // return response.data;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
      console.error('Error fetching templates:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (data: CreateTemplateData): Promise<ReportTemplate> => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, return mock response since the backend might not have these endpoints yet
      const mockTemplate: ReportTemplate = {
        id: Date.now().toString(),
        name: data.name,
        description: data.description,
        report_type: data.report_type,
        format: data.format,
        is_public: data.is_public,
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: { name: 'Current User' },
      };
      
      return mockTemplate;
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.post('/api/reports/templates/', data);
      // return response.data;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
      console.error('Error creating template:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call when backend is ready
      // await apiClient.delete(`/api/reports/templates/${id}/`);
      
      console.log('Template deleted:', id);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      console.error('Error deleting template:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getTemplates,
    createTemplate,
    deleteTemplate,
    loading,
    error,
  };
};
