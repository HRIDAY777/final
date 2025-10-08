import os

# Select settings module based on environment
env = os.environ.get('DJANGO_SETTINGS_ENV', 'dev').lower()

if env in ['prod', 'production']:
    from .prod import *  # noqa: F401,F403
else:
    from .dev import *  # noqa: F401,F403
