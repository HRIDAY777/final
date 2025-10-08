from django.contrib import admin
from .models import Assignment, AssignmentSubmission, AssignmentComment


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'assignment_type', 'subject', 'class_group', 'due_date',
        'total_marks', 'status', 'is_active', 'submission_count',
        'graded_count'
    ]
    list_filter = [
        'assignment_type', 'status', 'is_active', 'subject', 'class_group',
        'created_at'
    ]
    search_fields = ['title', 'description', 'instructions']
    ordering = ['-due_date', '-created_at']
    readonly_fields = [
        'submission_count', 'graded_count', 'is_overdue', 'created_at',
        'updated_at'
    ]
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'description', 'instructions', 'assignment_type'
            )
        }),
        ('Academic Details', {
            'fields': ('subject', 'class_group', 'total_marks', 'weightage')
        }),
        ('Dates', {
            'fields': ('assigned_date', 'due_date', 'late_submission_deadline')
        }),
        ('Settings', {
            'fields': (
                'allow_late_submission', 'late_submission_penalty',
                'allow_resubmission', 'max_resubmissions'
            )
        }),
        ('Files & Rubric', {
            'fields': ('attachment', 'rubric')
        }),
        ('Status', {
            'fields': ('status', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_by', 'tenant', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'assignment', 'submission_date', 'marks_obtained',
        'percentage', 'grade', 'status', 'is_graded', 'is_late', 'days_late'
    ]
    list_filter = [
        'status', 'is_graded', 'is_late', 'assignment__assignment_type',
        'assignment__subject', 'submission_date'
    ]
    search_fields = [
        'student__first_name', 'student__last_name', 'student__student_id',
        'assignment__title', 'submission_text', 'feedback'
    ]
    ordering = ['-submission_date']
    readonly_fields = [
        'days_late', 'percentage', 'created_at', 'updated_at'
    ]
    date_hierarchy = 'submission_date'

    fieldsets = (
        ('Submission Details', {
            'fields': (
                'assignment', 'student', 'submission_text', 'attachment'
            )
        }),
        ('Grading', {
            'fields': (
                'marks_obtained', 'percentage', 'grade', 'feedback',
                'rubric_scores'
            )
        }),
        ('Status', {
            'fields': ('status', 'is_graded', 'is_late', 'days_late')
        }),
        ('Resubmission', {
            'fields': ('resubmission_count', 'original_submission')
        }),
        ('Metadata', {
            'fields': ('graded_by', 'graded_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AssignmentComment)
class AssignmentCommentAdmin(admin.ModelAdmin):
    list_display = [
        'author', 'assignment', 'submission', 'comment_type', 'is_private',
        'created_at'
    ]
    list_filter = [
        'comment_type', 'is_private', 'created_at'
    ]
    search_fields = [
        'author__first_name', 'author__last_name', 'content',
        'assignment__title'
    ]
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Comment Details', {
            'fields': ('assignment', 'submission', 'comment_type', 'content')
        }),
        ('Visibility', {
            'fields': ('is_private',)
        }),
        ('Metadata', {
            'fields': ('author', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
