from django.apps import AppConfig


class AIToolsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.ai_tools'
    verbose_name = 'AI Tools & Automation'

    def ready(self):
        # Import signals to register them
        import apps.ai_tools.signals  # noqa: F401
