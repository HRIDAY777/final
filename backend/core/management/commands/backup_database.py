"""
Management command to backup the database.
"""
import os
import subprocess
from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone


class Command(BaseCommand):
    help = 'Create a database backup'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            type=str,
            help='Output file path for the backup'
        )
        parser.add_argument(
            '--compress',
            action='store_true',
            help='Compress the backup file'
        )

    def handle(self, *args, **options):
        self.stdout.write('Creating database backup...')
        
        # Create backup directory
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        os.makedirs(backup_dir, exist_ok=True)
        
        # Generate backup filename
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        if options['output']:
            backup_file = options['output']
        else:
            backup_file = os.path.join(backup_dir, f'backup_{timestamp}.sql')
        
        try:
            if settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql':
                self.backup_postgresql(backup_file, options)
            elif settings.DATABASES['default']['ENGINE'] == 'django.db.backends.mysql':
                self.backup_mysql(backup_file, options)
            else:
                self.backup_sqlite(backup_file, options)
            
            self.stdout.write(
                self.style.SUCCESS(f'Database backup created successfully: {backup_file}')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to create database backup: {e}')
            )

    def backup_postgresql(self, backup_file, options):
        """Backup PostgreSQL database."""
        db_settings = settings.DATABASES['default']
        
        cmd = [
            'pg_dump',
            '-h', db_settings['HOST'],
            '-U', db_settings['USER'],
            '-d', db_settings['NAME'],
            '-f', backup_file
        ]
        
        if db_settings.get('PASSWORD'):
            os.environ['PGPASSWORD'] = db_settings['PASSWORD']
        
        subprocess.run(cmd, check=True)
        
        if options['compress']:
            self.compress_file(backup_file)

    def backup_mysql(self, backup_file, options):
        """Backup MySQL database."""
        db_settings = settings.DATABASES['default']
        
        cmd = [
            'mysqldump',
            '-h', db_settings['HOST'],
            '-u', db_settings['USER'],
            '-p' + db_settings.get('PASSWORD', ''),
            db_settings['NAME'],
            '>', backup_file
        ]
        
        subprocess.run(' '.join(cmd), shell=True, check=True)
        
        if options['compress']:
            self.compress_file(backup_file)

    def backup_sqlite(self, backup_file, options):
        """Backup SQLite database."""
        import shutil
        
        db_file = settings.DATABASES['default']['NAME']
        shutil.copy2(db_file, backup_file)
        
        if options['compress']:
            self.compress_file(backup_file)

    def compress_file(self, file_path):
        """Compress a file using gzip."""
        import gzip
        
        with open(file_path, 'rb') as f_in:
            with gzip.open(file_path + '.gz', 'wb') as f_out:
                f_out.writelines(f_in)
        
        # Remove original file
        os.remove(file_path)
        
        self.stdout.write(f'Backup compressed: {file_path}.gz')
