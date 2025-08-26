from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, F
from django.utils import timezone
from datetime import datetime, timedelta

from .models import (
    TimeSlot, Room, Schedule, ClassSchedule, ScheduleConflict,
    ScheduleTemplate, TemplateSchedule, ScheduleChange,
    ScheduleNotification, ScheduleSettings
)
from .serializers import (
    TimeSlotSerializer, RoomSerializer, ScheduleSerializer,
    ClassScheduleSerializer, ScheduleConflictSerializer,
    ScheduleTemplateSerializer, TemplateScheduleSerializer,
    ScheduleChangeSerializer, ScheduleNotificationSerializer,
    ScheduleSettingsSerializer, ClassScheduleDetailSerializer,
    ScheduleDetailSerializer, TimetableDashboardSerializer,
    ScheduleConflictResolutionSerializer, BulkScheduleCreateSerializer,
    ScheduleExportSerializer
)


class TimeSlotViewSet(viewsets.ModelViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['day_of_week', 'is_active']
    search_fields = ['name']
    ordering_fields = ['day_of_week', 'start_time', 'end_time']
    ordering = ['day_of_week', 'start_time']

    @action(detail=False, methods=['get'])
    def by_day(self, request):
        """Get time slots grouped by day"""
        day = request.query_params.get('day', 'monday')
        slots = self.queryset.filter(day_of_week=day, is_active=True)
        serializer = self.get_serializer(slots, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple time slots at once"""
        slots_data = request.data.get('slots', [])
        created_slots = []
        
        for slot_data in slots_data:
            serializer = self.get_serializer(data=slot_data)
            if serializer.is_valid():
                slot = serializer.save()
                created_slots.append(slot)
        
        return Response({
            'created': len(created_slots),
            'slots': self.get_serializer(created_slots, many=True).data
        })


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['room_type', 'building', 'floor', 'is_active']
    search_fields = ['name', 'room_number', 'building']
    ordering_fields = ['building', 'floor', 'room_number', 'capacity']
    ordering = ['building', 'floor', 'room_number']

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get available rooms for a specific time slot"""
        time_slot_id = request.query_params.get('time_slot_id')
        date = request.query_params.get('date')
        
        if not time_slot_id or not date:
            return Response(
                {'error': 'time_slot_id and date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get rooms that are not occupied at the specified time
        occupied_rooms = ClassSchedule.objects.filter(
            time_slot_id=time_slot_id,
            is_active=True
        ).values_list('room_id', flat=True)
        
        available_rooms = self.queryset.filter(
            is_active=True
        ).exclude(id__in=occupied_rooms)
        
        serializer = self.get_serializer(available_rooms, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get rooms grouped by type"""
        room_type = request.query_params.get('type', 'classroom')
        rooms = self.queryset.filter(room_type=room_type, is_active=True)
        serializer = self.get_serializer(rooms, many=True)
        return Response(serializer.data)


class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['schedule_type', 'academic_year', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'start_date', 'end_date', 'created_at']
    ordering = ['-start_date']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ScheduleDetailSerializer
        return ScheduleSerializer

    @action(detail=True, methods=['get'])
    def timetable(self, request, pk=None):
        """Get complete timetable for a schedule"""
        schedule = self.get_object()
        class_schedules = schedule.class_schedules.filter(is_active=True)
        
        # Group by day and time
        timetable = {}
        for schedule_entry in class_schedules:
            day = schedule_entry.time_slot.day_of_week
            if day not in timetable:
                timetable[day] = []
            
            timetable[day].append(ClassScheduleDetailSerializer(schedule_entry).data)
        
        return Response(timetable)

    @action(detail=True, methods=['get'])
    def conflicts(self, request, pk=None):
        """Get conflicts for a schedule"""
        schedule = self.get_object()
        conflicts = schedule.conflicts.filter(is_resolved=False)
        serializer = ScheduleConflictSerializer(conflicts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def resolve_conflicts(self, request, pk=None):
        """Resolve conflicts in a schedule"""
        schedule = self.get_object()
        resolution_data = request.data
        
        serializer = ScheduleConflictResolutionSerializer(data=resolution_data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Implement conflict resolution logic here
        # This is a simplified version
        conflict = ScheduleConflict.objects.get(id=resolution_data['conflict_id'])
        conflict.is_resolved = True
        conflict.resolved_by = request.user
        conflict.resolved_at = timezone.now()
        conflict.save()
        
        return Response({'message': 'Conflict resolved successfully'})

    @action(detail=True, methods=['post'])
    def export(self, request, pk=None):
        """Export schedule to various formats"""
        schedule = self.get_object()
        serializer = ScheduleExportSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Implement export logic here
        # This would generate PDF, Excel, or CSV files
        format_type = serializer.validated_data['format']
        
        return Response({
            'message': f'Schedule exported as {format_type}',
            'download_url': f'/api/schedules/{pk}/download/{format_type}/'
        })


class ClassScheduleViewSet(viewsets.ModelViewSet):
    queryset = ClassSchedule.objects.all()
    serializer_class = ClassScheduleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['schedule', 'class_obj', 'subject', 'teacher', 'room', 'time_slot', 'is_active']
    search_fields = ['notes']
    ordering_fields = ['time_slot__day_of_week', 'time_slot__start_time']
    ordering = ['time_slot__day_of_week', 'time_slot__start_time']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ClassScheduleDetailSerializer
        return ClassScheduleSerializer

    @action(detail=False, methods=['get'])
    def by_teacher(self, request):
        """Get schedules for a specific teacher"""
        teacher_id = request.query_params.get('teacher_id')
        if not teacher_id:
            return Response(
                {'error': 'teacher_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        schedules = self.queryset.filter(teacher_id=teacher_id, is_active=True)
        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_class(self, request):
        """Get schedules for a specific class"""
        class_id = request.query_params.get('class_id')
        if not class_id:
            return Response(
                {'error': 'class_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        schedules = self.queryset.filter(class_obj_id=class_id, is_active=True)
        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple class schedules at once"""
        serializer = BulkScheduleCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        schedule_id = serializer.validated_data['schedule_id']
        class_schedules_data = serializer.validated_data['class_schedules']
        
        created_schedules = []
        for schedule_data in class_schedules_data:
            schedule_data['schedule'] = schedule_id
            schedule_serializer = self.get_serializer(data=schedule_data)
            if schedule_serializer.is_valid():
                schedule = schedule_serializer.save()
                created_schedules.append(schedule)
        
        return Response({
            'created': len(created_schedules),
            'schedules': self.get_serializer(created_schedules, many=True).data
        })


class ScheduleConflictViewSet(viewsets.ModelViewSet):
    queryset = ScheduleConflict.objects.all()
    serializer_class = ScheduleConflictSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['schedule', 'conflict_type', 'is_resolved']
    search_fields = ['description']
    ordering_fields = ['created_at', 'conflict_type']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def unresolved(self, request):
        """Get unresolved conflicts"""
        conflicts = self.queryset.filter(is_resolved=False)
        serializer = self.get_serializer(conflicts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve a specific conflict"""
        conflict = self.get_object()
        conflict.is_resolved = True
        conflict.resolved_by = request.user
        conflict.resolved_at = timezone.now()
        conflict.save()
        
        return Response({'message': 'Conflict resolved successfully'})


class ScheduleTemplateViewSet(viewsets.ModelViewSet):
    queryset = ScheduleTemplate.objects.all()
    serializer_class = ScheduleTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['academic_year', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'])
    def apply_to_schedule(self, request, pk=None):
        """Apply template to a schedule"""
        template = self.get_object()
        schedule_id = request.data.get('schedule_id')
        
        if not schedule_id:
            return Response(
                {'error': 'schedule_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Apply template logic here
        # This would copy template schedules to the target schedule
        
        return Response({'message': 'Template applied successfully'})


class TemplateScheduleViewSet(viewsets.ModelViewSet):
    queryset = TemplateSchedule.objects.all()
    serializer_class = TemplateScheduleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['template', 'class_obj', 'subject', 'teacher', 'room', 'time_slot']
    search_fields = ['notes']
    ordering_fields = ['time_slot__day_of_week', 'time_slot__start_time']
    ordering = ['time_slot__day_of_week', 'time_slot__start_time']


class ScheduleChangeViewSet(viewsets.ModelViewSet):
    queryset = ScheduleChange.objects.all()
    serializer_class = ScheduleChangeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['schedule', 'change_type', 'changed_by']
    search_fields = ['reason']
    ordering_fields = ['changed_at', 'change_type']
    ordering = ['-changed_at']

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent changes"""
        days = int(request.query_params.get('days', 7))
        since = timezone.now() - timedelta(days=days)
        changes = self.queryset.filter(changed_at__gte=since)
        serializer = self.get_serializer(changes, many=True)
        return Response(serializer.data)


class ScheduleNotificationViewSet(viewsets.ModelViewSet):
    queryset = ScheduleNotification.objects.all()
    serializer_class = ScheduleNotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['recipient', 'notification_type', 'is_read']
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'notification_type']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications for current user"""
        notifications = self.queryset.filter(
            recipient=request.user,
            is_read=False
        )
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        
        return Response({'message': 'Notification marked as read'})


class ScheduleSettingsViewSet(viewsets.ModelViewSet):
    queryset = ScheduleSettings.objects.all()
    serializer_class = ScheduleSettingsSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['school']
    search_fields = ['school__name']
    ordering_fields = ['school__name']
    ordering = ['school__name']


# Custom views for dashboard and analytics
class TimetableDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get timetable dashboard statistics"""
        total_schedules = Schedule.objects.count()
        active_schedules = Schedule.objects.filter(is_active=True).count()
        total_conflicts = ScheduleConflict.objects.count()
        unresolved_conflicts = ScheduleConflict.objects.filter(is_resolved=False).count()
        total_rooms = Room.objects.count()
        available_rooms = Room.objects.filter(is_active=True).count()
        total_time_slots = TimeSlot.objects.count()
        
        recent_changes = ScheduleChange.objects.all()[:10]
        upcoming_classes = ClassSchedule.objects.filter(
            is_active=True
        ).order_by('time_slot__day_of_week', 'time_slot__start_time')[:10]
        
        data = {
            'total_schedules': total_schedules,
            'active_schedules': active_schedules,
            'total_conflicts': total_conflicts,
            'unresolved_conflicts': unresolved_conflicts,
            'total_rooms': total_rooms,
            'available_rooms': available_rooms,
            'total_time_slots': total_time_slots,
            'recent_changes': ScheduleChangeSerializer(recent_changes, many=True).data,
            'upcoming_classes': ClassScheduleSerializer(upcoming_classes, many=True).data,
        }
        
        serializer = TimetableDashboardSerializer(data)
        return Response(serializer.data)
