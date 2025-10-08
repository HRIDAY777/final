
# EduCore Ultra Backup Script
# This script creates automated backups of database and media files

set -e

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

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Configuration
BACKUP_DIR="/opt/educore/backups"
DB_NAME="${DB_NAME:-educore_ultra_prod}"
DB_USER="${DB_USER:-educore_user}"
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Function to create database backup
backup_database() {
    print_status "Creating database backup..."
    
    BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"
    
    # Create database backup using pg_dump
    if docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U $DB_USER -h $DB_HOST -p $DB_PORT $DB_NAME > $BACKUP_FILE; then
        print_status "Database backup created: $BACKUP_FILE"
        
        # Compress the backup
        gzip $BACKUP_FILE
        print_status "Database backup compressed: $BACKUP_FILE.gz"
        
        # Get file size
        SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
        print_info "Backup size: $SIZE"
        
        return 0
    else
        print_error "Database backup failed!"
        return 1
    fi
}

# Function to backup media files
backup_media() {
    print_status "Creating media files backup..."
    
    BACKUP_FILE="$BACKUP_DIR/media_backup_$DATE.tar.gz"
    
    # Create media backup
    if docker-compose -f docker-compose.prod.yml exec -T backend tar -czf - /app/media > $BACKUP_FILE; then
        print_status "Media backup created: $BACKUP_FILE"
        
        # Get file size
        SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        print_info "Backup size: $SIZE"
        
        return 0
    else
        print_error "Media backup failed!"
        return 1
    fi
}

# Function to backup static files
backup_static() {
    print_status "Creating static files backup..."
    
    BACKUP_FILE="$BACKUP_DIR/static_backup_$DATE.tar.gz"
    
    # Create static backup
    if docker-compose -f docker-compose.prod.yml exec -T backend tar -czf - /app/staticfiles > $BACKUP_FILE; then
        print_status "Static backup created: $BACKUP_FILE"
        
        # Get file size
        SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        print_info "Backup size: $SIZE"
        
        return 0
    else
        print_error "Static backup failed!"
        return 1
    fi
}

# Function to backup configuration files
backup_config() {
    print_status "Creating configuration backup..."
    
    BACKUP_FILE="$BACKUP_DIR/config_backup_$DATE.tar.gz"
    
    # Create config backup
    tar -czf $BACKUP_FILE \
        env.prod \
        docker-compose.prod.yml \
        nginx/nginx.conf \
        nginx/ssl/ \
        monitoring/ \
        scripts/ \
        2>/dev/null || true
    
    if [ -f "$BACKUP_FILE" ]; then
        print_status "Configuration backup created: $BACKUP_FILE"
        
        # Get file size
        SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        print_info "Backup size: $SIZE"
        
        return 0
    else
        print_error "Configuration backup failed!"
        return 1
    fi
}

# Function to clean old backups
cleanup_old_backups() {
    print_status "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    # Find and remove old backups
    find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
    find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
    
    print_status "Old backups cleaned up"
}

# Function to verify backup integrity
verify_backup() {
    local backup_file=$1
    local backup_type=$2
    
    print_status "Verifying $backup_type backup integrity..."
    
    if [[ $backup_file == *.gz ]]; then
        if gzip -t "$backup_file" 2>/dev/null; then
            print_status "$backup_type backup is valid"
            return 0
        else
            print_error "$backup_type backup is corrupted!"
            return 1
        fi
    else
        if tar -tzf "$backup_file" >/dev/null 2>&1; then
            print_status "$backup_type backup is valid"
            return 0
        else
            print_error "$backup_type backup is corrupted!"
            return 1
        fi
    fi
}

# Function to send backup notification
send_notification() {
    local status=$1
    local message=$2
    
    # You can implement email notification here
    # For now, just log the status
    if [ "$status" = "success" ]; then
        print_status "Backup completed successfully: $message"
    else
        print_error "Backup failed: $message"
    fi
}

# Main backup function
main() {
    print_status "Starting EduCore Ultra backup process..."
    print_info "Backup directory: $BACKUP_DIR"
    print_info "Retention period: $RETENTION_DAYS days"
    
    local success_count=0
    local total_count=0
    
    # Database backup
    total_count=$((total_count + 1))
    if backup_database; then
        success_count=$((success_count + 1))
    fi
    
    # Media backup
    total_count=$((total_count + 1))
    if backup_media; then
        success_count=$((success_count + 1))
    fi
    
    # Static backup
    total_count=$((total_count + 1))
    if backup_static; then
        success_count=$((success_count + 1))
    fi
    
    # Configuration backup
    total_count=$((total_count + 1))
    if backup_config; then
        success_count=$((success_count + 1))
    fi
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Summary
    print_status "Backup process completed!"
    print_info "Successful backups: $success_count/$total_count"
    
    if [ $success_count -eq $total_count ]; then
        send_notification "success" "All backups completed successfully"
        print_status "All backups completed successfully!"
        exit 0
    else
        send_notification "error" "Some backups failed ($success_count/$total_count successful)"
        print_error "Some backups failed!"
        exit 1
    fi
}

# Function to restore database
restore_database() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        print_error "Please provide backup file path"
        echo "Usage: $0 restore-db <backup_file.sql.gz>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_warning "This will restore the database from backup!"
    print_warning "Current data will be lost!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Restore cancelled"
        exit 0
    fi
    
    print_status "Restoring database from: $backup_file"
    
    # Stop the application
    docker-compose -f docker-compose.prod.yml stop backend
    
    # Restore database
    if [[ $backup_file == *.gz ]]; then
        gunzip -c $backup_file | docker-compose -f docker-compose.prod.yml exec -T db psql -U $DB_USER -d $DB_NAME
    else
        docker-compose -f docker-compose.prod.yml exec -T db psql -U $DB_USER -d $DB_NAME < $backup_file
    fi
    
    # Start the application
    docker-compose -f docker-compose.prod.yml start backend
    
    print_status "Database restored successfully!"
}

# Function to list available backups
list_backups() {
    print_status "Available backups in $BACKUP_DIR:"
    echo
    
    if [ -d "$BACKUP_DIR" ]; then
        ls -lah $BACKUP_DIR/ | grep -E "\.(sql\.gz|tar\.gz)$" | while read line; do
            echo "  $line"
        done
    else
        print_warning "Backup directory does not exist: $BACKUP_DIR"
    fi
}

# Parse command line arguments
case "${1:-}" in
    "restore-db")
        restore_database "$2"
        ;;
    "list")
        list_backups
        ;;
    "help"|"-h"|"--help")
        echo "EduCore Ultra Backup Script"
        echo
        echo "Usage:"
        echo "  $0                    - Create full backup"
        echo "  $0 restore-db <file>  - Restore database from backup"
        echo "  $0 list               - List available backups"
        echo "  $0 help               - Show this help"
        echo
        echo "Environment variables:"
        echo "  DB_NAME              - Database name (default: educore_ultra_prod)"
        echo "  DB_USER              - Database user (default: educore_user)"
        echo "  DB_HOST              - Database host (default: db)"
        echo "  DB_PORT              - Database port (default: 5432)"
        echo "  RETENTION_DAYS       - Backup retention days (default: 30)"
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac