"""
Management command to cleanup old data and files.
"""
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import os
from pathlib import Path


class Command(BaseCommand):
    help = 'Cleanup old data and files'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Number of days to keep (default: 30)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )

    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']
        
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('CLEANUP OLD DATA'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No files will be deleted\n'))
        
        cutoff_date = timezone.now() - timedelta(days=days)
        self.stdout.write(f'Cleaning files older than: {cutoff_date.strftime("%Y-%m-%d %H:%M:%S")}\n')
        
        # Cleanup old log files
        self.stdout.write('📋 Cleaning log files...')
        log_dir = settings.BASE_DIR / 'logs'
        deleted_count = self._cleanup_directory(log_dir, cutoff_date, dry_run, patterns=['*.log.*'])
        self.stdout.write(self.style.SUCCESS(f'  Log files cleaned: {deleted_count}\n'))
        
        # Cleanup old backup files
        self.stdout.write('💾 Cleaning backup files...')
        backup_dir = settings.BASE_DIR / 'backups'
        deleted_count = self._cleanup_directory(backup_dir, cutoff_date, dry_run, patterns=['*.sql', '*.gz'])
        self.stdout.write(self.style.SUCCESS(f'  Backup files cleaned: {deleted_count}\n'))
        
        # Cleanup temporary files
        self.stdout.write('🗑️ Cleaning temporary files...')
        temp_dirs = [
            settings.BASE_DIR / 'tmp',
            settings.MEDIA_ROOT / 'tmp',
        ]
        total_deleted = 0
        for temp_dir in temp_dirs:
            if temp_dir.exists():
                deleted_count = self._cleanup_directory(temp_dir, cutoff_date, dry_run)
                total_deleted += deleted_count
        self.stdout.write(self.style.SUCCESS(f'  Temporary files cleaned: {total_deleted}\n'))
        
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('Cleanup complete!'))
        self.stdout.write(self.style.SUCCESS('=' * 60))

    def _cleanup_directory(self, directory, cutoff_date, dry_run=False, patterns=None):
        """Cleanup files in a directory older than cutoff_date."""
        if not directory.exists():
            return 0
        
        deleted_count = 0
        
        for file_path in directory.rglob('*'):
            if not file_path.is_file():
                continue
            
            # Check pattern if specified
            if patterns:
                if not any(file_path.match(pattern) for pattern in patterns):
                    continue
            
            # Check file age
            file_mtime = timezone.datetime.fromtimestamp(
                file_path.stat().st_mtime,
                tz=timezone.get_current_timezone()
            )
            
            if file_mtime < cutoff_date:
                if dry_run:
                    self.stdout.write(f'  Would delete: {file_path}')
                else:
                    try:
                        file_path.unlink()
                        self.stdout.write(f'  Deleted: {file_path}')
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'  Failed to delete {file_path}: {e}'))
                        continue
                
                deleted_count += 1
        
        return deleted_count

