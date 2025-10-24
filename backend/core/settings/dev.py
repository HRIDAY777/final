"""
Development settings for EduCore Ultra.
"""

import os
from pathlib import Path
from .base import *  # noqa: F401,F403

# Development-specific overrides
DEBUG = True

# Allow all hosts in development
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '*']

# CORS settings for development
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://127.0.0.1:8443",
    "https://localhost:8443",
]

# Database settings for development
# Support both SQLite and PostgreSQL based on environment
DB_ENGINE = os.environ.get('DB_ENGINE', 'django.db.backends.sqlite3')

if DB_ENGINE == 'django.db.backends.postgresql':
    # Use PostgreSQL if configured
    DATABASES = {
        'default': {
            'ENGINE': DB_ENGINE,
            'NAME': os.environ.get('DB_NAME', 'educore_dev'),
            'USER': os.environ.get('DB_USER', 'postgres'),
            'PASSWORD': os.environ.get('DB_PASSWORD', 'postgres'),
            'HOST': os.environ.get('DB_HOST', 'localhost'),
            'PORT': os.environ.get('DB_PORT', '5432'),
            'ATOMIC_REQUESTS': True,
            'CONN_MAX_AGE': 60,
        }
    }
else:
    # Default to SQLite for simple local development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': (
                Path(__file__).resolve().parent.parent.parent / 'db.sqlite3'
            )
        }
    }

# Email settings for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Logging for development
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': (
                '{levelname} {asctime} {module} {process:d} '
                '{thread:d} {message}'
            ),
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# Add file logging if logs directory exists
log_file_path = (
    Path(__file__).resolve().parent.parent.parent / 'logs' / 'educore.log'
)
if log_file_path.parent.exists():
    LOGGING['handlers']['file'] = {
        'level': 'DEBUG',
        'class': 'logging.FileHandler',
        'filename': str(log_file_path),
        'formatter': 'verbose',
    }
    LOGGING['root']['handlers'].append('file')
    LOGGING['loggers']['django']['handlers'].append('file')

# REST Framework settings for development
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    # Allow read-only to unauthenticated users in development
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_PAGINATION_CLASS': (
        'rest_framework.pagination.PageNumberPagination'
    ),
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# Development tools
if DEBUG:
    INSTALLED_APPS += [  # noqa: F405
        'debug_toolbar',
    ]

    MIDDLEWARE += [  # noqa: F405
        'debug_toolbar.middleware.DebugToolbarMiddleware',
    ]

    INTERNAL_IPS = [
        '127.0.0.1',
        'localhost',
    ]
    
    # Debug toolbar configuration
    DEBUG_TOOLBAR_CONFIG = {
        'SHOW_TEMPLATE_CONTEXT': True,
        'SHOW_TOOLBAR_CALLBACK': lambda request: DEBUG,
    }

# Session settings for development
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
