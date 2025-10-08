from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count

from .models import Subject, AcademicYear
from .serializers import (
    SubjectSerializer, SubjectCreateSerializer, SubjectUpdateSerializer,
    AcademicYearSerializer, AcademicYearCreateSerializer
)


class SubjectViewSet(viewsets.ModelViewSet):
    """Complete Subject Management API"""
    
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = ['code', 'is_active', 'credits', 'semester']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'credits', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SubjectCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return SubjectUpdateSerializer
        return SubjectSerializer
    
    def get_queryset(self):
        """Filter by tenant"""
        user = self.request.user
        
        if user.is_superuser:
            queryset = Subject.objects.all()
        elif hasattr(user, 'tenant') and user.tenant:
            queryset = Subject.objects.filter(tenant=user.tenant)
        else:
            queryset = Subject.objects.none()
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get subject dashboard statistics"""
        queryset = self.get_queryset()
        
        total_subjects = queryset.count()
        active_subjects = queryset.filter(is_active=True).count()
        
        # Subject distribution by semester
        semester_distribution = queryset.values('semester').annotate(
            count=Count('id')
        ).order_by('semester')
        
        # Subject distribution by credits
        credit_distribution = queryset.values('credits').annotate(
            count=Count('id')
        ).order_by('credits')
        
        return Response({
            'total_subjects': total_subjects,
            'active_subjects': active_subjects,
            'semester_distribution': semester_distribution,
            'credit_distribution': credit_distribution,
        })
    
    @action(detail=True, methods=['get'])
    def teachers(self, request, pk=None):
        """Get teachers assigned to this subject"""
        subject = self.get_object()
        teachers = subject.teachers.all()
        from apps.teachers.serializers import TeacherListSerializer
        serializer = TeacherListSerializer(teachers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def classes(self, request, pk=None):
        """Get classes that have this subject"""
        subject = self.get_object()
        classes = subject.classes.all()
        from apps.classes.serializers import ClassSerializer
        serializer = ClassSerializer(classes, many=True)
        return Response(serializer.data)


class AcademicYearViewSet(viewsets.ModelViewSet):
    """Complete Academic Year Management API"""
    
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = ['is_active', 'is_current']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'start_date', 'end_date', 'created_at']
    ordering = ['-start_date']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AcademicYearCreateSerializer
        return AcademicYearSerializer
    
    def get_queryset(self):
        """Filter by tenant"""
        user = self.request.user
        
        if user.is_superuser:
            queryset = AcademicYear.objects.all()
        elif hasattr(user, 'tenant') and user.tenant:
            queryset = AcademicYear.objects.filter(tenant=user.tenant)
        else:
            queryset = AcademicYear.objects.none()
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current academic year"""
        current_year = self.get_queryset().filter(is_current=True).first()
        if current_year:
            serializer = self.get_serializer(current_year)
            return Response(serializer.data)
        return Response(
            {'detail': 'No current academic year found'}, status=404
        )
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get academic year dashboard statistics"""
        queryset = self.get_queryset()
        
        total_years = queryset.count()
        active_years = queryset.filter(is_active=True).count()
        current_year = queryset.filter(is_current=True).first()
        
        return Response({
            'total_years': total_years,
            'active_years': active_years,
            'current_year': (
                AcademicYearSerializer(current_year).data if current_year 
                else None
            ),
        })
