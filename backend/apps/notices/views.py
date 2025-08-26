from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Count, Q, F
from django.contrib.auth import get_user_model

from .models import (
    Notice, NoticeCategory, NoticeAttachment, 
    NoticeRecipient, NoticeTemplate
)
from .serializers import (
    NoticeSerializer, NoticeDetailSerializer, NoticeCreateSerializer,
    NoticeUpdateSerializer, NoticeApprovalSerializer, NoticeStatsSerializer,
    NoticeCategorySerializer, NoticeAttachmentSerializer,
    NoticeRecipientSerializer, NoticeTemplateSerializer
)

User = get_user_model()


class NoticeCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for NoticeCategory model"""
    
    queryset = NoticeCategory.objects.all()
    serializer_class = NoticeCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active categories only"""
        categories = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)


class NoticeViewSet(viewsets.ModelViewSet):
    """ViewSet for Notice model"""
    
    queryset = Notice.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'status', 'priority', 'category', 'target_audience', 
        'author', 'requires_approval', 'pin_to_top'
    ]
    search_fields = ['title', 'content', 'summary']
    ordering_fields = [
        'title', 'publish_date', 'created_at', 'views_count', 
        'read_count', 'priority'
    ]
    ordering = ['-publish_date', '-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return NoticeCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return NoticeUpdateSerializer
        elif self.action == 'retrieve':
            return NoticeDetailSerializer
        return NoticeSerializer

    def get_queryset(self):
        """Filter queryset based on user permissions and target audience"""
        queryset = super().get_queryset()
        
        # If user is staff/admin, show all notices
        if self.request.user.is_staff:
            return queryset
        
        # For regular users, filter by target audience
        user = self.request.user
        user_type = self.get_user_type(user)
        
        if user_type == 'student':
            return queryset.filter(
                Q(target_audience='all') |
                Q(target_audience='students') |
                Q(target_audience='specific_class', target_classes__students=user) |
                Q(target_audience='specific_grade', target_grades__students=user) |
                Q(target_audience='custom', target_users=user)
            ).distinct()
        elif user_type == 'teacher':
            return queryset.filter(
                Q(target_audience='all') |
                Q(target_audience='teachers') |
                Q(target_audience='custom', target_users=user)
            ).distinct()
        elif user_type == 'parent':
            return queryset.filter(
                Q(target_audience='all') |
                Q(target_audience='parents') |
                Q(target_audience='custom', target_users=user)
            ).distinct()
        
        return queryset.none()

    def get_user_type(self, user):
        """Determine user type"""
        if hasattr(user, 'student'):
            return 'student'
        elif hasattr(user, 'teacher'):
            return 'teacher'
        elif hasattr(user, 'guardian'):
            return 'parent'
        return 'staff'

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a notice"""
        notice = self.get_object()
        serializer = NoticeApprovalSerializer(
            data=request.data, 
            context={'notice': notice}
        )
        
        if serializer.is_valid():
            approved = serializer.validated_data['approved']
            
            if approved:
                notice.status = 'published'
                notice.approved_by = request.user
                notice.approved_at = timezone.now()
                notice.save()
                return Response({'message': 'Notice approved successfully'})
            else:
                notice.status = 'draft'
                notice.approved_by = None
                notice.approved_at = None
                notice.save()
                return Response({'message': 'Notice rejected'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark notice as read for current user"""
        notice = self.get_object()
        recipient, created = NoticeRecipient.objects.get_or_create(
            notice=notice,
            user=request.user
        )
        recipient.mark_as_read()
        return Response({'message': 'Notice marked as read'})

    @action(detail=True, methods=['post'])
    def pin(self, request, pk=None):
        """Pin/unpin notice to top"""
        notice = self.get_object()
        notice.pin_to_top = not notice.pin_to_top
        notice.save()
        action = 'pinned' if notice.pin_to_top else 'unpinned'
        return Response({'message': f'Notice {action} successfully'})

    @action(detail=False, methods=['get'])
    def published(self, request):
        """Get published notices"""
        notices = self.get_queryset().filter(
            status='published',
            publish_date__lte=timezone.now()
        ).exclude(
            expiry_date__lt=timezone.now()
        )
        serializer = self.get_serializer(notices, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def urgent(self, request):
        """Get urgent notices"""
        notices = self.get_queryset().filter(
            priority='urgent',
            status='published',
            publish_date__lte=timezone.now()
        ).exclude(
            expiry_date__lt=timezone.now()
        )
        serializer = self.get_serializer(notices, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        """Get notices pending approval"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        notices = self.get_queryset().filter(
            status='draft',
            requires_approval=True
        )
        serializer = self.get_serializer(notices, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get notice statistics"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = self.get_queryset()
        
        stats = {
            'total_notices': queryset.count(),
            'published_notices': queryset.filter(status='published').count(),
            'draft_notices': queryset.filter(status='draft').count(),
            'expired_notices': queryset.filter(
                expiry_date__lt=timezone.now()
            ).count(),
            'urgent_notices': queryset.filter(priority='urgent').count(),
            'total_views': queryset.aggregate(
                total=Count('views_count')
            )['total'] or 0,
            'total_reads': queryset.aggregate(
                total=Count('read_count')
            )['total'] or 0,
            'read_rate': 0,
            'notices_by_category': {},
            'notices_by_priority': {},
            'recent_notices': []
        }
        
        # Calculate read rate
        if stats['total_views'] > 0:
            stats['read_rate'] = round(
                (stats['total_reads'] / stats['total_views']) * 100, 2
            )
        
        # Notices by category
        category_stats = queryset.values('category__name').annotate(
            count=Count('id')
        )
        stats['notices_by_category'] = {
            item['category__name'] or 'Uncategorized': item['count']
            for item in category_stats
        }
        
        # Notices by priority
        priority_stats = queryset.values('priority').annotate(
            count=Count('id')
        )
        stats['notices_by_priority'] = {
            item['priority']: item['count']
            for item in priority_stats
        }
        
        # Recent notices
        recent_notices = queryset.order_by('-created_at')[:5]
        stats['recent_notices'] = NoticeSerializer(
            recent_notices, many=True
        ).data
        
        serializer = NoticeStatsSerializer(stats)
        return Response(serializer.data)


class NoticeAttachmentViewSet(viewsets.ModelViewSet):
    """ViewSet for NoticeAttachment model"""
    
    queryset = NoticeAttachment.objects.all()
    serializer_class = NoticeAttachmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['notice', 'file_type']
    search_fields = ['filename', 'description']

    def get_queryset(self):
        """Filter attachments by notice access"""
        queryset = super().get_queryset()
        
        # If user is staff, show all attachments
        if self.request.user.is_staff:
            return queryset
        
        # For regular users, filter by notice access
        user = self.request.user
        user_type = self.get_user_type(user)
        
        if user_type == 'student':
            return queryset.filter(
                notice__target_audience__in=['all', 'students'] |
                Q(notice__target_audience='specific_class', 
                  notice__target_classes__students=user) |
                Q(notice__target_audience='specific_grade', 
                  notice__target_grades__students=user) |
                Q(notice__target_audience='custom', 
                  notice__target_users=user)
            ).distinct()
        
        return queryset.filter(
            notice__target_audience__in=['all', user_type + 's'] |
            Q(notice__target_audience='custom', 
              notice__target_users=user)
        ).distinct()

    def get_user_type(self, user):
        """Determine user type"""
        if hasattr(user, 'student'):
            return 'student'
        elif hasattr(user, 'teacher'):
            return 'teacher'
        elif hasattr(user, 'guardian'):
            return 'parent'
        return 'staff'


class NoticeRecipientViewSet(viewsets.ModelViewSet):
    """ViewSet for NoticeRecipient model"""
    
    queryset = NoticeRecipient.objects.all()
    serializer_class = NoticeRecipientSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['notice', 'user', 'is_read', 'email_sent', 'sms_sent', 'push_sent']
    search_fields = ['user__first_name', 'user__last_name', 'user__email']
    ordering_fields = ['created_at', 'read_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter recipients based on user permissions"""
        queryset = super().get_queryset()
        
        # If user is staff, show all recipients
        if self.request.user.is_staff:
            return queryset
        
        # For regular users, show only their own recipients
        return queryset.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark recipient as read"""
        recipient = self.get_object()
        recipient.mark_as_read()
        return Response({'message': 'Marked as read'})

    @action(detail=False, methods=['post'])
    def mark_multiple_as_read(self, request):
        """Mark multiple recipients as read"""
        recipient_ids = request.data.get('recipient_ids', [])
        if not recipient_ids:
            return Response(
                {'error': 'No recipient IDs provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        recipients = self.get_queryset().filter(id__in=recipient_ids)
        for recipient in recipients:
            recipient.mark_as_read()
        
        return Response({
            'message': f'{len(recipient_ids)} recipients marked as read'
        })


class NoticeTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for NoticeTemplate model"""
    
    queryset = NoticeTemplate.objects.all()
    serializer_class = NoticeTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active', 'created_by']
    search_fields = ['name', 'description', 'subject', 'content']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        """Filter templates based on user permissions"""
        queryset = super().get_queryset()
        
        # If user is staff, show all templates
        if self.request.user.is_staff:
            return queryset
        
        # For regular users, show only their own templates
        return queryset.filter(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active templates only"""
        templates = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(templates, many=True)
        return Response(serializer.data)
