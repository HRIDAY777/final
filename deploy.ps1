# EduCore Ultra Windows Deployment Script
# This script deploys both frontend and backend with all services on Windows

param(
    [switch]$SkipEnvCheck,
    [switch]$SkipSSL,
    [switch]$Force
)

Write-Host "🚀 Starting EduCore Ultra Windows Deployment..." -ForegroundColor Green

# Check if Docker is installed and running
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Docker is running
try {
    docker version | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

# Load environment variables
if (Test-Path ".env") {
    Write-Host "📋 Loading environment variables..." -ForegroundColor Yellow
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
} else {
    Write-Host "⚠️  No .env file found. Creating from example..." -ForegroundColor Yellow
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "📋 Please update .env file with your actual values before continuing." -ForegroundColor Yellow
        if (-not $SkipEnvCheck) {
            Write-Host "Press Enter to continue or Ctrl+C to exit and update .env file..." -ForegroundColor Yellow
            Read-Host
        }
    } else {
        Write-Host "❌ No .env or env.example file found. Please create .env file first." -ForegroundColor Red
        exit 1
    }
}

# Create necessary directories
Write-Host "📁 Creating necessary directories..." -ForegroundColor Yellow
$directories = @(
    "logs",
    "nginx/ssl",
    "monitoring",
    "backend/staticfiles",
    "backend/media",
    "frontend/dist"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# Generate SSL certificates (self-signed for initial setup)
if (-not $SkipSSL) {
    if (-not (Test-Path "nginx/ssl/cert.pem")) {
        Write-Host "🔐 Generating self-signed SSL certificates..." -ForegroundColor Yellow
        try {
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
                -keyout nginx/ssl/key.pem `
                -out nginx/ssl/cert.pem `
                -subj "/C=US/ST=State/L=City/O=EduCore/CN=localhost"
        } catch {
            Write-Host "⚠️  OpenSSL not found. SSL certificates will not be generated." -ForegroundColor Yellow
            Write-Host "   You can generate them manually or use the deployment without SSL." -ForegroundColor Yellow
        }
    }
}

# Stop any existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down --remove-orphans

# Build and start all services
Write-Host "🐳 Building and starting all services..." -ForegroundColor Yellow
if ($Force) {
    docker-compose build --no-cache
} else {
    docker-compose build
}
docker-compose up -d

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Run database migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
docker-compose exec -T backend python manage.py migrate

# Create superuser if it doesn't exist
Write-Host "👤 Creating superuser..." -ForegroundColor Yellow
docker-compose exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@educore.com', 'admin123')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
"

# Collect static files
Write-Host "📦 Collecting static files..." -ForegroundColor Yellow
docker-compose exec -T backend python manage.py collectstatic --noinput

# Create initial data
Write-Host "📊 Creating initial data..." -ForegroundColor Yellow
docker-compose exec -T backend python manage.py shell -c "
# Create initial academic years
from apps.academic_years.models import AcademicYear
if not AcademicYear.objects.exists():
    AcademicYear.objects.create(
        name='2024-2025',
        start_date='2024-09-01',
        end_date='2025-06-30',
        is_active=True
    )
    print('Academic year created')

# Create initial subjects
from apps.subjects.models import Subject
subjects = [
    'Mathematics', 'Science', 'English', 'History', 'Geography',
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art'
]
for subject_name in subjects:
    Subject.objects.get_or_create(name=subject_name)
print('Subjects created')

# Create initial classes
from apps.classes.models import Class
classes = [
    {'name': 'Class 1', 'grade': 1},
    {'name': 'Class 2', 'grade': 2},
    {'name': 'Class 3', 'grade': 3},
    {'name': 'Class 4', 'grade': 4},
    {'name': 'Class 5', 'grade': 5},
    {'name': 'Class 6', 'grade': 6},
    {'name': 'Class 7', 'grade': 7},
    {'name': 'Class 8', 'grade': 8},
    {'name': 'Class 9', 'grade': 9},
    {'name': 'Class 10', 'grade': 10},
]
for class_data in classes:
    Class.objects.get_or_create(
        name=class_data['name'],
        grade=class_data['grade']
    )
print('Classes created')
"

# Health check
Write-Host "🏥 Performing health checks..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check backend health
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health/" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend health check passed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend health check failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Backend health check failed!" -ForegroundColor Red
    exit 1
}

# Check frontend health
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend health check passed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend health check failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Frontend health check failed!" -ForegroundColor Red
    exit 1
}

# Check main nginx
try {
    $response = Invoke-WebRequest -Uri "http://localhost/health/" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Main nginx health check passed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Main nginx health check failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Main nginx health check failed!" -ForegroundColor Red
    exit 1
}

# Display access information
Write-Host ""
Write-Host "🎉 EduCore Ultra Deployment Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "🌐 Main Application: http://localhost" -ForegroundColor Cyan
Write-Host "🎨 Frontend Only: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "🔐 Admin Panel: http://localhost/admin" -ForegroundColor Cyan
Write-Host "📊 API Documentation: http://localhost:8000/api/docs/" -ForegroundColor Cyan
Write-Host "📈 Grafana Dashboard: http://localhost:3001" -ForegroundColor Cyan
Write-Host "📊 Prometheus: http://localhost:9090" -ForegroundColor Cyan
Write-Host ""
Write-Host "👤 Admin Credentials:" -ForegroundColor Yellow
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update SSL certificates with real ones" -ForegroundColor White
Write-Host "2. Configure domain name in nginx/nginx.conf" -ForegroundColor White
Write-Host "3. Set up proper environment variables in .env" -ForegroundColor White
Write-Host "4. Configure backup strategy" -ForegroundColor White
Write-Host "5. Set up monitoring alerts" -ForegroundColor White
Write-Host "6. Update API keys and email settings" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Useful Commands:" -ForegroundColor Yellow
Write-Host "   View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   View specific service logs: docker-compose logs -f [service_name]" -ForegroundColor White
Write-Host "   Stop services: docker-compose down" -ForegroundColor White
Write-Host "   Restart services: docker-compose restart" -ForegroundColor White
Write-Host "   Update services: docker-compose pull && docker-compose up -d" -ForegroundColor White
Write-Host ""
Write-Host "🚀 EduCore Ultra is now running in production!" -ForegroundColor Green

