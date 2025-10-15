"""
Management command to create database backups.
"""
import os
import subprocess
from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = 'Create database backup'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            type=str,
            help='Output file path for backup',
        )

    def handle(self, *args, **options):
        backup_dir = settings.BASE_DIR / 'backups'
        backup_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        if options['output']:
            backup_file = options['output']
        else:
            backup_file = backup_dir / f'db_backup_{timestamp}.sql'
        
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('DATABASE BACKUP'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(f'Backup file: {backup_file}\n')
        
        db_settings = settings.DATABASES['default']
        
        try:
            if db_settings['ENGINE'] == 'django.db.backends.postgresql':
                self._backup_postgresql(db_settings, backup_file)
            elif db_settings['ENGINE'] == 'django.db.backends.sqlite3':
                self._backup_sqlite(db_settings, backup_file)
            elif db_settings['ENGINE'] == 'django.db.backends.mysql':
                self._backup_mysql(db_settings, backup_file)
            else:
                self.stdout.write(self.style.ERROR(f'Unsupported database engine: {db_settings["ENGINE"]}'))
                return
            
            # Check if backup was created
            if os.path.exists(backup_file):
                file_size = os.path.getsize(backup_file) / (1024 * 1024)  # MB
                self.stdout.write(self.style.SUCCESS(f'\n✓ Backup created successfully!'))
                self.stdout.write(self.style.SUCCESS(f'  File: {backup_file}'))
                self.stdout.write(self.style.SUCCESS(f'  Size: {file_size:.2f} MB'))
                
                # Compress backup
                self.stdout.write('\nCompressing backup...')
                self._compress_backup(backup_file)
            else:
                self.stdout.write(self.style.ERROR('✗ Backup file was not created'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Backup failed: {e}'))
        
        self.stdout.write(self.style.SUCCESS('\n' + '=' * 60))

    def _backup_postgresql(self, db_settings, backup_file):
        """Backup PostgreSQL database."""
        env = os.environ.copy()
        env['PGPASSWORD'] = db_settings['PASSWORD']
        
        cmd = [
            'pg_dump',
            '-h', db_settings['HOST'],
            '-U', db_settings['USER'],
            '-d', db_settings['NAME'],
            '-p', str(db_settings['PORT']),
            '-F', 'c',  # Custom format
            '-f', str(backup_file)
        ]
        
        self.stdout.write('Backing up PostgreSQL database...')
        subprocess.run(cmd, env=env, check=True)

    def _backup_sqlite(self, db_settings, backup_file):
        """Backup SQLite database."""
        import shutil
        
        self.stdout.write('Backing up SQLite database...')
        shutil.copy2(db_settings['NAME'], backup_file)

    def _backup_mysql(self, db_settings, backup_file):
        """Backup MySQL database."""
        cmd = [
            'mysqldump',
            '-h', db_settings['HOST'],
            '-u', db_settings['USER'],
            f'-p{db_settings["PASSWORD"]}',
            '-P', str(db_settings['PORT']),
            db_settings['NAME'],
            '--result-file', str(backup_file)
        ]
        
        self.stdout.write('Backing up MySQL database...')
        subprocess.run(cmd, check=True)

    def _compress_backup(self, backup_file):
        """Compress backup file using gzip."""
        try:
            import gzip
            import shutil
            
            compressed_file = f'{backup_file}.gz'
            
            with open(backup_file, 'rb') as f_in:
                with gzip.open(compressed_file, 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)
            
            # Remove uncompressed file
            os.remove(backup_file)
            
            compressed_size = os.path.getsize(compressed_file) / (1024 * 1024)  # MB
            self.stdout.write(self.style.SUCCESS(f'✓ Backup compressed: {compressed_file}'))
            self.stdout.write(self.style.SUCCESS(f'  Compressed size: {compressed_size:.2f} MB'))
            
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'⚠ Compression failed: {e}'))

