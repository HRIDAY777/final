import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiService } from '../services/api';

export interface Student {
  id: number;
  student_id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'O';
  blood_group?: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  current_class?: number;
  admission_date: string;
  academic_year?: number;
  status: 'active' | 'inactive' | 'graduated' | 'transferred' | 'suspended' | 'expelled';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  full_name?: string;
  age?: number;
}

export interface StudentProfile {
  id: number;
  student: number;
  profile_picture?: string;
  emergency_contact: string;
  emergency_phone: string;
  medical_conditions?: string;
  allergies?: string;
  dietary_restrictions?: string;
  hobbies?: string;
  achievements?: string;
  notes?: string;
}

export interface StudentGuardian {
  id: number;
  student: number;
  first_name: string;
  last_name: string;
  relationship: string;
  phone: string;
  email?: string;
  address: string;
  occupation?: string;
  is_primary: boolean;
}

export interface StudentDocument {
  id: number;
  student: number;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  description?: string;
}

export interface StudentAchievement {
  id: number;
  student: number;
  title: string;
  description: string;
  achievement_date: string;
  category: string;
  certificate_url?: string;
}

export interface StudentDiscipline {
  id: number;
  student: number;
  incident_date: string;
  description: string;
  action_taken: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  resolved_date?: string;
}

interface StudentsState {
  students: Student[];
  studentProfiles: StudentProfile[];
  studentGuardians: StudentGuardian[];
  studentDocuments: StudentDocument[];
  studentAchievements: StudentAchievement[];
  studentDisciplines: StudentDiscipline[];
  loading: boolean;
  error: string | null;
  selectedStudent: Student | null;
  filters: {
    status: string;
    gender: string;
    current_class: string;
    search: string;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

interface StudentsActions {
  // Fetch actions
  // eslint-disable-next-line no-unused-vars
  fetchStudents: (params?: any) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchStudentById: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchStudentProfile: (studentId: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchStudentGuardians: (studentId: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchStudentDocuments: (studentId: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchStudentAchievements: (studentId: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchStudentDisciplines: (studentId: number) => Promise<void>;
  
  // Create actions
  // eslint-disable-next-line no-unused-vars
  createStudent: (data: Partial<Student>) => Promise<Student>;
  // eslint-disable-next-line no-unused-vars
  createStudentProfile: (data: Partial<StudentProfile>) => Promise<StudentProfile>;
  // eslint-disable-next-line no-unused-vars
  createStudentGuardian: (data: Partial<StudentGuardian>) => Promise<StudentGuardian>;
  // eslint-disable-next-line no-unused-vars
  createStudentDocument: (data: Partial<StudentDocument>) => Promise<StudentDocument>;
  // eslint-disable-next-line no-unused-vars
  createStudentAchievement: (data: Partial<StudentAchievement>) => Promise<StudentAchievement>;
  // eslint-disable-next-line no-unused-vars
  createStudentDiscipline: (data: Partial<StudentDiscipline>) => Promise<StudentDiscipline>;
  
  // Update actions
  // eslint-disable-next-line no-unused-vars
  updateStudent: (id: number, data: Partial<Student>) => Promise<Student>;
  // eslint-disable-next-line no-unused-vars
  updateStudentProfile: (id: number, data: Partial<StudentProfile>) => Promise<StudentProfile>;
  // eslint-disable-next-line no-unused-vars
  updateStudentGuardian: (id: number, data: Partial<StudentGuardian>) => Promise<StudentGuardian>;
  // eslint-disable-next-line no-unused-vars
  updateStudentDocument: (id: number, data: Partial<StudentDocument>) => Promise<StudentDocument>;
  // eslint-disable-next-line no-unused-vars
  updateStudentAchievement: (id: number, data: Partial<StudentAchievement>) => Promise<StudentAchievement>;
  // eslint-disable-next-line no-unused-vars
  updateStudentDiscipline: (id: number, data: Partial<StudentDiscipline>) => Promise<StudentDiscipline>;
  
  // Delete actions
  // eslint-disable-next-line no-unused-vars
  deleteStudent: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  deleteStudentProfile: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  deleteStudentGuardian: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  deleteStudentDocument: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  deleteStudentAchievement: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  deleteStudentDiscipline: (id: number) => Promise<void>;
  
  // Utility actions
  // eslint-disable-next-line no-unused-vars
  setSelectedStudent: (student: Student | null) => void;
  // eslint-disable-next-line no-unused-vars
  setFilters: (filters: Partial<StudentsState['filters']>) => void;
  // eslint-disable-next-line no-unused-vars
  setPagination: (pagination: Partial<StudentsState['pagination']>) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: StudentsState = {
  students: [],
  studentProfiles: [],
  studentGuardians: [],
  studentDocuments: [],
  studentAchievements: [],
  studentDisciplines: [],
  loading: false,
  error: null,
  selectedStudent: null,
  filters: {
    status: '',
    gender: '',
    current_class: '',
    search: '',
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
};

export const useStudentsStore = create<StudentsState & StudentsActions>()(
  devtools(
    // eslint-disable-next-line no-unused-vars
    (set, get) => ({
      ...initialState,

      // Fetch actions
      fetchStudents: async (params = {}) => {
        set({ loading: true, error: null });
        try {
          const response = await apiService.get<{ results: Student[], page: number, page_size: number, count: number } | Student[]>('/students/', { params });
          if ('results' in response) {
            // Paginated response
            set({
              students: response.results,
              pagination: {
                page: response.page || 1,
                pageSize: response.page_size || 20,
                total: response.count || 0,
              },
              loading: false,
            });
          } else {
            // Non-paginated response (array)
            set({
              students: response,
              pagination: {
                page: 1,
                pageSize: response.length,
                total: response.length,
              },
              loading: false,
            });
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch students',
            loading: false,
          });
        }
      },

      fetchStudentById: async (id: number) => {
        set({ loading: true, error: null });
        try {
          const response = await apiService.get<Student>(`/students/${id}/`);
          set({ selectedStudent: response, loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch student',
            loading: false,
          });
        }
      },

      fetchStudentProfile: async (studentId: number) => {
        try {
          const response = await apiService.get<StudentProfile>(`/students/${studentId}/profile/`);
          set((state) => ({
            studentProfiles: state.studentProfiles.map(profile =>
              profile.student === studentId ? response : profile
            ).concat(response),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch student profile' });
        }
      },

      fetchStudentGuardians: async (studentId: number) => {
        try {
          const response = await apiService.get<StudentGuardian[]>(`/students/${studentId}/guardians/`);
          set((state) => ({
            studentGuardians: state.studentGuardians.filter(guardian => guardian.student !== studentId)
              .concat(response),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch student guardians' });
        }
      },

      fetchStudentDocuments: async (studentId: number) => {
        try {
          const response = await apiService.get<StudentDocument[]>(`/students/${studentId}/documents/`);
          set((state) => ({
            studentDocuments: state.studentDocuments.filter(doc => doc.student !== studentId)
              .concat(response),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch student documents' });
        }
      },

      fetchStudentAchievements: async (studentId: number) => {
        try {
          const response = await apiService.get<StudentAchievement[]>(`/students/${studentId}/achievements/`);
          set((state) => ({
            studentAchievements: state.studentAchievements.filter(achievement => achievement.student !== studentId)
              .concat(response),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch student achievements' });
        }
      },

      fetchStudentDisciplines: async (studentId: number) => {
        try {
          const response = await apiService.get<StudentDiscipline[]>(`/students/${studentId}/disciplines/`);
          set((state) => ({
            studentDisciplines: state.studentDisciplines.filter(discipline => discipline.student !== studentId)
              .concat(response),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch student disciplines' });
        }
      },

      // Create actions
      createStudent: async (data: Partial<Student>) => {
        set({ loading: true, error: null });
        try {
          const response = await apiService.post<Student>('/students/', data);
          set((state) => ({
            students: [...state.students, response],
            loading: false,
          }));
          return response;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to create student',
            loading: false,
          });
          throw error;
        }
      },

      createStudentProfile: async (data: Partial<StudentProfile>) => {
        try {
          const response = await apiService.post<StudentProfile>('/students/profiles/', data);
          set((state) => ({
            studentProfiles: [...state.studentProfiles, response],
          }));
          return response;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create student profile' });
          throw error;
        }
      },

      createStudentGuardian: async (data: Partial<StudentGuardian>) => {
        try {
          const response = await apiService.post<StudentGuardian>('/students/guardians/', data);
          set((state) => ({
            studentGuardians: [...state.studentGuardians, response],
          }));
          return response;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create student guardian' });
          throw error;
        }
      },

      createStudentDocument: async (data: Partial<StudentDocument>) => {
        try {
          const response = await apiService.post<StudentDocument>('/students/documents/', data);
          set((state) => ({
            studentDocuments: [...state.studentDocuments, response],
          }));
          return response;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create student document' });
          throw error;
        }
      },

      createStudentAchievement: async (data: Partial<StudentAchievement>) => {
        try {
          const response = await apiService.post<StudentAchievement>('/students/achievements/', data);
          set((state) => ({
            studentAchievements: [...state.studentAchievements, response],
          }));
          return response;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create student achievement' });
          throw error;
        }
      },

      createStudentDiscipline: async (data: Partial<StudentDiscipline>) => {
        try {
          const response = await apiService.post<StudentDiscipline>('/students/disciplines/', data);
          set((state) => ({
            studentDisciplines: [...state.studentDisciplines, response],
          }));
          return response;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create student discipline' });
          throw error;
        }
      },

      // Update actions
      updateStudent: async (id: number, data: Partial<Student>) => {
        set({ loading: true, error: null });
        try {
          const response = await apiService.patch<Student>(`/students/${id}/`, data);
          set((state) => ({
            students: state.students.map(student =>
              student.id === id ? response : student
            ),
            selectedStudent: state.selectedStudent?.id === id ? response : state.selectedStudent,
            loading: false,
          }));
          return response;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to update student',
            loading: false,
          });
          throw error;
        }
      },

      updateStudentProfile: async (id: number, data: Partial<StudentProfile>) => {
        try {
          const response = await apiService.patch<StudentProfile>(`/students/profiles/${id}/`, data);
          set((state) => ({
            studentProfiles: state.studentProfiles.map(profile =>
              profile.id === id ? response : profile
            ),
          }));
          return response;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update student profile' });
          throw error;
        }
      },

      updateStudentGuardian: async (id: number, data: Partial<StudentGuardian>) => {
        try {
          const response = await apiService.patch<StudentGuardian>(`/students/guardians/${id}/`, data);
          set((state) => ({
            studentGuardians: state.studentGuardians.map(guardian =>
              guardian.id === id ? response : guardian
            ),
          }));
          return response;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update student guardian' });
          throw error;
        }
      },

      updateStudentDocument: async (id: number, data: Partial<StudentDocument>) => {
        try {
          const response = await apiService.patch<StudentDocument>(`/students/documents/${id}/`, data);
          set((state) => ({
            studentDocuments: state.studentDocuments.map(doc =>
              doc.id === id ? response : doc
            ),
          }));
          return response;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update student document' });
          throw error;
        }
      },

      updateStudentAchievement: async (id: number, data: Partial<StudentAchievement>) => {
        try {
          const response = await apiService.patch<StudentAchievement>(`/students/achievements/${id}/`, data);
          set((state) => ({
            studentAchievements: state.studentAchievements.map(achievement =>
              achievement.id === id ? response : achievement
            ),
          }));
          return response;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update student achievement' });
          throw error;
        }
      },

      updateStudentDiscipline: async (id: number, data: Partial<StudentDiscipline>) => {
        try {
          const response = await apiService.patch<StudentDiscipline>(`/students/disciplines/${id}/`, data);
          set((state) => ({
            studentDisciplines: state.studentDisciplines.map(discipline =>
              discipline.id === id ? response : discipline
            ),
          }));
          return response;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update student discipline' });
          throw error;
        }
      },

      // Delete actions
      deleteStudent: async (id: number) => {
        set({ loading: true, error: null });
        try {
          await apiService.delete(`/students/${id}/`);
          set((state) => ({
            students: state.students.filter(student => student.id !== id),
            selectedStudent: state.selectedStudent?.id === id ? null : state.selectedStudent,
            loading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to delete student',
            loading: false,
          });
          throw error;
        }
      },

      deleteStudentProfile: async (id: number) => {
        try {
          await apiService.delete(`/students/profiles/${id}/`);
          set((state) => ({
            studentProfiles: state.studentProfiles.filter(profile => profile.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete student profile' });
          throw error;
        }
      },

      deleteStudentGuardian: async (id: number) => {
        try {
          await apiService.delete(`/students/guardians/${id}/`);
          set((state) => ({
            studentGuardians: state.studentGuardians.filter(guardian => guardian.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete student guardian' });
          throw error;
        }
      },

      deleteStudentDocument: async (id: number) => {
        try {
          await apiService.delete(`/students/documents/${id}/`);
          set((state) => ({
            studentDocuments: state.studentDocuments.filter(doc => doc.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete student document' });
          throw error;
        }
      },

      deleteStudentAchievement: async (id: number) => {
        try {
          await apiService.delete(`/students/achievements/${id}/`);
          set((state) => ({
            studentAchievements: state.studentAchievements.filter(achievement => achievement.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete student achievement' });
          throw error;
        }
      },

      deleteStudentDiscipline: async (id: number) => {
        try {
          await apiService.delete(`/students/disciplines/${id}/`);
          set((state) => ({
            studentDisciplines: state.studentDisciplines.filter(discipline => discipline.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete student discipline' });
          throw error;
        }
      },

      // Utility actions
      setSelectedStudent: (student) => set({ selectedStudent: student }),
      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
      setPagination: (pagination) => set((state) => ({ pagination: { ...state.pagination, ...pagination } })),
      clearError: () => set({ error: null }),
      reset: () => set(initialState),
    }),
    {
      name: 'students-store',
    }
  )
);
