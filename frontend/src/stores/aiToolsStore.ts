import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

// Types
export interface AIModel {
  id: number;
  name: string;
  description: string;
  model_type: 'quiz_generator' | 'lesson_summarizer' | 'performance_predictor' | 'attendance_anomaly' | 'nl_query';
  version: string;
  model_file?: string;
  accuracy_score?: number;
  training_data_size?: number;
  last_trained?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIQuizGenerator {
  id: number;
  model: AIModel;
  subject: any; // Subject type
  topic: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  question_count: number;
  question_types: string[]; // ['multiple_choice', 'true_false', 'essay']
  generated_questions: any[]; // JSON field for generated questions
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_time?: number; // in seconds
  created_by: any; // User type
  created_at: string;
  updated_at: string;
}

export interface AIQuestion {
  id: number;
  quiz_generator: AIQuizGenerator;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'essay' | 'short_answer';
  correct_answer: string;
  options?: string[]; // For multiple choice
  explanation?: string;
  difficulty_score?: number;
  created_at: string;
  updated_at: string;
}

export interface AILessonSummarizer {
  id: number;
  model: AIModel;
  lesson: any; // Lesson type
  summary_type: 'brief' | 'detailed' | 'key_points';
  generated_summary: string;
  key_points: string[];
  word_count: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_time?: number; // in seconds
  created_by: any; // User type
  created_at: string;
  updated_at: string;
}

export interface AIPerformancePredictor {
  id: number;
  model: AIModel;
  student: any; // Student type
  subject: any; // Subject type
  prediction_type: 'grade' | 'attendance' | 'engagement' | 'completion';
  predicted_value: number;
  confidence_score: number;
  factors: string[]; // Factors influencing prediction
  recommendations: string[]; // Recommended actions
  target_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AIAttendanceAnomalyDetector {
  id: number;
  model: AIModel;
  class_enrolled: any; // Class type
  detection_date: string;
  anomaly_type: 'absenteeism' | 'late_arrival' | 'early_departure' | 'pattern_change';
  confidence_score: number;
  affected_students: any[]; // Student types
  description: string;
  recommendations: string[];
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface AINaturalLanguageQuery {
  id: number;
  model: AIModel;
  user: any; // User type
  query_text: string;
  query_type: 'academic' | 'attendance' | 'financial' | 'operational' | 'general';
  response_text: string;
  data_sources: string[]; // Sources used for response
  confidence_score: number;
  processing_time: number; // in seconds
  created_at: string;
  updated_at: string;
}

export interface AITrainingJob {
  id: number;
  model: AIModel;
  job_type: 'initial' | 'retrain' | 'fine_tune';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  training_data_size: number;
  validation_data_size: number;
  epochs: number;
  batch_size: number;
  learning_rate: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_by: any; // User type
  created_at: string;
  updated_at: string;
}

export interface AIDataSource {
  id: number;
  name: string;
  description: string;
  source_type: 'database' | 'file' | 'api' | 'streaming';
  connection_string?: string;
  file_path?: string;
  api_endpoint?: string;
  data_format: 'json' | 'csv' | 'xml' | 'parquet';
  schema: any; // JSON field for data schema
  is_active: boolean;
  last_sync?: string;
  created_at: string;
  updated_at: string;
}

export interface AIUsageLog {
  id: number;
  model: AIModel;
  user: any; // User type
  action: 'query' | 'generate' | 'predict' | 'analyze' | 'train';
  input_data: any; // JSON field for input data
  output_data: any; // JSON field for output data
  processing_time: number; // in seconds
  tokens_used?: number;
  cost?: number;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// API Response Types
interface ApiResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Store State
interface AIToolsState {
  // Models
  models: ApiResponse<AIModel> | null;
  currentModel: AIModel | null;
  modelsLoading: boolean;
  modelsError: string | null;

  // Quiz Generator
  quizGenerators: ApiResponse<AIQuizGenerator> | null;
  currentQuizGenerator: AIQuizGenerator | null;
  quizGeneratorsLoading: boolean;
  quizGeneratorsError: string | null;

  // Questions
  questions: ApiResponse<AIQuestion> | null;
  currentQuestion: AIQuestion | null;
  questionsLoading: boolean;
  questionsError: string | null;

  // Lesson Summarizer
  lessonSummarizers: ApiResponse<AILessonSummarizer> | null;
  currentLessonSummarizer: AILessonSummarizer | null;
  lessonSummarizersLoading: boolean;
  lessonSummarizersError: string | null;

  // Performance Predictor
  performancePredictors: ApiResponse<AIPerformancePredictor> | null;
  currentPerformancePredictor: AIPerformancePredictor | null;
  performancePredictorsLoading: boolean;
  performancePredictorsError: string | null;

  // Attendance Anomaly Detector
  attendanceAnomalyDetectors: ApiResponse<AIAttendanceAnomalyDetector> | null;
  currentAttendanceAnomalyDetector: AIAttendanceAnomalyDetector | null;
  attendanceAnomalyDetectorsLoading: boolean;
  attendanceAnomalyDetectorsError: string | null;

  // Natural Language Query
  naturalLanguageQueries: ApiResponse<AINaturalLanguageQuery> | null;
  currentNaturalLanguageQuery: AINaturalLanguageQuery | null;
  naturalLanguageQueriesLoading: boolean;
  naturalLanguageQueriesError: string | null;

  // Training Jobs
  trainingJobs: ApiResponse<AITrainingJob> | null;
  currentTrainingJob: AITrainingJob | null;
  trainingJobsLoading: boolean;
  trainingJobsError: string | null;

  // Data Sources
  dataSources: ApiResponse<AIDataSource> | null;
  currentDataSource: AIDataSource | null;
  dataSourcesLoading: boolean;
  dataSourcesError: string | null;

  // Usage Logs
  usageLogs: ApiResponse<AIUsageLog> | null;
  currentUsageLog: AIUsageLog | null;
  usageLogsLoading: boolean;
  usageLogsError: string | null;

  // Actions
  fetchModels: (params?: any) => Promise<void>;
  fetchModel: (id: number) => Promise<void>;
  createModel: (data: Partial<AIModel>) => Promise<void>;
  updateModel: (id: number, data: Partial<AIModel>) => Promise<void>;
  deleteModel: (id: number) => Promise<void>;

  fetchQuizGenerators: (params?: any) => Promise<void>;
  fetchQuizGenerator: (id: number) => Promise<void>;
  createQuizGenerator: (data: Partial<AIQuizGenerator>) => Promise<void>;
  updateQuizGenerator: (id: number, data: Partial<AIQuizGenerator>) => Promise<void>;
  deleteQuizGenerator: (id: number) => Promise<void>;

  fetchQuestions: (params?: any) => Promise<void>;
  fetchQuestion: (id: number) => Promise<void>;
  createQuestion: (data: Partial<AIQuestion>) => Promise<void>;
  updateQuestion: (id: number, data: Partial<AIQuestion>) => Promise<void>;
  deleteQuestion: (id: number) => Promise<void>;

  fetchLessonSummarizers: (params?: any) => Promise<void>;
  fetchLessonSummarizer: (id: number) => Promise<void>;
  createLessonSummarizer: (data: Partial<AILessonSummarizer>) => Promise<void>;
  updateLessonSummarizer: (id: number, data: Partial<AILessonSummarizer>) => Promise<void>;
  deleteLessonSummarizer: (id: number) => Promise<void>;

  fetchPerformancePredictors: (params?: any) => Promise<void>;
  fetchPerformancePredictor: (id: number) => Promise<void>;
  createPerformancePredictor: (data: Partial<AIPerformancePredictor>) => Promise<void>;
  updatePerformancePredictor: (id: number, data: Partial<AIPerformancePredictor>) => Promise<void>;
  deletePerformancePredictor: (id: number) => Promise<void>;

  fetchAttendanceAnomalyDetectors: (params?: any) => Promise<void>;
  fetchAttendanceAnomalyDetector: (id: number) => Promise<void>;
  createAttendanceAnomalyDetector: (data: Partial<AIAttendanceAnomalyDetector>) => Promise<void>;
  updateAttendanceAnomalyDetector: (id: number, data: Partial<AIAttendanceAnomalyDetector>) => Promise<void>;
  deleteAttendanceAnomalyDetector: (id: number) => Promise<void>;

  fetchNaturalLanguageQueries: (params?: any) => Promise<void>;
  fetchNaturalLanguageQuery: (id: number) => Promise<void>;
  createNaturalLanguageQuery: (data: Partial<AINaturalLanguageQuery>) => Promise<void>;
  updateNaturalLanguageQuery: (id: number, data: Partial<AINaturalLanguageQuery>) => Promise<void>;
  deleteNaturalLanguageQuery: (id: number) => Promise<void>;

  fetchTrainingJobs: (params?: any) => Promise<void>;
  fetchTrainingJob: (id: number) => Promise<void>;
  createTrainingJob: (data: Partial<AITrainingJob>) => Promise<void>;
  updateTrainingJob: (id: number, data: Partial<AITrainingJob>) => Promise<void>;
  deleteTrainingJob: (id: number) => Promise<void>;

  fetchDataSources: (params?: any) => Promise<void>;
  fetchDataSource: (id: number) => Promise<void>;
  createDataSource: (data: Partial<AIDataSource>) => Promise<void>;
  updateDataSource: (id: number, data: Partial<AIDataSource>) => Promise<void>;
  deleteDataSource: (id: number) => Promise<void>;

  fetchUsageLogs: (params?: any) => Promise<void>;
  fetchUsageLog: (id: number) => Promise<void>;
  createUsageLog: (data: Partial<AIUsageLog>) => Promise<void>;
  updateUsageLog: (id: number, data: Partial<AIUsageLog>) => Promise<void>;
  deleteUsageLog: (id: number) => Promise<void>;

  // Special Actions
  generateQuiz: (subjectId: number, topic: string, options: any) => Promise<void>;
  summarizeLesson: (lessonId: number, summaryType: string) => Promise<void>;
  predictPerformance: (studentId: number, subjectId: number, predictionType: string) => Promise<void>;
  detectAnomalies: (classId: number, date: string) => Promise<void>;
  processQuery: (query: string, queryType: string) => Promise<void>;
  startTraining: (modelId: number, trainingData: any) => Promise<void>;

  // Utility actions
  clearErrors: () => void;
  clearCurrent: () => void;
}

// Store Implementation
export const useAIToolsStore = create<AIToolsState>()(
  devtools(
    (set, get) => ({
      // Initial State
      models: null,
      currentModel: null,
      modelsLoading: false,
      modelsError: null,

      quizGenerators: null,
      currentQuizGenerator: null,
      quizGeneratorsLoading: false,
      quizGeneratorsError: null,

      questions: null,
      currentQuestion: null,
      questionsLoading: false,
      questionsError: null,

      lessonSummarizers: null,
      currentLessonSummarizer: null,
      lessonSummarizersLoading: false,
      lessonSummarizersError: null,

      performancePredictors: null,
      currentPerformancePredictor: null,
      performancePredictorsLoading: false,
      performancePredictorsError: null,

      attendanceAnomalyDetectors: null,
      currentAttendanceAnomalyDetector: null,
      attendanceAnomalyDetectorsLoading: false,
      attendanceAnomalyDetectorsError: null,

      naturalLanguageQueries: null,
      currentNaturalLanguageQuery: null,
      naturalLanguageQueriesLoading: false,
      naturalLanguageQueriesError: null,

      trainingJobs: null,
      currentTrainingJob: null,
      trainingJobsLoading: false,
      trainingJobsError: null,

      dataSources: null,
      currentDataSource: null,
      dataSourcesLoading: false,
      dataSourcesError: null,

      usageLogs: null,
      currentUsageLog: null,
      usageLogsLoading: false,
      usageLogsError: null,

      // Model Actions
      fetchModels: async (params = {}) => {
        set({ modelsLoading: true, modelsError: null });
        try {
          const response = await axios.get('/api/ai-tools/models/', { params });
          set({ models: response.data, modelsLoading: false });
        } catch (error: any) {
          set({
            modelsError: error.response?.data?.message || 'Failed to fetch models',
            modelsLoading: false
          });
        }
      },

      fetchModel: async (id: number) => {
        set({ modelsLoading: true, modelsError: null });
        try {
          const response = await axios.get(`/api/ai-tools/models/${id}/`);
          set({ currentModel: response.data, modelsLoading: false });
        } catch (error: any) {
          set({
            modelsError: error.response?.data?.message || 'Failed to fetch model',
            modelsLoading: false
          });
        }
      },

      createModel: async (data: Partial<AIModel>) => {
        set({ modelsLoading: true, modelsError: null });
        try {
          const response = await axios.post('/api/ai-tools/models/', data);
          const newModel = response.data;
          set(state => ({
            models: state.models ? {
              ...state.models,
              results: [newModel, ...state.models.results],
              count: state.models.count + 1
            } : null,
            currentModel: newModel,
            modelsLoading: false
          }));
        } catch (error: any) {
          set({
            modelsError: error.response?.data?.message || 'Failed to create model',
            modelsLoading: false
          });
        }
      },

      updateModel: async (id: number, data: Partial<AIModel>) => {
        set({ modelsLoading: true, modelsError: null });
        try {
          const response = await axios.put(`/api/ai-tools/models/${id}/`, data);
          const updatedModel = response.data;
          set(state => ({
            models: state.models ? {
              ...state.models,
              results: state.models.results.map(model =>
                model.id === id ? updatedModel : model
              )
            } : null,
            currentModel: updatedModel,
            modelsLoading: false
          }));
        } catch (error: any) {
          set({
            modelsError: error.response?.data?.message || 'Failed to update model',
            modelsLoading: false
          });
        }
      },

      deleteModel: async (id: number) => {
        set({ modelsLoading: true, modelsError: null });
        try {
          await axios.delete(`/api/ai-tools/models/${id}/`);
          set(state => ({
            models: state.models ? {
              ...state.models,
              results: state.models.results.filter(model => model.id !== id),
              count: state.models.count - 1
            } : null,
            currentModel: state.currentModel?.id === id ? null : state.currentModel,
            modelsLoading: false
          }));
        } catch (error: any) {
          set({
            modelsError: error.response?.data?.message || 'Failed to delete model',
            modelsLoading: false
          });
        }
      },

      // Quiz Generator Actions
      fetchQuizGenerators: async (params = {}) => {
        set({ quizGeneratorsLoading: true, quizGeneratorsError: null });
        try {
          const response = await axios.get('/api/ai-tools/quiz-generators/', { params });
          set({ quizGenerators: response.data, quizGeneratorsLoading: false });
        } catch (error: any) {
          set({
            quizGeneratorsError: error.response?.data?.message || 'Failed to fetch quiz generators',
            quizGeneratorsLoading: false
          });
        }
      },

      fetchQuizGenerator: async (id: number) => {
        set({ quizGeneratorsLoading: true, quizGeneratorsError: null });
        try {
          const response = await axios.get(`/api/ai-tools/quiz-generators/${id}/`);
          set({ currentQuizGenerator: response.data, quizGeneratorsLoading: false });
        } catch (error: any) {
          set({
            quizGeneratorsError: error.response?.data?.message || 'Failed to fetch quiz generator',
            quizGeneratorsLoading: false
          });
        }
      },

      createQuizGenerator: async (data: Partial<AIQuizGenerator>) => {
        set({ quizGeneratorsLoading: true, quizGeneratorsError: null });
        try {
          const response = await axios.post('/api/ai-tools/quiz-generators/', data);
          const newQuizGenerator = response.data;
          set(state => ({
            quizGenerators: state.quizGenerators ? {
              ...state.quizGenerators,
              results: [newQuizGenerator, ...state.quizGenerators.results],
              count: state.quizGenerators.count + 1
            } : null,
            currentQuizGenerator: newQuizGenerator,
            quizGeneratorsLoading: false
          }));
        } catch (error: any) {
          set({
            quizGeneratorsError: error.response?.data?.message || 'Failed to create quiz generator',
            quizGeneratorsLoading: false
          });
        }
      },

      updateQuizGenerator: async (id: number, data: Partial<AIQuizGenerator>) => {
        set({ quizGeneratorsLoading: true, quizGeneratorsError: null });
        try {
          const response = await axios.put(`/api/ai-tools/quiz-generators/${id}/`, data);
          const updatedQuizGenerator = response.data;
          set(state => ({
            quizGenerators: state.quizGenerators ? {
              ...state.quizGenerators,
              results: state.quizGenerators.results.map(quizGenerator =>
                quizGenerator.id === id ? updatedQuizGenerator : quizGenerator
              )
            } : null,
            currentQuizGenerator: updatedQuizGenerator,
            quizGeneratorsLoading: false
          }));
        } catch (error: any) {
          set({
            quizGeneratorsError: error.response?.data?.message || 'Failed to update quiz generator',
            quizGeneratorsLoading: false
          });
        }
      },

      deleteQuizGenerator: async (id: number) => {
        set({ quizGeneratorsLoading: true, quizGeneratorsError: null });
        try {
          await axios.delete(`/api/ai-tools/quiz-generators/${id}/`);
          set(state => ({
            quizGenerators: state.quizGenerators ? {
              ...state.quizGenerators,
              results: state.quizGenerators.results.filter(quizGenerator => quizGenerator.id !== id),
              count: state.quizGenerators.count - 1
            } : null,
            currentQuizGenerator: state.currentQuizGenerator?.id === id ? null : state.currentQuizGenerator,
            quizGeneratorsLoading: false
          }));
        } catch (error: any) {
          set({
            quizGeneratorsError: error.response?.data?.message || 'Failed to delete quiz generator',
            quizGeneratorsLoading: false
          });
        }
      },

      // Special Actions
      generateQuiz: async (subjectId: number, topic: string, options: any) => {
        set({ quizGeneratorsLoading: true, quizGeneratorsError: null });
        try {
          const response = await axios.post('/api/ai-tools/quiz-generators/generate/', {
            subject: subjectId,
            topic,
            ...options
          });
          const newQuizGenerator = response.data;
          set(state => ({
            quizGenerators: state.quizGenerators ? {
              ...state.quizGenerators,
              results: [newQuizGenerator, ...state.quizGenerators.results],
              count: state.quizGenerators.count + 1
            } : null,
            currentQuizGenerator: newQuizGenerator,
            quizGeneratorsLoading: false
          }));
        } catch (error: any) {
          set({
            quizGeneratorsError: error.response?.data?.message || 'Failed to generate quiz',
            quizGeneratorsLoading: false
          });
        }
      },

      summarizeLesson: async (lessonId: number, summaryType: string) => {
        set({ lessonSummarizersLoading: true, lessonSummarizersError: null });
        try {
          const response = await axios.post('/api/ai-tools/lesson-summarizers/', {
            lesson: lessonId,
            summary_type: summaryType
          });
          const newLessonSummarizer = response.data;
          set(state => ({
            lessonSummarizers: state.lessonSummarizers ? {
              ...state.lessonSummarizers,
              results: [newLessonSummarizer, ...state.lessonSummarizers.results],
              count: state.lessonSummarizers.count + 1
            } : null,
            currentLessonSummarizer: newLessonSummarizer,
            lessonSummarizersLoading: false
          }));
        } catch (error: any) {
          set({
            lessonSummarizersError: error.response?.data?.message || 'Failed to summarize lesson',
            lessonSummarizersLoading: false
          });
        }
      },

      predictPerformance: async (studentId: number, subjectId: number, predictionType: string) => {
        set({ performancePredictorsLoading: true, performancePredictorsError: null });
        try {
          const response = await axios.post('/api/ai-tools/performance-predictors/', {
            student: studentId,
            subject: subjectId,
            prediction_type: predictionType
          });
          const newPerformancePredictor = response.data;
          set(state => ({
            performancePredictors: state.performancePredictors ? {
              ...state.performancePredictors,
              results: [newPerformancePredictor, ...state.performancePredictors.results],
              count: state.performancePredictors.count + 1
            } : null,
            currentPerformancePredictor: newPerformancePredictor,
            performancePredictorsLoading: false
          }));
        } catch (error: any) {
          set({
            performancePredictorsError: error.response?.data?.message || 'Failed to predict performance',
            performancePredictorsLoading: false
          });
        }
      },

      detectAnomalies: async (classId: number, date: string) => {
        set({ attendanceAnomalyDetectorsLoading: true, attendanceAnomalyDetectorsError: null });
        try {
          const response = await axios.post('/api/ai-tools/attendance-anomaly-detectors/', {
            class_enrolled: classId,
            detection_date: date
          });
          const newAnomalyDetector = response.data;
          set(state => ({
            attendanceAnomalyDetectors: state.attendanceAnomalyDetectors ? {
              ...state.attendanceAnomalyDetectors,
              results: [newAnomalyDetector, ...state.attendanceAnomalyDetectors.results],
              count: state.attendanceAnomalyDetectors.count + 1
            } : null,
            currentAttendanceAnomalyDetector: newAnomalyDetector,
            attendanceAnomalyDetectorsLoading: false
          }));
        } catch (error: any) {
          set({
            attendanceAnomalyDetectorsError: error.response?.data?.message || 'Failed to detect anomalies',
            attendanceAnomalyDetectorsLoading: false
          });
        }
      },

      processQuery: async (query: string, queryType: string) => {
        set({ naturalLanguageQueriesLoading: true, naturalLanguageQueriesError: null });
        try {
          const response = await axios.post('/api/ai-tools/natural-language-queries/', {
            query_text: query,
            query_type: queryType
          });
          const newQuery = response.data;
          set(state => ({
            naturalLanguageQueries: state.naturalLanguageQueries ? {
              ...state.naturalLanguageQueries,
              results: [newQuery, ...state.naturalLanguageQueries.results],
              count: state.naturalLanguageQueries.count + 1
            } : null,
            currentNaturalLanguageQuery: newQuery,
            naturalLanguageQueriesLoading: false
          }));
        } catch (error: any) {
          set({
            naturalLanguageQueriesError: error.response?.data?.message || 'Failed to process query',
            naturalLanguageQueriesLoading: false
          });
        }
      },

      startTraining: async (modelId: number, trainingData: any) => {
        set({ trainingJobsLoading: true, trainingJobsError: null });
        try {
          const response = await axios.post('/api/ai-tools/training-jobs/', {
            model: modelId,
            ...trainingData
          });
          const newTrainingJob = response.data;
          set(state => ({
            trainingJobs: state.trainingJobs ? {
              ...state.trainingJobs,
              results: [newTrainingJob, ...state.trainingJobs.results],
              count: state.trainingJobs.count + 1
            } : null,
            currentTrainingJob: newTrainingJob,
            trainingJobsLoading: false
          }));
        } catch (error: any) {
          set({
            trainingJobsError: error.response?.data?.message || 'Failed to start training',
            trainingJobsLoading: false
          });
        }
      },

      // Utility Actions
      clearErrors: () => {
        set({
          modelsError: null,
          quizGeneratorsError: null,
          questionsError: null,
          lessonSummarizersError: null,
          performancePredictorsError: null,
          attendanceAnomalyDetectorsError: null,
          naturalLanguageQueriesError: null,
          trainingJobsError: null,
          dataSourcesError: null,
          usageLogsError: null
        });
      },

      clearCurrent: () => {
        set({
          currentModel: null,
          currentQuizGenerator: null,
          currentQuestion: null,
          currentLessonSummarizer: null,
          currentPerformancePredictor: null,
          currentAttendanceAnomalyDetector: null,
          currentNaturalLanguageQuery: null,
          currentTrainingJob: null,
          currentDataSource: null,
          currentUsageLog: null
        });
      },
    }),
    {
      name: 'ai-tools-store',
    }
  )
);
