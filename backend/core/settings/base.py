import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
SECRET_KEY = os.environ.get(
    'SECRET_KEY', 'dev-secret-key-for-development-only'
)
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '*']

INSTALLED_APPS = [
    # Django
    'django.contrib.admin', 'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions', 'django.contrib.messages',
    'django.contrib.staticfiles', 'django.contrib.sites',
    # 3rd party
    'rest_framework', 'rest_framework_simplejwt',
    'corsheaders',
    'django_filters', 'drf_spectacular',
    'django_otp', 'django_otp.plugins.otp_totp',
    'django_otp.plugins.otp_static',
    'allauth', 'allauth.account', 'allauth.socialaccount',
    'channels', 'django_extensions', 'sslserver',
    # local
    'apps.accounts',
    'apps.teachers',
    'apps.students',
    'apps.guardians',
    'apps.classes',
    'apps.assignments',
    'apps.attendance',
    'apps.exams',
    'apps.library',
    'apps.analytics',
    'apps.ai_tools',
    'apps.ecommerce',
    'apps.events',
    'apps.notices',
    'apps.elearning',
    'apps.hr',
    'apps.inventory',
    'apps.settings',
    'apps.timetable',
    'apps.transport',
    'apps.hostel',
    'apps.reports',
    'apps.billing',

    'apps.academics',
    'apps.subjects',
    'apps.academic_years',
    'apps.tenants',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django_otp.middleware.OTPMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    # Custom middleware
    'core.middleware.RequestIDMiddleware',
    'core.middleware.RequestLoggingMiddleware',
    'core.middleware.PerformanceMonitoringMiddleware',
    'core.middleware.SecurityMiddleware',
    'core.middleware.TenantMiddleware',
    'core.middleware.UserActivityMiddleware',
    'core.middleware.CacheControlMiddleware',
    'core.middleware.ErrorHandlingMiddleware',
]

ROOT_URLCONF = 'core.urls'
TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [BASE_DIR / 'templates'],
    'APP_DIRS': True,
    'OPTIONS': {'context_processors': [
        'django.template.context_processors.debug',
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages'
    ]},
}]
WSGI_APPLICATION = 'core.wsgi.application'
ASGI_APPLICATION = 'core.asgi.application'

# Database
# Default to SQLite for development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3'
    }
}

# Use PostgreSQL when environment variables are explicitly set
if os.environ.get('DB_HOST') and os.environ.get('DB_NAME'):
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'educore_ultra'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'postgres'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': (
            'django.contrib.auth.password_validation.'
            'UserAttributeSimilarityValidator'
        )
    },
    {
        'NAME': (
            'django.contrib.auth.password_validation.'
            'MinimumLengthValidator'
        )
    },
    {
        'NAME': (
            'django.contrib.auth.password_validation.'
            'CommonPasswordValidator'
        )
    },
    {
        'NAME': (
            'django.contrib.auth.password_validation.'
            'NumericPasswordValidator'
        )
    }
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = '/static/'
# STATICFILES_DIRS = [BASE_DIR / 'static']  # Commented out - directory removed
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    # For demo, allow read-only to unauthenticated users; secure in production
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

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',)
}

"""
In demo mode we allow all origins so the frontend can connect from any
dev port or LAN IP.
Tighten this in production.
"""
CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000", "http://127.0.0.1:3000",
    "https://127.0.0.1:8443", "https://localhost:8443",
    "https://127.0.0.1", "https://localhost"
]
CORS_ALLOW_CREDENTIALS = True

AUTH_USER_MODEL = 'accounts.User'
SITE_ID = 1

# Multi-tenant settings (disabled for development)
# TENANT_MODEL = 'tenants.Tenant'
# DATABASE_ROUTERS = (
#     'django_tenants.routers.TenantSyncRouter',
# )
# MIDDLEWARE = [
#     'django_tenants.middleware.main.TenantMainMiddleware',
# ] + MIDDLEWARE

SPECTACULAR_SETTINGS = {
    'TITLE': 'EduCore Ultra API',
    'DESCRIPTION': (
        'AI-Powered School Management System API'
    ),
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False
}

# Channels
USE_REDIS = os.environ.get("USE_REDIS", "False").lower() == "true"
if USE_REDIS:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {
                "hosts": [
                    (os.environ.get("REDIS_HOST", "redis"),
                     int(os.environ.get("REDIS_PORT", "6379")))
                ]
            }
        }
    }
else:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer"
        }
    }

# Security (prod toggled)
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = True
