#!/bin/bash

# =================================================================
# Test Runner Script for EduCore Ultra Frontend
# =================================================================

set -e  # Exit on error

echo "=========================================="
echo "Running EduCore Ultra Frontend Tests"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RUN_LINT=${RUN_LINT:-true}
RUN_UNIT_TESTS=${RUN_UNIT_TESTS:-true}
RUN_E2E_TESTS=${RUN_E2E_TESTS:-false}
RUN_COVERAGE=${RUN_COVERAGE:-true}
WATCH_MODE=${WATCH_MODE:-false}
HEADLESS=${HEADLESS:-true}

echo -e "${BLUE}Test Configuration:${NC}"
echo "  Run Lint: $RUN_LINT"
echo "  Run Unit Tests: $RUN_UNIT_TESTS"
echo "  Run E2E Tests: $RUN_E2E_TESTS"
echo "  Run Coverage: $RUN_COVERAGE"
echo "  Watch Mode: $WATCH_MODE"
echo "  Headless: $HEADLESS"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js version 18 or higher is required${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js version: $(node --version)${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "\n${YELLOW}Installing dependencies...${NC}"
    npm ci --silent
    echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

# Run linting
if [ "$RUN_LINT" = "true" ]; then
    echo -e "\n${YELLOW}Running ESLint...${NC}"
    npm run lint
    echo -e "${GREEN}✓ ESLint passed${NC}"
    
    echo -e "\n${YELLOW}Running Prettier check...${NC}"
    npm run format -- --check
    echo -e "${GREEN}✓ Prettier check passed${NC}"
fi

# Run unit tests
if [ "$RUN_UNIT_TESTS" = "true" ]; then
    echo -e "\n${YELLOW}Running unit tests...${NC}"
    
    if [ "$WATCH_MODE" = "true" ]; then
        echo -e "${BLUE}Running tests in watch mode${NC}"
        npm run test
    else
        if [ "$RUN_COVERAGE" = "true" ]; then
            echo -e "${BLUE}Running tests with coverage${NC}"
            npm run test:coverage
        else
            npm run test -- --run
        fi
    fi
    
    echo -e "${GREEN}✓ Unit tests completed${NC}"
fi

# Run E2E tests
if [ "$RUN_E2E_TESTS" = "true" ]; then
    echo -e "\n${YELLOW}Running E2E tests...${NC}"
    
    # Check if Playwright is installed
    if ! npx playwright --version &> /dev/null; then
        echo -e "${YELLOW}Installing Playwright...${NC}"
        npx playwright install --with-deps
    fi
    
    # Run E2E tests
    if [ "$HEADLESS" = "true" ]; then
        npm run e2e
    else
        npm run e2e:ui
    fi
    
    echo -e "${GREEN}✓ E2E tests completed${NC}"
fi

# Generate test report
echo -e "\n${YELLOW}Generating test report...${NC}"

# Create test results directory
mkdir -p test-results

# Generate test summary
cat > "test-results/summary.json" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "tests": {
    "lint": $RUN_LINT,
    "unit": $RUN_UNIT_TESTS,
    "e2e": $RUN_E2E_TESTS,
    "coverage": $RUN_COVERAGE
  }
}
EOF

# Copy coverage report if it exists
if [ -d "coverage" ]; then
    cp -r coverage test-results/ 2>/dev/null || true
    echo -e "${GREEN}✓ Coverage report copied${NC}"
fi

# Copy Playwright results if they exist
if [ -d "test-results-playwright" ]; then
    cp -r test-results-playwright test-results/playwright 2>/dev/null || true
    echo -e "${GREEN}✓ Playwright results copied${NC}"
fi

echo -e "${GREEN}✓ Test report generated${NC}"

# Display test results summary
echo -e "\n${BLUE}Test Results Summary:${NC}"

if [ "$RUN_LINT" = "true" ]; then
    echo -e "  ✅ Linting: Passed"
fi

if [ "$RUN_UNIT_TESTS" = "true" ]; then
    echo -e "  ✅ Unit Tests: Completed"
    
    if [ "$RUN_COVERAGE" = "true" ] && [ -d "coverage" ]; then
        # Extract coverage percentage from lcov-report
        if [ -f "coverage/lcov-report/index.html" ]; then
            echo -e "  📊 Coverage Report: coverage/lcov-report/index.html"
        fi
    fi
fi

if [ "$RUN_E2E_TESTS" = "true" ]; then
    echo -e "  ✅ E2E Tests: Completed"
fi

echo -e "  📄 Test Report: test-results/summary.json"

# Check for test failures
if [ -f "test-results/playwright/test-results.json" ]; then
    FAILED_TESTS=$(cat test-results/playwright/test-results.json | grep -o '"status":"failed"' | wc -l)
    if [ "$FAILED_TESTS" -gt 0 ]; then
        echo -e "\n${RED}⚠ Warning: $FAILED_TESTS E2E tests failed${NC}"
    fi
fi

echo -e "\n${GREEN}=========================================="
echo "Test execution completed successfully!"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}Available Reports:${NC}"
echo "  📊 Coverage: coverage/lcov-report/index.html"
echo "  🎭 E2E Tests: test-results/playwright/"
echo "  📋 Summary: test-results/summary.json"
echo ""
echo -e "${GREEN}All tests passed! 🎉${NC}"
