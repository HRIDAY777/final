from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from .models import (
    Guardian, GuardianProfile, GuardianStudent, GuardianDocument,
    GuardianSettings, GuardianNotification
)
from django.utils import timezone


@admin.register(Guardian)
class GuardianAdmin(admin.ModelAdmin):
    list_display = [
        'guardian_id', 'full_name', 'occupation', 'status', 'gender',
        'phone', 'email', 'is_active', 'created_at'
    ]
    list_filter = [
        'status', 'gender', 'occupation', 'education_level', 'is_active',
        'created_at'
    ]
    search_fields = [
        'guardian_id', 'first_name', 'last_name', 'middle_name',
        'email', 'phone', 'occupation', 'employer'
    ]
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25
    list_select_related = ['user']

    fieldsets = (
        (_('Basic Information'), {
            'fields': ('user', 'guardian_id', 'first_name', 'last_name', 'middle_name')
        }),
        (_('Personal Information'), {
            'fields': ('date_of_birth', 'gender', 'blood_group', 'email', 'phone', 'alternate_phone')
        }),
        (_('Address'), {
            'fields': ('address', 'city', 'state', 'postal_code', 'country')
        }),
        (_('Professional Information'), {
            'fields': ('occupation', 'employer', 'annual_income', 'education_level')
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


@admin.register(GuardianProfile)
class GuardianProfileAdmin(admin.ModelAdmin):
    list_display = [
        'guardian', 'marital_status', 'total_children', 'children_in_school',
        'preferred_contact_method', 'created_at'
    ]
    list_filter = [
        'marital_status', 'preferred_contact_method', 'preferred_contact_time',
        'created_at'
    ]
    search_fields = [
        'guardian__first_name', 'guardian__last_name', 'emergency_contact_name',
        'spouse_name'
    ]
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        (_('Guardian'), {
            'fields': ('guardian',)
        }),
        (_('Profile Picture'), {
            'fields': ('profile_picture',)
        }),
        (_('Emergency Contact'), {
            'fields': ('emergency_contact', 'emergency_contact_name', 'emergency_contact_relationship')
        }),
        (_('Personal Information'), {
            'fields': ('marital_status', 'spouse_name', 'spouse_occupation', 'spouse_phone')
        }),
        (_('Family Information'), {
            'fields': ('total_children', 'children_in_school')
        }),
        (_('Communication Preferences'), {
            'fields': ('preferred_contact_method', 'preferred_contact_time')
        }),
        (_('Social Media'), {
            'fields': ('facebook_profile', 'linkedin_profile'),
            'classes': ('collapse',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(GuardianStudent)
class GuardianStudentAdmin(admin.ModelAdmin):
    list_display = [
        'guardian', 'student', 'relationship', 'is_primary_guardian',
        'is_emergency_contact', 'is_fee_payer', 'created_at'
    ]
    list_filter = [
        'relationship', 'is_primary_guardian', 'is_emergency_contact',
        'is_fee_payer', 'is_authorized_pickup', 'created_at'
    ]
    search_fields = [
        'guardian__first_name', 'guardian__last_name',
        'student__first_name', 'student__last_name'
    ]
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        (_('Guardian & Student'), {
            'fields': ('guardian', 'student', 'relationship')
        }),
        (_('Roles & Permissions'), {
            'fields': (
                'is_primary_guardian', 'is_emergency_contact', 'is_fee_payer',
                'is_authorized_pickup'
            )
        }),
        (_('Access Permissions'), {
            'fields': (
                'can_view_academic_records', 'can_view_attendance',
                'can_view_fees', 'can_receive_notifications'
            )
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(GuardianDocument)
class GuardianDocumentAdmin(admin.ModelAdmin):
    list_display = [
        'guardian', 'document_type', 'title', 'file_type',
        'is_verified', 'verified_by', 'created_at'
    ]
    list_filter = ['document_type', 'is_verified', 'file_type', 'created_at']
    search_fields = [
        'guardian__first_name', 'guardian__last_name', 'title', 'description'
    ]
    readonly_fields = ['file_size', 'file_type', 'created_at', 'updated_at']

    fieldsets = (
        (_('Guardian & Document'), {
            'fields': ('guardian', 'document_type', 'title')
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


@admin.register(GuardianSettings)
class GuardianSettingsAdmin(admin.ModelAdmin):
    list_display = [
        'guardian', 'email_notifications', 'sms_notifications',
        'profile_visibility', 'theme_preference', 'language_preference'
    ]
    list_filter = [
        'email_notifications', 'sms_notifications', 'push_notifications',
        'profile_visibility', 'theme_preference', 'language_preference',
        'communication_frequency'
    ]
    search_fields = ['guardian__first_name', 'guardian__last_name']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        (_('Guardian'), {
            'fields': ('guardian',)
        }),
        (_('Notification Settings'), {
            'fields': ('email_notifications', 'sms_notifications', 'push_notifications')
        }),
        (_('Specific Notifications'), {
            'fields': (
                'academic_notifications', 'attendance_notifications',
                'fee_notifications', 'event_notifications',
                'emergency_notifications'
            ),
            'classes': ('collapse',)
        }),
        (_('Privacy & Display'), {
            'fields': ('profile_visibility', 'theme_preference', 'language_preference')
        }),
        (_('Communication Preferences'), {
            'fields': ('communication_frequency',),
            'classes': ('collapse',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(GuardianNotification)
class GuardianNotificationAdmin(admin.ModelAdmin):
    list_display = [
        'guardian', 'title', 'notification_type', 'priority',
        'read', 'created_at'
    ]
    list_filter = [
        'notification_type', 'priority', 'read', 'email_sent',
        'sms_sent', 'push_sent', 'created_at'
    ]
    search_fields = [
        'guardian__first_name', 'guardian__last_name', 'title', 'message'
    ]
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        (_('Guardian & Notification'), {
            'fields': ('guardian', 'title', 'message')
        }),
        (_('Notification Details'), {
            'fields': ('notification_type', 'priority')
        }),
        (_('Delivery Status'), {
            'fields': ('email_sent', 'sms_sent', 'push_sent', 'read', 'read_at')
        }),
        (_('Related Objects'), {
            'fields': ('related_student', 'related_event'),
            'classes': ('collapse',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['mark_as_read', 'mark_as_unread']

    def mark_as_read(self, request, queryset):
        updated = queryset.update(read=True, read_at=timezone.now())
        self.message_user(request, f'{updated} notifications marked as read.')
    mark_as_read.short_description = "Mark selected notifications as read"

    def mark_as_unread(self, request, queryset):
        updated = queryset.update(read=False, read_at=None)
        self.message_user(request, f'{updated} notifications marked as unread.')
    mark_as_unread.short_description = "Mark selected notifications as unread"
