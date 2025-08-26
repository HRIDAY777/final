import { create } from 'zustand';
import { 
  AttendanceSession, AttendanceRecord, LeaveRequest, 
  AttendanceReport, AttendanceSettings, PaginatedResponse 
} from '../types';
import { attendanceAPI, handleApiError } from '../services/api';

interface AttendanceState {
  // Sessions
  sessions: PaginatedResponse<AttendanceSession> | null;
  currentSession: AttendanceSession | null;
  sessionsLoading: boolean;
  sessionsError: string | null;

  // Records
  records: PaginatedResponse<AttendanceRecord> | null;
  currentRecord: AttendanceRecord | null;
  recordsLoading: boolean;
  recordsError: string | null;

  // Leave Requests
  leaveRequests: PaginatedResponse<LeaveRequest> | null;
  currentLeaveRequest: LeaveRequest | null;
  leaveRequestsLoading: boolean;
  leaveRequestsError: string | null;

  // Reports
  reports: PaginatedResponse<AttendanceReport> | null;
  currentReport: AttendanceReport | null;
  reportsLoading: boolean;
  reportsError: string | null;

  // Settings
  settings: PaginatedResponse<AttendanceSettings> | null;
  currentSetting: AttendanceSettings | null;
  settingsLoading: boolean;
  settingsError: string | null;

  // Actions
  // Sessions
  fetchSessions: (params?: any) => Promise<void>;
  fetchSession: (id: string) => Promise<void>;
  createSession: (data: any) => Promise<boolean>;
  updateSession: (id: string, data: any) => Promise<boolean>;
  deleteSession: (id: string) => Promise<boolean>;
  bulkMarkAttendance: (id: string, data: any) => Promise<boolean>;

  // Records
  fetchRecords: (params?: any) => Promise<void>;
  fetchRecord: (id: string) => Promise<void>;
  createRecord: (data: any) => Promise<boolean>;
  updateRecord: (id: string, data: any) => Promise<boolean>;
  deleteRecord: (id: string) => Promise<boolean>;

  // Leave Requests
  fetchLeaveRequests: (params?: any) => Promise<void>;
  fetchLeaveRequest: (id: string) => Promise<void>;
  createLeaveRequest: (data: any) => Promise<boolean>;
  updateLeaveRequest: (id: string, data: any) => Promise<boolean>;
  deleteLeaveRequest: (id: string) => Promise<boolean>;
  approveLeaveRequest: (id: string, data: any) => Promise<boolean>;
  rejectLeaveRequest: (id: string, data: any) => Promise<boolean>;

  // Reports
  fetchReports: (params?: any) => Promise<void>;
  fetchReport: (id: string) => Promise<void>;
  generateMonthlyReport: (data: any) => Promise<boolean>;

  // Settings
  fetchSettings: (params?: any) => Promise<void>;
  fetchSetting: (id: string) => Promise<void>;
  createSetting: (data: any) => Promise<boolean>;
  updateSetting: (id: string, data: any) => Promise<boolean>;
  deleteSetting: (id: string) => Promise<boolean>;

  // Analytics
  getStudentAttendanceSummary: (studentId: string, params?: any) => Promise<any>;
  getClassAttendanceSummary: (classId: string, params?: any) => Promise<any>;
  getAttendanceTrends: (params?: any) => Promise<any>;
  getLeaveRequestSummary: (params?: any) => Promise<any>;

  // Utility
  clearError: (section: string) => void;
  setLoading: (section: string, loading: boolean) => void;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  // Initial state
  sessions: null,
  currentSession: null,
  sessionsLoading: false,
  sessionsError: null,

  records: null,
  currentRecord: null,
  recordsLoading: false,
  recordsError: null,

  leaveRequests: null,
  currentLeaveRequest: null,
  leaveRequestsLoading: false,
  leaveRequestsError: null,

  reports: null,
  currentReport: null,
  reportsLoading: false,
  reportsError: null,

  settings: null,
  currentSetting: null,
  settingsLoading: false,
  settingsError: null,

  // Sessions actions
  fetchSessions: async (params?: any) => {
    set({ sessionsLoading: true, sessionsError: null });
    try {
      const sessions = await attendanceAPI.getSessions(params);
      set({ sessions, sessionsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ sessionsError: errorResponse.message, sessionsLoading: false });
    }
  },

  fetchSession: async (id: string) => {
    set({ sessionsLoading: true, sessionsError: null });
    try {
      const currentSession = await attendanceAPI.getSession(id);
      set({ currentSession, sessionsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ sessionsError: errorResponse.message, sessionsLoading: false });
    }
  },

  createSession: async (data: any) => {
    set({ sessionsLoading: true, sessionsError: null });
    try {
      await attendanceAPI.createSession(data);
      await get().fetchSessions();
      set({ sessionsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ sessionsError: errorResponse.message, sessionsLoading: false });
      return false;
    }
  },

  updateSession: async (id: string, data: any) => {
    set({ sessionsLoading: true, sessionsError: null });
    try {
      await attendanceAPI.updateSession(id, data);
      await get().fetchSessions();
      set({ sessionsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ sessionsError: errorResponse.message, sessionsLoading: false });
      return false;
    }
  },

  deleteSession: async (id: string) => {
    set({ sessionsLoading: true, sessionsError: null });
    try {
      await attendanceAPI.deleteSession(id);
      await get().fetchSessions();
      set({ sessionsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ sessionsError: errorResponse.message, sessionsLoading: false });
      return false;
    }
  },

  bulkMarkAttendance: async (id: string, data: any) => {
    set({ sessionsLoading: true, sessionsError: null });
    try {
      await attendanceAPI.bulkMarkAttendance(id, data);
      set({ sessionsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ sessionsError: errorResponse.message, sessionsLoading: false });
      return false;
    }
  },

  // Records actions
  fetchRecords: async (params?: any) => {
    set({ recordsLoading: true, recordsError: null });
    try {
      const records = await attendanceAPI.getRecords(params);
      set({ records, recordsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ recordsError: errorResponse.message, recordsLoading: false });
    }
  },

  fetchRecord: async (id: string) => {
    set({ recordsLoading: true, recordsError: null });
    try {
      const currentRecord = await attendanceAPI.getRecord(id);
      set({ currentRecord, recordsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ recordsError: errorResponse.message, recordsLoading: false });
    }
  },

  createRecord: async (data: any) => {
    set({ recordsLoading: true, recordsError: null });
    try {
      await attendanceAPI.createRecord(data);
      await get().fetchRecords();
      set({ recordsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ recordsError: errorResponse.message, recordsLoading: false });
      return false;
    }
  },

  updateRecord: async (id: string, data: any) => {
    set({ recordsLoading: true, recordsError: null });
    try {
      await attendanceAPI.updateRecord(id, data);
      await get().fetchRecords();
      set({ recordsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ recordsError: errorResponse.message, recordsLoading: false });
      return false;
    }
  },

  deleteRecord: async (id: string) => {
    set({ recordsLoading: true, recordsError: null });
    try {
      await attendanceAPI.deleteRecord(id);
      await get().fetchRecords();
      set({ recordsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ recordsError: errorResponse.message, recordsLoading: false });
      return false;
    }
  },

  // Leave Requests actions
  fetchLeaveRequests: async (params?: any) => {
    set({ leaveRequestsLoading: true, leaveRequestsError: null });
    try {
      const leaveRequests = await attendanceAPI.getLeaveRequests(params);
      set({ leaveRequests, leaveRequestsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ leaveRequestsError: errorResponse.message, leaveRequestsLoading: false });
    }
  },

  fetchLeaveRequest: async (id: string) => {
    set({ leaveRequestsLoading: true, leaveRequestsError: null });
    try {
      const currentLeaveRequest = await attendanceAPI.getLeaveRequest(id);
      set({ currentLeaveRequest, leaveRequestsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ leaveRequestsError: errorResponse.message, leaveRequestsLoading: false });
    }
  },

  createLeaveRequest: async (data: any) => {
    set({ leaveRequestsLoading: true, leaveRequestsError: null });
    try {
      await attendanceAPI.createLeaveRequest(data);
      await get().fetchLeaveRequests();
      set({ leaveRequestsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ leaveRequestsError: errorResponse.message, leaveRequestsLoading: false });
      return false;
    }
  },

  updateLeaveRequest: async (id: string, data: any) => {
    set({ leaveRequestsLoading: true, leaveRequestsError: null });
    try {
      await attendanceAPI.updateLeaveRequest(id, data);
      await get().fetchLeaveRequests();
      set({ leaveRequestsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ leaveRequestsError: errorResponse.message, leaveRequestsLoading: false });
      return false;
    }
  },

  deleteLeaveRequest: async (id: string) => {
    set({ leaveRequestsLoading: true, leaveRequestsError: null });
    try {
      await attendanceAPI.deleteLeaveRequest(id);
      await get().fetchLeaveRequests();
      set({ leaveRequestsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ leaveRequestsError: errorResponse.message, leaveRequestsLoading: false });
      return false;
    }
  },

  approveLeaveRequest: async (id: string, data: any) => {
    set({ leaveRequestsLoading: true, leaveRequestsError: null });
    try {
      await attendanceAPI.approveLeaveRequest(id, data);
      await get().fetchLeaveRequests();
      set({ leaveRequestsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ leaveRequestsError: errorResponse.message, leaveRequestsLoading: false });
      return false;
    }
  },

  rejectLeaveRequest: async (id: string, data: any) => {
    set({ leaveRequestsLoading: true, leaveRequestsError: null });
    try {
      await attendanceAPI.rejectLeaveRequest(id, data);
      await get().fetchLeaveRequests();
      set({ leaveRequestsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ leaveRequestsError: errorResponse.message, leaveRequestsLoading: false });
      return false;
    }
  },

  // Reports actions
  fetchReports: async (params?: any) => {
    set({ reportsLoading: true, reportsError: null });
    try {
      const reports = await attendanceAPI.getReports(params);
      set({ reports, reportsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ reportsError: errorResponse.message, reportsLoading: false });
    }
  },

  fetchReport: async (id: string) => {
    set({ reportsLoading: true, reportsError: null });
    try {
      const currentReport = await attendanceAPI.getReport(id);
      set({ currentReport, reportsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ reportsError: errorResponse.message, reportsLoading: false });
    }
  },

  generateMonthlyReport: async (data: any) => {
    set({ reportsLoading: true, reportsError: null });
    try {
      await attendanceAPI.generateMonthlyReport(data);
      await get().fetchReports();
      set({ reportsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ reportsError: errorResponse.message, reportsLoading: false });
      return false;
    }
  },

  // Settings actions
  fetchSettings: async (params?: any) => {
    set({ settingsLoading: true, settingsError: null });
    try {
      const settings = await attendanceAPI.getSettings(params);
      set({ settings, settingsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ settingsError: errorResponse.message, settingsLoading: false });
    }
  },

  fetchSetting: async (id: string) => {
    set({ settingsLoading: true, settingsError: null });
    try {
      const currentSetting = await attendanceAPI.getSetting(id);
      set({ currentSetting, settingsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ settingsError: errorResponse.message, settingsLoading: false });
    }
  },

  createSetting: async (data: any) => {
    set({ settingsLoading: true, settingsError: null });
    try {
      await attendanceAPI.createSetting(data);
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
      await attendanceAPI.updateSetting(id, data);
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
      await attendanceAPI.deleteSetting(id);
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
  getStudentAttendanceSummary: async (studentId: string, params?: any) => {
    try {
      return await attendanceAPI.getStudentAttendanceSummary(studentId, params);
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ recordsError: errorResponse.message });
      return null;
    }
  },

  getClassAttendanceSummary: async (classId: string, params?: any) => {
    try {
      return await attendanceAPI.getClassAttendanceSummary(classId, params);
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ sessionsError: errorResponse.message });
      return null;
    }
  },

  getAttendanceTrends: async (params?: any) => {
    try {
      return await attendanceAPI.getAttendanceTrends(params);
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ recordsError: errorResponse.message });
      return null;
    }
  },

  getLeaveRequestSummary: async (params?: any) => {
    try {
      return await attendanceAPI.getLeaveRequestSummary(params);
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ leaveRequestsError: errorResponse.message });
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
export const useAttendanceSessions = () => useAttendanceStore((state) => ({
  sessions: state.sessions,
  currentSession: state.currentSession,
  loading: state.sessionsLoading,
  error: state.sessionsError,
  fetchSessions: state.fetchSessions,
  fetchSession: state.fetchSession,
  createSession: state.createSession,
  updateSession: state.updateSession,
  deleteSession: state.deleteSession,
  bulkMarkAttendance: state.bulkMarkAttendance,
}));

export const useAttendanceRecords = () => useAttendanceStore((state) => ({
  records: state.records,
  currentRecord: state.currentRecord,
  loading: state.recordsLoading,
  error: state.recordsError,
  fetchRecords: state.fetchRecords,
  fetchRecord: state.fetchRecord,
  createRecord: state.createRecord,
  updateRecord: state.updateRecord,
  deleteRecord: state.deleteRecord,
}));

export const useLeaveRequests = () => useAttendanceStore((state) => ({
  leaveRequests: state.leaveRequests,
  currentLeaveRequest: state.currentLeaveRequest,
  loading: state.leaveRequestsLoading,
  error: state.leaveRequestsError,
  fetchLeaveRequests: state.fetchLeaveRequests,
  fetchLeaveRequest: state.fetchLeaveRequest,
  createLeaveRequest: state.createLeaveRequest,
  updateLeaveRequest: state.updateLeaveRequest,
  deleteLeaveRequest: state.deleteLeaveRequest,
  approveLeaveRequest: state.approveLeaveRequest,
  rejectLeaveRequest: state.rejectLeaveRequest,
}));

export const useAttendanceReports = () => useAttendanceStore((state) => ({
  reports: state.reports,
  currentReport: state.currentReport,
  loading: state.reportsLoading,
  error: state.reportsError,
  fetchReports: state.fetchReports,
  fetchReport: state.fetchReport,
  generateMonthlyReport: state.generateMonthlyReport,
}));

export const useAttendanceSettings = () => useAttendanceStore((state) => ({
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


