"""
Custom exceptions for EduCore Ultra project.
"""
from rest_framework import status
from rest_framework.exceptions import APIException


class EduCoreException(Exception):
    """Base exception for EduCore Ultra project."""

    def __init__(self, message: str, code: str = None, details: dict = None):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(self.message)


class ConfigurationError(EduCoreException):
    """Raised when there's a configuration error."""
    pass


class DatabaseError(EduCoreException):
    """Raised when there's a database-related error."""
    pass


class AuthenticationError(EduCoreException):
    """Raised when there's an authentication error."""
    pass


class AuthorizationError(EduCoreException):
    """Raised when there's an authorization error."""
    pass


class EduCoreValidationError(EduCoreException):
    """Raised when there's a validation error."""
    pass


class BusinessLogicError(EduCoreException):
    """Raised when there's a business logic error."""
    pass


class ExternalServiceError(EduCoreException):
    """Raised when there's an external service error."""
    pass


class RateLimitExceededError(EduCoreException):
    """Raised when rate limit is exceeded."""
    pass


class MaintenanceModeError(EduCoreException):
    """Raised when system is in maintenance mode."""
    pass


class TenantNotFoundError(EduCoreException):
    """Raised when tenant is not found."""
    pass


class TenantAccessError(EduCoreException):
    """Raised when tenant access is denied."""
    pass


class FileUploadError(EduCoreException):
    """Raised when there's a file upload error."""
    pass


class ExportError(EduCoreException):
    """Raised when there's an export error."""
    pass


class ImportError(EduCoreException):
    """Raised when there's an import error."""
    pass


class NotificationError(EduCoreException):
    """Raised when there's a notification error."""
    pass


class PaymentError(EduCoreException):
    """Raised when there's a payment error."""
    pass


class SubscriptionError(EduCoreException):
    """Raised when there's a subscription error."""
    pass


class ReportGenerationError(EduCoreException):
    """Raised when there's a report generation error."""
    pass


class BackupError(EduCoreException):
    """Raised when there's a backup error."""
    pass


class RestoreError(EduCoreException):
    """Raised when there's a restore error."""
    pass


# REST Framework API Exceptions
class BadRequestAPIException(APIException):
    """400 Bad Request API Exception."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Bad request.'
    default_code = 'bad_request'


class UnauthorizedAPIException(APIException):
    """401 Unauthorized API Exception."""
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = 'Authentication credentials were not provided.'
    default_code = 'unauthorized'


class ForbiddenAPIException(APIException):
    """403 Forbidden API Exception."""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'You do not have permission to perform this action.'
    default_code = 'forbidden'


class NotFoundAPIException(APIException):
    """404 Not Found API Exception."""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Not found.'
    default_code = 'not_found'


class MethodNotAllowedAPIException(APIException):
    """405 Method Not Allowed API Exception."""
    status_code = status.HTTP_405_METHOD_NOT_ALLOWED
    default_detail = 'Method not allowed.'
    default_code = 'method_not_allowed'


class ConflictAPIException(APIException):
    """409 Conflict API Exception."""
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Conflict.'
    default_code = 'conflict'


class TooManyRequestsAPIException(APIException):
    """429 Too Many Requests API Exception."""
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    default_detail = 'Too many requests.'
    default_code = 'too_many_requests'


class InternalServerErrorAPIException(APIException):
    """500 Internal Server Error API Exception."""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'Internal server error.'
    default_code = 'internal_server_error'


class ServiceUnavailableAPIException(APIException):
    """503 Service Unavailable API Exception."""
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'Service temporarily unavailable.'
    default_code = 'service_unavailable'


# Custom API Exceptions with specific messages
class InvalidCredentialsAPIException(UnauthorizedAPIException):
    """Invalid credentials API exception."""
    default_detail = 'Invalid credentials provided.'
    default_code = 'invalid_credentials'


class TokenExpiredAPIException(UnauthorizedAPIException):
    """Token expired API exception."""
    default_detail = 'Authentication token has expired.'
    default_code = 'token_expired'


class InsufficientPermissionsAPIException(ForbiddenAPIException):
    """Insufficient permissions API exception."""
    default_detail = 'You do not have sufficient permissions for this action.'
    default_code = 'insufficient_permissions'


class ResourceNotFoundAPIException(NotFoundAPIException):
    """Resource not found API exception."""
    default_detail = 'The requested resource was not found.'
    default_code = 'resource_not_found'


class ValidationFailedAPIException(BadRequestAPIException):
    """Validation failed API exception."""
    default_detail = 'Validation failed.'
    default_code = 'validation_failed'


class DuplicateResourceAPIException(ConflictAPIException):
    """Duplicate resource API exception."""
    default_detail = 'A resource with these details already exists.'
    default_code = 'duplicate_resource'


class RateLimitExceededAPIException(TooManyRequestsAPIException):
    """Rate limit exceeded API exception."""
    default_detail = 'Rate limit exceeded. Please try again later.'
    default_code = 'rate_limit_exceeded'


class MaintenanceModeAPIException(ServiceUnavailableAPIException):
    """Maintenance mode API exception."""
    default_detail = (
        'System is currently under maintenance. Please try again later.'
    )
    default_code = 'maintenance_mode'


class ExternalServiceUnavailableAPIException(ServiceUnavailableAPIException):
    """External service unavailable API exception."""
    default_detail = 'External service is temporarily unavailable.'
    default_code = 'external_service_unavailable'


class PaymentFailedAPIException(BadRequestAPIException):
    """Payment failed API exception."""
    default_detail = 'Payment processing failed.'
    default_code = 'payment_failed'


class SubscriptionExpiredAPIException(ForbiddenAPIException):
    """Subscription expired API exception."""
    default_detail = 'Your subscription has expired. Please renew to continue.'
    default_code = 'subscription_expired'


class QuotaExceededAPIException(ForbiddenAPIException):
    """Quota exceeded API exception."""
    default_detail = 'You have exceeded your usage quota.'
    default_code = 'quota_exceeded'


class FileTooLargeAPIException(BadRequestAPIException):
    """File too large API exception."""
    default_detail = 'The uploaded file is too large.'
    default_code = 'file_too_large'


class InvalidFileTypeAPIException(BadRequestAPIException):
    """Invalid file type API exception."""
    default_detail = 'The uploaded file type is not allowed.'
    default_code = 'invalid_file_type'


class ExportFailedAPIException(InternalServerErrorAPIException):
    """Export failed API exception."""
    default_detail = 'Failed to generate export. Please try again.'
    default_code = 'export_failed'


class ImportFailedAPIException(BadRequestAPIException):
    """Import failed API exception."""
    default_detail = 'Failed to import data. Please check the file format.'
    default_code = 'import_failed'


class ReportGenerationFailedAPIException(InternalServerErrorAPIException):
    """Report generation failed API exception."""
    default_detail = 'Failed to generate report. Please try again.'
    default_code = 'report_generation_failed'


class BackupFailedAPIException(InternalServerErrorAPIException):
    """Backup failed API exception."""
    default_detail = 'Failed to create backup. Please try again.'
    default_code = 'backup_failed'


class RestoreFailedAPIException(InternalServerErrorAPIException):
    """Restore failed API exception."""
    default_detail = 'Failed to restore from backup. Please try again.'
    default_code = 'restore_failed'


class NotificationFailedAPIException(InternalServerErrorAPIException):
    """Notification failed API exception."""
    default_detail = 'Failed to send notification. Please try again.'
    default_code = 'notification_failed'


class TenantNotFoundAPIException(NotFoundAPIException):
    """Tenant not found API exception."""
    default_detail = 'Tenant not found.'
    default_code = 'tenant_not_found'


class TenantAccessDeniedAPIException(ForbiddenAPIException):
    """Tenant access denied API exception."""
    default_detail = 'Access to this tenant is denied.'
    default_code = 'tenant_access_denied'


class ModuleNotAvailableAPIException(ForbiddenAPIException):
    """Module not available API exception."""
    default_detail = 'This module is not available for your subscription.'
    default_code = 'module_not_available'


class FeatureNotEnabledAPIException(ForbiddenAPIException):
    """Feature not enabled API exception."""
    default_detail = 'This feature is not enabled for your account.'
    default_code = 'feature_not_enabled'


class DataIntegrityErrorAPIException(ConflictAPIException):
    """Data integrity error API exception."""
    default_detail = 'Data integrity error occurred.'
    default_code = 'data_integrity_error'


class ConcurrentModificationAPIException(ConflictAPIException):
    """Concurrent modification API exception."""
    default_detail = 'The resource has been modified by another user.'
    default_code = 'concurrent_modification'


class InvalidStateAPIException(BadRequestAPIException):
    """Invalid state API exception."""
    default_detail = 'The operation is not valid in the current state.'
    default_code = 'invalid_state'


class TimeoutAPIException(InternalServerErrorAPIException):
    """Timeout API exception."""
    default_detail = 'The operation timed out. Please try again.'
    default_code = 'timeout'


class CircuitBreakerOpenAPIException(ServiceUnavailableAPIException):
    """Circuit breaker open API exception."""
    default_detail = 'Service is temporarily unavailable due to high load.'
    default_code = 'circuit_breaker_open'
