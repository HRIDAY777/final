from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Course, Lesson, Grade
)
# Class model moved to apps.classes


# Class admin moved to apps.classes.admin


# Subject admin moved to apps.subjects


# Teacher and Student admin registrations moved to their respective apps


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = [
        'subject', 'class_enrolled', 'teacher', 'academic_year',
        'semester', 'is_active'
    ]
    list_filter = [
        'subject', 'class_enrolled', 'teacher', 'academic_year',
        'semester', 'is_active', 'created_at'
    ]
    search_fields = [
        'subject__name',
        'teacher__user__first_name',
        'teacher__user__last_name'
    ]
    list_editable = ['is_active']
    ordering = ['subject__name', 'class_enrolled__name']


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'course', 'order', 'duration_minutes',
        'is_published', 'created_at'
    ]
    list_filter = ['course', 'is_published', 'created_at']
    search_fields = [
        'title', 'description',
        'course__subject__name'
    ]
    list_editable = ['is_published']
    ordering = ['course', 'order']


# Assignment and AssignmentSubmission admin registrations moved to
# assignments app


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'course', 'assignment', 'score',
        'letter_grade', 'weight', 'academic_year', 'created_at'
    ]
    list_filter = [
        'course', 'letter_grade', 'academic_year', 'semester', 'created_at'
    ]
    search_fields = [
        'student__user__first_name',
        'student__user__last_name',
        'course__subject__name'
    ]
    readonly_fields = ['letter_grade']
    ordering = ['-created_at']

    def letter_grade(self, obj):
        grade_colors = {
            'A+': 'green',
            'A': 'green',
            'A-': 'green',
            'B+': 'blue',
            'B': 'blue',
            'B-': 'blue',
            'C+': 'orange',
            'C': 'orange',
            'C-': 'orange',
            'D+': 'red',
            'D': 'red',
            'D-': 'red',
            'F': 'red'
        }
        color = grade_colors.get(obj.letter_grade, 'black')
        return format_html(
            f'<span style="color: {color}; font-weight: bold;">'
            f'{obj.letter_grade}</span>'
        )
    letter_grade.short_description = 'Grade'
