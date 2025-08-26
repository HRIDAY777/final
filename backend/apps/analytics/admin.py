from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Count, Sum, Q, Avg
from django.utils import timezone
from .models import (
    StudentPerformance, AttendanceAnalytics, ExamAnalytics, SystemUsage,
    LearningAnalytics, PredictiveAnalytics, AnalyticsDashboard
)


@admin.register(StudentPerformance)
class StudentPerformanceAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'subject', 'academic_year', 'semester', 'overall_performance_score',
        'attendance_rate', 'average_score', 'risk_level', 'predicted_grade'
    ]
    list_filter = [
        'academic_year', 'semester', 'risk_level', 'subject', 'created_at'
    ]
    search_fields = [
        'student__first_name', 'student__last_name', 'student__student_id',
        'subject__name'
    ]
    ordering = ['-updated_at']
    readonly_fields = [
        'created_at', 'updated_at', 'overall_performance_score', 'assignment_completion_rate'
    ]
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Student Information', {
            'fields': ('student', 'subject', 'academic_year', 'semester')
        }),
        ('Performance Metrics', {
            'fields': ('attendance_rate', 'average_score', 'total_assignments', 'completed_assignments')
        }),
        ('Calculated Fields', {
            'fields': ('overall_performance_score', 'assignment_completion_rate'),
            'classes': ('collapse',)
        }),
        ('Predictions & Insights', {
            'fields': ('predicted_grade', 'risk_level', 'improvement_areas', 'recommendations')
        }),
        ('Additional Data', {
            'fields': ('exam_scores', 'participation_score'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def overall_performance_score(self, obj):
        score = obj.overall_performance_score
        if score >= 80:
            color = 'green'
        elif score >= 60:
            color = 'orange'
        else:
            color = 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
            color, score
        )
    overall_performance_score.short_description = 'Overall Score'

    def risk_level(self, obj):
        colors = {
            'low': 'green',
            'medium': 'orange',
            'high': 'red'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.risk_level, 'black'),
            obj.get_risk_level_display()
        )
    risk_level.short_description = 'Risk Level'

    actions = ['calculate_performance_scores', 'update_risk_levels']

    def calculate_performance_scores(self, request, queryset):
        for performance in queryset:
            # Recalculate performance scores
            performance.save()
        self.message_user(request, f"Recalculated performance scores for {queryset.count()} records")
    calculate_performance_scores.short_description = "Recalculate performance scores"

    def update_risk_levels(self, request, queryset):
        for performance in queryset:
            score = performance.overall_performance_score
            if score >= 80:
                performance.risk_level = 'low'
            elif score >= 60:
                performance.risk_level = 'medium'
            else:
                performance.risk_level = 'high'
            performance.save()
        self.message_user(request, f"Updated risk levels for {queryset.count()} records")
    update_risk_levels.short_description = "Update risk levels"


@admin.register(AttendanceAnalytics)
class AttendanceAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'class_room', 'date', 'attendance_rate', 'total_students',
        'present_count', 'absent_count', 'trend_direction'
    ]
    list_filter = [
        'class_room', 'date', 'trend_direction', 'created_at'
    ]
    search_fields = ['class_room__name', 'notes']
    ordering = ['-date']
    readonly_fields = [
        'created_at', 'updated_at', 'attendance_rate', 'absence_rate'
    ]
    date_hierarchy = 'date'

    def attendance_rate(self, obj):
        if obj.attendance_rate >= 90:
            color = 'green'
        elif obj.attendance_rate >= 75:
            color = 'orange'
        else:
            color = 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
            color, obj.attendance_rate
        )
    attendance_rate.short_description = 'Attendance Rate'

    def trend_direction(self, obj):
        colors = {
            'improving': 'green',
            'stable': 'blue',
            'declining': 'red'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.trend_direction, 'black'),
            obj.get_trend_direction_display()
        )
    trend_direction.short_description = 'Trend'


@admin.register(ExamAnalytics)
class ExamAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'exam', 'average_score', 'total_students', 'pass_rate',
        'highest_score', 'lowest_score', 'difficulty_level'
    ]
    list_filter = [
        'exam__subject', 'difficulty_level', 'created_at'
    ]
    search_fields = ['exam__title', 'exam__subject__name']
    ordering = ['-created_at']
    readonly_fields = [
        'created_at', 'updated_at'
    ]
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Exam Information', {
            'fields': ('exam',)
        }),
        ('Performance Metrics', {
            'fields': ('total_students', 'average_score', 'highest_score', 'lowest_score', 'median_score')
        }),
        ('Grade Distribution', {
            'fields': ('grade_distribution', 'pass_rate')
        }),
        ('Analysis', {
            'fields': ('question_analysis', 'time_analysis', 'difficulty_level', 'recommendations')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def average_score(self, obj):
        if obj.average_score >= 80:
            color = 'green'
        elif obj.average_score >= 60:
            color = 'orange'
        else:
            color = 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
            color, obj.average_score
        )
    average_score.short_description = 'Average Score'

    def pass_rate(self, obj):
        if obj.pass_rate >= 80:
            color = 'green'
        elif obj.pass_rate >= 60:
            color = 'orange'
        else:
            color = 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
            color, obj.pass_rate
        )
    pass_rate.short_description = 'Pass Rate'

    def difficulty_level(self, obj):
        colors = {
            'easy': 'green',
            'medium': 'orange',
            'hard': 'red'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.difficulty_level, 'black'),
            obj.get_difficulty_level_display()
        )
    difficulty_level.short_description = 'Difficulty'


@admin.register(SystemUsage)
class SystemUsageAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'login_time', 'logout_time', 'session_duration_display',
        'device_type', 'pages_visited_count', 'actions_count'
    ]
    list_filter = [
        'device_type', 'login_time', 'user__is_staff'
    ]
    search_fields = [
        'user__first_name', 'user__last_name', 'user__email', 'session_id'
    ]
    ordering = ['-login_time']
    readonly_fields = [
        'created_at', 'updated_at', 'session_duration'
    ]
    date_hierarchy = 'login_time'

    fieldsets = (
        ('User Information', {
            'fields': ('user', 'session_id')
        }),
        ('Session Details', {
            'fields': ('login_time', 'logout_time', 'session_duration')
        }),
        ('Activity Tracking', {
            'fields': ('pages_visited', 'actions_performed', 'features_used')
        }),
        ('Device Information', {
            'fields': ('user_agent', 'ip_address', 'device_type')
        }),
        ('Performance', {
            'fields': ('page_load_times', 'errors_encountered'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def session_duration_display(self, obj):
        if obj.session_duration:
            hours = obj.session_duration // 3600
            minutes = (obj.session_duration % 3600) // 60
            return f"{hours}h {minutes}m"
        return "N/A"
    session_duration_display.short_description = 'Duration'

    def pages_visited_count(self, obj):
        return len(obj.pages_visited)
    pages_visited_count.short_description = 'Pages'

    def actions_count(self, obj):
        return len(obj.actions_performed)
    actions_count.short_description = 'Actions'


@admin.register(LearningAnalytics)
class LearningAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'subject', 'engagement_score', 'participation_level',
        'learning_style', 'study_time_display', 'learning_path_progress'
    ]
    list_filter = [
        'subject', 'participation_level', 'learning_style', 'created_at'
    ]
    search_fields = [
        'student__first_name', 'student__last_name', 'subject__name'
    ]
    ordering = ['-updated_at']
    readonly_fields = [
        'created_at', 'updated_at'
    ]
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Student Information', {
            'fields': ('student', 'subject')
        }),
        ('Learning Metrics', {
            'fields': ('study_time', 'resources_accessed', 'learning_path_progress')
        }),
        ('Engagement', {
            'fields': ('engagement_score', 'participation_level')
        }),
        ('Learning Analysis', {
            'fields': ('learning_style', 'skill_levels', 'knowledge_gaps', 'learning_objectives')
        }),
        ('Recommendations', {
            'fields': ('recommended_resources', 'study_suggestions')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def study_time_display(self, obj):
        hours = obj.study_time // 60
        minutes = obj.study_time % 60
        return f"{hours}h {minutes}m"
    study_time_display.short_description = 'Study Time'

    def engagement_score(self, obj):
        if obj.engagement_score >= 80:
            color = 'green'
        elif obj.engagement_score >= 60:
            color = 'orange'
        else:
            color = 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
            color, obj.engagement_score
        )
    engagement_score.short_description = 'Engagement'

    def participation_level(self, obj):
        colors = {
            'high': 'green',
            'medium': 'orange',
            'low': 'red'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.participation_level, 'black'),
            obj.get_participation_level_display()
        )
    participation_level.short_description = 'Participation'


@admin.register(PredictiveAnalytics)
class PredictiveAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'predicted_gpa', 'graduation_probability', 'dropout_risk',
        'intervention_needed', 'intervention_priority', 'confidence_score'
    ]
    list_filter = [
        'intervention_needed', 'intervention_priority', 'model_version', 'created_at'
    ]
    search_fields = [
        'student__first_name', 'student__last_name', 'intervention_type'
    ]
    ordering = ['-last_updated']
    readonly_fields = [
        'created_at', 'last_updated'
    ]
    date_hierarchy = 'last_updated'

    fieldsets = (
        ('Student Information', {
            'fields': ('student',)
        }),
        ('Predictions', {
            'fields': ('predicted_gpa', 'graduation_probability', 'dropout_risk')
        }),
        ('Career & Academic', {
            'fields': ('career_recommendations', 'skill_gaps', 'development_areas', 'course_recommendations', 'subject_performance_predictions')
        }),
        ('Intervention', {
            'fields': ('intervention_needed', 'intervention_type', 'intervention_priority')
        }),
        ('Model Information', {
            'fields': ('model_version', 'confidence_score'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'last_updated'),
            'classes': ('collapse',)
        }),
    )

    def predicted_gpa(self, obj):
        if obj.predicted_gpa >= 3.5:
            color = 'green'
        elif obj.predicted_gpa >= 2.5:
            color = 'orange'
        else:
            color = 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.2f}</span>',
            color, obj.predicted_gpa
        )
    predicted_gpa.short_description = 'Predicted GPA'

    def graduation_probability(self, obj):
        if obj.graduation_probability >= 80:
            color = 'green'
        elif obj.graduation_probability >= 60:
            color = 'orange'
        else:
            color = 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
            color, obj.graduation_probability
        )
    graduation_probability.short_description = 'Graduation Prob.'

    def dropout_risk(self, obj):
        if obj.dropout_risk <= 20:
            color = 'green'
        elif obj.dropout_risk <= 40:
            color = 'orange'
        else:
            color = 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
            color, obj.dropout_risk
        )
    dropout_risk.short_description = 'Dropout Risk'

    def intervention_needed(self, obj):
        if obj.intervention_needed:
            return format_html('<span style="color: red;">✓</span>')
        return format_html('<span style="color: green;">✗</span>')
    intervention_needed.short_description = 'Intervention'

    def intervention_priority(self, obj):
        colors = {
            'critical': 'red',
            'high': 'orange',
            'medium': 'yellow',
            'low': 'green'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.intervention_priority, 'black'),
            obj.get_intervention_priority_display()
        )
    intervention_priority.short_description = 'Priority'


@admin.register(AnalyticsDashboard)
class AnalyticsDashboardAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'created_by', 'is_public', 'auto_refresh',
        'refresh_interval', 'created_at'
    ]
    list_filter = [
        'is_public', 'auto_refresh', 'created_at'
    ]
    search_fields = ['name', 'description', 'created_by__username']
    ordering = ['-created_at']
    readonly_fields = [
        'created_at', 'updated_at'
    ]
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description')
        }),
        ('Configuration', {
            'fields': ('widgets', 'layout', 'filters')
        }),
        ('Access Control', {
            'fields': ('is_public', 'allowed_users', 'allowed_roles')
        }),
        ('Settings', {
            'fields': ('refresh_interval', 'auto_refresh')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:  # New object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
