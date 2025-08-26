"""
Admin configuration for user models.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, UserSession, AuditLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom user admin with extended fields.
    """
    list_display = [
        'email', 'get_full_name', 'user_type', 'is_active',
        'is_verified', 'last_login', 'created_at'
    ]
    list_filter = [
        'user_type', 'is_active', 'is_verified', 'email_verified',
        'phone_verified', 'mfa_enabled', 'created_at', 'last_login'
    ]
    search_fields = ['email', 'first_name', 'last_name', 'phone_number']
    ordering = ['-created_at']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {
            'fields': (
                'first_name', 'last_name', 'phone_number',
                'profile_picture', 'date_of_birth', 'gender'
            )
        }),
        ('Address', {
            'fields': ('address', 'city', 'state', 'country', 'postal_code')
        }),
        ('Permissions', {
            'fields': (
                'user_type', 'is_active', 'is_verified', 'email_verified',
                'phone_verified', 'is_staff', 'is_superuser', 'groups',
                'user_permissions'
            )
        }),
        ('Security', {
            'fields': ('mfa_enabled', 'failed_login_attempts', 'locked_until')
        }),
        ('Preferences', {
            'fields': ('language', 'timezone', 'notification_preferences')
        }),
        ('Important dates', {
            'fields': ('last_login', 'created_at', 'last_activity')
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'first_name', 'last_name', 'password1', 'password2'
            ),
        }),
    )

    readonly_fields = [
        'created_at', 'last_activity', 'failed_login_attempts', 'locked_until'
    ]

    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = 'Full Name'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('profile')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    Admin for user profiles.
    """
    list_display = [
        'user', 'student_id', 'teacher_id', 'department', 'profile_visibility'
    ]
    list_filter = ['profile_visibility', 'created_at']
    search_fields = [
        'user__email', 'user__first_name', 'user__last_name',
        'student_id', 'teacher_id'
    ]
    raw_id_fields = ['user']

    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Academic Information', {
            'fields': (
                'student_id', 'teacher_id', 'department', 'specialization'
            )
        }),
        ('Emergency Contact', {
            'fields': (
                'emergency_contact_name', 'emergency_contact_phone',
                'emergency_contact_relationship'
            )
        }),
        ('Social Media', {
            'fields': ('linkedin_url', 'twitter_url', 'facebook_url')
        }),
        ('Additional Information', {
            'fields': ('bio', 'skills', 'interests')
        }),
        ('Privacy', {
            'fields': ('profile_visibility',)
        }),
    )


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    """
    Admin for user sessions.
    """
    list_display = [
        'user', 'ip_address', 'created_at', 'last_activity', 'is_active'
    ]
    list_filter = ['is_active', 'created_at', 'last_activity']
    search_fields = ['user__email', 'ip_address', 'user_agent']
    raw_id_fields = ['user']
    readonly_fields = ['session_key', 'created_at', 'last_activity']

    def has_add_permission(self, request):
        return False


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """
    Admin for audit logs.
    """
    list_display = [
        'user', 'action', 'resource_type', 'resource_id', 'timestamp',
        'ip_address'
    ]
    list_filter = ['action', 'resource_type', 'timestamp']
    search_fields = [
        'user__email', 'action', 'resource_type', 'resource_id', 'ip_address'
    ]
    raw_id_fields = ['user']
    readonly_fields = [
        'user', 'action', 'resource_type', 'resource_id', 'details',
        'ip_address', 'user_agent', 'timestamp'
    ]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
