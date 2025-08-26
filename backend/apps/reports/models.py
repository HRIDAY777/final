from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import FileExtensionValidator
from django.utils import timezone
import uuid
import json

User = get_user_model()


class ReportTemplate(models.Model):
    """
    Model for storing report templates and configurations.
    """
    REPORT_TYPES = [
        ('academic', 'Academic Report'),
        ('attendance', 'Attendance Report'),
        ('financial', 'Financial Report'),
        ('performance', 'Performance Report'),
        ('analytics', 'Analytics Report'),
        ('custom', 'Custom Report'),
    ]
    
    FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV'),
        ('json', 'JSON'),
        ('html', 'HTML'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default='pdf')
    
    # Template configuration
    template_config = models.JSONField(default=dict, help_text="JSON configuration for report layout and fields")
    query_config = models.JSONField(default=dict, help_text="JSON configuration for data queries")
    
    # Styling and branding
    header_template = models.TextField(blank=True, help_text="HTML template for report header")
    footer_template = models.TextField(blank=True, help_text="HTML template for report footer")
    css_styles = models.TextField(blank=True, help_text="Custom CSS styles for the report")
    
    # Access control
    is_public = models.BooleanField(default=False, help_text="Whether this template is available to all users")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_report_templates')
    shared_with = models.ManyToManyField(User, blank=True, related_name='shared_templates')
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Report Template'
        verbose_name_plural = 'Report Templates'
    
    def __str__(self):
        return f"{self.name} ({self.get_report_type_display()})"


class ScheduledReport(models.Model):
    """
    Model for scheduling automated report generation.
    """
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
        ('custom', 'Custom'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Template and configuration
    template = models.ForeignKey(ReportTemplate, on_delete=models.CASCADE, related_name='scheduled_reports')
    parameters = models.JSONField(default=dict, help_text="Parameters to pass to the report template")
    
    # Scheduling
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    custom_schedule = models.CharField(max_length=200, blank=True, help_text="Cron expression for custom scheduling")
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    last_run = models.DateTimeField(null=True, blank=True)
    next_run = models.DateTimeField(null=True, blank=True)
    
    # Recipients
    recipients = models.ManyToManyField(User, related_name='scheduled_reports')
    email_subject = models.CharField(max_length=200, blank=True)
    email_message = models.TextField(blank=True)
    
    # Status and tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_schedules')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Scheduled Report'
        verbose_name_plural = 'Scheduled Reports'
    
    def __str__(self):
        return f"{self.name} - {self.get_frequency_display()}"


class GeneratedReport(models.Model):
    """
    Model for storing generated reports and their metadata.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Template and generation
    template = models.ForeignKey(ReportTemplate, on_delete=models.CASCADE, related_name='generated_reports')
    scheduled_report = models.ForeignKey(ScheduledReport, on_delete=models.SET_NULL, null=True, blank=True, related_name='generated_reports')
    
    # Parameters and data
    parameters = models.JSONField(default=dict, help_text="Parameters used to generate this report")
    data_summary = models.JSONField(default=dict, help_text="Summary of data included in the report")
    
    # File storage
    file_path = models.CharField(max_length=500, blank=True, help_text="Path to the generated report file")
    file_size = models.BigIntegerField(default=0, help_text="Size of the generated file in bytes")
    file_format = models.CharField(max_length=10, choices=ReportTemplate.FORMAT_CHOICES)
    
    # Status and tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    progress = models.IntegerField(default=0, help_text="Generation progress percentage")
    error_message = models.TextField(blank=True, help_text="Error message if generation failed")
    
    # Timing
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    processing_time = models.DurationField(null=True, blank=True)
    
    # Access control
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_reports')
    shared_with = models.ManyToManyField(User, blank=True, related_name='shared_reports')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Generated Report'
        verbose_name_plural = 'Generated Reports'
    
    def __str__(self):
        return f"{self.name} - {self.get_status_display()}"


class ReportParameter(models.Model):
    """
    Model for defining parameters that can be used in report templates.
    """
    PARAMETER_TYPES = [
        ('text', 'Text'),
        ('number', 'Number'),
        ('date', 'Date'),
        ('datetime', 'Date & Time'),
        ('select', 'Select'),
        ('multiselect', 'Multi-Select'),
        ('boolean', 'Boolean'),
        ('range', 'Range'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    display_name = models.CharField(max_length=200)
    parameter_type = models.CharField(max_length=20, choices=PARAMETER_TYPES)
    
    # Configuration
    default_value = models.TextField(blank=True, help_text="Default value for the parameter")
    options = models.JSONField(default=list, blank=True, help_text="Options for select/multiselect parameters")
    validation_rules = models.JSONField(default=dict, blank=True, help_text="Validation rules for the parameter")
    
    # Usage
    is_required = models.BooleanField(default=False)
    is_visible = models.BooleanField(default=True)
    order = models.IntegerField(default=0, help_text="Display order in parameter forms")
    
    # Templates that use this parameter
    templates = models.ManyToManyField(ReportTemplate, related_name='parameters')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'Report Parameter'
        verbose_name_plural = 'Report Parameters'
    
    def __str__(self):
        return f"{self.display_name} ({self.get_parameter_type_display()})"


class ReportCategory(models.Model):
    """
    Model for categorizing reports and templates.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#3B82F6', help_text="Hex color code for the category")
    icon = models.CharField(max_length=50, blank=True, help_text="Icon class or identifier")
    
    # Hierarchy
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    
    # Access control
    is_public = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_categories')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Report Category'
        verbose_name_plural = 'Report Categories'
    
    def __str__(self):
        return self.name


class ReportAccessLog(models.Model):
    """
    Model for tracking report access and usage.
    """
    ACTION_CHOICES = [
        ('view', 'View'),
        ('download', 'Download'),
        ('share', 'Share'),
        ('schedule', 'Schedule'),
        ('generate', 'Generate'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='report_access_logs')
    report = models.ForeignKey(GeneratedReport, on_delete=models.CASCADE, related_name='access_logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    
    # Context
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    session_id = models.CharField(max_length=100, blank=True)
    
    # Metadata
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Report Access Log'
        verbose_name_plural = 'Report Access Logs'
    
    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.report.name}"


class ReportExport(models.Model):
    """
    Model for managing report exports and downloads.
    """
    EXPORT_FORMATS = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV'),
        ('json', 'JSON'),
        ('xml', 'XML'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report = models.ForeignKey(GeneratedReport, on_delete=models.CASCADE, related_name='exports')
    format = models.CharField(max_length=10, choices=EXPORT_FORMATS)
    
    # File information
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField(default=0)
    checksum = models.CharField(max_length=64, blank=True, help_text="SHA256 checksum of the file")
    
    # Export settings
    export_settings = models.JSONField(default=dict, help_text="Settings used for the export")
    
    # Access tracking
    download_count = models.IntegerField(default=0)
    last_downloaded = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True, help_text="When the export file expires")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Report Export'
        verbose_name_plural = 'Report Exports'
    
    def __str__(self):
        return f"{self.report.name} - {self.get_format_display()}"


class ReportComment(models.Model):
    """
    Model for comments and annotations on reports.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report = models.ForeignKey(GeneratedReport, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='report_comments')
    
    # Comment content
    content = models.TextField()
    is_public = models.BooleanField(default=True, help_text="Whether this comment is visible to all report viewers")
    
    # Annotation
    annotation_data = models.JSONField(default=dict, blank=True, help_text="Annotation data (e.g., highlighted text, coordinates)")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Report Comment'
        verbose_name_plural = 'Report Comments'
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.report.name}"


class ReportDashboard(models.Model):
    """
    Model for creating custom report dashboards.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Dashboard configuration
    layout_config = models.JSONField(default=dict, help_text="Dashboard layout configuration")
    widget_configs = models.JSONField(default=list, help_text="Configuration for dashboard widgets")
    
    # Access control
    is_public = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_report_dashboards')
    shared_with = models.ManyToManyField(User, blank=True, related_name='shared_dashboards')
    
    # Categories
    categories = models.ManyToManyField(ReportCategory, blank=True, related_name='dashboards')
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Report Dashboard'
        verbose_name_plural = 'Report Dashboards'
    
    def __str__(self):
        return self.name

