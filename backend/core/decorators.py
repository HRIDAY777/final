"""
Custom decorators for views and functions.
"""
from functools import wraps
from django.core.cache import cache
from django.http import JsonResponse
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
import logging
import time

logger = logging.getLogger(__name__)


def cache_response(timeout=300, key_prefix='view'):
    """
    Decorator to cache view responses.
    
    Usage:
        @cache_response(timeout=600, key_prefix='students')
        def get_students(request):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}:{func.__name__}:{request.path}"
            
            # Try to get from cache
            cached_response = cache.get(cache_key)
            if cached_response is not None:
                logger.debug(f"Cache hit for {cache_key}")
                return cached_response
            
            # Execute function
            response = func(request, *args, **kwargs)
            
            # Cache the response
            cache.set(cache_key, response, timeout)
            logger.debug(f"Cached response for {cache_key}")
            
            return response
        
        return wrapper
    return decorator


def rate_limit(max_requests=100, window=3600, key_prefix='rate_limit'):
    """
    Rate limiting decorator.
    
    Usage:
        @rate_limit(max_requests=10, window=60)
        def sensitive_view(request):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            # Get client identifier
            client_ip = get_client_ip(request)
            cache_key = f"{key_prefix}:{func.__name__}:{client_ip}"
            
            # Get current request count
            request_count = cache.get(cache_key, 0)
            
            # Check rate limit
            if request_count >= max_requests:
                logger.warning(f"Rate limit exceeded for {client_ip}")
                return JsonResponse({
                    'error': 'Rate limit exceeded',
                    'message': f'Maximum {max_requests} requests per {window} seconds'
                }, status=429)
            
            # Increment request count
            cache.set(cache_key, request_count + 1, window)
            
            # Execute function
            return func(request, *args, **kwargs)
        
        return wrapper
    return decorator


def log_execution_time(threshold=1.0):
    """
    Log execution time if it exceeds threshold.
    
    Usage:
        @log_execution_time(threshold=0.5)
        def slow_function():
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            
            result = func(*args, **kwargs)
            
            duration = time.time() - start_time
            
            if duration > threshold:
                logger.warning(
                    f"Function {func.__name__} took {duration:.3f}s "
                    f"(threshold: {threshold}s)"
                )
            else:
                logger.debug(f"Function {func.__name__} took {duration:.3f}s")
            
            return result
        
        return wrapper
    return decorator


def require_api_key(func):
    """
    Require API key for endpoint access.
    
    Usage:
        @require_api_key
        def api_view(request):
            ...
    """
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            return JsonResponse({
                'error': 'API key required',
                'message': 'Please provide X-API-Key header'
            }, status=401)
        
        # Validate API key
        valid_api_keys = getattr(settings, 'API_KEYS', [])
        if api_key not in valid_api_keys:
            logger.warning(f"Invalid API key attempt: {api_key[:10]}...")
            return JsonResponse({
                'error': 'Invalid API key',
                'message': 'The provided API key is not valid'
            }, status=401)
        
        return func(request, *args, **kwargs)
    
    return wrapper


def maintenance_mode_exempt(func):
    """
    Exempt view from maintenance mode.
    
    Usage:
        @maintenance_mode_exempt
        def health_check(request):
            ...
    """
    func.maintenance_mode_exempt = True
    return func


def require_superuser(func):
    """
    Require superuser access.
    
    Usage:
        @require_superuser
        def admin_only_view(request):
            ...
    """
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_superuser:
            return JsonResponse({
                'error': 'Superuser required',
                'message': 'This action requires superuser privileges'
            }, status=403)
        
        return func(request, *args, **kwargs)
    
    return wrapper


def log_user_activity(action):
    """
    Log user activity.
    
    Usage:
        @log_user_activity('viewed_student_profile')
        def student_detail(request, pk):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            # Execute function
            response = func(request, *args, **kwargs)
            
            # Log activity if user is authenticated
            if hasattr(request, 'user') and request.user.is_authenticated:
                logger.info(
                    f"User {request.user.id} performed action: {action} "
                    f"on {request.path}"
                )
            
            return response
        
        return wrapper
    return decorator


def retry_on_failure(max_retries=3, delay=1):
    """
    Retry function on failure.
    
    Usage:
        @retry_on_failure(max_retries=3, delay=2)
        def unstable_function():
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    logger.warning(
                        f"Attempt {attempt + 1}/{max_retries} failed for "
                        f"{func.__name__}: {str(e)}"
                    )
                    
                    if attempt < max_retries - 1:
                        time.sleep(delay)
            
            # All retries failed
            logger.error(
                f"All {max_retries} attempts failed for {func.__name__}"
            )
            raise last_exception
        
        return wrapper
    return decorator


def validate_request_data(*required_fields):
    """
    Validate that required fields are present in request data.
    
    Usage:
        @validate_request_data('email', 'password')
        def login_view(request):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            # Get request data
            if hasattr(request, 'data'):
                data = request.data
            else:
                data = request.POST or request.GET
            
            # Check required fields
            missing_fields = [
                field for field in required_fields
                if field not in data or not data[field]
            ]
            
            if missing_fields:
                return JsonResponse({
                    'error': 'Missing required fields',
                    'missing_fields': missing_fields
                }, status=400)
            
            return func(request, *args, **kwargs)
        
        return wrapper
    return decorator


def get_client_ip(request):
    """Get client IP address from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

