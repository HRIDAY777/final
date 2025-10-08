"""
Custom middleware for EduCore Ultra project.
"""
import time
import logging
import json
from django.http import HttpRequest, HttpResponse
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(MiddlewareMixin):
    """Middleware to log all requests for debugging and monitoring."""

    def process_request(self, request: HttpRequest):
        """Log incoming request details."""
        request.start_time = time.time()

        # Log request details
        log_data = {
            'timestamp': timezone.now().isoformat(),
            'method': request.method,
            'path': request.path,
            'user': getattr(request.user, 'username', 'anonymous'),
            'ip': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
        }

        logger.info(f"Request: {json.dumps(log_data)}")

    def process_response(self, request: HttpRequest, response: HttpResponse):
        """Log response details and timing."""
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time

            log_data = {
                'timestamp': timezone.now().isoformat(),
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'duration': round(duration, 3),
                'user': getattr(request.user, 'username', 'anonymous'),
            }

            logger.info(f"Response: {json.dumps(log_data)}")

        return response

    def get_client_ip(self, request: HttpRequest) -> str:
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class PerformanceMonitoringMiddleware(MiddlewareMixin):
    """Middleware to monitor request performance."""

    def process_request(self, request: HttpRequest):
        """Start performance monitoring."""
        request.start_time = time.time()

    def process_response(self, request: HttpRequest, response: HttpResponse):
        """Monitor response performance."""
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time

            # Log slow requests
            if duration > 1.0:  # Log requests taking more than 1 second
                logger.warning(
                    f"Slow request: {request.method} {request.path} "
                    f"took {duration:.3f}s"
                )

            # Add performance headers
            response['X-Response-Time'] = f"{duration:.3f}s"

        return response


class SecurityMiddleware(MiddlewareMixin):
    """Security middleware for additional protection."""

    def process_response(self, request: HttpRequest, response: HttpResponse):
        """Add security headers to response."""
        # Security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # Content Security Policy
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self'; "
            "frame-ancestors 'none';"
        )
        response['Content-Security-Policy'] = csp_policy

        return response


class RateLimitingMiddleware(MiddlewareMixin):
    """Rate limiting middleware to prevent abuse."""

    def process_request(self, request: HttpRequest):
        """Check rate limits for the request."""
        client_ip = self.get_client_ip(request)
        cache_key = f"rate_limit:{client_ip}"

        # Get current request count
        request_count = cache.get(cache_key, 0)

        # Check if rate limit exceeded
        if request_count >= getattr(settings, 'RATE_LIMIT_MAX_REQUESTS', 1000):
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return HttpResponse(
                json.dumps({'error': 'Rate limit exceeded'}),
                status=429,
                content_type='application/json'
            )

        # Increment request count
        cache.set(cache_key, request_count + 1, 3600)  # 1 hour window

    def get_client_ip(self, request: HttpRequest) -> str:
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class TenantMiddleware(MiddlewareMixin):
    """Middleware for multi-tenant support."""

    def process_request(self, request: HttpRequest):
        """Set tenant based on request."""
        # Extract tenant from subdomain or header
        tenant_id = self.get_tenant_from_request(request)

        if tenant_id:
            # Set tenant in request
            request.tenant_id = tenant_id

            # Set tenant in thread local storage
            from threading import local
            _thread_locals = local()
            _thread_locals.tenant_id = tenant_id

    def get_tenant_from_request(self, request: HttpRequest) -> str:
        """Extract tenant identifier from request."""
        # Check subdomain
        host = request.get_host()
        if '.' in host:
            subdomain = host.split('.')[0]
            if subdomain != 'www':
                return subdomain

        # Check custom header
        tenant_header = request.META.get('HTTP_X_TENANT_ID')
        if tenant_header:
            return tenant_header

        # Check query parameter
        tenant_param = request.GET.get('tenant')
        if tenant_param:
            return tenant_param

        return None


class MaintenanceModeMiddleware(MiddlewareMixin):
    """Middleware to handle maintenance mode."""

    def process_request(self, request: HttpRequest):
        """Check if maintenance mode is enabled."""
        maintenance_mode = getattr(settings, 'MAINTENANCE_MODE', False)

        if maintenance_mode:
            # Allow admin users to bypass maintenance mode
            if hasattr(request, 'user') and request.user.is_authenticated:
                if request.user.is_staff or request.user.is_superuser:
                    return None

            # Return maintenance page for all other requests
            return HttpResponse(
                json.dumps({
                    'error': 'Maintenance mode is enabled',
                    'message': (
                        'The system is currently under maintenance. '
                        'Please try again later.'
                    )
                }),
                status=503,
                content_type='application/json'
            )


class CORSMiddleware(MiddlewareMixin):
    """Custom CORS middleware for additional control."""

    def process_response(self, request: HttpRequest, response: HttpResponse):
        """Add CORS headers to response."""
        origin = request.META.get('HTTP_ORIGIN')

        if origin:
            # Check if origin is allowed
            allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
            if origin in allowed_origins or '*' in allowed_origins:
                response['Access-Control-Allow-Origin'] = origin
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Allow-Methods'] = (
                    'GET, POST, PUT, DELETE, OPTIONS'
                )
                response['Access-Control-Allow-Headers'] = (
                    'Content-Type, Authorization, X-Requested-With'
                )

        return response


class ErrorHandlingMiddleware(MiddlewareMixin):
    """Middleware to handle and log errors."""

    def process_exception(self, request: HttpRequest, exception: Exception):
        """Handle exceptions and log them."""
        # Log the exception
        logger.error(
            f"Exception in {request.method} {request.path}: {str(exception)}",
            exc_info=True
        )

        # Return JSON error response for API requests
        if request.path.startswith('/api/'):
            return HttpResponse(
                json.dumps({
                    'error': 'Internal server error',
                    'message': 'An unexpected error occurred.'
                }),
                status=500,
                content_type='application/json'
            )

        return None


class CacheControlMiddleware(MiddlewareMixin):
    """Middleware to set cache control headers."""

    def process_response(self, request: HttpRequest, response: HttpResponse):
        """Set appropriate cache control headers."""
        # Don't cache API responses by default
        if request.path.startswith('/api/'):
            response['Cache-Control'] = (
                'no-cache, no-store, must-revalidate'
            )
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
        else:
            # Set cache headers for static content
            if (request.path.startswith('/static/')
                    or request.path.startswith('/media/')):
                response['Cache-Control'] = (
                    'public, max-age=31536000'  # 1 year
                )
            else:
                response['Cache-Control'] = 'private, max-age=300'  # 5 minutes

        return response


class UserActivityMiddleware(MiddlewareMixin):
    """Middleware to track user activity."""

    def process_request(self, request: HttpRequest):
        """Track user activity."""
        if hasattr(request, 'user') and request.user.is_authenticated:
            # Update last activity
            cache_key = f"user_activity:{request.user.id}"
            cache.set(cache_key, timezone.now(), 3600)  # 1 hour

    def process_response(self, request: HttpRequest, response: HttpResponse):
        """Log user activity after response."""
        if (hasattr(request, 'user') and request.user.is_authenticated
                and request.path.startswith('/api/')):

            # Log API activity
            activity_data = {
                'user_id': request.user.id,
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'timestamp': timezone.now().isoformat()
            }

            logger.info(f"User Activity: {json.dumps(activity_data)}")

        return response


class RequestIDMiddleware(MiddlewareMixin):
    """Middleware to add request ID for tracking."""

    def process_request(self, request: HttpRequest):
        """Add unique request ID."""
        import uuid
        request.request_id = str(uuid.uuid4())

    def process_response(self, request: HttpRequest, response: HttpResponse):
        """Add request ID to response headers."""
        if hasattr(request, 'request_id'):
            response['X-Request-ID'] = request.request_id
        return response


class DatabaseQueryLoggingMiddleware(MiddlewareMixin):
    """Middleware to log database queries in development."""

    def process_request(self, request: HttpRequest):
        """Start query logging."""
        if settings.DEBUG:
            # Enable query logging for this request
            request._query_log_enabled = True

    def process_response(self, request: HttpRequest, response: HttpResponse):
        """Log database queries."""
        if settings.DEBUG and getattr(request, '_query_log_enabled', False):
            from django.db import connection

            # Get query count and time from connection
            query_count = (
                len(connection.queries)
                if hasattr(connection, 'queries') else 0
            )
            if query_count > 0:
                total_time = sum(
                    float(query.get('time', 0)) for query in connection.queries
                )
                logger.info(
                    f"Database queries for {request.path}: "
                    f"{query_count} queries in {total_time:.3f}s"
                )

                # Log slow queries
                for query in connection.queries:
                    # Log queries taking more than 100ms
                    if float(query['time']) > 0.1:
                        logger.warning(
                            f"Slow query ({query['time']}s): "
                            f"{query['sql'][:200]}..."
                        )

        return response
