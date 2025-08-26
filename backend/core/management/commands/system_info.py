"""
Management command to display system information and health status.
"""
import os
import platform
import psutil
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import connection
from django.utils import timezone


class Command(BaseCommand):
    help = 'Display system information and health status'

    def add_arguments(self, parser):
        parser.add_argument(
            '--detailed',
            action='store_true',
            help='Show detailed system information'
        )
        parser.add_argument(
            '--health-check',
            action='store_true',
            help='Perform health checks'
        )

    def handle(self, *args, **options):
        self.stdout.write('=== EduCore Ultra System Information ===\n')
        
        # Basic system info
        self.display_basic_info()
        
        # Database info
        self.display_database_info()
        
        # Django settings info
        self.display_django_info()
        
        if options['detailed']:
            self.display_detailed_info()
        
        if options['health_check']:
            self.perform_health_checks()

    def display_basic_info(self):
        """Display basic system information."""
        self.stdout.write('--- Basic System Information ---')
        
        # Platform info
        self.stdout.write(f'Platform: {platform.platform()}')
        self.stdout.write(f'Python Version: {platform.python_version()}')
        self.stdout.write(f'Machine: {platform.machine()}')
        self.stdout.write(f'Processor: {platform.processor()}')
        
        # Memory info
        memory = psutil.virtual_memory()
        self.stdout.write(
            f'Memory: {self.format_size(memory.total)} total, '
            f'{self.format_size(memory.available)} available '
            f'({memory.percent}% used)'
        )
        
        # Disk info
        disk = psutil.disk_usage('/')
        self.stdout.write(
            f'Disk: {self.format_size(disk.total)} total, '
            f'{self.format_size(disk.free)} free '
            f'({disk.percent}% used)'
        )
        
        # CPU info
        cpu_count = psutil.cpu_count()
        cpu_percent = psutil.cpu_percent(interval=1)
        self.stdout.write(f'CPU: {cpu_count} cores, {cpu_percent}% usage')
        
        self.stdout.write('')

    def display_database_info(self):
        """Display database information."""
        self.stdout.write('--- Database Information ---')
        
        db_engine = settings.DATABASES['default']['ENGINE']
        self.stdout.write(f'Database Engine: {db_engine}')
        
        if 'postgresql' in db_engine:
            self.display_postgresql_info()
        elif 'mysql' in db_engine:
            self.display_mysql_info()
        else:
            self.display_sqlite_info()
        
        self.stdout.write('')

    def display_postgresql_info(self):
        """Display PostgreSQL specific information."""
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT version();")
                version = cursor.fetchone()[0]
                self.stdout.write(f'PostgreSQL Version: {version}')
                
                cursor.execute("SELECT current_database();")
                db_name = cursor.fetchone()[0]
                self.stdout.write(f'Current Database: {db_name}')
                
                cursor.execute("SELECT count(*) FROM information_schema.tables;")
                table_count = cursor.fetchone()[0]
                self.stdout.write(f'Total Tables: {table_count}')
                
        except Exception as e:
            self.stdout.write(f'Error getting PostgreSQL info: {e}')

    def display_mysql_info(self):
        """Display MySQL specific information."""
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT VERSION();")
                version = cursor.fetchone()[0]
                self.stdout.write(f'MySQL Version: {version}')
                
                cursor.execute("SELECT DATABASE();")
                db_name = cursor.fetchone()[0]
                self.stdout.write(f'Current Database: {db_name}')
                
                cursor.execute("SHOW TABLES;")
                tables = cursor.fetchall()
                self.stdout.write(f'Total Tables: {len(tables)}')
                
        except Exception as e:
            self.stdout.write(f'Error getting MySQL info: {e}')

    def display_sqlite_info(self):
        """Display SQLite specific information."""
        try:
            db_path = settings.DATABASES['default']['NAME']
            self.stdout.write(f'Database Path: {db_path}')
            
            if os.path.exists(db_path):
                file_size = os.path.getsize(db_path)
                self.stdout.write(f'Database Size: {self.format_size(file_size)}')
                
                with connection.cursor() as cursor:
                    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
                    tables = cursor.fetchall()
                    self.stdout.write(f'Total Tables: {len(tables)}')
            else:
                self.stdout.write('Database file does not exist')
                
        except Exception as e:
            self.stdout.write(f'Error getting SQLite info: {e}')

    def display_django_info(self):
        """Display Django specific information."""
        self.stdout.write('--- Django Information ---')
        
        self.stdout.write(f'Django Version: {settings.DJANGO_VERSION}')
        self.stdout.write(f'Debug Mode: {settings.DEBUG}')
        self.stdout.write(f'Secret Key: {"*" * 20} (hidden)')
        self.stdout.write(f'Allowed Hosts: {settings.ALLOWED_HOSTS}')
        self.stdout.write(f'Installed Apps: {len(settings.INSTALLED_APPS)}')
        self.stdout.write(f'Middleware: {len(settings.MIDDLEWARE)}')
        
        # Static files
        static_root = getattr(settings, 'STATIC_ROOT', None)
        if static_root:
            self.stdout.write(f'Static Root: {static_root}')
        
        # Media files
        media_root = getattr(settings, 'MEDIA_ROOT', None)
        if media_root:
            self.stdout.write(f'Media Root: {media_root}')
        
        self.stdout.write('')

    def display_detailed_info(self):
        """Display detailed system information."""
        self.stdout.write('--- Detailed System Information ---')
        
        # Network info
        network_info = psutil.net_if_addrs()
        self.stdout.write('Network Interfaces:')
        for interface, addresses in network_info.items():
            for addr in addresses:
                if addr.family == 2:  # IPv4
                    self.stdout.write(f'  {interface}: {addr.address}')
        
        # Process info
        self.stdout.write('\nTop Processes by CPU:')
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                processes.append(proc.info)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        # Sort by CPU usage
        processes.sort(key=lambda x: x['cpu_percent'], reverse=True)
        for proc in processes[:5]:
            self.stdout.write(
                f'  {proc["name"]}: CPU {proc["cpu_percent"]}%, '
                f'Memory {proc["memory_percent"]:.1f}%'
            )
        
        # Disk partitions
        self.stdout.write('\nDisk Partitions:')
        partitions = psutil.disk_partitions()
        for partition in partitions:
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                self.stdout.write(
                    f'  {partition.device}: {partition.mountpoint} '
                    f'({usage.percent}% used)'
                )
            except PermissionError:
                pass
        
        self.stdout.write('')

    def perform_health_checks(self):
        """Perform system health checks."""
        self.stdout.write('--- Health Checks ---')
        
        # Database connectivity
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                self.stdout.write(self.style.SUCCESS('✓ Database connectivity: OK'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Database connectivity: FAILED - {e}'))
        
        # Memory usage
        memory = psutil.virtual_memory()
        if memory.percent < 80:
            self.stdout.write(self.style.SUCCESS(f'✓ Memory usage: OK ({memory.percent}%)'))
        else:
            self.stdout.write(
                self.style.WARNING(f'⚠ Memory usage: HIGH ({memory.percent}%)')
            )
        
        # Disk usage
        disk = psutil.disk_usage('/')
        if disk.percent < 90:
            self.stdout.write(self.style.SUCCESS(f'✓ Disk usage: OK ({disk.percent}%)'))
        else:
            self.stdout.write(
                self.style.WARNING(f'⚠ Disk usage: HIGH ({disk.percent}%)')
            )
        
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        if cpu_percent < 80:
            self.stdout.write(self.style.SUCCESS(f'✓ CPU usage: OK ({cpu_percent}%)'))
        else:
            self.stdout.write(
                self.style.WARNING(f'⚠ CPU usage: HIGH ({cpu_percent}%)')
            )
        
        # Check if Django is running
        try:
            from django.core.cache import cache
            cache.set('health_check', 'ok', 10)
            result = cache.get('health_check')
            if result == 'ok':
                self.stdout.write(self.style.SUCCESS('✓ Django cache: OK'))
            else:
                self.stdout.write(self.style.ERROR('✗ Django cache: FAILED'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Django cache: FAILED - {e}'))
        
        self.stdout.write('')

    def format_size(self, size_bytes):
        """Format file size in human readable format."""
        if size_bytes == 0:
            return "0B"
        
        size_names = ["B", "KB", "MB", "GB", "TB"]
        i = 0
        while size_bytes >= 1024 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
        
        return f"{size_bytes:.1f}{size_names[i]}"
