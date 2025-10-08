// =============================================================================
// REPORTS SYSTEM - ADVANCED TYPE DEFINITIONS
// =============================================================================

// Base interfaces for all report types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface BaseReport extends BaseEntity {
  name: string;
  description: string;
  status: ReportStatus;
  is_active: boolean;
  metadata?: Record<string, any>;
}

// Report Status Enum
export enum ReportStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Report Type Enum
export enum ReportType {
  ACADEMIC = 'academic',
  ATTENDANCE = 'attendance',
  FINANCIAL = 'financial',
  PERFORMANCE = 'performance',
  ANALYTICS = 'analytics',
  CUSTOM = 'custom'
}

// Report Format Enum
export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
  XML = 'xml',
  HTML = 'html'
}

// Report Frequency Enum
export enum ReportFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

// Report Template Interface
export interface ReportTemplate extends BaseReport {
  report_type: ReportType;
  format: ReportFormat;
  is_public: boolean;
  is_default: boolean;
  version: string;
  schema: ReportSchema;
  parameters: ReportParameter[];
  permissions: ReportPermission[];
  usage_count: number;
  last_used?: string;
}

// Report Schema Interface
export interface ReportSchema {
  fields: ReportField[];
  filters: ReportFilter[];
  aggregations: ReportAggregation[];
  sorting: ReportSort[];
  grouping: ReportGroup[];
}

// Report Field Interface
export interface ReportField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  required: boolean;
  default_value?: any;
  validation?: FieldValidation;
  display_options?: DisplayOptions;
}

// Field Validation Interface
export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
  custom?: (value: any) => boolean;
}

// Display Options Interface
export interface DisplayOptions {
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: string;
  visible?: boolean;
  sortable?: boolean;
  filterable?: boolean;
}

// Report Filter Interface
export interface ReportFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'like' | 'regex';
  value: any;
  label: string;
}

// Report Aggregation Interface
export interface ReportAggregation {
  field: string;
  function: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct';
  label: string;
}

// Report Sort Interface
export interface ReportSort {
  field: string;
  direction: 'asc' | 'desc';
}

// Report Group Interface
export interface ReportGroup {
  field: string;
  label: string;
  collapsed?: boolean;
}

// Report Parameter Interface
export interface ReportParameter {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  default_value?: any;
  options?: ParameterOption[];
  validation?: ParameterValidation;
}

// Parameter Option Interface
export interface ParameterOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Parameter Validation Interface
export interface ParameterValidation {
  min?: number;
  max?: number;
  pattern?: string;
  custom?: (value: any) => boolean;
}

// Report Permission Interface
export interface ReportPermission {
  role: string;
  permissions: ('read' | 'write' | 'delete' | 'share' | 'schedule')[];
}

// Generated Report Interface
export interface GeneratedReport extends BaseReport {
  template_id: string;
  template: ReportTemplate;
  format: ReportFormat;
  file_size: number;
  file_url?: string;
  file_path?: string;
  progress: number;
  processing_time?: number;
  completed_at?: string;
  error_message?: string;
  parameters: Record<string, any>;
  recipients: ReportRecipient[];
  download_count: number;
  last_downloaded?: string;
}

// Scheduled Report Interface
export interface ScheduledReport extends BaseReport {
  template_id: string;
  template: ReportTemplate;
  frequency: ReportFrequency;
  schedule_config: ScheduleConfig;
  start_date: string;
  end_date?: string;
  last_run?: string;
  next_run?: string;
  run_count: number;
  success_count: number;
  failure_count: number;
  recipients: ReportRecipient[];
  is_paused: boolean;
  retry_count: number;
  max_retries: number;
}

// Schedule Config Interface
export interface ScheduleConfig {
  time: string; // HH:mm format
  day_of_week?: number; // 0-6 (Sunday-Saturday)
  day_of_month?: number; // 1-31
  month?: number; // 1-12
  timezone: string;
  custom_cron?: string;
}

// Report Recipient Interface
export interface ReportRecipient {
  id: string;
  name: string;
  email: string;
  type: 'user' | 'group' | 'external';
  delivery_method: 'email' | 'webhook' | 'ftp' | 's3';
  delivery_config: DeliveryConfig;
  is_active: boolean;
  last_sent?: string;
  success_count: number;
  failure_count: number;
}

// Delivery Config Interface
export interface DeliveryConfig {
  email_template?: string;
  webhook_url?: string;
  ftp_config?: FTPConfig;
  s3_config?: S3Config;
  compression?: boolean;
  encryption?: boolean;
  password?: string;
}

// FTP Config Interface
export interface FTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  path: string;
  passive: boolean;
}

// S3 Config Interface
export interface S3Config {
  bucket: string;
  region: string;
  access_key: string;
  secret_key: string;
  path: string;
  public_read: boolean;
}

// Report Analytics Interface
export interface ReportAnalytics {
  total_reports: number;
  reports_this_month: number;
  reports_this_week: number;
  reports_today: number;
  average_generation_time: number;
  success_rate: number;
  most_popular_template: string;
  most_active_user: string;
  total_file_size: number;
  reports_by_type: Record<ReportType, number>;
  reports_by_status: Record<ReportStatus, number>;
  reports_by_format: Record<ReportFormat, number>;
  recent_activity: ReportActivity[];
  performance_metrics: PerformanceMetrics;
  user_analytics: UserAnalytics;
}

// Report Activity Interface
export interface ReportActivity {
  id: string;
  action: 'created' | 'updated' | 'deleted' | 'generated' | 'scheduled' | 'downloaded' | 'shared';
  user: string;
  template: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Performance Metrics Interface
export interface PerformanceMetrics {
  avg_generation_time: number;
  avg_file_size: number;
  peak_hours: string[];
  slowest_templates: string[];
  fastest_templates: string[];
  error_rate: number;
  success_rate: number;
}

// User Analytics Interface
export interface UserAnalytics {
  total_users: number;
  active_users: number;
  top_users: Array<{
    user: string;
    report_count: number;
    last_activity: string;
  }>;
  user_engagement: Record<string, number>;
}

// Report Filter Options Interface
export interface ReportFilterOptions {
  status?: ReportStatus[];
  type?: ReportType[];
  format?: ReportFormat[];
  date_range?: {
    start: string;
    end: string;
  };
  created_by?: string[];
  template?: string[];
}

// Report Sort Options Interface
export interface ReportSortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Report Pagination Interface
export interface ReportPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Report API Response Interface
export interface ReportApiResponse<T> {
  data: T;
  pagination?: ReportPagination;
  message?: string;
  success: boolean;
  errors?: string[];
}

// Report Export Options Interface
export interface ReportExportOptions {
  format: ReportFormat;
  compression?: boolean;
  encryption?: boolean;
  password?: string;
  include_metadata?: boolean;
  custom_filename?: string;
}

// Report Notification Interface
export interface ReportNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
}

// Report Comment Interface
export interface ReportComment extends BaseEntity {
  report_id: string;
  content: string;
  parent_id?: string;
  replies: ReportComment[];
  likes: number;
  is_edited: boolean;
  edited_at?: string;
}

// Report Version Interface
export interface ReportVersion extends BaseEntity {
  report_id: string;
  version: string;
  changes: string;
  file_url?: string;
  file_size?: number;
  is_current: boolean;
}

// Report Share Interface
export interface ReportShare extends BaseEntity {
  report_id: string;
  shared_with: string;
  permissions: ('read' | 'download' | 'share')[];
  expires_at?: string;
  is_active: boolean;
  access_count: number;
  last_accessed?: string;
}

// Report Audit Log Interface
export interface ReportAuditLog extends BaseEntity {
  report_id: string;
  action: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
}

// Utility Types
export type ReportStatusType = keyof typeof ReportStatus;
export type ReportTypeType = keyof typeof ReportType;
export type ReportFormatType = keyof typeof ReportFormat;
export type ReportFrequencyType = keyof typeof ReportFrequency;

// Type Guards
export const isReportStatus = (value: string): value is ReportStatus => {
  return Object.values(ReportStatus).includes(value as ReportStatus);
};

export const isReportType = (value: string): value is ReportType => {
  return Object.values(ReportType).includes(value as ReportType);
};

export const isReportFormat = (value: string): value is ReportFormat => {
  return Object.values(ReportFormat).includes(value as ReportFormat);
};

export const isReportFrequency = (value: string): value is ReportFrequency => {
  return Object.values(ReportFrequency).includes(value as ReportFrequency);
};
