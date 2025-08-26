import os

# Select settings module based on environment; default to dev for now
env = os.environ.get('DJANGO_SETTINGS_ENV', 'dev').lower()

if env == 'prod':
    from .prod import *  # noqa: F401,F403
elif env == 'production':
    from .production import *  # noqa: F401,F403
else:
    from .dev import *  # noqa: F401,F403