#!/bin/bash

# ============================================================================
# EduCore Ultra - Stop All Services Script
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Stopping EduCore Ultra services...${NC}"
echo ""

# Stop Backend
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID
        echo -e "${GREEN}✓ Backend stopped (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${YELLOW}⚠ Backend process not found${NC}"
    fi
    rm logs/backend.pid
else
    echo -e "${YELLOW}⚠ Backend PID file not found${NC}"
fi

# Stop Frontend
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID
        echo -e "${GREEN}✓ Frontend stopped (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${YELLOW}⚠ Frontend process not found${NC}"
    fi
    rm logs/frontend.pid
else
    echo -e "${YELLOW}⚠ Frontend PID file not found${NC}"
fi

echo ""
echo -e "${GREEN}All services stopped${NC}"

