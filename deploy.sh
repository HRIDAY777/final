#!/bin/bash

# EduCore Ultra Complete Deployment Script
# This script deploys both frontend and backend with all services

set -e  # Exit on any error

echo "🚀 Starting EduCore Ultra Complete Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    echo "📋 Loading environment variables..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  No .env file found. Creating from example..."
    if [ -f env.example ]; then
        cp env.example .env
        echo "📋 Please update .env file with your actual values before continuing."
        echo "Press Enter to continue or Ctrl+C to exit and update .env file..."
        read
    else
        echo "❌ No .env or env.example file found. Please create .env file first."
        exit 1
    fi
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p nginx/ssl
mkdir -p monitoring
mkdir -p backend/staticfiles
mkdir -p backend/media
mkdir -p frontend/dist

# Generate SSL certificates (self-signed for initial setup)
if [ ! -f nginx/ssl/cert.pem ]; then
    echo "🔐 Generating self-signed SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=EduCore/CN=localhost"
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# Build and start all services
echo "🐳 Building and starting all services..."
docker-compose build --no-cache
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 30

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec -T backend python manage.py migrate

# Create superuser if it doesn't exist
echo "👤 Creating superuser..."
docker-compose exec -T backend python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@educore.com', 'admin123')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
EOF

# Collect static files
echo "📦 Collecting static files..."
docker-compose exec -T backend python manage.py collectstatic --noinput

# Create initial data
echo "📊 Creating initial data..."
docker-compose exec -T backend python manage.py shell << EOF
# Create initial academic years
from apps.academic_years.models import AcademicYear
if not AcademicYear.objects.exists():
    AcademicYear.objects.create(
        name="2024-2025",
        start_date="2024-09-01",
        end_date="2025-06-30",
        is_active=True
    )
    print('Academic year created')

# Create initial subjects
from apps.subjects.models import Subject
subjects = [
    "Mathematics", "Science", "English", "History", "Geography",
    "Physics", "Chemistry", "Biology", "Computer Science", "Art"
]
for subject_name in subjects:
    Subject.objects.get_or_create(name=subject_name)
print('Subjects created')

# Create initial classes
from apps.classes.models import Class
classes = [
    {"name": "Class 1", "grade": 1},
    {"name": "Class 2", "grade": 2},
    {"name": "Class 3", "grade": 3},
    {"name": "Class 4", "grade": 4},
    {"name": "Class 5", "grade": 5},
    {"name": "Class 6", "grade": 6},
    {"name": "Class 7", "grade": 7},
    {"name": "Class 8", "grade": 8},
    {"name": "Class 9", "grade": 9},
    {"name": "Class 10", "grade": 10},
]
for class_data in classes:
    Class.objects.get_or_create(
        name=class_data["name"],
        grade=class_data["grade"]
    )
print('Classes created')
EOF

# Health check
echo "🏥 Performing health checks..."
sleep 10

# Check backend health
if curl -f http://localhost:8000/health/; then
    echo "✅ Backend health check passed!"
else
    echo "❌ Backend health check failed!"
    exit 1
fi

# Check frontend health
if curl -f http://localhost:3000/health; then
    echo "✅ Frontend health check passed!"
else
    echo "❌ Frontend health check failed!"
    exit 1
fi

# Check main nginx
if curl -f http://localhost/health/; then
    echo "✅ Main nginx health check passed!"
else
    echo "❌ Main nginx health check failed!"
    exit 1
fi

# Display access information
echo ""
echo "🎉 EduCore Ultra Deployment Complete!"
echo "======================================"
echo "🌐 Main Application: http://localhost"
echo "🎨 Frontend Only: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "🔐 Admin Panel: http://localhost/admin"
echo "📊 API Documentation: http://localhost:8000/api/docs/"
echo "📈 Grafana Dashboard: http://localhost:3001"
echo "📊 Prometheus: http://localhost:9090"
echo ""
echo "👤 Admin Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📋 Next Steps:"
echo "1. Update SSL certificates with real ones"
echo "2. Configure domain name in nginx/nginx.conf"
echo "3. Set up proper environment variables in .env"
echo "4. Configure backup strategy"
echo "5. Set up monitoring alerts"
echo "6. Update API keys and email settings"
echo ""
echo "🔧 Useful Commands:"
echo "   View logs: docker-compose logs -f"
echo "   View specific service logs: docker-compose logs -f [service_name]"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Update services: docker-compose pull && docker-compose up -d"
echo ""
echo "🚀 EduCore Ultra is now running in production!"
