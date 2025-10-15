#!/bin/bash

# ============================================================================
# EduCore Ultra - Complete Startup Script (Linux/Mac)
# ============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "Starting EduCore Ultra"
echo "========================================"
echo ""

echo -e "${BLUE}Checking prerequisites...${NC}"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python found: $(python3 --version)${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm found: $(npm --version)${NC}"

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Starting Backend (Django)...${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Create backend logs directory
mkdir -p logs

# Start Backend in background
cd backend

# Setup virtual environment
if [ ! -d "venv" ]; then
    echo -e "${BLUE}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
pip install -q -r requirements.txt

# Run migrations
echo -e "${BLUE}Running migrations...${NC}"
python manage.py migrate

# Start Django server in background
echo -e "${GREEN}Starting Django server...${NC}"
python manage.py runserver > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid

cd ..

echo -e "${GREEN}✓ Backend started on http://localhost:8000 (PID: $BACKEND_PID)${NC}"
echo ""

# Wait for backend to start
sleep 5

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Starting Frontend (React + Vite)...${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Start Frontend in background
cd frontend

# Install dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
npm install --silent

# Start Vite dev server in background
echo -e "${GREEN}Starting Vite dev server...${NC}"
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid

cd ..

echo -e "${GREEN}✓ Frontend started on http://localhost:3000 (PID: $FRONTEND_PID)${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}EduCore Ultra is running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Services:${NC}"
echo "  - Backend:  http://localhost:8000"
echo "  - Frontend: http://localhost:3000"
echo "  - API Docs: http://localhost:8000/api/docs/"
echo ""
echo -e "${BLUE}Process IDs:${NC}"
echo "  - Backend:  $BACKEND_PID"
echo "  - Frontend: $FRONTEND_PID"
echo ""
echo -e "${YELLOW}To stop services, run: ./STOP_ALL.sh${NC}"
echo -e "${YELLOW}Or use: kill $BACKEND_PID $FRONTEND_PID${NC}"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo "  - Backend:  tail -f logs/backend.log"
echo "  - Frontend: tail -f logs/frontend.log"
echo ""

