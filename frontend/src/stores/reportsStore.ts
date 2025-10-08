import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

// Types
export interface ReportTemplate {
  id: number;
  name: string;
  description: string;
  report_type: 'academic' | 'attendance' | 'financial' | 'operational' | 'custom';
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'xml';
  template_file?: string;
  parameters: any; // JSON field for template parameters
  is_public: boolean;
  is_active: boolean;
  created_by: any; // User type
  shared_with: any[]; // User types
  created_at: string;
  updated_at: string;
}

export interface ScheduledReport {
  id: number;
  name: string;
  template: ReportTemplate;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  next_run: string;
  parameters: any; // JSON field for report parameters
  recipients: string[]; // Email addresses
  is_active: boolean;
  created_by: any; // User type
  created_at: string;
  updated_at: string;
}

export interface GeneratedReport {
  id: number;
  name: string;
  template: ReportTemplate;
  scheduled_report?: ScheduledReport;
  generated_by: any; // User type
  parameters: any; // JSON field for report parameters
  report_file?: string;
  file_size?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_time?: number; // in seconds
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
interface ApiResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Store State
interface ReportsState {
  // Templates
  templates: ApiResponse<ReportTemplate> | null;
  currentTemplate: ReportTemplate | null;
  templatesLoading: boolean;
  templatesError: string | null;

  // Scheduled Reports
  scheduledReports: ApiResponse<ScheduledReport> | null;
  currentScheduledReport: ScheduledReport | null;
  scheduledReportsLoading: boolean;
  scheduledReportsError: string | null;

  // Generated Reports
  generatedReports: ApiResponse<GeneratedReport> | null;
  currentGeneratedReport: GeneratedReport | null;
  generatedReportsLoading: boolean;
  generatedReportsError: string | null;

  // Actions
  // eslint-disable-next-line no-unused-vars
  fetchTemplates: (params?: any) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchTemplate: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  createTemplate: (data: Partial<ReportTemplate>) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  updateTemplate: (id: number, data: Partial<ReportTemplate>) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  deleteTemplate: (id: number) => Promise<void>;

  // eslint-disable-next-line no-unused-vars
  fetchScheduledReports: (params?: any) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchScheduledReport: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  createScheduledReport: (data: Partial<ScheduledReport>) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  updateScheduledReport: (id: number, data: Partial<ScheduledReport>) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  deleteScheduledReport: (id: number) => Promise<void>;

  // eslint-disable-next-line no-unused-vars
  fetchGeneratedReports: (params?: any) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchGeneratedReport: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  createGeneratedReport: (data: Partial<GeneratedReport>) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  updateGeneratedReport: (id: number, data: Partial<GeneratedReport>) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  deleteGeneratedReport: (id: number) => Promise<void>;

  // Special Actions
  // eslint-disable-next-line no-unused-vars
  generateReport: (templateId: number, parameters?: any) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  scheduleReport: (templateId: number, scheduleData: any) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  downloadReport: (reportId: number, format?: string) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  shareReport: (reportId: number, recipients: string[]) => Promise<void>;

  // Utility actions
  clearErrors: () => void;
  clearCurrent: () => void;
}

// Store Implementation
export const useReportsStore = create<ReportsState>()(
  devtools(
    // eslint-disable-next-line no-unused-vars
    (set, get) => ({
      // Initial State
      templates: null,
      currentTemplate: null,
      templatesLoading: false,
      templatesError: null,

      scheduledReports: null,
      currentScheduledReport: null,
      scheduledReportsLoading: false,
      scheduledReportsError: null,

      generatedReports: null,
      currentGeneratedReport: null,
      generatedReportsLoading: false,
      generatedReportsError: null,

      // Template Actions
      fetchTemplates: async (params = {}) => {
        set({ templatesLoading: true, templatesError: null });
        try {
          const response = await axios.get('/api/reports/templates/', { params });
          set({ templates: response.data, templatesLoading: false });
        } catch (error: any) {
          set({
            templatesError: error.response?.data?.message || 'Failed to fetch templates',
            templatesLoading: false
          });
        }
      },

      fetchTemplate: async (id: number) => {
        set({ templatesLoading: true, templatesError: null });
        try {
          const response = await axios.get(`/api/reports/templates/${id}/`);
          set({ currentTemplate: response.data, templatesLoading: false });
        } catch (error: any) {
          set({
            templatesError: error.response?.data?.message || 'Failed to fetch template',
            templatesLoading: false
          });
        }
      },

      createTemplate: async (data: Partial<ReportTemplate>) => {
        set({ templatesLoading: true, templatesError: null });
        try {
          const response = await axios.post('/api/reports/templates/', data);
          const newTemplate = response.data;
          set(state => ({
            templates: state.templates ? {
              ...state.templates,
              results: [newTemplate, ...state.templates.results],
              count: state.templates.count + 1
            } : null,
            currentTemplate: newTemplate,
            templatesLoading: false
          }));
        } catch (error: any) {
          set({
            templatesError: error.response?.data?.message || 'Failed to create template',
            templatesLoading: false
          });
        }
      },

      updateTemplate: async (id: number, data: Partial<ReportTemplate>) => {
        set({ templatesLoading: true, templatesError: null });
        try {
          const response = await axios.put(`/api/reports/templates/${id}/`, data);
          const updatedTemplate = response.data;
          set(state => ({
            templates: state.templates ? {
              ...state.templates,
              results: state.templates.results.map(template =>
                template.id === id ? updatedTemplate : template
              )
            } : null,
            currentTemplate: updatedTemplate,
            templatesLoading: false
          }));
        } catch (error: any) {
          set({
            templatesError: error.response?.data?.message || 'Failed to update template',
            templatesLoading: false
          });
        }
      },

      deleteTemplate: async (id: number) => {
        set({ templatesLoading: true, templatesError: null });
        try {
          await axios.delete(`/api/reports/templates/${id}/`);
          set(state => ({
            templates: state.templates ? {
              ...state.templates,
              results: state.templates.results.filter(template => template.id !== id),
              count: state.templates.count - 1
            } : null,
            currentTemplate: state.currentTemplate?.id === id ? null : state.currentTemplate,
            templatesLoading: false
          }));
        } catch (error: any) {
          set({
            templatesError: error.response?.data?.message || 'Failed to delete template',
            templatesLoading: false
          });
        }
      },

      // Scheduled Report Actions
      fetchScheduledReports: async (params = {}) => {
        set({ scheduledReportsLoading: true, scheduledReportsError: null });
        try {
          const response = await axios.get('/api/reports/scheduled/', { params });
          set({ scheduledReports: response.data, scheduledReportsLoading: false });
        } catch (error: any) {
          set({
            scheduledReportsError: error.response?.data?.message || 'Failed to fetch scheduled reports',
            scheduledReportsLoading: false
          });
        }
      },

      fetchScheduledReport: async (id: number) => {
        set({ scheduledReportsLoading: true, scheduledReportsError: null });
        try {
          const response = await axios.get(`/api/reports/scheduled/${id}/`);
          set({ currentScheduledReport: response.data, scheduledReportsLoading: false });
        } catch (error: any) {
          set({
            scheduledReportsError: error.response?.data?.message || 'Failed to fetch scheduled report',
            scheduledReportsLoading: false
          });
        }
      },

      createScheduledReport: async (data: Partial<ScheduledReport>) => {
        set({ scheduledReportsLoading: true, scheduledReportsError: null });
        try {
          const response = await axios.post('/api/reports/scheduled/', data);
          const newScheduledReport = response.data;
          set(state => ({
            scheduledReports: state.scheduledReports ? {
              ...state.scheduledReports,
              results: [newScheduledReport, ...state.scheduledReports.results],
              count: state.scheduledReports.count + 1
            } : null,
            currentScheduledReport: newScheduledReport,
            scheduledReportsLoading: false
          }));
        } catch (error: any) {
          set({
            scheduledReportsError: error.response?.data?.message || 'Failed to create scheduled report',
            scheduledReportsLoading: false
          });
        }
      },

      updateScheduledReport: async (id: number, data: Partial<ScheduledReport>) => {
        set({ scheduledReportsLoading: true, scheduledReportsError: null });
        try {
          const response = await axios.put(`/api/reports/scheduled/${id}/`, data);
          const updatedScheduledReport = response.data;
          set(state => ({
            scheduledReports: state.scheduledReports ? {
              ...state.scheduledReports,
              results: state.scheduledReports.results.map(scheduledReport =>
                scheduledReport.id === id ? updatedScheduledReport : scheduledReport
              )
            } : null,
            currentScheduledReport: updatedScheduledReport,
            scheduledReportsLoading: false
          }));
        } catch (error: any) {
          set({
            scheduledReportsError: error.response?.data?.message || 'Failed to update scheduled report',
            scheduledReportsLoading: false
          });
        }
      },

      deleteScheduledReport: async (id: number) => {
        set({ scheduledReportsLoading: true, scheduledReportsError: null });
        try {
          await axios.delete(`/api/reports/scheduled/${id}/`);
          set(state => ({
            scheduledReports: state.scheduledReports ? {
              ...state.scheduledReports,
              results: state.scheduledReports.results.filter(scheduledReport => scheduledReport.id !== id),
              count: state.scheduledReports.count - 1
            } : null,
            currentScheduledReport: state.currentScheduledReport?.id === id ? null : state.currentScheduledReport,
            scheduledReportsLoading: false
          }));
        } catch (error: any) {
          set({
            scheduledReportsError: error.response?.data?.message || 'Failed to delete scheduled report',
            scheduledReportsLoading: false
          });
        }
      },

      // Generated Report Actions
      fetchGeneratedReports: async (params = {}) => {
        set({ generatedReportsLoading: true, generatedReportsError: null });
        try {
          const response = await axios.get('/api/reports/generated/', { params });
          set({ generatedReports: response.data, generatedReportsLoading: false });
        } catch (error: any) {
          set({
            generatedReportsError: error.response?.data?.message || 'Failed to fetch generated reports',
            generatedReportsLoading: false
          });
        }
      },

      fetchGeneratedReport: async (id: number) => {
        set({ generatedReportsLoading: true, generatedReportsError: null });
        try {
          const response = await axios.get(`/api/reports/generated/${id}/`);
          set({ currentGeneratedReport: response.data, generatedReportsLoading: false });
        } catch (error: any) {
          set({
            generatedReportsError: error.response?.data?.message || 'Failed to fetch generated report',
            generatedReportsLoading: false
          });
        }
      },

      createGeneratedReport: async (data: Partial<GeneratedReport>) => {
        set({ generatedReportsLoading: true, generatedReportsError: null });
        try {
          const response = await axios.post('/api/reports/generated/', data);
          const newGeneratedReport = response.data;
          set(state => ({
            generatedReports: state.generatedReports ? {
              ...state.generatedReports,
              results: [newGeneratedReport, ...state.generatedReports.results],
              count: state.generatedReports.count + 1
            } : null,
            currentGeneratedReport: newGeneratedReport,
            generatedReportsLoading: false
          }));
        } catch (error: any) {
          set({
            generatedReportsError: error.response?.data?.message || 'Failed to create generated report',
            generatedReportsLoading: false
          });
        }
      },

      updateGeneratedReport: async (id: number, data: Partial<GeneratedReport>) => {
        set({ generatedReportsLoading: true, generatedReportsError: null });
        try {
          const response = await axios.put(`/api/reports/generated/${id}/`, data);
          const updatedGeneratedReport = response.data;
          set(state => ({
            generatedReports: state.generatedReports ? {
              ...state.generatedReports,
              results: state.generatedReports.results.map(generatedReport =>
                generatedReport.id === id ? updatedGeneratedReport : generatedReport
              )
            } : null,
            currentGeneratedReport: updatedGeneratedReport,
            generatedReportsLoading: false
          }));
        } catch (error: any) {
          set({
            generatedReportsError: error.response?.data?.message || 'Failed to update generated report',
            generatedReportsLoading: false
          });
        }
      },

      deleteGeneratedReport: async (id: number) => {
        set({ generatedReportsLoading: true, generatedReportsError: null });
        try {
          await axios.delete(`/api/reports/generated/${id}/`);
          set(state => ({
            generatedReports: state.generatedReports ? {
              ...state.generatedReports,
              results: state.generatedReports.results.filter(generatedReport => generatedReport.id !== id),
              count: state.generatedReports.count - 1
            } : null,
            currentGeneratedReport: state.currentGeneratedReport?.id === id ? null : state.currentGeneratedReport,
            generatedReportsLoading: false
          }));
        } catch (error: any) {
          set({
            generatedReportsError: error.response?.data?.message || 'Failed to delete generated report',
            generatedReportsLoading: false
          });
        }
      },

      // Special Actions
      generateReport: async (templateId: number, parameters = {}) => {
        set({ generatedReportsLoading: true, generatedReportsError: null });
        try {
          const response = await axios.post(`/api/reports/templates/${templateId}/generate/`, {
            parameters
          });
          const newGeneratedReport = response.data;
          set(state => ({
            generatedReports: state.generatedReports ? {
              ...state.generatedReports,
              results: [newGeneratedReport, ...state.generatedReports.results],
              count: state.generatedReports.count + 1
            } : null,
            currentGeneratedReport: newGeneratedReport,
            generatedReportsLoading: false
          }));
        } catch (error: any) {
          set({
            generatedReportsError: error.response?.data?.message || 'Failed to generate report',
            generatedReportsLoading: false
          });
        }
      },

      scheduleReport: async (templateId: number, scheduleData: any) => {
        set({ scheduledReportsLoading: true, scheduledReportsError: null });
        try {
          const response = await axios.post(`/api/reports/templates/${templateId}/schedule/`, scheduleData);
          const newScheduledReport = response.data;
          set(state => ({
            scheduledReports: state.scheduledReports ? {
              ...state.scheduledReports,
              results: [newScheduledReport, ...state.scheduledReports.results],
              count: state.scheduledReports.count + 1
            } : null,
            currentScheduledReport: newScheduledReport,
            scheduledReportsLoading: false
          }));
        } catch (error: any) {
          set({
            scheduledReportsError: error.response?.data?.message || 'Failed to schedule report',
            scheduledReportsLoading: false
          });
        }
      },

      downloadReport: async (reportId: number, format = 'pdf') => {
        try {
          const response = await axios.get(`/api/reports/generated/${reportId}/download/`, {
            params: { format },
            responseType: 'blob'
          });
          
          // Create download link
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `report-${reportId}.${format}`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        } catch (error: any) {
          console.error('Failed to download report:', error);
        }
      },

      shareReport: async (reportId: number, recipients: string[]) => {
        try {
          await axios.post(`/api/reports/generated/${reportId}/share/`, {
            recipients
          });
        } catch (error: any) {
          console.error('Failed to share report:', error);
        }
      },

      // Utility Actions
      clearErrors: () => {
        set({
          templatesError: null,
          scheduledReportsError: null,
          generatedReportsError: null
        });
      },

      clearCurrent: () => {
        set({
          currentTemplate: null,
          currentScheduledReport: null,
          currentGeneratedReport: null
        });
      },
    }),
    {
      name: 'reports-store',
    }
  )
);
