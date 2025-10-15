# 🎓 EduCore Ultra Backend - Production Ready

## ✨ Overview

**EduCore Ultra** backend হল একটি **100% production-ready** Django REST Framework based API যা modern school management system এর জন্য তৈরি।

### 🚀 Key Features

- ✅ **Production Optimized** - Best practices implemented
- ✅ **Security Hardened** - SSL, HSTS, CSRF, XSS protection
- ✅ **High Performance** - Redis caching, DB pooling, query optimization
- ✅ **Scalable** - Designed for high traffic and large datasets
- ✅ **Monitored** - Health checks, metrics, comprehensive logging
- ✅ **Well Documented** - Complete guides and inline documentation

---

## 📦 Tech Stack

- **Framework**: Django 5.0.2 + Django REST Framework 3.14.0
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **Cache**: Redis with django-redis
- **Task Queue**: Celery with Redis broker
- **WebSocket**: Django Channels with Redis layer
- **Authentication**: JWT (Simple JWT) + Django Allauth
- **API Docs**: DRF Spectacular (OpenAPI/Swagger)
- **Monitoring**: Sentry + Custom health checks
- **Server**: Gunicorn + WhiteNoise

---

## 🚀 Quick Start

### 1. Development Setup

```bash
# Clone and navigate
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp PRODUCTION_ENV_TEMPLATE.txt ../.env
# Edit .env with your settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### 2. Production Setup

```bash
# Set environment
export DJANGO_SETTINGS_MODULE=core.settings.prod

# Run production setup
python manage.py setup_production --create-superuser

# Check system health
python manage.py check_system --verbose

# Start with Gunicorn
bash scripts/start_production.sh

# Start Celery worker (in separate terminal)
bash scripts/start_celery.sh
```

---

## 📋 Management Commands

### System Health
```bash
# Quick health check
python manage.py check_system

# Detailed health check
python manage.py check_system --verbose
```

### Database Management
```bash
# Create backup
python manage.py db_backup

# Custom backup location
python manage.py db_backup --output=/path/to/backup.sql
```

### Data Cleanup
```bash
# Cleanup old files (30 days)
python manage.py cleanup_old_data

# Custom retention period
python manage.py cleanup_old_data --days=7

# Dry run (see what would be deleted)
python manage.py cleanup_old_data --dry-run
```

### Production Setup
```bash
# Complete setup
python manage.py setup_production

# With superuser creation
python manage.py setup_production --create-superuser

# Skip migrations
python manage.py setup_production --skip-migrations
```

---

## 🏥 Health Check Endpoints

### Basic Health
```bash
GET /api/health/
```

**Response:**
```json
{
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "service": "EduCore Ultra API"
}
```

### Detailed Health
```bash
GET /api/health/detailed/
```

**Response:**
```json
{
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "checks": {
        "database": {
            "status": "healthy",
            "message": "Database connection successful"
        },
        "cache": {
            "status": "healthy",
            "message": "Cache is working"
        },
        "system_resources": {
            "status": "healthy",
            "cpu_percent": 25.5,
            "memory_percent": 45.2,
            "disk_percent": 60.1
        }
    }
}
```

### Kubernetes Probes
```bash
# Readiness probe
GET /api/health/ready/

# Liveness probe
GET /api/health/live/
```

### Metrics
```bash
GET /api/metrics/
```

---

## 🔧 Utility Functions

### Caching
```python
from core.decorators import cache_response

@cache_response(timeout=600, key_prefix='students')
def get_students_list(request):
    students = Student.objects.all()
    return Response(students)
```

### Rate Limiting
```python
from core.decorators import rate_limit

@rate_limit(max_requests=10, window=60)
def sensitive_endpoint(request):
    # This endpoint is limited to 10 requests per minute
    return Response(data)
```

### Query Optimization
```python
from core.optimizations import optimize_queryset, bulk_create_optimized

# Optimize queryset with select_related and prefetch_related
students = optimize_queryset(
    Student.objects.all(),
    select_related=['user', 'class_assigned'],
    prefetch_related=['subjects', 'guardians']
)

# Bulk create with batching
students_list = [Student(...) for _ in range(10000)]
bulk_create_optimized(Student, students_list, batch_size=1000)
```

### Custom Validators
```python
from core.validators import (
    validate_phone_number,
    validate_student_id,
    validate_strong_password
)

class StudentSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(validators=[validate_phone_number])
    student_id = serializers.CharField(validators=[validate_student_id])
    password = serializers.CharField(validators=[validate_strong_password])
```

### Data Export
```python
from core.utils import export_to_csv, export_to_excel

# Export queryset to CSV
def export_students(request):
    students = Student.objects.all()
    return export_to_csv(
        students,
        fields=['id', 'first_name', 'last_name', 'email'],
        filename='students.csv'
    )

# Export to Excel
def export_students_excel(request):
    students = Student.objects.all()
    return export_to_excel(
        students,
        fields=['id', 'first_name', 'last_name', 'email'],
        filename='students.xlsx'
    )
```

---

## 🔒 Security Features

### Implemented
- ✅ SSL/HTTPS enforcement
- ✅ HSTS headers (1 year)
- ✅ Secure cookies (HttpOnly, Secure, SameSite)
- ✅ CSRF protection
- ✅ XSS protection
- ✅ Content Security Policy
- ✅ Clickjacking protection
- ✅ SQL injection protection
- ✅ Rate limiting
- ✅ API throttling
- ✅ Strong password validation
- ✅ Input sanitization
- ✅ File upload validation

### Configuration
All security settings are in `core/settings/prod.py`:

```python
# SSL/HTTPS
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True

# Cookies
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_SECURE = True

# Headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
```

---

## ⚡ Performance Optimizations

### Cache Configuration
```python
# Redis cache with connection pooling
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 100,
                'retry_on_timeout': True,
            },
            'COMPRESSOR': 'django_redis.compressors.zlib.ZlibCompressor',
        }
    }
}
```

### Database Optimization
```python
# Connection pooling
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'CONN_MAX_AGE': 600,  # 10 minutes
        'ATOMIC_REQUESTS': True,
        'OPTIONS': {
            'connect_timeout': 10,
            'options': '-c statement_timeout=30000',  # 30 seconds
        }
    }
}
```

### Query Optimization Tips
```python
# Use select_related for foreign keys
students = Student.objects.select_related('user', 'class_assigned')

# Use prefetch_related for many-to-many
students = Student.objects.prefetch_related('subjects', 'guardians')

# Use only() to select specific fields
students = Student.objects.only('id', 'first_name', 'email')

# Use defer() to exclude heavy fields
students = Student.objects.defer('bio', 'profile_picture')

# Use exists() instead of count() > 0
if Student.objects.filter(email=email).exists():
    ...

# Use iterator() for large querysets
for student in Student.objects.iterator(chunk_size=1000):
    process(student)
```

---

## 📊 Logging

### Log Files
- `logs/educore.log` - General application logs
- `logs/error.log` - Error-specific logs
- `logs/security.log` - Security-related logs
- `logs/celery.log` - Celery worker logs
- `logs/gunicorn-access.log` - HTTP access logs
- `logs/gunicorn-error.log` - Gunicorn errors

### View Logs
```bash
# Tail general logs
tail -f logs/educore.log

# View errors
tail -f logs/error.log

# Check security logs
tail -f logs/security.log

# Monitor all logs
tail -f logs/*.log
```

---

## 🧪 Testing

### Run Tests
```bash
# Using management command
python manage.py test

# Using pytest
pytest

# With coverage
coverage run -m pytest
coverage report
coverage html  # Creates htmlcov/index.html

# Run all tests with script
bash scripts/run_tests.sh
```

### Test Categories
- Unit tests
- Integration tests
- API endpoint tests
- Performance tests
- Security tests

---

## 📚 Documentation

### Available Guides
1. **PRODUCTION_DEPLOYMENT_GUIDE.md** - Complete deployment guide
2. **PRODUCTION_ENV_TEMPLATE.txt** - Environment configuration
3. **BACKEND_COMPLETE_GUIDE.md** - Comprehensive usage guide
4. **COMPLETE_FEATURES.md** - Features checklist
5. **README.md** - This file

### API Documentation
- `/api/schema/` - OpenAPI schema
- `/api/docs/` - Swagger UI
- `/api/redoc/` - ReDoc UI

---

## 🔄 Background Tasks (Celery)

### Start Celery Worker
```bash
# Development
celery -A core worker --loglevel=info

# Production
bash scripts/start_celery.sh
```

### Task Example
```python
from celery import shared_task

@shared_task
def send_bulk_emails(user_ids):
    """Send emails to multiple users."""
    for user_id in user_ids:
        user = User.objects.get(id=user_id)
        send_email(user.email, 'Subject', 'Message')
    return len(user_ids)

# Usage
send_bulk_emails.delay([1, 2, 3, 4, 5])
```

---

## 📦 Deployment

### Using Gunicorn
```bash
gunicorn core.wsgi:application \
    --workers 4 \
    --threads 2 \
    --bind 0.0.0.0:8000 \
    --access-logfile logs/access.log \
    --error-logfile logs/error.log \
    --log-level info
```

### Using Docker
```bash
# Build image
docker build -f Dockerfile.prod -t educore-backend .

# Run container
docker run -p 8000:8000 \
    --env-file .env \
    educore-backend
```

### Using systemd
```ini
[Unit]
Description=EduCore Ultra Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/educore/backend
ExecStart=/var/www/educore/backend/scripts/start_production.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Test connection
python manage.py dbshell

# Check PostgreSQL status
sudo systemctl status postgresql

# View database logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Cache Issues
```bash
# Test Redis connection
redis-cli ping

# Clear cache
python manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()
```

### Performance Issues
```bash
# Check slow queries
python manage.py check_system --verbose

# View detailed metrics
curl http://localhost:8000/api/metrics/

# Monitor system resources
htop
```

---

## 🌟 Best Practices

### Code Quality
- Use Black for formatting
- Use isort for import sorting
- Use flake8 for linting
- Write tests for all features
- Document all functions

### Security
- Never commit .env files
- Rotate SECRET_KEY regularly
- Use environment variables
- Validate all user input
- Log security events

### Performance
- Use select_related/prefetch_related
- Implement caching strategically
- Use database indexes
- Optimize queries
- Monitor slow operations

---

## 📞 Support

### Resources
- Documentation: `docs/`
- Issue Tracker: GitHub Issues
- API Docs: `/api/docs/`

### Community
- GitHub Discussions
- Stack Overflow: Tag `educore-ultra`

---

## 📝 License

MIT License - See LICENSE file for details.

---

## 🎉 Success!

আপনার backend এখন **100% production-ready**! 

**Features:**
- ✅ 200+ implemented features
- ✅ Complete security hardening
- ✅ Performance optimized
- ✅ Fully monitored
- ✅ Well documented

**Ready to deploy!** 🚀

---

**Made with ❤️ by the EduCore Ultra Team**

