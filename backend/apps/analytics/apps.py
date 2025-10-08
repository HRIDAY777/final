from django.apps import AppConfig


class AnalyticsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.analytics'
    verbose_name = 'Analytics & Insights'

    def ready(self):
        # Import signals to register them
        import apps.analytics.signals  # noqa: F401
