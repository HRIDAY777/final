/* eslint-disable no-unused-vars */
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

      // Questions Actions
      fetchQuestions: async (params = {}) => {
        set({ questionsLoading: true, questionsError: null });
        try {
          const response = await axios.get('/api/ai-tools/questions/', { params });
          set({ questions: response.data, questionsLoading: false });
        } catch (error: any) {
          set({
            questionsError: error.response?.data?.message || 'Failed to fetch questions',
            questionsLoading: false
          });
        }
      },

      fetchQuestion: async (id: number) => {
        set({ questionsLoading: true, questionsError: null });
        try {
          const response = await axios.get(`/api/ai-tools/questions/${id}/`);
          set({ currentQuestion: response.data, questionsLoading: false });
        } catch (error: any) {
          set({
            questionsError: error.response?.data?.message || 'Failed to fetch question',
            questionsLoading: false
          });
        }
      },

      createQuestion: async (data: Partial<AIQuestion>) => {
        set({ questionsLoading: true, questionsError: null });
        try {
          const response = await axios.post('/api/ai-tools/questions/', data);
          const newQuestion = response.data;
          set(state => ({
            questions: state.questions ? {
              ...state.questions,
              results: [newQuestion, ...state.questions.results],
              count: state.questions.count + 1
            } : null,
            currentQuestion: newQuestion,
            questionsLoading: false
          }));
        } catch (error: any) {
          set({
            questionsError: error.response?.data?.message || 'Failed to create question',
            questionsLoading: false
          });
        }
      },

      updateQuestion: async (id: number, data: Partial<AIQuestion>) => {
        set({ questionsLoading: true, questionsError: null });
        try {
          const response = await axios.put(`/api/ai-tools/questions/${id}/`, data);
          const updatedQuestion = response.data;
          set(state => ({
            questions: state.questions ? {
              ...state.questions,
              results: state.questions.results.map(question =>
                question.id === id ? updatedQuestion : question
              )
            } : null,
            currentQuestion: updatedQuestion,
            questionsLoading: false
          }));
        } catch (error: any) {
          set({
            questionsError: error.response?.data?.message || 'Failed to update question',
            questionsLoading: false
          });
        }
      },

      deleteQuestion: async (id: number) => {
        set({ questionsLoading: true, questionsError: null });
        try {
          await axios.delete(`/api/ai-tools/questions/${id}/`);
          set(state => ({
            questions: state.questions ? {
              ...state.questions,
              results: state.questions.results.filter(question => question.id !== id),
              count: state.questions.count - 1
            } : null,
            currentQuestion: state.currentQuestion?.id === id ? null : state.currentQuestion,
            questionsLoading: false
          }));
        } catch (error: any) {
          set({
            questionsError: error.response?.data?.message || 'Failed to delete question',
            questionsLoading: false
          });
        }
      },

      // Lesson Summarizer Actions
      fetchLessonSummarizers: async (params = {}) => {
        set({ lessonSummarizersLoading: true, lessonSummarizersError: null });
        try {
          const response = await axios.get('/api/ai-tools/lesson-summarizers/', { params });
          set({ lessonSummarizers: response.data, lessonSummarizersLoading: false });
        } catch (error: any) {
          set({
            lessonSummarizersError: error.response?.data?.message || 'Failed to fetch lesson summarizers',
            lessonSummarizersLoading: false
          });
        }
      },

      fetchLessonSummarizer: async (id: number) => {
        set({ lessonSummarizersLoading: true, lessonSummarizersError: null });
        try {
          const response = await axios.get(`/api/ai-tools/lesson-summarizers/${id}/`);
          set({ currentLessonSummarizer: response.data, lessonSummarizersLoading: false });
        } catch (error: any) {
          set({
            lessonSummarizersError: error.response?.data?.message || 'Failed to fetch lesson summarizer',
            lessonSummarizersLoading: false
          });
        }
      },

      createLessonSummarizer: async (data: Partial<AILessonSummarizer>) => {
        set({ lessonSummarizersLoading: true, lessonSummarizersError: null });
        try {
          const response = await axios.post('/api/ai-tools/lesson-summarizers/', data);
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
            lessonSummarizersError: error.response?.data?.message || 'Failed to create lesson summarizer',
            lessonSummarizersLoading: false
          });
        }
      },

      updateLessonSummarizer: async (id: number, data: Partial<AILessonSummarizer>) => {
        set({ lessonSummarizersLoading: true, lessonSummarizersError: null });
        try {
          const response = await axios.put(`/api/ai-tools/lesson-summarizers/${id}/`, data);
          const updatedLessonSummarizer = response.data;
          set(state => ({
            lessonSummarizers: state.lessonSummarizers ? {
              ...state.lessonSummarizers,
              results: state.lessonSummarizers.results.map(summarizer =>
                summarizer.id === id ? updatedLessonSummarizer : summarizer
              )
            } : null,
            currentLessonSummarizer: updatedLessonSummarizer,
            lessonSummarizersLoading: false
          }));
        } catch (error: any) {
          set({
            lessonSummarizersError: error.response?.data?.message || 'Failed to update lesson summarizer',
            lessonSummarizersLoading: false
          });
        }
      },

      deleteLessonSummarizer: async (id: number) => {
        set({ lessonSummarizersLoading: true, lessonSummarizersError: null });
        try {
          await axios.delete(`/api/ai-tools/lesson-summarizers/${id}/`);
          set(state => ({
            lessonSummarizers: state.lessonSummarizers ? {
              ...state.lessonSummarizers,
              results: state.lessonSummarizers.results.filter(summarizer => summarizer.id !== id),
              count: state.lessonSummarizers.count - 1
            } : null,
            currentLessonSummarizer: state.currentLessonSummarizer?.id === id ? null : state.currentLessonSummarizer,
            lessonSummarizersLoading: false
          }));
        } catch (error: any) {
          set({
            lessonSummarizersError: error.response?.data?.message || 'Failed to delete lesson summarizer',
            lessonSummarizersLoading: false
          });
        }
      },

      // Performance Predictor Actions
      fetchPerformancePredictors: async (params = {}) => {
        set({ performancePredictorsLoading: true, performancePredictorsError: null });
        try {
          const response = await axios.get('/api/ai-tools/performance-predictors/', { params });
          set({ performancePredictors: response.data, performancePredictorsLoading: false });
        } catch (error: any) {
          set({
            performancePredictorsError: error.response?.data?.message || 'Failed to fetch performance predictors',
            performancePredictorsLoading: false
          });
        }
      },

      fetchPerformancePredictor: async (id: number) => {
        set({ performancePredictorsLoading: true, performancePredictorsError: null });
        try {
          const response = await axios.get(`/api/ai-tools/performance-predictors/${id}/`);
          set({ currentPerformancePredictor: response.data, performancePredictorsLoading: false });
        } catch (error: any) {
          set({
            performancePredictorsError: error.response?.data?.message || 'Failed to fetch performance predictor',
            performancePredictorsLoading: false
          });
        }
      },

      createPerformancePredictor: async (data: Partial<AIPerformancePredictor>) => {
        set({ performancePredictorsLoading: true, performancePredictorsError: null });
        try {
          const response = await axios.post('/api/ai-tools/performance-predictors/', data);
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
            performancePredictorsError: error.response?.data?.message || 'Failed to create performance predictor',
            performancePredictorsLoading: false
          });
        }
      },

      updatePerformancePredictor: async (id: number, data: Partial<AIPerformancePredictor>) => {
        set({ performancePredictorsLoading: true, performancePredictorsError: null });
        try {
          const response = await axios.put(`/api/ai-tools/performance-predictors/${id}/`, data);
          const updatedPerformancePredictor = response.data;
          set(state => ({
            performancePredictors: state.performancePredictors ? {
              ...state.performancePredictors,
              results: state.performancePredictors.results.map(predictor =>
                predictor.id === id ? updatedPerformancePredictor : predictor
              )
            } : null,
            currentPerformancePredictor: updatedPerformancePredictor,
            performancePredictorsLoading: false
          }));
        } catch (error: any) {
          set({
            performancePredictorsError: error.response?.data?.message || 'Failed to update performance predictor',
            performancePredictorsLoading: false
          });
        }
      },

      deletePerformancePredictor: async (id: number) => {
        set({ performancePredictorsLoading: true, performancePredictorsError: null });
        try {
          await axios.delete(`/api/ai-tools/performance-predictors/${id}/`);
          set(state => ({
            performancePredictors: state.performancePredictors ? {
              ...state.performancePredictors,
              results: state.performancePredictors.results.filter(predictor => predictor.id !== id),
              count: state.performancePredictors.count - 1
            } : null,
            currentPerformancePredictor: state.currentPerformancePredictor?.id === id ? null : state.currentPerformancePredictor,
            performancePredictorsLoading: false
          }));
        } catch (error: any) {
          set({
            performancePredictorsError: error.response?.data?.message || 'Failed to delete performance predictor',
            performancePredictorsLoading: false
          });
        }
      },

      // Attendance Anomaly Detector Actions
      fetchAttendanceAnomalyDetectors: async (params = {}) => {
        set({ attendanceAnomalyDetectorsLoading: true, attendanceAnomalyDetectorsError: null });
        try {
          const response = await axios.get('/api/ai-tools/attendance-anomaly-detectors/', { params });
          set({ attendanceAnomalyDetectors: response.data, attendanceAnomalyDetectorsLoading: false });
        } catch (error: any) {
          set({
            attendanceAnomalyDetectorsError: error.response?.data?.message || 'Failed to fetch attendance anomaly detectors',
            attendanceAnomalyDetectorsLoading: false
          });
        }
      },

      fetchAttendanceAnomalyDetector: async (id: number) => {
        set({ attendanceAnomalyDetectorsLoading: true, attendanceAnomalyDetectorsError: null });
        try {
          const response = await axios.get(`/api/ai-tools/attendance-anomaly-detectors/${id}/`);
          set({ currentAttendanceAnomalyDetector: response.data, attendanceAnomalyDetectorsLoading: false });
        } catch (error: any) {
          set({
            attendanceAnomalyDetectorsError: error.response?.data?.message || 'Failed to fetch attendance anomaly detector',
            attendanceAnomalyDetectorsLoading: false
          });
        }
      },

      createAttendanceAnomalyDetector: async (data: Partial<AIAttendanceAnomalyDetector>) => {
        set({ attendanceAnomalyDetectorsLoading: true, attendanceAnomalyDetectorsError: null });
        try {
          const response = await axios.post('/api/ai-tools/attendance-anomaly-detectors/', data);
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
            attendanceAnomalyDetectorsError: error.response?.data?.message || 'Failed to create attendance anomaly detector',
            attendanceAnomalyDetectorsLoading: false
          });
        }
      },

      updateAttendanceAnomalyDetector: async (id: number, data: Partial<AIAttendanceAnomalyDetector>) => {
        set({ attendanceAnomalyDetectorsLoading: true, attendanceAnomalyDetectorsError: null });
        try {
          const response = await axios.put(`/api/ai-tools/attendance-anomaly-detectors/${id}/`, data);
          const updatedAnomalyDetector = response.data;
          set(state => ({
            attendanceAnomalyDetectors: state.attendanceAnomalyDetectors ? {
              ...state.attendanceAnomalyDetectors,
              results: state.attendanceAnomalyDetectors.results.map(detector =>
                detector.id === id ? updatedAnomalyDetector : detector
              )
            } : null,
            currentAttendanceAnomalyDetector: updatedAnomalyDetector,
            attendanceAnomalyDetectorsLoading: false
          }));
        } catch (error: any) {
          set({
            attendanceAnomalyDetectorsError: error.response?.data?.message || 'Failed to update attendance anomaly detector',
            attendanceAnomalyDetectorsLoading: false
          });
        }
      },

      deleteAttendanceAnomalyDetector: async (id: number) => {
        set({ attendanceAnomalyDetectorsLoading: true, attendanceAnomalyDetectorsError: null });
        try {
          await axios.delete(`/api/ai-tools/attendance-anomaly-detectors/${id}/`);
          set(state => ({
            attendanceAnomalyDetectors: state.attendanceAnomalyDetectors ? {
              ...state.attendanceAnomalyDetectors,
              results: state.attendanceAnomalyDetectors.results.filter(detector => detector.id !== id),
              count: state.attendanceAnomalyDetectors.count - 1
            } : null,
            currentAttendanceAnomalyDetector: state.currentAttendanceAnomalyDetector?.id === id ? null : state.currentAttendanceAnomalyDetector,
            attendanceAnomalyDetectorsLoading: false
          }));
        } catch (error: any) {
          set({
            attendanceAnomalyDetectorsError: error.response?.data?.message || 'Failed to delete attendance anomaly detector',
            attendanceAnomalyDetectorsLoading: false
          });
        }
      },

      // Natural Language Query Actions
      fetchNaturalLanguageQueries: async (params = {}) => {
        set({ naturalLanguageQueriesLoading: true, naturalLanguageQueriesError: null });
        try {
          const response = await axios.get('/api/ai-tools/natural-language-queries/', { params });
          set({ naturalLanguageQueries: response.data, naturalLanguageQueriesLoading: false });
        } catch (error: any) {
          set({
            naturalLanguageQueriesError: error.response?.data?.message || 'Failed to fetch natural language queries',
            naturalLanguageQueriesLoading: false
          });
        }
      },

      fetchNaturalLanguageQuery: async (id: number) => {
        set({ naturalLanguageQueriesLoading: true, naturalLanguageQueriesError: null });
        try {
          const response = await axios.get(`/api/ai-tools/natural-language-queries/${id}/`);
          set({ currentNaturalLanguageQuery: response.data, naturalLanguageQueriesLoading: false });
        } catch (error: any) {
          set({
            naturalLanguageQueriesError: error.response?.data?.message || 'Failed to fetch natural language query',
            naturalLanguageQueriesLoading: false
          });
        }
      },

      createNaturalLanguageQuery: async (data: Partial<AINaturalLanguageQuery>) => {
        set({ naturalLanguageQueriesLoading: true, naturalLanguageQueriesError: null });
        try {
          const response = await axios.post('/api/ai-tools/natural-language-queries/', data);
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
            naturalLanguageQueriesError: error.response?.data?.message || 'Failed to create natural language query',
            naturalLanguageQueriesLoading: false
          });
        }
      },

      updateNaturalLanguageQuery: async (id: number, data: Partial<AINaturalLanguageQuery>) => {
        set({ naturalLanguageQueriesLoading: true, naturalLanguageQueriesError: null });
        try {
          const response = await axios.put(`/api/ai-tools/natural-language-queries/${id}/`, data);
          const updatedQuery = response.data;
          set(state => ({
            naturalLanguageQueries: state.naturalLanguageQueries ? {
              ...state.naturalLanguageQueries,
              results: state.naturalLanguageQueries.results.map(query =>
                query.id === id ? updatedQuery : query
              )
            } : null,
            currentNaturalLanguageQuery: updatedQuery,
            naturalLanguageQueriesLoading: false
          }));
        } catch (error: any) {
          set({
            naturalLanguageQueriesError: error.response?.data?.message || 'Failed to update natural language query',
            naturalLanguageQueriesLoading: false
          });
        }
      },

      deleteNaturalLanguageQuery: async (id: number) => {
        set({ naturalLanguageQueriesLoading: true, naturalLanguageQueriesError: null });
        try {
          await axios.delete(`/api/ai-tools/natural-language-queries/${id}/`);
          set(state => ({
            naturalLanguageQueries: state.naturalLanguageQueries ? {
              ...state.naturalLanguageQueries,
              results: state.naturalLanguageQueries.results.filter(query => query.id !== id),
              count: state.naturalLanguageQueries.count - 1
            } : null,
            currentNaturalLanguageQuery: state.currentNaturalLanguageQuery?.id === id ? null : state.currentNaturalLanguageQuery,
            naturalLanguageQueriesLoading: false
          }));
        } catch (error: any) {
          set({
            naturalLanguageQueriesError: error.response?.data?.message || 'Failed to delete natural language query',
            naturalLanguageQueriesLoading: false
          });
        }
      },

      // Training Jobs Actions
      fetchTrainingJobs: async (params = {}) => {
        set({ trainingJobsLoading: true, trainingJobsError: null });
        try {
          const response = await axios.get('/api/ai-tools/training-jobs/', { params });
          set({ trainingJobs: response.data, trainingJobsLoading: false });
        } catch (error: any) {
          set({
            trainingJobsError: error.response?.data?.message || 'Failed to fetch training jobs',
            trainingJobsLoading: false
          });
        }
      },

      fetchTrainingJob: async (id: number) => {
        set({ trainingJobsLoading: true, trainingJobsError: null });
        try {
          const response = await axios.get(`/api/ai-tools/training-jobs/${id}/`);
          set({ currentTrainingJob: response.data, trainingJobsLoading: false });
        } catch (error: any) {
          set({
            trainingJobsError: error.response?.data?.message || 'Failed to fetch training job',
            trainingJobsLoading: false
          });
        }
      },

      createTrainingJob: async (data: Partial<AITrainingJob>) => {
        set({ trainingJobsLoading: true, trainingJobsError: null });
        try {
          const response = await axios.post('/api/ai-tools/training-jobs/', data);
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
            trainingJobsError: error.response?.data?.message || 'Failed to create training job',
            trainingJobsLoading: false
          });
        }
      },

      updateTrainingJob: async (id: number, data: Partial<AITrainingJob>) => {
        set({ trainingJobsLoading: true, trainingJobsError: null });
        try {
          const response = await axios.put(`/api/ai-tools/training-jobs/${id}/`, data);
          const updatedTrainingJob = response.data;
          set(state => ({
            trainingJobs: state.trainingJobs ? {
              ...state.trainingJobs,
              results: state.trainingJobs.results.map(job =>
                job.id === id ? updatedTrainingJob : job
              )
            } : null,
            currentTrainingJob: updatedTrainingJob,
            trainingJobsLoading: false
          }));
        } catch (error: any) {
          set({
            trainingJobsError: error.response?.data?.message || 'Failed to update training job',
            trainingJobsLoading: false
          });
        }
      },

      deleteTrainingJob: async (id: number) => {
        set({ trainingJobsLoading: true, trainingJobsError: null });
        try {
          await axios.delete(`/api/ai-tools/training-jobs/${id}/`);
          set(state => ({
            trainingJobs: state.trainingJobs ? {
              ...state.trainingJobs,
              results: state.trainingJobs.results.filter(job => job.id !== id),
              count: state.trainingJobs.count - 1
            } : null,
            currentTrainingJob: state.currentTrainingJob?.id === id ? null : state.currentTrainingJob,
            trainingJobsLoading: false
          }));
        } catch (error: any) {
          set({
            trainingJobsError: error.response?.data?.message || 'Failed to delete training job',
            trainingJobsLoading: false
          });
        }
      },

      // Data Sources Actions
      fetchDataSources: async (params = {}) => {
        set({ dataSourcesLoading: true, dataSourcesError: null });
        try {
          const response = await axios.get('/api/ai-tools/data-sources/', { params });
          set({ dataSources: response.data, dataSourcesLoading: false });
        } catch (error: any) {
          set({
            dataSourcesError: error.response?.data?.message || 'Failed to fetch data sources',
            dataSourcesLoading: false
          });
        }
      },

      fetchDataSource: async (id: number) => {
        set({ dataSourcesLoading: true, dataSourcesError: null });
        try {
          const response = await axios.get(`/api/ai-tools/data-sources/${id}/`);
          set({ currentDataSource: response.data, dataSourcesLoading: false });
        } catch (error: any) {
          set({
            dataSourcesError: error.response?.data?.message || 'Failed to fetch data source',
            dataSourcesLoading: false
          });
        }
      },

      createDataSource: async (data: Partial<AIDataSource>) => {
        set({ dataSourcesLoading: true, dataSourcesError: null });
        try {
          const response = await axios.post('/api/ai-tools/data-sources/', data);
          const newDataSource = response.data;
          set(state => ({
            dataSources: state.dataSources ? {
              ...state.dataSources,
              results: [newDataSource, ...state.dataSources.results],
              count: state.dataSources.count + 1
            } : null,
            currentDataSource: newDataSource,
            dataSourcesLoading: false
          }));
        } catch (error: any) {
          set({
            dataSourcesError: error.response?.data?.message || 'Failed to create data source',
            dataSourcesLoading: false
          });
        }
      },

      updateDataSource: async (id: number, data: Partial<AIDataSource>) => {
        set({ dataSourcesLoading: true, dataSourcesError: null });
        try {
          const response = await axios.put(`/api/ai-tools/data-sources/${id}/`, data);
          const updatedDataSource = response.data;
          set(state => ({
            dataSources: state.dataSources ? {
              ...state.dataSources,
              results: state.dataSources.results.map(source =>
                source.id === id ? updatedDataSource : source
              )
            } : null,
            currentDataSource: updatedDataSource,
            dataSourcesLoading: false
          }));
        } catch (error: any) {
          set({
            dataSourcesError: error.response?.data?.message || 'Failed to update data source',
            dataSourcesLoading: false
          });
        }
      },

      deleteDataSource: async (id: number) => {
        set({ dataSourcesLoading: true, dataSourcesError: null });
        try {
          await axios.delete(`/api/ai-tools/data-sources/${id}/`);
          set(state => ({
            dataSources: state.dataSources ? {
              ...state.dataSources,
              results: state.dataSources.results.filter(source => source.id !== id),
              count: state.dataSources.count - 1
            } : null,
            currentDataSource: state.currentDataSource?.id === id ? null : state.currentDataSource,
            dataSourcesLoading: false
          }));
        } catch (error: any) {
          set({
            dataSourcesError: error.response?.data?.message || 'Failed to delete data source',
            dataSourcesLoading: false
          });
        }
      },

      // Usage Logs Actions
      fetchUsageLogs: async (params = {}) => {
        set({ usageLogsLoading: true, usageLogsError: null });
        try {
          const response = await axios.get('/api/ai-tools/usage-logs/', { params });
          set({ usageLogs: response.data, usageLogsLoading: false });
        } catch (error: any) {
          set({
            usageLogsError: error.response?.data?.message || 'Failed to fetch usage logs',
            usageLogsLoading: false
          });
        }
      },

      fetchUsageLog: async (id: number) => {
        set({ usageLogsLoading: true, usageLogsError: null });
        try {
          const response = await axios.get(`/api/ai-tools/usage-logs/${id}/`);
          set({ currentUsageLog: response.data, usageLogsLoading: false });
        } catch (error: any) {
          set({
            usageLogsError: error.response?.data?.message || 'Failed to fetch usage log',
            usageLogsLoading: false
          });
        }
      },

      createUsageLog: async (data: Partial<AIUsageLog>) => {
        set({ usageLogsLoading: true, usageLogsError: null });
        try {
          const response = await axios.post('/api/ai-tools/usage-logs/', data);
          const newUsageLog = response.data;
          set(state => ({
            usageLogs: state.usageLogs ? {
              ...state.usageLogs,
              results: [newUsageLog, ...state.usageLogs.results],
              count: state.usageLogs.count + 1
            } : null,
            currentUsageLog: newUsageLog,
            usageLogsLoading: false
          }));
        } catch (error: any) {
          set({
            usageLogsError: error.response?.data?.message || 'Failed to create usage log',
            usageLogsLoading: false
          });
        }
      },

      updateUsageLog: async (id: number, data: Partial<AIUsageLog>) => {
        set({ usageLogsLoading: true, usageLogsError: null });
        try {
          const response = await axios.put(`/api/ai-tools/usage-logs/${id}/`, data);
          const updatedUsageLog = response.data;
          set(state => ({
            usageLogs: state.usageLogs ? {
              ...state.usageLogs,
              results: state.usageLogs.results.map(log =>
                log.id === id ? updatedUsageLog : log
              )
            } : null,
            currentUsageLog: updatedUsageLog,
            usageLogsLoading: false
          }));
        } catch (error: any) {
          set({
            usageLogsError: error.response?.data?.message || 'Failed to update usage log',
            usageLogsLoading: false
          });
        }
      },

      deleteUsageLog: async (id: number) => {
        set({ usageLogsLoading: true, usageLogsError: null });
        try {
          await axios.delete(`/api/ai-tools/usage-logs/${id}/`);
          set(state => ({
            usageLogs: state.usageLogs ? {
              ...state.usageLogs,
              results: state.usageLogs.results.filter(log => log.id !== id),
              count: state.usageLogs.count - 1
            } : null,
            currentUsageLog: state.currentUsageLog?.id === id ? null : state.currentUsageLog,
            usageLogsLoading: false
          }));
        } catch (error: any) {
          set({
            usageLogsError: error.response?.data?.message || 'Failed to delete usage log',
            usageLogsLoading: false
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
