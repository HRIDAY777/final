from rest_framework import serializers
from .models import (
    AttendanceSession, AttendanceRecord, LeaveRequest, 
    AttendanceReport, AttendanceSettings
)
from apps.academics.serializers import CourseSerializer, StudentSerializer, TeacherSerializer
from apps.classes.serializers import ClassSerializer
from django.utils import timezone


class AttendanceSessionSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    created_by = TeacherSerializer(read_only=True)
    duration_minutes = serializers.ReadOnlyField()
    total_students = serializers.ReadOnlyField()
    present_count = serializers.ReadOnlyField()
    absent_count = serializers.ReadOnlyField()
    late_count = serializers.ReadOnlyField()
    attendance_percentage = serializers.ReadOnlyField()

    class Meta:
        model = AttendanceSession
        fields = [
            'id', 'course', 'date', 'start_time', 'end_time', 'session_type',
            'is_active', 'created_by', 'duration_minutes', 'total_students',
            'present_count', 'absent_count', 'late_count', 'attendance_percentage',
            'created_at', 'updated_at'
        ]


class AttendanceSessionCreateSerializer(serializers.ModelSerializer):
    course_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = AttendanceSession
        fields = [
            'id', 'course_id', 'date', 'start_time', 'end_time', 'session_type'
        ]

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user.teacher_profile
        return super().create(validated_data)


class AttendanceRecordSerializer(serializers.ModelSerializer):
    session = AttendanceSessionSerializer(read_only=True)
    student = StudentSerializer(read_only=True)
    marked_by = TeacherSerializer(read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'session', 'student', 'status', 'arrival_time', 'departure_time',
            'remarks', 'marked_by', 'marked_at', 'updated_at'
        ]


class AttendanceRecordCreateSerializer(serializers.ModelSerializer):
    session_id = serializers.UUIDField(write_only=True)
    student_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'session_id', 'student_id', 'status', 'arrival_time',
            'departure_time', 'remarks'
        ]

    def create(self, validated_data):
        validated_data['marked_by'] = self.context['request'].user.teacher_profile
        return super().create(validated_data)


class BulkAttendanceRecordSerializer(serializers.Serializer):
    session_id = serializers.UUIDField()
    attendance_data = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of attendance records with student_id and status"
    )

    def validate_attendance_data(self, value):
        for record in value:
            if 'student_id' not in record:
                raise serializers.ValidationError("student_id is required for each record")
            if 'status' not in record:
                raise serializers.ValidationError("status is required for each record")
            if record['status'] not in ['present', 'absent', 'late', 'excused', 'half_day']:
                raise serializers.ValidationError("Invalid status value")
        return value


class LeaveRequestSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    approved_by = TeacherSerializer(read_only=True)
    duration_days = serializers.ReadOnlyField()
    is_approved = serializers.ReadOnlyField()
    is_pending = serializers.ReadOnlyField()

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'student', 'leave_type', 'start_date', 'end_date', 'reason',
            'supporting_documents', 'status', 'approved_by', 'approved_at',
            'rejection_reason', 'duration_days', 'is_approved', 'is_pending',
            'created_at', 'updated_at'
        ]


class LeaveRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'leave_type', 'start_date', 'end_date', 'reason',
            'supporting_documents'
        ]

    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user.student_profile
        return super().create(validated_data)

    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("Start date cannot be after end date")
        return data


class LeaveRequestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = ['status', 'rejection_reason']

    def update(self, instance, validated_data):
        if validated_data.get('status') == 'approved':
            validated_data['approved_by'] = self.context['request'].user.teacher_profile
            validated_data['approved_at'] = timezone.now()
        return super().update(instance, validated_data)


class AttendanceReportSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    class_enrolled = ClassSerializer(read_only=True)

    class Meta:
        model = AttendanceReport
        fields = [
            'id', 'student', 'class_enrolled', 'academic_year', 'month',
            'total_days', 'present_days', 'absent_days', 'late_days',
            'excused_days', 'attendance_percentage', 'generated_at'
        ]


class AttendanceSettingsSerializer(serializers.ModelSerializer):
    class_enrolled = ClassSerializer(read_only=True)

    class Meta:
        model = AttendanceSettings
        fields = [
            'id', 'class_enrolled', 'late_threshold_minutes',
            'absent_threshold_minutes', 'auto_mark_absent',
            'send_notifications', 'require_excuse_notes',
            'created_at', 'updated_at'
        ]


class AttendanceSettingsCreateSerializer(serializers.ModelSerializer):
    class_enrolled_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = AttendanceSettings
        fields = [
            'id', 'class_enrolled_id', 'late_threshold_minutes',
            'absent_threshold_minutes', 'auto_mark_absent',
            'send_notifications', 'require_excuse_notes'
        ]


# Dashboard and Analytics Serializers
class StudentAttendanceSummarySerializer(serializers.Serializer):
    student = StudentSerializer()
    total_sessions = serializers.IntegerField()
    present_sessions = serializers.IntegerField()
    absent_sessions = serializers.IntegerField()
    late_sessions = serializers.IntegerField()
    attendance_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    consecutive_absences = serializers.IntegerField()
    last_attendance_date = serializers.DateField(allow_null=True)


class ClassAttendanceSummarySerializer(serializers.Serializer):
    class_enrolled = ClassSerializer()
    total_sessions = serializers.IntegerField()
    average_attendance_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_students = serializers.IntegerField()
    present_students_today = serializers.IntegerField()
    absent_students_today = serializers.IntegerField()
    late_students_today = serializers.IntegerField()


class AttendanceTrendSerializer(serializers.Serializer):
    date = serializers.DateField()
    total_sessions = serializers.IntegerField()
    average_attendance_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    present_count = serializers.IntegerField()
    absent_count = serializers.IntegerField()
    late_count = serializers.IntegerField()


class LeaveRequestSummarySerializer(serializers.Serializer):
    total_requests = serializers.IntegerField()
    pending_requests = serializers.IntegerField()
    approved_requests = serializers.IntegerField()
    rejected_requests = serializers.IntegerField()
    leave_type_distribution = serializers.DictField()
