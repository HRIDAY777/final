from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Subject


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'code', 'credits', 'is_core', 'is_active', 'created_at'
    ]
    list_filter = ['is_core', 'is_active', 'credits', 'created_at']
    search_fields = ['name', 'code', 'description']
    list_editable = ['is_core', 'is_active']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['name']
    list_per_page = 25
    date_hierarchy = 'created_at'

    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'code', 'description')
        }),
        (_('Academic Details'), {
            'fields': ('credits', 'is_core')
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['activate_subjects', 'deactivate_subjects', 'mark_as_core', 'mark_as_elective']

    def activate_subjects(self, request, queryset):
        """Activate selected subjects"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} subject{"s" if updated > 1 else ""} activated successfully.')
    activate_subjects.short_description = "Activate selected subjects"

    def deactivate_subjects(self, request, queryset):
        """Deactivate selected subjects"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} subject{"s" if updated > 1 else ""} deactivated successfully.')
    deactivate_subjects.short_description = "Deactivate selected subjects"

    def mark_as_core(self, request, queryset):
        """Mark selected subjects as core subjects"""
        updated = queryset.update(is_core=True)
        self.message_user(request, f'{updated} subject{"s" if updated > 1 else ""} marked as core.')
    mark_as_core.short_description = "Mark as core subjects"

    def mark_as_elective(self, request, queryset):
        """Mark selected subjects as elective subjects"""
        updated = queryset.update(is_core=False)
        self.message_user(request, f'{updated} subject{"s" if updated > 1 else ""} marked as elective.')
    mark_as_elective.short_description = "Mark as elective subjects"
