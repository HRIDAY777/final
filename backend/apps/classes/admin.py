from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from .models import (
    Class, Subject, ClassSubject, ClassRoom, ClassSchedule,
    ClassEnrollment, SubjectPrerequisite, ClassSettings
)

@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'full_name', 'grade_level', 'section', 'capacity',
        'current_students', 'occupancy_rate_display', 'class_teacher',
        'room', 'is_active', 'created_at'
    ]
    list_filter = [
        'grade_level', 'section', 'is_active', 'academic_year',
        'class_teacher', 'room', 'created_at'
    ]
    search_fields = [
        'name', 'code', 'description', 'class_teacher__first_name',
        'class_teacher__last_name', 'room__name', 'room__number'
    ]
    readonly_fields = ['current_students', 'created_at', 'updated_at']
    list_per_page = 25
    list_select_related = ['class_teacher', 'room', 'academic_year']

    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'code', 'description', 'academic_year', 'grade_level', 'section')
        }),
        (_('Capacity & Enrollment'), {
            'fields': ('capacity', 'current_students')
        }),
        (_('Assignment'), {
            'fields': ('class_teacher', 'room')
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = _('Full Name')
    full_name.admin_order_field = 'name'

    def occupancy_rate_display(self, obj):
        rate = obj.occupancy_rate
        color = 'green' if rate < 80 else 'orange' if rate < 95 else 'red'
        return format_html(
            '<span style="color: {};">{:.1f}%</span>',
            color, rate
        )
    occupancy_rate_display.short_description = _('Occupancy Rate')

    actions = ['activate_classes', 'deactivate_classes']

    def activate_classes(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} classes activated successfully.')
    activate_classes.short_description = "Activate selected classes"

    def deactivate_classes(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} classes deactivated successfully.')
    deactivate_classes.short_description = "Deactivate selected classes"

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'name', 'category', 'grade_level', 'credit_hours',
        'max_marks', 'pass_marks', 'is_active', 'created_at'
    ]
    list_filter = [
        'category', 'grade_level', 'is_active', 'created_at'
    ]
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25

    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'code', 'description', 'category', 'grade_level')
        }),
        (_('Academic Settings'), {
            'fields': ('credit_hours', 'max_marks', 'pass_marks')
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['activate_subjects', 'deactivate_subjects']

    def activate_subjects(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} subjects activated successfully.')
    activate_subjects.short_description = "Activate selected subjects"

    def deactivate_subjects(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} subjects deactivated successfully.')
    deactivate_subjects.short_description = "Deactivate selected subjects"

@admin.register(ClassSubject)
class ClassSubjectAdmin(admin.ModelAdmin):
    list_display = [
        'class_obj', 'subject', 'teacher', 'academic_year',
        'is_compulsory', 'weekly_hours', 'order', 'is_active'
    ]
    list_filter = [
        'is_compulsory', 'is_active', 'academic_year',
        'class_obj__grade_level', 'subject__category'
    ]
    search_fields = [
        'class_obj__name', 'subject__name', 'teacher__first_name',
        'teacher__last_name'
    ]
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25
    list_select_related = ['class_obj', 'subject', 'teacher', 'academic_year']

    fieldsets = (
        (_('Class & Subject'), {
            'fields': ('class_obj', 'subject', 'academic_year')
        }),
        (_('Teacher Assignment'), {
            'fields': ('teacher',)
        }),
        (_('Settings'), {
            'fields': ('is_compulsory', 'weekly_hours', 'order')
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['activate_class_subjects', 'deactivate_class_subjects']

    def activate_class_subjects(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} class subjects activated successfully.')
    activate_class_subjects.short_description = "Activate selected class subjects"

    def deactivate_class_subjects(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} class subjects deactivated successfully.')
    deactivate_class_subjects.short_description = "Deactivate selected class subjects"

@admin.register(ClassRoom)
class ClassRoomAdmin(admin.ModelAdmin):
    list_display = [
        'number', 'name', 'building', 'floor', 'room_type',
        'capacity', 'is_available', 'is_active', 'created_at'
    ]
    list_filter = [
        'room_type', 'building', 'floor', 'is_available', 'is_active', 'created_at'
    ]
    search_fields = ['name', 'number', 'building', 'equipment']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25

    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'number', 'building', 'floor')
        }),
        (_('Capacity & Type'), {
            'fields': ('capacity', 'room_type')
        }),
        (_('Equipment'), {
            'fields': ('equipment',)
        }),
        (_('Status'), {
            'fields': ('is_available', 'is_active')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['make_available', 'make_unavailable']

    def make_available(self, request, queryset):
        updated = queryset.update(is_available=True)
        self.message_user(request, f'{updated} rooms made available successfully.')
    make_available.short_description = "Make selected rooms available"

    def make_unavailable(self, request, queryset):
        updated = queryset.update(is_available=False)
        self.message_user(request, f'{updated} rooms made unavailable successfully.')
    make_unavailable.short_description = "Make selected rooms unavailable"

@admin.register(ClassSchedule)
class ClassScheduleAdmin(admin.ModelAdmin):
    list_display = [
        'class_obj', 'subject', 'teacher', 'room', 'day_of_week',
        'start_time', 'end_time', 'period_number', 'duration_display', 'is_active'
    ]
    list_filter = [
        'day_of_week', 'is_active', 'academic_year',
        'class_obj__grade_level', 'subject__category'
    ]
    search_fields = [
        'class_obj__name', 'subject__name', 'teacher__first_name',
        'teacher__last_name', 'room__name'
    ]
    readonly_fields = ['duration_minutes', 'created_at', 'updated_at']
    list_per_page = 25
    list_select_related = ['class_obj', 'subject', 'teacher', 'room', 'academic_year']

    fieldsets = (
        (_('Class & Subject'), {
            'fields': ('class_obj', 'subject', 'academic_year')
        }),
        (_('Teacher & Room'), {
            'fields': ('teacher', 'room')
        }),
        (_('Schedule'), {
            'fields': ('day_of_week', 'start_time', 'end_time', 'period_number')
        }),
        (_('Duration'), {
            'fields': ('duration_minutes',)
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def duration_display(self, obj):
        return f"{obj.duration_minutes} min"
    duration_display.short_description = _('Duration')

    actions = ['activate_schedules', 'deactivate_schedules']

    def activate_schedules(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} schedules activated successfully.')
    activate_schedules.short_description = "Activate selected schedules"

    def deactivate_schedules(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} schedules deactivated successfully.')
    deactivate_schedules.short_description = "Deactivate selected schedules"

@admin.register(ClassEnrollment)
class ClassEnrollmentAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'class_obj', 'academic_year', 'enrollment_date',
        'status', 'created_at'
    ]
    list_filter = [
        'status', 'enrollment_date', 'academic_year',
        'class_obj__grade_level'
    ]
    search_fields = [
        'student__first_name', 'student__last_name', 'student__student_id',
        'class_obj__name', 'remarks'
    ]
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25
    list_select_related = ['student', 'class_obj', 'academic_year']

    fieldsets = (
        (_('Student & Class'), {
            'fields': ('student', 'class_obj', 'academic_year')
        }),
        (_('Enrollment Details'), {
            'fields': ('enrollment_date', 'status', 'remarks')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['activate_enrollments', 'deactivate_enrollments']

    def activate_enrollments(self, request, queryset):
        updated = queryset.update(status='active')
        self.message_user(request, f'{updated} enrollments activated successfully.')
    activate_enrollments.short_description = "Activate selected enrollments"

    def deactivate_enrollments(self, request, queryset):
        updated = queryset.update(status='inactive')
        self.message_user(request, f'{updated} enrollments deactivated successfully.')
    deactivate_enrollments.short_description = "Deactivate selected enrollments"

@admin.register(SubjectPrerequisite)
class SubjectPrerequisiteAdmin(admin.ModelAdmin):
    list_display = [
        'subject', 'prerequisite_subject', 'minimum_grade',
        'is_mandatory', 'created_at'
    ]
    list_filter = [
        'minimum_grade', 'is_mandatory', 'created_at',
        'subject__category', 'prerequisite_subject__category'
    ]
    search_fields = [
        'subject__name', 'prerequisite_subject__name'
    ]
    readonly_fields = ['created_at']
    list_per_page = 25
    list_select_related = ['subject', 'prerequisite_subject']

    fieldsets = (
        (_('Subject Relationship'), {
            'fields': ('subject', 'prerequisite_subject')
        }),
        (_('Requirements'), {
            'fields': ('minimum_grade', 'is_mandatory')
        }),
        (_('Timestamps'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

@admin.register(ClassSettings)
class ClassSettingsAdmin(admin.ModelAdmin):
    list_display = [
        'class_obj', 'max_absences', 'attendance_required',
        'grading_system', 'pass_percentage', 'allow_repeat', 'max_repeats'
    ]
    list_filter = [
        'attendance_required', 'grading_system', 'allow_repeat',
        'class_obj__grade_level'
    ]
    search_fields = [
        'class_obj__name', 'class_obj__code'
    ]
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25
    list_select_related = ['class_obj']

    fieldsets = (
        (_('Class'), {
            'fields': ('class_obj',)
        }),
        (_('Attendance Settings'), {
            'fields': ('max_absences', 'attendance_required')
        }),
        (_('Grading Settings'), {
            'fields': ('grading_system', 'pass_percentage')
        }),
        (_('Repeat Settings'), {
            'fields': ('allow_repeat', 'max_repeats')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
