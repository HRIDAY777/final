from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone

from .models import (
    AIModel, AIQuizGenerator, AIQuestion, AILessonSummarizer,
    AIPerformancePredictor, AIAttendanceAnomalyDetector,
    AINaturalLanguageQuery, AITrainingJob, AIDataSource, AIUsageLog
)


@admin.register(AIModel)
class AIModelAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'model_type', 'version', 'status',
        'is_active', 'accuracy_display', 'created_by',
        'created_at'
    ]
    list_filter = [
        'model_type', 'status', 'is_active', 'created_at'
    ]
    search_fields = ['name', 'description', 'created_by__username']
    readonly_fields = ['id', 'created_at', 'updated_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'model_type', 'version')
        }),
        ('Configuration', {
            'fields': ('model_config', 'hyperparameters', 'model_path')
        }),
        ('Performance Metrics', {
            'fields': ('accuracy', 'precision', 'recall', 'f1_score')
        }),
        ('Status & Tracking', {
            'fields': (
                'status', 'is_active', 'last_trained', 'training_duration'
            )
        }),
        ('Access Control', {
            'fields': ('created_by', 'shared_with')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def accuracy_display(self, obj):
        if obj.accuracy:
            color = ('green' if obj.accuracy >= 0.8
                     else 'orange' if obj.accuracy >= 0.6 else 'red')
            return format_html(
                '<span style="color: {};">{:.2%}</span>',
                color, obj.accuracy
            )
        return "-"
    accuracy_display.short_description = 'Accuracy'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by')


@admin.register(AIQuizGenerator)
class AIQuizGeneratorAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'subject', 'difficulty', 'question_count',
        'is_generated', 'generation_status', 'created_by',
        'created_at'
    ]
    list_filter = [
        'difficulty', 'is_generated', 'generation_status', 'created_at'
    ]
    search_fields = [
        'title', 'description', 'subject__name', 'created_by__username'
    ]
    readonly_fields = ['id', 'generated_at', 'created_at', 'updated_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'subject', 'syllabus_topic')
        }),
        ('Content Source', {
            'fields': ('content_source',)
        }),
        ('Quiz Configuration', {
            'fields': ('difficulty', 'question_count', 'time_limit')
        }),
        ('AI Generation', {
            'fields': ('ai_model', 'generation_params')
        }),
        ('Status & Tracking', {
            'fields': (
                'is_generated', 'generation_status', 'generated_at'
            )
        }),
        ('Access Control', {
            'fields': ('created_by', 'shared_with')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'subject', 'ai_model', 'created_by'
        )


@admin.register(AIQuestion)
class AIQuestionAdmin(admin.ModelAdmin):
    list_display = [
        'quiz', 'question_type', 'difficulty', 'points', 'order',
        'confidence_score_display', 'created_at'
    ]
    list_filter = [
        'question_type', 'difficulty', 'created_at'
    ]
    search_fields = ['question_text', 'quiz__title', 'correct_answer']
    readonly_fields = ['id', 'created_at', 'updated_at']

    fieldsets = (
        ('Question Information', {
            'fields': ('quiz', 'question_text', 'question_type', 'difficulty')
        }),
        ('Answer & Options', {
            'fields': ('options', 'correct_answer', 'explanation')
        }),
        ('Metadata', {
            'fields': ('points', 'order')
        }),
        ('AI Generation', {
            'fields': ('ai_model', 'confidence_score')
        }),
        ('Timestamps', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def confidence_score_display(self, obj):
        if obj.confidence_score:
            color = ('green' if obj.confidence_score >= 0.8
                     else 'orange' if obj.confidence_score >= 0.6 else 'red')
            return format_html(
                '<span style="color: {};">{:.2%}</span>',
                color, obj.confidence_score
            )
        return "-"
    confidence_score_display.short_description = 'Confidence'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('quiz', 'ai_model')


@admin.register(AILessonSummarizer)
class AILessonSummarizerAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'lesson', 'subject', 'summary_type',
        'is_generated', 'generation_status',
        'readability_score_display', 'created_by', 'created_at'
    ]
    list_filter = [
        'summary_type', 'is_generated', 'generation_status', 'created_at'
    ]
    search_fields = [
        'title', 'lesson__title', 'subject__name', 'created_by__username'
    ]
    readonly_fields = ['id', 'generated_at', 'created_at', 'updated_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'lesson', 'subject')
        }),
        ('Summary Content', {
            'fields': (
                'summary_type', 'summary_content', 'key_points', 'vocabulary'
            )
        }),
        ('AI Generation', {
            'fields': ('ai_model', 'generation_params')
        }),
        ('Quality Metrics', {
            'fields': ('readability_score', 'coherence_score')
        }),
        ('Status & Tracking', {
            'fields': (
                'is_generated', 'generation_status', 'generated_at'
            )
        }),
        ('Access Control', {
            'fields': ('created_by', 'shared_with')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def readability_score_display(self, obj):
        if obj.readability_score:
            color = ('green' if obj.readability_score >= 0.7
                     else 'orange' if obj.readability_score >= 0.5 else 'red')
            return format_html(
                '<span style="color: {};">{:.2f}</span>',
                color, obj.readability_score
            )
        return "-"
    readability_score_display.short_description = 'Readability'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'lesson', 'subject', 'ai_model', 'created_by'
        )


@admin.register(AIPerformancePredictor)
class AIPerformancePredictorAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'subject', 'prediction_type', 'predicted_value',
        'confidence_level', 'confidence_score_display',
        'intervention_needed', 'created_at'
    ]
    list_filter = [
        'prediction_type', 'confidence_level', 'intervention_needed',
        'academic_year', 'created_at'
    ]
    search_fields = [
        'student__first_name', 'student__last_name', 'subject__name'
    ]
    readonly_fields = ['id', 'created_at', 'updated_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('student', 'subject', 'prediction_type')
        }),
        ('Prediction Details', {
            'fields': (
                'predicted_value', 'confidence_level', 'confidence_score'
            )
        }),
        ('Input Features', {
            'fields': ('input_features', 'feature_importance')
        }),
        ('AI Model', {
            'fields': ('ai_model', 'generation_params')
        }),
        ('Recommendations', {
            'fields': (
                'recommendations', 'intervention_needed',
                'intervention_urgency'
            )
        }),
        ('Validation', {
            'fields': ('actual_value', 'prediction_accuracy')
        }),
        ('Metadata', {
            'fields': (
                'academic_year', 'semester', 'id', 'created_at', 'updated_at'
            ),
            'classes': ('collapse',)
        }),
    )

    def confidence_score_display(self, obj):
        if obj.confidence_score:
            color = ('green' if obj.confidence_score >= 0.8
                     else 'orange' if obj.confidence_score >= 0.6 else 'red')
            return format_html(
                '<span style="color: {};">{:.2%}</span>',
                color, obj.confidence_score
            )
        return "-"
    confidence_score_display.short_description = 'Confidence'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'student', 'subject', 'ai_model'
        )


@admin.register(AIAttendanceAnomalyDetector)
class AIAttendanceAnomalyDetectorAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'class_enrolled', 'anomaly_type', 'severity',
        'detection_date', 'attendance_rate_display',
        'deviation_display', 'intervention_needed', 'is_resolved',
        'created_at'
    ]
    list_filter = [
        'anomaly_type', 'severity', 'intervention_needed', 'is_resolved',
        'detection_date', 'created_at'
    ]
    search_fields = [
        'student__first_name', 'student__last_name', 'class_enrolled__name'
    ]
    readonly_fields = ['id', 'created_at', 'updated_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('student', 'class_enrolled', 'anomaly_type', 'severity')
        }),
        ('Detection Data', {
            'fields': (
                'detection_date', 'attendance_rate', 'historical_average',
                'deviation'
            )
        }),
        ('Analysis', {
            'fields': (
                'contributing_factors', 'pattern_analysis', 'peer_comparison'
            )
        }),
        ('AI Model', {
            'fields': (
                'ai_model', 'detection_params', 'confidence_score'
            )
        }),
        ('Actions & Recommendations', {
            'fields': (
                'recommendations', 'intervention_needed',
                'intervention_actions'
            )
        }),
        ('Status Tracking', {
            'fields': (
                'is_resolved', 'resolution_date', 'resolution_notes'
            )
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def attendance_rate_display(self, obj):
        color = ('green' if obj.attendance_rate >= 90
                 else 'orange' if obj.attendance_rate >= 75 else 'red')
        return format_html(
            '<span style="color: {};">{:.1f}%</span>',
            color, obj.attendance_rate
        )
    attendance_rate_display.short_description = 'Attendance Rate'

    def deviation_display(self, obj):
        color = ('red' if abs(obj.deviation) > 20
                 else 'orange' if abs(obj.deviation) > 10 else 'green')
        return format_html(
            '<span style="color: {};">{:.1f}%</span>',
            color, obj.deviation
        )
    deviation_display.short_description = 'Deviation'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'student', 'class_section', 'ai_model'
        )


@admin.register(AINaturalLanguageQuery)
class AINaturalLanguageQueryAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'query_type', 'status', 'processing_time_display',
        'confidence_score_display', 'user_rating', 'created_at'
    ]
    list_filter = [
        'query_type', 'status', 'created_at'
    ]
    search_fields = ['query_text', 'user__username', 'intent']
    readonly_fields = ['id', 'created_at', 'updated_at']

    fieldsets = (
        ('Query Information', {
            'fields': ('user', 'query_text', 'query_type', 'intent')
        }),
        ('Processing', {
            'fields': ('processed_query', 'sql_query', 'parameters')
        }),
        ('Results', {
            'fields': (
                'result_data', 'result_summary', 'visualization_config'
            )
        }),
        ('AI Model', {
            'fields': ('ai_model', 'processing_params')
        }),
        ('Performance Metrics', {
            'fields': (
                'processing_time', 'confidence_score', 'accuracy_score'
            )
        }),
        ('Status & Error Handling', {
            'fields': ('status', 'error_message')
        }),
        ('User Feedback', {
            'fields': ('user_rating', 'user_feedback')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def processing_time_display(self, obj):
        if obj.processing_time:
            return str(obj.processing_time).split('.')[0]
        return "-"
    processing_time_display.short_description = 'Processing Time'

    def confidence_score_display(self, obj):
        if obj.confidence_score:
            color = ('green' if obj.confidence_score >= 0.8
                     else 'orange' if obj.confidence_score >= 0.6 else 'red')
            return format_html(
                '<span style="color: {};">{:.2%}</span>',
                color, obj.confidence_score
            )
        return "-"
    confidence_score_display.short_description = 'Confidence'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'ai_model')


@admin.register(AITrainingJob)
class AITrainingJobAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'ai_model', 'status', 'progress_display', 'current_epoch',
        'total_epochs', 'duration_display', 'created_by', 'created_at'
    ]
    list_filter = [
        'status', 'created_at'
    ]
    search_fields = [
        'name', 'description', 'ai_model__name', 'created_by__username'
    ]
    readonly_fields = [
        'id', 'started_at', 'completed_at', 'duration',
        'created_at', 'updated_at'
    ]

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'ai_model')
        }),
        ('Configuration', {
            'fields': ('training_config', 'dataset_config')
        }),
        ('Job Tracking', {
            'fields': (
                'status', 'progress', 'current_epoch', 'total_epochs'
            )
        }),
        ('Performance Metrics', {
            'fields': (
                'training_metrics', 'validation_metrics', 'final_metrics'
            )
        }),
        ('Timing', {
            'fields': ('started_at', 'completed_at', 'duration')
        }),
        ('Resources', {
            'fields': ('gpu_usage', 'memory_usage')
        }),
        ('Error Handling', {
            'fields': ('error_message', 'logs')
        }),
        ('Access Control', {
            'fields': ('created_by',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def progress_display(self, obj):
        color = ('green' if obj.progress >= 80
                 else 'orange' if obj.progress >= 50 else 'red')
        return format_html(
            '<span style="color: {};">{}%</span>',
            color, obj.progress
        )
    progress_display.short_description = 'Progress'

    def duration_display(self, obj):
        if obj.duration:
            return str(obj.duration).split('.')[0]
        return "-"
    duration_display.short_description = 'Duration'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'ai_model', 'created_by'
        )


@admin.register(AIDataSource)
class AIDataSourceAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'source_type', 'is_active', 'data_quality_score_display',
        'record_count', 'last_updated', 'created_by', 'created_at'
    ]
    list_filter = [
        'source_type', 'is_active', 'created_at'
    ]
    search_fields = ['name', 'description', 'created_by__username']
    readonly_fields = ['id', 'created_at', 'updated_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'source_type')
        }),
        ('Connection Details', {
            'fields': ('connection_config', 'schema_config')
        }),
        ('Data Quality', {
            'fields': (
                'data_quality_score', 'last_updated', 'record_count'
            )
        }),
        ('Access Control', {
            'fields': ('is_active', 'created_by', 'shared_with')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def data_quality_score_display(self, obj):
        if obj.data_quality_score:
            color = ('green' if obj.data_quality_score >= 0.8
                     else 'orange' if obj.data_quality_score >= 0.6 else 'red')
            return format_html(
                '<span style="color: {};">{:.2%}</span>',
                color, obj.data_quality_score
            )
        return "-"
    data_quality_score_display.short_description = 'Data Quality'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by')


@admin.register(AIUsageLog)
class AIUsageLogAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'tool_type', 'success', 'processing_time_display',
        'user_satisfaction', 'timestamp'
    ]
    list_filter = [
        'tool_type', 'success', 'timestamp'
    ]
    search_fields = ['user__username', 'tool_type', 'error_message']
    readonly_fields = ['id', 'timestamp']

    fieldsets = (
        ('Usage Information', {
            'fields': ('user', 'tool_type', 'ai_model', 'model_version')
        }),
        ('Usage Details', {
            'fields': ('input_data', 'output_data', 'processing_time')
        }),
        ('Performance Metrics', {
            'fields': ('success', 'error_message', 'user_satisfaction')
        }),
        ('Context', {
            'fields': ('ip_address', 'user_agent', 'session_id')
        }),
        ('Metadata', {
            'fields': ('id', 'timestamp'),
            'classes': ('collapse',)
        }),
    )

    def processing_time_display(self, obj):
        if obj.processing_time:
            return str(obj.processing_time).split('.')[0]
        return "-"
    processing_time_display.short_description = 'Processing Time'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'ai_model')


# Custom admin actions
@admin.action(description="Activate selected AI models")
def activate_ai_models(modeladmin, request, queryset):
    queryset.update(status='active', is_active=True)


@admin.action(description="Deactivate selected AI models")
def deactivate_ai_models(modeladmin, request, queryset):
    queryset.update(status='inactive', is_active=False)


@admin.action(description="Mark selected anomalies as resolved")
def resolve_anomalies(modeladmin, request, queryset):
    queryset.update(is_resolved=True, resolution_date=timezone.now())


@admin.action(description="Retrain selected AI models")
def retrain_models(modeladmin, request, queryset):
    for model in queryset:
        model.status = 'training'
        model.is_active = False
        model.save()


# Add actions to admin classes
AIModelAdmin.actions = [
    activate_ai_models, deactivate_ai_models, retrain_models
]
AIAttendanceAnomalyDetectorAdmin.actions = [
    resolve_anomalies
]
