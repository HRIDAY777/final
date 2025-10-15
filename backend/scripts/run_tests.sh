#!/bin/bash

# =================================================================
# Test Runner Script for EduCore Ultra Backend
# =================================================================

set -e  # Exit on error

echo "=========================================="
echo "Running EduCore Ultra Tests"
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

# Set test environment
export DJANGO_SETTINGS_MODULE=core.settings.dev
export DEBUG=True

# Run linting
echo -e "\n${YELLOW}Running code linting...${NC}"
flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics || true
black --check . || true

# Run tests with coverage
echo -e "\n${YELLOW}Running tests with coverage...${NC}"
coverage run --source='.' manage.py test
coverage report -m
coverage html

# Run pytest
echo -e "\n${YELLOW}Running pytest...${NC}"
pytest -v --tb=short

# Check migrations
echo -e "\n${YELLOW}Checking for missing migrations...${NC}"
python manage.py makemigrations --check --dry-run

# System checks
echo -e "\n${YELLOW}Running system checks...${NC}"
python manage.py check

echo -e "\n${GREEN}All tests passed!${NC}"
echo "Coverage report available at: htmlcov/index.html"

