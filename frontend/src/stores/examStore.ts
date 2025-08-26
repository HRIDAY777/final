import { create } from 'zustand';
import { 
  Exam, ExamSchedule, Question, Answer, ExamResult, 
  StudentAnswer, Quiz, ExamSettings, PaginatedResponse 
} from '../types';
import { examAPI, handleApiError } from '../services/api';

interface ExamState {
  // Exams
  exams: PaginatedResponse<Exam> | null;
  currentExam: Exam | null;
  examsLoading: boolean;
  examsError: string | null;

  // Schedules
  schedules: PaginatedResponse<ExamSchedule> | null;
  currentSchedule: ExamSchedule | null;
  schedulesLoading: boolean;
  schedulesError: string | null;

  // Questions
  questions: PaginatedResponse<Question> | null;
  currentQuestion: Question | null;
  questionsLoading: boolean;
  questionsError: string | null;

  // Answers
  answers: PaginatedResponse<Answer> | null;
  currentAnswer: Answer | null;
  answersLoading: boolean;
  answersError: string | null;

  // Results
  results: PaginatedResponse<ExamResult> | null;
  currentResult: ExamResult | null;
  resultsLoading: boolean;
  resultsError: string | null;

  // Student Answers
  studentAnswers: PaginatedResponse<StudentAnswer> | null;
  currentStudentAnswer: StudentAnswer | null;
  studentAnswersLoading: boolean;
  studentAnswersError: string | null;

  // Quizzes
  quizzes: PaginatedResponse<Quiz> | null;
  currentQuiz: Quiz | null;
  quizzesLoading: boolean;
  quizzesError: string | null;

  // Settings
  settings: PaginatedResponse<ExamSettings> | null;
  currentSetting: ExamSettings | null;
  settingsLoading: boolean;
  settingsError: string | null;

  // Actions
  // Exams
  fetchExams: (params?: any) => Promise<void>;
  fetchExam: (id: string) => Promise<void>;
  createExam: (data: any) => Promise<boolean>;
  updateExam: (id: string, data: any) => Promise<boolean>;
  deleteExam: (id: string) => Promise<boolean>;
  bulkAddQuestions: (id: string, data: any) => Promise<boolean>;

  // Schedules
  fetchSchedules: (params?: any) => Promise<void>;
  fetchSchedule: (id: string) => Promise<void>;
  createSchedule: (data: any) => Promise<boolean>;
  updateSchedule: (id: string, data: any) => Promise<boolean>;
  deleteSchedule: (id: string) => Promise<boolean>;

  // Questions
  fetchQuestions: (params?: any) => Promise<void>;
  fetchQuestion: (id: string) => Promise<void>;
  createQuestion: (data: any) => Promise<boolean>;
  updateQuestion: (id: string, data: any) => Promise<boolean>;
  deleteQuestion: (id: string) => Promise<boolean>;

  // Answers
  fetchAnswers: (params?: any) => Promise<void>;
  fetchAnswer: (id: string) => Promise<void>;
  createAnswer: (data: any) => Promise<boolean>;
  updateAnswer: (id: string, data: any) => Promise<boolean>;
  deleteAnswer: (id: string) => Promise<boolean>;

  // Results
  fetchResults: (params?: any) => Promise<void>;
  fetchResult: (id: string) => Promise<void>;
  createResult: (data: any) => Promise<boolean>;
  updateResult: (id: string, data: any) => Promise<boolean>;
  deleteResult: (id: string) => Promise<boolean>;
  submitExam: (id: string, data: any) => Promise<boolean>;
  gradeExam: (id: string, data: any) => Promise<boolean>;

  // Student Answers
  fetchStudentAnswers: (params?: any) => Promise<void>;
  fetchStudentAnswer: (id: string) => Promise<void>;
  createStudentAnswer: (data: any) => Promise<boolean>;
  updateStudentAnswer: (id: string, data: any) => Promise<boolean>;
  deleteStudentAnswer: (id: string) => Promise<boolean>;

  // Quizzes
  fetchQuizzes: (params?: any) => Promise<void>;
  fetchQuiz: (id: string) => Promise<void>;
  createQuiz: (data: any) => Promise<boolean>;
  updateQuiz: (id: string, data: any) => Promise<boolean>;
  deleteQuiz: (id: string) => Promise<boolean>;

  // Settings
  fetchSettings: (params?: any) => Promise<void>;
  fetchSetting: (id: string) => Promise<void>;
  createSetting: (data: any) => Promise<boolean>;
  updateSetting: (id: string, data: any) => Promise<boolean>;
  deleteSetting: (id: string) => Promise<boolean>;

  // Analytics
  getDashboardSummary: (params?: any) => Promise<any>;
  getStudentPerformance: (studentId: string, params?: any) => Promise<any>;
  getSubjectPerformance: (subjectId: string, params?: any) => Promise<any>;
  getExamTrends: (params?: any) => Promise<any>;

  // Utility
  clearError: (section: string) => void;
  setLoading: (section: string, loading: boolean) => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  // Initial state
  exams: null,
  currentExam: null,
  examsLoading: false,
  examsError: null,

  schedules: null,
  currentSchedule: null,
  schedulesLoading: false,
  schedulesError: null,

  questions: null,
  currentQuestion: null,
  questionsLoading: false,
  questionsError: null,

  answers: null,
  currentAnswer: null,
  answersLoading: false,
  answersError: null,

  results: null,
  currentResult: null,
  resultsLoading: false,
  resultsError: null,

  studentAnswers: null,
  currentStudentAnswer: null,
  studentAnswersLoading: false,
  studentAnswersError: null,

  quizzes: null,
  currentQuiz: null,
  quizzesLoading: false,
  quizzesError: null,

  settings: null,
  currentSetting: null,
  settingsLoading: false,
  settingsError: null,

  // Exams actions
  fetchExams: async (params?: any) => {
    set({ examsLoading: true, examsError: null });
    try {
      const exams = await examAPI.getExams(params);
      set({ exams, examsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ examsError: errorResponse.message, examsLoading: false });
    }
  },

  fetchExam: async (id: string) => {
    set({ examsLoading: true, examsError: null });
    try {
      const currentExam = await examAPI.getExam(id);
      set({ currentExam, examsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ examsError: errorResponse.message, examsLoading: false });
    }
  },

  createExam: async (data: any) => {
    set({ examsLoading: true, examsError: null });
    try {
      await examAPI.createExam(data);
      await get().fetchExams();
      set({ examsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ examsError: errorResponse.message, examsLoading: false });
      return false;
    }
  },

  updateExam: async (id: string, data: any) => {
    set({ examsLoading: true, examsError: null });
    try {
      await examAPI.updateExam(id, data);
      await get().fetchExams();
      set({ examsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ examsError: errorResponse.message, examsLoading: false });
      return false;
    }
  },

  deleteExam: async (id: string) => {
    set({ examsLoading: true, examsError: null });
    try {
      await examAPI.deleteExam(id);
      await get().fetchExams();
      set({ examsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ examsError: errorResponse.message, examsLoading: false });
      return false;
    }
  },

  bulkAddQuestions: async (id: string, data: any) => {
    set({ examsLoading: true, examsError: null });
    try {
      await examAPI.bulkAddQuestions(id, data);
      set({ examsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ examsError: errorResponse.message, examsLoading: false });
      return false;
    }
  },

  // Schedules actions
  fetchSchedules: async (params?: any) => {
    set({ schedulesLoading: true, schedulesError: null });
    try {
      const schedules = await examAPI.getSchedules(params);
      set({ schedules, schedulesLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ schedulesError: errorResponse.message, schedulesLoading: false });
    }
  },

  fetchSchedule: async (id: string) => {
    set({ schedulesLoading: true, schedulesError: null });
    try {
      const currentSchedule = await examAPI.getSchedule(id);
      set({ currentSchedule, schedulesLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ schedulesError: errorResponse.message, schedulesLoading: false });
    }
  },

  createSchedule: async (data: any) => {
    set({ schedulesLoading: true, schedulesError: null });
    try {
      await examAPI.createSchedule(data);
      await get().fetchSchedules();
      set({ schedulesLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ schedulesError: errorResponse.message, schedulesLoading: false });
      return false;
    }
  },

  updateSchedule: async (id: string, data: any) => {
    set({ schedulesLoading: true, schedulesError: null });
    try {
      await examAPI.updateSchedule(id, data);
      await get().fetchSchedules();
      set({ schedulesLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ schedulesError: errorResponse.message, schedulesLoading: false });
      return false;
    }
  },

  deleteSchedule: async (id: string) => {
    set({ schedulesLoading: true, schedulesError: null });
    try {
      await examAPI.deleteSchedule(id);
      await get().fetchSchedules();
      set({ schedulesLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ schedulesError: errorResponse.message, schedulesLoading: false });
      return false;
    }
  },

  // Questions actions
  fetchQuestions: async (params?: any) => {
    set({ questionsLoading: true, questionsError: null });
    try {
      const questions = await examAPI.getQuestions(params);
      set({ questions, questionsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ questionsError: errorResponse.message, questionsLoading: false });
    }
  },

  fetchQuestion: async (id: string) => {
    set({ questionsLoading: true, questionsError: null });
    try {
      const currentQuestion = await examAPI.getQuestion(id);
      set({ currentQuestion, questionsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ questionsError: errorResponse.message, questionsLoading: false });
    }
  },

  createQuestion: async (data: any) => {
    set({ questionsLoading: true, questionsError: null });
    try {
      await examAPI.createQuestion(data);
      await get().fetchQuestions();
      set({ questionsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ questionsError: errorResponse.message, questionsLoading: false });
      return false;
    }
  },

  updateQuestion: async (id: string, data: any) => {
    set({ questionsLoading: true, questionsError: null });
    try {
      await examAPI.updateQuestion(id, data);
      await get().fetchQuestions();
      set({ questionsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ questionsError: errorResponse.message, questionsLoading: false });
      return false;
    }
  },

  deleteQuestion: async (id: string) => {
    set({ questionsLoading: true, questionsError: null });
    try {
      await examAPI.deleteQuestion(id);
      await get().fetchQuestions();
      set({ questionsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ questionsError: errorResponse.message, questionsLoading: false });
      return false;
    }
  },

  // Answers actions
  fetchAnswers: async (params?: any) => {
    set({ answersLoading: true, answersError: null });
    try {
      const answers = await examAPI.getAnswers(params);
      set({ answers, answersLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ answersError: errorResponse.message, answersLoading: false });
    }
  },

  fetchAnswer: async (id: string) => {
    set({ answersLoading: true, answersError: null });
    try {
      const currentAnswer = await examAPI.getAnswer(id);
      set({ currentAnswer, answersLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ answersError: errorResponse.message, answersLoading: false });
    }
  },

  createAnswer: async (data: any) => {
    set({ answersLoading: true, answersError: null });
    try {
      await examAPI.createAnswer(data);
      await get().fetchAnswers();
      set({ answersLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ answersError: errorResponse.message, answersLoading: false });
      return false;
    }
  },

  updateAnswer: async (id: string, data: any) => {
    set({ answersLoading: true, answersError: null });
    try {
      await examAPI.updateAnswer(id, data);
      await get().fetchAnswers();
      set({ answersLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ answersError: errorResponse.message, answersLoading: false });
      return false;
    }
  },

  deleteAnswer: async (id: string) => {
    set({ answersLoading: true, answersError: null });
    try {
      await examAPI.deleteAnswer(id);
      await get().fetchAnswers();
      set({ answersLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ answersError: errorResponse.message, answersLoading: false });
      return false;
    }
  },

  // Results actions
  fetchResults: async (params?: any) => {
    set({ resultsLoading: true, resultsError: null });
    try {
      const results = await examAPI.getResults(params);
      set({ results, resultsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ resultsError: errorResponse.message, resultsLoading: false });
    }
  },

  fetchResult: async (id: string) => {
    set({ resultsLoading: true, resultsError: null });
    try {
      const currentResult = await examAPI.getResult(id);
      set({ currentResult, resultsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ resultsError: errorResponse.message, resultsLoading: false });
    }
  },

  createResult: async (data: any) => {
    set({ resultsLoading: true, resultsError: null });
    try {
      await examAPI.createResult(data);
      await get().fetchResults();
      set({ resultsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ resultsError: errorResponse.message, resultsLoading: false });
      return false;
    }
  },

  updateResult: async (id: string, data: any) => {
    set({ resultsLoading: true, resultsError: null });
    try {
      await examAPI.updateResult(id, data);
      await get().fetchResults();
      set({ resultsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ resultsError: errorResponse.message, resultsLoading: false });
      return false;
    }
  },

  deleteResult: async (id: string) => {
    set({ resultsLoading: true, resultsError: null });
    try {
      await examAPI.deleteResult(id);
      await get().fetchResults();
      set({ resultsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ resultsError: errorResponse.message, resultsLoading: false });
      return false;
    }
  },

  submitExam: async (id: string, data: any) => {
    set({ resultsLoading: true, resultsError: null });
    try {
      await examAPI.submitExam(id, data);
      set({ resultsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ resultsError: errorResponse.message, resultsLoading: false });
      return false;
    }
  },

  gradeExam: async (id: string, data: any) => {
    set({ resultsLoading: true, resultsError: null });
    try {
      await examAPI.gradeExam(id, data);
      set({ resultsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ resultsError: errorResponse.message, resultsLoading: false });
      return false;
    }
  },

  // Student Answers actions
  fetchStudentAnswers: async (params?: any) => {
    set({ studentAnswersLoading: true, studentAnswersError: null });
    try {
      const studentAnswers = await examAPI.getStudentAnswers(params);
      set({ studentAnswers, studentAnswersLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ studentAnswersError: errorResponse.message, studentAnswersLoading: false });
    }
  },

  fetchStudentAnswer: async (id: string) => {
    set({ studentAnswersLoading: true, studentAnswersError: null });
    try {
      const currentStudentAnswer = await examAPI.getStudentAnswer(id);
      set({ currentStudentAnswer, studentAnswersLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ studentAnswersError: errorResponse.message, studentAnswersLoading: false });
    }
  },

  createStudentAnswer: async (data: any) => {
    set({ studentAnswersLoading: true, studentAnswersError: null });
    try {
      await examAPI.createStudentAnswer(data);
      await get().fetchStudentAnswers();
      set({ studentAnswersLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ studentAnswersError: errorResponse.message, studentAnswersLoading: false });
      return false;
    }
  },

  updateStudentAnswer: async (id: string, data: any) => {
    set({ studentAnswersLoading: true, studentAnswersError: null });
    try {
      await examAPI.updateStudentAnswer(id, data);
      await get().fetchStudentAnswers();
      set({ studentAnswersLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ studentAnswersError: errorResponse.message, studentAnswersLoading: false });
      return false;
    }
  },

  deleteStudentAnswer: async (id: string) => {
    set({ studentAnswersLoading: true, studentAnswersError: null });
    try {
      await examAPI.deleteStudentAnswer(id);
      await get().fetchStudentAnswers();
      set({ studentAnswersLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ studentAnswersError: errorResponse.message, studentAnswersLoading: false });
      return false;
    }
  },

  // Quizzes actions
  fetchQuizzes: async (params?: any) => {
    set({ quizzesLoading: true, quizzesError: null });
    try {
      const quizzes = await examAPI.getQuizzes(params);
      set({ quizzes, quizzesLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ quizzesError: errorResponse.message, quizzesLoading: false });
    }
  },

  fetchQuiz: async (id: string) => {
    set({ quizzesLoading: true, quizzesError: null });
    try {
      const currentQuiz = await examAPI.getQuiz(id);
      set({ currentQuiz, quizzesLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ quizzesError: errorResponse.message, quizzesLoading: false });
    }
  },

  createQuiz: async (data: any) => {
    set({ quizzesLoading: true, quizzesError: null });
    try {
      await examAPI.createQuiz(data);
      await get().fetchQuizzes();
      set({ quizzesLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ quizzesError: errorResponse.message, quizzesLoading: false });
      return false;
    }
  },

  updateQuiz: async (id: string, data: any) => {
    set({ quizzesLoading: true, quizzesError: null });
    try {
      await examAPI.updateQuiz(id, data);
      await get().fetchQuizzes();
      set({ quizzesLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ quizzesError: errorResponse.message, quizzesLoading: false });
      return false;
    }
  },

  deleteQuiz: async (id: string) => {
    set({ quizzesLoading: true, quizzesError: null });
    try {
      await examAPI.deleteQuiz(id);
      await get().fetchQuizzes();
      set({ quizzesLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ quizzesError: errorResponse.message, quizzesLoading: false });
      return false;
    }
  },

  // Settings actions
  fetchSettings: async (params?: any) => {
    set({ settingsLoading: true, settingsError: null });
    try {
      const settings = await examAPI.getSettings(params);
      set({ settings, settingsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ settingsError: errorResponse.message, settingsLoading: false });
    }
  },

  fetchSetting: async (id: string) => {
    set({ settingsLoading: true, settingsError: null });
    try {
      const currentSetting = await examAPI.getSetting(id);
      set({ currentSetting, settingsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ settingsError: errorResponse.message, settingsLoading: false });
    }
  },

  createSetting: async (data: any) => {
    set({ settingsLoading: true, settingsError: null });
    try {
      await examAPI.createSetting(data);
      await get().fetchSettings();
      set({ settingsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ settingsError: errorResponse.message, settingsLoading: false });
      return false;
    }
  },

  updateSetting: async (id: string, data: any) => {
    set({ settingsLoading: true, settingsError: null });
    try {
      await examAPI.updateSetting(id, data);
      await get().fetchSettings();
      set({ settingsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ settingsError: errorResponse.message, settingsLoading: false });
      return false;
    }
  },

  deleteSetting: async (id: string) => {
    set({ settingsLoading: true, settingsError: null });
    try {
      await examAPI.deleteSetting(id);
      await get().fetchSettings();
      set({ settingsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ settingsError: errorResponse.message, settingsLoading: false });
      return false;
    }
  },

  // Analytics actions
  getDashboardSummary: async (params?: any) => {
    try {
      return await examAPI.getDashboardSummary(params);
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ examsError: errorResponse.message });
      return null;
    }
  },

  getStudentPerformance: async (studentId: string, params?: any) => {
    try {
      return await examAPI.getStudentPerformance(studentId, params);
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ resultsError: errorResponse.message });
      return null;
    }
  },

  getSubjectPerformance: async (subjectId: string, params?: any) => {
    try {
      return await examAPI.getSubjectPerformance(subjectId, params);
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ examsError: errorResponse.message });
      return null;
    }
  },

  getExamTrends: async (params?: any) => {
    try {
      return await examAPI.getExamTrends(params);
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ resultsError: errorResponse.message });
      return null;
    }
  },

  // Utility actions
  clearError: (section: string) => {
    const errorKey = `${section}Error`;
    set({ [errorKey]: null });
  },

  setLoading: (section: string, loading: boolean) => {
    const loadingKey = `${section}Loading`;
    set({ [loadingKey]: loading });
  },
}));

// Selectors
export const useExams = () => useExamStore((state) => ({
  exams: state.exams,
  currentExam: state.currentExam,
  loading: state.examsLoading,
  error: state.examsError,
  fetchExams: state.fetchExams,
  fetchExam: state.fetchExam,
  createExam: state.createExam,
  updateExam: state.updateExam,
  deleteExam: state.deleteExam,
  bulkAddQuestions: state.bulkAddQuestions,
}));

export const useExamSchedules = () => useExamStore((state) => ({
  schedules: state.schedules,
  currentSchedule: state.currentSchedule,
  loading: state.schedulesLoading,
  error: state.schedulesError,
  fetchSchedules: state.fetchSchedules,
  fetchSchedule: state.fetchSchedule,
  createSchedule: state.createSchedule,
  updateSchedule: state.updateSchedule,
  deleteSchedule: state.deleteSchedule,
}));

export const useQuestions = () => useExamStore((state) => ({
  questions: state.questions,
  currentQuestion: state.currentQuestion,
  loading: state.questionsLoading,
  error: state.questionsError,
  fetchQuestions: state.fetchQuestions,
  fetchQuestion: state.fetchQuestion,
  createQuestion: state.createQuestion,
  updateQuestion: state.updateQuestion,
  deleteQuestion: state.deleteQuestion,
}));

export const useAnswers = () => useExamStore((state) => ({
  answers: state.answers,
  currentAnswer: state.currentAnswer,
  loading: state.answersLoading,
  error: state.answersError,
  fetchAnswers: state.fetchAnswers,
  fetchAnswer: state.fetchAnswer,
  createAnswer: state.createAnswer,
  updateAnswer: state.updateAnswer,
  deleteAnswer: state.deleteAnswer,
}));

export const useExamResults = () => useExamStore((state) => ({
  results: state.results,
  currentResult: state.currentResult,
  loading: state.resultsLoading,
  error: state.resultsError,
  fetchResults: state.fetchResults,
  fetchResult: state.fetchResult,
  createResult: state.createResult,
  updateResult: state.updateResult,
  deleteResult: state.deleteResult,
  submitExam: state.submitExam,
  gradeExam: state.gradeExam,
}));

export const useStudentAnswers = () => useExamStore((state) => ({
  studentAnswers: state.studentAnswers,
  currentStudentAnswer: state.currentStudentAnswer,
  loading: state.studentAnswersLoading,
  error: state.studentAnswersError,
  fetchStudentAnswers: state.fetchStudentAnswers,
  fetchStudentAnswer: state.fetchStudentAnswer,
  createStudentAnswer: state.createStudentAnswer,
  updateStudentAnswer: state.updateStudentAnswer,
  deleteStudentAnswer: state.deleteStudentAnswer,
}));

export const useQuizzes = () => useExamStore((state) => ({
  quizzes: state.quizzes,
  currentQuiz: state.currentQuiz,
  loading: state.quizzesLoading,
  error: state.quizzesError,
  fetchQuizzes: state.fetchQuizzes,
  fetchQuiz: state.fetchQuiz,
  createQuiz: state.createQuiz,
  updateQuiz: state.updateQuiz,
  deleteQuiz: state.deleteQuiz,
}));

export const useExamSettings = () => useExamStore((state) => ({
  settings: state.settings,
  currentSetting: state.currentSetting,
  loading: state.settingsLoading,
  error: state.settingsError,
  fetchSettings: state.fetchSettings,
  fetchSetting: state.fetchSetting,
  createSetting: state.createSetting,
  updateSetting: state.updateSetting,
  deleteSetting: state.deleteSetting,
}));


