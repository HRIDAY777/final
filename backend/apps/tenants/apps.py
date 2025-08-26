"""
App configuration for tenants app.
"""

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class TenantsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.tenants'
    verbose_name = _('Multi-Tenant Management')
    
    def ready(self):
        """Import signals when app is ready"""
        import apps.tenants.signals
