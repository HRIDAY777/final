from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

# Register all viewsets
router.register(r'system-settings', views.SystemSettingViewSet)
router.register(r'user-preferences', views.UserPreferenceViewSet)
router.register(r'application-configs', views.ApplicationConfigViewSet)
router.register(r'audit-logs', views.SettingAuditLogViewSet)
router.register(r'feature-flags', views.FeatureFlagViewSet)
router.register(r'dashboard', views.SettingsDashboardViewSet, basename='settings-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
