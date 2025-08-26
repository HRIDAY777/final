from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import permissions
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, Sum, Max
from django.utils import timezone
from datetime import date, timedelta

from .models import (
    Teacher, TeacherProfile, TeacherQualification, TeacherExperience,
    TeacherSubject, TeacherClass, TeacherAttendance, TeacherSalary,
    TeacherLeave, TeacherPerformance, TeacherDocument, TeacherSettings
)
from .serializers import (
    TeacherSerializer, TeacherListSerializer, TeacherDetailSerializer, TeacherCreateSerializer,
    TeacherUpdateSerializer, TeacherDashboardSerializer, TeacherSearchSerializer,
    TeacherProfileSerializer, TeacherProfileCreateSerializer,
    TeacherQualificationSerializer, TeacherQualificationCreateSerializer,
    TeacherExperienceSerializer, TeacherExperienceCreateSerializer,
    TeacherSubjectSerializer, TeacherSubjectCreateSerializer,
    TeacherClassSerializer, TeacherClassCreateSerializer,
    TeacherAttendanceSerializer, TeacherAttendanceCreateSerializer,
    TeacherSalarySerializer, TeacherSalaryCreateSerializer,
    TeacherLeaveSerializer, TeacherLeaveCreateSerializer,
    TeacherPerformanceSerializer, TeacherPerformanceCreateSerializer,
    TeacherDocumentSerializer, TeacherDocumentCreateSerializer,
    TeacherSettingsSerializer
)


class TeacherViewSet(viewsets.ModelViewSet):
    """Complete Teacher Management API"""
    
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'department', 'is_head_teacher', 'is_active', 'joining_date',
        'experience_years', 'specialization'
    ]
    search_fields = [
        'user__first_name', 'user__last_name', 'employee_id',
        'department', 'specialization', 'user__email'
    ]
    ordering_fields = [
        'user__first_name', 'user__last_name', 'joining_date',
        'experience_years', 'created_at'
    ]
    ordering = ['user__first_name', 'user__last_name']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TeacherUpdateSerializer
        elif self.action == 'retrieve':
            return TeacherDetailSerializer
        elif self.action == 'list':
            return TeacherListSerializer
        elif self.action == 'dashboard':
            return TeacherDashboardSerializer
        return TeacherSerializer
    
    def get_queryset(self):
        """Filter by tenant and add related data"""
        user = self.request.user
        
        # Superuser can see all teachers
        if user.is_superuser:
            queryset = Teacher.objects.select_related(
                'user', 'tenant'
            ).prefetch_related(
                'subjects', 'qualifications', 'experiences'
            )
        # Regular users see only their tenant's teachers
        elif hasattr(user, 'tenant') and user.tenant:
            queryset = Teacher.objects.filter(
                tenant=user.tenant
            ).select_related(
                'user', 'tenant'
            ).prefetch_related(
                'subjects', 'qualifications', 'experiences'
            )
        else:
            queryset = Teacher.objects.none()
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get teacher dashboard statistics"""
        queryset = self.get_queryset()
        
        # Basic counts
        total_teachers = queryset.count()
        active_teachers = queryset.filter(is_active=True).count()
        head_teachers = queryset.filter(is_head_teacher=True).count()
        new_teachers = queryset.filter(
            joining_date__gte=timezone.now().date() - timedelta(days=30)
        ).count()
        
        # Department distribution
        department_stats = queryset.values('department').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Experience distribution
        experience_stats = {
            '0-2_years': queryset.filter(experience_years__lte=2).count(),
            '3-5_years': queryset.filter(experience_years__gte=3, experience_years__lte=5).count(),
            '6-10_years': queryset.filter(experience_years__gte=6, experience_years__lte=10).count(),
            '10+_years': queryset.filter(experience_years__gt=10).count(),
        }
        
        # Recent activities
        recent_teachers = queryset.order_by('-created_at')[:5]
        
        return Response({
            'total_teachers': total_teachers,
            'active_teachers': active_teachers,
            'head_teachers': head_teachers,
            'new_teachers': new_teachers,
            'department_distribution': department_stats,
            'experience_distribution': experience_stats,
            'recent_teachers': TeacherListSerializer(recent_teachers, many=True).data
        })
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced teacher search"""
        query = request.query_params.get('q', '')
        department_filter = request.query_params.get('department', '')
        experience_filter = request.query_params.get('experience', '')
        
        queryset = self.get_queryset()
        
        if query:
            queryset = queryset.filter(
                Q(user__first_name__icontains=query) |
                Q(user__last_name__icontains=query) |
                Q(employee_id__icontains=query) |
                Q(department__icontains=query) |
                Q(specialization__icontains=query)
            )
        
        if department_filter:
            queryset = queryset.filter(department__icontains=department_filter)
        
        if experience_filter:
            if experience_filter == 'junior':
                queryset = queryset.filter(experience_years__lte=5)
            elif experience_filter == 'senior':
                queryset = queryset.filter(experience_years__gt=5)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export teachers data"""
        queryset = self.get_queryset()
        format_type = request.query_params.get('format', 'json')
        
        if format_type == 'csv':
            # CSV export logic
            import csv
            from django.http import HttpResponse
            
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="teachers.csv"'
            
            writer = csv.writer(response)
            writer.writerow([
                'Employee ID', 'First Name', 'Last Name', 'Email', 'Department',
                'Specialization', 'Experience Years', 'Joining Date', 'Status'
            ])
            
            for teacher in queryset:
                writer.writerow([
                    teacher.employee_id,
                    teacher.user.first_name,
                    teacher.user.last_name,
                    teacher.user.email,
                    teacher.department,
                    teacher.specialization,
                    teacher.experience_years,
                    teacher.joining_date,
                    'Active' if teacher.is_active else 'Inactive'
                ])
            
            return response
        
        # Default JSON export
        serializer = TeacherListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a teacher"""
        teacher = self.get_object()
        teacher.is_active = True
        teacher.save()
        
        serializer = self.get_serializer(teacher)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a teacher"""
        teacher = self.get_object()
        teacher.is_active = False
        teacher.save()
        
        serializer = self.get_serializer(teacher)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def promote_to_head(self, request, pk=None):
        """Promote teacher to head teacher"""
        teacher = self.get_object()
        teacher.is_head_teacher = True
        teacher.save()
        
        serializer = self.get_serializer(teacher)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def remove_head_role(self, request, pk=None):
        """Remove head teacher role"""
        teacher = self.get_object()
        teacher.is_head_teacher = False
        teacher.save()
        
        serializer = self.get_serializer(teacher)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get detailed teacher statistics"""
        queryset = self.get_queryset()
        
        # Gender distribution
        gender_stats = queryset.values('user__gender').annotate(
            count=Count('id')
        )
        
        # Qualification distribution
        qualification_stats = queryset.values('qualifications__degree').annotate(
            count=Count('id')
        ).exclude(qualifications__degree='')
        
        # Monthly joining trends
        monthly_joins = []
        for i in range(12):
            month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
            month_end = month_start.replace(day=28) + timedelta(days=4)
            month_end = month_end.replace(day=1) - timedelta(days=1)
            
            count = queryset.filter(
                joining_date__gte=month_start,
                joining_date__lte=month_end
            ).count()
            
            monthly_joins.append({
                'month': month_start.strftime('%B %Y'),
                'count': count
            })
        
        # Average experience by department
        dept_experience = queryset.values('department').annotate(
            avg_experience=Avg('experience_years'),
            teacher_count=Count('id')
        ).order_by('-avg_experience')
        
        return Response({
            'gender_distribution': gender_stats,
            'qualification_distribution': qualification_stats,
            'monthly_joining_trends': monthly_joins,
            'department_experience': dept_experience
        })


class TeacherProfileViewSet(viewsets.ModelViewSet):
    """Teacher Profile ViewSet"""
    
    queryset = TeacherProfile.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['marital_status', 'teaching_experience_years']
    search_fields = ['teacher__first_name', 'teacher__last_name', 'emergency_contact_name']

    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherProfileCreateSerializer
        return TeacherProfileSerializer


class TeacherQualificationViewSet(viewsets.ModelViewSet):
    """Teacher Qualification ViewSet"""
    
    queryset = TeacherQualification.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['completion_year', 'is_verified']
    search_fields = ['teacher__first_name', 'teacher__last_name', 'degree', 'institution']

    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherQualificationCreateSerializer
        return TeacherQualificationSerializer

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify a qualification"""
        qualification = self.get_object()
        qualification.is_verified = True
        qualification.verified_by = request.user
        qualification.verified_date = timezone.now()
        qualification.save()
        return Response({'message': 'Qualification verified successfully'})


class TeacherExperienceViewSet(viewsets.ModelViewSet):
    """Teacher Experience ViewSet"""
    
    queryset = TeacherExperience.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_current']
    search_fields = ['teacher__first_name', 'teacher__last_name', 'organization', 'position']

    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherExperienceCreateSerializer
        return TeacherExperienceSerializer


class TeacherSubjectViewSet(viewsets.ModelViewSet):
    """Teacher Subject ViewSet"""
    
    queryset = TeacherSubject.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_primary', 'expertise_level']
    search_fields = ['teacher__first_name', 'teacher__last_name', 'subject__name']

    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherSubjectCreateSerializer
        return TeacherSubjectSerializer

    @action(detail=False, methods=['get'])
    def by_subject(self, request):
        """Get teachers by subject"""
        subject_id = request.query_params.get('subject_id')
        if subject_id:
            teacher_subjects = TeacherSubject.objects.filter(subject_id=subject_id)
            serializer = self.get_serializer(teacher_subjects, many=True)
            return Response(serializer.data)
        return Response([])


class TeacherClassViewSet(viewsets.ModelViewSet):
    """Teacher Class ViewSet"""
    
    queryset = TeacherClass.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['role', 'is_active', 'academic_year']
    search_fields = ['teacher__first_name', 'teacher__last_name', 'class_obj__name']

    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherClassCreateSerializer
        return TeacherClassSerializer

    @action(detail=False, methods=['get'])
    def by_class(self, request):
        """Get teachers by class"""
        class_id = request.query_params.get('class_id')
        if class_id:
            teacher_classes = TeacherClass.objects.filter(class_obj_id=class_id, is_active=True)
            serializer = self.get_serializer(teacher_classes, many=True)
            return Response(serializer.data)
        return Response([])


class TeacherAttendanceViewSet(viewsets.ModelViewSet):
    """Teacher Attendance ViewSet"""
    
    queryset = TeacherAttendance.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'date']
    search_fields = ['teacher__first_name', 'teacher__last_name', 'remarks']

    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherAttendanceCreateSerializer
        return TeacherAttendanceSerializer

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's attendance"""
        today = timezone.now().date()
        attendance = TeacherAttendance.objects.filter(date=today)
        serializer = self.get_serializer(attendance, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_date_range(self, request):
        """Get attendance by date range"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        teacher_id = request.query_params.get('teacher_id')
        
        if start_date and end_date:
            attendance = TeacherAttendance.objects.filter(date__range=[start_date, end_date])
            if teacher_id:
                attendance = attendance.filter(teacher_id=teacher_id)
            serializer = self.get_serializer(attendance, many=True)
            return Response(serializer.data)
        return Response([])


class TeacherSalaryViewSet(viewsets.ModelViewSet):
    """Teacher Salary ViewSet"""
    
    queryset = TeacherSalary.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['payment_status', 'month', 'year']
    search_fields = ['teacher__first_name', 'teacher__last_name', 'payment_method']

    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherSalaryCreateSerializer
        return TeacherSalarySerializer

    @action(detail=False, methods=['get'])
    def by_month_year(self, request):
        """Get salaries by month and year"""
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        
        if month and year:
            salaries = TeacherSalary.objects.filter(month=month, year=year)
            serializer = self.get_serializer(salaries, many=True)
            return Response(serializer.data)
        return Response([])

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark salary as paid"""
        salary = self.get_object()
        salary.payment_status = 'paid'
        salary.payment_date = timezone.now().date()
        salary.payment_method = request.data.get('payment_method', '')
        salary.save()
        return Response({'message': 'Salary marked as paid successfully'})


class TeacherLeaveViewSet(viewsets.ModelViewSet):
    """Teacher Leave ViewSet"""
    
    queryset = TeacherLeave.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['leave_type', 'status', 'start_date', 'end_date']
    search_fields = ['teacher__first_name', 'teacher__last_name', 'reason']

    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherLeaveCreateSerializer
        return TeacherLeaveSerializer

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve leave request"""
        leave = self.get_object()
        leave.status = 'approved'
        leave.approved_by = request.user
        leave.approved_date = timezone.now()
        leave.remarks = request.data.get('remarks', '')
        leave.save()
        return Response({'message': 'Leave request approved successfully'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject leave request"""
        leave = self.get_object()
        leave.status = 'rejected'
        leave.approved_by = request.user
        leave.approved_date = timezone.now()
        leave.remarks = request.data.get('remarks', '')
        leave.save()
        return Response({'message': 'Leave request rejected successfully'})

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending leave requests"""
        pending_leaves = TeacherLeave.objects.filter(status='pending')
        serializer = self.get_serializer(pending_leaves, many=True)
        return Response(serializer.data)


class TeacherPerformanceViewSet(viewsets.ModelViewSet):
    """Teacher Performance ViewSet"""
    
    queryset = TeacherPerformance.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['evaluation_period', 'grade', 'academic_year']
    search_fields = ['teacher__first_name', 'teacher__last_name', 'evaluated_by__first_name']

    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherPerformanceCreateSerializer
        return TeacherPerformanceSerializer

    @action(detail=False, methods=['get'])
    def by_academic_year(self, request):
        """Get performance by academic year"""
        academic_year_id = request.query_params.get('academic_year_id')
        if academic_year_id:
            performance = TeacherPerformance.objects.filter(academic_year_id=academic_year_id)
            serializer = self.get_serializer(performance, many=True)
            return Response(serializer.data)
        return Response([])

    @action(detail=False, methods=['get'])
    def top_performers(self, request):
        """Get top performing teachers"""
        top_performers = TeacherPerformance.objects.filter(
            overall_score__gte=8.0
        ).order_by('-overall_score')[:10]
        serializer = self.get_serializer(top_performers, many=True)
        return Response(serializer.data)


class TeacherDocumentViewSet(viewsets.ModelViewSet):
    """Teacher Document ViewSet"""
    
    queryset = TeacherDocument.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['document_type', 'is_verified']
    search_fields = ['teacher__first_name', 'teacher__last_name', 'title', 'description']

    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherDocumentCreateSerializer
        return TeacherDocumentSerializer

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify a document"""
        document = self.get_object()
        document.is_verified = True
        document.verified_by = request.user
        document.verified_date = timezone.now()
        document.save()
        return Response({'message': 'Document verified successfully'})

    @action(detail=False, methods=['get'])
    def unverified(self, request):
        """Get unverified documents"""
        unverified_docs = TeacherDocument.objects.filter(is_verified=False)
        serializer = self.get_serializer(unverified_docs, many=True)
        return Response(serializer.data)


class TeacherSettingsViewSet(viewsets.ModelViewSet):
    """Teacher Settings ViewSet"""
    
    queryset = TeacherSettings.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['email_notifications', 'sms_notifications', 'profile_visibility']
    search_fields = ['teacher__first_name', 'teacher__last_name']

    def get_serializer_class(self):
        return TeacherSettingsSerializer

    @action(detail=True, methods=['get'])
    def by_teacher(self, request, pk=None):
        """Get settings by teacher"""
        try:
            settings = TeacherSettings.objects.get(teacher_id=pk)
            serializer = self.get_serializer(settings)
            return Response(serializer.data)
        except TeacherSettings.DoesNotExist:
            return Response({'error': 'Settings not found'}, status=status.HTTP_404_NOT_FOUND)
