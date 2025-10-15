#!/bin/bash

# =================================================================
# Deployment Script for EduCore Ultra Frontend
# =================================================================

set -e  # Exit on error

echo "=========================================="
echo "Deploying EduCore Ultra Frontend"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="dist"
DEPLOY_ENV=${DEPLOY_ENV:-production}
BACKUP_DIR="backups"
REMOTE_HOST=${REMOTE_HOST:-""}
REMOTE_PATH=${REMOTE_PATH:-"/var/www/educore"}
LOCAL_BUILD=${LOCAL_BUILD:-true}

echo -e "${BLUE}Deployment Configuration:${NC}"
echo "  Environment: $DEPLOY_ENV"
echo "  Build Directory: $BUILD_DIR"
echo "  Remote Host: $REMOTE_HOST"
echo "  Remote Path: $REMOTE_PATH"
echo "  Local Build: $LOCAL_BUILD"
echo ""

# Validate configuration
if [ -z "$REMOTE_HOST" ]; then
    echo -e "${YELLOW}Warning: REMOTE_HOST not set. Deploying locally only.${NC}"
    REMOTE_DEPLOY=false
else
    REMOTE_DEPLOY=true
fi

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}Error: Build directory '$BUILD_DIR' not found${NC}"
    if [ "$LOCAL_BUILD" = "true" ]; then
        echo -e "${YELLOW}Building locally...${NC}"
        ./scripts/build-production.sh
    else
        echo -e "${RED}Please run build first or set LOCAL_BUILD=true${NC}"
        exit 1
    fi
fi

# Create backup directory
echo -e "\n${YELLOW}Preparing backup...${NC}"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
echo -e "${GREEN}✓ Backup directory ready${NC}"

# Local deployment
echo -e "\n${YELLOW}Deploying locally...${NC}"

# Create deployment directory
DEPLOY_DIR="deploy"
if [ -d "$DEPLOY_DIR" ]; then
    echo -e "${YELLOW}Backing up existing deployment...${NC}"
    tar -czf "$BACKUP_FILE" "$DEPLOY_DIR" 2>/dev/null || true
    rm -rf "$DEPLOY_DIR"
fi

# Copy build to deployment directory
cp -r "$BUILD_DIR" "$DEPLOY_DIR"
echo -e "${GREEN}✓ Local deployment completed${NC}"

# Remote deployment
if [ "$REMOTE_DEPLOY" = "true" ]; then
    echo -e "\n${YELLOW}Deploying to remote server...${NC}"
    
    # Test SSH connection
    echo -e "${BLUE}Testing SSH connection...${NC}"
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$REMOTE_HOST" "echo 'SSH connection successful'" 2>/dev/null; then
        echo -e "${RED}Error: Cannot connect to remote host '$REMOTE_HOST'${NC}"
        echo -e "${YELLOW}Please check:${NC}"
        echo "  1. SSH key is properly configured"
        echo "  2. Remote host is accessible"
        echo "  3. SSH agent is running"
        exit 1
    fi
    echo -e "${GREEN}✓ SSH connection successful${NC}"
    
    # Create remote backup
    echo -e "\n${BLUE}Creating remote backup...${NC}"
    ssh "$REMOTE_HOST" "
        if [ -d '$REMOTE_PATH' ]; then
            sudo mkdir -p '$REMOTE_PATH/backups'
            sudo tar -czf '$REMOTE_PATH/backups/backup-$(date +%Y%m%d-%H%M%S).tar.gz' '$REMOTE_PATH' --exclude='$REMOTE_PATH/backups'
            echo 'Remote backup created'
        fi
    "
    
    # Sync files to remote server
    echo -e "\n${BLUE}Syncing files to remote server...${NC}"
    rsync -avz --delete \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='src' \
        --exclude='*.log' \
        "$DEPLOY_DIR/" "$REMOTE_HOST:$REMOTE_PATH/"
    
    # Set proper permissions on remote server
    echo -e "\n${BLUE}Setting remote permissions...${NC}"
    ssh "$REMOTE_HOST" "
        sudo chown -R www-data:www-data '$REMOTE_PATH'
        sudo chmod -R 755 '$REMOTE_PATH'
        sudo find '$REMOTE_PATH' -type f -name '*.html' -exec chmod 644 {} \;
        sudo find '$REMOTE_PATH' -type f -name '*.js' -exec chmod 644 {} \;
        sudo find '$REMOTE_PATH' -type f -name '*.css' -exec chmod 644 {} \;
    "
    
    echo -e "${GREEN}✓ Remote deployment completed${NC}"
fi

# Post-deployment tasks
echo -e "\n${YELLOW}Running post-deployment tasks...${NC}"

# Test deployment
echo -e "${BLUE}Testing deployment...${NC}"
if [ -f "$DEPLOY_DIR/index.html" ]; then
    echo -e "${GREEN}✓ index.html found${NC}"
else
    echo -e "${RED}Error: index.html not found in deployment${NC}"
    exit 1
fi

# Check for critical files
CRITICAL_FILES=(
    "index.html"
    "assets"
    "manifest.json"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -e "$DEPLOY_DIR/$file" ]; then
        echo -e "${GREEN}✓ $file found${NC}"
    else
        echo -e "${YELLOW}⚠ Warning: $file not found${NC}"
    fi
done

# Generate deployment report
echo -e "\n${YELLOW}Generating deployment report...${NC}"
cat > "deployment-report.json" << EOF
{
  "deploymentTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$DEPLOY_ENV",
  "buildSize": "$(du -sh $BUILD_DIR | cut -f1)",
  "fileCount": "$(find $BUILD_DIR -type f | wc -l)",
  "remoteHost": "$REMOTE_HOST",
  "remotePath": "$REMOTE_PATH",
  "backupFile": "$BACKUP_FILE",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git branch --show-current 2>/dev/null || echo 'unknown')"
}
EOF
echo -e "${GREEN}✓ Deployment report generated${NC}"

# Cleanup old backups (keep last 5)
echo -e "\n${YELLOW}Cleaning up old backups...${NC}"
if [ -d "$BACKUP_DIR" ]; then
    ls -t "$BACKUP_DIR"/backup-*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    echo -e "${GREEN}✓ Old backups cleaned${NC}"
fi

echo -e "\n${GREEN}=========================================="
echo "Deployment completed successfully!"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}Deployment Summary:${NC}"
echo "  🌍 Environment: $DEPLOY_ENV"
echo "  📁 Local Deploy: $DEPLOY_DIR"
if [ "$REMOTE_DEPLOY" = "true" ]; then
    echo "  🌐 Remote Deploy: $REMOTE_HOST:$REMOTE_PATH"
fi
echo "  💾 Backup: $BACKUP_FILE"
echo "  📊 Report: deployment-report.json"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Test the deployed application"
echo "  2. Monitor error logs"
echo "  3. Check performance metrics"
echo "  4. Verify SSL certificates"
echo "  5. Update DNS if needed"
echo ""
echo -e "${GREEN}Deployment successful! 🎉${NC}"
