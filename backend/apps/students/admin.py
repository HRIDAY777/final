from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from .models import (
    Student, StudentProfile, StudentAcademicRecord, StudentGuardian,
    StudentDocument, StudentAchievement, StudentDiscipline, StudentSettings
)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = [
        'student_id', 'full_name', 'current_class', 'status', 'gender', 
        'admission_date', 'is_active', 'created_at'
    ]
    list_filter = [
        'status', 'gender', 'current_class', 'academic_year', 'is_active',
        'admission_date', 'created_at'
    ]
    search_fields = [
        'student_id', 'admission_number', 'first_name', 'last_name', 
        'middle_name', 'email', 'phone'
    ]
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25
    list_select_related = ['current_class', 'academic_year']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('user', 'student_id', 'admission_number', 'first_name', 'last_name', 'middle_name')
        }),
        (_('Personal Information'), {
            'fields': ('date_of_birth', 'gender', 'blood_group')
        }),
        (_('Contact Information'), {
            'fields': ('email', 'phone', 'address', 'city', 'state', 'postal_code', 'country')
        }),
        (_('Academic Information'), {
            'fields': ('current_class', 'admission_date', 'academic_year')
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
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('current_class', 'academic_year')


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ['student', 'emergency_contact_name', 'emergency_contact', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['student__first_name', 'student__last_name', 'emergency_contact_name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Student'), {
            'fields': ('student',)
        }),
        (_('Personal Information'), {
            'fields': ('profile_picture', 'emergency_contact', 'emergency_contact_name', 'emergency_contact_relation')
        }),
        (_('Medical Information'), {
            'fields': ('medical_conditions', 'allergies', 'medications'),
            'classes': ('collapse',)
        }),
        (_('Additional Information'), {
            'fields': ('hobbies', 'achievements', 'notes'),
            'classes': ('collapse',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(StudentAcademicRecord)
class StudentAcademicRecordAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'academic_year', 'class_enrolled', 'percentage', 
        'grade', 'rank', 'attendance_percentage', 'is_promoted'
    ]
    list_filter = [
        'academic_year', 'class_enrolled', 'grade', 'is_promoted',
        'created_at'
    ]
    search_fields = ['student__first_name', 'student__last_name', 'student__student_id']
    readonly_fields = ['percentage', 'attendance_percentage', 'created_at', 'updated_at']
    list_per_page = 25
    
    fieldsets = (
        (_('Student Information'), {
            'fields': ('student', 'academic_year', 'class_enrolled')
        }),
        (_('Academic Performance'), {
            'fields': ('total_marks', 'obtained_marks', 'percentage', 'grade', 'rank')
        }),
        (_('Attendance'), {
            'fields': ('total_days', 'present_days', 'attendance_percentage')
        }),
        (_('Promotion'), {
            'fields': ('is_promoted', 'promotion_date')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student', 'academic_year', 'class_enrolled')


@admin.register(StudentGuardian)
class StudentGuardianAdmin(admin.ModelAdmin):
    list_display = [
        'full_name', 'student', 'relationship', 'phone', 'email',
        'is_primary_guardian', 'is_emergency_contact'
    ]
    list_filter = [
        'relationship', 'is_primary_guardian', 'is_emergency_contact',
        'created_at'
    ]
    search_fields = [
        'first_name', 'last_name', 'student__first_name', 'student__last_name',
        'phone', 'email'
    ]
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Student'), {
            'fields': ('student', 'relationship')
        }),
        (_('Guardian Information'), {
            'fields': ('first_name', 'last_name', 'middle_name', 'date_of_birth')
        }),
        (_('Contact Information'), {
            'fields': ('email', 'phone', 'alternate_phone', 'address', 'city', 'state', 'postal_code')
        }),
        (_('Professional Information'), {
            'fields': ('occupation', 'employer', 'annual_income'),
            'classes': ('collapse',)
        }),
        (_('Additional Information'), {
            'fields': ('is_primary_guardian', 'is_emergency_contact', 'notes')
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


@admin.register(StudentDocument)
class StudentDocumentAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'document_type', 'title', 'issue_date', 'is_verified',
        'verified_by', 'created_at'
    ]
    list_filter = [
        'document_type', 'is_verified', 'issue_date', 'created_at'
    ]
    search_fields = [
        'student__first_name', 'student__last_name', 'title', 'description'
    ]
    readonly_fields = ['file_size', 'file_type', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('Student'), {
            'fields': ('student',)
        }),
        (_('Document Information'), {
            'fields': ('document_type', 'title', 'description')
        }),
        (_('File'), {
            'fields': ('file', 'file_size', 'file_type')
        }),
        (_('Document Details'), {
            'fields': ('issue_date', 'expiry_date', 'issuing_authority')
        }),
        (_('Verification'), {
            'fields': ('is_verified', 'verified_by', 'verified_at')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(StudentAchievement)
class StudentAchievementAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'title', 'achievement_type', 'level', 'date_achieved',
        'position', 'is_verified', 'points_awarded'
    ]
    list_filter = [
        'achievement_type', 'level', 'is_verified', 'date_achieved', 'created_at'
    ]
    search_fields = [
        'student__first_name', 'student__last_name', 'title', 'description'
    ]
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Student'), {
            'fields': ('student',)
        }),
        (_('Achievement Information'), {
            'fields': ('title', 'description', 'achievement_type', 'level')
        }),
        (_('Achievement Details'), {
            'fields': ('date_achieved', 'position', 'prize_amount')
        }),
        (_('Certificate'), {
            'fields': ('certificate', 'certificate_number', 'issuing_authority')
        }),
        (_('Additional Information'), {
            'fields': ('points_awarded', 'is_verified', 'verified_by')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(StudentDiscipline)
class StudentDisciplineAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'discipline_type', 'severity', 'incident_date',
        'is_resolved', 'reported_by', 'created_at'
    ]
    list_filter = [
        'discipline_type', 'severity', 'is_resolved', 'incident_date', 'created_at'
    ]
    search_fields = [
        'student__first_name', 'student__last_name', 'violation',
        'incident_description'
    ]
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Student'), {
            'fields': ('student',)
        }),
        (_('Discipline Information'), {
            'fields': ('discipline_type', 'severity')
        }),
        (_('Incident Details'), {
            'fields': ('incident_date', 'incident_description', 'violation')
        }),
        (_('Action Taken'), {
            'fields': ('action_taken', 'duration', 'start_date', 'end_date')
        }),
        (_('Reporting'), {
            'fields': ('reported_by', 'witnesses')
        }),
        (_('Follow-up'), {
            'fields': ('is_resolved', 'resolution_date', 'resolution_notes')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(StudentSettings)
class StudentSettingsAdmin(admin.ModelAdmin):
    list_display = ['student', 'email_notifications', 'sms_notifications', 'profile_visibility']
    list_filter = [
        'email_notifications', 'sms_notifications', 'push_notifications',
        'profile_visibility', 'grade_notifications', 'attendance_notifications'
    ]
    search_fields = ['student__first_name', 'student__last_name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Student'), {
            'fields': ('student',)
        }),
        (_('Notification Settings'), {
            'fields': ('email_notifications', 'sms_notifications', 'push_notifications')
        }),
        (_('Privacy Settings'), {
            'fields': ('profile_visibility',)
        }),
        (_('Academic Settings'), {
            'fields': ('grade_notifications', 'attendance_notifications', 'assignment_notifications')
        }),
        (_('Communication Settings'), {
            'fields': ('allow_teacher_messages', 'allow_guardian_messages', 'allow_class_messages')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
