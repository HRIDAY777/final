#!/bin/bash

# =================================================================
# Celery Worker Startup Script for EduCore Ultra Backend
# =================================================================

set -e  # Exit on error

echo "=========================================="
echo "Starting EduCore Ultra Celery Worker"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo -e "${YELLOW}Activating virtual environment...${NC}"
    source venv/bin/activate
fi

# Set environment
export DJANGO_SETTINGS_MODULE=core.settings.prod

# Create logs directory
mkdir -p logs

# Start Celery worker
echo -e "\n${GREEN}Starting Celery worker...${NC}"
celery -A core worker \
    --loglevel=${CELERY_LOG_LEVEL:-info} \
    --logfile=logs/celery.log \
    --concurrency=${CELERY_CONCURRENCY:-4} \
    --max-tasks-per-child=${CELERY_MAX_TASKS_PER_CHILD:-1000} \
    --time-limit=${CELERY_TIME_LIMIT:-1800} \
    --soft-time-limit=${CELERY_SOFT_TIME_LIMIT:-1500}

echo -e "\n${GREEN}Celery worker started successfully!${NC}"

