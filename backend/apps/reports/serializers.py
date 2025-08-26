from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import json

from .models import (
    ReportTemplate, ScheduledReport, GeneratedReport, ReportParameter,
    ReportCategory, ReportAccessLog, ReportExport, ReportComment, ReportDashboard
)

User = get_user_model()


# Use UserSerializer from accounts app instead
from apps.accounts.serializers import UserSerializer


class ReportParameterSerializer(serializers.ModelSerializer):
    """Serializer for ReportParameter model."""
    
    class Meta:
        model = ReportParameter
        fields = [
            'id', 'name', 'display_name', 'parameter_type', 'default_value',
            'options', 'validation_rules', 'is_required', 'is_visible', 'order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ReportCategorySerializer(serializers.ModelSerializer):
    """Serializer for ReportCategory model."""
    
    parent = serializers.PrimaryKeyRelatedField(
        queryset=ReportCategory.objects.all(), 
        required=False, 
        allow_null=True
    )
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportCategory
        fields = [
            'id', 'name', 'description', 'color', 'icon', 'parent', 'children',
            'is_public', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_children(self, obj):
        """Get child categories."""
        children = ReportCategory.objects.filter(parent=obj)
        return ReportCategorySerializer(children, many=True).data


class ReportTemplateSerializer(serializers.ModelSerializer):
    """Serializer for ReportTemplate model."""
    
    created_by = UserSerializer(read_only=True)
    shared_with = UserSerializer(many=True, read_only=True)
    parameters = ReportParameterSerializer(many=True, read_only=True)
    usage_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportTemplate
        fields = [
            'id', 'name', 'description', 'report_type', 'format',
            'template_config', 'query_config', 'header_template', 'footer_template',
            'css_styles', 'is_public', 'created_by', 'shared_with', 'parameters',
            'is_active', 'created_at', 'updated_at', 'usage_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'usage_count']
    
    def get_usage_count(self, obj):
        """Get the number of times this template has been used."""
        return obj.generated_reports.count()
    
    def validate_template_config(self, value):
        """Validate template configuration JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Template configuration must be a valid JSON object.")
        return value
    
    def validate_query_config(self, value):
        """Validate query configuration JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Query configuration must be a valid JSON object.")
        return value


class ReportTemplateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ReportTemplate with parameter assignments."""
    
    parameter_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = ReportTemplate
        fields = [
            'id', 'name', 'description', 'report_type', 'format',
            'template_config', 'query_config', 'header_template', 'footer_template',
            'css_styles', 'is_public', 'shared_with', 'is_active', 'parameter_ids'
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        parameter_ids = validated_data.pop('parameter_ids', [])
        template = super().create(validated_data)
        
        # Assign parameters
        if parameter_ids:
            parameters = ReportParameter.objects.filter(id__in=parameter_ids)
            template.parameters.set(parameters)
        
        return template


class ScheduledReportSerializer(serializers.ModelSerializer):
    """Serializer for ScheduledReport model."""
    
    template = ReportTemplateSerializer(read_only=True)
    template_id = serializers.UUIDField(write_only=True)
    recipients = UserSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    recipient_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ScheduledReport
        fields = [
            'id', 'name', 'description', 'template', 'template_id', 'parameters',
            'frequency', 'custom_schedule', 'start_date', 'end_date', 'last_run',
            'next_run', 'recipients', 'email_subject', 'email_message', 'status',
            'is_active', 'created_by', 'created_at', 'updated_at', 'recipient_count'
        ]
        read_only_fields = ['id', 'last_run', 'next_run', 'created_at', 'updated_at', 'recipient_count']
    
    def get_recipient_count(self, obj):
        """Get the number of recipients."""
        return obj.recipients.count()
    
    def validate_parameters(self, value):
        """Validate parameters JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Parameters must be a valid JSON object.")
        return value
    
    def validate(self, data):
        """Validate scheduling logic."""
        if data.get('end_date') and data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("End date must be after start date.")
        
        if data.get('frequency') == 'custom' and not data.get('custom_schedule'):
            raise serializers.ValidationError("Custom schedule is required when frequency is 'custom'.")
        
        return data


class ScheduledReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ScheduledReport with recipient assignments."""
    
    recipient_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = ScheduledReport
        fields = [
            'id', 'name', 'description', 'template', 'parameters', 'frequency',
            'custom_schedule', 'start_date', 'end_date', 'recipient_ids',
            'email_subject', 'email_message', 'status', 'is_active'
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        recipient_ids = validated_data.pop('recipient_ids', [])
        schedule = super().create(validated_data)
        
        # Assign recipients
        if recipient_ids:
            recipients = User.objects.filter(id__in=recipient_ids)
            schedule.recipients.set(recipients)
        
        return schedule


class GeneratedReportSerializer(serializers.ModelSerializer):
    """Serializer for GeneratedReport model."""
    
    template = ReportTemplateSerializer(read_only=True)
    scheduled_report = ScheduledReportSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    shared_with = UserSerializer(many=True, read_only=True)
    file_size_display = serializers.SerializerMethodField()
    processing_time_display = serializers.SerializerMethodField()
    
    class Meta:
        model = GeneratedReport
        fields = [
            'id', 'name', 'description', 'template', 'scheduled_report',
            'parameters', 'data_summary', 'file_path', 'file_size', 'file_size_display',
            'file_format', 'status', 'progress', 'error_message', 'started_at',
            'completed_at', 'processing_time', 'processing_time_display',
            'created_by', 'shared_with', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'data_summary', 'progress', 'error_message', 'started_at',
            'completed_at', 'processing_time', 'created_at', 'updated_at'
        ]
    
    def get_file_size_display(self, obj):
        """Get human-readable file size."""
        if obj.file_size:
            if obj.file_size < 1024:
                return f"{obj.file_size} B"
            elif obj.file_size < 1024 * 1024:
                return f"{obj.file_size / 1024:.1f} KB"
            else:
                return f"{obj.file_size / (1024 * 1024):.1f} MB"
        return "-"
    
    def get_processing_time_display(self, obj):
        """Get human-readable processing time."""
        if obj.processing_time:
            return str(obj.processing_time).split('.')[0]
        return "-"
    
    def validate_parameters(self, value):
        """Validate parameters JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Parameters must be a valid JSON object.")
        return value


class GeneratedReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating GeneratedReport with sharing."""
    
    shared_with_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = GeneratedReport
        fields = [
            'id', 'name', 'description', 'template', 'scheduled_report',
            'parameters', 'file_format', 'shared_with_ids'
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        shared_with_ids = validated_data.pop('shared_with_ids', [])
        report = super().create(validated_data)
        
        # Share with users
        if shared_with_ids:
            users = User.objects.filter(id__in=shared_with_ids)
            report.shared_with.set(users)
        
        return report


class ReportAccessLogSerializer(serializers.ModelSerializer):
    """Serializer for ReportAccessLog model."""
    
    user = UserSerializer(read_only=True)
    report = GeneratedReportSerializer(read_only=True)
    
    class Meta:
        model = ReportAccessLog
        fields = [
            'id', 'user', 'report', 'action', 'ip_address', 'user_agent',
            'session_id', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class ReportExportSerializer(serializers.ModelSerializer):
    """Serializer for ReportExport model."""
    
    report = GeneratedReportSerializer(read_only=True)
    file_size_display = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportExport
        fields = [
            'id', 'report', 'format', 'file_path', 'file_size', 'file_size_display',
            'checksum', 'export_settings', 'download_count', 'last_downloaded',
            'created_at', 'expires_at'
        ]
        read_only_fields = ['id', 'download_count', 'last_downloaded', 'created_at']
    
    def get_file_size_display(self, obj):
        """Get human-readable file size."""
        if obj.file_size:
            if obj.file_size < 1024:
                return f"{obj.file_size} B"
            elif obj.file_size < 1024 * 1024:
                return f"{obj.file_size / 1024:.1f} KB"
            else:
                return f"{obj.file_size / (1024 * 1024):.1f} MB"
        return "-"


class ReportCommentSerializer(serializers.ModelSerializer):
    """Serializer for ReportComment model."""
    
    user = UserSerializer(read_only=True)
    report = GeneratedReportSerializer(read_only=True)
    
    class Meta:
        model = ReportComment
        fields = [
            'id', 'report', 'user', 'content', 'is_public', 'annotation_data',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_annotation_data(self, value):
        """Validate annotation data JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Annotation data must be a valid JSON object.")
        return value


class ReportDashboardSerializer(serializers.ModelSerializer):
    """Serializer for ReportDashboard model."""
    
    created_by = UserSerializer(read_only=True)
    shared_with = UserSerializer(many=True, read_only=True)
    categories = ReportCategorySerializer(many=True, read_only=True)
    widget_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportDashboard
        fields = [
            'id', 'name', 'description', 'layout_config', 'widget_configs',
            'is_public', 'created_by', 'shared_with', 'categories', 'is_active',
            'created_at', 'updated_at', 'widget_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'widget_count']
    
    def get_widget_count(self, obj):
        """Get the number of widgets in the dashboard."""
        if obj.widget_configs:
            return len(obj.widget_configs)
        return 0
    
    def validate_layout_config(self, value):
        """Validate layout configuration JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Layout configuration must be a valid JSON object.")
        return value
    
    def validate_widget_configs(self, value):
        """Validate widget configurations JSON."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Widget configurations must be a valid JSON array.")
        return value


class ReportDashboardCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ReportDashboard with sharing and categories."""
    
    shared_with_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    category_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = ReportDashboard
        fields = [
            'id', 'name', 'description', 'layout_config', 'widget_configs',
            'is_public', 'is_active', 'shared_with_ids', 'category_ids'
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        shared_with_ids = validated_data.pop('shared_with_ids', [])
        category_ids = validated_data.pop('category_ids', [])
        dashboard = super().create(validated_data)
        
        # Share with users
        if shared_with_ids:
            users = User.objects.filter(id__in=shared_with_ids)
            dashboard.shared_with.set(users)
        
        # Assign categories
        if category_ids:
            categories = ReportCategory.objects.filter(id__in=category_ids)
            dashboard.categories.set(categories)
        
        return dashboard


# Specialized serializers for specific actions
class ReportGenerationSerializer(serializers.Serializer):
    """Serializer for report generation requests."""
    
    template_id = serializers.UUIDField()
    parameters = serializers.JSONField(default=dict)
    format = serializers.ChoiceField(choices=ReportTemplate.FORMAT_CHOICES, default='pdf')
    name = serializers.CharField(max_length=200)
    description = serializers.CharField(required=False, allow_blank=True)
    
    def validate_parameters(self, value):
        """Validate parameters JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Parameters must be a valid JSON object.")
        return value


class ReportScheduleSerializer(serializers.Serializer):
    """Serializer for scheduling report generation."""
    
    template_id = serializers.UUIDField()
    name = serializers.CharField(max_length=200)
    description = serializers.CharField(required=False, allow_blank=True)
    parameters = serializers.JSONField(default=dict)
    frequency = serializers.ChoiceField(choices=ScheduledReport.FREQUENCY_CHOICES)
    custom_schedule = serializers.CharField(required=False, allow_blank=True)
    start_date = serializers.DateTimeField()
    end_date = serializers.DateTimeField(required=False, allow_null=True)
    recipient_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    email_subject = serializers.CharField(required=False, allow_blank=True)
    email_message = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        """Validate scheduling logic."""
        if data.get('end_date') and data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("End date must be after start date.")
        
        if data.get('frequency') == 'custom' and not data.get('custom_schedule'):
            raise serializers.ValidationError("Custom schedule is required when frequency is 'custom'.")
        
        return data


class ReportExportRequestSerializer(serializers.Serializer):
    """Serializer for report export requests."""
    
    report_id = serializers.UUIDField()
    format = serializers.ChoiceField(choices=ReportExport.EXPORT_FORMATS)
    export_settings = serializers.JSONField(default=dict)
    
    def validate_export_settings(self, value):
        """Validate export settings JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Export settings must be a valid JSON object.")
        return value


class ReportSearchSerializer(serializers.Serializer):
    """Serializer for report search parameters."""
    
    query = serializers.CharField(required=False, allow_blank=True)
    report_type = serializers.ChoiceField(
        choices=ReportTemplate.REPORT_TYPES,
        required=False,
        allow_blank=True
    )
    status = serializers.ChoiceField(
        choices=GeneratedReport.STATUS_CHOICES,
        required=False,
        allow_blank=True
    )
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    created_by = serializers.IntegerField(required=False)
    
    def validate(self, data):
        """Validate search parameters."""
        if data.get('date_from') and data.get('date_to'):
            if data['date_from'] > data['date_to']:
                raise serializers.ValidationError("Date from must be before date to.")
        return data


class ReportAnalyticsSerializer(serializers.Serializer):
    """Serializer for report analytics data."""
    
    total_reports = serializers.IntegerField()
    reports_by_type = serializers.DictField()
    reports_by_status = serializers.DictField()
    reports_by_format = serializers.DictField()
    average_processing_time = serializers.DurationField()
    total_file_size = serializers.IntegerField()
    recent_activity = serializers.ListField()
    
    class Meta:
        fields = [
            'total_reports', 'reports_by_type', 'reports_by_status',
            'reports_by_format', 'average_processing_time', 'total_file_size',
            'recent_activity'
        ]


class ReportTemplatePreviewSerializer(serializers.Serializer):
    """Serializer for report template preview."""
    
    template_id = serializers.UUIDField()
    parameters = serializers.JSONField(default=dict)
    sample_data = serializers.JSONField(default=dict)
    
    def validate_parameters(self, value):
        """Validate parameters JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Parameters must be a valid JSON object.")
        return value
    
    def validate_sample_data(self, value):
        """Validate sample data JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Sample data must be a valid JSON object.")
        return value


# List Serializers for concise views
class ReportTemplateListSerializer(serializers.ModelSerializer):
    """List serializer for report templates."""
    
    created_by = serializers.StringRelatedField()
    shared_with_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportTemplate
        fields = [
            'id', 'name', 'report_type', 'format', 'is_public', 'is_active',
            'created_by', 'shared_with_count', 'created_at'
        ]
    
    def get_shared_with_count(self, obj):
        return obj.shared_with.count()


class GeneratedReportListSerializer(serializers.ModelSerializer):
    """List serializer for generated reports."""
    
    template = serializers.StringRelatedField()
    generated_by = serializers.StringRelatedField()
    
    class Meta:
        model = GeneratedReport
        fields = [
            'id', 'name', 'template', 'status', 'generated_by',
            'processing_time', 'created_at'
        ]


class ReportExportListSerializer(serializers.ModelSerializer):
    """List serializer for report exports."""
    
    report = serializers.StringRelatedField()
    exported_by = serializers.StringRelatedField()
    
    class Meta:
        model = ReportExport
        fields = [
            'id', 'report', 'format', 'file_size', 'exported_by',
            'download_count', 'created_at'
        ]

