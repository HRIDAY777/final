"""
Production settings for EduCore Ultra - Best Practices & Optimized
"""

import os
from pathlib import Path
from .base import *  # noqa: F401,F403
from .base import BASE_DIR  # noqa: F401

# ============================================================================
# CORE SETTINGS
# ============================================================================

DEBUG = False
ALLOWED_HOSTS = os.environ.get(
    'ALLOWED_HOSTS',
    'localhost,127.0.0.1'
).split(',')

# ============================================================================
# SECURITY SETTINGS - Best Practices
# ============================================================================

# SSL/HTTPS Settings
SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'True').lower() == 'true'
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# HSTS (HTTP Strict Transport Security)
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Security Headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# Cookie Security
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_AGE = int(os.environ.get('SESSION_COOKIE_AGE', '3600'))  # 1 hour
SESSION_EXPIRE_AT_BROWSER_CLOSE = False

CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_USE_SESSIONS = False

# ============================================================================
# CORS & CSRF SETTINGS
# ============================================================================

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    origin.strip() 
    for origin in os.environ.get(
    'CORS_ALLOWED_ORIGINS',
        'https://yourdomain.com'
).split(',')
]

CSRF_TRUSTED_ORIGINS = [
    origin.strip() 
    for origin in os.environ.get(
    'CSRF_TRUSTED_ORIGINS',
        'https://yourdomain.com'
).split(',')
]

# ============================================================================
# DATABASE - PostgreSQL with Connection Pooling
# ============================================================================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'educore_ultra'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'CONN_MAX_AGE': int(os.environ.get('DB_CONN_MAX_AGE', '600')),
        'ATOMIC_REQUESTS': True,
        'OPTIONS': {
            'sslmode': os.environ.get('DB_OPTIONS_SSLMODE', 'require'),
            'connect_timeout': int(os.environ.get('DB_OPTIONS_CONNECT_TIMEOUT', '10')),
            'application_name': 'educore_ultra',
            'options': '-c statement_timeout=30000',  # 30 seconds
        },
    }
}

# ============================================================================
# CACHE - Redis with Optimized Settings
# ============================================================================

REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'PARSER_CLASS': 'redis.connection.HiredisParser',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 100,
                'retry_on_timeout': True,
                'socket_keepalive': True,
                'socket_keepalive_options': {
                    1: 1,  # TCP_KEEPIDLE
                    2: 1,  # TCP_KEEPINTVL
                    3: 3,  # TCP_KEEPCNT
                },
            },
            'COMPRESSOR': 'django_redis.compressors.zlib.ZlibCompressor',
            'IGNORE_EXCEPTIONS': True,
        },
        'KEY_PREFIX': 'educore',
        'TIMEOUT': 300,  # 5 minutes default
    }
}

# Session using cache
SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'
SESSION_CACHE_ALIAS = 'default'

# ============================================================================
# CELERY - Task Queue Configuration
# ============================================================================

CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/1')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/1')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
CELERY_ENABLE_UTC = True
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes
CELERY_TASK_SOFT_TIME_LIMIT = 25 * 60  # 25 minutes
CELERY_WORKER_PREFETCH_MULTIPLIER = 4
CELERY_WORKER_MAX_TASKS_PER_CHILD = 1000
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True

# ============================================================================
# CHANNELS - WebSocket Layer
# ============================================================================

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [REDIS_URL],
            "capacity": 1500,
            "expiry": 10,
        },
    },
}

# ============================================================================
# EMAIL - SMTP Configuration
# ============================================================================

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_USE_SSL = os.environ.get('EMAIL_USE_SSL', 'False').lower() == 'true'
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@yourdomain.com')
SERVER_EMAIL = os.environ.get('SERVER_EMAIL', DEFAULT_FROM_EMAIL)
EMAIL_TIMEOUT = int(os.environ.get('EMAIL_TIMEOUT', '10'))

# ============================================================================
# STATIC & MEDIA FILES
# ============================================================================

STATIC_URL = '/static/'
STATIC_ROOT = str(BASE_DIR / 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = str(BASE_DIR / 'media')

# WhiteNoise for static file serving
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# File Upload Settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB
FILE_UPLOAD_PERMISSIONS = 0o644
FILE_UPLOAD_DIRECTORY_PERMISSIONS = 0o755

# ============================================================================
# LOGGING - Comprehensive Configuration
# ============================================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {asctime} {message}',
            'style': '{',
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': str(BASE_DIR / 'logs' / 'educore.log'),
            'maxBytes': 10485760,  # 10MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': str(BASE_DIR / 'logs' / 'error.log'),
            'maxBytes': 10485760,  # 10MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'security_file': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': str(BASE_DIR / 'logs' / 'security.log'),
            'maxBytes': 10485760,  # 10MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
            'filters': ['require_debug_false'],
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['error_file', 'mail_admins'],
            'level': 'ERROR',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['security_file'],
            'level': 'WARNING',
            'propagate': False,
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}

# Admin email notifications
ADMINS = [
    (name.split(':')[0], name.split(':')[1])
    for name in os.environ.get('ADMINS', '').split(',')
    if ':' in name
]
MANAGERS = ADMINS

# ============================================================================
# REST FRAMEWORK - API Configuration
# ============================================================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': int(os.environ.get('REST_FRAMEWORK_PAGE_SIZE', '20')),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.ScopedRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': os.environ.get('REST_FRAMEWORK_THROTTLE_RATE_ANON', '100/hour'),
        'user': os.environ.get('REST_FRAMEWORK_THROTTLE_RATE_USER', '1000/hour'),
        'login': '5/minute',
        'signup': '3/hour',
    },
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
    'DEFAULT_CONTENT_NEGOTIATION_CLASS': 'rest_framework.negotiation.DefaultContentNegotiation',
}

# ============================================================================
# DRF SPECTACULAR - API Documentation
# ============================================================================

SPECTACULAR_SETTINGS = {
    'TITLE': 'EduCore Ultra API',
    'DESCRIPTION': 'AI-Powered School Management System API',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/',
    'SERVE_PERMISSIONS': ['rest_framework.permissions.IsAdminUser'],
    'SERVERS': [
        {'url': 'https://yourdomain.com', 'description': 'Production server'},
    ],
}

# ============================================================================
# SENTRY - Error Tracking & Monitoring
# ============================================================================

SENTRY_DSN = os.environ.get('SENTRY_DSN')
if SENTRY_DSN and SENTRY_DSN.startswith('http') and 'CHANGE_ME' not in SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.redis import RedisIntegration
    from sentry_sdk.integrations.celery import CeleryIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(),
            RedisIntegration(),
            CeleryIntegration(),
        ],
        traces_sample_rate=float(os.environ.get('SENTRY_TRACES_SAMPLE_RATE', '0.1')),
        send_default_pii=False,
        environment=os.environ.get('SENTRY_ENVIRONMENT', 'production'),
        release=os.environ.get('SENTRY_RELEASE', '1.0.0'),
        before_send=lambda event, hint: event if event.get('level') != 'info' else None,
    )

# ============================================================================
# PERFORMANCE OPTIMIZATION
# ============================================================================

# Persistent database connections
CONN_MAX_AGE = 600

# Template caching
TEMPLATES[0]['APP_DIRS'] = False  # Must be False when using custom loaders
TEMPLATES[0]['OPTIONS']['loaders'] = [
    ('django.template.loaders.cached.Loader', [
        'django.template.loaders.filesystem.Loader',
        'django.template.loaders.app_directories.Loader',
    ]),
]

# ============================================================================
# MONITORING & HEALTH CHECKS
# ============================================================================

# Custom settings for monitoring
HEALTH_CHECK_ENABLED = os.environ.get('HEALTH_CHECK_ENABLED', 'True').lower() == 'true'

# ============================================================================
# BACKUP SETTINGS
# ============================================================================

BACKUP_DIR = str(BASE_DIR / 'backups')
Path(BACKUP_DIR).mkdir(exist_ok=True)

# ============================================================================
# FRONTEND CONFIGURATION
# ============================================================================

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://yourdomain.com')
