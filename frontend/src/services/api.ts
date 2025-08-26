import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthTokens, ErrorResponse, PaginatedResponse } from '../types';
import { isDemoMode, mockGet, mockPost, mockPut, mockPatch, mockDelete } from './mock';

// API Configuration - Ensure HTTP for development
const env: any = (import.meta as any).env || {};
const API_BASE_URL = env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const WS_BASE_URL = env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws';

console.log('API Configuration:', { API_BASE_URL, WS_BASE_URL });

// Create axios instance with proper configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for better reliability
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Ensure we're using HTTP for development
  withCredentials: false,
});

// Request interceptor to add auth token and logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    
    // Log API requests for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful API responses
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          console.log('Attempting token refresh...');
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);
          (api.defaults.headers as any).common['Authorization'] = `Bearer ${access}`;

          console.log('Token refresh successful');
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Refresh token failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Test API connectivity
export const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing API connection...');
    const response = await api.get('/');
    console.log('API connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('API connection failed:', error);
    return false;
  }
};

// Generic API methods with enhanced error handling
export const apiService = {
  // GET request
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      if (isDemoMode) {
        console.log('Using demo mode for GET:', url);
        return mockGet(url) as T;
      }
      const response = await api.get<T>(url, config);
      return response.data;
    } catch (error) {
      console.error(`GET ${url} failed:`, error);
      throw error;
    }
  },

  // POST request
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      if (isDemoMode) {
        console.log('Using demo mode for POST:', url);
        return mockPost(url, data) as T;
      }
      const response = await api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`POST ${url} failed:`, error);
      throw error;
    }
  },

  // PUT request
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      if (isDemoMode) {
        console.log('Using demo mode for PUT:', url);
        return mockPut(url, data) as T;
      }
      const response = await api.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`PUT ${url} failed:`, error);
      throw error;
    }
  },

  // PATCH request
  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      if (isDemoMode) {
        console.log('Using demo mode for PATCH:', url);
        return mockPatch(url, data) as T;
      }
      const response = await api.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`PATCH ${url} failed:`, error);
      throw error;
    }
  },

  // DELETE request
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      if (isDemoMode) {
        console.log('Using demo mode for DELETE:', url);
        return mockDelete(url) as T;
      }
      const response = await api.delete<T>(url, config);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${url} failed:`, error);
      throw error;
    }
  },

  // Upload file
  upload: async <T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Upload ${url} failed:`, error);
      throw error;
    }
  },
};

// Error handling utility
export const handleApiError = (error: any): ErrorResponse => {
  if (error.response) {
    return {
      message: error.response.data?.message || 'An error occurred',
      errors: error.response.data?.errors,
      status: error.response.status,
    };
  } else if (error.request) {
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
    };
  } else {
    return {
      message: error.message || 'An unexpected error occurred',
      status: 500,
    };
  }
};

// Query parameter builder
export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });
  
  return searchParams.toString();
};

// Pagination helper
export const getPaginatedData = async <T>(
  url: string,
  page: number = 1,
  pageSize: number = 10,
  filters?: Record<string, any>
): Promise<PaginatedResponse<T>> => {
  const params = {
    page,
    page_size: pageSize,
    ...filters,
  };
  
  const queryString = buildQueryParams(params);
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  
  return apiService.get<PaginatedResponse<T>>(fullUrl);
};

// Authentication API
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthTokens> => {
    return apiService.post<AuthTokens>('/auth/login/', { email, password });
  },

  register: async (userData: any): Promise<any> => {
    return apiService.post('/auth/register/', userData);
  },

  logout: async (): Promise<void> => {
    await apiService.post('/auth/logout/');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  refreshToken: async (refresh: string): Promise<AuthTokens> => {
    return apiService.post<AuthTokens>('/auth/refresh/', { refresh });
  },

  getProfile: async (): Promise<any> => {
    return apiService.get('/auth/profile/');
  },

  updateProfile: async (data: any): Promise<any> => {
    return apiService.patch('/auth/profile/', data);
  },

  changePassword: async (data: any): Promise<void> => {
    return apiService.post('/auth/change-password/', data);
  },

  resetPassword: async (email: string): Promise<void> => {
    return apiService.post('/auth/reset-password/', { email });
  },

  confirmResetPassword: async (data: any): Promise<void> => {
    return apiService.post('/auth/reset-password-confirm/', data);
  },
};

// Academic API
export const academicAPI = {
  // Classes
  getClasses: (params?: any) => getPaginatedData('/academics/classes/', 1, 10, params),
  getClass: (id: string) => apiService.get(`/academics/classes/${id}/`),
  createClass: (data: any) => apiService.post('/academics/classes/', data),
  updateClass: (id: string, data: any) => apiService.put(`/academics/classes/${id}/`, data),
  deleteClass: (id: string) => apiService.delete(`/academics/classes/${id}/`),
  getClassStudents: (id: string) => apiService.get(`/academics/classes/${id}/students/`),
  getClassPerformance: (id: string) => apiService.get(`/academics/classes/${id}/performance_summary/`),

  // Subjects
  getSubjects: (params?: any) => getPaginatedData('/academics/subjects/', 1, 10, params),
  getSubject: (id: string) => apiService.get(`/academics/subjects/${id}/`),
  createSubject: (data: any) => apiService.post('/academics/subjects/', data),
  updateSubject: (id: string, data: any) => apiService.put(`/academics/subjects/${id}/`, data),
  deleteSubject: (id: string) => apiService.delete(`/academics/subjects/${id}/`),

  // Teachers
  getTeachers: (params?: any) => getPaginatedData('/academics/teachers/', 1, 10, params),
  getTeacher: (id: string) => apiService.get(`/academics/teachers/${id}/`),
  createTeacher: (data: any) => apiService.post('/academics/teachers/', data),
  updateTeacher: (id: string, data: any) => apiService.put(`/academics/teachers/${id}/`, data),
  deleteTeacher: (id: string) => apiService.delete(`/academics/teachers/${id}/`),
  getTeacherCourses: (id: string) => apiService.get(`/academics/teachers/${id}/courses/`),
  getTeacherPerformance: (id: string) => apiService.get(`/academics/teachers/${id}/performance_summary/`),

  // Students
  getStudents: (params?: any) => getPaginatedData('/academics/students/', 1, 10, params),
  getStudent: (id: string) => apiService.get(`/academics/students/${id}/`),
  createStudent: (data: any) => apiService.post('/academics/students/', data),
  updateStudent: (id: string, data: any) => apiService.put(`/academics/students/${id}/`, data),
  deleteStudent: (id: string) => apiService.delete(`/academics/students/${id}/`),
  getStudentGrades: (id: string) => apiService.get(`/academics/students/${id}/grades/`),
  getStudentPerformance: (id: string) => apiService.get(`/academics/students/${id}/performance_summary/`),

  // Courses
  getCourses: (params?: any) => getPaginatedData('/academics/courses/', 1, 10, params),
  getCourse: (id: string) => apiService.get(`/academics/courses/${id}/`),
  createCourse: (data: any) => apiService.post('/academics/courses/', data),
  updateCourse: (id: string, data: any) => apiService.put(`/academics/courses/${id}/`, data),
  deleteCourse: (id: string) => apiService.delete(`/academics/courses/${id}/`),
  getCourseLessons: (id: string) => apiService.get(`/academics/courses/${id}/lessons/`),
  getCourseAssignments: (id: string) => apiService.get(`/academics/courses/${id}/assignments/`),

  // Lessons
  getLessons: (params?: any) => getPaginatedData('/academics/lessons/', 1, 10, params),
  getLesson: (id: string) => apiService.get(`/academics/lessons/${id}/`),
  createLesson: (data: any) => apiService.post('/academics/lessons/', data),
  updateLesson: (id: string, data: any) => apiService.put(`/academics/lessons/${id}/`, data),
  deleteLesson: (id: string) => apiService.delete(`/academics/lessons/${id}/`),

  // Assignments
  getAssignments: (params?: any) => getPaginatedData('/academics/assignments/', 1, 10, params),
  getAssignment: (id: string) => apiService.get(`/academics/assignments/${id}/`),
  createAssignment: (data: any) => apiService.post('/academics/assignments/', data),
  updateAssignment: (id: string, data: any) => apiService.put(`/academics/assignments/${id}/`, data),
  deleteAssignment: (id: string) => apiService.delete(`/academics/assignments/${id}/`),
  getAssignmentSubmissions: (id: string) => apiService.get(`/academics/assignments/${id}/submissions/`),

  // Assignment Submissions
  getSubmissions: (params?: any) => getPaginatedData('/academics/assignment-submissions/', 1, 10, params),
  getSubmission: (id: string) => apiService.get(`/academics/assignment-submissions/${id}/`),
  createSubmission: (data: any) => apiService.post('/academics/assignment-submissions/', data),
  updateSubmission: (id: string, data: any) => apiService.put(`/academics/assignment-submissions/${id}/`, data),
  deleteSubmission: (id: string) => apiService.delete(`/academics/assignment-submissions/${id}/`),

  // Grades
  getGrades: (params?: any) => getPaginatedData('/academics/grades/', 1, 10, params),
  getGrade: (id: string) => apiService.get(`/academics/grades/${id}/`),
  createGrade: (data: any) => apiService.post('/academics/grades/', data),
  updateGrade: (id: string, data: any) => apiService.put(`/academics/grades/${id}/`, data),
  deleteGrade: (id: string) => apiService.delete(`/academics/grades/${id}/`),
};

// Attendance API
export const attendanceAPI = {
  // Sessions
  getSessions: (params?: any) => getPaginatedData('/attendance/sessions/', 1, 10, params),
  getSession: (id: string) => apiService.get(`/attendance/sessions/${id}/`),
  createSession: (data: any) => apiService.post('/attendance/sessions/', data),
  updateSession: (id: string, data: any) => apiService.put(`/attendance/sessions/${id}/`, data),
  deleteSession: (id: string) => apiService.delete(`/attendance/sessions/${id}/`),
  bulkMarkAttendance: (id: string, data: any) => apiService.post(`/attendance/sessions/${id}/bulk_mark_attendance/`, data),

  // Records
  getRecords: (params?: any) => getPaginatedData('/attendance/records/', 1, 10, params),
  getRecord: (id: string) => apiService.get(`/attendance/records/${id}/`),
  createRecord: (data: any) => apiService.post('/attendance/records/', data),
  updateRecord: (id: string, data: any) => apiService.put(`/attendance/records/${id}/`, data),
  deleteRecord: (id: string) => apiService.delete(`/attendance/records/${id}/`),

  // Leave Requests
  getLeaveRequests: (params?: any) => getPaginatedData('/attendance/leave-requests/', 1, 10, params),
  getLeaveRequest: (id: string) => apiService.get(`/attendance/leave-requests/${id}/`),
  createLeaveRequest: (data: any) => apiService.post('/attendance/leave-requests/', data),
  updateLeaveRequest: (id: string, data: any) => apiService.put(`/attendance/leave-requests/${id}/`, data),
  deleteLeaveRequest: (id: string) => apiService.delete(`/attendance/leave-requests/${id}/`),
  approveLeaveRequest: (id: string, data: any) => apiService.post(`/attendance/leave-requests/${id}/approve/`, data),
  rejectLeaveRequest: (id: string, data: any) => apiService.post(`/attendance/leave-requests/${id}/reject/`, data),

  // Reports
  getReports: (params?: any) => getPaginatedData('/attendance/reports/', 1, 10, params),
  getReport: (id: string) => apiService.get(`/attendance/reports/${id}/`),
  generateMonthlyReport: (data: any) => apiService.post('/attendance/reports/generate_monthly/', data),

  // Settings
  getSettings: (params?: any) => getPaginatedData('/attendance/settings/', 1, 10, params),
  getSetting: (id: string) => apiService.get(`/attendance/settings/${id}/`),
  createSetting: (data: any) => apiService.post('/attendance/settings/', data),
  updateSetting: (id: string, data: any) => apiService.put(`/attendance/settings/${id}/`, data),
  deleteSetting: (id: string) => apiService.delete(`/attendance/settings/${id}/`),

  // Analytics
  getStudentAttendanceSummary: (studentId: string, params?: any) => 
    apiService.get(`/attendance/analytics/student/${studentId}/attendance_summary/`, { params }),
  getClassAttendanceSummary: (classId: string, params?: any) => 
    apiService.get(`/attendance/analytics/class/${classId}/attendance_summary/`, { params }),
  getAttendanceTrends: (params?: any) => apiService.get('/attendance/analytics/attendance_trends/', { params }),
  getLeaveRequestSummary: (params?: any) => apiService.get('/attendance/analytics/leave_request_summary/', { params }),
};

// Exam API
export const examAPI = {
  // Exams
  getExams: (params?: any) => getPaginatedData('/exams/exams/', 1, 10, params),
  getExam: (id: string) => apiService.get(`/exams/exams/${id}/`),
  createExam: (data: any) => apiService.post('/exams/exams/', data),
  updateExam: (id: string, data: any) => apiService.put(`/exams/exams/${id}/`, data),
  deleteExam: (id: string) => apiService.delete(`/exams/exams/${id}/`),
  bulkAddQuestions: (id: string, data: any) => apiService.post(`/exams/exams/${id}/bulk_add_questions/`, data),

  // Schedules
  getSchedules: (params?: any) => getPaginatedData('/exams/schedules/', 1, 10, params),
  getSchedule: (id: string) => apiService.get(`/exams/schedules/${id}/`),
  createSchedule: (data: any) => apiService.post('/exams/schedules/', data),
  updateSchedule: (id: string, data: any) => apiService.put(`/exams/schedules/${id}/`, data),
  deleteSchedule: (id: string) => apiService.delete(`/exams/schedules/${id}/`),

  // Questions
  getQuestions: (params?: any) => getPaginatedData('/exams/questions/', 1, 10, params),
  getQuestion: (id: string) => apiService.get(`/exams/questions/${id}/`),
  createQuestion: (data: any) => apiService.post('/exams/questions/', data),
  updateQuestion: (id: string, data: any) => apiService.put(`/exams/questions/${id}/`, data),
  deleteQuestion: (id: string) => apiService.delete(`/exams/questions/${id}/`),

  // Answers
  getAnswers: (params?: any) => getPaginatedData('/exams/answers/', 1, 10, params),
  getAnswer: (id: string) => apiService.get(`/exams/answers/${id}/`),
  createAnswer: (data: any) => apiService.post('/exams/answers/', data),
  updateAnswer: (id: string, data: any) => apiService.put(`/exams/answers/${id}/`, data),
  deleteAnswer: (id: string) => apiService.delete(`/exams/answers/${id}/`),

  // Results
  getResults: (params?: any) => getPaginatedData('/exams/results/', 1, 10, params),
  getResult: (id: string) => apiService.get(`/exams/results/${id}/`),
  createResult: (data: any) => apiService.post('/exams/results/', data),
  updateResult: (id: string, data: any) => apiService.put(`/exams/results/${id}/`, data),
  deleteResult: (id: string) => apiService.delete(`/exams/results/${id}/`),
  submitExam: (id: string, data: any) => apiService.post(`/exams/results/${id}/submit_exam/`, data),
  gradeExam: (id: string, data: any) => apiService.post(`/exams/results/${id}/grade_exam/`, data),

  // Student Answers
  getStudentAnswers: (params?: any) => getPaginatedData('/exams/student-answers/', 1, 10, params),
  getStudentAnswer: (id: string) => apiService.get(`/exams/student-answers/${id}/`),
  createStudentAnswer: (data: any) => apiService.post('/exams/student-answers/', data),
  updateStudentAnswer: (id: string, data: any) => apiService.put(`/exams/student-answers/${id}/`, data),
  deleteStudentAnswer: (id: string) => apiService.delete(`/exams/student-answers/${id}/`),

  // Quizzes
  getQuizzes: (params?: any) => getPaginatedData('/exams/quizzes/', 1, 10, params),
  getQuiz: (id: string) => apiService.get(`/exams/quizzes/${id}/`),
  createQuiz: (data: any) => apiService.post('/exams/quizzes/', data),
  updateQuiz: (id: string, data: any) => apiService.put(`/exams/quizzes/${id}/`, data),
  deleteQuiz: (id: string) => apiService.delete(`/exams/quizzes/${id}/`),

  // Settings
  getSettings: (params?: any) => getPaginatedData('/exams/settings/', 1, 10, params),
  getSetting: (id: string) => apiService.get(`/exams/settings/${id}/`),
  createSetting: (data: any) => apiService.post('/exams/settings/', data),
  updateSetting: (id: string, data: any) => apiService.put(`/exams/settings/${id}/`, data),
  deleteSetting: (id: string) => apiService.delete(`/exams/settings/${id}/`),

  // Analytics
  getDashboardSummary: (params?: any) => apiService.get('/exams/analytics/dashboard_summary/', { params }),
  getStudentPerformance: (studentId: string, params?: any) => 
    apiService.get(`/exams/analytics/student/${studentId}/performance/`, { params }),
  getSubjectPerformance: (subjectId: string, params?: any) => 
    apiService.get(`/exams/analytics/subject/${subjectId}/performance/`, { params }),
  getExamTrends: (params?: any) => apiService.get('/exams/analytics/exam_trends/', { params }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => apiService.get('/dashboard/stats/'),
  getAttendanceChart: (params?: any) => apiService.get('/dashboard/attendance-chart/', { params }),
  getPerformanceChart: (params?: any) => apiService.get('/dashboard/performance-chart/', { params }),
  getRecentActivities: (params?: any) => apiService.get('/dashboard/recent-activities/', { params }),
  getUpcomingEvents: (params?: any) => apiService.get('/dashboard/upcoming-events/', { params }),
};

// Notification API
export const notificationAPI = {
  getNotifications: (params?: any) => getPaginatedData('/notifications/', 1, 10, params),
  markAsRead: (id: string) => apiService.patch(`/notifications/${id}/mark-read/`),
  markAllAsRead: () => apiService.post('/notifications/mark-all-read/'),
  deleteNotification: (id: string) => apiService.delete(`/notifications/${id}/`),
};

// WebSocket service
export const createWebSocket = (token: string) => {
  const ws = new WebSocket(`${WS_BASE_URL}/notifications/?token=${token}`);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return ws;
};

// Export both the default and named export for compatibility
export { apiService as api };
export default apiService;
