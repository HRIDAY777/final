"""
URL patterns for accounts app.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, UserRegistrationView, UserProfileView,
    UserUpdateView, PasswordChangeView, PasswordResetView,
    PasswordResetConfirmView, UserSessionsView, AuditLogView, logout_view,
    health_check
)

app_name = 'accounts'

urlpatterns = [
    # Authentication
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('logout/', logout_view, name='logout'),

    # User Management
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('update/', UserUpdateView.as_view(), name='update'),

    # Password Management
    path(
        'password/change/',
        PasswordChangeView.as_view(),
        name='password_change'
    ),
    path(
        'password/reset/',
        PasswordResetView.as_view(),
        name='password_reset'
    ),
    path(
        'password/reset/confirm/',
        PasswordResetConfirmView.as_view(),
        name='password_reset_confirm'
    ),

    # Security
    path('sessions/', UserSessionsView.as_view(), name='sessions'),
    path('audit-logs/', AuditLogView.as_view(), name='audit_logs'),
    
    # Health Check
    path('health/', health_check, name='health_check'),
]
