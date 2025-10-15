"""
Custom exception handlers for better error handling.
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import PermissionDenied, ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework.exceptions import (
    APIException,
    ValidationError,
    AuthenticationFailed,
    NotAuthenticated,
    PermissionDenied as DRFPermissionDenied,
    NotFound,
    MethodNotAllowed,
    Throttled
)

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for REST framework.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Get the request object
    request = context.get('request')
    
    # Log the exception
    logger.error(
        f"Exception in {request.method} {request.path}: {str(exc)}",
        exc_info=True,
        extra={
            'request': request,
            'exc_type': type(exc).__name__,
        }
    )
    
    # If response is None, it's not a DRF exception
    if response is None:
        # Handle Django exceptions
        if isinstance(exc, Http404):
            return Response(
                {
                    'error': 'Not Found',
                    'message': 'The requested resource was not found.',
                    'status_code': 404
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        elif isinstance(exc, PermissionDenied):
            return Response(
                {
                    'error': 'Permission Denied',
                    'message': 'You do not have permission to perform this action.',
                    'status_code': 403
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        elif isinstance(exc, DjangoValidationError):
            return Response(
                {
                    'error': 'Validation Error',
                    'message': str(exc),
                    'status_code': 400
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Handle any other exception
        return Response(
            {
                'error': 'Internal Server Error',
                'message': 'An unexpected error occurred. Please try again later.',
                'status_code': 500
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Customize DRF exception responses
    error_data = {
        'error': exc.__class__.__name__,
        'message': str(exc),
        'status_code': response.status_code
    }
    
    # Handle specific exception types
    if isinstance(exc, ValidationError):
        error_data['error'] = 'Validation Error'
        if hasattr(exc, 'detail'):
            error_data['details'] = exc.detail
    
    elif isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
        error_data['error'] = 'Authentication Error'
        error_data['message'] = 'Authentication credentials were not provided or are invalid.'
    
    elif isinstance(exc, DRFPermissionDenied):
        error_data['error'] = 'Permission Denied'
        error_data['message'] = 'You do not have permission to perform this action.'
    
    elif isinstance(exc, NotFound):
        error_data['error'] = 'Not Found'
        error_data['message'] = 'The requested resource was not found.'
    
    elif isinstance(exc, MethodNotAllowed):
        error_data['error'] = 'Method Not Allowed'
        error_data['message'] = f'Method "{exc.detail}" is not allowed for this endpoint.'
    
    elif isinstance(exc, Throttled):
        error_data['error'] = 'Rate Limit Exceeded'
        error_data['message'] = 'You have exceeded the rate limit. Please try again later.'
        if exc.wait:
            error_data['retry_after'] = f'{exc.wait} seconds'
    
    response.data = error_data
    
    return response


class ServiceUnavailableException(APIException):
    """Custom exception for service unavailable."""
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'Service temporarily unavailable, please try again later.'
    default_code = 'service_unavailable'


class MaintenanceModeException(APIException):
    """Custom exception for maintenance mode."""
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'The system is currently under maintenance.'
    default_code = 'maintenance_mode'


class InvalidTokenException(APIException):
    """Custom exception for invalid tokens."""
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = 'Invalid or expired token.'
    default_code = 'invalid_token'


class ResourceConflictException(APIException):
    """Custom exception for resource conflicts."""
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'The request conflicts with the current state of the resource.'
    default_code = 'resource_conflict'


class QuotaExceededException(APIException):
    """Custom exception for quota exceeded."""
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    default_detail = 'You have exceeded your quota.'
    default_code = 'quota_exceeded'

