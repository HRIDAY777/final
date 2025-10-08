from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.translation import gettext_lazy as _
from django.db.models import Q
from datetime import date

from .models import AcademicYear
from .serializers import (
    AcademicYearSerializer, AcademicYearListSerializer,
    AcademicYearDetailSerializer, AcademicYearCreateSerializer,
    AcademicYearUpdateSerializer, AcademicYearDashboardSerializer,
    AcademicYearSearchSerializer
)
from .permissions import AcademicYearPermission


class AcademicYearViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing academic years.

    Provides CRUD operations for academic years with proper permissions
    and filtering capabilities.
    """
    queryset = AcademicYear.objects.all()
    permission_classes = [
        IsAuthenticated, AcademicYearPermission
    ]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter,
        filters.OrderingFilter
    ]
    filterset_fields = [
        'is_current', 'is_active', 'start_date', 'end_date'
    ]
    search_fields = ['name']
    ordering_fields = [
        'name', 'start_date', 'end_date', 'created_at'
    ]
    ordering = ['-start_date']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return AcademicYearListSerializer
        elif self.action == 'retrieve':
            return AcademicYearDetailSerializer
        elif self.action == 'create':
            return AcademicYearCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AcademicYearUpdateSerializer
        elif self.action == 'dashboard':
            return AcademicYearDashboardSerializer
        elif self.action == 'search':
            return AcademicYearSearchSerializer
        return AcademicYearSerializer

    def get_queryset(self):
        """Return filtered queryset based on user permissions"""
        queryset = super().get_queryset()

        # Filter by active academic years for non-admin users
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)

        return queryset

    def perform_create(self, serializer):
        """Create academic year with proper validation"""
        serializer.save()

    def perform_update(self, serializer):
        """Update academic year with proper validation"""
        serializer.save()

    def perform_destroy(self, instance):
        """Prevent deletion of current academic year"""
        if instance.is_current:
            raise ValueError(_("Cannot delete the current academic year."))
        super().perform_destroy(instance)

    @action(
        detail=False, methods=['get'],
        permission_classes=[IsAuthenticated]
    )
    def current(self, request):
        """Get the current academic year"""
        try:
            current_year = AcademicYear.objects.get(
                is_current=True, is_active=True
            )
            serializer = self.get_serializer(current_year)
            return Response(serializer.data)
        except AcademicYear.DoesNotExist:
            return Response(
                {'detail': _('No current academic year found.')},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(
        detail=False, methods=['get'],
        permission_classes=[IsAuthenticated]
    )
    def active(self, request):
        """Get all active academic years"""
        active_years = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(active_years, many=True)
        return Response(serializer.data)

    @action(
        detail=False, methods=['get'],
        permission_classes=[IsAuthenticated]
    )
    def upcoming(self, request):
        """Get upcoming academic years (start date in the future)"""
        upcoming_years = self.get_queryset().filter(
            start_date__gt=date.today(),
            is_active=True
        )
        serializer = self.get_serializer(upcoming_years, many=True)
        return Response(serializer.data)

    @action(
        detail=False, methods=['get'],
        permission_classes=[IsAuthenticated]
    )
    def past(self, request):
        """Get past academic years (end date in the past)"""
        past_years = self.get_queryset().filter(
            end_date__lt=date.today(),
            is_active=True
        )
        serializer = self.get_serializer(past_years, many=True)
        return Response(serializer.data)

    @action(
        detail=True, methods=['post'],
        permission_classes=[IsAdminUser]
    )
    def set_current(self, request, pk=None):
        """Set an academic year as current"""
        academic_year = self.get_object()

        # Unset all other current academic years
        AcademicYear.objects.filter(
            is_current=True
        ).update(is_current=False)

        # Set this academic year as current
        academic_year.is_current = True
        academic_year.save()

        serializer = self.get_serializer(academic_year)
        return Response(serializer.data)

    @action(
        detail=True, methods=['post'],
        permission_classes=[IsAdminUser]
    )
    def activate(self, request, pk=None):
        """Activate an academic year"""
        academic_year = self.get_object()
        academic_year.is_active = True
        academic_year.save()

        serializer = self.get_serializer(academic_year)
        return Response(serializer.data)

    @action(
        detail=True, methods=['post'],
        permission_classes=[IsAdminUser]
    )
    def deactivate(self, request, pk=None):
        """Deactivate an academic year"""
        academic_year = self.get_object()

        # Prevent deactivating current academic year
        if academic_year.is_current:
            return Response(
                {
                    'detail': _('Cannot deactivate the current academic year.')
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        academic_year.is_active = False
        academic_year.save()

        serializer = self.get_serializer(academic_year)
        return Response(serializer.data)

    @action(
        detail=False, methods=['get'],
        permission_classes=[IsAuthenticated]
    )
    def dashboard(self, request):
        """Get academic year dashboard data"""
        # Get current academic year for dashboard
        try:
            current_year = AcademicYear.objects.get(
                is_current=True, is_active=True
            )
            serializer = self.get_serializer(current_year)
            return Response(serializer.data)
        except AcademicYear.DoesNotExist:
            return Response(
                {
                    'detail': _(
                        'No current academic year found for dashboard.'
                    )
                },
                status=status.HTTP_404_NOT_FOUND
            )

    @action(
        detail=False, methods=['get'],
        permission_classes=[IsAuthenticated]
    )
    def search(self, request):
        """Search academic years with advanced filtering"""
        query = request.query_params.get('q', '')
        is_current = request.query_params.get('is_current')
        is_active = request.query_params.get('is_active')

        queryset = self.get_queryset()

        # Apply search query
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(start_date__icontains=query) |
                Q(end_date__icontains=query)
            )

        # Apply filters
        if is_current is not None:
            queryset = queryset.filter(
                is_current=is_current.lower() == 'true'
            )

        if is_active is not None:
            queryset = queryset.filter(
                is_active=is_active.lower() == 'true'
            )

        # Apply pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(
        detail=False, methods=['get'],
        permission_classes=[IsAuthenticated]
    )
    def statistics(self, request):
        """Get academic year statistics"""
        total_years = AcademicYear.objects.count()
        active_years = AcademicYear.objects.filter(is_active=True).count()
        current_year = AcademicYear.objects.filter(is_current=True).count()
        upcoming_years = AcademicYear.objects.filter(
            start_date__gt=date.today(),
            is_active=True
        ).count()
        past_years = AcademicYear.objects.filter(
            end_date__lt=date.today(),
            is_active=True
        ).count()

        return Response({
            'total_academic_years': total_years,
            'active_academic_years': active_years,
            'current_academic_year': current_year,
            'upcoming_academic_years': upcoming_years,
            'past_academic_years': past_years
        })
