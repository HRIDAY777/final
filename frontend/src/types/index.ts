// Import RBAC types
import { AdminAssignment } from './rbac';

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  user_type: 'student' | 'teacher' | 'admin' | 'parent' | 'super_admin' | 'institute_admin' | 'staff';
  is_active: boolean;
  mfa_enabled: boolean;
  last_login_ip?: string;
  date_joined: string;
  profile?: UserProfile;
  full_name?: string;
  // RBAC-related properties
  admin_level?: 'none' | 'basic' | 'intermediate' | 'advanced' | 'super_admin';
  admin_assignments?: AdminAssignment[];
  admin_institutes?: string[];
  departments?: string[];
  classes?: string[];
  subjects?: string[];
}

export interface UserProfile {
  id: string;
  user: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  blood_group?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  social_media_links?: Record<string, string>;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  user_type: 'student' | 'teacher' | 'admin' | 'parent';
}

// Academic Types
export interface Class {
  id: string;
  name: string;
  section: string;
  academic_year: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  current_student_count?: number;
  is_full?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  user: User;
  teacher_id: string;
  department: string;
  qualification: string;
  experience_years: number;
  specialization: string;
  joining_date: string;
  salary: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  user: User;
  student_id: string;
  class_enrolled: Class;
  roll_number: string;
  admission_date: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  address: string;
  emergency_contact: string;
  blood_group: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  subject: Subject;
  class_enrolled: Class;
  teacher: Teacher;
  name: string;
  description: string;
  academic_year: string;
  semester: string;
  credits: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  current_student_count?: number;
}

export interface Lesson {
  id: string;
  course: Course;
  title: string;
  content: string;
  lesson_type: string;
  duration_minutes: number;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  course: Course;
  title: string;
  description: string;
  due_date: string;
  max_marks: number;
  assignment_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_overdue?: boolean;
}

export interface AssignmentSubmission {
  id: string;
  assignment: Assignment;
  student: Student;
  submitted_at: string;
  submission_file?: string;
  comments: string;
  marks_obtained?: number;
  graded_by?: Teacher;
  graded_at?: string;
  feedback?: string;
  created_at: string;
  updated_at: string;
  percentage?: number;
}

export interface Grade {
  id: string;
  student: Student;
  course: Course;
  assignment?: Assignment;
  marks_obtained: number;
  max_marks: number;
  percentage: number;
  grade: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

// Attendance Types
export interface AttendanceSession {
  id: string;
  course: Course;
  date: string;
  start_time: string;
  end_time: string;
  session_type: string;
  is_active: boolean;
  created_by: Teacher;
  created_at: string;
  updated_at: string;
  duration_minutes?: number;
  total_students?: number;
  present_count?: number;
  absent_count?: number;
  late_count?: number;
  attendance_percentage?: number;
}

export interface AttendanceRecord {
  id: string;
  session: AttendanceSession;
  student: Student;
  status: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
  arrival_time?: string;
  departure_time?: string;
  remarks: string;
  marked_by: Teacher;
  marked_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  student: Student;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: Teacher;
  approved_at?: string;
  comments?: string;
  created_at: string;
  updated_at: string;
  duration_days?: number;
}

export interface AttendanceReport {
  id: string;
  student: Student;
  month: number;
  year: number;
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  attendance_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface AttendanceSettings {
  id: string;
  class_enrolled: Class;
  late_threshold_minutes: number;
  absent_threshold_minutes: number;
  auto_mark_absent: boolean;
  send_notifications: boolean;
  created_at: string;
  updated_at: string;
}

// Exam Types
export interface Exam {
  id: string;
  title: string;
  description: string;
  exam_type: string;
  subject: Subject;
  course: Course;
  total_marks: number;
  duration_minutes: number;
  passing_marks: number;
  is_active: boolean;
  allow_retake: boolean;
  max_attempts: number;
  instructions: string;
  created_by: Teacher;
  created_at: string;
  updated_at: string;
  total_questions?: number;
  is_scheduled?: boolean;
}

export interface ExamSchedule {
  id: string;
  exam: Exam;
  start_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  room_number: string;
  invigilator?: Teacher;
  is_online: boolean;
  online_platform: string;
  meeting_link: string;
  created_at: string;
  updated_at: string;
  duration_minutes?: number;
  is_upcoming?: boolean;
  is_ongoing?: boolean;
  is_completed?: boolean;
}

export interface Question {
  id: string;
  exam: Exam;
  question_text: string;
  question_type: string;
  difficulty: string;
  marks: number;
  order: number;
  is_required: boolean;
  has_negative_marking: boolean;
  negative_marks: number;
  explanation: string;
  created_at: string;
  updated_at: string;
  correct_answers?: Answer[];
  total_answers?: number;
}

export interface Answer {
  id: string;
  question: Question;
  answer_text: string;
  is_correct: boolean;
  order: number;
  explanation: string;
  created_at: string;
}

export interface ExamResult {
  id: string;
  exam: Exam;
  student: Student;
  marks_obtained: number;
  percentage: number;
  grade: string;
  is_passed: boolean;
  attempt_number: number;
  start_time: string;
  end_time: string;
  duration_taken_minutes: number;
  is_submitted: boolean;
  submitted_at?: string;
  graded_by?: Teacher;
  graded_at?: string;
  remarks: string;
  created_at: string;
  updated_at: string;
}

export interface StudentAnswer {
  id: string;
  exam_result: ExamResult;
  question: Question;
  selected_answers: Answer[];
  text_answer: string;
  numerical_answer?: number;
  is_correct: boolean;
  marks_obtained: number;
  time_taken_seconds: number;
  answered_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  course: Course;
  total_questions: number;
  time_limit_minutes: number;
  passing_score: number;
  is_randomized: boolean;
  show_results_immediately: boolean;
  allow_review: boolean;
  is_active: boolean;
  created_by: Teacher;
  created_at: string;
  updated_at: string;
}

export interface ExamSettings {
  id: string;
  class_enrolled: Class;
  default_exam_duration: number;
  default_passing_percentage: number;
  allow_exam_retakes: boolean;
  max_retake_attempts: number;
  auto_grade_objective_questions: boolean;
  require_teacher_approval: boolean;
  send_result_notifications: boolean;
  created_at: string;
  updated_at: string;
}

// Tenant Types
export interface Tenant {
  id: string;
  name: string;
  schema_name: string;
  paid_until: string;
  on_trial: boolean;
  created_at: string;
  updated_at: string;
}

export interface Domain {
  id: string;
  domain: string;
  is_primary: boolean;
  tenant: Tenant;
}

export interface TenantSettings {
  id: string;
  tenant: Tenant;
  theme_color: string;
  logo_url: string;
  school_name: string;
  school_address: string;
  contact_email: string;
  contact_phone: string;
  academic_year: string;
  semester_system: boolean;
  max_students_per_class: number;
  max_teachers_per_subject: number;
  attendance_required: boolean;
  exam_required: boolean;
  library_enabled: boolean;
  billing_enabled: boolean;
  ai_features_enabled: boolean;
  notification_email: boolean;
  notification_sms: boolean;
  notification_push: boolean;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// Dashboard Types
export interface DashboardStats {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  total_courses: number;
  average_attendance: number;
  average_performance: number;
  upcoming_exams: number;
  pending_assignments: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

// Notification Types
export interface Notification {
  id: string;
  user: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  data?: Record<string, any>;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'notification' | 'chat' | 'system';
  message: string;
  notification_type?: string;
  data?: Record<string, any>;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'time' | 'checkbox' | 'radio';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormConfig {
  fields: FormField[];
  submitLabel: string;
  cancelLabel?: string;
}

// Filter Types
export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  field: string;
  label: string;
  type: 'select' | 'date' | 'text' | 'number';
  options?: FilterOption[];
  placeholder?: string;
}

// Table Types
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, record: any) => React.ReactNode;
  width?: string;
}

export interface TableConfig {
  columns: TableColumn[];
  pageSize: number;
  sortable?: boolean;
  selectable?: boolean;
  actions?: {
    label: string;
    action: string;
    icon?: string;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
}

// Search Types
export interface SearchConfig {
  placeholder: string;
  fields: string[];
  debounce?: number;
}

// Intentionally omit re-export block to avoid duplicate export conflicts
