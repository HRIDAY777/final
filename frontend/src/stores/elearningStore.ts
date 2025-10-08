/* eslint-disable no-unused-vars */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '../services/api';

// API Response Types
interface ApiResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  category: CourseCategory;
  instructor: any;
  thumbnail: string;
  duration: number;
  difficulty_level: string;
  price: number;
  is_free: boolean;
  is_published: boolean;
  enrollment_count: number;
  rating: number;
  total_lessons: number;
  created_at: string;
  updated_at: string;
}

export interface CourseCategory {
  id: number;
  name: string;
  description: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: number;
  course: Course;
  title: string;
  description: string;
  content: string;
  video_url: string;
  duration: number;
  order: number;
  is_free: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: number;
  course: Course;
  student: any;
  enrollment_date: string;
  completion_date: string;
  progress_percentage: number;
  status: string;
  certificate_issued: boolean;
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  id: number;
  enrollment: Enrollment;
  lesson: Lesson;
  is_completed: boolean;
  completion_date: string;
  time_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: number;
  course: Course;
  title: string;
  description: string;
  time_limit: number;
  passing_score: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: number;
  quiz: Quiz;
  student: any;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken: number;
  is_passed: boolean;
  attempt_date: string;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: number;
  enrollment: Enrollment;
  certificate_number: string;
  issue_date: string;
  expiry_date: string;
  is_valid: boolean;
  download_url: string;
  created_at: string;
  updated_at: string;
}

export interface Discussion {
  id: number;
  course: Course;
  student: any;
  title: string;
  content: string;
  is_resolved: boolean;
  replies: DiscussionReply[];
  created_at: string;
  updated_at: string;
}

export interface DiscussionReply {
  id: number;
  discussion: Discussion;
  student: any;
  content: string;
  is_instructor_reply: boolean;
  created_at: string;
  updated_at: string;
}

interface ELearningState {
  // Courses
  courses: ApiResponse<Course> | null;
  currentCourse: Course | null;
  coursesLoading: boolean;
  coursesError: string | null;

  // Categories
  categories: ApiResponse<CourseCategory> | null;
  currentCategory: CourseCategory | null;
  categoriesLoading: boolean;
  categoriesError: string | null;

  // Lessons
  lessons: ApiResponse<Lesson> | null;
  currentLesson: Lesson | null;
  lessonsLoading: boolean;
  lessonsError: string | null;

  // Enrollments
  enrollments: ApiResponse<Enrollment> | null;
  currentEnrollment: Enrollment | null;
  enrollmentsLoading: boolean;
  enrollmentsError: string | null;

  // Progress
  progress: ApiResponse<LessonProgress> | null;
  currentProgress: LessonProgress | null;
  progressLoading: boolean;
  progressError: string | null;

  // Quizzes
  quizzes: ApiResponse<Quiz> | null;
  currentQuiz: Quiz | null;
  quizzesLoading: boolean;
  quizzesError: string | null;

  // Quiz Attempts
  quizAttempts: ApiResponse<QuizAttempt> | null;
  currentQuizAttempt: QuizAttempt | null;
  quizAttemptsLoading: boolean;
  quizAttemptsError: string | null;

  // Certificates
  certificates: ApiResponse<Certificate> | null;
  currentCertificate: Certificate | null;
  certificatesLoading: boolean;
  certificatesError: string | null;

  // Discussions
  discussions: ApiResponse<Discussion> | null;
  currentDiscussion: Discussion | null;
  discussionsLoading: boolean;
  discussionsError: string | null;
}

interface ELearningActions {
  // Course actions
  fetchCourses: (params?: any) => Promise<void>;
  fetchCourseById: (id: number) => Promise<void>;
  createCourse: (data: Partial<Course>) => Promise<Course>;
  updateCourse: (id: number, data: Partial<Course>) => Promise<Course>;
  deleteCourse: (id: number) => Promise<void>;
  publishCourse: (id: number) => Promise<void>;
  unpublishCourse: (id: number) => Promise<void>;

  // Category actions
  fetchCategories: (params?: any) => Promise<void>;
  fetchCategoryById: (id: number) => Promise<void>;
  createCategory: (data: Partial<CourseCategory>) => Promise<CourseCategory>;
  updateCategory: (id: number, data: Partial<CourseCategory>) => Promise<CourseCategory>;
  deleteCategory: (id: number) => Promise<void>;

  // Lesson actions
  fetchLessons: (params?: any) => Promise<void>;
  fetchLessonById: (id: number) => Promise<void>;
  createLesson: (data: Partial<Lesson>) => Promise<Lesson>;
  updateLesson: (id: number, data: Partial<Lesson>) => Promise<Lesson>;
  deleteLesson: (id: number) => Promise<void>;
  reorderLessons: (courseId: number, lessonIds: number[]) => Promise<void>;

  // Enrollment actions
  fetchEnrollments: (params?: any) => Promise<void>;
  fetchEnrollmentById: (id: number) => Promise<void>;
  createEnrollment: (data: Partial<Enrollment>) => Promise<Enrollment>;
  updateEnrollment: (id: number, data: Partial<Enrollment>) => Promise<Enrollment>;
  deleteEnrollment: (id: number) => Promise<void>;
  enrollStudent: (courseId: number, studentId: number) => Promise<void>;
  unenrollStudent: (enrollmentId: number) => Promise<void>;

  // Progress actions
  fetchProgress: (params?: any) => Promise<void>;
  fetchProgressById: (id: number) => Promise<void>;
  createProgress: (data: Partial<LessonProgress>) => Promise<LessonProgress>;
  updateProgress: (id: number, data: Partial<LessonProgress>) => Promise<LessonProgress>;
  deleteProgress: (id: number) => Promise<void>;
  markLessonComplete: (enrollmentId: number, lessonId: number) => Promise<void>;

  // Quiz actions
  fetchQuizzes: (params?: any) => Promise<void>;
  fetchQuizById: (id: number) => Promise<void>;
  createQuiz: (data: Partial<Quiz>) => Promise<Quiz>;
  updateQuiz: (id: number, data: Partial<Quiz>) => Promise<Quiz>;
  deleteQuiz: (id: number) => Promise<void>;

  // Quiz Attempt actions
  fetchQuizAttempts: (params?: any) => Promise<void>;
  fetchQuizAttemptById: (id: number) => Promise<void>;
  createQuizAttempt: (data: Partial<QuizAttempt>) => Promise<QuizAttempt>;
  updateQuizAttempt: (id: number, data: Partial<QuizAttempt>) => Promise<QuizAttempt>;
  deleteQuizAttempt: (id: number) => Promise<void>;
  submitQuiz: (quizId: number, answers: any) => Promise<void>;

  // Certificate actions
  fetchCertificates: (params?: any) => Promise<void>;
  fetchCertificateById: (id: number) => Promise<void>;
  createCertificate: (data: Partial<Certificate>) => Promise<Certificate>;
  updateCertificate: (id: number, data: Partial<Certificate>) => Promise<Certificate>;
  deleteCertificate: (id: number) => Promise<void>;
  generateCertificate: (enrollmentId: number) => Promise<void>;
  downloadCertificate: (certificateId: number) => Promise<Blob>;

  // Discussion actions
  fetchDiscussions: (params?: any) => Promise<void>;
  fetchDiscussionById: (id: number) => Promise<void>;
  createDiscussion: (data: Partial<Discussion>) => Promise<Discussion>;
  updateDiscussion: (id: number, data: Partial<Discussion>) => Promise<Discussion>;
  deleteDiscussion: (id: number) => Promise<void>;
  addReply: (discussionId: number, content: string) => Promise<void>;

  // Utility actions
  clearErrors: () => void;
  resetState: () => void;
}

const initialState: ELearningState = {
  courses: null,
  currentCourse: null,
  coursesLoading: false,
  coursesError: null,

  categories: null,
  currentCategory: null,
  categoriesLoading: false,
  categoriesError: null,

  lessons: null,
  currentLesson: null,
  lessonsLoading: false,
  lessonsError: null,

  enrollments: null,
  currentEnrollment: null,
  enrollmentsLoading: false,
  enrollmentsError: null,

  progress: null,
  currentProgress: null,
  progressLoading: false,
  progressError: null,

  quizzes: null,
  currentQuiz: null,
  quizzesLoading: false,
  quizzesError: null,

  quizAttempts: null,
  currentQuizAttempt: null,
  quizAttemptsLoading: false,
  quizAttemptsError: null,

  certificates: null,
  currentCertificate: null,
  certificatesLoading: false,
  certificatesError: null,

  discussions: null,
  currentDiscussion: null,
  discussionsLoading: false,
  discussionsError: null,
};

export const useELearningStore = create<ELearningState & ELearningActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Course actions
      fetchCourses: async (params = {}) => {
        set({ coursesLoading: true, coursesError: null });
        try {
          const response = await api.get('/elearning/courses/', { params }) as { data: ApiResponse<Course> };
          set({ courses: response.data, coursesLoading: false });
        } catch (error: any) {
          set({ 
            coursesError: error.response?.data?.message || 'Failed to fetch courses',
            coursesLoading: false 
          });
        }
      },

      fetchCourseById: async (id: number) => {
        set({ coursesLoading: true, coursesError: null });
        try {
          const response = await api.get(`/elearning/courses/${id}/`) as { data: Course };
          set({ currentCourse: response.data, coursesLoading: false });
        } catch (error: any) {
          set({ 
            coursesError: error.response?.data?.message || 'Failed to fetch course',
            coursesLoading: false 
          });
        }
      },

      createCourse: async (data: Partial<Course>) => {
        set({ coursesLoading: true, coursesError: null });
        try {
          const response = await api.post('/elearning/courses/', data) as { data: Course };
          set({ coursesLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            coursesError: error.response?.data?.message || 'Failed to create course',
            coursesLoading: false 
          });
          throw error;
        }
      },

      updateCourse: async (id: number, data: Partial<Course>) => {
        set({ coursesLoading: true, coursesError: null });
        try {
          const response = await api.put(`/elearning/courses/${id}/`, data) as { data: Course };
          set({ coursesLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            coursesError: error.response?.data?.message || 'Failed to update course',
            coursesLoading: false 
          });
          throw error;
        }
      },

      deleteCourse: async (id: number) => {
        set({ coursesLoading: true, coursesError: null });
        try {
          await api.delete(`/elearning/courses/${id}/`);
          set({ coursesLoading: false });
        } catch (error: any) {
          set({ 
            coursesError: error.response?.data?.message || 'Failed to delete course',
            coursesLoading: false 
          });
          throw error;
        }
      },

      publishCourse: async (id: number) => {
        set({ coursesLoading: true, coursesError: null });
        try {
          await api.post(`/elearning/courses/${id}/publish/`);
          set({ coursesLoading: false });
        } catch (error: any) {
          set({ 
            coursesError: error.response?.data?.message || 'Failed to publish course',
            coursesLoading: false 
          });
          throw error;
        }
      },

      unpublishCourse: async (id: number) => {
        set({ coursesLoading: true, coursesError: null });
        try {
          await api.post(`/elearning/courses/${id}/unpublish/`);
          set({ coursesLoading: false });
        } catch (error: any) {
          set({ 
            coursesError: error.response?.data?.message || 'Failed to unpublish course',
            coursesLoading: false 
          });
          throw error;
        }
      },

      // Category actions
      fetchCategories: async (params = {}) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const response = await api.get('/elearning/categories/', { params }) as { data: ApiResponse<CourseCategory> };
          set({ categories: response.data, categoriesLoading: false });
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to fetch categories',
            categoriesLoading: false 
          });
        }
      },

      fetchCategoryById: async (id: number) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const response = await api.get(`/elearning/categories/${id}/`) as { data: CourseCategory };
          set({ currentCategory: response.data, categoriesLoading: false });
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to fetch category',
            categoriesLoading: false 
          });
        }
      },

      createCategory: async (data: Partial<CourseCategory>) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const response = await api.post('/elearning/categories/', data) as { data: CourseCategory };
          set({ categoriesLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to create category',
            categoriesLoading: false 
          });
          throw error;
        }
      },

      updateCategory: async (id: number, data: Partial<CourseCategory>) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const response = await api.put(`/elearning/categories/${id}/`, data) as { data: CourseCategory };
          set({ categoriesLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to update category',
            categoriesLoading: false 
          });
          throw error;
        }
      },

      deleteCategory: async (id: number) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          await api.delete(`/elearning/categories/${id}/`);
          set({ categoriesLoading: false });
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to delete category',
            categoriesLoading: false 
          });
          throw error;
        }
      },

      // Lesson actions
      fetchLessons: async (params = {}) => {
        set({ lessonsLoading: true, lessonsError: null });
        try {
          const response = await api.get('/elearning/lessons/', { params }) as { data: ApiResponse<Lesson> };
          set({ lessons: response.data, lessonsLoading: false });
        } catch (error: any) {
          set({ 
            lessonsError: error.response?.data?.message || 'Failed to fetch lessons',
            lessonsLoading: false 
          });
        }
      },

      fetchLessonById: async (id: number) => {
        set({ lessonsLoading: true, lessonsError: null });
        try {
          const response = await api.get(`/elearning/lessons/${id}/`) as { data: Lesson };
          set({ currentLesson: response.data, lessonsLoading: false });
        } catch (error: any) {
          set({ 
            lessonsError: error.response?.data?.message || 'Failed to fetch lesson',
            lessonsLoading: false 
          });
        }
      },

      createLesson: async (data: Partial<Lesson>) => {
        set({ lessonsLoading: true, lessonsError: null });
        try {
          const response = await api.post('/elearning/lessons/', data) as { data: Lesson };
          set({ lessonsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            lessonsError: error.response?.data?.message || 'Failed to create lesson',
            lessonsLoading: false 
          });
          throw error;
        }
      },

      updateLesson: async (id: number, data: Partial<Lesson>) => {
        set({ lessonsLoading: true, lessonsError: null });
        try {
          const response = await api.put(`/elearning/lessons/${id}/`, data) as { data: Lesson };
          set({ lessonsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            lessonsError: error.response?.data?.message || 'Failed to update lesson',
            lessonsLoading: false 
          });
          throw error;
        }
      },

      deleteLesson: async (id: number) => {
        set({ lessonsLoading: true, lessonsError: null });
        try {
          await api.delete(`/elearning/lessons/${id}/`);
          set({ lessonsLoading: false });
        } catch (error: any) {
          set({ 
            lessonsError: error.response?.data?.message || 'Failed to delete lesson',
            lessonsLoading: false 
          });
          throw error;
        }
      },

      reorderLessons: async (courseId: number, lessonIds: number[]) => {
        set({ lessonsLoading: true, lessonsError: null });
        try {
          await api.post(`/elearning/courses/${courseId}/reorder-lessons/`, { lesson_ids: lessonIds });
          set({ lessonsLoading: false });
        } catch (error: any) {
          set({ 
            lessonsError: error.response?.data?.message || 'Failed to reorder lessons',
            lessonsLoading: false 
          });
          throw error;
        }
      },

      // Enrollment actions
      fetchEnrollments: async (params = {}) => {
        set({ enrollmentsLoading: true, enrollmentsError: null });
        try {
          const response = await api.get('/elearning/enrollments/', { params }) as { data: ApiResponse<Enrollment> };
          set({ enrollments: response.data, enrollmentsLoading: false });
        } catch (error: any) {
          set({ 
            enrollmentsError: error.response?.data?.message || 'Failed to fetch enrollments',
            enrollmentsLoading: false 
          });
        }
      },

      fetchEnrollmentById: async (id: number) => {
        set({ enrollmentsLoading: true, enrollmentsError: null });
        try {
          const response = await api.get(`/elearning/enrollments/${id}/`) as { data: Enrollment };
          set({ currentEnrollment: response.data, enrollmentsLoading: false });
        } catch (error: any) {
          set({ 
            enrollmentsError: error.response?.data?.message || 'Failed to fetch enrollment',
            enrollmentsLoading: false 
          });
        }
      },

      createEnrollment: async (data: Partial<Enrollment>) => {
        set({ enrollmentsLoading: true, enrollmentsError: null });
        try {
          const response = await api.post('/elearning/enrollments/', data) as { data: Enrollment };
          set({ enrollmentsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            enrollmentsError: error.response?.data?.message || 'Failed to create enrollment',
            enrollmentsLoading: false 
          });
          throw error;
        }
      },

      updateEnrollment: async (id: number, data: Partial<Enrollment>) => {
        set({ enrollmentsLoading: true, enrollmentsError: null });
        try {
          const response = await api.put(`/elearning/enrollments/${id}/`, data) as { data: Enrollment };
          set({ enrollmentsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            enrollmentsError: error.response?.data?.message || 'Failed to update enrollment',
            enrollmentsLoading: false 
          });
          throw error;
        }
      },

      deleteEnrollment: async (id: number) => {
        set({ enrollmentsLoading: true, enrollmentsError: null });
        try {
          await api.delete(`/elearning/enrollments/${id}/`);
          set({ enrollmentsLoading: false });
        } catch (error: any) {
          set({ 
            enrollmentsError: error.response?.data?.message || 'Failed to delete enrollment',
            enrollmentsLoading: false 
          });
          throw error;
        }
      },

      enrollStudent: async (courseId: number, studentId: number) => {
        set({ enrollmentsLoading: true, enrollmentsError: null });
        try {
          await api.post('/elearning/enrollments/', { course: courseId, student: studentId });
          set({ enrollmentsLoading: false });
        } catch (error: any) {
          set({ 
            enrollmentsError: error.response?.data?.message || 'Failed to enroll student',
            enrollmentsLoading: false 
          });
          throw error;
        }
      },

      unenrollStudent: async (enrollmentId: number) => {
        set({ enrollmentsLoading: true, enrollmentsError: null });
        try {
          await api.delete(`/elearning/enrollments/${enrollmentId}/`);
          set({ enrollmentsLoading: false });
        } catch (error: any) {
          set({ 
            enrollmentsError: error.response?.data?.message || 'Failed to unenroll student',
            enrollmentsLoading: false 
          });
          throw error;
        }
      },

      // Progress actions
      fetchProgress: async (params = {}) => {
        set({ progressLoading: true, progressError: null });
        try {
          const response = await api.get('/elearning/progress/', { params }) as { data: ApiResponse<LessonProgress> };
          set({ progress: response.data, progressLoading: false });
        } catch (error: any) {
          set({ 
            progressError: error.response?.data?.message || 'Failed to fetch progress',
            progressLoading: false 
          });
        }
      },

      fetchProgressById: async (id: number) => {
        set({ progressLoading: true, progressError: null });
        try {
          const response = await api.get(`/elearning/progress/${id}/`) as { data: LessonProgress };
          set({ currentProgress: response.data, progressLoading: false });
        } catch (error: any) {
          set({ 
            progressError: error.response?.data?.message || 'Failed to fetch progress',
            progressLoading: false 
          });
        }
      },

      createProgress: async (data: Partial<LessonProgress>) => {
        set({ progressLoading: true, progressError: null });
        try {
          const response = await api.post('/elearning/progress/', data) as { data: LessonProgress };
          set({ progressLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            progressError: error.response?.data?.message || 'Failed to create progress',
            progressLoading: false 
          });
          throw error;
        }
      },

      updateProgress: async (id: number, data: Partial<LessonProgress>) => {
        set({ progressLoading: true, progressError: null });
        try {
          const response = await api.put(`/elearning/progress/${id}/`, data) as { data: LessonProgress };
          set({ progressLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            progressError: error.response?.data?.message || 'Failed to update progress',
            progressLoading: false 
          });
          throw error;
        }
      },

      deleteProgress: async (id: number) => {
        set({ progressLoading: true, progressError: null });
        try {
          await api.delete(`/elearning/progress/${id}/`);
          set({ progressLoading: false });
        } catch (error: any) {
          set({ 
            progressError: error.response?.data?.message || 'Failed to delete progress',
            progressLoading: false 
          });
          throw error;
        }
      },

      markLessonComplete: async (enrollmentId: number, lessonId: number) => {
        set({ progressLoading: true, progressError: null });
        try {
          await api.post('/elearning/progress/mark-complete/', { 
            enrollment: enrollmentId, 
            lesson: lessonId 
          });
          set({ progressLoading: false });
        } catch (error: any) {
          set({ 
            progressError: error.response?.data?.message || 'Failed to mark lesson complete',
            progressLoading: false 
          });
          throw error;
        }
      },

      // Quiz actions
      fetchQuizzes: async (params = {}) => {
        set({ quizzesLoading: true, quizzesError: null });
        try {
          const response = await api.get('/elearning/quizzes/', { params }) as { data: ApiResponse<Quiz> };
          set({ quizzes: response.data, quizzesLoading: false });
        } catch (error: any) {
          set({ 
            quizzesError: error.response?.data?.message || 'Failed to fetch quizzes',
            quizzesLoading: false 
          });
        }
      },

      fetchQuizById: async (id: number) => {
        set({ quizzesLoading: true, quizzesError: null });
        try {
          const response = await api.get(`/elearning/quizzes/${id}/`) as { data: Quiz };
          set({ currentQuiz: response.data, quizzesLoading: false });
        } catch (error: any) {
          set({ 
            quizzesError: error.response?.data?.message || 'Failed to fetch quiz',
            quizzesLoading: false 
          });
        }
      },

      createQuiz: async (data: Partial<Quiz>) => {
        set({ quizzesLoading: true, quizzesError: null });
        try {
          const response = await api.post('/elearning/quizzes/', data) as { data: Quiz };
          set({ quizzesLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            quizzesError: error.response?.data?.message || 'Failed to create quiz',
            quizzesLoading: false 
          });
          throw error;
        }
      },

      updateQuiz: async (id: number, data: Partial<Quiz>) => {
        set({ quizzesLoading: true, quizzesError: null });
        try {
          const response = await api.put(`/elearning/quizzes/${id}/`, data) as { data: Quiz };
          set({ quizzesLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            quizzesError: error.response?.data?.message || 'Failed to update quiz',
            quizzesLoading: false 
          });
          throw error;
        }
      },

      deleteQuiz: async (id: number) => {
        set({ quizzesLoading: true, quizzesError: null });
        try {
          await api.delete(`/elearning/quizzes/${id}/`);
          set({ quizzesLoading: false });
        } catch (error: any) {
          set({ 
            quizzesError: error.response?.data?.message || 'Failed to delete quiz',
            quizzesLoading: false 
          });
          throw error;
        }
      },

      // Quiz Attempt actions
      fetchQuizAttempts: async (params = {}) => {
        set({ quizAttemptsLoading: true, quizAttemptsError: null });
        try {
          const response = await api.get('/elearning/quiz-attempts/', { params }) as { data: ApiResponse<QuizAttempt> };
          set({ quizAttempts: response.data, quizAttemptsLoading: false });
        } catch (error: any) {
          set({ 
            quizAttemptsError: error.response?.data?.message || 'Failed to fetch quiz attempts',
            quizAttemptsLoading: false 
          });
        }
      },

      fetchQuizAttemptById: async (id: number) => {
        set({ quizAttemptsLoading: true, quizAttemptsError: null });
        try {
          const response = await api.get(`/elearning/quiz-attempts/${id}/`) as { data: QuizAttempt };
          set({ currentQuizAttempt: response.data, quizAttemptsLoading: false });
        } catch (error: any) {
          set({ 
            quizAttemptsError: error.response?.data?.message || 'Failed to fetch quiz attempt',
            quizAttemptsLoading: false 
          });
        }
      },

      createQuizAttempt: async (data: Partial<QuizAttempt>) => {
        set({ quizAttemptsLoading: true, quizAttemptsError: null });
        try {
          const response = await api.post('/elearning/quiz-attempts/', data) as { data: QuizAttempt };
          set({ quizAttemptsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            quizAttemptsError: error.response?.data?.message || 'Failed to create quiz attempt',
            quizAttemptsLoading: false 
          });
          throw error;
        }
      },

      updateQuizAttempt: async (id: number, data: Partial<QuizAttempt>) => {
        set({ quizAttemptsLoading: true, quizAttemptsError: null });
        try {
          const response = await api.put(`/elearning/quiz-attempts/${id}/`, data) as { data: QuizAttempt };
          set({ quizAttemptsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            quizAttemptsError: error.response?.data?.message || 'Failed to update quiz attempt',
            quizAttemptsLoading: false 
          });
          throw error;
        }
      },

      deleteQuizAttempt: async (id: number) => {
        set({ quizAttemptsLoading: true, quizAttemptsError: null });
        try {
          await api.delete(`/elearning/quiz-attempts/${id}/`);
          set({ quizAttemptsLoading: false });
        } catch (error: any) {
          set({ 
            quizAttemptsError: error.response?.data?.message || 'Failed to delete quiz attempt',
            quizAttemptsLoading: false 
          });
          throw error;
        }
      },

      submitQuiz: async (quizId: number, answers: any) => {
        set({ quizAttemptsLoading: true, quizAttemptsError: null });
        try {
          await api.post(`/elearning/quizzes/${quizId}/submit/`, { answers });
          set({ quizAttemptsLoading: false });
        } catch (error: any) {
          set({ 
            quizAttemptsError: error.response?.data?.message || 'Failed to submit quiz',
            quizAttemptsLoading: false 
          });
          throw error;
        }
      },

      // Certificate actions
      fetchCertificates: async (params = {}) => {
        set({ certificatesLoading: true, certificatesError: null });
        try {
          const response = await api.get('/elearning/certificates/', { params }) as { data: ApiResponse<Certificate> };
          set({ certificates: response.data, certificatesLoading: false });
        } catch (error: any) {
          set({ 
            certificatesError: error.response?.data?.message || 'Failed to fetch certificates',
            certificatesLoading: false 
          });
        }
      },

      fetchCertificateById: async (id: number) => {
        set({ certificatesLoading: true, certificatesError: null });
        try {
          const response = await api.get(`/elearning/certificates/${id}/`) as { data: Certificate };
          set({ currentCertificate: response.data, certificatesLoading: false });
        } catch (error: any) {
          set({ 
            certificatesError: error.response?.data?.message || 'Failed to fetch certificate',
            certificatesLoading: false 
          });
        }
      },

      createCertificate: async (data: Partial<Certificate>) => {
        set({ certificatesLoading: true, certificatesError: null });
        try {
          const response = await api.post('/elearning/certificates/', data) as { data: Certificate };
          set({ certificatesLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            certificatesError: error.response?.data?.message || 'Failed to create certificate',
            certificatesLoading: false 
          });
          throw error;
        }
      },

      updateCertificate: async (id: number, data: Partial<Certificate>) => {
        set({ certificatesLoading: true, certificatesError: null });
        try {
          const response = await api.put(`/elearning/certificates/${id}/`, data) as { data: Certificate };
          set({ certificatesLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            certificatesError: error.response?.data?.message || 'Failed to update certificate',
            certificatesLoading: false 
          });
          throw error;
        }
      },

      deleteCertificate: async (id: number) => {
        set({ certificatesLoading: true, certificatesError: null });
        try {
          await api.delete(`/elearning/certificates/${id}/`);
          set({ certificatesLoading: false });
        } catch (error: any) {
          set({ 
            certificatesError: error.response?.data?.message || 'Failed to delete certificate',
            certificatesLoading: false 
          });
          throw error;
        }
      },

      generateCertificate: async (enrollmentId: number) => {
        set({ certificatesLoading: true, certificatesError: null });
        try {
          await api.post(`/elearning/certificates/generate/`, { enrollment: enrollmentId });
          set({ certificatesLoading: false });
        } catch (error: any) {
          set({ 
            certificatesError: error.response?.data?.message || 'Failed to generate certificate',
            certificatesLoading: false 
          });
          throw error;
        }
      },

      downloadCertificate: async (certificateId: number) => {
        set({ certificatesLoading: true, certificatesError: null });
        try {
          const response = await api.get(`/elearning/certificates/${certificateId}/download/`, {
            responseType: 'blob'
          }) as { data: Blob };
          set({ certificatesLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            certificatesError: error.response?.data?.message || 'Failed to download certificate',
            certificatesLoading: false 
          });
          throw error;
        }
      },

      // Discussion actions
      fetchDiscussions: async (params = {}) => {
        set({ discussionsLoading: true, discussionsError: null });
        try {
          const response = await api.get('/elearning/discussions/', { params }) as { data: ApiResponse<Discussion> };
          set({ discussions: response.data, discussionsLoading: false });
        } catch (error: any) {
          set({ 
            discussionsError: error.response?.data?.message || 'Failed to fetch discussions',
            discussionsLoading: false 
          });
        }
      },

      fetchDiscussionById: async (id: number) => {
        set({ discussionsLoading: true, discussionsError: null });
        try {
          const response = await api.get(`/elearning/discussions/${id}/`) as { data: Discussion };
          set({ currentDiscussion: response.data, discussionsLoading: false });
        } catch (error: any) {
          set({ 
            discussionsError: error.response?.data?.message || 'Failed to fetch discussion',
            discussionsLoading: false 
          });
        }
      },

      createDiscussion: async (data: Partial<Discussion>) => {
        set({ discussionsLoading: true, discussionsError: null });
        try {
          const response = await api.post('/elearning/discussions/', data) as { data: Discussion };
          set({ discussionsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            discussionsError: error.response?.data?.message || 'Failed to create discussion',
            discussionsLoading: false 
          });
          throw error;
        }
      },

      updateDiscussion: async (id: number, data: Partial<Discussion>) => {
        set({ discussionsLoading: true, discussionsError: null });
        try {
          const response = await api.put(`/elearning/discussions/${id}/`, data) as { data: Discussion };
          set({ discussionsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            discussionsError: error.response?.data?.message || 'Failed to update discussion',
            discussionsLoading: false 
          });
          throw error;
        }
      },

      deleteDiscussion: async (id: number) => {
        set({ discussionsLoading: true, discussionsError: null });
        try {
          await api.delete(`/elearning/discussions/${id}/`);
          set({ discussionsLoading: false });
        } catch (error: any) {
          set({ 
            discussionsError: error.response?.data?.message || 'Failed to delete discussion',
            discussionsLoading: false 
          });
          throw error;
        }
      },

      addReply: async (discussionId: number, content: string) => {
        set({ discussionsLoading: true, discussionsError: null });
        try {
          await api.post(`/elearning/discussions/${discussionId}/replies/`, { content });
          set({ discussionsLoading: false });
        } catch (error: any) {
          set({ 
            discussionsError: error.response?.data?.message || 'Failed to add reply',
            discussionsLoading: false 
          });
          throw error;
        }
      },

      // Utility actions
      clearErrors: () => {
        set({
          coursesError: null,
          categoriesError: null,
          lessonsError: null,
          enrollmentsError: null,
          progressError: null,
          quizzesError: null,
          quizAttemptsError: null,
          certificatesError: null,
          discussionsError: null,
        });
      },

      resetState: () => {
        set(initialState);
      },
    }),
    {
      name: 'elearning-store',
    }
  )
);
