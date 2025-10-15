"""
Management command to check system health and configuration.
"""
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import connection
from django.core.cache import cache
import psutil


class Command(BaseCommand):
    help = 'Check system health and configuration'

    def add_arguments(self, parser):
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed information',
        )

    def handle(self, *args, **options):
        verbose = options['verbose']
        
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('SYSTEM HEALTH CHECK'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        
        # Check Django settings
        self.stdout.write('\n📋 Django Configuration:')
        self.stdout.write(f'  DEBUG: {settings.DEBUG}')
        self.stdout.write(f'  Environment: {settings.DJANGO_SETTINGS_MODULE.split(".")[-1]}')
        self.stdout.write(f'  Allowed Hosts: {", ".join(settings.ALLOWED_HOSTS)}')
        
        # Check database
        self.stdout.write('\n💾 Database:')
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT version();")
                version = cursor.fetchone()[0] if settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql' else 'SQLite'
            
            self.stdout.write(self.style.SUCCESS('  ✓ Database connection: OK'))
            if verbose:
                self.stdout.write(f'  Database: {settings.DATABASES["default"]["NAME"]}')
                self.stdout.write(f'  Engine: {settings.DATABASES["default"]["ENGINE"]}')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  ✗ Database connection: FAILED - {e}'))
        
        # Check cache
        self.stdout.write('\n🔄 Cache:')
        try:
            cache.set('health_check', 'OK', 10)
            result = cache.get('health_check')
            if result == 'OK':
                self.stdout.write(self.style.SUCCESS('  ✓ Cache: OK'))
                if verbose:
                    self.stdout.write(f'  Backend: {settings.CACHES["default"]["BACKEND"]}')
            else:
                self.stdout.write(self.style.WARNING('  ⚠ Cache: WARNING - Value mismatch'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  ✗ Cache: FAILED - {e}'))
        
        # Check system resources
        self.stdout.write('\n💻 System Resources:')
        try:
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # CPU
            cpu_status = '✓' if cpu_percent < 80 else '⚠'
            cpu_style = self.style.SUCCESS if cpu_percent < 80 else self.style.WARNING
            self.stdout.write(cpu_style(f'  {cpu_status} CPU Usage: {cpu_percent}%'))
            
            # Memory
            mem_status = '✓' if memory.percent < 80 else '⚠'
            mem_style = self.style.SUCCESS if memory.percent < 80 else self.style.WARNING
            self.stdout.write(mem_style(f'  {mem_status} Memory Usage: {memory.percent}%'))
            
            if verbose:
                self.stdout.write(f'    Total: {memory.total / (1024**3):.2f} GB')
                self.stdout.write(f'    Available: {memory.available / (1024**3):.2f} GB')
            
            # Disk
            disk_status = '✓' if disk.percent < 80 else '⚠'
            disk_style = self.style.SUCCESS if disk.percent < 80 else self.style.WARNING
            self.stdout.write(disk_style(f'  {disk_status} Disk Usage: {disk.percent}%'))
            
            if verbose:
                self.stdout.write(f'    Total: {disk.total / (1024**3):.2f} GB')
                self.stdout.write(f'    Free: {disk.free / (1024**3):.2f} GB')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  ✗ System resources: FAILED - {e}'))
        
        # Check static/media directories
        self.stdout.write('\n📁 Directories:')
        import os
        dirs_to_check = {
            'Static': settings.STATIC_ROOT,
            'Media': settings.MEDIA_ROOT,
            'Logs': settings.BASE_DIR / 'logs',
        }
        
        for name, path in dirs_to_check.items():
            if os.path.exists(path):
                self.stdout.write(self.style.SUCCESS(f'  ✓ {name}: {path}'))
            else:
                self.stdout.write(self.style.WARNING(f'  ⚠ {name}: {path} (missing)'))
        
        # Security checks
        self.stdout.write('\n🔒 Security:')
        security_checks = [
            ('DEBUG is False', not settings.DEBUG),
            ('SECRET_KEY is set', bool(settings.SECRET_KEY and settings.SECRET_KEY != 'dev-secret-key-for-development-only')),
            ('ALLOWED_HOSTS configured', len(settings.ALLOWED_HOSTS) > 0),
            ('SECURE_SSL_REDIRECT', getattr(settings, 'SECURE_SSL_REDIRECT', False)),
            ('SESSION_COOKIE_SECURE', getattr(settings, 'SESSION_COOKIE_SECURE', False)),
            ('CSRF_COOKIE_SECURE', getattr(settings, 'CSRF_COOKIE_SECURE', False)),
        ]
        
        for check_name, result in security_checks:
            if result:
                self.stdout.write(self.style.SUCCESS(f'  ✓ {check_name}'))
            else:
                self.stdout.write(self.style.WARNING(f'  ⚠ {check_name}'))
        
        self.stdout.write(self.style.SUCCESS('\n' + '=' * 60))
        self.stdout.write(self.style.SUCCESS('Health check complete!'))
        self.stdout.write(self.style.SUCCESS('=' * 60 + '\n'))

