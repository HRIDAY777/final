from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Event
from .serializers import EventSerializer, EventDetailSerializer


class EventViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing events
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = [
        'event_type', 'status', 'is_public', 'requires_registration'
    ]
    search_fields = ['title', 'description', 'organizer', 'venue']
    ordering_fields = ['start_date', 'end_date', 'created_at', 'title']
    ordering = ['-start_date', '-start_time']

    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return EventDetailSerializer
        return EventSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
            
        return queryset

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming events"""
        today = timezone.now().date()
        upcoming_events = self.get_queryset().filter(
            start_date__gte=today,
            status__in=['upcoming', 'ongoing']
        ).order_by('start_date', 'start_time')[:10]
        
        serializer = self.get_serializer(upcoming_events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def ongoing(self, request):
        """Get currently ongoing events"""
        today = timezone.now().date()
        
        ongoing_events = self.get_queryset().filter(
            start_date__lte=today,
            end_date__gte=today,
            status__in=['upcoming', 'ongoing']
        ).order_by('start_date', 'start_time')
        
        serializer = self.get_serializer(ongoing_events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def calendar(self, request):
        """Get events for calendar view"""
        year = int(request.query_params.get('year', timezone.now().year))
        month = int(request.query_params.get('month', timezone.now().month))
        
        start_date = datetime(year, month, 1).date()
        if month == 12:
            end_date = datetime(year + 1, 1, 1).date() - timedelta(days=1)
        else:
            end_date = datetime(year, month + 1, 1).date() - timedelta(days=1)
        
        events = self.get_queryset().filter(
            start_date__gte=start_date,
            start_date__lte=end_date
        )
        
        calendar_data = []
        for event in events:
            calendar_data.append({
                'id': event.id,
                'title': event.title,
                'start': f"{event.start_date}T{event.start_time}",
                'end': f"{event.end_date}T{event.end_time}",
                'event_type': event.event_type,
                'status': event.status,
                'venue': event.venue,
                'color': self._get_event_color(event.event_type)
            })
        
        return Response(calendar_data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get event statistics"""
        total_events = Event.objects.count()
        upcoming_events = Event.objects.filter(
            start_date__gte=timezone.now().date(),
            status='upcoming'
        ).count()
        ongoing_events = Event.objects.filter(
            start_date__lte=timezone.now().date(),
            end_date__gte=timezone.now().date(),
            status__in=['upcoming', 'ongoing']
        ).count()
        completed_events = Event.objects.filter(status='completed').count()
        
        # Events by type
        events_by_type = {}
        for event_type, _ in Event.EVENT_TYPES:
            count = Event.objects.filter(event_type=event_type).count()
            events_by_type[event_type] = count
        
        # Events by status
        events_by_status = {}
        for status_choice, _ in Event.STATUS_CHOICES:
            count = Event.objects.filter(status=status_choice).count()
            events_by_status[status_choice] = count
        
        return Response({
            'total_events': total_events,
            'upcoming_events': upcoming_events,
            'ongoing_events': ongoing_events,
            'completed_events': completed_events,
            'events_by_type': events_by_type,
            'events_by_status': events_by_status
        })

    def _get_event_color(self, event_type):
        """Get color for event type in calendar"""
        colors = {
            'academic': '#3B82F6',  # Blue
            'sports': '#10B981',    # Green
            'cultural': '#F59E0B',  # Yellow
            'social': '#EF4444',    # Red
            'other': '#6B7280',     # Gray
        }
        return colors.get(event_type, '#6B7280')
