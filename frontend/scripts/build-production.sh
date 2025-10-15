#!/bin/bash

# =================================================================
# Production Build Script for EduCore Ultra Frontend
# =================================================================

set -e  # Exit on error

echo "=========================================="
echo "Building EduCore Ultra Frontend for Production"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="dist"
ANALYZE_BUNDLE=${ANALYZE_BUNDLE:-false}
SKIP_TESTS=${SKIP_TESTS:-false}
SKIP_LINT=${SKIP_LINT:-false}

echo -e "${BLUE}Configuration:${NC}"
echo "  Build Directory: $BUILD_DIR"
echo "  Analyze Bundle: $ANALYZE_BUNDLE"
echo "  Skip Tests: $SKIP_TESTS"
echo "  Skip Lint: $SKIP_LINT"
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

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm version: $(npm --version)${NC}"

# Clean previous build
echo -e "\n${YELLOW}Cleaning previous build...${NC}"
if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
    echo -e "${GREEN}✓ Previous build cleaned${NC}"
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm ci --silent
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Run linting
if [ "$SKIP_LINT" = "false" ]; then
    echo -e "\n${YELLOW}Running linting...${NC}"
    npm run lint
    echo -e "${GREEN}✓ Linting passed${NC}"
fi

# Run tests
if [ "$SKIP_TESTS" = "false" ]; then
    echo -e "\n${YELLOW}Running tests...${NC}"
    npm run test:coverage
    echo -e "${GREEN}✓ Tests passed${NC}"
fi

# Build for production
echo -e "\n${YELLOW}Building for production...${NC}"
NODE_ENV=production npm run build

# Check if build was successful
if [ -d "$BUILD_DIR" ] && [ "$(ls -A $BUILD_DIR)" ]; then
    echo -e "${GREEN}✓ Production build completed successfully${NC}"
else
    echo -e "${RED}Error: Build failed or build directory is empty${NC}"
    exit 1
fi

# Analyze bundle if requested
if [ "$ANALYZE_BUNDLE" = "true" ]; then
    echo -e "\n${YELLOW}Analyzing bundle...${NC}"
    if [ -f "$BUILD_DIR/bundle-analysis.html" ]; then
        echo -e "${GREEN}✓ Bundle analysis available at: $BUILD_DIR/bundle-analysis.html${NC}"
    else
        echo -e "${YELLOW}⚠ Bundle analysis file not found${NC}"
    fi
fi

# Generate build info
echo -e "\n${YELLOW}Generating build information...${NC}"
cat > "$BUILD_DIR/build-info.json" << EOF
{
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "packageVersion": "$(node -p "require('./package.json').version")"
}
EOF
echo -e "${GREEN}✓ Build information generated${NC}"

# Check build size
echo -e "\n${YELLOW}Build size analysis:${NC}"
BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
echo "  Total build size: $BUILD_SIZE"

# Count files
FILE_COUNT=$(find "$BUILD_DIR" -type f | wc -l)
echo "  Total files: $FILE_COUNT"

# Check for large files (> 1MB)
echo -e "\n${YELLOW}Large files (> 1MB):${NC}"
find "$BUILD_DIR" -type f -size +1M -exec ls -lh {} \; | while read -r line; do
    echo "  $line"
done

# Security check - look for sensitive files
echo -e "\n${YELLOW}Security check...${NC}"
SENSITIVE_FILES=(
    ".env"
    ".env.local"
    ".env.production"
    "package.json"
    "package-lock.json"
    "yarn.lock"
    "tsconfig.json"
    "vite.config.ts"
    "*.test.*"
    "*.spec.*"
)

for pattern in "${SENSITIVE_FILES[@]}"; do
    if find "$BUILD_DIR" -name "$pattern" -type f | grep -q .; then
        echo -e "${YELLOW}⚠ Warning: Found sensitive file matching pattern: $pattern${NC}"
    fi
done

echo -e "\n${GREEN}✓ Security check completed${NC}"

# Generate sitemap if needed
echo -e "\n${YELLOW}Generating sitemap...${NC}"
cat > "$BUILD_DIR/sitemap.xml" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://educore.com/</loc>
    <lastmod>$(date -u +%Y-%m-%d)</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://educore.com/login</loc>
    <lastmod>$(date -u +%Y-%m-%d)</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
EOF
echo -e "${GREEN}✓ Sitemap generated${NC}"

# Generate robots.txt
echo -e "\n${YELLOW}Generating robots.txt...${NC}"
cat > "$BUILD_DIR/robots.txt" << EOF
User-agent: *
Allow: /

Sitemap: https://educore.com/sitemap.xml
EOF
echo -e "${GREEN}✓ robots.txt generated${NC}"

# Set proper permissions
echo -e "\n${YELLOW}Setting file permissions...${NC}"
chmod -R 755 "$BUILD_DIR"
echo -e "${GREEN}✓ Permissions set${NC}"

echo -e "\n${GREEN}=========================================="
echo "Production build completed successfully!"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}Build Summary:${NC}"
echo "  📁 Build Directory: $BUILD_DIR"
echo "  📦 Build Size: $BUILD_SIZE"
echo "  📄 Total Files: $FILE_COUNT"
echo "  🕒 Build Time: $(date)"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Deploy the $BUILD_DIR directory to your web server"
echo "  2. Configure your web server to serve the static files"
echo "  3. Set up SSL certificates"
echo "  4. Configure CDN if needed"
echo "  5. Test the deployment"
echo ""
echo -e "${GREEN}Happy deploying! 🚀${NC}"
