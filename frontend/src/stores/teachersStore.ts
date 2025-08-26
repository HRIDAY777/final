import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '../services/api';

export interface Teacher {
  id: number;
  teacher_id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'O';
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  hire_date: string;
  department?: string;
  position: string;
  qualification: string;
  experience_years: number;
  salary?: number;
  status: 'active' | 'inactive' | 'retired' | 'resigned';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  full_name?: string;
  age?: number;
}

export interface TeacherProfile {
  id: number;
  teacher: number;
  profile_picture?: string;
  bio?: string;
  specializations: string[];
  certifications: string[];
  languages: string[];
  emergency_contact: string;
  emergency_phone: string;
  bank_details?: {
    bank_name: string;
    account_number: string;
    ifsc_code: string;
  };
  social_media?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface TeacherQualification {
  id: number;
  teacher: number;
  degree: string;
  institution: string;
  year_completed: number;
  grade?: string;
  certificate_url?: string;
}

export interface TeacherExperience {
  id: number;
  teacher: number;
  institution: string;
  position: string;
  start_date: string;
  end_date?: string;
  description: string;
  achievements?: string;
}

export interface TeacherSubject {
  id: number;
  teacher: number;
  subject: number;
  subject_name: string;
  is_primary: boolean;
  expertise_level: 'beginner' | 'intermediate' | 'expert';
}

export interface TeacherClass {
  id: number;
  teacher: number;
  class: number;
  class_name: string;
  academic_year: number;
  is_class_teacher: boolean;
  subjects: string[];
}

export interface TeacherAttendance {
  id: number;
  teacher: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  check_in?: string;
  check_out?: string;
  notes?: string;
}

export interface TeacherSalary {
  id: number;
  teacher: number;
  month: number;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  payment_date?: string;
  payment_status: 'pending' | 'paid' | 'cancelled';
}

export interface TeacherLeave {
  id: number;
  teacher: number;
  leave_type: 'sick' | 'casual' | 'annual' | 'maternity' | 'paternity' | 'other';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approved_date?: string;
  notes?: string;
}

export interface TeacherPerformance {
  id: number;
  teacher: number;
  academic_year: number;
  semester?: number;
  teaching_effectiveness: number;
  student_satisfaction: number;
  administrative_skills: number;
  professional_development: number;
  overall_rating: number;
  review_date: string;
  reviewer: number;
  comments?: string;
  goals?: string;
}

export interface TeacherDocument {
  id: number;
  teacher: number;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  description?: string;
  expiry_date?: string;
}

interface TeachersState {
  teachers: Teacher[];
  teacherProfiles: TeacherProfile[];
  teacherQualifications: TeacherQualification[];
  teacherExperiences: TeacherExperience[];
  teacherSubjects: TeacherSubject[];
  teacherClasses: TeacherClass[];
  teacherAttendance: TeacherAttendance[];
  teacherSalaries: TeacherSalary[];
  teacherLeaves: TeacherLeave[];
  teacherPerformances: TeacherPerformance[];
  teacherDocuments: TeacherDocument[];
  loading: boolean;
  error: string | null;
  selectedTeacher: Teacher | null;
  filters: {
    status: string;
    gender: string;
    department: string;
    position: string;
    search: string;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

interface TeachersActions {
  // Fetch actions
  fetchTeachers: (params?: any) => Promise<void>;
  fetchTeacherById: (id: number) => Promise<void>;
  fetchTeacherProfile: (teacherId: number) => Promise<void>;
  fetchTeacherQualifications: (teacherId: number) => Promise<void>;
  fetchTeacherExperiences: (teacherId: number) => Promise<void>;
  fetchTeacherSubjects: (teacherId: number) => Promise<void>;
  fetchTeacherClasses: (teacherId: number) => Promise<void>;
  fetchTeacherAttendance: (teacherId: number, params?: any) => Promise<void>;
  fetchTeacherSalaries: (teacherId: number, params?: any) => Promise<void>;
  fetchTeacherLeaves: (teacherId: number, params?: any) => Promise<void>;
  fetchTeacherPerformances: (teacherId: number) => Promise<void>;
  fetchTeacherDocuments: (teacherId: number) => Promise<void>;
  
  // Create actions
  createTeacher: (data: Partial<Teacher>) => Promise<Teacher>;
  createTeacherProfile: (data: Partial<TeacherProfile>) => Promise<TeacherProfile>;
  createTeacherQualification: (data: Partial<TeacherQualification>) => Promise<TeacherQualification>;
  createTeacherExperience: (data: Partial<TeacherExperience>) => Promise<TeacherExperience>;
  createTeacherSubject: (data: Partial<TeacherSubject>) => Promise<TeacherSubject>;
  createTeacherClass: (data: Partial<TeacherClass>) => Promise<TeacherClass>;
  createTeacherAttendance: (data: Partial<TeacherAttendance>) => Promise<TeacherAttendance>;
  createTeacherSalary: (data: Partial<TeacherSalary>) => Promise<TeacherSalary>;
  createTeacherLeave: (data: Partial<TeacherLeave>) => Promise<TeacherLeave>;
  createTeacherPerformance: (data: Partial<TeacherPerformance>) => Promise<TeacherPerformance>;
  createTeacherDocument: (data: Partial<TeacherDocument>) => Promise<TeacherDocument>;
  
  // Update actions
  updateTeacher: (id: number, data: Partial<Teacher>) => Promise<Teacher>;
  updateTeacherProfile: (id: number, data: Partial<TeacherProfile>) => Promise<TeacherProfile>;
  updateTeacherQualification: (id: number, data: Partial<TeacherQualification>) => Promise<TeacherQualification>;
  updateTeacherExperience: (id: number, data: Partial<TeacherExperience>) => Promise<TeacherExperience>;
  updateTeacherSubject: (id: number, data: Partial<TeacherSubject>) => Promise<TeacherSubject>;
  updateTeacherClass: (id: number, data: Partial<TeacherClass>) => Promise<TeacherClass>;
  updateTeacherAttendance: (id: number, data: Partial<TeacherAttendance>) => Promise<TeacherAttendance>;
  updateTeacherSalary: (id: number, data: Partial<TeacherSalary>) => Promise<TeacherSalary>;
  updateTeacherLeave: (id: number, data: Partial<TeacherLeave>) => Promise<TeacherLeave>;
  updateTeacherPerformance: (id: number, data: Partial<TeacherPerformance>) => Promise<TeacherPerformance>;
  updateTeacherDocument: (id: number, data: Partial<TeacherDocument>) => Promise<TeacherDocument>;
  
  // Delete actions
  deleteTeacher: (id: number) => Promise<void>;
  deleteTeacherProfile: (id: number) => Promise<void>;
  deleteTeacherQualification: (id: number) => Promise<void>;
  deleteTeacherExperience: (id: number) => Promise<void>;
  deleteTeacherSubject: (id: number) => Promise<void>;
  deleteTeacherClass: (id: number) => Promise<void>;
  deleteTeacherAttendance: (id: number) => Promise<void>;
  deleteTeacherSalary: (id: number) => Promise<void>;
  deleteTeacherLeave: (id: number) => Promise<void>;
  deleteTeacherPerformance: (id: number) => Promise<void>;
  deleteTeacherDocument: (id: number) => Promise<void>;
  
  // Utility actions
  setSelectedTeacher: (teacher: Teacher | null) => void;
  setFilters: (filters: Partial<TeachersState['filters']>) => void;
  setPagination: (pagination: Partial<TeachersState['pagination']>) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: TeachersState = {
  teachers: [],
  teacherProfiles: [],
  teacherQualifications: [],
  teacherExperiences: [],
  teacherSubjects: [],
  teacherClasses: [],
  teacherAttendance: [],
  teacherSalaries: [],
  teacherLeaves: [],
  teacherPerformances: [],
  teacherDocuments: [],
  loading: false,
  error: null,
  selectedTeacher: null,
  filters: {
    status: '',
    gender: '',
    department: '',
    position: '',
    search: '',
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
};

export const useTeachersStore = create<TeachersState & TeachersActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Fetch actions
      fetchTeachers: async (params = {}) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/teachers/', { params });
          set({
            teachers: response.data.results || response.data,
            pagination: {
              page: response.data.page || 1,
              pageSize: response.data.page_size || 20,
              total: response.data.count || response.data.length,
            },
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch teachers',
            loading: false,
          });
        }
      },

      fetchTeacherById: async (id: number) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get(`/teachers/${id}/`);
          set({ selectedTeacher: response.data, loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch teacher',
            loading: false,
          });
        }
      },

      fetchTeacherProfile: async (teacherId: number) => {
        try {
          const response = await api.get(`/teachers/${teacherId}/profile/`);
          set((state) => ({
            teacherProfiles: state.teacherProfiles.map(profile =>
              profile.teacher === teacherId ? response.data : profile
            ).concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch teacher profile' });
        }
      },

      fetchTeacherQualifications: async (teacherId: number) => {
        try {
          const response = await api.get(`/teachers/${teacherId}/qualifications/`);
          set((state) => ({
            teacherQualifications: state.teacherQualifications.filter(qual => qual.teacher !== teacherId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch teacher qualifications' });
        }
      },

      fetchTeacherExperiences: async (teacherId: number) => {
        try {
          const response = await api.get(`/teachers/${teacherId}/experiences/`);
          set((state) => ({
            teacherExperiences: state.teacherExperiences.filter(exp => exp.teacher !== teacherId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch teacher experiences' });
        }
      },

      fetchTeacherSubjects: async (teacherId: number) => {
        try {
          const response = await api.get(`/teachers/${teacherId}/subjects/`);
          set((state) => ({
            teacherSubjects: state.teacherSubjects.filter(subject => subject.teacher !== teacherId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch teacher subjects' });
        }
      },

      fetchTeacherClasses: async (teacherId: number) => {
        try {
          const response = await api.get(`/teachers/${teacherId}/classes/`);
          set((state) => ({
            teacherClasses: state.teacherClasses.filter(cls => cls.teacher !== teacherId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch teacher classes' });
        }
      },

      fetchTeacherAttendance: async (teacherId: number, params = {}) => {
        try {
          const response = await api.get(`/teachers/${teacherId}/attendance/`, { params });
          set((state) => ({
            teacherAttendance: state.teacherAttendance.filter(att => att.teacher !== teacherId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch teacher attendance' });
        }
      },

      fetchTeacherSalaries: async (teacherId: number, params = {}) => {
        try {
          const response = await api.get(`/teachers/${teacherId}/salaries/`, { params });
          set((state) => ({
            teacherSalaries: state.teacherSalaries.filter(salary => salary.teacher !== teacherId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch teacher salaries' });
        }
      },

      fetchTeacherLeaves: async (teacherId: number, params = {}) => {
        try {
          const response = await api.get(`/teachers/${teacherId}/leaves/`, { params });
          set((state) => ({
            teacherLeaves: state.teacherLeaves.filter(leave => leave.teacher !== teacherId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch teacher leaves' });
        }
      },

      fetchTeacherPerformances: async (teacherId: number) => {
        try {
          const response = await api.get(`/teachers/${teacherId}/performances/`);
          set((state) => ({
            teacherPerformances: state.teacherPerformances.filter(perf => perf.teacher !== teacherId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch teacher performances' });
        }
      },

      fetchTeacherDocuments: async (teacherId: number) => {
        try {
          const response = await api.get(`/teachers/${teacherId}/documents/`);
          set((state) => ({
            teacherDocuments: state.teacherDocuments.filter(doc => doc.teacher !== teacherId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch teacher documents' });
        }
      },

      // Create actions
      createTeacher: async (data: Partial<Teacher>) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/teachers/', data);
          set((state) => ({
            teachers: [...state.teachers, response.data],
            loading: false,
          }));
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to create teacher',
            loading: false,
          });
          throw error;
        }
      },

      createTeacherProfile: async (data: Partial<TeacherProfile>) => {
        try {
          const response = await api.post('/teachers/profiles/', data);
          set((state) => ({
            teacherProfiles: [...state.teacherProfiles, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create teacher profile' });
          throw error;
        }
      },

      createTeacherQualification: async (data: Partial<TeacherQualification>) => {
        try {
          const response = await api.post('/teachers/qualifications/', data);
          set((state) => ({
            teacherQualifications: [...state.teacherQualifications, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create teacher qualification' });
          throw error;
        }
      },

      createTeacherExperience: async (data: Partial<TeacherExperience>) => {
        try {
          const response = await api.post('/teachers/experiences/', data);
          set((state) => ({
            teacherExperiences: [...state.teacherExperiences, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create teacher experience' });
          throw error;
        }
      },

      createTeacherSubject: async (data: Partial<TeacherSubject>) => {
        try {
          const response = await api.post('/teachers/subjects/', data);
          set((state) => ({
            teacherSubjects: [...state.teacherSubjects, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create teacher subject' });
          throw error;
        }
      },

      createTeacherClass: async (data: Partial<TeacherClass>) => {
        try {
          const response = await api.post('/teachers/classes/', data);
          set((state) => ({
            teacherClasses: [...state.teacherClasses, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create teacher class' });
          throw error;
        }
      },

      createTeacherAttendance: async (data: Partial<TeacherAttendance>) => {
        try {
          const response = await api.post('/teachers/attendance/', data);
          set((state) => ({
            teacherAttendance: [...state.teacherAttendance, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create teacher attendance' });
          throw error;
        }
      },

      createTeacherSalary: async (data: Partial<TeacherSalary>) => {
        try {
          const response = await api.post('/teachers/salaries/', data);
          set((state) => ({
            teacherSalaries: [...state.teacherSalaries, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create teacher salary' });
          throw error;
        }
      },

      createTeacherLeave: async (data: Partial<TeacherLeave>) => {
        try {
          const response = await api.post('/teachers/leaves/', data);
          set((state) => ({
            teacherLeaves: [...state.teacherLeaves, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create teacher leave' });
          throw error;
        }
      },

      createTeacherPerformance: async (data: Partial<TeacherPerformance>) => {
        try {
          const response = await api.post('/teachers/performances/', data);
          set((state) => ({
            teacherPerformances: [...state.teacherPerformances, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create teacher performance' });
          throw error;
        }
      },

      createTeacherDocument: async (data: Partial<TeacherDocument>) => {
        try {
          const response = await api.post('/teachers/documents/', data);
          set((state) => ({
            teacherDocuments: [...state.teacherDocuments, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create teacher document' });
          throw error;
        }
      },

      // Update actions
      updateTeacher: async (id: number, data: Partial<Teacher>) => {
        set({ loading: true, error: null });
        try {
          const response = await api.patch(`/teachers/${id}/`, data);
          set((state) => ({
            teachers: state.teachers.map(teacher =>
              teacher.id === id ? response.data : teacher
            ),
            selectedTeacher: state.selectedTeacher?.id === id ? response.data : state.selectedTeacher,
            loading: false,
          }));
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to update teacher',
            loading: false,
          });
          throw error;
        }
      },

      updateTeacherProfile: async (id: number, data: Partial<TeacherProfile>) => {
        try {
          const response = await api.patch(`/teachers/profiles/${id}/`, data);
          set((state) => ({
            teacherProfiles: state.teacherProfiles.map(profile =>
              profile.id === id ? response.data : profile
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update teacher profile' });
          throw error;
        }
      },

      updateTeacherQualification: async (id: number, data: Partial<TeacherQualification>) => {
        try {
          const response = await api.patch(`/teachers/qualifications/${id}/`, data);
          set((state) => ({
            teacherQualifications: state.teacherQualifications.map(qual =>
              qual.id === id ? response.data : qual
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update teacher qualification' });
          throw error;
        }
      },

      updateTeacherExperience: async (id: number, data: Partial<TeacherExperience>) => {
        try {
          const response = await api.patch(`/teachers/experiences/${id}/`, data);
          set((state) => ({
            teacherExperiences: state.teacherExperiences.map(exp =>
              exp.id === id ? response.data : exp
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update teacher experience' });
          throw error;
        }
      },

      updateTeacherSubject: async (id: number, data: Partial<TeacherSubject>) => {
        try {
          const response = await api.patch(`/teachers/subjects/${id}/`, data);
          set((state) => ({
            teacherSubjects: state.teacherSubjects.map(subject =>
              subject.id === id ? response.data : subject
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update teacher subject' });
          throw error;
        }
      },

      updateTeacherClass: async (id: number, data: Partial<TeacherClass>) => {
        try {
          const response = await api.patch(`/teachers/classes/${id}/`, data);
          set((state) => ({
            teacherClasses: state.teacherClasses.map(cls =>
              cls.id === id ? response.data : cls
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update teacher class' });
          throw error;
        }
      },

      updateTeacherAttendance: async (id: number, data: Partial<TeacherAttendance>) => {
        try {
          const response = await api.patch(`/teachers/attendance/${id}/`, data);
          set((state) => ({
            teacherAttendance: state.teacherAttendance.map(att =>
              att.id === id ? response.data : att
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update teacher attendance' });
          throw error;
        }
      },

      updateTeacherSalary: async (id: number, data: Partial<TeacherSalary>) => {
        try {
          const response = await api.patch(`/teachers/salaries/${id}/`, data);
          set((state) => ({
            teacherSalaries: state.teacherSalaries.map(salary =>
              salary.id === id ? response.data : salary
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update teacher salary' });
          throw error;
        }
      },

      updateTeacherLeave: async (id: number, data: Partial<TeacherLeave>) => {
        try {
          const response = await api.patch(`/teachers/leaves/${id}/`, data);
          set((state) => ({
            teacherLeaves: state.teacherLeaves.map(leave =>
              leave.id === id ? response.data : leave
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update teacher leave' });
          throw error;
        }
      },

      updateTeacherPerformance: async (id: number, data: Partial<TeacherPerformance>) => {
        try {
          const response = await api.patch(`/teachers/performances/${id}/`, data);
          set((state) => ({
            teacherPerformances: state.teacherPerformances.map(perf =>
              perf.id === id ? response.data : perf
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update teacher performance' });
          throw error;
        }
      },

      updateTeacherDocument: async (id: number, data: Partial<TeacherDocument>) => {
        try {
          const response = await api.patch(`/teachers/documents/${id}/`, data);
          set((state) => ({
            teacherDocuments: state.teacherDocuments.map(doc =>
              doc.id === id ? response.data : doc
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update teacher document' });
          throw error;
        }
      },

      // Delete actions
      deleteTeacher: async (id: number) => {
        set({ loading: true, error: null });
        try {
          await api.delete(`/teachers/${id}/`);
          set((state) => ({
            teachers: state.teachers.filter(teacher => teacher.id !== id),
            selectedTeacher: state.selectedTeacher?.id === id ? null : state.selectedTeacher,
            loading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to delete teacher',
            loading: false,
          });
          throw error;
        }
      },

      deleteTeacherProfile: async (id: number) => {
        try {
          await api.delete(`/teachers/profiles/${id}/`);
          set((state) => ({
            teacherProfiles: state.teacherProfiles.filter(profile => profile.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete teacher profile' });
          throw error;
        }
      },

      deleteTeacherQualification: async (id: number) => {
        try {
          await api.delete(`/teachers/qualifications/${id}/`);
          set((state) => ({
            teacherQualifications: state.teacherQualifications.filter(qual => qual.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete teacher qualification' });
          throw error;
        }
      },

      deleteTeacherExperience: async (id: number) => {
        try {
          await api.delete(`/teachers/experiences/${id}/`);
          set((state) => ({
            teacherExperiences: state.teacherExperiences.filter(exp => exp.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete teacher experience' });
          throw error;
        }
      },

      deleteTeacherSubject: async (id: number) => {
        try {
          await api.delete(`/teachers/subjects/${id}/`);
          set((state) => ({
            teacherSubjects: state.teacherSubjects.filter(subject => subject.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete teacher subject' });
          throw error;
        }
      },

      deleteTeacherClass: async (id: number) => {
        try {
          await api.delete(`/teachers/classes/${id}/`);
          set((state) => ({
            teacherClasses: state.teacherClasses.filter(cls => cls.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete teacher class' });
          throw error;
        }
      },

      deleteTeacherAttendance: async (id: number) => {
        try {
          await api.delete(`/teachers/attendance/${id}/`);
          set((state) => ({
            teacherAttendance: state.teacherAttendance.filter(att => att.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete teacher attendance' });
          throw error;
        }
      },

      deleteTeacherSalary: async (id: number) => {
        try {
          await api.delete(`/teachers/salaries/${id}/`);
          set((state) => ({
            teacherSalaries: state.teacherSalaries.filter(salary => salary.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete teacher salary' });
          throw error;
        }
      },

      deleteTeacherLeave: async (id: number) => {
        try {
          await api.delete(`/teachers/leaves/${id}/`);
          set((state) => ({
            teacherLeaves: state.teacherLeaves.filter(leave => leave.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete teacher leave' });
          throw error;
        }
      },

      deleteTeacherPerformance: async (id: number) => {
        try {
          await api.delete(`/teachers/performances/${id}/`);
          set((state) => ({
            teacherPerformances: state.teacherPerformances.filter(perf => perf.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete teacher performance' });
          throw error;
        }
      },

      deleteTeacherDocument: async (id: number) => {
        try {
          await api.delete(`/teachers/documents/${id}/`);
          set((state) => ({
            teacherDocuments: state.teacherDocuments.filter(doc => doc.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete teacher document' });
          throw error;
        }
      },

      // Utility actions
      setSelectedTeacher: (teacher) => set({ selectedTeacher: teacher }),
      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
      setPagination: (pagination) => set((state) => ({ pagination: { ...state.pagination, ...pagination } })),
      clearError: () => set({ error: null }),
      reset: () => set(initialState),
    }),
    {
      name: 'teachers-store',
    }
  )
);
