import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '../services/api';

export interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  hire_date: string;
  department: Department;
  position: Position;
  salary: number;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  manager: Employee | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: number;
  title: string;
  description: string;
  department: Department;
  salary_range_min: number;
  salary_range_max: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: number;
  employee: Employee;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  approved_by: Employee | null;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: number;
  employee: Employee;
  date: string;
  check_in: string;
  check_out: string;
  total_hours: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Payroll {
  id: number;
  employee: Employee;
  month: number;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: string;
  payment_date: string;
  created_at: string;
  updated_at: string;
}

export interface PerformanceReview {
  id: number;
  employee: Employee;
  reviewer: Employee;
  review_period: string;
  rating: number;
  comments: string;
  goals: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Training {
  id: number;
  title: string;
  description: string;
  trainer: Employee;
  start_date: string;
  end_date: string;
  duration: number;
  capacity: number;
  enrolled_employees: Employee[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Recruitment {
  id: number;
  position: Position;
  title: string;
  description: string;
  requirements: string;
  salary_range: string;
  status: string;
  applications: any[];
  created_at: string;
  updated_at: string;
}

interface HRState {
  // Employees
  employees: any;
  currentEmployee: Employee | null;
  employeesLoading: boolean;
  employeesError: string | null;

  // Departments
  departments: any;
  currentDepartment: Department | null;
  departmentsLoading: boolean;
  departmentsError: string | null;

  // Positions
  positions: any;
  currentPosition: Position | null;
  positionsLoading: boolean;
  positionsError: string | null;

  // Leave Requests
  leaveRequests: any;
  currentLeaveRequest: LeaveRequest | null;
  leaveRequestsLoading: boolean;
  leaveRequestsError: string | null;

  // Attendance
  attendance: any;
  currentAttendance: Attendance | null;
  attendanceLoading: boolean;
  attendanceError: string | null;

  // Payroll
  payroll: any;
  currentPayroll: Payroll | null;
  payrollLoading: boolean;
  payrollError: string | null;

  // Performance Reviews
  performanceReviews: any;
  currentPerformanceReview: PerformanceReview | null;
  performanceReviewsLoading: boolean;
  performanceReviewsError: string | null;

  // Training
  training: any;
  currentTraining: Training | null;
  trainingLoading: boolean;
  trainingError: string | null;

  // Recruitment
  recruitment: any;
  currentRecruitment: Recruitment | null;
  recruitmentLoading: boolean;
  recruitmentError: string | null;
}

interface HRActions {
  // Employee actions
  fetchEmployees: (params?: any) => Promise<void>;
  fetchEmployeeById: (id: number) => Promise<void>;
  createEmployee: (data: Partial<Employee>) => Promise<Employee>;
  updateEmployee: (id: number, data: Partial<Employee>) => Promise<Employee>;
  deleteEmployee: (id: number) => Promise<void>;

  // Department actions
  fetchDepartments: (params?: any) => Promise<void>;
  fetchDepartmentById: (id: number) => Promise<void>;
  createDepartment: (data: Partial<Department>) => Promise<Department>;
  updateDepartment: (id: number, data: Partial<Department>) => Promise<Department>;
  deleteDepartment: (id: number) => Promise<void>;

  // Position actions
  fetchPositions: (params?: any) => Promise<void>;
  fetchPositionById: (id: number) => Promise<void>;
  createPosition: (data: Partial<Position>) => Promise<Position>;
  updatePosition: (id: number, data: Partial<Position>) => Promise<Position>;
  deletePosition: (id: number) => Promise<void>;

  // Leave Request actions
  fetchLeaveRequests: (params?: any) => Promise<void>;
  fetchLeaveRequestById: (id: number) => Promise<void>;
  createLeaveRequest: (data: Partial<LeaveRequest>) => Promise<LeaveRequest>;
  updateLeaveRequest: (id: number, data: Partial<LeaveRequest>) => Promise<LeaveRequest>;
  deleteLeaveRequest: (id: number) => Promise<void>;
  approveLeaveRequest: (id: number) => Promise<void>;
  rejectLeaveRequest: (id: number, reason: string) => Promise<void>;

  // Attendance actions
  fetchAttendance: (params?: any) => Promise<void>;
  fetchAttendanceById: (id: number) => Promise<void>;
  createAttendance: (data: Partial<Attendance>) => Promise<Attendance>;
  updateAttendance: (id: number, data: Partial<Attendance>) => Promise<Attendance>;
  deleteAttendance: (id: number) => Promise<void>;

  // Payroll actions
  fetchPayroll: (params?: any) => Promise<void>;
  fetchPayrollById: (id: number) => Promise<void>;
  createPayroll: (data: Partial<Payroll>) => Promise<Payroll>;
  updatePayroll: (id: number, data: Partial<Payroll>) => Promise<Payroll>;
  deletePayroll: (id: number) => Promise<void>;

  // Performance Review actions
  fetchPerformanceReviews: (params?: any) => Promise<void>;
  fetchPerformanceReviewById: (id: number) => Promise<void>;
  createPerformanceReview: (data: Partial<PerformanceReview>) => Promise<PerformanceReview>;
  updatePerformanceReview: (id: number, data: Partial<PerformanceReview>) => Promise<PerformanceReview>;
  deletePerformanceReview: (id: number) => Promise<void>;

  // Training actions
  fetchTraining: (params?: any) => Promise<void>;
  fetchTrainingById: (id: number) => Promise<void>;
  createTraining: (data: Partial<Training>) => Promise<Training>;
  updateTraining: (id: number, data: Partial<Training>) => Promise<Training>;
  deleteTraining: (id: number) => Promise<void>;
  enrollEmployee: (trainingId: number, employeeId: number) => Promise<void>;

  // Recruitment actions
  fetchRecruitment: (params?: any) => Promise<void>;
  fetchRecruitmentById: (id: number) => Promise<void>;
  createRecruitment: (data: Partial<Recruitment>) => Promise<Recruitment>;
  updateRecruitment: (id: number, data: Partial<Recruitment>) => Promise<Recruitment>;
  deleteRecruitment: (id: number) => Promise<void>;

  // Utility actions
  clearErrors: () => void;
  resetState: () => void;
}

const initialState: HRState = {
  employees: null,
  currentEmployee: null,
  employeesLoading: false,
  employeesError: null,

  departments: null,
  currentDepartment: null,
  departmentsLoading: false,
  departmentsError: null,

  positions: null,
  currentPosition: null,
  positionsLoading: false,
  positionsError: null,

  leaveRequests: null,
  currentLeaveRequest: null,
  leaveRequestsLoading: false,
  leaveRequestsError: null,

  attendance: null,
  currentAttendance: null,
  attendanceLoading: false,
  attendanceError: null,

  payroll: null,
  currentPayroll: null,
  payrollLoading: false,
  payrollError: null,

  performanceReviews: null,
  currentPerformanceReview: null,
  performanceReviewsLoading: false,
  performanceReviewsError: null,

  training: null,
  currentTraining: null,
  trainingLoading: false,
  trainingError: null,

  recruitment: null,
  currentRecruitment: null,
  recruitmentLoading: false,
  recruitmentError: null,
};

export const useHRStore = create<HRState & HRActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Employee actions
      fetchEmployees: async (params = {}) => {
        set({ employeesLoading: true, employeesError: null });
        try {
          const response = await api.get('/hr/employees/', { params });
          set({ employees: response.data, employeesLoading: false });
        } catch (error: any) {
          set({ 
            employeesError: error.response?.data?.message || 'Failed to fetch employees',
            employeesLoading: false 
          });
        }
      },

      fetchEmployeeById: async (id: number) => {
        set({ employeesLoading: true, employeesError: null });
        try {
          const response = await api.get(`/hr/employees/${id}/`);
          set({ currentEmployee: response.data, employeesLoading: false });
        } catch (error: any) {
          set({ 
            employeesError: error.response?.data?.message || 'Failed to fetch employee',
            employeesLoading: false 
          });
        }
      },

      createEmployee: async (data: Partial<Employee>) => {
        set({ employeesLoading: true, employeesError: null });
        try {
          const response = await api.post('/hr/employees/', data);
          set({ employeesLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            employeesError: error.response?.data?.message || 'Failed to create employee',
            employeesLoading: false 
          });
          throw error;
        }
      },

      updateEmployee: async (id: number, data: Partial<Employee>) => {
        set({ employeesLoading: true, employeesError: null });
        try {
          const response = await api.put(`/hr/employees/${id}/`, data);
          set({ employeesLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            employeesError: error.response?.data?.message || 'Failed to update employee',
            employeesLoading: false 
          });
          throw error;
        }
      },

      deleteEmployee: async (id: number) => {
        set({ employeesLoading: true, employeesError: null });
        try {
          await api.delete(`/hr/employees/${id}/`);
          set({ employeesLoading: false });
        } catch (error: any) {
          set({ 
            employeesError: error.response?.data?.message || 'Failed to delete employee',
            employeesLoading: false 
          });
          throw error;
        }
      },

      // Department actions
      fetchDepartments: async (params = {}) => {
        set({ departmentsLoading: true, departmentsError: null });
        try {
          const response = await api.get('/hr/departments/', { params });
          set({ departments: response.data, departmentsLoading: false });
        } catch (error: any) {
          set({ 
            departmentsError: error.response?.data?.message || 'Failed to fetch departments',
            departmentsLoading: false 
          });
        }
      },

      fetchDepartmentById: async (id: number) => {
        set({ departmentsLoading: true, departmentsError: null });
        try {
          const response = await api.get(`/hr/departments/${id}/`);
          set({ currentDepartment: response.data, departmentsLoading: false });
        } catch (error: any) {
          set({ 
            departmentsError: error.response?.data?.message || 'Failed to fetch department',
            departmentsLoading: false 
          });
        }
      },

      createDepartment: async (data: Partial<Department>) => {
        set({ departmentsLoading: true, departmentsError: null });
        try {
          const response = await api.post('/hr/departments/', data);
          set({ departmentsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            departmentsError: error.response?.data?.message || 'Failed to create department',
            departmentsLoading: false 
          });
          throw error;
        }
      },

      updateDepartment: async (id: number, data: Partial<Department>) => {
        set({ departmentsLoading: true, departmentsError: null });
        try {
          const response = await api.put(`/hr/departments/${id}/`, data);
          set({ departmentsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            departmentsError: error.response?.data?.message || 'Failed to update department',
            departmentsLoading: false 
          });
          throw error;
        }
      },

      deleteDepartment: async (id: number) => {
        set({ departmentsLoading: true, departmentsError: null });
        try {
          await api.delete(`/hr/departments/${id}/`);
          set({ departmentsLoading: false });
        } catch (error: any) {
          set({ 
            departmentsError: error.response?.data?.message || 'Failed to delete department',
            departmentsLoading: false 
          });
          throw error;
        }
      },

      // Position actions
      fetchPositions: async (params = {}) => {
        set({ positionsLoading: true, positionsError: null });
        try {
          const response = await api.get('/hr/positions/', { params });
          set({ positions: response.data, positionsLoading: false });
        } catch (error: any) {
          set({ 
            positionsError: error.response?.data?.message || 'Failed to fetch positions',
            positionsLoading: false 
          });
        }
      },

      fetchPositionById: async (id: number) => {
        set({ positionsLoading: true, positionsError: null });
        try {
          const response = await api.get(`/hr/positions/${id}/`);
          set({ currentPosition: response.data, positionsLoading: false });
        } catch (error: any) {
          set({ 
            positionsError: error.response?.data?.message || 'Failed to fetch position',
            positionsLoading: false 
          });
        }
      },

      createPosition: async (data: Partial<Position>) => {
        set({ positionsLoading: true, positionsError: null });
        try {
          const response = await api.post('/hr/positions/', data);
          set({ positionsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            positionsError: error.response?.data?.message || 'Failed to create position',
            positionsLoading: false 
          });
          throw error;
        }
      },

      updatePosition: async (id: number, data: Partial<Position>) => {
        set({ positionsLoading: true, positionsError: null });
        try {
          const response = await api.put(`/hr/positions/${id}/`, data);
          set({ positionsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            positionsError: error.response?.data?.message || 'Failed to update position',
            positionsLoading: false 
          });
          throw error;
        }
      },

      deletePosition: async (id: number) => {
        set({ positionsLoading: true, positionsError: null });
        try {
          await api.delete(`/hr/positions/${id}/`);
          set({ positionsLoading: false });
        } catch (error: any) {
          set({ 
            positionsError: error.response?.data?.message || 'Failed to delete position',
            positionsLoading: false 
          });
          throw error;
        }
      },

      // Leave Request actions
      fetchLeaveRequests: async (params = {}) => {
        set({ leaveRequestsLoading: true, leaveRequestsError: null });
        try {
          const response = await api.get('/hr/leave-requests/', { params });
          set({ leaveRequests: response.data, leaveRequestsLoading: false });
        } catch (error: any) {
          set({ 
            leaveRequestsError: error.response?.data?.message || 'Failed to fetch leave requests',
            leaveRequestsLoading: false 
          });
        }
      },

      fetchLeaveRequestById: async (id: number) => {
        set({ leaveRequestsLoading: true, leaveRequestsError: null });
        try {
          const response = await api.get(`/hr/leave-requests/${id}/`);
          set({ currentLeaveRequest: response.data, leaveRequestsLoading: false });
        } catch (error: any) {
          set({ 
            leaveRequestsError: error.response?.data?.message || 'Failed to fetch leave request',
            leaveRequestsLoading: false 
          });
        }
      },

      createLeaveRequest: async (data: Partial<LeaveRequest>) => {
        set({ leaveRequestsLoading: true, leaveRequestsError: null });
        try {
          const response = await api.post('/hr/leave-requests/', data);
          set({ leaveRequestsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            leaveRequestsError: error.response?.data?.message || 'Failed to create leave request',
            leaveRequestsLoading: false 
          });
          throw error;
        }
      },

      updateLeaveRequest: async (id: number, data: Partial<LeaveRequest>) => {
        set({ leaveRequestsLoading: true, leaveRequestsError: null });
        try {
          const response = await api.put(`/hr/leave-requests/${id}/`, data);
          set({ leaveRequestsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            leaveRequestsError: error.response?.data?.message || 'Failed to update leave request',
            leaveRequestsLoading: false 
          });
          throw error;
        }
      },

      deleteLeaveRequest: async (id: number) => {
        set({ leaveRequestsLoading: true, leaveRequestsError: null });
        try {
          await api.delete(`/hr/leave-requests/${id}/`);
          set({ leaveRequestsLoading: false });
        } catch (error: any) {
          set({ 
            leaveRequestsError: error.response?.data?.message || 'Failed to delete leave request',
            leaveRequestsLoading: false 
          });
          throw error;
        }
      },

      approveLeaveRequest: async (id: number) => {
        set({ leaveRequestsLoading: true, leaveRequestsError: null });
        try {
          await api.post(`/hr/leave-requests/${id}/approve/`);
          set({ leaveRequestsLoading: false });
        } catch (error: any) {
          set({ 
            leaveRequestsError: error.response?.data?.message || 'Failed to approve leave request',
            leaveRequestsLoading: false 
          });
          throw error;
        }
      },

      rejectLeaveRequest: async (id: number, reason: string) => {
        set({ leaveRequestsLoading: true, leaveRequestsError: null });
        try {
          await api.post(`/hr/leave-requests/${id}/reject/`, { reason });
          set({ leaveRequestsLoading: false });
        } catch (error: any) {
          set({ 
            leaveRequestsError: error.response?.data?.message || 'Failed to reject leave request',
            leaveRequestsLoading: false 
          });
          throw error;
        }
      },

      // Attendance actions
      fetchAttendance: async (params = {}) => {
        set({ attendanceLoading: true, attendanceError: null });
        try {
          const response = await api.get('/hr/attendance/', { params });
          set({ attendance: response.data, attendanceLoading: false });
        } catch (error: any) {
          set({ 
            attendanceError: error.response?.data?.message || 'Failed to fetch attendance',
            attendanceLoading: false 
          });
        }
      },

      fetchAttendanceById: async (id: number) => {
        set({ attendanceLoading: true, attendanceError: null });
        try {
          const response = await api.get(`/hr/attendance/${id}/`);
          set({ currentAttendance: response.data, attendanceLoading: false });
        } catch (error: any) {
          set({ 
            attendanceError: error.response?.data?.message || 'Failed to fetch attendance',
            attendanceLoading: false 
          });
        }
      },

      createAttendance: async (data: Partial<Attendance>) => {
        set({ attendanceLoading: true, attendanceError: null });
        try {
          const response = await api.post('/hr/attendance/', data);
          set({ attendanceLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            attendanceError: error.response?.data?.message || 'Failed to create attendance',
            attendanceLoading: false 
          });
          throw error;
        }
      },

      updateAttendance: async (id: number, data: Partial<Attendance>) => {
        set({ attendanceLoading: true, attendanceError: null });
        try {
          const response = await api.put(`/hr/attendance/${id}/`, data);
          set({ attendanceLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            attendanceError: error.response?.data?.message || 'Failed to update attendance',
            attendanceLoading: false 
          });
          throw error;
        }
      },

      deleteAttendance: async (id: number) => {
        set({ attendanceLoading: true, attendanceError: null });
        try {
          await api.delete(`/hr/attendance/${id}/`);
          set({ attendanceLoading: false });
        } catch (error: any) {
          set({ 
            attendanceError: error.response?.data?.message || 'Failed to delete attendance',
            attendanceLoading: false 
          });
          throw error;
        }
      },

      // Payroll actions
      fetchPayroll: async (params = {}) => {
        set({ payrollLoading: true, payrollError: null });
        try {
          const response = await api.get('/hr/payroll/', { params });
          set({ payroll: response.data, payrollLoading: false });
        } catch (error: any) {
          set({ 
            payrollError: error.response?.data?.message || 'Failed to fetch payroll',
            payrollLoading: false 
          });
        }
      },

      fetchPayrollById: async (id: number) => {
        set({ payrollLoading: true, payrollError: null });
        try {
          const response = await api.get(`/hr/payroll/${id}/`);
          set({ currentPayroll: response.data, payrollLoading: false });
        } catch (error: any) {
          set({ 
            payrollError: error.response?.data?.message || 'Failed to fetch payroll',
            payrollLoading: false 
          });
        }
      },

      createPayroll: async (data: Partial<Payroll>) => {
        set({ payrollLoading: true, payrollError: null });
        try {
          const response = await api.post('/hr/payroll/', data);
          set({ payrollLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            payrollError: error.response?.data?.message || 'Failed to create payroll',
            payrollLoading: false 
          });
          throw error;
        }
      },

      updatePayroll: async (id: number, data: Partial<Payroll>) => {
        set({ payrollLoading: true, payrollError: null });
        try {
          const response = await api.put(`/hr/payroll/${id}/`, data);
          set({ payrollLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            payrollError: error.response?.data?.message || 'Failed to update payroll',
            payrollLoading: false 
          });
          throw error;
        }
      },

      deletePayroll: async (id: number) => {
        set({ payrollLoading: true, payrollError: null });
        try {
          await api.delete(`/hr/payroll/${id}/`);
          set({ payrollLoading: false });
        } catch (error: any) {
          set({ 
            payrollError: error.response?.data?.message || 'Failed to delete payroll',
            payrollLoading: false 
          });
          throw error;
        }
      },

      // Performance Review actions
      fetchPerformanceReviews: async (params = {}) => {
        set({ performanceReviewsLoading: true, performanceReviewsError: null });
        try {
          const response = await api.get('/hr/performance-reviews/', { params });
          set({ performanceReviews: response.data, performanceReviewsLoading: false });
        } catch (error: any) {
          set({ 
            performanceReviewsError: error.response?.data?.message || 'Failed to fetch performance reviews',
            performanceReviewsLoading: false 
          });
        }
      },

      fetchPerformanceReviewById: async (id: number) => {
        set({ performanceReviewsLoading: true, performanceReviewsError: null });
        try {
          const response = await api.get(`/hr/performance-reviews/${id}/`);
          set({ currentPerformanceReview: response.data, performanceReviewsLoading: false });
        } catch (error: any) {
          set({ 
            performanceReviewsError: error.response?.data?.message || 'Failed to fetch performance review',
            performanceReviewsLoading: false 
          });
        }
      },

      createPerformanceReview: async (data: Partial<PerformanceReview>) => {
        set({ performanceReviewsLoading: true, performanceReviewsError: null });
        try {
          const response = await api.post('/hr/performance-reviews/', data);
          set({ performanceReviewsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            performanceReviewsError: error.response?.data?.message || 'Failed to create performance review',
            performanceReviewsLoading: false 
          });
          throw error;
        }
      },

      updatePerformanceReview: async (id: number, data: Partial<PerformanceReview>) => {
        set({ performanceReviewsLoading: true, performanceReviewsError: null });
        try {
          const response = await api.put(`/hr/performance-reviews/${id}/`, data);
          set({ performanceReviewsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            performanceReviewsError: error.response?.data?.message || 'Failed to update performance review',
            performanceReviewsLoading: false 
          });
          throw error;
        }
      },

      deletePerformanceReview: async (id: number) => {
        set({ performanceReviewsLoading: true, performanceReviewsError: null });
        try {
          await api.delete(`/hr/performance-reviews/${id}/`);
          set({ performanceReviewsLoading: false });
        } catch (error: any) {
          set({ 
            performanceReviewsError: error.response?.data?.message || 'Failed to delete performance review',
            performanceReviewsLoading: false 
          });
          throw error;
        }
      },

      // Training actions
      fetchTraining: async (params = {}) => {
        set({ trainingLoading: true, trainingError: null });
        try {
          const response = await api.get('/hr/training/', { params });
          set({ training: response.data, trainingLoading: false });
        } catch (error: any) {
          set({ 
            trainingError: error.response?.data?.message || 'Failed to fetch training',
            trainingLoading: false 
          });
        }
      },

      fetchTrainingById: async (id: number) => {
        set({ trainingLoading: true, trainingError: null });
        try {
          const response = await api.get(`/hr/training/${id}/`);
          set({ currentTraining: response.data, trainingLoading: false });
        } catch (error: any) {
          set({ 
            trainingError: error.response?.data?.message || 'Failed to fetch training',
            trainingLoading: false 
          });
        }
      },

      createTraining: async (data: Partial<Training>) => {
        set({ trainingLoading: true, trainingError: null });
        try {
          const response = await api.post('/hr/training/', data);
          set({ trainingLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            trainingError: error.response?.data?.message || 'Failed to create training',
            trainingLoading: false 
          });
          throw error;
        }
      },

      updateTraining: async (id: number, data: Partial<Training>) => {
        set({ trainingLoading: true, trainingError: null });
        try {
          const response = await api.put(`/hr/training/${id}/`, data);
          set({ trainingLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            trainingError: error.response?.data?.message || 'Failed to update training',
            trainingLoading: false 
          });
          throw error;
        }
      },

      deleteTraining: async (id: number) => {
        set({ trainingLoading: true, trainingError: null });
        try {
          await api.delete(`/hr/training/${id}/`);
          set({ trainingLoading: false });
        } catch (error: any) {
          set({ 
            trainingError: error.response?.data?.message || 'Failed to delete training',
            trainingLoading: false 
          });
          throw error;
        }
      },

      enrollEmployee: async (trainingId: number, employeeId: number) => {
        set({ trainingLoading: true, trainingError: null });
        try {
          await api.post(`/hr/training/${trainingId}/enroll/`, { employee_id: employeeId });
          set({ trainingLoading: false });
        } catch (error: any) {
          set({ 
            trainingError: error.response?.data?.message || 'Failed to enroll employee',
            trainingLoading: false 
          });
          throw error;
        }
      },

      // Recruitment actions
      fetchRecruitment: async (params = {}) => {
        set({ recruitmentLoading: true, recruitmentError: null });
        try {
          const response = await api.get('/hr/recruitment/', { params });
          set({ recruitment: response.data, recruitmentLoading: false });
        } catch (error: any) {
          set({ 
            recruitmentError: error.response?.data?.message || 'Failed to fetch recruitment',
            recruitmentLoading: false 
          });
        }
      },

      fetchRecruitmentById: async (id: number) => {
        set({ recruitmentLoading: true, recruitmentError: null });
        try {
          const response = await api.get(`/hr/recruitment/${id}/`);
          set({ currentRecruitment: response.data, recruitmentLoading: false });
        } catch (error: any) {
          set({ 
            recruitmentError: error.response?.data?.message || 'Failed to fetch recruitment',
            recruitmentLoading: false 
          });
        }
      },

      createRecruitment: async (data: Partial<Recruitment>) => {
        set({ recruitmentLoading: true, recruitmentError: null });
        try {
          const response = await api.post('/hr/recruitment/', data);
          set({ recruitmentLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            recruitmentError: error.response?.data?.message || 'Failed to create recruitment',
            recruitmentLoading: false 
          });
          throw error;
        }
      },

      updateRecruitment: async (id: number, data: Partial<Recruitment>) => {
        set({ recruitmentLoading: true, recruitmentError: null });
        try {
          const response = await api.put(`/hr/recruitment/${id}/`, data);
          set({ recruitmentLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            recruitmentError: error.response?.data?.message || 'Failed to update recruitment',
            recruitmentLoading: false 
          });
          throw error;
        }
      },

      deleteRecruitment: async (id: number) => {
        set({ recruitmentLoading: true, recruitmentError: null });
        try {
          await api.delete(`/hr/recruitment/${id}/`);
          set({ recruitmentLoading: false });
        } catch (error: any) {
          set({ 
            recruitmentError: error.response?.data?.message || 'Failed to delete recruitment',
            recruitmentLoading: false 
          });
          throw error;
        }
      },

      // Utility actions
      clearErrors: () => {
        set({
          employeesError: null,
          departmentsError: null,
          positionsError: null,
          leaveRequestsError: null,
          attendanceError: null,
          payrollError: null,
          performanceReviewsError: null,
          trainingError: null,
          recruitmentError: null,
        });
      },

      resetState: () => {
        set(initialState);
      },
    }),
    {
      name: 'hr-store',
    }
  )
);
