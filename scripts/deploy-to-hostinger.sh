#!/bin/bash

# EduCore Ultra - Hostinger VPS Deployment Script
# This script deploys the application to Hostinger VPS

set -e  # Exit on any error

echo "🚀 Starting EduCore Ultra Deployment to Hostinger VPS..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Configuration
APP_DIR="/var/www/educore-ultra"
BACKUP_DIR="/var/backups/educore"
LOG_DIR="/var/log/educore"

# Check if running as correct user
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check if application directory exists
if [ ! -d "$APP_DIR" ]; then
    print_error "Application directory $APP_DIR does not exist. Run setup-hostinger-vps.sh first."
    exit 1
fi

print_header "Pre-Deployment Checks"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed."
    exit 1
fi

# Check if environment file exists
if [ ! -f "$APP_DIR/env.production" ]; then
    print_error "Production environment file not found. Please create env.production first."
    exit 1
fi

print_header "Creating Backup"
print_status "Creating backup before deployment..."

# Create backup directory if it doesn't exist
sudo mkdir -p $BACKUP_DIR
sudo chown $USER:$USER $BACKUP_DIR

# Create backup
if [ -d "$APP_DIR" ]; then
    BACKUP_FILE="educore_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    print_status "Creating backup: $BACKUP_FILE"
    cd $APP_DIR
    tar -czf $BACKUP_DIR/$BACKUP_FILE \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=dist \
        --exclude=__pycache__ \
        --exclude=*.log \
        .
    print_status "Backup created: $BACKUP_DIR/$BACKUP_FILE"
fi

print_header "Stopping Services"
print_status "Stopping existing services..."

# Stop the application
cd $APP_DIR
if [ -f "docker-compose.prod.yml" ]; then
    docker-compose -f docker-compose.prod.yml down || true
fi

# Stop systemd service
sudo systemctl stop educore-ultra || true

print_header "Deploying Application"

# Copy environment file
print_status "Setting up environment configuration..."
if [ -f "env.production" ]; then
    cp env.production .env
    print_status "Environment file configured"
else
    print_error "env.production file not found!"
    exit 1
fi

# Build and start services
print_status "Building and starting Docker containers..."

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Build application
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
docker-compose -f docker-compose.prod.yml up -d

print_header "Database Setup"
print_status "Setting up database..."

# Wait for database to be ready
print_status "Waiting for database to be ready..."
sleep 30

# Run database migrations
print_status "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py migrate

# Create superuser (if needed)
print_status "Creating superuser..."
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@yourdomain.com', 'CHANGE_ME_ADMIN_PASSWORD')
    print('Superuser created')
else:
    print('Superuser already exists')
EOF

# Collect static files
print_status "Collecting static files..."
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput

print_header "Starting Services"
print_status "Starting systemd service..."
sudo systemctl start educore-ultra
sudo systemctl enable educore-ultra

# Restart Nginx
print_status "Restarting Nginx..."
sudo systemctl restart nginx

print_header "Health Checks"
print_status "Performing health checks..."

# Wait for services to start
sleep 30

# Check if services are running
services=("nginx" "postgresql" "redis-server" "educore-ultra")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        print_status "$service: ✅ Running"
    else
        print_error "$service: ❌ Failed to start"
    fi
done

# Check Docker containers
print_status "Checking Docker containers..."
docker-compose -f docker-compose.prod.yml ps

# Test application endpoints
print_status "Testing application endpoints..."

# Test health endpoint
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_status "Health endpoint: ✅ OK"
else
    print_warning "Health endpoint: ⚠️ Not responding"
fi

# Test API endpoint
if curl -f http://localhost/api/ > /dev/null 2>&1; then
    print_status "API endpoint: ✅ OK"
else
    print_warning "API endpoint: ⚠️ Not responding"
fi

print_header "Deployment Complete!"
print_status "EduCore Ultra has been deployed successfully! 🎉"

echo ""
print_status "Application URLs:"
echo "  🌐 Frontend: https://yourdomain.com"
echo "  🔧 API: https://yourdomain.com/api/"
echo "  📊 Admin: https://yourdomain.com/admin/"
echo "  📈 Monitoring: https://yourdomain.com:3001/ (Grafana)"
echo "  📊 Metrics: https://yourdomain.com:9090/ (Prometheus)"

echo ""
print_status "Useful Commands:"
echo "  📋 View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  🔄 Restart: sudo systemctl restart educore-ultra"
echo "  📊 Status: sudo systemctl status educore-ultra"
echo "  🛑 Stop: sudo systemctl stop educore-ultra"

echo ""
print_warning "Important Next Steps:"
echo "  1. Update your domain DNS to point to this server"
echo "  2. Run SSL setup: sudo /usr/local/bin/setup-ssl.sh yourdomain.com your@email.com"
echo "  3. Update all passwords in the admin panel"
echo "  4. Configure your email settings"
echo "  5. Set up monitoring alerts"

echo ""
print_status "Deployment completed successfully! 🚀"

