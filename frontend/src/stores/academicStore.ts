/* eslint-disable no-unused-vars */
import { create } from 'zustand';
import { 
  Class, Subject, Teacher, Student, Course, Lesson, Assignment, 
  AssignmentSubmission, Grade, PaginatedResponse 
} from '../types';
import { academicAPI, handleApiError } from '../services/api';

interface AcademicState {
  // Classes
  classes: PaginatedResponse<Class> | null;
  currentClass: Class | null;
  classesLoading: boolean;
  classesError: string | null;

  // Subjects
  subjects: PaginatedResponse<Subject> | null;
  currentSubject: Subject | null;
  subjectsLoading: boolean;
  subjectsError: string | null;

  // Teachers
  teachers: PaginatedResponse<Teacher> | null;
  currentTeacher: Teacher | null;
  teachersLoading: boolean;
  teachersError: string | null;

  // Students
  students: PaginatedResponse<Student> | null;
  currentStudent: Student | null;
  studentsLoading: boolean;
  studentsError: string | null;

  // Courses
  courses: PaginatedResponse<Course> | null;
  currentCourse: Course | null;
  coursesLoading: boolean;
  coursesError: string | null;

  // Lessons
  lessons: PaginatedResponse<Lesson> | null;
  currentLesson: Lesson | null;
  lessonsLoading: boolean;
  lessonsError: string | null;

  // Assignments
  assignments: PaginatedResponse<Assignment> | null;
  currentAssignment: Assignment | null;
  assignmentsLoading: boolean;
  assignmentsError: string | null;

  // Submissions
  submissions: PaginatedResponse<AssignmentSubmission> | null;
  currentSubmission: AssignmentSubmission | null;
  submissionsLoading: boolean;
  submissionsError: string | null;

  // Grades
  grades: PaginatedResponse<Grade> | null;
  currentGrade: Grade | null;
  gradesLoading: boolean;
  gradesError: string | null;

  // Actions
  // Classes
  fetchClasses: (params?: any) => Promise<void>;
  fetchClass: (id: string) => Promise<void>;
  createClass: (data: any) => Promise<boolean>;
  updateClass: (id: string, data: any) => Promise<boolean>;
  deleteClass: (id: string) => Promise<boolean>;
  getClassStudents: (id: string) => Promise<Student[]>;
  getClassPerformance: (id: string) => Promise<any>;

  // Subjects
  fetchSubjects: (params?: any) => Promise<void>;
  fetchSubject: (id: string) => Promise<void>;
  createSubject: (data: any) => Promise<boolean>;
  updateSubject: (id: string, data: any) => Promise<boolean>;
  deleteSubject: (id: string) => Promise<boolean>;

  // Teachers
  fetchTeachers: (params?: any) => Promise<void>;
  fetchTeacher: (id: string) => Promise<void>;
  createTeacher: (data: any) => Promise<boolean>;
  updateTeacher: (id: string, data: any) => Promise<boolean>;
  deleteTeacher: (id: string) => Promise<boolean>;
  getTeacherCourses: (id: string) => Promise<Course[]>;
  getTeacherPerformance: (id: string) => Promise<any>;

  // Students
  fetchStudents: (params?: any) => Promise<void>;
  fetchStudent: (id: string) => Promise<void>;
  createStudent: (data: any) => Promise<boolean>;
  updateStudent: (id: string, data: any) => Promise<boolean>;
  deleteStudent: (id: string) => Promise<boolean>;
  getStudentGrades: (id: string) => Promise<Grade[]>;
  getStudentPerformance: (id: string) => Promise<any>;

  // Courses
  fetchCourses: (params?: any) => Promise<void>;
  fetchCourse: (id: string) => Promise<void>;
  createCourse: (data: any) => Promise<boolean>;
  updateCourse: (id: string, data: any) => Promise<boolean>;
  deleteCourse: (id: string) => Promise<boolean>;
  getCourseLessons: (id: string) => Promise<Lesson[]>;
  getCourseAssignments: (id: string) => Promise<Assignment[]>;

  // Lessons
  fetchLessons: (params?: any) => Promise<void>;
  fetchLesson: (id: string) => Promise<void>;
  createLesson: (data: any) => Promise<boolean>;
  updateLesson: (id: string, data: any) => Promise<boolean>;
  deleteLesson: (id: string) => Promise<boolean>;

  // Assignments
  fetchAssignments: (params?: any) => Promise<void>;
  fetchAssignment: (id: string) => Promise<void>;
  createAssignment: (data: any) => Promise<boolean>;
  updateAssignment: (id: string, data: any) => Promise<boolean>;
  deleteAssignment: (id: string) => Promise<boolean>;
  getAssignmentSubmissions: (id: string) => Promise<AssignmentSubmission[]>;

  // Submissions
  fetchSubmissions: (params?: any) => Promise<void>;
  fetchSubmission: (id: string) => Promise<void>;
  createSubmission: (data: any) => Promise<boolean>;
  updateSubmission: (id: string, data: any) => Promise<boolean>;
  deleteSubmission: (id: string) => Promise<boolean>;

  // Grades
  fetchGrades: (params?: any) => Promise<void>;
  fetchGrade: (id: string) => Promise<void>;
  createGrade: (data: any) => Promise<boolean>;
  updateGrade: (id: string, data: any) => Promise<boolean>;
  deleteGrade: (id: string) => Promise<boolean>;

  // Utility
  clearError: (section: string) => void;
  setLoading: (section: string, loading: boolean) => void;
}

export const useAcademicStore = create<AcademicState>((set, get) => ({
  // Initial state
  classes: null,
  currentClass: null,
  classesLoading: false,
  classesError: null,

  subjects: null,
  currentSubject: null,
  subjectsLoading: false,
  subjectsError: null,

  teachers: null,
  currentTeacher: null,
  teachersLoading: false,
  teachersError: null,

  students: null,
  currentStudent: null,
  studentsLoading: false,
  studentsError: null,

  courses: null,
  currentCourse: null,
  coursesLoading: false,
  coursesError: null,

  lessons: null,
  currentLesson: null,
  lessonsLoading: false,
  lessonsError: null,

  assignments: null,
  currentAssignment: null,
  assignmentsLoading: false,
  assignmentsError: null,

  submissions: null,
  currentSubmission: null,
  submissionsLoading: false,
  submissionsError: null,

  grades: null,
  currentGrade: null,
  gradesLoading: false,
  gradesError: null,

  // Classes actions
  fetchClasses: async (params?: any) => { // eslint-disable-line no-unused-vars
    set({ classesLoading: true, classesError: null });
    try {
      const classes = await academicAPI.getClasses(params) as PaginatedResponse<Class>;
      set({ classes, classesLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ classesError: errorResponse.message, classesLoading: false });
    }
  },

  fetchClass: async (id: string) => {
    set({ classesLoading: true, classesError: null });
    try {
      const currentClass = await academicAPI.getClass(id) as Class;
      set({ currentClass, classesLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ classesError: errorResponse.message, classesLoading: false });
    }
  },

  createClass: async (data: any) => {
    set({ classesLoading: true, classesError: null });
    try {
      await academicAPI.createClass(data);
      await get().fetchClasses();
      set({ classesLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ classesError: errorResponse.message, classesLoading: false });
      return false;
    }
  },

  updateClass: async (id: string, data: any) => {
    set({ classesLoading: true, classesError: null });
    try {
      await academicAPI.updateClass(id, data);
      await get().fetchClasses();
      set({ classesLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ classesError: errorResponse.message, classesLoading: false });
      return false;
    }
  },

  deleteClass: async (id: string) => {
    set({ classesLoading: true, classesError: null });
    try {
      await academicAPI.deleteClass(id);
      await get().fetchClasses();
      set({ classesLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ classesError: errorResponse.message, classesLoading: false });
      return false;
    }
  },

  getClassStudents: async (id: string) => {
    try {
      return await academicAPI.getClassStudents(id) as Student[];
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ classesError: errorResponse.message });
      return [];
    }
  },

  getClassPerformance: async (id: string) => {
    try {
      return await academicAPI.getClassPerformance(id);
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ classesError: errorResponse.message });
      return null;
    }
  },

  // Subjects actions
  fetchSubjects: async (params?: any) => {
    set({ subjectsLoading: true, subjectsError: null });
    try {
      const subjects = await academicAPI.getSubjects(params) as PaginatedResponse<Subject>;
      set({ subjects, subjectsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ subjectsError: errorResponse.message, subjectsLoading: false });
    }
  },

  fetchSubject: async (id: string) => {
    set({ subjectsLoading: true, subjectsError: null });
    try {
      const currentSubject = await academicAPI.getSubject(id) as Subject;
      set({ currentSubject, subjectsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ subjectsError: errorResponse.message, subjectsLoading: false });
    }
  },

  createSubject: async (data: any) => {
    set({ subjectsLoading: true, subjectsError: null });
    try {
      await academicAPI.createSubject(data);
      await get().fetchSubjects();
      set({ subjectsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ subjectsError: errorResponse.message, subjectsLoading: false });
      return false;
    }
  },

  updateSubject: async (id: string, data: any) => {
    set({ subjectsLoading: true, subjectsError: null });
    try {
      await academicAPI.updateSubject(id, data);
      await get().fetchSubjects();
      set({ subjectsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ subjectsError: errorResponse.message, subjectsLoading: false });
      return false;
    }
  },

  deleteSubject: async (id: string) => {
    set({ subjectsLoading: true, subjectsError: null });
    try {
      await academicAPI.deleteSubject(id);
      await get().fetchSubjects();
      set({ subjectsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ subjectsError: errorResponse.message, subjectsLoading: false });
      return false;
    }
  },

  // Teachers actions
  fetchTeachers: async (params?: any) => {
    set({ teachersLoading: true, teachersError: null });
    try {
      const teachers = await academicAPI.getTeachers(params) as PaginatedResponse<Teacher>;
      set({ teachers, teachersLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ teachersError: errorResponse.message, teachersLoading: false });
    }
  },

  fetchTeacher: async (id: string) => {
    set({ teachersLoading: true, teachersError: null });
    try {
      const currentTeacher = await academicAPI.getTeacher(id) as Teacher;
      set({ currentTeacher, teachersLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ teachersError: errorResponse.message, teachersLoading: false });
    }
  },

  createTeacher: async (data: any) => {
    set({ teachersLoading: true, teachersError: null });
    try {
      await academicAPI.createTeacher(data);
      await get().fetchTeachers();
      set({ teachersLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ teachersError: errorResponse.message, teachersLoading: false });
      return false;
    }
  },

  updateTeacher: async (id: string, data: any) => {
    set({ teachersLoading: true, teachersError: null });
    try {
      await academicAPI.updateTeacher(id, data);
      await get().fetchTeachers();
      set({ teachersLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ teachersError: errorResponse.message, teachersLoading: false });
      return false;
    }
  },

  deleteTeacher: async (id: string) => {
    set({ teachersLoading: true, teachersError: null });
    try {
      await academicAPI.deleteTeacher(id);
      await get().fetchTeachers();
      set({ teachersLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ teachersError: errorResponse.message, teachersLoading: false });
      return false;
    }
  },

  getTeacherCourses: async (id: string) => {
    try {
      return await academicAPI.getTeacherCourses(id) as Course[];
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ teachersError: errorResponse.message });
      return [];
    }
  },

  getTeacherPerformance: async (id: string) => {
    try {
      return await academicAPI.getTeacherPerformance(id);
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ teachersError: errorResponse.message });
      return null;
    }
  },

  // Students actions
  fetchStudents: async (params?: any) => {
    set({ studentsLoading: true, studentsError: null });
    try {
      const students = await academicAPI.getStudents(params) as PaginatedResponse<Student>;
      set({ students, studentsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ studentsError: errorResponse.message, studentsLoading: false });
    }
  },

  fetchStudent: async (id: string) => {
    set({ studentsLoading: true, studentsError: null });
    try {
      const currentStudent = await academicAPI.getStudent(id) as Student;
      set({ currentStudent, studentsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ studentsError: errorResponse.message, studentsLoading: false });
    }
  },

  createStudent: async (data: any) => {
    set({ studentsLoading: true, studentsError: null });
    try {
      await academicAPI.createStudent(data);
      await get().fetchStudents();
      set({ studentsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ studentsError: errorResponse.message, studentsLoading: false });
      return false;
    }
  },

  updateStudent: async (id: string, data: any) => {
    set({ studentsLoading: true, studentsError: null });
    try {
      await academicAPI.updateStudent(id, data);
      await get().fetchStudents();
      set({ studentsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ studentsError: errorResponse.message, studentsLoading: false });
      return false;
    }
  },

  deleteStudent: async (id: string) => {
    set({ studentsLoading: true, studentsError: null });
    try {
      await academicAPI.deleteStudent(id);
      await get().fetchStudents();
      set({ studentsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ studentsError: errorResponse.message, studentsLoading: false });
      return false;
    }
  },

  getStudentGrades: async (id: string) => {
    try {
      return await academicAPI.getStudentGrades(id) as Grade[];
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ studentsError: errorResponse.message });
      return [];
    }
  },

  getStudentPerformance: async (id: string) => {
    try {
      return await academicAPI.getStudentPerformance(id);
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ studentsError: errorResponse.message });
      return null;
    }
  },

  // Courses actions
  fetchCourses: async (params?: any) => {
    set({ coursesLoading: true, coursesError: null });
    try {
      const courses = await academicAPI.getCourses(params) as PaginatedResponse<Course>;
      set({ courses, coursesLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ coursesError: errorResponse.message, coursesLoading: false });
    }
  },

  fetchCourse: async (id: string) => {
    set({ coursesLoading: true, coursesError: null });
    try {
      const currentCourse = await academicAPI.getCourse(id) as Course;
      set({ currentCourse, coursesLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ coursesError: errorResponse.message, coursesLoading: false });
    }
  },

  createCourse: async (data: any) => {
    set({ coursesLoading: true, coursesError: null });
    try {
      await academicAPI.createCourse(data);
      await get().fetchCourses();
      set({ coursesLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ coursesError: errorResponse.message, coursesLoading: false });
      return false;
    }
  },

  updateCourse: async (id: string, data: any) => {
    set({ coursesLoading: true, coursesError: null });
    try {
      await academicAPI.updateCourse(id, data);
      await get().fetchCourses();
      set({ coursesLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ coursesError: errorResponse.message, coursesLoading: false });
      return false;
    }
  },

  deleteCourse: async (id: string) => {
    set({ coursesLoading: true, coursesError: null });
    try {
      await academicAPI.deleteCourse(id);
      await get().fetchCourses();
      set({ coursesLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ coursesError: errorResponse.message, coursesLoading: false });
      return false;
    }
  },

  getCourseLessons: async (id: string) => {
    try {
      return await academicAPI.getCourseLessons(id) as Lesson[];
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ coursesError: errorResponse.message });
      return [];
    }
  },

  getCourseAssignments: async (id: string) => {
    try {
      return await academicAPI.getCourseAssignments(id) as Assignment[];
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ coursesError: errorResponse.message });
      return [];
    }
  },

  // Lessons actions
  fetchLessons: async (params?: any) => {
    set({ lessonsLoading: true, lessonsError: null });
    try {
      const lessons = await academicAPI.getLessons(params) as PaginatedResponse<Lesson>;
      set({ lessons, lessonsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ lessonsError: errorResponse.message, lessonsLoading: false });
    }
  },

  fetchLesson: async (id: string) => {
    set({ lessonsLoading: true, lessonsError: null });
    try {
      const currentLesson = await academicAPI.getLesson(id) as Lesson;
      set({ currentLesson, lessonsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ lessonsError: errorResponse.message, lessonsLoading: false });
    }
  },

  createLesson: async (data: any) => {
    set({ lessonsLoading: true, lessonsError: null });
    try {
      await academicAPI.createLesson(data);
      await get().fetchLessons();
      set({ lessonsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ lessonsError: errorResponse.message, lessonsLoading: false });
      return false;
    }
  },

  updateLesson: async (id: string, data: any) => {
    set({ lessonsLoading: true, lessonsError: null });
    try {
      await academicAPI.updateLesson(id, data);
      await get().fetchLessons();
      set({ lessonsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ lessonsError: errorResponse.message, lessonsLoading: false });
      return false;
    }
  },

  deleteLesson: async (id: string) => {
    set({ lessonsLoading: true, lessonsError: null });
    try {
      await academicAPI.deleteLesson(id);
      await get().fetchLessons();
      set({ lessonsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ lessonsError: errorResponse.message, lessonsLoading: false });
      return false;
    }
  },

  // Assignments actions
  fetchAssignments: async (params?: any) => {
    set({ assignmentsLoading: true, assignmentsError: null });
    try {
      const assignments = await academicAPI.getAssignments(params) as PaginatedResponse<Assignment>;
      set({ assignments, assignmentsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ assignmentsError: errorResponse.message, assignmentsLoading: false });
    }
  },

  fetchAssignment: async (id: string) => {
    set({ assignmentsLoading: true, assignmentsError: null });
    try {
      const currentAssignment = await academicAPI.getAssignment(id) as Assignment;
      set({ currentAssignment, assignmentsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ assignmentsError: errorResponse.message, assignmentsLoading: false });
    }
  },

  createAssignment: async (data: any) => {
    set({ assignmentsLoading: true, assignmentsError: null });
    try {
      await academicAPI.createAssignment(data);
      await get().fetchAssignments();
      set({ assignmentsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ assignmentsError: errorResponse.message, assignmentsLoading: false });
      return false;
    }
  },

  updateAssignment: async (id: string, data: any) => {
    set({ assignmentsLoading: true, assignmentsError: null });
    try {
      await academicAPI.updateAssignment(id, data);
      await get().fetchAssignments();
      set({ assignmentsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ assignmentsError: errorResponse.message, assignmentsLoading: false });
      return false;
    }
  },

  deleteAssignment: async (id: string) => {
    set({ assignmentsLoading: true, assignmentsError: null });
    try {
      await academicAPI.deleteAssignment(id);
      await get().fetchAssignments();
      set({ assignmentsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ assignmentsError: errorResponse.message, assignmentsLoading: false });
      return false;
    }
  },

  getAssignmentSubmissions: async (id: string) => {
    try {
      return await academicAPI.getAssignmentSubmissions(id) as AssignmentSubmission[];
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ assignmentsError: errorResponse.message });
      return [];
    }
  },

  // Submissions actions
  fetchSubmissions: async (params?: any) => {
    set({ submissionsLoading: true, submissionsError: null });
    try {
      const submissions = await academicAPI.getSubmissions(params) as PaginatedResponse<AssignmentSubmission>;
      set({ submissions, submissionsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ submissionsError: errorResponse.message, submissionsLoading: false });
    }
  },

  fetchSubmission: async (id: string) => {
    set({ submissionsLoading: true, submissionsError: null });
    try {
      const currentSubmission = await academicAPI.getSubmission(id) as AssignmentSubmission;
      set({ currentSubmission, submissionsLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ submissionsError: errorResponse.message, submissionsLoading: false });
    }
  },

  createSubmission: async (data: any) => {
    set({ submissionsLoading: true, submissionsError: null });
    try {
      await academicAPI.createSubmission(data);
      await get().fetchSubmissions();
      set({ submissionsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ submissionsError: errorResponse.message, submissionsLoading: false });
      return false;
    }
  },

  updateSubmission: async (id: string, data: any) => {
    set({ submissionsLoading: true, submissionsError: null });
    try {
      await academicAPI.updateSubmission(id, data);
      await get().fetchSubmissions();
      set({ submissionsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ submissionsError: errorResponse.message, submissionsLoading: false });
      return false;
    }
  },

  deleteSubmission: async (id: string) => {
    set({ submissionsLoading: true, submissionsError: null });
    try {
      await academicAPI.deleteSubmission(id);
      await get().fetchSubmissions();
      set({ submissionsLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ submissionsError: errorResponse.message, submissionsLoading: false });
      return false;
    }
  },

  // Grades actions
  fetchGrades: async (params?: any) => {
    set({ gradesLoading: true, gradesError: null });
    try {
      const grades = await academicAPI.getGrades(params) as PaginatedResponse<Grade>;
      set({ grades, gradesLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ gradesError: errorResponse.message, gradesLoading: false });
    }
  },

  fetchGrade: async (id: string) => {
    set({ gradesLoading: true, gradesError: null });
    try {
      const currentGrade = await academicAPI.getGrade(id) as Grade;
      set({ currentGrade, gradesLoading: false });
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ gradesError: errorResponse.message, gradesLoading: false });
    }
  },

  createGrade: async (data: any) => {
    set({ gradesLoading: true, gradesError: null });
    try {
      await academicAPI.createGrade(data);
      await get().fetchGrades();
      set({ gradesLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ gradesError: errorResponse.message, gradesLoading: false });
      return false;
    }
  },

  updateGrade: async (id: string, data: any) => {
    set({ gradesLoading: true, gradesError: null });
    try {
      await academicAPI.updateGrade(id, data);
      await get().fetchGrades();
      set({ gradesLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ gradesError: errorResponse.message, gradesLoading: false });
      return false;
    }
  },

  deleteGrade: async (id: string) => {
    set({ gradesLoading: true, gradesError: null });
    try {
      await academicAPI.deleteGrade(id);
      await get().fetchGrades();
      set({ gradesLoading: false });
      return true;
    } catch (error) {
      const errorResponse = handleApiError(error);
      set({ gradesError: errorResponse.message, gradesLoading: false });
      return false;
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
export const useClasses = () => useAcademicStore((state) => ({
  classes: state.classes,
  currentClass: state.currentClass,
  loading: state.classesLoading,
  error: state.classesError,
  fetchClasses: state.fetchClasses,
  fetchClass: state.fetchClass,
  createClass: state.createClass,
  updateClass: state.updateClass,
  deleteClass: state.deleteClass,
}));

export const useSubjects = () => useAcademicStore((state) => ({
  subjects: state.subjects,
  currentSubject: state.currentSubject,
  loading: state.subjectsLoading,
  error: state.subjectsError,
  fetchSubjects: state.fetchSubjects,
  fetchSubject: state.fetchSubject,
  createSubject: state.createSubject,
  updateSubject: state.updateSubject,
  deleteSubject: state.deleteSubject,
}));

export const useTeachers = () => useAcademicStore((state) => ({
  teachers: state.teachers,
  currentTeacher: state.currentTeacher,
  loading: state.teachersLoading,
  error: state.teachersError,
  fetchTeachers: state.fetchTeachers,
  fetchTeacher: state.fetchTeacher,
  createTeacher: state.createTeacher,
  updateTeacher: state.updateTeacher,
  deleteTeacher: state.deleteTeacher,
}));

export const useStudents = () => useAcademicStore((state) => ({
  students: state.students,
  currentStudent: state.currentStudent,
  loading: state.studentsLoading,
  error: state.studentsError,
  fetchStudents: state.fetchStudents,
  fetchStudent: state.fetchStudent,
  createStudent: state.createStudent,
  updateStudent: state.updateStudent,
  deleteStudent: state.deleteStudent,
}));

export const useCourses = () => useAcademicStore((state) => ({
  courses: state.courses,
  currentCourse: state.currentCourse,
  loading: state.coursesLoading,
  error: state.coursesError,
  fetchCourses: state.fetchCourses,
  fetchCourse: state.fetchCourse,
  createCourse: state.createCourse,
  updateCourse: state.updateCourse,
  deleteCourse: state.deleteCourse,
}));

export const useLessons = () => useAcademicStore((state) => ({
  lessons: state.lessons,
  currentLesson: state.currentLesson,
  loading: state.lessonsLoading,
  error: state.lessonsError,
  fetchLessons: state.fetchLessons,
  fetchLesson: state.fetchLesson,
  createLesson: state.createLesson,
  updateLesson: state.updateLesson,
  deleteLesson: state.deleteLesson,
}));

export const useAssignments = () => useAcademicStore((state) => ({
  assignments: state.assignments,
  currentAssignment: state.currentAssignment,
  loading: state.assignmentsLoading,
  error: state.assignmentsError,
  fetchAssignments: state.fetchAssignments,
  fetchAssignment: state.fetchAssignment,
  createAssignment: state.createAssignment,
  updateAssignment: state.updateAssignment,
  deleteAssignment: state.deleteAssignment,
}));

export const useSubmissions = () => useAcademicStore((state) => ({
  submissions: state.submissions,
  currentSubmission: state.currentSubmission,
  loading: state.submissionsLoading,
  error: state.submissionsError,
  fetchSubmissions: state.fetchSubmissions,
  fetchSubmission: state.fetchSubmission,
  createSubmission: state.createSubmission,
  updateSubmission: state.updateSubmission,
  deleteSubmission: state.deleteSubmission,
}));

export const useGrades = () => useAcademicStore((state) => ({
  grades: state.grades,
  currentGrade: state.currentGrade,
  loading: state.gradesLoading,
  error: state.gradesError,
  fetchGrades: state.fetchGrades,
  fetchGrade: state.fetchGrade,
  createGrade: state.createGrade,
  updateGrade: state.updateGrade,
  deleteGrade: state.deleteGrade,
}));
