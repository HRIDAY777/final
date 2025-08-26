from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, Sum, Max
from django.utils import timezone
from datetime import date, timedelta

from .models import (
    Guardian, GuardianProfile, GuardianStudent, GuardianDocument,
    GuardianSettings, GuardianNotification
)
from .serializers import (
    GuardianListSerializer, GuardianDetailSerializer, GuardianCreateSerializer,
    GuardianUpdateSerializer, GuardianDashboardSerializer, GuardianSearchSerializer,
    GuardianProfileSerializer, GuardianProfileCreateSerializer,
    GuardianStudentSerializer, GuardianStudentCreateSerializer,
    GuardianDocumentSerializer, GuardianDocumentCreateSerializer,
    GuardianSettingsSerializer, GuardianNotificationSerializer
)

class GuardianViewSet(viewsets.ModelViewSet):
    queryset = Guardian.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'gender', 'occupation', 'education_level', 'is_active']
    search_fields = ['guardian_id', 'first_name', 'last_name', 'middle_name', 'email', 'phone', 'occupation']
    ordering_fields = ['first_name', 'last_name', 'created_at']
    ordering = ['first_name', 'last_name']

    def get_serializer_class(self):
        if self.action == 'list':
            return GuardianListSerializer
        elif self.action == 'create':
            return GuardianCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return GuardianUpdateSerializer
        elif self.action == 'retrieve':
            return GuardianDetailSerializer
        elif self.action == 'dashboard':
            return GuardianDashboardSerializer
        elif self.action == 'search':
            return GuardianSearchSerializer
        return GuardianDetailSerializer

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get guardian dashboard statistics"""
        total_guardians = Guardian.objects.count()
        active_guardians = Guardian.objects.filter(is_active=True).count()
        total_students = GuardianStudent.objects.values('student').distinct().count()
        
        # Recent guardians
        recent_guardians = Guardian.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        # Guardians by occupation
        occupation_stats = Guardian.objects.values('occupation').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        # Guardians by status
        status_stats = Guardian.objects.values('status').annotate(
            count=Count('id')
        )
        
        return Response({
            'total_guardians': total_guardians,
            'active_guardians': active_guardians,
            'total_students': total_students,
            'recent_guardians': recent_guardians,
            'occupation_stats': occupation_stats,
            'status_stats': status_stats
        })

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced search for guardians"""
        query = request.query_params.get('q', '')
        if not query:
            return Response({'error': 'Search query is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        guardians = Guardian.objects.filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(guardian_id__icontains=query) |
            Q(email__icontains=query) |
            Q(phone__icontains=query) |
            Q(occupation__icontains=query)
        )[:20]
        
        serializer = self.get_serializer(guardians, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a guardian"""
        guardian = self.get_object()
        guardian.is_active = True
        guardian.save()
        return Response({'message': 'Guardian activated successfully'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a guardian"""
        guardian = self.get_object()
        guardian.is_active = False
        guardian.save()
        return Response({'message': 'Guardian deactivated successfully'})

    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        """Get guardian profile with all related data"""
        guardian = self.get_object()
        serializer = GuardianDetailSerializer(guardian)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get guardian statistics"""
        total_guardians = Guardian.objects.count()
        active_guardians = Guardian.objects.filter(is_active=True).count()
        inactive_guardians = Guardian.objects.filter(is_active=False).count()
        
        # Gender distribution
        gender_stats = Guardian.objects.values('gender').annotate(
            count=Count('id')
        )
        
        # Occupation distribution
        occupation_stats = Guardian.objects.values('occupation').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Monthly registration trend
        monthly_trend = Guardian.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=365)
        ).extra(
            select={'month': "EXTRACT(month FROM created_at)"}
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')
        
        return Response({
            'total_guardians': total_guardians,
            'active_guardians': active_guardians,
            'inactive_guardians': inactive_guardians,
            'gender_stats': gender_stats,
            'occupation_stats': occupation_stats,
            'monthly_trend': monthly_trend
        })

class GuardianProfileViewSet(viewsets.ModelViewSet):
    queryset = GuardianProfile.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['guardian__status', 'preferred_contact_method']
    search_fields = ['guardian__first_name', 'guardian__last_name', 'guardian__email']

    def get_serializer_class(self):
        if self.action == 'create':
            return GuardianProfileCreateSerializer
        return GuardianProfileSerializer

    @action(detail=True, methods=['post'])
    def update_picture(self, request, pk=None):
        """Update guardian profile picture"""
        profile = self.get_object()
        picture = request.FILES.get('profile_picture')
        if picture:
            profile.profile_picture = picture
            profile.save()
            return Response({'message': 'Profile picture updated successfully'})
        return Response({'error': 'No picture provided'}, status=status.HTTP_400_BAD_REQUEST)

class GuardianStudentViewSet(viewsets.ModelViewSet):
    queryset = GuardianStudent.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['guardian__status', 'student__status', 'relationship', 'is_primary_guardian']
    search_fields = ['guardian__first_name', 'guardian__last_name', 'student__first_name', 'student__last_name']

    def get_serializer_class(self):
        if self.action == 'create':
            return GuardianStudentCreateSerializer
        return GuardianStudentSerializer

    @action(detail=False, methods=['get'])
    def by_guardian(self, request):
        """Get all students for a specific guardian"""
        guardian_id = request.query_params.get('guardian_id')
        if not guardian_id:
            return Response({'error': 'Guardian ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        relationships = GuardianStudent.objects.filter(guardian_id=guardian_id)
        serializer = self.get_serializer(relationships, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_student(self, request):
        """Get all guardians for a specific student"""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response({'error': 'Student ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        relationships = GuardianStudent.objects.filter(student_id=student_id)
        serializer = self.get_serializer(relationships, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def set_primary(self, request, pk=None):
        """Set guardian as primary for student"""
        relationship = self.get_object()
        student = relationship.student
        
        # Unset other primary guardians for this student
        GuardianStudent.objects.filter(student=student, is_primary_guardian=True).update(is_primary_guardian=False)
        
        # Set this guardian as primary
        relationship.is_primary_guardian = True
        relationship.save()
        
        return Response({'message': 'Primary guardian set successfully'})

class GuardianDocumentViewSet(viewsets.ModelViewSet):
    queryset = GuardianDocument.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['guardian__status', 'document_type', 'verified']
    search_fields = ['guardian__first_name', 'guardian__last_name', 'description']

    def get_serializer_class(self):
        if self.action == 'create':
            return GuardianDocumentCreateSerializer
        return GuardianDocumentSerializer

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify a guardian document"""
        document = self.get_object()
        document.verified = True
        document.verified_by = request.user
        document.verified_at = timezone.now()
        document.save()
        return Response({'message': 'Document verified successfully'})

    @action(detail=False, methods=['get'])
    def unverified(self, request):
        """Get all unverified documents"""
        documents = GuardianDocument.objects.filter(verified=False)
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Get documents expiring soon"""
        days = int(request.query_params.get('days', 30))
        expiry_date = timezone.now().date() + timedelta(days=days)
        
        documents = GuardianDocument.objects.filter(
            expiry_date__lte=expiry_date,
            expiry_date__gte=timezone.now().date()
        )
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_guardian(self, request):
        """Get all documents for a specific guardian"""
        guardian_id = request.query_params.get('guardian_id')
        if not guardian_id:
            return Response({'error': 'Guardian ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        documents = GuardianDocument.objects.filter(guardian_id=guardian_id)
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)

class GuardianSettingsViewSet(viewsets.ModelViewSet):
    queryset = GuardianSettings.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['email_notifications', 'sms_notifications', 'push_notifications', 'language', 'theme']

    def get_serializer_class(self):
        return GuardianSettingsSerializer

    @action(detail=False, methods=['get'])
    def by_guardian(self, request):
        """Get settings for a specific guardian"""
        guardian_id = request.query_params.get('guardian_id')
        if not guardian_id:
            return Response({'error': 'Guardian ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            settings = GuardianSettings.objects.get(guardian_id=guardian_id)
            serializer = self.get_serializer(settings)
            return Response(serializer.data)
        except GuardianSettings.DoesNotExist:
            return Response({'error': 'Settings not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def toggle_notifications(self, request, pk=None):
        """Toggle notification settings"""
        settings = self.get_object()
        notification_type = request.data.get('type')
        
        if notification_type == 'email':
            settings.email_notifications = not settings.email_notifications
        elif notification_type == 'sms':
            settings.sms_notifications = not settings.sms_notifications
        elif notification_type == 'push':
            settings.push_notifications = not settings.push_notifications
        else:
            return Response({'error': 'Invalid notification type'}, status=status.HTTP_400_BAD_REQUEST)
        
        settings.save()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)

class GuardianNotificationViewSet(viewsets.ModelViewSet):
    queryset = GuardianNotification.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['guardian__status', 'notification_type', 'priority', 'read']
    search_fields = ['title', 'message', 'guardian__first_name', 'guardian__last_name']
    ordering_fields = ['created_at', 'priority']
    ordering = ['-created_at']

    def get_serializer_class(self):
        return GuardianNotificationSerializer

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.read = True
        notification.read_at = timezone.now()
        notification.save()
        return Response({'message': 'Notification marked as read'})

    @action(detail=True, methods=['post'])
    def mark_as_unread(self, request, pk=None):
        """Mark notification as unread"""
        notification = self.get_object()
        notification.read = False
        notification.read_at = None
        notification.save()
        return Response({'message': 'Notification marked as unread'})

    @action(detail=False, methods=['post'])
    def mark_multiple_as_read(self, request):
        """Mark multiple notifications as read"""
        notification_ids = request.data.get('notification_ids', [])
        if not notification_ids:
            return Response({'error': 'No notification IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        GuardianNotification.objects.filter(id__in=notification_ids).update(
            read=True, read_at=timezone.now()
        )
        return Response({'message': f'{len(notification_ids)} notifications marked as read'})

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get all unread notifications"""
        notifications = GuardianNotification.objects.filter(read=False)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_guardian(self, request):
        """Get notifications for a specific guardian"""
        guardian_id = request.query_params.get('guardian_id')
        if not guardian_id:
            return Response({'error': 'Guardian ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        notifications = GuardianNotification.objects.filter(guardian_id=guardian_id)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent notifications"""
        days = int(request.query_params.get('days', 7))
        since_date = timezone.now() - timedelta(days=days)
        
        notifications = GuardianNotification.objects.filter(created_at__gte=since_date)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get notification statistics"""
        total_notifications = GuardianNotification.objects.count()
        unread_notifications = GuardianNotification.objects.filter(read=False).count()
        read_notifications = GuardianNotification.objects.filter(read=True).count()
        
        # Notifications by type
        type_stats = GuardianNotification.objects.values('notification_type').annotate(
            count=Count('id')
        )
        
        # Notifications by priority
        priority_stats = GuardianNotification.objects.values('priority').annotate(
            count=Count('id')
        )
        
        # Recent notifications trend
        recent_trend = GuardianNotification.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        ).extra(
            select={'date': "DATE(created_at)"}
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        return Response({
            'total_notifications': total_notifications,
            'unread_notifications': unread_notifications,
            'read_notifications': read_notifications,
            'type_stats': type_stats,
            'priority_stats': priority_stats,
            'recent_trend': recent_trend
        })
