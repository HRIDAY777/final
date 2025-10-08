#!/bin/bash

# EduCore Ultra Production Deployment Script
# Usage: ./scripts/deploy.sh [production|staging]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if environment is provided
if [ $# -eq 0 ]; then
    print_error "Please specify environment: production or staging"
    echo "Usage: $0 [production|staging]"
    exit 1
fi

ENVIRONMENT=$1

if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
    print_error "Invalid environment. Use 'production' or 'staging'"
    exit 1
fi

print_status "Starting deployment for $ENVIRONMENT environment..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if environment file exists
if [ ! -f "env.prod" ]; then
    print_error "Production environment file 'env.prod' not found."
    print_warning "Please create env.prod file with proper configuration."
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p nginx/ssl
mkdir -p monitoring

# Set proper permissions
print_status "Setting proper permissions..."
chmod 600 env.prod
chmod +x scripts/deploy.sh

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Remove old images (optional)
read -p "Do you want to remove old images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Removing old images..."
    docker system prune -f
fi

# Build and start services
print_status "Building and starting services..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
print_status "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."
docker-compose -f docker-compose.prod.yml ps

# Run database migrations
print_status "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Collect static files
print_status "Collecting static files..."
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

# Create superuser if needed
read -p "Do you want to create a superuser? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Creating superuser..."
    docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
fi

# Check if all services are running
print_status "Checking if all services are running..."
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_status "All services are running successfully!"
else
    print_error "Some services failed to start. Check logs:"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

# Show service URLs
print_status "Service URLs:"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "Admin Panel: http://localhost:8000/admin/"
echo "API Documentation: http://localhost:8000/api/docs/"
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3001"

print_status "Deployment completed successfully!"
print_warning "Don't forget to:"
echo "1. Update your domain DNS settings"
echo "2. Configure SSL certificates in nginx/ssl/"
echo "3. Update environment variables in env.prod"
echo "4. Set up monitoring alerts"
echo "5. Configure backup strategy"

print_status "Deployment script completed!"
