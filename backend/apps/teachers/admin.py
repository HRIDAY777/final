from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from .models import (
    Teacher, TeacherProfile, TeacherQualification, TeacherExperience,
    TeacherSubject, TeacherClass, TeacherAttendance, TeacherSalary,
    TeacherLeave, TeacherPerformance, TeacherDocument, TeacherSettings
)


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = [
        'teacher_id', 'full_name', 'designation', 'department', 'status',
        'employment_type', 'joining_date', 'is_active', 'created_at'
    ]
    list_filter = [
        'status', 'gender', 'employment_type', 'department', 'is_active',
        'joining_date', 'created_at'
    ]
    search_fields = [
        'teacher_id', 'employee_number', 'first_name', 'last_name',
        'middle_name', 'email', 'phone', 'designation'
    ]
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25
    list_select_related = ['user']

    fieldsets = (
        (_('Basic Information'), {
            'fields': ('user', 'teacher_id', 'employee_number', 'first_name', 'last_name', 'middle_name')
        }),
        (_('Personal Information'), {
            'fields': ('date_of_birth', 'gender', 'blood_group', 'email', 'phone')
        }),
        (_('Address'), {
            'fields': ('address', 'city', 'state', 'postal_code', 'country')
        }),
        (_('Employment Details'), {
            'fields': ('joining_date', 'employment_type', 'designation', 'department', 'qualification', 'specialization')
        }),
        (_('Status'), {
            'fields': ('status', 'is_active')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = _('Full Name')
    full_name.admin_order_field = 'first_name'


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = [
        'teacher', 'marital_status', 'teaching_experience_years',
        'emergency_contact', 'created_at'
    ]
    list_filter = ['marital_status', 'teaching_experience_years', 'created_at']
    search_fields = ['teacher__first_name', 'teacher__last_name', 'emergency_contact_name']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        (_('Teacher'), {
            'fields': ('teacher',)
        }),
        (_('Profile Picture'), {
            'fields': ('profile_picture',)
        }),
        (_('Emergency Contact'), {
            'fields': ('emergency_contact', 'emergency_contact_name', 'emergency_contact_relationship')
        }),
        (_('Personal Information'), {
            'fields': ('marital_status', 'spouse_name', 'children_count')
        }),
        (_('Professional Information'), {
            'fields': ('teaching_experience_years', 'previous_schools', 'achievements', 'publications', 'research_interests')
        }),
        (_('Social Media'), {
            'fields': ('linkedin_profile', 'twitter_profile', 'personal_website'),
            'classes': ('collapse',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TeacherQualification)
class TeacherQualificationAdmin(admin.ModelAdmin):
    list_display = [
        'teacher', 'degree', 'institution', 'field_of_study',
        'completion_year', 'is_verified', 'created_at'
    ]
    list_filter = ['completion_year', 'is_verified', 'created_at']
    search_fields = [
        'teacher__first_name', 'teacher__last_name', 'degree',
        'institution', 'field_of_study'
    ]
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        (_('Teacher'), {
            'fields': ('teacher',)
        }),
        (_('Qualification Details'), {
            'fields': ('degree', 'institution', 'field_of_study', 'completion_year', 'grade_cgpa')
        }),
        (_('Certificate'), {
            'fields': ('certificate', 'is_verified')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TeacherExperience)
class TeacherExperienceAdmin(admin.ModelAdmin):
    list_display = [
        'teacher', 'organization', 'position', 'start_date',
        'end_date', 'is_current', 'created_at'
    ]
    list_filter = ['is_current', 'start_date', 'end_date', 'created_at']
    search_fields = [
        'teacher__first_name', 'teacher__last_name', 'organization',
        'position'
    ]
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        (_('Teacher'), {
            'fields': ('teacher',)
        }),
        (_('Experience Details'), {
            'fields': ('organization', 'position', 'start_date', 'end_date', 'is_current')
        }),
        (_('Description'), {
            'fields': ('description', 'achievements')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TeacherSubject)
class TeacherSubjectAdmin(admin.ModelAdmin):
    list_display = [
        'teacher', 'subject', 'is_primary', 'expertise_level',
        'years_teaching', 'created_at'
    ]
    list_filter = ['is_primary', 'expertise_level', 'years_teaching', 'created_at']
    search_fields = [
        'teacher__first_name', 'teacher__last_name', 'subject__name'
    ]
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        (_('Teacher & Subject'), {
            'fields': ('teacher', 'subject')
        }),
        (_('Assignment Details'), {
            'fields': ('is_primary', 'expertise_level', 'years_teaching')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TeacherClass)
class TeacherClassAdmin(admin.ModelAdmin):
    list_display = [
        'teacher', 'class_obj', 'academic_year', 'role',
        'is_active', 'created_at'
    ]
    list_filter = ['role', 'is_active', 'academic_year', 'created_at']
    search_fields = [
        'teacher__first_name', 'teacher__last_name', 'class_obj__name'
    ]
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        (_('Assignment'), {
            'fields': ('teacher', 'class_obj', 'academic_year')
        }),
        (_('Role Details'), {
            'fields': ('role', 'is_active')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TeacherAttendance)
class TeacherAttendanceAdmin(admin.ModelAdmin):
    list_display = [
        'teacher', 'date', 'status', 'check_in_time',
        'check_out_time', 'working_hours', 'created_at'
    ]
    list_filter = ['status', 'date', 'created_at']
    search_fields = [
        'teacher__first_name', 'teacher__last_name', 'remarks'
    ]
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'

    fieldsets = (
        (_('Teacher & Date'), {
            'fields': ('teacher', 'date')
        }),
        (_('Attendance Details'), {
            'fields': ('status', 'check_in_time', 'check_out_time', 'working_hours')
        }),
        (_('Additional Information'), {
            'fields': ('remarks',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TeacherSalary)
class TeacherSalaryAdmin(admin.ModelAdmin):
    list_display = [
        'teacher', 'month', 'year', 'basic_salary', 'gross_salary',
        'net_salary', 'payment_status', 'payment_date'
    ]
    list_filter = ['payment_status', 'month', 'year', 'payment_date', 'created_at']
    search_fields = [
        'teacher__first_name', 'teacher__last_name', 'payment_method'
    ]
    readonly_fields = ['gross_salary', 'total_deductions', 'net_salary', 'created_at', 'updated_at']

    fieldsets = (
        (_('Teacher & Period'), {
            'fields': ('teacher', 'month', 'year')
        }),
        (_('Salary Components'), {
            'fields': ('basic_salary', 'house_rent_allowance', 'medical_allowance', 'transport_allowance', 'other_allowances')
        }),
        (_('Deductions'), {
            'fields': ('provident_fund', 'tax_deduction', 'other_deductions')
        }),
        (_('Calculated Fields'), {
            'fields': ('gross_salary', 'total_deductions', 'net_salary'),
            'classes': ('collapse',)
        }),
        (_('Payment Information'), {
            'fields': ('payment_status', 'payment_date', 'payment_method')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TeacherLeave)
class TeacherLeaveAdmin(admin.ModelAdmin):
    list_display = [
        'teacher', 'leave_type', 'start_date', 'end_date',
        'total_days', 'status', 'approved_by', 'created_at'
    ]
    list_filter = ['leave_type', 'status', 'start_date', 'end_date', 'created_at']
    search_fields = [
        'teacher__first_name', 'teacher__last_name', 'reason', 'remarks'
    ]
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'start_date'

    fieldsets = (
        (_('Teacher & Leave Details'), {
            'fields': ('teacher', 'leave_type', 'start_date', 'end_date', 'total_days')
        }),
        (_('Leave Information'), {
            'fields': ('reason', 'status', 'remarks')
        }),
        (_('Approval'), {
            'fields': ('approved_by', 'approved_date')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TeacherPerformance)
class TeacherPerformanceAdmin(admin.ModelAdmin):
    list_display = [
        'teacher', 'academic_year', 'evaluation_period', 'evaluation_date',
        'overall_score', 'grade', 'evaluated_by', 'created_at'
    ]
    list_filter = [
        'evaluation_period', 'grade', 'evaluation_date', 'academic_year', 'created_at'
    ]
    search_fields = [
        'teacher__first_name', 'teacher__last_name', 'evaluated_by__first_name',
        'evaluated_by__last_name'
    ]
    readonly_fields = ['overall_score', 'grade', 'created_at', 'updated_at']

    fieldsets = (
        (_('Teacher & Evaluation'), {
            'fields': ('teacher', 'academic_year', 'evaluation_period', 'evaluation_date')
        }),
        (_('Performance Metrics'), {
            'fields': (
                'teaching_quality', 'student_engagement', 'classroom_management',
                'communication_skills', 'professional_development', 'teamwork',
                'attendance_punctuality'
            )
        }),
        (_('Calculated Fields'), {
            'fields': ('overall_score', 'grade'),
            'classes': ('collapse',)
        }),
        (_('Evaluation Details'), {
            'fields': ('strengths', 'areas_for_improvement', 'recommendations', 'evaluator_comments')
        }),
        (_('Evaluator'), {
            'fields': ('evaluated_by',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TeacherDocument)
class TeacherDocumentAdmin(admin.ModelAdmin):
    list_display = [
        'teacher', 'document_type', 'title', 'file_type',
        'is_verified', 'verified_by', 'created_at'
    ]
    list_filter = ['document_type', 'is_verified', 'file_type', 'created_at']
    search_fields = [
        'teacher__first_name', 'teacher__last_name', 'title', 'description'
    ]
    readonly_fields = ['file_size', 'file_type', 'created_at', 'updated_at']

    fieldsets = (
        (_('Teacher & Document'), {
            'fields': ('teacher', 'document_type', 'title')
        }),
        (_('File Information'), {
            'fields': ('file', 'file_size', 'file_type', 'description')
        }),
        (_('Verification'), {
            'fields': ('is_verified', 'verified_by', 'verified_date')
        }),
        (_('Additional Information'), {
            'fields': ('expiry_date',),
            'classes': ('collapse',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TeacherSettings)
class TeacherSettingsAdmin(admin.ModelAdmin):
    list_display = [
        'teacher', 'email_notifications', 'sms_notifications',
        'profile_visibility', 'theme_preference', 'language_preference'
    ]
    list_filter = [
        'email_notifications', 'sms_notifications', 'push_notifications',
        'profile_visibility', 'theme_preference', 'language_preference'
    ]
    search_fields = ['teacher__first_name', 'teacher__last_name']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        (_('Teacher'), {
            'fields': ('teacher',)
        }),
        (_('Notification Settings'), {
            'fields': ('email_notifications', 'sms_notifications', 'push_notifications')
        }),
        (_('Specific Notifications'), {
            'fields': (
                'attendance_notifications', 'leave_notifications',
                'salary_notifications', 'performance_notifications',
                'event_notifications'
            ),
            'classes': ('collapse',)
        }),
        (_('Privacy & Display'), {
            'fields': ('profile_visibility', 'theme_preference', 'language_preference')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
