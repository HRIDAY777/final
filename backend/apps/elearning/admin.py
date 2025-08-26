from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from .models import (
    Course, Lesson, Enrollment, LessonProgress, Quiz, QuizAttempt,
    CourseReview, Certificate, Discussion, CourseCategory
)


@admin.register(CourseCategory)
class CourseCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'course_count', 'student_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['course_count', 'student_count']
    
    def course_count(self, obj):
        return obj.course_count
    course_count.short_description = 'Courses'
    
    def student_count(self, obj):
        return obj.student_count
    student_count.short_description = 'Students'


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'instructor', 'category', 'level', 'is_published',
        'enrolled_students', 'average_rating', 'completion_rate', 'created_at'
    ]
    list_filter = [
        'is_published', 'is_featured', 'status', 'level', 'category',
        'created_at', 'instructor'
    ]
    search_fields = ['title', 'description', 'instructor__username', 'instructor__email']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = [
        'enrolled_students', 'average_rating', 'total_reviews',
        'completion_rate', 'created_at', 'updated_at', 'published_at'
    ]
    filter_horizontal = []
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('title', 'slug', 'description', 'short_description')
        }),
        (_('Media'), {
            'fields': ('thumbnail', 'video_intro')
        }),
        (_('Course Details'), {
            'fields': ('category', 'level', 'language', 'instructor')
        }),
        (_('Pricing'), {
            'fields': ('price', 'is_free', 'discount_price')
        }),
        (_('Content'), {
            'fields': ('learning_objectives', 'requirements', 'target_audience', 'curriculum')
        }),
        (_('Status'), {
            'fields': ('is_published', 'is_featured', 'status')
        }),
        (_('Statistics'), {
            'fields': ('enrolled_students', 'average_rating', 'total_reviews', 'completion_rate'),
            'classes': ('collapse',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('instructor')


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'course', 'lesson_type', 'order', 'is_free',
        'video_duration', 'created_at'
    ]
    list_filter = ['lesson_type', 'is_free', 'completion_criteria', 'created_at', 'course']
    search_fields = ['title', 'description', 'course__title']
    list_editable = ['order', 'is_free']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('course', 'title', 'description', 'content')
        }),
        (_('Media'), {
            'fields': ('video_url', 'video_duration', 'attachments')
        }),
        (_('Settings'), {
            'fields': ('order', 'is_free', 'lesson_type', 'completion_criteria')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('course')


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'course', 'status', 'progress', 'payment_status',
        'started_at', 'completed_at'
    ]
    list_filter = [
        'status', 'payment_status', 'started_at', 'completed_at',
        'course', 'student'
    ]
    search_fields = [
        'student__username', 'student__email', 'student__first_name',
        'student__last_name', 'course__title'
    ]
    readonly_fields = [
        'progress', 'completed_lessons', 'total_lessons', 'time_spent',
        'started_at', 'completed_at'
    ]
    date_hierarchy = 'started_at'
    
    fieldsets = (
        (_('Enrollment Details'), {
            'fields': ('student', 'course', 'status')
        }),
        (_('Progress'), {
            'fields': ('progress', 'completed_lessons', 'total_lessons', 'time_spent')
        }),
        (_('Payment'), {
            'fields': ('amount_paid', 'payment_status')
        }),
        (_('Timestamps'), {
            'fields': ('started_at', 'completed_at', 'last_accessed'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student', 'course')


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = [
        'enrollment', 'lesson', 'status', 'video_completed',
        'quiz_passed', 'started_at', 'completed_at'
    ]
    list_filter = [
        'status', 'video_completed', 'quiz_passed', 'assignment_submitted',
        'started_at', 'completed_at'
    ]
    search_fields = [
        'enrollment__student__username', 'lesson__title', 'lesson__course__title'
    ]
    readonly_fields = [
        'video_watched', 'quiz_score', 'quiz_attempts', 'assignment_score',
        'started_at', 'completed_at', 'last_accessed'
    ]
    
    fieldsets = (
        (_('Progress Details'), {
            'fields': ('enrollment', 'lesson', 'status')
        }),
        (_('Video Progress'), {
            'fields': ('video_watched', 'video_completed')
        }),
        (_('Quiz Results'), {
            'fields': ('quiz_score', 'quiz_attempts', 'quiz_passed')
        }),
        (_('Assignment'), {
            'fields': ('assignment_submitted', 'assignment_score')
        }),
        (_('Timestamps'), {
            'fields': ('started_at', 'completed_at', 'last_accessed'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'enrollment__student', 'lesson__course'
        )


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'lesson', 'passing_score', 'time_limit',
        'max_attempts', 'total_attempts', 'average_score'
    ]
    list_filter = ['passing_score', 'time_limit', 'max_attempts', 'shuffle_questions']
    search_fields = ['title', 'lesson__title', 'lesson__course__title']
    readonly_fields = ['total_attempts', 'average_score', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('Quiz Information'), {
            'fields': ('lesson', 'title', 'description')
        }),
        (_('Settings'), {
            'fields': ('passing_score', 'time_limit', 'max_attempts', 'shuffle_questions')
        }),
        (_('Questions'), {
            'fields': ('questions',)
        }),
        (_('Statistics'), {
            'fields': ('total_attempts', 'average_score'),
            'classes': ('collapse',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('lesson__course')


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = [
        'enrollment', 'quiz', 'attempt_number', 'score', 'passed',
        'correct_answers', 'total_questions', 'started_at'
    ]
    list_filter = ['passed', 'attempt_number', 'started_at', 'completed_at']
    search_fields = [
        'enrollment__student__username', 'quiz__title', 'quiz__lesson__title'
    ]
    readonly_fields = [
        'correct_answers', 'total_questions', 'score', 'passed',
        'started_at', 'completed_at', 'time_taken'
    ]
    date_hierarchy = 'started_at'
    
    fieldsets = (
        (_('Attempt Details'), {
            'fields': ('enrollment', 'quiz', 'attempt_number')
        }),
        (_('Results'), {
            'fields': ('score', 'passed', 'correct_answers', 'total_questions')
        }),
        (_('Answers'), {
            'fields': ('answers',)
        }),
        (_('Timestamps'), {
            'fields': ('started_at', 'completed_at', 'time_taken'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'enrollment__student', 'quiz__lesson__course'
        )


@admin.register(CourseReview)
class CourseReviewAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'course', 'rating', 'is_approved', 'is_helpful', 'created_at'
    ]
    list_filter = ['rating', 'is_approved', 'created_at', 'course']
    search_fields = [
        'student__username', 'student__email', 'course__title', 'title', 'comment'
    ]
    list_editable = ['is_approved']
    readonly_fields = ['is_helpful', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('Review Details'), {
            'fields': ('student', 'course', 'enrollment')
        }),
        (_('Review Content'), {
            'fields': ('rating', 'title', 'comment')
        }),
        (_('Status'), {
            'fields': ('is_approved', 'is_helpful')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student', 'course')


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'course', 'certificate_number', 'issued_date',
        'completion_date', 'is_verified'
    ]
    list_filter = ['is_verified', 'issued_date', 'completion_date']
    search_fields = [
        'student__username', 'student__email', 'course__title',
        'certificate_number', 'verification_code'
    ]
    readonly_fields = [
        'certificate_number', 'issued_date', 'verification_code'
    ]
    
    fieldsets = (
        (_('Certificate Details'), {
            'fields': ('student', 'course', 'enrollment')
        }),
        (_('Certificate Information'), {
            'fields': ('certificate_number', 'issued_date', 'completion_date')
        }),
        (_('Files'), {
            'fields': ('certificate_file',)
        }),
        (_('Verification'), {
            'fields': ('is_verified', 'verification_code')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student', 'course')


@admin.register(Discussion)
class DiscussionAdmin(admin.ModelAdmin):
    list_display = [
        'author', 'course', 'title', 'is_pinned', 'is_resolved',
        'views', 'likes', 'created_at'
    ]
    list_filter = ['is_pinned', 'is_resolved', 'created_at', 'course']
    search_fields = [
        'author__username', 'author__email', 'course__title', 'title', 'content'
    ]
    list_editable = ['is_pinned', 'is_resolved']
    readonly_fields = ['views', 'likes', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('Discussion Details'), {
            'fields': ('course', 'author', 'parent')
        }),
        (_('Content'), {
            'fields': ('title', 'content')
        }),
        (_('Status'), {
            'fields': ('is_pinned', 'is_resolved')
        }),
        (_('Statistics'), {
            'fields': ('views', 'likes'),
            'classes': ('collapse',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('author', 'course')


# Custom admin site configuration
admin.site.site_header = _('EduCore Ultra E-Learning Administration')
admin.site.site_title = _('E-Learning Admin')
admin.site.index_title = _('E-Learning Management')
