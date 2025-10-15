"""
Health Check Endpoints for Monitoring
"""
import psutil
from django.conf import settings
from django.core.cache import cache
from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Basic health check endpoint.
    Returns 200 if the service is running.
    """
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'service': 'EduCore Ultra API'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check_detailed(request):
    """
    Detailed health check with all system components.
    """
    health_status = {
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'checks': {}
    }
    
    overall_healthy = True
    
    # Database Check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health_status['checks']['database'] = {
            'status': 'healthy',
            'message': 'Database connection successful'
        }
    except Exception as e:
        overall_healthy = False
        health_status['checks']['database'] = {
            'status': 'unhealthy',
            'message': str(e)
        }
    
    # Cache Check
    try:
        cache_key = 'health_check_test'
        cache.set(cache_key, 'test_value', 10)
        cache_value = cache.get(cache_key)
        
        if cache_value == 'test_value':
            health_status['checks']['cache'] = {
                'status': 'healthy',
                'message': 'Cache is working'
            }
        else:
            raise Exception('Cache value mismatch')
    except Exception as e:
        overall_healthy = False
        health_status['checks']['cache'] = {
            'status': 'unhealthy',
            'message': str(e)
        }
    
    # System Resources
    try:
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        cpu_percent = psutil.cpu_percent(interval=1)
        
        health_status['checks']['system_resources'] = {
            'status': 'healthy',
            'cpu_percent': cpu_percent,
            'memory_percent': memory.percent,
            'disk_percent': disk.percent,
            'memory_available_mb': memory.available / (1024 * 1024),
            'disk_available_gb': disk.free / (1024 * 1024 * 1024)
        }
        
        # Alert if resources are too high
        if cpu_percent > 90 or memory.percent > 90 or disk.percent > 90:
            health_status['checks']['system_resources']['status'] = 'warning'
            health_status['checks']['system_resources']['message'] = 'High resource usage detected'
    except Exception as e:
        health_status['checks']['system_resources'] = {
            'status': 'unknown',
            'message': str(e)
        }
    
    # Overall status
    health_status['status'] = 'healthy' if overall_healthy else 'unhealthy'
    
    response_status = status.HTTP_200_OK if overall_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    
    return Response(health_status, status=response_status)


@api_view(['GET'])
@permission_classes([AllowAny])
def readiness_check(request):
    """
    Kubernetes readiness probe.
    Returns 200 when the service is ready to accept traffic.
    """
    ready = True
    checks = {}
    
    # Check database
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        checks['database'] = 'ready'
    except Exception as e:
        ready = False
        checks['database'] = f'not ready: {str(e)}'
    
    # Check cache
    try:
        cache.set('readiness_check', 'ok', 5)
        checks['cache'] = 'ready'
    except Exception as e:
        ready = False
        checks['cache'] = f'not ready: {str(e)}'
    
    if ready:
        return Response({
            'status': 'ready',
            'checks': checks
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'status': 'not ready',
            'checks': checks
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


@api_view(['GET'])
@permission_classes([AllowAny])
def liveness_check(request):
    """
    Kubernetes liveness probe.
    Returns 200 if the service is alive.
    """
    return Response({
        'status': 'alive',
        'timestamp': timezone.now().isoformat()
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def metrics(request):
    """
    Basic metrics endpoint for monitoring.
    """
    try:
        # Database stats
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_users
                FROM auth_user
            """)
            user_count = cursor.fetchone()[0]
        
        # System metrics
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        cpu_percent = psutil.cpu_percent(interval=1)
        
        metrics_data = {
            'timestamp': timezone.now().isoformat(),
            'database': {
                'total_users': user_count,
            },
            'system': {
                'cpu_percent': cpu_percent,
                'memory_used_percent': memory.percent,
                'memory_used_mb': (memory.total - memory.available) / (1024 * 1024),
                'memory_total_mb': memory.total / (1024 * 1024),
                'disk_used_percent': disk.percent,
                'disk_used_gb': disk.used / (1024 * 1024 * 1024),
                'disk_total_gb': disk.total / (1024 * 1024 * 1024),
            },
            'application': {
                'debug_mode': settings.DEBUG,
                'environment': settings.DJANGO_SETTINGS_MODULE.split('.')[-1],
            }
        }
        
        return Response(metrics_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

