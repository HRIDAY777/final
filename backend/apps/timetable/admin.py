from django.contrib import admin
from django.utils.html import format_html
from .models import (
    TimeSlot, Room, Schedule, ClassSchedule, ScheduleConflict,
    ScheduleTemplate, TemplateSchedule, ScheduleChange,
    ScheduleNotification, ScheduleSettings
)


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['name', 'day_of_week', 'start_time', 'end_time', 'duration_minutes', 'is_active']
    list_filter = ['day_of_week', 'is_active']
    search_fields = ['name']
    ordering = ['day_of_week', 'start_time']
    
    def duration_minutes(self, obj):
        return f"{obj.duration_minutes} minutes"
    duration_minutes.short_description = 'Duration'


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['name', 'room_number', 'room_type', 'building', 'floor', 'capacity', 'is_active']
    list_filter = ['room_type', 'building', 'floor', 'is_active']
    search_fields = ['name', 'room_number', 'building']
    ordering = ['building', 'floor', 'room_number']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ['name', 'schedule_type', 'academic_year', 'start_date', 'end_date', 'is_active', 'created_by']
    list_filter = ['schedule_type', 'academic_year', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['-start_date']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'start_date'


@admin.register(ClassSchedule)
class ClassScheduleAdmin(admin.ModelAdmin):
    list_display = ['class_obj', 'subject', 'teacher', 'room', 'time_slot', 'schedule', 'is_active']
    list_filter = ['schedule', 'class_obj', 'subject', 'teacher', 'room', 'time_slot__day_of_week', 'is_active']
    search_fields = ['class_obj__name', 'subject__name', 'teacher__full_name', 'room__name']
    ordering = ['time_slot__day_of_week', 'time_slot__start_time']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'class_obj', 'subject', 'teacher', 'room', 'time_slot', 'schedule'
        )


@admin.register(ScheduleConflict)
class ScheduleConflictAdmin(admin.ModelAdmin):
    list_display = ['conflict_type', 'class_schedule', 'conflicting_schedule', 'is_resolved', 'created_at']
    list_filter = ['conflict_type', 'is_resolved', 'created_at']
    search_fields = ['description']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'class_schedule', 'conflicting_schedule', 'resolved_by'
        )


@admin.register(ScheduleTemplate)
class ScheduleTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'academic_year', 'is_active', 'created_by', 'created_at']
    list_filter = ['academic_year', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TemplateSchedule)
class TemplateScheduleAdmin(admin.ModelAdmin):
    list_display = ['template', 'class_obj', 'subject', 'teacher', 'room', 'time_slot']
    list_filter = ['template', 'class_obj', 'subject', 'teacher', 'room', 'time_slot__day_of_week']
    search_fields = ['template__name', 'class_obj__name', 'subject__name', 'teacher__full_name']
    ordering = ['time_slot__day_of_week', 'time_slot__start_time']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'template', 'class_obj', 'subject', 'teacher', 'room', 'time_slot'
        )


@admin.register(ScheduleChange)
class ScheduleChangeAdmin(admin.ModelAdmin):
    list_display = ['change_type', 'class_schedule', 'changed_by', 'changed_at']
    list_filter = ['change_type', 'changed_at']
    search_fields = ['reason']
    ordering = ['-changed_at']
    readonly_fields = ['changed_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'class_schedule', 'changed_by'
        )


@admin.register(ScheduleNotification)
class ScheduleNotificationAdmin(admin.ModelAdmin):
    list_display = ['recipient', 'notification_type', 'title', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['recipient__username', 'title', 'message']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'read_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('recipient')


@admin.register(ScheduleSettings)
class ScheduleSettingsAdmin(admin.ModelAdmin):
    list_display = ['school', 'default_start_time', 'default_end_time', 'max_periods_per_day']
    list_filter = ['allow_weekend_classes', 'auto_resolve_conflicts', 'notify_on_changes']
    search_fields = ['school__name']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('school')
