from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from datetime import datetime, timedelta

from .models import (
    Student, StudentProfile, StudentAcademicRecord, StudentGuardian,
    StudentDocument, StudentAchievement, StudentDiscipline, StudentSettings
)
from .serializers import (
    StudentSerializer, StudentCreateSerializer, StudentUpdateSerializer,
    StudentDetailSerializer, StudentListSerializer, StudentDashboardSerializer,
    StudentSearchSerializer, StudentProfileSerializer, StudentGuardianSerializer,
    StudentDocumentSerializer, StudentAchievementSerializer, StudentDisciplineSerializer,
    StudentAcademicRecordSerializer, StudentSettingsSerializer
)


class StudentViewSet(viewsets.ModelViewSet):
    """Complete Student Management API"""
    
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'status', 'gender', 'current_class', 'academic_year', 'is_active',
        'admission_date', 'blood_group', 'city', 'state', 'country'
    ]
    search_fields = [
        'first_name', 'last_name', 'middle_name', 'student_id', 
        'admission_number', 'email', 'phone'
    ]
    ordering_fields = [
        'first_name', 'last_name', 'admission_date', 'created_at',
        'current_class', 'status'
    ]
    ordering = ['first_name', 'last_name']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return StudentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return StudentUpdateSerializer
        elif self.action == 'retrieve':
            return StudentDetailSerializer
        elif self.action == 'list':
            return StudentListSerializer
        elif self.action == 'dashboard':
            return StudentDashboardSerializer
        elif self.action == 'search':
            return StudentSearchSerializer
        return StudentSerializer
    
    def get_queryset(self):
        """Filter by tenant and add related data"""
        user = self.request.user
        
        # Superuser can see all students
        if user.is_superuser:
            queryset = Student.objects.select_related(
                'user', 'current_class', 'academic_year', 'tenant'
            ).prefetch_related(
                'profile', 'guardians', 'documents', 'achievements',
                'disciplines', 'academic_records'
            )
        # Regular users see only their tenant's students
        elif hasattr(user, 'tenant') and user.tenant:
            queryset = Student.objects.filter(
                tenant=user.tenant
            ).select_related(
                'user', 'current_class', 'academic_year', 'tenant'
            ).prefetch_related(
                'profile', 'guardians', 'documents', 'achievements',
                'disciplines', 'academic_records'
            )
        else:
            queryset = Student.objects.none()
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get student dashboard statistics"""
        queryset = self.get_queryset()
        
        # Basic counts
        total_students = queryset.count()
        active_students = queryset.filter(status='active').count()
        new_admissions = queryset.filter(
            admission_date__gte=timezone.now().date() - timedelta(days=30)
        ).count()
        
        # Gender distribution
        gender_stats = queryset.values('gender').annotate(
            count=Count('id')
        )
        
        # Status distribution
        status_stats = queryset.values('status').annotate(
            count=Count('id')
        )
        
        # Class distribution
        class_stats = queryset.values('current_class__name').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Recent activities
        recent_students = queryset.order_by('-created_at')[:5]
        
        return Response({
            'total_students': total_students,
            'active_students': active_students,
            'new_admissions': new_admissions,
            'gender_distribution': gender_stats,
            'status_distribution': status_stats,
            'class_distribution': class_stats,
            'recent_students': StudentListSerializer(recent_students, many=True).data
        })
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced student search"""
        query = request.query_params.get('q', '')
        class_filter = request.query_params.get('class', '')
        status_filter = request.query_params.get('status', '')
        
        queryset = self.get_queryset()
        
        if query:
            queryset = queryset.filter(
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(student_id__icontains=query) |
                Q(admission_number__icontains=query) |
                Q(email__icontains=query)
            )
        
        if class_filter:
            queryset = queryset.filter(current_class__name__icontains=class_filter)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export students data"""
        queryset = self.get_queryset()
        format_type = request.query_params.get('format', 'json')
        
        if format_type == 'csv':
            # CSV export logic
            import csv
            from django.http import HttpResponse
            
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="students.csv"'
            
            writer = csv.writer(response)
            writer.writerow([
                'Student ID', 'Admission Number', 'First Name', 'Last Name',
                'Email', 'Phone', 'Class', 'Status', 'Admission Date'
            ])
            
            for student in queryset:
                writer.writerow([
                    student.student_id,
                    student.admission_number,
                    student.first_name,
                    student.last_name,
                    student.email,
                    student.phone,
                    student.current_class.name if student.current_class else '',
                    student.status,
                    student.admission_date
                ])
            
            return response
        
        # Default JSON export
        serializer = StudentListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a student"""
        student = self.get_object()
        student.status = 'active'
        student.is_active = True
        student.save()
        
        serializer = self.get_serializer(student)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a student"""
        student = self.get_object()
        student.status = 'inactive'
        student.is_active = False
        student.save()
        
        serializer = self.get_serializer(student)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def graduate(self, request, pk=None):
        """Mark student as graduated"""
        student = self.get_object()
        student.status = 'graduated'
        student.save()
        
        serializer = self.get_serializer(student)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def transfer(self, request, pk=None):
        """Mark student as transferred"""
        student = self.get_object()
        student.status = 'transferred'
        student.save()
        
        serializer = self.get_serializer(student)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get detailed student statistics"""
        queryset = self.get_queryset()
        
        # Age distribution
        age_stats = {
            'under_10': queryset.filter(date_of_birth__gte=timezone.now().date() - timedelta(days=365*10)).count(),
            '10_15': queryset.filter(
                date_of_birth__lt=timezone.now().date() - timedelta(days=365*10),
                date_of_birth__gte=timezone.now().date() - timedelta(days=365*15)
            ).count(),
            '15_18': queryset.filter(
                date_of_birth__lt=timezone.now().date() - timedelta(days=365*15),
                date_of_birth__gte=timezone.now().date() - timedelta(days=365*18)
            ).count(),
            'over_18': queryset.filter(date_of_birth__lt=timezone.now().date() - timedelta(days=365*18)).count(),
        }
        
        # Blood group distribution
        blood_group_stats = queryset.values('blood_group').annotate(
            count=Count('id')
        ).exclude(blood_group='')
        
        # City distribution
        city_stats = queryset.values('city').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Monthly admission trends
        monthly_admissions = []
        for i in range(12):
            month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
            month_end = month_start.replace(day=28) + timedelta(days=4)
            month_end = month_end.replace(day=1) - timedelta(days=1)
            
            count = queryset.filter(
                admission_date__gte=month_start,
                admission_date__lte=month_end
            ).count()
            
            monthly_admissions.append({
                'month': month_start.strftime('%B %Y'),
                'count': count
            })
        
        return Response({
            'age_distribution': age_stats,
            'blood_group_distribution': blood_group_stats,
            'city_distribution': city_stats,
            'monthly_admissions': monthly_admissions
        })


class StudentProfileViewSet(viewsets.ModelViewSet):
    """Student Profile Management"""
    
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return StudentProfile.objects.select_related('student')
        elif hasattr(user, 'tenant') and user.tenant:
            return StudentProfile.objects.filter(
                student__tenant=user.tenant
            ).select_related('student')
        return StudentProfile.objects.none()


class StudentGuardianViewSet(viewsets.ModelViewSet):
    """Student Guardian Management"""
    
    queryset = StudentGuardian.objects.all()
    serializer_class = StudentGuardianSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return StudentGuardian.objects.select_related('student')
        elif hasattr(user, 'tenant') and user.tenant:
            return StudentGuardian.objects.filter(
                student__tenant=user.tenant
            ).select_related('student')
        return StudentGuardian.objects.none()


class StudentDocumentViewSet(viewsets.ModelViewSet):
    """Student Document Management"""
    
    queryset = StudentDocument.objects.all()
    serializer_class = StudentDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return StudentDocument.objects.select_related('student')
        elif hasattr(user, 'tenant') and user.tenant:
            return StudentDocument.objects.filter(
                student__tenant=user.tenant
            ).select_related('student')
        return StudentDocument.objects.none()


class StudentAchievementViewSet(viewsets.ModelViewSet):
    """Student Achievement Management"""
    
    queryset = StudentAchievement.objects.all()
    serializer_class = StudentAchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return StudentAchievement.objects.select_related('student')
        elif hasattr(user, 'tenant') and user.tenant:
            return StudentAchievement.objects.filter(
                student__tenant=user.tenant
            ).select_related('student')
        return StudentAchievement.objects.none()


class StudentDisciplineViewSet(viewsets.ModelViewSet):
    """Student Discipline Management"""
    
    queryset = StudentDiscipline.objects.all()
    serializer_class = StudentDisciplineSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return StudentDiscipline.objects.select_related('student')
        elif hasattr(user, 'tenant') and user.tenant:
            return StudentDiscipline.objects.filter(
                student__tenant=user.tenant
            ).select_related('student')
        return StudentDiscipline.objects.none()


class StudentAcademicRecordViewSet(viewsets.ModelViewSet):
    """Student Academic Record Management"""
    
    queryset = StudentAcademicRecord.objects.all()
    serializer_class = StudentAcademicRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return StudentAcademicRecord.objects.select_related('student')
        elif hasattr(user, 'tenant') and user.tenant:
            return StudentAcademicRecord.objects.filter(
                student__tenant=user.tenant
            ).select_related('student')
        return StudentAcademicRecord.objects.none()


class StudentSettingsViewSet(viewsets.ModelViewSet):
    """Student Settings Management"""
    
    queryset = StudentSettings.objects.all()
    serializer_class = StudentSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return StudentSettings.objects.select_related('student')
        elif hasattr(user, 'tenant') and user.tenant:
            return StudentSettings.objects.filter(
                student__tenant=user.tenant
            ).select_related('student')
        return StudentSettings.objects.none()
