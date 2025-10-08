"""
Admin configuration for user models.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, UserProfile, UserSession, AuditLog,
    AdminRole, AdminAssignment
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom user admin with extended fields.
    """
    list_display = [
        'email', 'get_full_name', 'user_type', 'admin_level', 'is_active',
        'is_verified', 'last_login', 'created_at'
    ]
    list_filter = [
        'user_type', 'admin_level', 'is_active', 'is_verified',
        'email_verified', 'phone_verified', 'mfa_enabled',
        'created_at', 'last_login'
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
                'user_type', 'admin_level', 'is_active', 'is_verified',
                'email_verified', 'phone_verified', 'is_staff',
                'is_superuser', 'groups', 'user_permissions'
            )
        }),
        ('Admin Permissions', {
            'fields': (
                'can_manage_users', 'can_manage_admins',
                'can_manage_institutes', 'can_manage_tenants',
                'can_view_analytics', 'can_manage_settings',
                'can_manage_billing', 'can_manage_security',
                'admin_institutes'
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

    def get_admin_permissions(self, obj):
        """Display admin permissions."""
        return ', '.join(obj.get_admin_permissions())
    get_admin_permissions.short_description = 'Admin Permissions'


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


@admin.register(AdminRole)
class AdminRoleAdmin(admin.ModelAdmin):
    """
    Admin for admin roles.
    """
    list_display = [
        'name', 'role_type', 'is_active', 'created_by', 'created_at'
    ]
    list_filter = ['role_type', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    filter_horizontal = ['applicable_institutes']

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'role_type', 'description', 'is_active')
        }),
        ('Permissions', {
            'fields': (
                'can_manage_users', 'can_manage_admins',
                'can_manage_institutes', 'can_manage_tenants',
                'can_view_analytics', 'can_manage_settings',
                'can_manage_billing', 'can_manage_security'
            )
        }),
        ('Scope', {
            'fields': ('applicable_institutes',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )

    readonly_fields = ['created_at', 'updated_at']

    def get_permissions_display(self, obj):
        """Display permissions for this role."""
        return ', '.join(obj.get_permissions())
    get_permissions_display.short_description = 'Permissions'


@admin.register(AdminAssignment)
class AdminAssignmentAdmin(admin.ModelAdmin):
    """
    Admin for admin assignments.
    """
    list_display = [
        'user', 'role', 'institute', 'assigned_by', 'assigned_at',
        'is_active', 'is_expired'
    ]
    list_filter = [
        'role__role_type', 'is_active', 'assigned_at', 'expires_at'
    ]
    search_fields = [
        'user__email', 'user__first_name', 'user__last_name',
        'role__name', 'institute__name'
    ]
    raw_id_fields = ['user', 'role', 'institute', 'assigned_by']

    fieldsets = (
        ('Assignment', {
            'fields': ('user', 'role', 'institute')
        }),
        ('Details', {
            'fields': ('assigned_by', 'assigned_at', 'expires_at', 'is_active')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
    )

    readonly_fields = ['assigned_at']

    def is_expired(self, obj):
        """Check if assignment is expired."""
        return obj.is_expired()
    is_expired.boolean = True
    is_expired.short_description = 'Expired'
