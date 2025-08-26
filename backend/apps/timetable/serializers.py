from rest_framework import serializers
from .models import (
    TimeSlot, Room, Schedule, ClassSchedule, ScheduleConflict,
    ScheduleTemplate, TemplateSchedule, ScheduleChange,
    ScheduleNotification, ScheduleSettings
)
from apps.academics.serializers import TeacherSerializer
from apps.classes.serializers import ClassSerializer
from apps.academic_years.models import AcademicYear


class TimeSlotSerializer(serializers.ModelSerializer):
    duration_minutes = serializers.ReadOnlyField()
    
    class Meta:
        model = TimeSlot
        fields = '__all__'


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'


class ScheduleSerializer(serializers.ModelSerializer):
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Schedule
        fields = '__all__'


class ClassScheduleSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_obj.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)
    time_slot_display = serializers.CharField(source='time_slot.__str__', read_only=True)
    
    class Meta:
        model = ClassSchedule
        fields = '__all__'


class ScheduleConflictSerializer(serializers.ModelSerializer):
    class_schedule_display = serializers.CharField(source='class_schedule.__str__', read_only=True)
    conflicting_schedule_display = serializers.CharField(source='conflicting_schedule.__str__', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.get_full_name', read_only=True)
    
    class Meta:
        model = ScheduleConflict
        fields = '__all__'


class ScheduleTemplateSerializer(serializers.ModelSerializer):
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = ScheduleTemplate
        fields = '__all__'


class TemplateScheduleSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_obj.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)
    time_slot_display = serializers.CharField(source='time_slot.__str__', read_only=True)
    
    class Meta:
        model = TemplateSchedule
        fields = '__all__'


class ScheduleChangeSerializer(serializers.ModelSerializer):
    class_schedule_display = serializers.CharField(source='class_schedule.__str__', read_only=True)
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    
    class Meta:
        model = ScheduleChange
        fields = '__all__'


class ScheduleNotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)
    
    class Meta:
        model = ScheduleNotification
        fields = '__all__'


class ScheduleSettingsSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)
    
    class Meta:
        model = ScheduleSettings
        fields = '__all__'


# Detailed serializers for complex views
class ClassScheduleDetailSerializer(serializers.ModelSerializer):
    class_obj = ClassSerializer(read_only=True)
    subject = serializers.PrimaryKeyRelatedField(read_only=True)
    teacher = TeacherSerializer(read_only=True)
    room = RoomSerializer(read_only=True)
    time_slot = TimeSlotSerializer(read_only=True)
    schedule = ScheduleSerializer(read_only=True)
    
    class Meta:
        model = ClassSchedule
        fields = '__all__'


class ScheduleDetailSerializer(serializers.ModelSerializer):
    class_schedules = ClassScheduleDetailSerializer(many=True, read_only=True)
    conflicts = ScheduleConflictSerializer(many=True, read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Schedule
        fields = '__all__'


class TimetableDashboardSerializer(serializers.Serializer):
    total_schedules = serializers.IntegerField()
    active_schedules = serializers.IntegerField()
    total_conflicts = serializers.IntegerField()
    unresolved_conflicts = serializers.IntegerField()
    total_rooms = serializers.IntegerField()
    available_rooms = serializers.IntegerField()
    total_time_slots = serializers.IntegerField()
    recent_changes = ScheduleChangeSerializer(many=True)
    upcoming_classes = ClassScheduleSerializer(many=True)


class ScheduleConflictResolutionSerializer(serializers.Serializer):
    conflict_id = serializers.IntegerField()
    resolution_type = serializers.ChoiceField(choices=[
        ('move_class', 'Move Class'),
        ('change_room', 'Change Room'),
        ('change_teacher', 'Change Teacher'),
        ('change_time', 'Change Time'),
        ('ignore', 'Ignore Conflict')
    ])
    new_room_id = serializers.IntegerField(required=False)
    new_teacher_id = serializers.IntegerField(required=False)
    new_time_slot_id = serializers.IntegerField(required=False)
    reason = serializers.CharField(required=False)


class BulkScheduleCreateSerializer(serializers.Serializer):
    schedule_id = serializers.IntegerField()
    class_schedules = serializers.ListField(
        child=serializers.DictField()
    )


class ScheduleExportSerializer(serializers.Serializer):
    schedule_id = serializers.IntegerField()
    format = serializers.ChoiceField(choices=['pdf', 'excel', 'csv'])
    include_details = serializers.BooleanField(default=True)
