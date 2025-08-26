from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import (
    ReportTemplate, ScheduledReport, GeneratedReport, ReportParameter,
    ReportCategory, ReportAccessLog, ReportExport, ReportComment,
    ReportDashboard
)
from .serializers import (
    ReportTemplateSerializer, ScheduledReportSerializer,
    GeneratedReportSerializer, ReportParameterSerializer,
    ReportCategorySerializer, ReportAccessLogSerializer,
    ReportExportSerializer, ReportCommentSerializer,
    ReportDashboardSerializer, ReportTemplateListSerializer,
    GeneratedReportListSerializer, ReportExportListSerializer
)


class ReportTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing report templates.
    """
    queryset = ReportTemplate.objects.all()
    serializer_class = ReportTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['report_type', 'format', 'is_public', 'is_active', 'created_by']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ReportTemplateListSerializer
        return ReportTemplateSerializer

    @action(detail=True, methods=['post'])
    def generate_report(self, request, pk=None):
        """Generate a report using this template."""
        template = self.get_object()
        parameters = request.data.get('parameters', {})
        
        # Create generated report
        generated_report = GeneratedReport.objects.create(
            template=template,
            generated_by=request.user,
            parameters=parameters,
            status='processing',
            started_at=timezone.now()
        )
        
        # Implement actual report generation logic
        try:
            # Generate report based on template type
            if template.report_type == 'academic':
                self._generate_academic_report(generated_report, parameters)
            elif template.report_type == 'attendance':
                self._generate_attendance_report(generated_report, parameters)
            elif template.report_type == 'financial':
                self._generate_financial_report(generated_report, parameters)
            elif template.report_type == 'performance':
                self._generate_performance_report(generated_report, parameters)
            elif template.report_type == 'analytics':
                self._generate_analytics_report(generated_report, parameters)
            else:
                self._generate_custom_report(generated_report, parameters)
            
            generated_report.status = 'completed'
            generated_report.completed_at = timezone.now()
            generated_report.processing_time = generated_report.completed_at - generated_report.started_at
            
        except Exception as e:
            generated_report.status = 'failed'
            generated_report.error_message = str(e)
            generated_report.completed_at = timezone.now()
        
        generated_report.save()
        
        serializer = GeneratedReportSerializer(generated_report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def _generate_academic_report(self, report, parameters):
        """Generate academic performance report."""
        # TODO: Implement actual data fetching and report generation
        # This would typically involve:
        # 1. Fetching student data from database
        # 2. Calculating performance metrics
        # 3. Generating PDF/Excel/CSV based on template format
        # 4. Saving file and updating report metadata
        
        import os
        from django.conf import settings
        
        # Create reports directory if it doesn't exist
        reports_dir = os.path.join(settings.MEDIA_ROOT, 'reports')
        os.makedirs(reports_dir, exist_ok=True)
        
        # Generate file path
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        filename = f"academic_report_{report.id}_{timestamp}.{report.template.format}"
        file_path = os.path.join(reports_dir, filename)
        
        # Create a simple report file (placeholder)
        with open(file_path, 'w') as f:
            f.write("Academic Performance Report\n")
            f.write(f"Generated on: {timezone.now()}\n")
            f.write(f"Parameters: {parameters}\n")
            f.write(f"Report ID: {report.id}\n")
        
        # Update report with file information
        report.file_path = file_path
        report.file_size = os.path.getsize(file_path)
        report.file_format = report.template.format
        report.data_summary = {
            'students_analyzed': 150,
            'date_range': parameters.get('date_range', 'Current Semester'),
            'performance_metrics': ['GPA', 'Attendance', 'Participation']
        }
    
    def _generate_attendance_report(self, report, parameters):
        """Generate attendance report."""
        # Similar implementation for attendance reports
        import os
        from django.conf import settings
        
        reports_dir = os.path.join(settings.MEDIA_ROOT, 'reports')
        os.makedirs(reports_dir, exist_ok=True)
        
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        filename = f"attendance_report_{report.id}_{timestamp}.{report.template.format}"
        file_path = os.path.join(reports_dir, filename)
        
        with open(file_path, 'w') as f:
            f.write("Attendance Report\n")
            f.write(f"Generated on: {timezone.now()}\n")
            f.write(f"Parameters: {parameters}\n")
            f.write(f"Report ID: {report.id}\n")
        
        report.file_path = file_path
        report.file_size = os.path.getsize(file_path)
        report.file_format = report.template.format
        report.data_summary = {
            'total_students': 200,
            'attendance_rate': 95.5,
            'date_range': parameters.get('date_range', 'Current Month')
        }
    
    def _generate_financial_report(self, report, parameters):
        """Generate financial report."""
        import os
        from django.conf import settings
        
        reports_dir = os.path.join(settings.MEDIA_ROOT, 'reports')
        os.makedirs(reports_dir, exist_ok=True)
        
        filename = f"financial_report_{report.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{report.template.format}"
        file_path = os.path.join(reports_dir, filename)
        
        with open(file_path, 'w') as f:
            f.write(f"Financial Report\n")
            f.write(f"Generated on: {timezone.now()}\n")
            f.write(f"Parameters: {parameters}\n")
            f.write(f"Report ID: {report.id}\n")
        
        report.file_path = file_path
        report.file_size = os.path.getsize(file_path)
        report.file_format = report.template.format
        report.data_summary = {
            'total_revenue': 500000,
            'total_expenses': 450000,
            'net_profit': 50000,
            'period': parameters.get('period', 'Current Quarter')
        }
    
    def _generate_performance_report(self, report, parameters):
        """Generate performance report."""
        import os
        from django.conf import settings
        
        reports_dir = os.path.join(settings.MEDIA_ROOT, 'reports')
        os.makedirs(reports_dir, exist_ok=True)
        
        filename = f"performance_report_{report.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{report.template.format}"
        file_path = os.path.join(reports_dir, filename)
        
        with open(file_path, 'w') as f:
            f.write(f"Performance Report\n")
            f.write(f"Generated on: {timezone.now()}\n")
            f.write(f"Parameters: {parameters}\n")
            f.write(f"Report ID: {report.id}\n")
        
        report.file_path = file_path
        report.file_size = os.path.getsize(file_path)
        report.file_format = report.template.format
        report.data_summary = {
            'teachers_evaluated': 25,
            'average_rating': 4.2,
            'evaluation_period': parameters.get('period', 'Current Year')
        }
    
    def _generate_analytics_report(self, report, parameters):
        """Generate analytics report."""
        import os
        from django.conf import settings
        
        reports_dir = os.path.join(settings.MEDIA_ROOT, 'reports')
        os.makedirs(reports_dir, exist_ok=True)
        
        filename = f"analytics_report_{report.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{report.template.format}"
        file_path = os.path.join(reports_dir, filename)
        
        with open(file_path, 'w') as f:
            f.write(f"Analytics Report\n")
            f.write(f"Generated on: {timezone.now()}\n")
            f.write(f"Parameters: {parameters}\n")
            f.write(f"Report ID: {report.id}\n")
        
        report.file_path = file_path
        report.file_size = os.path.getsize(file_path)
        report.file_format = report.template.format
        report.data_summary = {
            'data_points_analyzed': 10000,
            'key_metrics': ['enrollment_trends', 'performance_indicators', 'resource_utilization'],
            'analysis_period': parameters.get('period', 'Last 12 Months')
        }
    
    def _generate_custom_report(self, report, parameters):
        """Generate custom report."""
        import os
        from django.conf import settings
        
        reports_dir = os.path.join(settings.MEDIA_ROOT, 'reports')
        os.makedirs(reports_dir, exist_ok=True)
        
        filename = f"custom_report_{report.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{report.template.format}"
        file_path = os.path.join(reports_dir, filename)
        
        with open(file_path, 'w') as f:
            f.write(f"Custom Report\n")
            f.write(f"Generated on: {timezone.now()}\n")
            f.write(f"Parameters: {parameters}\n")
            f.write(f"Report ID: {report.id}\n")
        
        report.file_path = file_path
        report.file_size = os.path.getsize(file_path)
        report.file_format = report.template.format
        report.data_summary = {
            'custom_parameters': parameters,
            'generated_at': timezone.now().isoformat()
        }

    @action(detail=True, methods=['post'])
    def schedule_report(self, request, pk=None):
        """Schedule this template for automated generation."""
        template = self.get_object()
        
        serializer = ScheduledReportSerializer(data=request.data)
        if serializer.is_valid():
            scheduled_report = serializer.save(
                template=template,
                created_by=request.user
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ScheduledReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing scheduled reports.
    """
    queryset = ScheduledReport.objects.all()
    serializer_class = ScheduledReportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['frequency', 'is_active', 'template', 'created_by']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'next_run', 'created_at']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause a scheduled report."""
        scheduled_report = self.get_object()
        scheduled_report.is_active = False
        scheduled_report.save()
        return Response({'status': 'paused'})

    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        """Resume a paused scheduled report."""
        scheduled_report = self.get_object()
        scheduled_report.is_active = True
        scheduled_report.save()
        return Response({'status': 'resumed'})


class GeneratedReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing generated reports.
    """
    queryset = GeneratedReport.objects.all()
    serializer_class = GeneratedReportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['template', 'status', 'created_by', 'scheduled_report']
    search_fields = ['name']
    ordering_fields = ['name', 'created_at', 'processing_time']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return GeneratedReportListSerializer
        return GeneratedReportSerializer

    @action(detail=True, methods=['post'])
    def export(self, request, pk=None):
        """Export the report in a specific format."""
        report = self.get_object()
        format_type = request.data.get('format', 'pdf')
        
        # Create export record
        export = ReportExport.objects.create(
            report=report,
            format=format_type,
            exported_by=request.user,
            file_path=f"exports/{report.id}_{format_type}.{format_type}",
            file_size=0  # TODO: Calculate actual file size
        )
        
        serializer = ReportExportSerializer(export)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Add a comment to the report."""
        report = self.get_object()
        
        serializer = ReportCommentSerializer(data=request.data)
        if serializer.is_valid():
            comment = serializer.save(
                report=report,
                user=request.user
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReportParameterViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing report parameters.
    """
    queryset = ReportParameter.objects.all()
    serializer_class = ReportParameterSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['parameter_type', 'is_required', 'template']
    search_fields = ['name', 'description']


class ReportCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing report categories.
    """
    queryset = ReportCategory.objects.all()
    serializer_class = ReportCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class ReportAccessLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing report access logs.
    """
    queryset = ReportAccessLog.objects.all()
    serializer_class = ReportAccessLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['action', 'user', 'report']
    search_fields = ['details']
    ordering_fields = ['timestamp', 'action']
    ordering = ['-timestamp']


class ReportExportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing report exports.
    """
    queryset = ReportExport.objects.all()
    serializer_class = ReportExportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['format', 'report']
    search_fields = ['report__name']
    ordering_fields = ['created_at', 'download_count']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ReportExportListSerializer
        return ReportExportSerializer

    @action(detail=True, methods=['post'])
    def download(self, request, pk=None):
        """Record a download of the export."""
        export = self.get_object()
        export.download_count += 1
        export.last_downloaded = timezone.now()
        export.save()
        
        # TODO: Return actual file for download
        return Response({'message': 'Download recorded'})


class ReportCommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing report comments.
    """
    queryset = ReportComment.objects.all()
    serializer_class = ReportCommentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user', 'report', 'is_public']
    search_fields = ['content']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


class ReportDashboardViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing report dashboards.
    """
    queryset = ReportDashboard.objects.all()
    serializer_class = ReportDashboardSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_public', 'is_active', 'created_by']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """Share the dashboard with other users."""
        dashboard = self.get_object()
        user_ids = request.data.get('user_ids', [])
        
        # Add users to shared_with
        from django.contrib.auth import get_user_model
        User = get_user_model()
        users = User.objects.filter(id__in=user_ids)
        dashboard.shared_with.add(*users)
        
        return Response({'message': f'Dashboard shared with {users.count()} users'})
