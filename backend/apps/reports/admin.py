from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta

from .models import (
    ReportTemplate, ScheduledReport, GeneratedReport, ReportParameter,
    ReportCategory, ReportAccessLog, ReportExport, ReportComment, ReportDashboard
)


@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'report_type', 'format', 'is_public', 'is_active', 
        'created_by', 'created_at', 'usage_count'
    ]
    list_filter = [
        'report_type', 'format', 'is_public', 'is_active', 'created_at'
    ]
    search_fields = ['name', 'description', 'created_by__username']
    readonly_fields = ['id', 'created_at', 'updated_at', 'usage_count']
    # filter_horizontal removed - fields are not ManyToManyField
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'report_type', 'format')
        }),
        ('Configuration', {
            'fields': ('template_config', 'query_config')
        }),
        ('Styling', {
            'fields': ('header_template', 'footer_template', 'css_styles'),
            'classes': ('collapse',)
        }),
        ('Access Control', {
            'fields': ('is_public', 'created_by', 'shared_with')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def usage_count(self, obj):
        return obj.generated_reports.count()
    usage_count.short_description = 'Usage Count'
    
    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            usage_count=Count('generated_reports')
        )


@admin.register(ScheduledReport)
class ScheduledReportAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'template', 'frequency', 'status', 'is_active', 
        'next_run', 'last_run', 'created_by', 'recipient_count'
    ]
    list_filter = [
        'frequency', 'status', 'is_active', 'start_date', 'created_at'
    ]
    search_fields = ['name', 'description', 'template__name', 'created_by__username']
    readonly_fields = ['id', 'last_run', 'next_run', 'created_at', 'updated_at']
    # filter_horizontal removed - recipients is not ManyToManyField
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'template')
        }),
        ('Scheduling', {
            'fields': ('frequency', 'custom_schedule', 'start_date', 'end_date')
        }),
        ('Parameters', {
            'fields': ('parameters',),
            'classes': ('collapse',)
        }),
        ('Recipients', {
            'fields': ('recipients', 'email_subject', 'email_message')
        }),
        ('Status', {
            'fields': ('status', 'is_active')
        }),
        ('Tracking', {
            'fields': ('last_run', 'next_run'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def recipient_count(self, obj):
        return obj.recipients.count()
    recipient_count.short_description = 'Recipients'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('template', 'created_by')


@admin.register(GeneratedReport)
class GeneratedReportAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'template', 'status', 'file_format', 'file_size_display',
        'created_by', 'created_at', 'processing_time_display'
    ]
    list_filter = [
        'status', 'file_format', 'created_at', 'template__report_type'
    ]
    search_fields = ['name', 'description', 'template__name', 'created_by__username']
    readonly_fields = [
        'id', 'data_summary', 'progress', 'error_message', 'started_at', 
        'completed_at', 'processing_time', 'created_at', 'updated_at'
    ]
    # filter_horizontal removed - shared_with is not ManyToManyField
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'template', 'scheduled_report')
        }),
        ('Parameters & Data', {
            'fields': ('parameters', 'data_summary'),
            'classes': ('collapse',)
        }),
        ('File Information', {
            'fields': ('file_path', 'file_size', 'file_format')
        }),
        ('Status & Progress', {
            'fields': ('status', 'progress', 'error_message')
        }),
        ('Timing', {
            'fields': ('started_at', 'completed_at', 'processing_time'),
            'classes': ('collapse',)
        }),
        ('Access Control', {
            'fields': ('created_by', 'shared_with')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def file_size_display(self, obj):
        if obj.file_size:
            if obj.file_size < 1024:
                return f"{obj.file_size} B"
            elif obj.file_size < 1024 * 1024:
                return f"{obj.file_size / 1024:.1f} KB"
            else:
                return f"{obj.file_size / (1024 * 1024):.1f} MB"
        return "-"
    file_size_display.short_description = 'File Size'
    
    def processing_time_display(self, obj):
        if obj.processing_time:
            return str(obj.processing_time).split('.')[0]
        return "-"
    processing_time_display.short_description = 'Processing Time'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('template', 'scheduled_report', 'created_by')


@admin.register(ReportParameter)
class ReportParameterAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'display_name', 'parameter_type', 'is_required', 
        'is_visible', 'order', 'template_count'
    ]
    list_filter = ['parameter_type', 'is_required', 'is_visible', 'created_at']
    search_fields = ['name', 'display_name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    # filter_horizontal removed - templates is not ManyToManyField
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'display_name', 'parameter_type')
        }),
        ('Configuration', {
            'fields': ('default_value', 'options', 'validation_rules')
        }),
        ('Usage', {
            'fields': ('is_required', 'is_visible', 'order', 'templates')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def template_count(self, obj):
        return obj.templates.count()
    template_count.short_description = 'Templates'
    
    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            template_count=Count('templates')
        )


@admin.register(ReportCategory)
class ReportCategoryAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'parent', 'color_display', 'is_public', 
        'created_by', 'created_at'
    ]
    list_filter = ['is_public', 'created_at']
    search_fields = ['name', 'description', 'created_by__username']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'parent')
        }),
        ('Styling', {
            'fields': ('color', 'icon')
        }),
        ('Access Control', {
            'fields': ('is_public', 'created_by')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; border-radius: 3px;">{}</span>',
            obj.color, obj.color
        )
    color_display.short_description = 'Color'


@admin.register(ReportAccessLog)
class ReportAccessLogAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'report', 'action', 'ip_address', 'timestamp'
    ]
    list_filter = ['action', 'timestamp']
    search_fields = ['user__username', 'report__name', 'ip_address']
    readonly_fields = ['id', 'timestamp']
    
    fieldsets = (
        ('Access Information', {
            'fields': ('user', 'report', 'action')
        }),
        ('Context', {
            'fields': ('ip_address', 'user_agent', 'session_id'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'timestamp'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'report')


@admin.register(ReportExport)
class ReportExportAdmin(admin.ModelAdmin):
    list_display = [
        'report', 'format', 'file_size_display', 'download_count',
        'last_downloaded', 'created_at', 'expires_at'
    ]
    list_filter = ['format', 'created_at', 'expires_at']
    search_fields = ['report__name']
    readonly_fields = ['id', 'download_count', 'last_downloaded', 'created_at']
    
    fieldsets = (
        ('Export Information', {
            'fields': ('report', 'format', 'export_settings')
        }),
        ('File Information', {
            'fields': ('file_path', 'file_size', 'checksum')
        }),
        ('Access Tracking', {
            'fields': ('download_count', 'last_downloaded')
        }),
        ('Expiration', {
            'fields': ('expires_at',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def file_size_display(self, obj):
        if obj.file_size:
            if obj.file_size < 1024:
                return f"{obj.file_size} B"
            elif obj.file_size < 1024 * 1024:
                return f"{obj.file_size / 1024:.1f} KB"
            else:
                return f"{obj.file_size / (1024 * 1024):.1f} MB"
        return "-"
    file_size_display.short_description = 'File Size'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('report')


@admin.register(ReportComment)
class ReportCommentAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'report', 'is_public', 'created_at', 'content_preview'
    ]
    list_filter = ['is_public', 'created_at']
    search_fields = ['user__username', 'report__name', 'content']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Comment Information', {
            'fields': ('user', 'report', 'content', 'is_public')
        }),
        ('Annotation', {
            'fields': ('annotation_data',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def content_preview(self, obj):
        return obj.content[:100] + "..." if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content Preview'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'report')


@admin.register(ReportDashboard)
class ReportDashboardAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'is_public', 'is_active', 'created_by', 
        'created_at', 'widget_count'
    ]
    list_filter = ['is_public', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'created_by__username']
    readonly_fields = ['id', 'created_at', 'updated_at']
    # filter_horizontal removed - fields are not ManyToManyField
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description')
        }),
        ('Configuration', {
            'fields': ('layout_config', 'widget_configs'),
            'classes': ('collapse',)
        }),
        ('Access Control', {
            'fields': ('is_public', 'created_by', 'shared_with')
        }),
        ('Categories', {
            'fields': ('categories',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def widget_count(self, obj):
        if obj.widget_configs:
            return len(obj.widget_configs)
        return 0
    widget_count.short_description = 'Widgets'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by')


# Custom admin actions
@admin.action(description="Activate selected scheduled reports")
def activate_scheduled_reports(modeladmin, request, queryset):
    queryset.update(status='active', is_active=True)

@admin.action(description="Pause selected scheduled reports")
def pause_scheduled_reports(modeladmin, request, queryset):
    queryset.update(status='paused', is_active=False)

@admin.action(description="Regenerate failed reports")
def regenerate_failed_reports(modeladmin, request, queryset):
    failed_reports = queryset.filter(status='failed')
    for report in failed_reports:
        report.status = 'pending'
        report.progress = 0
        report.error_message = ''
        report.save()

# Add actions to admin classes
ScheduledReportAdmin.actions = [activate_scheduled_reports, pause_scheduled_reports]
GeneratedReportAdmin.actions = [regenerate_failed_reports]

