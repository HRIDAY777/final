import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '../services/api';

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
  fetchStudents: (params?: any) => Promise<void>;
  fetchStudentById: (id: number) => Promise<void>;
  fetchStudentProfile: (studentId: number) => Promise<void>;
  fetchStudentGuardians: (studentId: number) => Promise<void>;
  fetchStudentDocuments: (studentId: number) => Promise<void>;
  fetchStudentAchievements: (studentId: number) => Promise<void>;
  fetchStudentDisciplines: (studentId: number) => Promise<void>;
  
  // Create actions
  createStudent: (data: Partial<Student>) => Promise<Student>;
  createStudentProfile: (data: Partial<StudentProfile>) => Promise<StudentProfile>;
  createStudentGuardian: (data: Partial<StudentGuardian>) => Promise<StudentGuardian>;
  createStudentDocument: (data: Partial<StudentDocument>) => Promise<StudentDocument>;
  createStudentAchievement: (data: Partial<StudentAchievement>) => Promise<StudentAchievement>;
  createStudentDiscipline: (data: Partial<StudentDiscipline>) => Promise<StudentDiscipline>;
  
  // Update actions
  updateStudent: (id: number, data: Partial<Student>) => Promise<Student>;
  updateStudentProfile: (id: number, data: Partial<StudentProfile>) => Promise<StudentProfile>;
  updateStudentGuardian: (id: number, data: Partial<StudentGuardian>) => Promise<StudentGuardian>;
  updateStudentDocument: (id: number, data: Partial<StudentDocument>) => Promise<StudentDocument>;
  updateStudentAchievement: (id: number, data: Partial<StudentAchievement>) => Promise<StudentAchievement>;
  updateStudentDiscipline: (id: number, data: Partial<StudentDiscipline>) => Promise<StudentDiscipline>;
  
  // Delete actions
  deleteStudent: (id: number) => Promise<void>;
  deleteStudentProfile: (id: number) => Promise<void>;
  deleteStudentGuardian: (id: number) => Promise<void>;
  deleteStudentDocument: (id: number) => Promise<void>;
  deleteStudentAchievement: (id: number) => Promise<void>;
  deleteStudentDiscipline: (id: number) => Promise<void>;
  
  // Utility actions
  setSelectedStudent: (student: Student | null) => void;
  setFilters: (filters: Partial<StudentsState['filters']>) => void;
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
    (set, get) => ({
      ...initialState,

      // Fetch actions
      fetchStudents: async (params = {}) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/students/', { params });
          set({
            students: response.data.results || response.data,
            pagination: {
              page: response.data.page || 1,
              pageSize: response.data.page_size || 20,
              total: response.data.count || response.data.length,
            },
            loading: false,
          });
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
          const response = await api.get(`/students/${id}/`);
          set({ selectedStudent: response.data, loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch student',
            loading: false,
          });
        }
      },

      fetchStudentProfile: async (studentId: number) => {
        try {
          const response = await api.get(`/students/${studentId}/profile/`);
          set((state) => ({
            studentProfiles: state.studentProfiles.map(profile =>
              profile.student === studentId ? response.data : profile
            ).concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch student profile' });
        }
      },

      fetchStudentGuardians: async (studentId: number) => {
        try {
          const response = await api.get(`/students/${studentId}/guardians/`);
          set((state) => ({
            studentGuardians: state.studentGuardians.filter(guardian => guardian.student !== studentId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch student guardians' });
        }
      },

      fetchStudentDocuments: async (studentId: number) => {
        try {
          const response = await api.get(`/students/${studentId}/documents/`);
          set((state) => ({
            studentDocuments: state.studentDocuments.filter(doc => doc.student !== studentId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch student documents' });
        }
      },

      fetchStudentAchievements: async (studentId: number) => {
        try {
          const response = await api.get(`/students/${studentId}/achievements/`);
          set((state) => ({
            studentAchievements: state.studentAchievements.filter(achievement => achievement.student !== studentId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch student achievements' });
        }
      },

      fetchStudentDisciplines: async (studentId: number) => {
        try {
          const response = await api.get(`/students/${studentId}/disciplines/`);
          set((state) => ({
            studentDisciplines: state.studentDisciplines.filter(discipline => discipline.student !== studentId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch student disciplines' });
        }
      },

      // Create actions
      createStudent: async (data: Partial<Student>) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/students/', data);
          set((state) => ({
            students: [...state.students, response.data],
            loading: false,
          }));
          return response.data;
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
          const response = await api.post('/students/profiles/', data);
          set((state) => ({
            studentProfiles: [...state.studentProfiles, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create student profile' });
          throw error;
        }
      },

      createStudentGuardian: async (data: Partial<StudentGuardian>) => {
        try {
          const response = await api.post('/students/guardians/', data);
          set((state) => ({
            studentGuardians: [...state.studentGuardians, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create student guardian' });
          throw error;
        }
      },

      createStudentDocument: async (data: Partial<StudentDocument>) => {
        try {
          const response = await api.post('/students/documents/', data);
          set((state) => ({
            studentDocuments: [...state.studentDocuments, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create student document' });
          throw error;
        }
      },

      createStudentAchievement: async (data: Partial<StudentAchievement>) => {
        try {
          const response = await api.post('/students/achievements/', data);
          set((state) => ({
            studentAchievements: [...state.studentAchievements, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create student achievement' });
          throw error;
        }
      },

      createStudentDiscipline: async (data: Partial<StudentDiscipline>) => {
        try {
          const response = await api.post('/students/disciplines/', data);
          set((state) => ({
            studentDisciplines: [...state.studentDisciplines, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create student discipline' });
          throw error;
        }
      },

      // Update actions
      updateStudent: async (id: number, data: Partial<Student>) => {
        set({ loading: true, error: null });
        try {
          const response = await api.patch(`/students/${id}/`, data);
          set((state) => ({
            students: state.students.map(student =>
              student.id === id ? response.data : student
            ),
            selectedStudent: state.selectedStudent?.id === id ? response.data : state.selectedStudent,
            loading: false,
          }));
          return response.data;
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
          const response = await api.patch(`/students/profiles/${id}/`, data);
          set((state) => ({
            studentProfiles: state.studentProfiles.map(profile =>
              profile.id === id ? response.data : profile
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update student profile' });
          throw error;
        }
      },

      updateStudentGuardian: async (id: number, data: Partial<StudentGuardian>) => {
        try {
          const response = await api.patch(`/students/guardians/${id}/`, data);
          set((state) => ({
            studentGuardians: state.studentGuardians.map(guardian =>
              guardian.id === id ? response.data : guardian
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update student guardian' });
          throw error;
        }
      },

      updateStudentDocument: async (id: number, data: Partial<StudentDocument>) => {
        try {
          const response = await api.patch(`/students/documents/${id}/`, data);
          set((state) => ({
            studentDocuments: state.studentDocuments.map(doc =>
              doc.id === id ? response.data : doc
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update student document' });
          throw error;
        }
      },

      updateStudentAchievement: async (id: number, data: Partial<StudentAchievement>) => {
        try {
          const response = await api.patch(`/students/achievements/${id}/`, data);
          set((state) => ({
            studentAchievements: state.studentAchievements.map(achievement =>
              achievement.id === id ? response.data : achievement
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update student achievement' });
          throw error;
        }
      },

      updateStudentDiscipline: async (id: number, data: Partial<StudentDiscipline>) => {
        try {
          const response = await api.patch(`/students/disciplines/${id}/`, data);
          set((state) => ({
            studentDisciplines: state.studentDisciplines.map(discipline =>
              discipline.id === id ? response.data : discipline
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update student discipline' });
          throw error;
        }
      },

      // Delete actions
      deleteStudent: async (id: number) => {
        set({ loading: true, error: null });
        try {
          await api.delete(`/students/${id}/`);
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
          await api.delete(`/students/profiles/${id}/`);
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
          await api.delete(`/students/guardians/${id}/`);
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
          await api.delete(`/students/documents/${id}/`);
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
          await api.delete(`/students/achievements/${id}/`);
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
          await api.delete(`/students/disciplines/${id}/`);
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
