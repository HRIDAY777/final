"""
Management command to setup production environment.
"""
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.conf import settings
import os


class Command(BaseCommand):
    help = 'Setup production environment with all necessary configurations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--skip-migrations',
            action='store_true',
            help='Skip database migrations',
        )
        parser.add_argument(
            '--skip-static',
            action='store_true',
            help='Skip static files collection',
        )
        parser.add_argument(
            '--create-superuser',
            action='store_true',
            help='Create superuser from environment variables',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('PRODUCTION SETUP'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        
        # Check environment
        if settings.DEBUG:
            self.stdout.write(self.style.WARNING('\n⚠ WARNING: DEBUG is True!'))
            self.stdout.write(self.style.WARNING('This should be False in production.\n'))
        
        # Create required directories
        self.stdout.write('\n📁 Creating required directories...')
        directories = [
            settings.STATIC_ROOT,
            settings.MEDIA_ROOT,
            settings.BASE_DIR / 'logs',
            settings.BASE_DIR / 'backups',
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
            self.stdout.write(self.style.SUCCESS(f'  ✓ {directory}'))
        
        # Run migrations
        if not options['skip_migrations']:
            self.stdout.write('\n💾 Running database migrations...')
            try:
                call_command('migrate', '--noinput')
                self.stdout.write(self.style.SUCCESS('  ✓ Migrations complete'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ✗ Migration failed: {e}'))
                return
        
        # Collect static files
        if not options['skip_static']:
            self.stdout.write('\n📦 Collecting static files...')
            try:
                call_command('collectstatic', '--noinput', '--clear')
                self.stdout.write(self.style.SUCCESS('  ✓ Static files collected'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ✗ Static collection failed: {e}'))
        
        # Create superuser
        if options['create_superuser']:
            self.stdout.write('\n👤 Creating superuser...')
            try:
                call_command('create_superuser_auto')
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ✗ Superuser creation failed: {e}'))
        
        # Check system
        self.stdout.write('\n🔍 Running system checks...')
        try:
            call_command('check', '--deploy')
            self.stdout.write(self.style.SUCCESS('  ✓ System checks passed'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'  ⚠ System checks warning: {e}'))
        
        # Security checks
        self.stdout.write('\n🔒 Security Configuration:')
        security_settings = [
            ('SECRET_KEY', bool(settings.SECRET_KEY != 'dev-secret-key-for-development-only')),
            ('DEBUG', not settings.DEBUG),
            ('ALLOWED_HOSTS', len(settings.ALLOWED_HOSTS) > 0),
            ('SECURE_SSL_REDIRECT', getattr(settings, 'SECURE_SSL_REDIRECT', False)),
            ('SESSION_COOKIE_SECURE', getattr(settings, 'SESSION_COOKIE_SECURE', False)),
            ('CSRF_COOKIE_SECURE', getattr(settings, 'CSRF_COOKIE_SECURE', False)),
        ]
        
        for setting_name, is_correct in security_settings:
            if is_correct:
                self.stdout.write(self.style.SUCCESS(f'  ✓ {setting_name}'))
            else:
                self.stdout.write(self.style.WARNING(f'  ⚠ {setting_name} needs attention'))
        
        self.stdout.write(self.style.SUCCESS('\n' + '=' * 60))
        self.stdout.write(self.style.SUCCESS('Production setup complete!'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        
        # Next steps
        self.stdout.write(self.style.WARNING('\n📝 Next Steps:'))
        self.stdout.write('  1. Configure your web server (Nginx/Apache)')
        self.stdout.write('  2. Set up SSL certificates')
        self.stdout.write('  3. Configure firewall rules')
        self.stdout.write('  4. Set up monitoring and logging')
        self.stdout.write('  5. Configure automated backups')
        self.stdout.write('  6. Test the deployment')
        self.stdout.write('')

