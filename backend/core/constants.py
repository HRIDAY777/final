"""
Constants for EduCore Ultra project.
"""
from enum import Enum


# User Roles and Permissions
class UserRole(Enum):
    """User roles enumeration."""
    SUPER_ADMIN = 'super_admin'
    ADMIN = 'admin'
    TEACHER = 'teacher'
    STUDENT = 'student'
    GUARDIAN = 'guardian'
    STAFF = 'staff'


class UserStatus(Enum):
    """User status enumeration."""
    ACTIVE = 'active'
    INACTIVE = 'inactive'
    SUSPENDED = 'suspended'
    PENDING = 'pending'
    EXPIRED = 'expired'


# Academic Constants
class AcademicLevel(Enum):
    """Academic level enumeration."""
    PRIMARY = 'primary'
    SECONDARY = 'secondary'
    HIGH_SCHOOL = 'high_school'
    UNIVERSITY = 'university'
    GRADUATE = 'graduate'


class GradeLevel(Enum):
    """Grade level enumeration."""
    GRADE_1 = 'grade_1'
    GRADE_2 = 'grade_2'
    GRADE_3 = 'grade_3'
    GRADE_4 = 'grade_4'
    GRADE_5 = 'grade_5'
    GRADE_6 = 'grade_6'
    GRADE_7 = 'grade_7'
    GRADE_8 = 'grade_8'
    GRADE_9 = 'grade_9'
    GRADE_10 = 'grade_10'
    GRADE_11 = 'grade_11'
    GRADE_12 = 'grade_12'


# Attendance Constants
class AttendanceStatus(Enum):
    """Attendance status enumeration."""
    PRESENT = 'present'
    ABSENT = 'absent'
    LATE = 'late'
    EXCUSED = 'excused'
    UNEXCUSED = 'unexcused'
    HALF_DAY = 'half_day'


# Payment Constants
class PaymentStatus(Enum):
    """Payment status enumeration."""
    PENDING = 'pending'
    PAID = 'paid'
    PARTIAL = 'partial'
    OVERDUE = 'overdue'
    WAIVED = 'waived'
    REFUNDED = 'refunded'


class PaymentMethod(Enum):
    """Payment method enumeration."""
    CASH = 'cash'
    CARD = 'card'
    BANK_TRANSFER = 'bank_transfer'
    CHECK = 'check'
    ONLINE = 'online'
    MOBILE_MONEY = 'mobile_money'


# System Constants
class SystemStatus(Enum):
    """System status enumeration."""
    ACTIVE = 'active'
    MAINTENANCE = 'maintenance'
    OFFLINE = 'offline'
    ERROR = 'error'


class LogLevel(Enum):
    """Log level enumeration."""
    DEBUG = 'debug'
    INFO = 'info'
    WARNING = 'warning'
    ERROR = 'error'
    CRITICAL = 'critical'


# API Constants
class APIVersion(Enum):
    """API version enumeration."""
    V1 = 'v1'
    V2 = 'v2'
    V3 = 'v3'


class ResponseStatus(Enum):
    """Response status enumeration."""
    SUCCESS = 'success'
    ERROR = 'error'
    WARNING = 'warning'
    INFO = 'info'


# Pagination Constants
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
MIN_PAGE_SIZE = 1

# File Upload Limits
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_DOCUMENT_SIZE = 20 * 1024 * 1024  # 20MB

# Allowed File Types
ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
]

ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
]

# Security Constants
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128
SESSION_TIMEOUT = 3600  # 1 hour
TOKEN_EXPIRY = 86400  # 24 hours
REFRESH_TOKEN_EXPIRY = 604800  # 7 days

# Rate Limiting Constants
RATE_LIMIT_REQUESTS = 1000
RATE_LIMIT_WINDOW = 3600  # 1 hour
RATE_LIMIT_BURST = 100

# Cache Constants
CACHE_TIMEOUT = 300  # 5 minutes
CACHE_LONG_TIMEOUT = 3600  # 1 hour
CACHE_DAY_TIMEOUT = 86400  # 24 hours

# Database Constants
DB_CONNECTION_TIMEOUT = 30
DB_QUERY_TIMEOUT = 60
DB_MAX_CONNECTIONS = 20

# Email Constants
EMAIL_TIMEOUT = 30
EMAIL_MAX_RETRIES = 3
EMAIL_BATCH_SIZE = 100

# Backup Constants
BACKUP_RETENTION_DAYS = 30
BACKUP_MAX_SIZE = 1024 * 1024 * 1024  # 1GB
BACKUP_COMPRESSION = True

# Logging Constants
LOG_RETENTION_DAYS = 90
LOG_MAX_SIZE = 100 * 1024 * 1024  # 100MB
LOG_BACKUP_COUNT = 5

# Tenant Constants
TENANT_NAME_MAX_LENGTH = 100
TENANT_DOMAIN_MAX_LENGTH = 100
TENANT_DESCRIPTION_MAX_LENGTH = 500

# Subscription Constants
SUBSCRIPTION_TRIAL_DAYS = 14
SUBSCRIPTION_GRACE_PERIOD_DAYS = 7
SUBSCRIPTION_CANCELLATION_DAYS = 30

# Status Messages
STATUS_MESSAGES = {
    'success': 'Operation completed successfully.',
    'error': 'An error occurred while processing your request.',
    'warning': 'Please review the information provided.',
    'info': 'Please note the following information.',
    'created': 'Resource created successfully.',
    'updated': 'Resource updated successfully.',
    'deleted': 'Resource deleted successfully.',
    'not_found': 'The requested resource was not found.',
    'unauthorized': 'You are not authorized to perform this action.',
    'forbidden': 'Access to this resource is forbidden.',
    'validation_error': 'Please check the provided data.',
    'server_error': 'An internal server error occurred.',
    'maintenance': 'System is currently under maintenance.',
    'rate_limit': 'Too many requests. Please try again later.'
}

# Error Codes
ERROR_CODES = {
    'VALIDATION_ERROR': 'VALIDATION_ERROR',
    'AUTHENTICATION_ERROR': 'AUTHENTICATION_ERROR',
    'AUTHORIZATION_ERROR': 'AUTHORIZATION_ERROR',
    'NOT_FOUND_ERROR': 'NOT_FOUND_ERROR',
    'CONFLICT_ERROR': 'CONFLICT_ERROR',
    'RATE_LIMIT_ERROR': 'RATE_LIMIT_ERROR',
    'SERVER_ERROR': 'SERVER_ERROR',
    'MAINTENANCE_ERROR': 'MAINTENANCE_ERROR',
    'EXTERNAL_SERVICE_ERROR': 'EXTERNAL_SERVICE_ERROR',
    'DATABASE_ERROR': 'DATABASE_ERROR',
    'FILE_UPLOAD_ERROR': 'FILE_UPLOAD_ERROR',
    'EXPORT_ERROR': 'EXPORT_ERROR',
    'IMPORT_ERROR': 'IMPORT_ERROR',
    'NOTIFICATION_ERROR': 'NOTIFICATION_ERROR',
    'PAYMENT_ERROR': 'PAYMENT_ERROR',
    'SUBSCRIPTION_ERROR': 'SUBSCRIPTION_ERROR',
    'REPORT_ERROR': 'REPORT_ERROR',
    'BACKUP_ERROR': 'BACKUP_ERROR',
    'RESTORE_ERROR': 'RESTORE_ERROR',
    'TENANT_ERROR': 'TENANT_ERROR',
    'MODULE_ERROR': 'MODULE_ERROR',
    'FEATURE_ERROR': 'FEATURE_ERROR'
}
