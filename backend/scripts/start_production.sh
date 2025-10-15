#!/bin/bash

# =================================================================
# Production Startup Script for EduCore Ultra Backend
# =================================================================

set -e  # Exit on error

echo "=========================================="
echo "Starting EduCore Ultra Production Server"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo -e "${YELLOW}Warning: Virtual environment not activated${NC}"
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Set environment
export DJANGO_SETTINGS_MODULE=core.settings.prod

# Check environment variables
echo -e "\n${YELLOW}Checking environment variables...${NC}"
if [ -z "$SECRET_KEY" ]; then
    echo -e "${RED}ERROR: SECRET_KEY not set${NC}"
    exit 1
fi

if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo -e "${YELLOW}Warning: Database credentials not fully configured${NC}"
fi

# Run system checks
echo -e "\n${YELLOW}Running system checks...${NC}"
python manage.py check --deploy

# Run migrations
echo -e "\n${YELLOW}Running database migrations...${NC}"
python manage.py migrate --noinput

# Collect static files
echo -e "\n${YELLOW}Collecting static files...${NC}"
python manage.py collectstatic --noinput --clear

# Create superuser if needed
if [ ! -z "$DJANGO_SUPERUSER_EMAIL" ] && [ ! -z "$DJANGO_SUPERUSER_PASSWORD" ]; then
    echo -e "\n${YELLOW}Creating superuser...${NC}"
    python manage.py create_superuser_auto || true
fi

# Check health
echo -e "\n${YELLOW}Checking system health...${NC}"
python manage.py check_system

# Start Gunicorn
echo -e "\n${GREEN}Starting Gunicorn server...${NC}"
gunicorn core.wsgi:application \
    --workers ${GUNICORN_WORKERS:-4} \
    --threads ${GUNICORN_THREADS:-2} \
    --worker-class ${GUNICORN_WORKER_CLASS:-gthread} \
    --worker-tmp-dir /dev/shm \
    --bind ${GUNICORN_BIND:-0.0.0.0:8000} \
    --access-logfile logs/gunicorn-access.log \
    --error-logfile logs/gunicorn-error.log \
    --log-level ${GUNICORN_LOG_LEVEL:-info} \
    --timeout ${GUNICORN_TIMEOUT:-120} \
    --graceful-timeout ${GUNICORN_GRACEFUL_TIMEOUT:-30} \
    --keep-alive ${GUNICORN_KEEP_ALIVE:-5} \
    --max-requests ${GUNICORN_MAX_REQUESTS:-1000} \
    --max-requests-jitter ${GUNICORN_MAX_REQUESTS_JITTER:-50}

echo -e "\n${GREEN}Production server started successfully!${NC}"

