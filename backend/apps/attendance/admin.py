from django.contrib import admin
from django.utils.html import format_html
from .models import (
    AttendanceSession, AttendanceRecord, LeaveRequest,
    AttendanceReport, AttendanceSettings
)


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = [
        'course', 'date', 'start_time', 'end_time', 'session_type',
        'total_students', 'attendance_percentage', 'is_active'
    ]
    list_filter = ['date', 'session_type', 'is_active', 'created_at']
    search_fields = [
        'course__subject__name', 'course__class_enrolled__name'
    ]
    readonly_fields = [
        'duration_minutes', 'total_students', 'present_count',
        'absent_count', 'late_count', 'attendance_percentage'
    ]
    list_editable = ['is_active']
    ordering = ['-date', '-start_time']

    def total_students(self, obj):
        return obj.total_students
    total_students.short_description = 'Total Students'

    def attendance_percentage(self, obj):
        return f"{obj.attendance_percentage}%"
    attendance_percentage.short_description = 'Attendance %'


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'session', 'status', 'arrival_time', 'marked_by',
        'marked_at'
    ]
    list_filter = ['status', 'session__date', 'marked_at']
    search_fields = [
        'student__user__first_name', 'student__user__last_name',
        'session__course__subject__name'
    ]
    readonly_fields = ['marked_at']
    ordering = ['-session__date', 'student__user__first_name']

    def status(self, obj):
        status_colors = {
            'present': 'green',
            'absent': 'red',
            'late': 'orange',
            'excused': 'blue',
            'half_day': 'purple'
        }
        color = status_colors.get(obj.status, 'black')
        return format_html(
            f'<span style="color: {color}; font-weight: bold;">'
            f'{obj.status.title()}</span>'
        )
    status.short_description = 'Status'


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'leave_type', 'start_date', 'end_date', 'duration_days',
        'status', 'approved_by', 'created_at'
    ]
    list_filter = [
        'leave_type', 'status', 'start_date', 'end_date', 'created_at'
    ]
    search_fields = [
        'student__user__first_name', 'student__user__last_name', 'reason'
    ]
    readonly_fields = ['duration_days', 'is_approved', 'is_pending']
    list_editable = ['status']
    ordering = ['-created_at']

    def duration_days(self, obj):
        return obj.duration_days
    duration_days.short_description = 'Duration (Days)'

    def status(self, obj):
        status_colors = {
            'pending': 'orange',
            'approved': 'green',
            'rejected': 'red',
            'cancelled': 'gray'
        }
        color = status_colors.get(obj.status, 'black')
        return format_html(
            f'<span style="color: {color}; font-weight: bold;">'
            f'{obj.status.title()}</span>'
        )
    status.short_description = 'Status'

    def is_approved(self, obj):
        return obj.is_approved
    is_approved.short_description = 'Is Approved'
    is_approved.boolean = True

    def is_pending(self, obj):
        return obj.is_pending
    is_pending.short_description = 'Is Pending'
    is_pending.boolean = True


@admin.register(AttendanceReport)
class AttendanceReportAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'class_enrolled', 'academic_year', 'month', 'total_days',
        'present_days', 'attendance_percentage', 'generated_at'
    ]
    list_filter = ['academic_year', 'month', 'generated_at']
    search_fields = [
        'student__user__first_name', 'student__user__last_name',
        'class_enrolled__name'
    ]
    readonly_fields = ['attendance_percentage']
    ordering = ['-academic_year', '-month']

    def attendance_percentage(self, obj):
        return f"{obj.attendance_percentage}%"
    attendance_percentage.short_description = 'Attendance %'


@admin.register(AttendanceSettings)
class AttendanceSettingsAdmin(admin.ModelAdmin):
    list_display = [
        'class_enrolled', 'late_threshold_minutes', 'absent_threshold_minutes',
        'auto_mark_absent', 'send_notifications', 'require_excuse_notes'
    ]
    list_filter = [
        'auto_mark_absent', 'send_notifications', 'require_excuse_notes',
        'created_at'
    ]
    search_fields = ['class_enrolled__name']
    list_editable = [
        'late_threshold_minutes', 'absent_threshold_minutes',
        'auto_mark_absent',
        'send_notifications', 'require_excuse_notes'
    ]
    ordering = ['class_enrolled__name']

    def auto_mark_absent(self, obj):
        return obj.auto_mark_absent
    auto_mark_absent.short_description = 'Auto Mark Absent'
    auto_mark_absent.boolean = True

    def send_notifications(self, obj):
        return obj.send_notifications
    send_notifications.short_description = 'Send Notifications'
    send_notifications.boolean = True

    def require_excuse_notes(self, obj):
        return obj.require_excuse_notes
    require_excuse_notes.short_description = 'Require Excuse Notes'
    require_excuse_notes.boolean = True
