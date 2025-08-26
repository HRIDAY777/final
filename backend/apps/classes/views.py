from django.shortcuts import render
from django.db.models import F

# Create your views here.
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta

from .models import Class, ClassSchedule, ClassSubject
from .serializers import (
    ClassSerializer, ClassCreateSerializer, ClassUpdateSerializer,
    ClassDetailSerializer, ClassListSerializer, ClassDashboardSerializer,
    ClassScheduleSerializer, ClassSubjectSerializer
)


class ClassViewSet(viewsets.ModelViewSet):
    """Complete Class Management API"""
    
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'name', 'section', 'academic_year', 'capacity', 'is_active'
    ]
    search_fields = [
        'name', 'section', 'academic_year'
    ]
    ordering_fields = [
        'name', 'section', 'capacity', 'created_at'
    ]
    ordering = ['name', 'section']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ClassCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ClassUpdateSerializer
        elif self.action == 'retrieve':
            return ClassDetailSerializer
        elif self.action == 'list':
            return ClassListSerializer
        elif self.action == 'dashboard':
            return ClassDashboardSerializer
        return ClassSerializer
    
    def get_queryset(self):
        """Filter by tenant and add related data"""
        user = self.request.user
        
        # Superuser can see all classes
        if user.is_superuser:
            queryset = Class.objects.select_related('tenant').prefetch_related(
                'students', 'teachers', 'subjects', 'schedules'
            )
        # Regular users see only their tenant's classes
        elif hasattr(user, 'tenant') and user.tenant:
            queryset = Class.objects.filter(
                tenant=user.tenant
            ).select_related('tenant').prefetch_related(
                'students', 'teachers', 'subjects', 'schedules'
            )
        else:
            queryset = Class.objects.none()
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get class dashboard statistics"""
        queryset = self.get_queryset()
        
        # Basic counts
        total_classes = queryset.count()
        active_classes = queryset.filter(is_active=True).count()
        full_classes = queryset.filter(students__count__gte=F('capacity')).count()
        empty_classes = queryset.filter(students__count=0).count()
        
        # Class distribution by name
        class_distribution = queryset.values('name').annotate(
            count=Count('id')
        ).order_by('name')
        
        # Section distribution
        section_distribution = queryset.values('section').annotate(
            count=Count('id')
        ).exclude(section='').order_by('section')
        
        # Capacity utilization
        capacity_stats = {
            'under_50_percent': queryset.filter(
                students__count__lt=F('capacity') * 0.5
            ).count(),
            '50_75_percent': queryset.filter(
                students__count__gte=F('capacity') * 0.5,
                students__count__lt=F('capacity') * 0.75
            ).count(),
            '75_100_percent': queryset.filter(
                students__count__gte=F('capacity') * 0.75,
                students__count__lt=F('capacity')
            ).count(),
            'full': queryset.filter(students__count__gte=F('capacity')).count(),
        }
        
        # Recent activities
        recent_classes = queryset.order_by('-created_at')[:5]
        
        return Response({
            'total_classes': total_classes,
            'active_classes': active_classes,
            'full_classes': full_classes,
            'empty_classes': empty_classes,
            'class_distribution': class_distribution,
            'section_distribution': section_distribution,
            'capacity_utilization': capacity_stats,
            'recent_classes': ClassListSerializer(recent_classes, many=True).data
        })
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced class search"""
        query = request.query_params.get('q', '')
        academic_year_filter = request.query_params.get('academic_year', '')
        capacity_filter = request.query_params.get('capacity', '')
        
        queryset = self.get_queryset()
        
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(section__icontains=query) |
                Q(academic_year__icontains=query)
            )
        
        if academic_year_filter:
            queryset = queryset.filter(academic_year=academic_year_filter)
        
        if capacity_filter:
            if capacity_filter == 'small':
                queryset = queryset.filter(capacity__lte=30)
            elif capacity_filter == 'medium':
                queryset = queryset.filter(capacity__gt=30, capacity__lte=50)
            elif capacity_filter == 'large':
                queryset = queryset.filter(capacity__gt=50)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export classes data"""
        queryset = self.get_queryset()
        format_type = request.query_params.get('format', 'json')
        
        if format_type == 'csv':
            # CSV export logic
            import csv
            from django.http import HttpResponse
            
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="classes.csv"'
            
            writer = csv.writer(response)
            writer.writerow([
                'Class Name', 'Section', 'Academic Year', 'Capacity',
                'Current Students', 'Utilization %', 'Status'
            ])
            
            for class_obj in queryset:
                current_students = class_obj.students.count()
                utilization = (current_students / class_obj.capacity * 100) if class_obj.capacity > 0 else 0
                
                writer.writerow([
                    class_obj.name,
                    class_obj.section,
                    class_obj.academic_year,
                    class_obj.capacity,
                    current_students,
                    f"{utilization:.1f}%",
                    'Active' if class_obj.is_active else 'Inactive'
                ])
            
            return response
        
        # Default JSON export
        serializer = ClassListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a class"""
        class_obj = self.get_object()
        class_obj.is_active = True
        class_obj.save()
        
        serializer = self.get_serializer(class_obj)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a class"""
        class_obj = self.get_object()
        class_obj.is_active = False
        class_obj.save()
        
        serializer = self.get_serializer(class_obj)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get students in a class"""
        class_obj = self.get_object()
        students = class_obj.students.all()
        
        from apps.students.serializers import StudentListSerializer
        serializer = StudentListSerializer(students, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def teachers(self, request, pk=None):
        """Get teachers assigned to a class"""
        class_obj = self.get_object()
        teachers = class_obj.teachers.all()
        
        from apps.teachers.serializers import TeacherListSerializer
        serializer = TeacherListSerializer(teachers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def schedule(self, request, pk=None):
        """Get class schedule"""
        class_obj = self.get_object()
        schedules = class_obj.schedules.all()
        
        serializer = ClassScheduleSerializer(schedules, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def subjects(self, request, pk=None):
        """Get subjects taught in a class"""
        class_obj = self.get_object()
        subjects = class_obj.subjects.all()
        
        serializer = ClassSubjectSerializer(subjects, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get detailed class statistics"""
        queryset = self.get_queryset()
        
        # Average class size
        avg_class_size = queryset.aggregate(
            avg_students=Avg('students__count')
        )
        
        # Class size distribution
        size_distribution = {
            'small_1_20': queryset.filter(students__count__lte=20).count(),
            'medium_21_40': queryset.filter(
                students__count__gt=20, students__count__lte=40
            ).count(),
            'large_41_60': queryset.filter(
                students__count__gt=40, students__count__lte=60
            ).count(),
            'very_large_60+': queryset.filter(students__count__gt=60).count(),
        }
        
        # Academic year distribution
        year_distribution = queryset.values('academic_year').annotate(
            count=Count('id')
        ).order_by('-academic_year')
        
        # Teacher distribution per class
        teacher_distribution = queryset.values('teachers__count').annotate(
            count=Count('id')
        ).order_by('teachers__count')
        
        return Response({
            'average_class_size': avg_class_size,
            'size_distribution': size_distribution,
            'year_distribution': year_distribution,
            'teacher_distribution': teacher_distribution
        })


class ClassScheduleViewSet(viewsets.ModelViewSet):
    """Class Schedule Management"""
    
    queryset = ClassSchedule.objects.all()
    serializer_class = ClassScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return ClassSchedule.objects.select_related('class_obj', 'subject', 'teacher')
        elif hasattr(user, 'tenant') and user.tenant:
            return ClassSchedule.objects.filter(
                class_obj__tenant=user.tenant
            ).select_related('class_obj', 'subject', 'teacher')
        return ClassSchedule.objects.none()


class ClassSubjectViewSet(viewsets.ModelViewSet):
    """Class Subject Management"""
    
    queryset = ClassSubject.objects.all()
    serializer_class = ClassSubjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return ClassSubject.objects.select_related('class_obj', 'subject')
        elif hasattr(user, 'tenant') and user.tenant:
            return ClassSubject.objects.filter(
                class_obj__tenant=user.tenant
            ).select_related('class_obj', 'subject')
        return ClassSubject.objects.none()


# ClassTeacherViewSet removed - ClassTeacher model not found
