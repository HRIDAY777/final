from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Exam, ExamSchedule, Question, Answer, ExamResult, 
    StudentAnswer, Quiz, ExamSettings
)


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ['title', 'exam_type', 'subject', 'course', 'total_marks', 'passing_marks', 'total_questions', 'is_active', 'created_by', 'created_at']
    list_filter = ['exam_type', 'subject', 'is_active', 'allow_retake', 'created_at']
    search_fields = ['title', 'description', 'subject__name', 'course__subject__name']
    readonly_fields = ['total_questions', 'is_scheduled']
    list_editable = ['is_active']
    ordering = ['-created_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'exam_type', 'subject', 'course')
        }),
        ('Exam Settings', {
            'fields': ('total_marks', 'duration_minutes', 'passing_marks', 'allow_retake', 'max_attempts')
        }),
        ('Additional Settings', {
            'fields': ('instructions', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def total_questions(self, obj):
        return obj.total_questions
    total_questions.short_description = 'Questions'

    def is_scheduled(self, obj):
        return obj.is_scheduled
    is_scheduled.boolean = True
    is_scheduled.short_description = 'Scheduled'


@admin.register(ExamSchedule)
class ExamScheduleAdmin(admin.ModelAdmin):
    list_display = ['exam', 'start_date', 'start_time', 'end_time', 'venue', 'room_number', 'invigilator', 'is_online', 'status', 'created_at']
    list_filter = ['start_date', 'is_online', 'created_at']
    search_fields = ['exam__title', 'venue', 'room_number', 'invigilator__user__first_name']
    readonly_fields = ['duration_minutes', 'is_upcoming', 'is_ongoing', 'is_completed']
    ordering = ['start_date', 'start_time']
    fieldsets = (
        ('Exam Information', {
            'fields': ('exam',)
        }),
        ('Schedule Details', {
            'fields': ('start_date', 'start_time', 'end_time')
        }),
        ('Venue Information', {
            'fields': ('venue', 'room_number', 'invigilator')
        }),
        ('Online Settings', {
            'fields': ('is_online', 'online_platform', 'meeting_link')
        }),
        ('Status', {
            'fields': ('duration_minutes', 'is_upcoming', 'is_ongoing', 'is_completed'),
            'classes': ('collapse',)
        })
    )

    def status(self, obj):
        if obj.is_upcoming:
            return format_html('<span style="color: blue;">Upcoming</span>')
        elif obj.is_ongoing:
            return format_html('<span style="color: green;">Ongoing</span>')
        elif obj.is_completed:
            return format_html('<span style="color: gray;">Completed</span>')
        return format_html('<span style="color: black;">Unknown</span>')
    status.short_description = 'Status'


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['exam', 'order', 'question_type', 'difficulty', 'marks', 'is_required', 'total_answers', 'created_at']
    list_filter = ['exam', 'question_type', 'difficulty', 'is_required', 'has_negative_marking', 'created_at']
    search_fields = ['question_text', 'exam__title', 'explanation']
    readonly_fields = ['total_answers']
    list_editable = ['order', 'marks', 'is_required']
    ordering = ['exam', 'order']
    fieldsets = (
        ('Question Details', {
            'fields': ('exam', 'question_text', 'question_type', 'order')
        }),
        ('Scoring', {
            'fields': ('marks', 'difficulty', 'is_required', 'has_negative_marking', 'negative_marks')
        }),
        ('Additional Information', {
            'fields': ('explanation',)
        })
    )

    def total_answers(self, obj):
        return obj.total_answers
    total_answers.short_description = 'Answers'


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['question', 'order', 'answer_text', 'is_correct', 'created_at']
    list_filter = ['question__exam', 'is_correct', 'created_at']
    search_fields = ['answer_text', 'question__question_text', 'explanation']
    list_editable = ['order', 'is_correct']
    ordering = ['question', 'order']
    fieldsets = (
        ('Answer Details', {
            'fields': ('question', 'answer_text', 'order')
        }),
        ('Correctness', {
            'fields': ('is_correct',)
        }),
        ('Additional Information', {
            'fields': ('explanation',)
        })
    )


@admin.register(ExamResult)
class ExamResultAdmin(admin.ModelAdmin):
    list_display = ['student', 'exam', 'marks_obtained', 'percentage', 'grade', 'is_passed', 'attempt_number', 'is_submitted', 'submitted_at', 'created_at']
    list_filter = ['exam', 'is_passed', 'is_submitted', 'attempt_number', 'submitted_at', 'created_at']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'exam__title']
    readonly_fields = ['percentage', 'grade', 'is_passed']
    ordering = ['-created_at']
    fieldsets = (
        ('Student & Exam', {
            'fields': ('student', 'exam', 'attempt_number')
        }),
        ('Timing', {
            'fields': ('start_time', 'end_time', 'duration_taken_minutes')
        }),
        ('Results', {
            'fields': ('marks_obtained', 'percentage', 'grade', 'is_passed')
        }),
        ('Submission', {
            'fields': ('is_submitted', 'submitted_at')
        }),
        ('Grading', {
            'fields': ('graded_by', 'graded_at', 'remarks')
        })
    )

    def percentage(self, obj):
        return f"{obj.percentage}%"
    percentage.short_description = 'Percentage'

    def grade(self, obj):
        grade_colors = {
            'A+': 'green',
            'A': 'green',
            'B+': 'blue',
            'B': 'blue',
            'C+': 'orange',
            'C': 'orange',
            'D': 'red',
            'F': 'red'
        }
        color = grade_colors.get(obj.grade, 'black')
        return format_html(f'<span style="color: {color}; font-weight: bold;">{obj.grade}</span>')
    grade.short_description = 'Grade'

    def is_passed(self, obj):
        return obj.is_passed
    is_passed.boolean = True
    is_passed.short_description = 'Passed'


@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = ['exam_result', 'question', 'is_correct', 'marks_obtained', 'time_taken_seconds', 'answered_at']
    list_filter = ['exam_result__exam', 'is_correct', 'answered_at']
    search_fields = ['exam_result__student__user__first_name', 'question__question_text']
    readonly_fields = ['is_correct', 'marks_obtained']
    ordering = ['-answered_at']
    fieldsets = (
        ('Answer Information', {
            'fields': ('exam_result', 'question')
        }),
        ('Student Response', {
            'fields': ('selected_answers', 'text_answer', 'numerical_answer')
        }),
        ('Results', {
            'fields': ('is_correct', 'marks_obtained', 'time_taken_seconds')
        })
    )


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'subject', 'course', 'total_questions', 'time_limit_minutes', 'passing_score', 'is_active', 'created_by', 'created_at']
    list_filter = ['subject', 'is_active', 'is_randomized', 'show_results_immediately', 'created_at']
    search_fields = ['title', 'description', 'subject__name']
    list_editable = ['is_active']
    ordering = ['-created_at']
    fieldsets = (
        ('Quiz Information', {
            'fields': ('title', 'description', 'subject', 'course')
        }),
        ('Quiz Settings', {
            'fields': ('total_questions', 'time_limit_minutes', 'passing_score')
        }),
        ('Behavior Settings', {
            'fields': ('is_randomized', 'show_results_immediately', 'allow_review', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(ExamSettings)
class ExamSettingsAdmin(admin.ModelAdmin):
    list_display = ['class_enrolled', 'default_exam_duration', 'default_passing_percentage', 'allow_exam_retakes', 'max_retake_attempts', 'auto_grade_objective_questions', 'send_result_notifications']
    list_filter = ['allow_exam_retakes', 'auto_grade_objective_questions', 'require_teacher_approval', 'send_result_notifications', 'created_at']
    search_fields = ['class_enrolled__name']
    list_editable = ['default_exam_duration', 'default_passing_percentage', 'max_retake_attempts']
    ordering = ['class_enrolled__name']
    fieldsets = (
        ('Class Settings', {
            'fields': ('class_enrolled',)
        }),
        ('Default Values', {
            'fields': ('default_exam_duration', 'default_passing_percentage')
        }),
        ('Retake Settings', {
            'fields': ('allow_exam_retakes', 'max_retake_attempts')
        }),
        ('Grading Settings', {
            'fields': ('auto_grade_objective_questions', 'require_teacher_approval')
        }),
        ('Notification Settings', {
            'fields': ('send_result_notifications',)
        })
    )

    def allow_exam_retakes(self, obj):
        return obj.allow_exam_retakes
    allow_exam_retakes.boolean = True
    allow_exam_retakes.short_description = 'Allow Retakes'

    def auto_grade_objective_questions(self, obj):
        return obj.auto_grade_objective_questions
    auto_grade_objective_questions.boolean = True
    auto_grade_objective_questions.short_description = 'Auto Grade'

    def send_result_notifications(self, obj):
        return obj.send_result_notifications
    send_result_notifications.boolean = True
    send_result_notifications.short_description = 'Send Notifications'
