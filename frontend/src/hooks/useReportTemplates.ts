import { useState } from 'react';

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
      
      const response = await fetch('/api/reports/templates/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      
      const data = await response.json();
      return data.results || data;
      
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
      
      const response = await fetch('/api/reports/templates/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create template');
      }
      
      const template = await response.json();
      return template;
      
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
      
      const response = await fetch(`/api/reports/templates/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete template');
      }
      
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
