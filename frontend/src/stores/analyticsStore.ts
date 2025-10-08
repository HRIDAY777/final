/* eslint-disable no-unused-vars */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

// Types
export interface AnalyticsDashboard {
  id: number;
  name: string;
  description: string;
  layout: any; // JSON field for dashboard layout
  widgets: AnalyticsWidget[];
  is_public: boolean;
  is_active: boolean;
  created_by: any; // User type
  shared_with: any[]; // User types
  created_at: string;
  updated_at: string;
}

export interface AnalyticsWidget {
  id: number;
  dashboard: AnalyticsDashboard;
  widget_type: 'chart' | 'table' | 'metric' | 'list';
  title: string;
  config: any; // JSON field for widget configuration
  position: number;
  size: 'small' | 'medium' | 'large';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PerformanceMetric {
  id: number;
  name: string;
  description: string;
  metric_type: 'academic' | 'attendance' | 'financial' | 'operational';
  calculation_method: string;
  unit: string;
  target_value?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PerformanceData {
  id: number;
  metric: PerformanceMetric;
  value: number;
  date: string;
  context: any; // JSON field for additional context
  created_at: string;
  updated_at: string;
}

export interface LearningPath {
  id: number;
  student: any; // Student type
  current_level: string;
  recommended_path: string[];
  estimated_completion_time: number; // in days
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PredictiveInsight {
  id: number;
  insight_type: 'performance' | 'attendance' | 'dropout' | 'engagement';
  confidence_score: number;
  prediction: string;
  factors: string[];
  recommended_actions: string[];
  target_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DataExport {
  id: number;
  export_type: 'performance' | 'attendance' | 'exams' | 'usage' | 'all';
  format: 'csv' | 'excel' | 'json' | 'xml';
  date_range: any; // JSON field for date range
  filters: any; // JSON field for filters
  include_metadata: boolean;
  file_path?: string;
  file_size?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_by: any; // User type
  created_at: string;
  updated_at: string;
}

export interface ModelUpdate {
  id: number;
  model_type: 'performance' | 'attendance' | 'dropout';
  force_update: boolean;
  include_new_data: boolean;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  started_at?: string;
  completed_at?: string;
  created_by: any; // User type
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSettings {
  id: number;
  data_retention_days: number;
  auto_generate_reports: boolean;
  report_frequency: 'daily' | 'weekly' | 'monthly';
  alert_thresholds: any; // JSON field for alert thresholds
  export_formats: string[];
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
interface AnalyticsState {
  // Dashboards
  dashboards: ApiResponse<AnalyticsDashboard> | null;
  currentDashboard: AnalyticsDashboard | null;
  dashboardsLoading: boolean;
  dashboardsError: string | null;

  // Widgets
  widgets: ApiResponse<AnalyticsWidget> | null;
  currentWidget: AnalyticsWidget | null;
  widgetsLoading: boolean;
  widgetsError: string | null;

  // Performance Metrics
  metrics: ApiResponse<PerformanceMetric> | null;
  currentMetric: PerformanceMetric | null;
  metricsLoading: boolean;
  metricsError: string | null;

  // Performance Data
  performanceData: ApiResponse<PerformanceData> | null;
  currentPerformanceData: PerformanceData | null;
  performanceDataLoading: boolean;
  performanceDataError: string | null;

  // Learning Paths
  learningPaths: ApiResponse<LearningPath> | null;
  currentLearningPath: LearningPath | null;
  learningPathsLoading: boolean;
  learningPathsError: string | null;

  // Predictive Insights
  insights: ApiResponse<PredictiveInsight> | null;
  currentInsight: PredictiveInsight | null;
  insightsLoading: boolean;
  insightsError: string | null;

  // Data Exports
  exports: ApiResponse<DataExport> | null;
  currentExport: DataExport | null;
  exportsLoading: boolean;
  exportsError: string | null;

  // Model Updates
  modelUpdates: ApiResponse<ModelUpdate> | null;
  currentModelUpdate: ModelUpdate | null;
  modelUpdatesLoading: boolean;
  modelUpdatesError: string | null;

  // Settings
  settings: AnalyticsSettings | null;
  settingsLoading: boolean;
  settingsError: string | null;

  // Actions
  fetchDashboards: (params?: any) => Promise<void>;
  fetchDashboard: (id: number) => Promise<void>;
  createDashboard: (data: Partial<AnalyticsDashboard>) => Promise<void>;
  updateDashboard: (id: number, data: Partial<AnalyticsDashboard>) => Promise<void>;
  deleteDashboard: (id: number) => Promise<void>;

  fetchWidgets: (params?: any) => Promise<void>;
  fetchWidget: (id: number) => Promise<void>;
  createWidget: (data: Partial<AnalyticsWidget>) => Promise<void>;
  updateWidget: (id: number, data: Partial<AnalyticsWidget>) => Promise<void>;
  deleteWidget: (id: number) => Promise<void>;

  fetchMetrics: (params?: any) => Promise<void>;
  fetchMetric: (id: number) => Promise<void>;
  createMetric: (data: Partial<PerformanceMetric>) => Promise<void>;
  updateMetric: (id: number, data: Partial<PerformanceMetric>) => Promise<void>;
  deleteMetric: (id: number) => Promise<void>;

  fetchPerformanceData: (params?: any) => Promise<void>;
  fetchPerformanceDataPoint: (id: number) => Promise<void>;
  createPerformanceData: (data: Partial<PerformanceData>) => Promise<void>;
  updatePerformanceData: (id: number, data: Partial<PerformanceData>) => Promise<void>;
  deletePerformanceData: (id: number) => Promise<void>;

  fetchLearningPaths: (params?: any) => Promise<void>;
  fetchLearningPath: (id: number) => Promise<void>;
  createLearningPath: (data: Partial<LearningPath>) => Promise<void>;
  updateLearningPath: (id: number, data: Partial<LearningPath>) => Promise<void>;
  deleteLearningPath: (id: number) => Promise<void>;

  fetchInsights: (params?: any) => Promise<void>;
  fetchInsight: (id: number) => Promise<void>;
  createInsight: (data: Partial<PredictiveInsight>) => Promise<void>;
  updateInsight: (id: number, data: Partial<PredictiveInsight>) => Promise<void>;
  deleteInsight: (id: number) => Promise<void>;

  fetchExports: (params?: any) => Promise<void>;
  fetchExport: (id: number) => Promise<void>;
  createExport: (data: Partial<DataExport>) => Promise<void>;
  updateExport: (id: number, data: Partial<DataExport>) => Promise<void>;
  deleteExport: (id: number) => Promise<void>;

  fetchModelUpdates: (params?: any) => Promise<void>;
  fetchModelUpdate: (id: number) => Promise<void>;
  createModelUpdate: (data: Partial<ModelUpdate>) => Promise<void>;
  updateModelUpdate: (id: number, data: Partial<ModelUpdate>) => Promise<void>;
  deleteModelUpdate: (id: number) => Promise<void>;

  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<AnalyticsSettings>) => Promise<void>;

  // Special Analytics Actions
  getStudentPerformance: (studentId: number, params?: any) => Promise<void>;
  getAttendanceAnalytics: (params?: any) => Promise<void>;
  getExamTrends: (params?: any) => Promise<void>;
  getFinancialSummary: (params?: any) => Promise<void>;
  generateReport: (reportType: string, params?: any) => Promise<void>;
  updateModels: (modelType: string, forceUpdate?: boolean) => Promise<void>;

  // Utility actions
  clearErrors: () => void;
  clearCurrent: () => void;
}

// Store Implementation
export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    (set, get) => ({
      // Initial State
      dashboards: null,
      currentDashboard: null,
      dashboardsLoading: false,
      dashboardsError: null,

      widgets: null,
      currentWidget: null,
      widgetsLoading: false,
      widgetsError: null,

      metrics: null,
      currentMetric: null,
      metricsLoading: false,
      metricsError: null,

      performanceData: null,
      currentPerformanceData: null,
      performanceDataLoading: false,
      performanceDataError: null,

      learningPaths: null,
      currentLearningPath: null,
      learningPathsLoading: false,
      learningPathsError: null,

      insights: null,
      currentInsight: null,
      insightsLoading: false,
      insightsError: null,

      exports: null,
      currentExport: null,
      exportsLoading: false,
      exportsError: null,

      modelUpdates: null,
      currentModelUpdate: null,
      modelUpdatesLoading: false,
      modelUpdatesError: null,

      settings: null,
      settingsLoading: false,
      settingsError: null,

      // Dashboard Actions
      fetchDashboards: async (params = {}) => {
        set({ dashboardsLoading: true, dashboardsError: null });
        try {
          const response = await axios.get('/api/analytics/dashboards/', { params });
          set({ dashboards: response.data, dashboardsLoading: false });
        } catch (error: any) {
          set({ 
            dashboardsError: error.response?.data?.message || 'Failed to fetch dashboards',
            dashboardsLoading: false 
          });
        }
      },

      fetchDashboard: async (id: number) => {
        set({ dashboardsLoading: true, dashboardsError: null });
        try {
          const response = await axios.get(`/api/analytics/dashboards/${id}/`);
          set({ currentDashboard: response.data, dashboardsLoading: false });
        } catch (error: any) {
          set({ 
            dashboardsError: error.response?.data?.message || 'Failed to fetch dashboard',
            dashboardsLoading: false 
          });
        }
      },

      createDashboard: async (data: Partial<AnalyticsDashboard>) => {
        set({ dashboardsLoading: true, dashboardsError: null });
        try {
          const response = await axios.post('/api/analytics/dashboards/', data);
          const newDashboard = response.data;
          set(state => ({
            dashboards: state.dashboards ? {
              ...state.dashboards,
              results: [newDashboard, ...state.dashboards.results],
              count: state.dashboards.count + 1
            } : null,
            currentDashboard: newDashboard,
            dashboardsLoading: false
          }));
        } catch (error: any) {
          set({ 
            dashboardsError: error.response?.data?.message || 'Failed to create dashboard',
            dashboardsLoading: false 
          });
        }
      },

      updateDashboard: async (id: number, data: Partial<AnalyticsDashboard>) => {
        set({ dashboardsLoading: true, dashboardsError: null });
        try {
          const response = await axios.put(`/api/analytics/dashboards/${id}/`, data);
          const updatedDashboard = response.data;
          set(state => ({
            dashboards: state.dashboards ? {
              ...state.dashboards,
              results: state.dashboards.results.map(dashboard => 
                dashboard.id === id ? updatedDashboard : dashboard
              )
            } : null,
            currentDashboard: updatedDashboard,
            dashboardsLoading: false
          }));
        } catch (error: any) {
          set({ 
            dashboardsError: error.response?.data?.message || 'Failed to update dashboard',
            dashboardsLoading: false 
          });
        }
      },

      deleteDashboard: async (id: number) => {
        set({ dashboardsLoading: true, dashboardsError: null });
        try {
          await axios.delete(`/api/analytics/dashboards/${id}/`);
          set(state => ({
            dashboards: state.dashboards ? {
              ...state.dashboards,
              results: state.dashboards.results.filter(dashboard => dashboard.id !== id),
              count: state.dashboards.count - 1
            } : null,
            currentDashboard: state.currentDashboard?.id === id ? null : state.currentDashboard,
            dashboardsLoading: false
          }));
        } catch (error: any) {
          set({ 
            dashboardsError: error.response?.data?.message || 'Failed to delete dashboard',
            dashboardsLoading: false 
          });
        }
      },

      // Widget Actions
      fetchWidgets: async (params = {}) => {
        set({ widgetsLoading: true, widgetsError: null });
        try {
          const response = await axios.get('/api/analytics/widgets/', { params });
          set({ widgets: response.data, widgetsLoading: false });
        } catch (error: any) {
          set({ 
            widgetsError: error.response?.data?.message || 'Failed to fetch widgets',
            widgetsLoading: false 
          });
        }
      },

      fetchWidget: async (id: number) => {
        set({ widgetsLoading: true, widgetsError: null });
        try {
          const response = await axios.get(`/api/analytics/widgets/${id}/`);
          set({ currentWidget: response.data, widgetsLoading: false });
        } catch (error: any) {
          set({ 
            widgetsError: error.response?.data?.message || 'Failed to fetch widget',
            widgetsLoading: false 
          });
        }
      },

      createWidget: async (data: Partial<AnalyticsWidget>) => {
        set({ widgetsLoading: true, widgetsError: null });
        try {
          const response = await axios.post('/api/analytics/widgets/', data);
          const newWidget = response.data;
          set(state => ({
            widgets: state.widgets ? {
              ...state.widgets,
              results: [newWidget, ...state.widgets.results],
              count: state.widgets.count + 1
            } : null,
            currentWidget: newWidget,
            widgetsLoading: false
          }));
        } catch (error: any) {
          set({ 
            widgetsError: error.response?.data?.message || 'Failed to create widget',
            widgetsLoading: false 
          });
        }
      },

      updateWidget: async (id: number, data: Partial<AnalyticsWidget>) => {
        set({ widgetsLoading: true, widgetsError: null });
        try {
          const response = await axios.put(`/api/analytics/widgets/${id}/`, data);
          const updatedWidget = response.data;
          set(state => ({
            widgets: state.widgets ? {
              ...state.widgets,
              results: state.widgets.results.map(widget => 
                widget.id === id ? updatedWidget : widget
              )
            } : null,
            currentWidget: updatedWidget,
            widgetsLoading: false
          }));
        } catch (error: any) {
          set({ 
            widgetsError: error.response?.data?.message || 'Failed to update widget',
            widgetsLoading: false 
          });
        }
      },

      deleteWidget: async (id: number) => {
        set({ widgetsLoading: true, widgetsError: null });
        try {
          await axios.delete(`/api/analytics/widgets/${id}/`);
          set(state => ({
            widgets: state.widgets ? {
              ...state.widgets,
              results: state.widgets.results.filter(widget => widget.id !== id),
              count: state.widgets.count - 1
            } : null,
            currentWidget: state.currentWidget?.id === id ? null : state.currentWidget,
            widgetsLoading: false
          }));
        } catch (error: any) {
          set({ 
            widgetsError: error.response?.data?.message || 'Failed to delete widget',
            widgetsLoading: false 
          });
        }
      },

      // Metric Actions
      fetchMetrics: async (params = {}) => {
        set({ metricsLoading: true, metricsError: null });
        try {
          const response = await axios.get('/api/analytics/metrics/', { params });
          set({ metrics: response.data, metricsLoading: false });
        } catch (error: any) {
          set({ 
            metricsError: error.response?.data?.message || 'Failed to fetch metrics',
            metricsLoading: false 
          });
        }
      },

      fetchMetric: async (id: number) => {
        set({ metricsLoading: true, metricsError: null });
        try {
          const response = await axios.get(`/api/analytics/metrics/${id}/`);
          set({ currentMetric: response.data, metricsLoading: false });
        } catch (error: any) {
          set({ 
            metricsError: error.response?.data?.message || 'Failed to fetch metric',
            metricsLoading: false 
          });
        }
      },

      createMetric: async (data: Partial<PerformanceMetric>) => {
        set({ metricsLoading: true, metricsError: null });
        try {
          const response = await axios.post('/api/analytics/metrics/', data);
          const newMetric = response.data;
          set(state => ({
            metrics: state.metrics ? {
              ...state.metrics,
              results: [newMetric, ...state.metrics.results],
              count: state.metrics.count + 1
            } : null,
            currentMetric: newMetric,
            metricsLoading: false
          }));
        } catch (error: any) {
          set({ 
            metricsError: error.response?.data?.message || 'Failed to create metric',
            metricsLoading: false 
          });
        }
      },

      updateMetric: async (id: number, data: Partial<PerformanceMetric>) => {
        set({ metricsLoading: true, metricsError: null });
        try {
          const response = await axios.put(`/api/analytics/metrics/${id}/`, data);
          const updatedMetric = response.data;
          set(state => ({
            metrics: state.metrics ? {
              ...state.metrics,
              results: state.metrics.results.map(metric => 
                metric.id === id ? updatedMetric : metric
              )
            } : null,
            currentMetric: updatedMetric,
            metricsLoading: false
          }));
        } catch (error: any) {
          set({ 
            metricsError: error.response?.data?.message || 'Failed to update metric',
            metricsLoading: false 
          });
        }
      },

      deleteMetric: async (id: number) => {
        set({ metricsLoading: true, metricsError: null });
        try {
          await axios.delete(`/api/analytics/metrics/${id}/`);
          set(state => ({
            metrics: state.metrics ? {
              ...state.metrics,
              results: state.metrics.results.filter(metric => metric.id !== id),
              count: state.metrics.count - 1
            } : null,
            currentMetric: state.currentMetric?.id === id ? null : state.currentMetric,
            metricsLoading: false
          }));
        } catch (error: any) {
          set({ 
            metricsError: error.response?.data?.message || 'Failed to delete metric',
            metricsLoading: false 
          });
        }
      },

      // Performance Data Actions
      fetchPerformanceData: async (params = {}) => {
        set({ performanceDataLoading: true, performanceDataError: null });
        try {
          const response = await axios.get('/api/analytics/performance-data/', { params });
          set({ performanceData: response.data, performanceDataLoading: false });
        } catch (error: any) {
          set({ 
            performanceDataError: error.response?.data?.message || 'Failed to fetch performance data',
            performanceDataLoading: false 
          });
        }
      },

      fetchPerformanceDataPoint: async (id: number) => {
        set({ performanceDataLoading: true, performanceDataError: null });
        try {
          const response = await axios.get(`/api/analytics/performance-data/${id}/`);
          set({ currentPerformanceData: response.data, performanceDataLoading: false });
        } catch (error: any) {
          set({ 
            performanceDataError: error.response?.data?.message || 'Failed to fetch performance data point',
            performanceDataLoading: false 
          });
        }
      },

      createPerformanceData: async (data: Partial<PerformanceData>) => {
        set({ performanceDataLoading: true, performanceDataError: null });
        try {
          const response = await axios.post('/api/analytics/performance-data/', data);
          const newDataPoint = response.data;
          set(state => ({
            performanceData: state.performanceData ? {
              ...state.performanceData,
              results: [newDataPoint, ...state.performanceData.results],
              count: state.performanceData.count + 1
            } : null,
            currentPerformanceData: newDataPoint,
            performanceDataLoading: false
          }));
        } catch (error: any) {
          set({ 
            performanceDataError: error.response?.data?.message || 'Failed to create performance data',
            performanceDataLoading: false 
          });
        }
      },

      updatePerformanceData: async (id: number, data: Partial<PerformanceData>) => {
        set({ performanceDataLoading: true, performanceDataError: null });
        try {
          const response = await axios.put(`/api/analytics/performance-data/${id}/`, data);
          const updatedDataPoint = response.data;
          set(state => ({
            performanceData: state.performanceData ? {
              ...state.performanceData,
              results: state.performanceData.results.map(dataPoint => 
                dataPoint.id === id ? updatedDataPoint : dataPoint
              )
            } : null,
            currentPerformanceData: updatedDataPoint,
            performanceDataLoading: false
          }));
        } catch (error: any) {
          set({ 
            performanceDataError: error.response?.data?.message || 'Failed to update performance data',
            performanceDataLoading: false 
          });
        }
      },

      deletePerformanceData: async (id: number) => {
        set({ performanceDataLoading: true, performanceDataError: null });
        try {
          await axios.delete(`/api/analytics/performance-data/${id}/`);
          set(state => ({
            performanceData: state.performanceData ? {
              ...state.performanceData,
              results: state.performanceData.results.filter(dataPoint => dataPoint.id !== id),
              count: state.performanceData.count - 1
            } : null,
            currentPerformanceData: state.currentPerformanceData?.id === id ? null : state.currentPerformanceData,
            performanceDataLoading: false
          }));
        } catch (error: any) {
          set({ 
            performanceDataError: error.response?.data?.message || 'Failed to delete performance data',
            performanceDataLoading: false 
          });
        }
      },

      // Learning Path Actions
      fetchLearningPaths: async (params = {}) => {
        set({ learningPathsLoading: true, learningPathsError: null });
        try {
          const response = await axios.get('/api/analytics/learning-paths/', { params });
          set({ learningPaths: response.data, learningPathsLoading: false });
        } catch (error: any) {
          set({ 
            learningPathsError: error.response?.data?.message || 'Failed to fetch learning paths',
            learningPathsLoading: false 
          });
        }
      },

      fetchLearningPath: async (id: number) => {
        set({ learningPathsLoading: true, learningPathsError: null });
        try {
          const response = await axios.get(`/api/analytics/learning-paths/${id}/`);
          set({ currentLearningPath: response.data, learningPathsLoading: false });
        } catch (error: any) {
          set({ 
            learningPathsError: error.response?.data?.message || 'Failed to fetch learning path',
            learningPathsLoading: false 
          });
        }
      },

      createLearningPath: async (data: Partial<LearningPath>) => {
        set({ learningPathsLoading: true, learningPathsError: null });
        try {
          const response = await axios.post('/api/analytics/learning-paths/', data);
          const newLearningPath = response.data;
          set(state => ({
            learningPaths: state.learningPaths ? {
              ...state.learningPaths,
              results: [newLearningPath, ...state.learningPaths.results],
              count: state.learningPaths.count + 1
            } : null,
            currentLearningPath: newLearningPath,
            learningPathsLoading: false
          }));
        } catch (error: any) {
          set({ 
            learningPathsError: error.response?.data?.message || 'Failed to create learning path',
            learningPathsLoading: false 
          });
        }
      },

      updateLearningPath: async (id: number, data: Partial<LearningPath>) => {
        set({ learningPathsLoading: true, learningPathsError: null });
        try {
          const response = await axios.put(`/api/analytics/learning-paths/${id}/`, data);
          const updatedLearningPath = response.data;
          set(state => ({
            learningPaths: state.learningPaths ? {
              ...state.learningPaths,
              results: state.learningPaths.results.map(learningPath => 
                learningPath.id === id ? updatedLearningPath : learningPath
              )
            } : null,
            currentLearningPath: updatedLearningPath,
            learningPathsLoading: false
          }));
        } catch (error: any) {
          set({ 
            learningPathsError: error.response?.data?.message || 'Failed to update learning path',
            learningPathsLoading: false 
          });
        }
      },

      deleteLearningPath: async (id: number) => {
        set({ learningPathsLoading: true, learningPathsError: null });
        try {
          await axios.delete(`/api/analytics/learning-paths/${id}/`);
          set(state => ({
            learningPaths: state.learningPaths ? {
              ...state.learningPaths,
              results: state.learningPaths.results.filter(learningPath => learningPath.id !== id),
              count: state.learningPaths.count - 1
            } : null,
            currentLearningPath: state.currentLearningPath?.id === id ? null : state.currentLearningPath,
            learningPathsLoading: false
          }));
        } catch (error: any) {
          set({ 
            learningPathsError: error.response?.data?.message || 'Failed to delete learning path',
            learningPathsLoading: false 
          });
        }
      },

      // Insight Actions
      fetchInsights: async (params = {}) => {
        set({ insightsLoading: true, insightsError: null });
        try {
          const response = await axios.get('/api/analytics/insights/', { params });
          set({ insights: response.data, insightsLoading: false });
        } catch (error: any) {
          set({ 
            insightsError: error.response?.data?.message || 'Failed to fetch insights',
            insightsLoading: false 
          });
        }
      },

      fetchInsight: async (id: number) => {
        set({ insightsLoading: true, insightsError: null });
        try {
          const response = await axios.get(`/api/analytics/insights/${id}/`);
          set({ currentInsight: response.data, insightsLoading: false });
        } catch (error: any) {
          set({ 
            insightsError: error.response?.data?.message || 'Failed to fetch insight',
            insightsLoading: false 
          });
        }
      },

      createInsight: async (data: Partial<PredictiveInsight>) => {
        set({ insightsLoading: true, insightsError: null });
        try {
          const response = await axios.post('/api/analytics/insights/', data);
          const newInsight = response.data;
          set(state => ({
            insights: state.insights ? {
              ...state.insights,
              results: [newInsight, ...state.insights.results],
              count: state.insights.count + 1
            } : null,
            currentInsight: newInsight,
            insightsLoading: false
          }));
        } catch (error: any) {
          set({ 
            insightsError: error.response?.data?.message || 'Failed to create insight',
            insightsLoading: false 
          });
        }
      },

      updateInsight: async (id: number, data: Partial<PredictiveInsight>) => {
        set({ insightsLoading: true, insightsError: null });
        try {
          const response = await axios.put(`/api/analytics/insights/${id}/`, data);
          const updatedInsight = response.data;
          set(state => ({
            insights: state.insights ? {
              ...state.insights,
              results: state.insights.results.map(insight => 
                insight.id === id ? updatedInsight : insight
              )
            } : null,
            currentInsight: updatedInsight,
            insightsLoading: false
          }));
        } catch (error: any) {
          set({ 
            insightsError: error.response?.data?.message || 'Failed to update insight',
            insightsLoading: false 
          });
        }
      },

      deleteInsight: async (id: number) => {
        set({ insightsLoading: true, insightsError: null });
        try {
          await axios.delete(`/api/analytics/insights/${id}/`);
          set(state => ({
            insights: state.insights ? {
              ...state.insights,
              results: state.insights.results.filter(insight => insight.id !== id),
              count: state.insights.count - 1
            } : null,
            currentInsight: state.currentInsight?.id === id ? null : state.currentInsight,
            insightsLoading: false
          }));
        } catch (error: any) {
          set({ 
            insightsError: error.response?.data?.message || 'Failed to delete insight',
            insightsLoading: false 
          });
        }
      },

      // Export Actions
      fetchExports: async (params = {}) => {
        set({ exportsLoading: true, exportsError: null });
        try {
          const response = await axios.get('/api/analytics/exports/', { params });
          set({ exports: response.data, exportsLoading: false });
        } catch (error: any) {
          set({ 
            exportsError: error.response?.data?.message || 'Failed to fetch exports',
            exportsLoading: false 
          });
        }
      },

      fetchExport: async (id: number) => {
        set({ exportsLoading: true, exportsError: null });
        try {
          const response = await axios.get(`/api/analytics/exports/${id}/`);
          set({ currentExport: response.data, exportsLoading: false });
        } catch (error: any) {
          set({ 
            exportsError: error.response?.data?.message || 'Failed to fetch export',
            exportsLoading: false 
          });
        }
      },

      createExport: async (data: Partial<DataExport>) => {
        set({ exportsLoading: true, exportsError: null });
        try {
          const response = await axios.post('/api/analytics/exports/', data);
          const newExport = response.data;
          set(state => ({
            exports: state.exports ? {
              ...state.exports,
              results: [newExport, ...state.exports.results],
              count: state.exports.count + 1
            } : null,
            currentExport: newExport,
            exportsLoading: false
          }));
        } catch (error: any) {
          set({ 
            exportsError: error.response?.data?.message || 'Failed to create export',
            exportsLoading: false 
          });
        }
      },

      updateExport: async (id: number, data: Partial<DataExport>) => {
        set({ exportsLoading: true, exportsError: null });
        try {
          const response = await axios.put(`/api/analytics/exports/${id}/`, data);
          const updatedExport = response.data;
          set(state => ({
            exports: state.exports ? {
              ...state.exports,
              results: state.exports.results.map(exportItem => 
                exportItem.id === id ? updatedExport : exportItem
              )
            } : null,
            currentExport: updatedExport,
            exportsLoading: false
          }));
        } catch (error: any) {
          set({ 
            exportsError: error.response?.data?.message || 'Failed to update export',
            exportsLoading: false 
          });
        }
      },

      deleteExport: async (id: number) => {
        set({ exportsLoading: true, exportsError: null });
        try {
          await axios.delete(`/api/analytics/exports/${id}/`);
          set(state => ({
            exports: state.exports ? {
              ...state.exports,
              results: state.exports.results.filter(exportItem => exportItem.id !== id),
              count: state.exports.count - 1
            } : null,
            currentExport: state.currentExport?.id === id ? null : state.currentExport,
            exportsLoading: false
          }));
        } catch (error: any) {
          set({ 
            exportsError: error.response?.data?.message || 'Failed to delete export',
            exportsLoading: false 
          });
        }
      },

      // Model Update Actions
      fetchModelUpdates: async (params = {}) => {
        set({ modelUpdatesLoading: true, modelUpdatesError: null });
        try {
          const response = await axios.get('/api/analytics/model-updates/', { params });
          set({ modelUpdates: response.data, modelUpdatesLoading: false });
        } catch (error: any) {
          set({ 
            modelUpdatesError: error.response?.data?.message || 'Failed to fetch model updates',
            modelUpdatesLoading: false 
          });
        }
      },

      fetchModelUpdate: async (id: number) => {
        set({ modelUpdatesLoading: true, modelUpdatesError: null });
        try {
          const response = await axios.get(`/api/analytics/model-updates/${id}/`);
          set({ currentModelUpdate: response.data, modelUpdatesLoading: false });
        } catch (error: any) {
          set({ 
            modelUpdatesError: error.response?.data?.message || 'Failed to fetch model update',
            modelUpdatesLoading: false 
          });
        }
      },

      createModelUpdate: async (data: Partial<ModelUpdate>) => {
        set({ modelUpdatesLoading: true, modelUpdatesError: null });
        try {
          const response = await axios.post('/api/analytics/model-updates/', data);
          const newModelUpdate = response.data;
          set(state => ({
            modelUpdates: state.modelUpdates ? {
              ...state.modelUpdates,
              results: [newModelUpdate, ...state.modelUpdates.results],
              count: state.modelUpdates.count + 1
            } : null,
            currentModelUpdate: newModelUpdate,
            modelUpdatesLoading: false
          }));
        } catch (error: any) {
          set({ 
            modelUpdatesError: error.response?.data?.message || 'Failed to create model update',
            modelUpdatesLoading: false 
          });
        }
      },

      updateModelUpdate: async (id: number, data: Partial<ModelUpdate>) => {
        set({ modelUpdatesLoading: true, modelUpdatesError: null });
        try {
          const response = await axios.put(`/api/analytics/model-updates/${id}/`, data);
          const updatedModelUpdate = response.data;
          set(state => ({
            modelUpdates: state.modelUpdates ? {
              ...state.modelUpdates,
              results: state.modelUpdates.results.map(modelUpdate => 
                modelUpdate.id === id ? updatedModelUpdate : modelUpdate
              )
            } : null,
            currentModelUpdate: updatedModelUpdate,
            modelUpdatesLoading: false
          }));
        } catch (error: any) {
          set({ 
            modelUpdatesError: error.response?.data?.message || 'Failed to update model update',
            modelUpdatesLoading: false 
          });
        }
      },

      deleteModelUpdate: async (id: number) => {
        set({ modelUpdatesLoading: true, modelUpdatesError: null });
        try {
          await axios.delete(`/api/analytics/model-updates/${id}/`);
          set(state => ({
            modelUpdates: state.modelUpdates ? {
              ...state.modelUpdates,
              results: state.modelUpdates.results.filter(modelUpdate => modelUpdate.id !== id),
              count: state.modelUpdates.count - 1
            } : null,
            currentModelUpdate: state.currentModelUpdate?.id === id ? null : state.currentModelUpdate,
            modelUpdatesLoading: false
          }));
        } catch (error: any) {
          set({ 
            modelUpdatesError: error.response?.data?.message || 'Failed to delete model update',
            modelUpdatesLoading: false 
          });
        }
      },

      // Settings Actions
      fetchSettings: async () => {
        set({ settingsLoading: true, settingsError: null });
        try {
          const response = await axios.get('/api/analytics/settings/');
          set({ settings: response.data, settingsLoading: false });
        } catch (error: any) {
          set({ 
            settingsError: error.response?.data?.message || 'Failed to fetch settings',
            settingsLoading: false 
          });
        }
      },

      updateSettings: async (data: Partial<AnalyticsSettings>) => {
        set({ settingsLoading: true, settingsError: null });
        try {
          const response = await axios.put('/api/analytics/settings/', data);
          set({ settings: response.data, settingsLoading: false });
        } catch (error: any) {
          set({ 
            settingsError: error.response?.data?.message || 'Failed to update settings',
            settingsLoading: false 
          });
        }
      },

      // Special Analytics Actions
      getStudentPerformance: async (studentId: number, params = {}) => {
        set({ performanceDataLoading: true, performanceDataError: null });
        try {
          const response = await axios.get(`/api/analytics/student-performance/${studentId}/`, { params });
          set({ performanceData: response.data, performanceDataLoading: false });
        } catch (error: any) {
          set({ 
            performanceDataError: error.response?.data?.message || 'Failed to fetch student performance',
            performanceDataLoading: false 
          });
        }
      },

      getAttendanceAnalytics: async (params = {}) => {
        set({ performanceDataLoading: true, performanceDataError: null });
        try {
          const response = await axios.get('/api/analytics/attendance-stats/', { params });
          set({ performanceData: response.data, performanceDataLoading: false });
        } catch (error: any) {
          set({ 
            performanceDataError: error.response?.data?.message || 'Failed to fetch attendance analytics',
            performanceDataLoading: false 
          });
        }
      },

      getExamTrends: async (params = {}) => {
        set({ performanceDataLoading: true, performanceDataError: null });
        try {
          const response = await axios.get('/api/analytics/exam-trends/', { params });
          set({ performanceData: response.data, performanceDataLoading: false });
        } catch (error: any) {
          set({ 
            performanceDataError: error.response?.data?.message || 'Failed to fetch exam trends',
            performanceDataLoading: false 
          });
        }
      },

      getFinancialSummary: async (params = {}) => {
        set({ performanceDataLoading: true, performanceDataError: null });
        try {
          const response = await axios.get('/api/analytics/financial-summary/', { params });
          set({ performanceData: response.data, performanceDataLoading: false });
        } catch (error: any) {
          set({ 
            performanceDataError: error.response?.data?.message || 'Failed to fetch financial summary',
            performanceDataLoading: false 
          });
        }
      },

      generateReport: async (reportType: string, params = {}) => {
        set({ exportsLoading: true, exportsError: null });
        try {
          const response = await axios.post('/api/analytics/generate-report/', {
            report_type: reportType,
            ...params
          });
          const newExport = response.data;
          set(state => ({
            exports: state.exports ? {
              ...state.exports,
              results: [newExport, ...state.exports.results],
              count: state.exports.count + 1
            } : null,
            currentExport: newExport,
            exportsLoading: false
          }));
        } catch (error: any) {
          set({ 
            exportsError: error.response?.data?.message || 'Failed to generate report',
            exportsLoading: false 
          });
        }
      },

      updateModels: async (modelType: string, forceUpdate = false) => {
        set({ modelUpdatesLoading: true, modelUpdatesError: null });
        try {
          const response = await axios.post('/api/analytics/update-models/', {
            model_type: modelType,
            force_update: forceUpdate
          });
          const newModelUpdate = response.data;
          set(state => ({
            modelUpdates: state.modelUpdates ? {
              ...state.modelUpdates,
              results: [newModelUpdate, ...state.modelUpdates.results],
              count: state.modelUpdates.count + 1
            } : null,
            currentModelUpdate: newModelUpdate,
            modelUpdatesLoading: false
          }));
        } catch (error: any) {
          set({ 
            modelUpdatesError: error.response?.data?.message || 'Failed to update models',
            modelUpdatesLoading: false 
          });
        }
      },

      // Utility Actions
      clearErrors: () => {
        set({
          dashboardsError: null,
          widgetsError: null,
          metricsError: null,
          performanceDataError: null,
          learningPathsError: null,
          insightsError: null,
          exportsError: null,
          modelUpdatesError: null,
          settingsError: null
        });
      },

      clearCurrent: () => {
        set({
          currentDashboard: null,
          currentWidget: null,
          currentMetric: null,
          currentPerformanceData: null,
          currentLearningPath: null,
          currentInsight: null,
          currentExport: null,
          currentModelUpdate: null
        });
      },
    }),
    {
      name: 'analytics-store',
    }
  )
);
