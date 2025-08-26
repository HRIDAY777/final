"""
Celery configuration for EduCore Ultra.
"""

import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.prod')

app = Celery('educore_ultra')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat Schedule
app.conf.beat_schedule = {
    'cleanup-expired-sessions': {
        'task': 'apps.accounts.tasks.cleanup_expired_sessions',
        'schedule': 3600.0,  # Every hour
    },
    'send-reminder-emails': {
        'task': 'apps.accounts.tasks.send_reminder_emails',
        'schedule': 86400.0,  # Daily
    },
    'generate-analytics-reports': {
        'task': 'apps.analytics.tasks.generate_daily_reports',
        'schedule': 86400.0,  # Daily
    },
    'backup-database': {
        'task': 'apps.tenants.tasks.backup_database',
        'schedule': 604800.0,  # Weekly
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
