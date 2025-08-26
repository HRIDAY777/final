"""
Management command to cleanup old files and logs.
"""
import os
import shutil
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone


class Command(BaseCommand):
    help = 'Clean up old files, logs, and temporary files'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Number of days old to consider for cleanup'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting'
        )
        parser.add_argument(
            '--include-logs',
            action='store_true',
            help='Include log files in cleanup'
        )
        parser.add_argument(
            '--include-media',
            action='store_true',
            help='Include media files in cleanup'
        )

    def handle(self, *args, **options):
        self.stdout.write('Starting cleanup process...')
        
        cutoff_date = timezone.now() - timedelta(days=options['days'])
        deleted_count = 0
        total_size = 0
        
        # Cleanup log files
        if options['include_logs']:
            deleted_count, size = self.cleanup_logs(cutoff_date, options['dry_run'])
            total_size += size
        
        # Cleanup media files
        if options['include_media']:
            deleted_count, size = self.cleanup_media(cutoff_date, options['dry_run'])
            total_size += size
        
        # Cleanup temporary files
        deleted_count, size = self.cleanup_temp_files(cutoff_date, options['dry_run'])
        total_size += size
        
        # Cleanup backup files
        deleted_count, size = self.cleanup_backups(cutoff_date, options['dry_run'])
        total_size += size
        
        if options['dry_run']:
            self.stdout.write(
                self.style.WARNING(
                    f'DRY RUN: Would delete {deleted_count} files '
                    f'({self.format_size(total_size)})'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Cleanup completed: {deleted_count} files deleted '
                    f'({self.format_size(total_size)})'
                )
            )

    def cleanup_logs(self, cutoff_date, dry_run):
        """Clean up old log files."""
        log_dir = os.path.join(settings.BASE_DIR, 'logs')
        if not os.path.exists(log_dir):
            return 0, 0
        
        deleted_count = 0
        total_size = 0
        
        for filename in os.listdir(log_dir):
            file_path = os.path.join(log_dir, filename)
            if os.path.isfile(file_path):
                file_mtime = timezone.datetime.fromtimestamp(
                    os.path.getmtime(file_path)
                )
                
                if file_mtime < cutoff_date:
                    file_size = os.path.getsize(file_path)
                    if not dry_run:
                        os.remove(file_path)
                        self.stdout.write(f'Deleted log file: {filename}')
                    else:
                        self.stdout.write(f'Would delete log file: {filename}')
                    
                    deleted_count += 1
                    total_size += file_size
        
        return deleted_count, total_size

    def cleanup_media(self, cutoff_date, dry_run):
        """Clean up old media files."""
        media_dir = getattr(settings, 'MEDIA_ROOT', None)
        if not media_dir or not os.path.exists(media_dir):
            return 0, 0
        
        deleted_count = 0
        total_size = 0
        
        for root, dirs, files in os.walk(media_dir):
            for filename in files:
                file_path = os.path.join(root, filename)
                file_mtime = timezone.datetime.fromtimestamp(
                    os.path.getmtime(file_path)
                )
                
                if file_mtime < cutoff_date:
                    file_size = os.path.getsize(file_path)
                    if not dry_run:
                        os.remove(file_path)
                        self.stdout.write(f'Deleted media file: {file_path}')
                    else:
                        self.stdout.write(f'Would delete media file: {file_path}')
                    
                    deleted_count += 1
                    total_size += file_size
        
        return deleted_count, total_size

    def cleanup_temp_files(self, cutoff_date, dry_run):
        """Clean up temporary files."""
        temp_dirs = [
            os.path.join(settings.BASE_DIR, 'tmp'),
            os.path.join(settings.BASE_DIR, 'temp'),
            '/tmp/educore_ultra'
        ]
        
        deleted_count = 0
        total_size = 0
        
        for temp_dir in temp_dirs:
            if os.path.exists(temp_dir):
                for filename in os.listdir(temp_dir):
                    file_path = os.path.join(temp_dir, filename)
                    if os.path.isfile(file_path):
                        file_mtime = timezone.datetime.fromtimestamp(
                            os.path.getmtime(file_path)
                        )
                        
                        if file_mtime < cutoff_date:
                            file_size = os.path.getsize(file_path)
                            if not dry_run:
                                os.remove(file_path)
                                self.stdout.write(f'Deleted temp file: {file_path}')
                            else:
                                self.stdout.write(f'Would delete temp file: {file_path}')
                            
                            deleted_count += 1
                            total_size += file_size
        
        return deleted_count, total_size

    def cleanup_backups(self, cutoff_date, dry_run):
        """Clean up old backup files."""
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        if not os.path.exists(backup_dir):
            return 0, 0
        
        deleted_count = 0
        total_size = 0
        
        for filename in os.listdir(backup_dir):
            file_path = os.path.join(backup_dir, filename)
            if os.path.isfile(file_path):
                file_mtime = timezone.datetime.fromtimestamp(
                    os.path.getmtime(file_path)
                )
                
                if file_mtime < cutoff_date:
                    file_size = os.path.getsize(file_path)
                    if not dry_run:
                        os.remove(file_path)
                        self.stdout.write(f'Deleted backup file: {filename}')
                    else:
                        self.stdout.write(f'Would delete backup file: {filename}')
                    
                    deleted_count += 1
                    total_size += file_size
        
        return deleted_count, total_size

    def format_size(self, size_bytes):
        """Format file size in human readable format."""
        if size_bytes == 0:
            return "0B"
        
        size_names = ["B", "KB", "MB", "GB"]
        i = 0
        while size_bytes >= 1024 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
        
        return f"{size_bytes:.1f}{size_names[i]}"
