/**
 * API Type Definitions
 */

// ===================
// Common Types
// ===================
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  code?: string | number
  status?: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface PaginationParams {
  page?: number
  page_size?: number
  ordering?: string
  search?: string
}

// ===================
// User & Authentication
// ===================
export interface User {
  id: number | string
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: UserRole
  permissions: string[]
  is_active: boolean
  is_verified: boolean
  is_staff: boolean
  is_superuser: boolean
  avatar?: string
  phone?: string
  date_joined: string
  last_login?: string
  created_at: string
  updated_at: string
}

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  STAFF = 'staff',
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginCredentials {
  email: string
  password: string
  remember_me?: boolean
}

export interface RegisterData {
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  role?: UserRole
}

// ===================
// Academic
// ===================
export interface Student {
  id: number | string
  user: User
  student_id: string
  grade: Grade
  section: Section
  admission_date: string
  date_of_birth: string
  gender: 'M' | 'F' | 'O'
  blood_group?: string
  address?: string
  emergency_contact?: string
  guardian: Guardian
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Teacher {
  id: number | string
  user: User
  employee_id: string
  subjects: Subject[]
  qualification: string
  experience_years: number
  joining_date: string
  salary?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Class {
  id: number | string
  name: string
  grade: Grade
  section: Section
  academic_year: AcademicYear
  class_teacher: Teacher
  students_count: number
  max_students: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Subject {
  id: number | string
  name: string
  code: string
  description?: string
  grade: Grade
  teacher: Teacher
  credits: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Grade {
  id: number | string
  name: string
  level: number
  description?: string
  created_at: string
  updated_at: string
}

export interface Section {
  id: number | string
  name: string
  capacity: number
  created_at: string
  updated_at: string
}

export interface AcademicYear {
  id: number | string
  name: string
  start_date: string
  end_date: string
  is_active: boolean
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface Guardian {
  id: number | string
  user: User
  relationship: 'father' | 'mother' | 'guardian'
  occupation?: string
  annual_income?: number
  students: Student[]
  created_at: string
  updated_at: string
}

// ===================
// Attendance
// ===================
export interface Attendance {
  id: number | string
  student: Student
  date: string
  status: AttendanceStatus
  marked_by: Teacher
  remarks?: string
  created_at: string
  updated_at: string
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
  HALF_DAY = 'half_day',
}

// ===================
// Exams & Grades
// ===================
export interface Exam {
  id: number | string
  name: string
  exam_type: ExamType
  academic_year: AcademicYear
  start_date: string
  end_date: string
  total_marks: number
  passing_marks: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export enum ExamType {
  MIDTERM = 'midterm',
  FINAL = 'final',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  PROJECT = 'project',
}

export interface ExamResult {
  id: number | string
  exam: Exam
  student: Student
  subject: Subject
  marks_obtained: number
  total_marks: number
  percentage: number
  grade: string
  rank?: number
  remarks?: string
  created_at: string
  updated_at: string
}

// ===================
// Assignments
// ===================
export interface Assignment {
  id: number | string
  title: string
  description: string
  subject: Subject
  class: Class
  teacher: Teacher
  due_date: string
  max_marks: number
  attachments?: string[]
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface AssignmentSubmission {
  id: number | string
  assignment: Assignment
  student: Student
  submitted_at: string
  file?: string
  content?: string
  marks_obtained?: number
  feedback?: string
  status: SubmissionStatus
  created_at: string
  updated_at: string
}

export enum SubmissionStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  LATE = 'late',
}

// ===================
// Events
// ===================
export interface Event {
  id: number | string
  title: string
  description: string
  event_type: EventType
  start_date: string
  end_date: string
  location?: string
  organizer: User
  participants_count: number
  max_participants?: number
  is_public: boolean
  is_cancelled: boolean
  created_at: string
  updated_at: string
}

export enum EventType {
  ACADEMIC = 'academic',
  SPORTS = 'sports',
  CULTURAL = 'cultural',
  HOLIDAY = 'holiday',
  MEETING = 'meeting',
  OTHER = 'other',
}

// ===================
// Notifications
// ===================
export interface Notification {
  id: number | string
  title: string
  message: string
  notification_type: NotificationType
  recipient: User
  is_read: boolean
  link?: string
  created_at: string
  read_at?: string
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  ANNOUNCEMENT = 'announcement',
}

// ===================
// Finance
// ===================
export interface FeeStructure {
  id: number | string
  name: string
  grade: Grade
  academic_year: AcademicYear
  amount: number
  due_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FeePayment {
  id: number | string
  student: Student
  fee_structure: FeeStructure
  amount_paid: number
  payment_date: string
  payment_method: PaymentMethod
  transaction_id?: string
  status: PaymentStatus
  created_at: string
  updated_at: string
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  ONLINE = 'online',
  CHEQUE = 'cheque',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

// ===================
// Library
// ===================
export interface Book {
  id: number | string
  title: string
  author: string
  isbn: string
  publisher?: string
  publication_year?: number
  quantity: number
  available_quantity: number
  category: string
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface BookIssue {
  id: number | string
  book: Book
  issued_to: User
  issued_by: User
  issue_date: string
  due_date: string
  return_date?: string
  fine_amount?: number
  status: IssueStatus
  created_at: string
  updated_at: string
}

export enum IssueStatus {
  ISSUED = 'issued',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost',
}

// ===================
// Statistics
// ===================
export interface DashboardStats {
  total_students: number
  total_teachers: number
  total_classes: number
  attendance_rate: number
  upcoming_events: number
  pending_assignments: number
  recent_activities: Activity[]
}

export interface Activity {
  id: number | string
  type: string
  description: string
  user: User
  timestamp: string
}

export interface AttendanceStats {
  present: number
  absent: number
  late: number
  excused: number
  total: number
  percentage: number
}

export interface ExamStats {
  average_marks: number
  highest_marks: number
  lowest_marks: number
  pass_percentage: number
  total_students: number
}

// ===================
// Upload
// ===================
export interface UploadResponse {
  id: number | string
  file_url: string
  file_name: string
  file_size: number
  file_type: string
  uploaded_at: string
}

// ===================
// Settings
// ===================
export interface SchoolSettings {
  id: number | string
  school_name: string
  school_logo?: string
  address: string
  phone: string
  email: string
  website?: string
  established_year?: number
  principal_name?: string
  academic_year: AcademicYear
  timezone: string
  currency: string
  created_at: string
  updated_at: string
}

export default {
  // Export all types
}
