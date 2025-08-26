from django.contrib import admin
from django.utils.html import format_html
from .models import (
    SystemSetting, UserPreference, ApplicationConfig, 
    SettingAuditLog, FeatureFlag
)


@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = [
        'key', 'setting_type', 'category', 'is_public', 'is_required',
        'created_by', 'created_at'
    ]
    list_filter = [
        'setting_type', 'category', 'is_public', 'is_required', 'created_at'
    ]
    search_fields = ['key', 'description', 'value']
    ordering = ['category', 'key']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('key', 'value', 'setting_type', 'category', 'description')
        }),
        ('Access Control', {
            'fields': ('is_public', 'is_required')
        }),
        ('Validation', {
            'fields': ('validation_rules',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'key', 'preference_type', 'category', 'is_default', 'created_at'
    ]
    list_filter = [
        'preference_type', 'category', 'is_default', 'created_at'
    ]
    search_fields = [
        'user__username', 'user__email', 'key', 'description'
    ]
    ordering = ['user', 'category', 'key']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'key', 'value', 'preference_type', 'category', 'description')
        }),
        ('Settings', {
            'fields': ('is_default',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ApplicationConfig)
class ApplicationConfigAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'config_type', 'is_active', 'version', 'created_by', 'created_at'
    ]
    list_filter = [
        'config_type', 'is_active', 'created_at'
    ]
    search_fields = ['name', 'description']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'config_type', 'description', 'version')
        }),
        ('Configuration', {
            'fields': ('config_data', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SettingAuditLog)
class SettingAuditLogAdmin(admin.ModelAdmin):
    list_display = [
        'setting_key', 'action', 'user', 'ip_address', 'timestamp'
    ]
    list_filter = [
        'action', 'timestamp'
    ]
    search_fields = [
        'setting_key', 'user__username', 'user__email', 'ip_address'
    ]
    ordering = ['-timestamp']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'
    
    fieldsets = (
        ('Change Information', {
            'fields': ('setting_key', 'action', 'old_value', 'new_value')
        }),
        ('User Information', {
            'fields': ('user', 'ip_address', 'user_agent')
        }),
        ('Timestamp', {
            'fields': ('timestamp',)
        }),
    )


@admin.register(FeatureFlag)
class FeatureFlagAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'key', 'flag_type', 'is_enabled', 'created_by', 'created_at'
    ]
    list_filter = [
        'flag_type', 'is_enabled', 'created_at'
    ]
    search_fields = ['name', 'key', 'description']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'key', 'flag_type', 'description')
        }),
        ('Status', {
            'fields': ('is_enabled',)
        }),
        ('Configuration', {
            'fields': ('percentage_enabled', 'enabled_users', 'start_date', 'end_date')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
