"""
URLs for the accounts app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'admin-roles', views.AdminRoleViewSet)
router.register(r'admin-assignments', views.AdminAssignmentViewSet)
router.register(r'audit-logs', views.AuditLogViewSet)
router.register(
    r'permissions', views.PermissionCheckViewSet, basename='permissions'
)

urlpatterns = [
    # API endpoints
    path('api/', include(router.urls)),

    # Social OAuth endpoints
    path('auth/facebook/', views.FacebookLoginView.as_view(), name='facebook_login'),
    path('auth/facebook/callback/', views.FacebookCallbackView.as_view(), name='facebook_callback'),
    path('auth/google/callback/', views.GoogleCallbackView.as_view(), name='google_callback'),
]
