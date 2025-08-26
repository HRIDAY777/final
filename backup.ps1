# EduCore Ultra Backup Script for Windows
# This script creates backups of the database and media files

param(
    [string]$BackupPath = "backups",
    [switch]$DatabaseOnly,
    [switch]$MediaOnly,
    [switch]$Full
)

Write-Host "💾 Starting EduCore Ultra Backup..." -ForegroundColor Green

# Create backup directory
if (-not (Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = Join-Path $BackupPath $timestamp

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

Write-Host "📁 Backup directory: $backupDir" -ForegroundColor Yellow

# Check if Docker containers are running
try {
    $containers = docker-compose ps -q
    if (-not $containers) {
        Write-Host "❌ No containers are running. Please start the application first." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Failed to check containers. Please ensure Docker is running." -ForegroundColor Red
    exit 1
}

# Database backup
if ($DatabaseOnly -or $Full -or (-not $MediaOnly)) {
    Write-Host "🗄️  Creating database backup..." -ForegroundColor Yellow
    
    $dbBackupFile = Join-Path $backupDir "database_backup.sql"
    
    try {
        docker-compose exec -T db pg_dump -U educore_user educore_db > $dbBackupFile
        if (Test-Path $dbBackupFile) {
            $fileSize = (Get-Item $dbBackupFile).Length
            Write-Host "✅ Database backup created: $dbBackupFile ($([math]::Round($fileSize/1MB, 2)) MB)" -ForegroundColor Green
        } else {
            Write-Host "❌ Database backup failed!" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Database backup failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Media files backup
if ($MediaOnly -or $Full -or (-not $DatabaseOnly)) {
    Write-Host "📁 Creating media files backup..." -ForegroundColor Yellow
    
    $mediaBackupFile = Join-Path $backupDir "media_backup.tar.gz"
    
    try {
        # Create tar archive of media files
        docker-compose exec -T backend tar -czf /tmp/media_backup.tar.gz -C /app media/
        
        # Copy the archive from container to host
        docker cp $(docker-compose ps -q backend):/tmp/media_backup.tar.gz $mediaBackupFile
        
        if (Test-Path $mediaBackupFile) {
            $fileSize = (Get-Item $mediaBackupFile).Length
            Write-Host "✅ Media backup created: $mediaBackupFile ($([math]::Round($fileSize/1MB, 2)) MB)" -ForegroundColor Green
        } else {
            Write-Host "❌ Media backup failed!" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Media backup failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Create backup info file
$backupInfo = @"
EduCore Ultra Backup Information
================================
Backup Date: $(Get-Date)
Backup Type: $(if ($DatabaseOnly) { "Database Only" } elseif ($MediaOnly) { "Media Only" } else { "Full Backup" })
Backup Directory: $backupDir

Services Status:
$(docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}")

System Information:
- OS: $($env:OS)
- Docker Version: $(docker --version)
- Docker Compose Version: $(docker-compose --version)

Backup Files:
$(Get-ChildItem $backupDir | ForEach-Object { "- $($_.Name) ($([math]::Round($_.Length/1MB, 2)) MB)" })
"@

$backupInfo | Out-File -FilePath (Join-Path $backupDir "backup_info.txt") -Encoding UTF8

Write-Host ""
Write-Host "🎉 Backup completed successfully!" -ForegroundColor Green
Write-Host "📁 Backup location: $backupDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Backup contents:" -ForegroundColor Yellow
Get-ChildItem $backupDir | ForEach-Object {
    $size = [math]::Round($_.Length/1MB, 2)
    Write-Host "   $($_.Name) ($size MB)" -ForegroundColor White
}

Write-Host ""
Write-Host "🔧 Restore Commands:" -ForegroundColor Yellow
Write-Host "   Database: docker-compose exec -T db psql -U educore_user educore_db < $dbBackupFile" -ForegroundColor White
Write-Host "   Media: docker-compose exec -T backend tar -xzf /tmp/media_backup.tar.gz -C /app" -ForegroundColor White

