from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from django.utils import timezone
from datetime import timedelta

from .models import AttendanceRecord, AttendanceReport, AttendanceSession
from .serializers import (
    AttendanceRecordSerializer, AttendanceReportSerializer,
    AttendanceSessionSerializer
)


class AttendanceViewSet(viewsets.ModelViewSet):
    """Attendance Management - Main attendance viewset"""

    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = ['status', 'session__date', 'student__current_class']
    search_fields = [
        'student__first_name', 'student__last_name', 'student__student_id'
    ]
    ordering_fields = ['session__date', 'created_at']
    ordering = ['-session__date']

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return AttendanceRecord.objects.select_related(
                'session', 'student', 'session__course'
            )
        elif hasattr(user, 'tenant') and user.tenant:
            return AttendanceRecord.objects.filter(
                student__tenant=user.tenant
            ).select_related(
                'session', 'student', 'session__course'
            )
        return AttendanceRecord.objects.none()

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get attendance dashboard statistics"""
        queryset = self.get_queryset()

        # Get today's attendance
        today = timezone.now().date()
        today_attendance = queryset.filter(session__date=today)

        # Get this week's attendance
        week_start = today - timedelta(days=today.weekday())
        week_attendance = queryset.filter(
            session__date__gte=week_start,
            session__date__lte=today
        )

        # Get this month's attendance
        month_start = today.replace(day=1)
        month_attendance = queryset.filter(
            session__date__gte=month_start,
            session__date__lte=today
        )

        return Response({
            'today': {
                'total': today_attendance.count(),
                'present': today_attendance.filter(status='present').count(),
                'absent': today_attendance.filter(status='absent').count(),
                'late': today_attendance.filter(status='late').count(),
            },
            'this_week': {
                'total': week_attendance.count(),
                'present': week_attendance.filter(status='present').count(),
                'absent': week_attendance.filter(status='absent').count(),
                'late': week_attendance.filter(status='late').count(),
            },
            'this_month': {
                'total': month_attendance.count(),
                'present': month_attendance.filter(status='present').count(),
                'absent': month_attendance.filter(status='absent').count(),
                'late': month_attendance.filter(status='late').count(),
            }
        })


class AttendanceSessionViewSet(viewsets.ModelViewSet):
    """Attendance Session Management"""

    queryset = AttendanceSession.objects.all()
    serializer_class = AttendanceSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = ['session_type', 'is_active', 'course', 'date']
    search_fields = ['course__name', 'course__code']
    ordering_fields = ['date', 'start_time', 'created_at']
    ordering = ['-date', '-start_time']

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return AttendanceSession.objects.select_related(
                'course', 'created_by', 'course__class_enrolled'
            )
        elif hasattr(user, 'tenant') and user.tenant:
            return AttendanceSession.objects.filter(
                course__class_enrolled__tenant=user.tenant
            ).select_related(
                'course', 'created_by', 'course__class_enrolled'
            )
        return AttendanceSession.objects.none()

    @action(detail=True, methods=['get'])
    def attendance_summary(self, request, pk=None):
        """Get attendance summary for a session"""
        session = self.get_object()

        total_students = session.total_students
        present_count = session.present_count
        absent_count = session.absent_count
        late_count = session.late_count
        att_pct = session.attendance_percentage
        duration = session.duration_minutes

        response_data = {
            'session_id': session.id,
            'course': session.course.name,
            'date': session.date,
            'total_students': total_students,
            'present': present_count,
            'absent': absent_count,
            'late': late_count,
            'attendance_percentage': att_pct,
            'duration_minutes': duration
        }
        return Response(response_data)


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    """Attendance Record Management"""

    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return AttendanceRecord.objects.select_related(
                'session', 'student'
            )
        elif hasattr(user, 'tenant') and user.tenant:
            return AttendanceRecord.objects.filter(
                student__tenant=user.tenant
            ).select_related(
                'session', 'student'
            )
        return AttendanceRecord.objects.none()


class AttendanceReportViewSet(viewsets.ModelViewSet):
    """Attendance Report Management"""

    queryset = AttendanceReport.objects.all()
    serializer_class = AttendanceReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return AttendanceReport.objects.select_related(
                'student', 'class_obj'
            )
        elif hasattr(user, 'tenant') and user.tenant:
            return AttendanceReport.objects.filter(
                student__tenant=user.tenant
            ).select_related(
                'student', 'class_obj'
            )
        return AttendanceReport.objects.none()
