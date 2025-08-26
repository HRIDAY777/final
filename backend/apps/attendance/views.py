from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta

from .models import AttendanceRecord, AttendanceReport
from .serializers import (
    AttendanceRecordSerializer, AttendanceReportSerializer
)


# AttendanceViewSet removed - Attendance model not found


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    """Attendance Record Management"""
    
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return AttendanceRecord.objects.select_related('attendance', 'student')
        elif hasattr(user, 'tenant') and user.tenant:
            return AttendanceRecord.objects.filter(
                attendance__tenant=user.tenant
            ).select_related('attendance', 'student')
        return AttendanceRecord.objects.none()


class AttendanceReportViewSet(viewsets.ModelViewSet):
    """Attendance Report Management"""
    
    queryset = AttendanceReport.objects.all()
    serializer_class = AttendanceReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return AttendanceReport.objects.select_related('student', 'class_obj')
        elif hasattr(user, 'tenant') and user.tenant:
            return AttendanceReport.objects.filter(
                student__tenant=user.tenant
            ).select_related('student', 'class_obj')
        return AttendanceReport.objects.none()
