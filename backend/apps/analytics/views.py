from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count, Q, F, Sum, Max, Min
from django.utils import timezone
from datetime import timedelta

from .models import (
    StudentPerformance, AttendanceAnalytics, ExamAnalytics, SystemUsage,
    LearningAnalytics, PredictiveAnalytics, AnalyticsDashboard
)
from .serializers import (
    StudentPerformanceSerializer, AttendanceAnalyticsSerializer,
    ExamAnalyticsSerializer, SystemUsageSerializer, LearningAnalyticsSerializer,
    PredictiveAnalyticsSerializer, AnalyticsDashboardSerializer,
    AnalyticsOverviewSerializer, PerformanceTrendSerializer,
    AttendanceTrendSerializer, ExamTrendSerializer, LearningPathSerializer,
    PredictiveInsightSerializer, DashboardConfigSerializer,
    ReportGeneratorSerializer, ModelUpdateSerializer, DataExportSerializer
)
from .permissions import AnalyticsPermission


class StudentPerformanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing student performance analytics.
    """
    queryset = StudentPerformance.objects.all()
    serializer_class = StudentPerformanceSerializer
    permission_classes = [IsAuthenticated, AnalyticsPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'student', 'academic_year', 'semester', 'subject', 'risk_level'
    ]
    search_fields = [
        'student__first_name', 'student__last_name', 'subject__name'
    ]
    ordering_fields = ['score', 'created_at', 'updated_at']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get performance overview for dashboard."""
        queryset = self.get_queryset()

        # Calculate overall statistics
        total_students = queryset.values('student').distinct().count()
        avg_score = queryset.aggregate(
            avg_score=Avg('score')
        )['avg_score'] or 0
        high_performers = queryset.filter(score__gte=80).count()
        low_performers = queryset.filter(score__lt=60).count()

        # Performance by subject
        subject_performance = (
            queryset.values('subject__name').annotate(
                avg_score=Avg('score'),
                student_count=Count('student', distinct=True)
            ).order_by('-avg_score')
        )

        # Performance trends over time
        recent_performance = (
            queryset.filter(
                created_at__gte=timezone.now() - timedelta(days=30)
            ).values('created_at__date').annotate(
                avg_score=Avg('score')
            ).order_by('created_at__date')
        )

        data = {
            'total_students': total_students,
            'average_score': round(avg_score, 2),
            'high_performers': high_performers,
            'low_performers': low_performers,
            'subject_performance': list(subject_performance),
            'recent_trends': list(recent_performance)
        }

        serializer = AnalyticsOverviewSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trends(self, request):
        """Get performance trends over time."""
        queryset = self.get_queryset()
        period = request.query_params.get('period', 'month')

        if period == 'week':
            days = 7
        elif period == 'month':
            days = 30
        elif period == 'quarter':
            days = 90
        else:
            days = 365

        trends = (
            queryset.filter(
                created_at__gte=timezone.now() - timedelta(days=days)
            ).values('created_at__date').annotate(
                avg_score=Avg('score'),
                total_assessments=Count('id')
            ).order_by('created_at__date')
        )

        serializer = PerformanceTrendSerializer(trends, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def student_analysis(self, request):
        """Get detailed analysis for a specific student."""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {'error': 'student_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.get_queryset().filter(student_id=student_id)

        # Overall performance
        overall = queryset.aggregate(
            avg_score=Avg('score'),
            total_assessments=Count('id'),
            highest_score=Max('score'),
            lowest_score=Min('score')
        )

        # Performance by subject
        subject_analysis = queryset.values('subject__name').annotate(
            avg_score=Avg('score'),
            assessment_count=Count('id'),
            improvement_rate=Avg(F('score') - F('previous_score'))
        )

        # Performance over time
        time_analysis = queryset.values('created_at__date').annotate(
            avg_score=Avg('score')
        ).order_by('created_at__date')

        data = {
            'overall': overall,
            'subject_analysis': list(subject_analysis),
            'time_analysis': list(time_analysis)
        }

        return Response(data)

    @action(detail=False, methods=['post'])
    def generate_report(self, request):
        """Generate a comprehensive performance report."""
        serializer = ReportGeneratorSerializer(data=request.data)
        if serializer.is_valid():
            report_data = serializer.save()
            return Response(report_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AttendanceAnalyticsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing attendance analytics.
    """
    queryset = AttendanceAnalytics.objects.all()
    serializer_class = AttendanceAnalyticsSerializer
    permission_classes = [IsAuthenticated, AnalyticsPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['class_room', 'date', 'trend_direction']
    search_fields = ['class_room__name', 'class_room__code']
    ordering_fields = ['attendance_rate', 'created_at', 'updated_at']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get attendance overview for dashboard."""
        queryset = self.get_queryset()

        # Overall statistics
        total_students = queryset.values('student').distinct().count()
        avg_attendance = queryset.aggregate(avg_rate=Avg('attendance_rate'))['avg_rate'] or 0
        excellent_attendance = queryset.filter(attendance_rate__gte=95).count()
        poor_attendance = queryset.filter(attendance_rate__lt=75).count()

        # Attendance by class
        class_attendance = queryset.values('class_section__name').annotate(
            avg_rate=Avg('attendance_rate'),
            student_count=Count('student', distinct=True)
        ).order_by('-avg_rate')

        # Recent trends
        recent_trends = queryset.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        ).values('created_at__date').annotate(
            avg_rate=Avg('attendance_rate')
        ).order_by('created_at__date')

        data = {
            'total_students': total_students,
            'average_attendance': round(avg_attendance, 2),
            'excellent_attendance': excellent_attendance,
            'poor_attendance': poor_attendance,
            'class_attendance': list(class_attendance),
            'recent_trends': list(recent_trends)
        }

        return Response(data)

    @action(detail=False, methods=['get'])
    def trends(self, request):
        """Get attendance trends over time."""
        queryset = self.get_queryset()
        period = request.query_params.get('period', 'month')

        if period == 'week':
            days = 7
        elif period == 'month':
            days = 30
        elif period == 'quarter':
            days = 90
        else:
            days = 365

        trends = queryset.filter(
            created_at__gte=timezone.now() - timedelta(days=days)
        ).values('created_at__date').annotate(
            avg_rate=Avg('attendance_rate'),
            total_records=Count('id')
        ).order_by('created_at__date')

        serializer = AttendanceTrendSerializer(trends, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def anomalies(self, request):
        """Detect attendance anomalies."""
        queryset = self.get_queryset()

        # Find students with sudden drops in attendance
        anomalies = []
        for record in queryset:
            previous_records = queryset.filter(
                student=record.student,
                created_at__lt=record.created_at
            ).order_by('-created_at')[:5]

            if previous_records:
                avg_previous = sum(r.attendance_rate for r in previous_records) / len(previous_records)
                if record.attendance_rate < avg_previous - 20:  # 20% drop
                    anomalies.append({
                        'student': record.student.full_name,
                        'current_rate': record.attendance_rate,
                        'previous_avg': round(avg_previous, 2),
                        'drop_percentage': round(avg_previous - record.attendance_rate, 2),
                        'date': record.created_at
                    })

        return Response(anomalies)


class ExamAnalyticsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing exam analytics.
    """
    queryset = ExamAnalytics.objects.all()
    serializer_class = ExamAnalyticsSerializer
    permission_classes = [IsAuthenticated, AnalyticsPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['exam', 'difficulty_level']
    search_fields = ['exam__title', 'exam__subject__name', 'exam__class_group__name']
    ordering_fields = ['average_score', 'pass_rate', 'created_at']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get exam analytics overview."""
        queryset = self.get_queryset()

        # Overall statistics
        total_exams = queryset.values('exam').distinct().count()
        avg_score = queryset.aggregate(avg_score=Avg('average_score'))['avg_score'] or 0
        avg_pass_rate = queryset.aggregate(avg_pass=Avg('pass_rate'))['avg_pass'] or 0

        # Performance by subject
        subject_performance = queryset.values('subject__name').annotate(
            avg_score=Avg('average_score'),
            avg_pass_rate=Avg('pass_rate'),
            exam_count=Count('exam', distinct=True)
        ).order_by('-avg_score')

        # Recent exam trends
        recent_trends = queryset.filter(
            created_at__gte=timezone.now() - timedelta(days=90)
        ).values('created_at__date').annotate(
            avg_score=Avg('average_score'),
            avg_pass_rate=Avg('pass_rate')
        ).order_by('created_at__date')

        data = {
            'total_exams': total_exams,
            'average_score': round(avg_score, 2),
            'average_pass_rate': round(avg_pass_rate, 2),
            'subject_performance': list(subject_performance),
            'recent_trends': list(recent_trends)
        }

        return Response(data)

    @action(detail=False, methods=['get'])
    def trends(self, request):
        """Get exam performance trends."""
        queryset = self.get_queryset()
        period = request.query_params.get('period', 'quarter')

        if period == 'month':
            days = 30
        elif period == 'quarter':
            days = 90
        elif period == 'semester':
            days = 180
        else:
            days = 365

        trends = queryset.filter(
            created_at__gte=timezone.now() - timedelta(days=days)
        ).values('created_at__date').annotate(
            avg_score=Avg('average_score'),
            avg_pass_rate=Avg('pass_rate'),
            exam_count=Count('exam', distinct=True)
        ).order_by('created_at__date')

        serializer = ExamTrendSerializer(trends, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def exam_analysis(self, request):
        """Get detailed analysis for a specific exam."""
        exam_id = request.query_params.get('exam_id')
        if not exam_id:
            return Response(
                {'error': 'exam_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.get_queryset().filter(exam_id=exam_id)

        if not queryset.exists():
            return Response(
                {'error': 'Exam not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        exam_data = queryset.first()

        # Score distribution
        score_distribution = {
            'excellent': queryset.filter(average_score__gte=90).count(),
            'good': queryset.filter(average_score__gte=80, average_score__lt=90).count(),
            'average': queryset.filter(average_score__gte=70, average_score__lt=80).count(),
            'below_average': queryset.filter(average_score__lt=70).count()
        }

        # Subject-wise breakdown
        subject_breakdown = queryset.values('subject__name').annotate(
            avg_score=Avg('average_score'),
            pass_rate=Avg('pass_rate'),
            student_count=Count('student_count')
        )

        data = {
            'exam_info': {
                'title': exam_data.exam.title,
                'date': exam_data.exam.exam_date,
                'total_students': exam_data.total_students,
                'average_score': exam_data.average_score,
                'pass_rate': exam_data.pass_rate
            },
            'score_distribution': score_distribution,
            'subject_breakdown': list(subject_breakdown)
        }

        return Response(data)


class SystemUsageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing system usage analytics.
    """
    queryset = SystemUsage.objects.all()
    serializer_class = SystemUsageSerializer
    permission_classes = [IsAuthenticated, AnalyticsPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user', 'session_id', 'device_type']
    search_fields = ['user__username', 'session_id', 'device_type']
    ordering_fields = ['login_time', 'session_duration', 'created_at']
    ordering = ['-login_time']

    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get system usage overview."""
        queryset = self.get_queryset()

        # Overall statistics
        total_sessions = queryset.values('session_id').distinct().count()
        total_actions = queryset.count()
        avg_response_time = queryset.aggregate(avg_time=Avg('response_time'))['avg_time'] or 0

        # Usage by module
        module_usage = queryset.values('module').annotate(
            action_count=Count('id'),
            avg_response_time=Avg('response_time'),
            unique_users=Count('user', distinct=True)
        ).order_by('-action_count')

        # Usage trends
        usage_trends = queryset.filter(
            timestamp__gte=timezone.now() - timedelta(days=7)
        ).values('timestamp__date').annotate(
            action_count=Count('id'),
            unique_users=Count('user', distinct=True),
            avg_response_time=Avg('response_time')
        ).order_by('timestamp__date')

        data = {
            'total_sessions': total_sessions,
            'total_actions': total_actions,
            'average_response_time': round(avg_response_time, 3),
            'module_usage': list(module_usage),
            'usage_trends': list(usage_trends)
        }

        return Response(data)

    @action(detail=False, methods=['get'])
    def user_activity(self, request):
        """Get user activity patterns."""
        queryset = self.get_queryset()
        user_id = request.query_params.get('user_id')

        if user_id:
            queryset = queryset.filter(user_id=user_id)

        # Activity by time of day
        activity_by_hour = queryset.values('timestamp__hour').annotate(
            action_count=Count('id')
        ).order_by('timestamp__hour')

        # Most active users
        active_users = queryset.values('user__username').annotate(
            action_count=Count('id'),
            last_activity=Max('timestamp')
        ).order_by('-action_count')[:10]

        # Module preferences
        module_preferences = queryset.values('module').annotate(
            action_count=Count('id')
        ).order_by('-action_count')

        data = {
            'activity_by_hour': list(activity_by_hour),
            'active_users': list(active_users),
            'module_preferences': list(module_preferences)
        }

        return Response(data)


class LearningAnalyticsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing learning analytics.
    """
    queryset = LearningAnalytics.objects.all()
    serializer_class = LearningAnalyticsSerializer
    permission_classes = [IsAuthenticated, AnalyticsPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['student', 'subject', 'learning_style', 'participation_level']
    search_fields = ['student__first_name', 'student__last_name', 'subject__name']
    ordering_fields = ['progress_percentage', 'time_spent', 'created_at']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get learning analytics overview."""
        queryset = self.get_queryset()

        # Overall statistics
        total_students = queryset.values('student').distinct().count()
        avg_progress = queryset.aggregate(avg_progress=Avg('progress_percentage'))['avg_progress'] or 0
        avg_time_spent = queryset.aggregate(avg_time=Avg('time_spent'))['avg_time'] or 0

        # Progress by subject
        subject_progress = queryset.values('subject__name').annotate(
            avg_progress=Avg('progress_percentage'),
            avg_time_spent=Avg('time_spent'),
            student_count=Count('student', distinct=True)
        ).order_by('-avg_progress')

        # Learning path effectiveness
        path_effectiveness = queryset.values('learning_path__name').annotate(
            avg_progress=Avg('progress_percentage'),
            completion_rate=Count('id', filter=Q(progress_percentage=100)),
            total_students=Count('student', distinct=True)
        ).order_by('-avg_progress')

        data = {
            'total_students': total_students,
            'average_progress': round(avg_progress, 2),
            'average_time_spent': round(avg_time_spent, 2),
            'subject_progress': list(subject_progress),
            'path_effectiveness': list(path_effectiveness)
        }

        return Response(data)

    @action(detail=False, methods=['get'])
    def learning_paths(self, request):
        """Get learning path analytics."""
        queryset = self.get_queryset()

        paths = queryset.values('learning_path__name', 'learning_path__description').annotate(
            student_count=Count('student', distinct=True),
            avg_progress=Avg('progress_percentage'),
            avg_completion_time=Avg('time_spent'),
            success_rate=Count('id', filter=Q(progress_percentage=100)) * 100.0 / Count('id')
        ).order_by('-avg_progress')

        serializer = LearningPathSerializer(paths, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def student_learning(self, request):
        """Get detailed learning analytics for a student."""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {'error': 'student_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.get_queryset().filter(student_id=student_id)

        # Overall learning progress
        overall = queryset.aggregate(
            avg_progress=Avg('progress_percentage'),
            total_time_spent=Sum('time_spent'),
            completed_paths=Count('id', filter=Q(progress_percentage=100))
        )

        # Subject-wise progress
        subject_progress = queryset.values('subject__name').annotate(
            progress_percentage=Avg('progress_percentage'),
            time_spent=Sum('time_spent'),
            last_activity=Max('last_activity')
        ).order_by('-progress_percentage')

        # Learning recommendations
        recommendations = []
        for record in queryset.filter(progress_percentage__lt=70):
            recommendations.append({
                'subject': record.subject.name,
                'current_progress': record.progress_percentage,
                'suggested_actions': [
                    'Review previous lessons',
                    'Practice more exercises',
                    'Seek teacher assistance'
                ]
            })

        data = {
            'overall': overall,
            'subject_progress': list(subject_progress),
            'recommendations': recommendations
        }

        return Response(data)


class PredictiveAnalyticsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing predictive analytics.
    """
    queryset = PredictiveAnalytics.objects.all()
    serializer_class = PredictiveAnalyticsSerializer
    permission_classes = [IsAuthenticated, AnalyticsPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['student', 'intervention_needed', 'intervention_priority', 'model_version']
    search_fields = ['student__first_name', 'student__last_name', 'intervention_type']
    ordering_fields = ['confidence_score', 'predicted_gpa', 'created_at']
    ordering = ['-confidence_score']

    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get predictive analytics overview."""
        queryset = self.get_queryset()

        # Overall statistics
        total_predictions = queryset.count()
        avg_confidence = queryset.aggregate(avg_conf=Avg('confidence_level'))['avg_conf'] or 0

        # Predictions by type
        predictions_by_type = queryset.values('prediction_type').annotate(
            prediction_count=Count('id'),
            avg_confidence=Avg('confidence_level'),
            high_confidence=Count('id', filter=Q(confidence_level__gte=80))
        ).order_by('-prediction_count')

        # Risk assessment
        risk_assessment = queryset.filter(prediction_type='performance_risk').values(
            'risk_level'
        ).annotate(
            student_count=Count('student', distinct=True)
        ).order_by('risk_level')

        data = {
            'total_predictions': total_predictions,
            'average_confidence': round(avg_confidence, 2),
            'predictions_by_type': list(predictions_by_type),
            'risk_assessment': list(risk_assessment)
        }

        return Response(data)

    @action(detail=False, methods=['get'])
    def insights(self, request):
        """Get predictive insights."""
        queryset = self.get_queryset()

        insights = []

        # Performance predictions
        performance_predictions = queryset.filter(
            prediction_type='performance_prediction'
        ).select_related('student', 'subject')

        for prediction in performance_predictions:
            insights.append({
                'type': 'performance_prediction',
                'student': prediction.student.full_name,
                'subject': prediction.subject.name if prediction.subject else 'Overall',
                'predicted_value': prediction.predicted_value,
                'confidence': prediction.confidence_level,
                'recommendations': prediction.recommendations
            })

        # Risk predictions
        risk_predictions = queryset.filter(
            prediction_type='performance_risk'
        ).select_related('student')

        for prediction in risk_predictions:
            insights.append({
                'type': 'risk_assessment',
                'student': prediction.student.full_name,
                'risk_level': prediction.risk_level,
                'confidence': prediction.confidence_level,
                'intervention_needed': prediction.confidence_level > 70
            })

        serializer = PredictiveInsightSerializer(insights, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_models(self, request):
        """Update predictive models."""
        serializer = ModelUpdateSerializer(data=request.data)
        if serializer.is_valid():
            # This would typically trigger a background task to retrain models
            update_data = serializer.save()
            return Response(update_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AnalyticsDashboardViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing analytics dashboard configurations.
    """
    queryset = AnalyticsDashboard.objects.all()
    serializer_class = AnalyticsDashboardSerializer
    permission_classes = [IsAuthenticated, AnalyticsPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_public', 'created_by', 'auto_refresh']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def user_dashboards(self, request):
        """Get dashboards for the current user."""
        user = request.user
        dashboards = self.get_queryset().filter(user=user, is_active=True)
        serializer = self.get_serializer(dashboards, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def configure(self, request, pk=None):
        """Configure dashboard widgets and layout."""
        dashboard = self.get_object()
        serializer = DashboardConfigSerializer(data=request.data)

        if serializer.is_valid():
            config_data = serializer.validated_data
            dashboard.configuration = config_data
            dashboard.save()

            return Response({
                'message': 'Dashboard configured successfully',
                'configuration': config_data
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def export_data(self, request):
        """Export analytics data."""
        serializer = DataExportSerializer(data=request.data)
        if serializer.is_valid():
            export_data = serializer.save()
            return Response(export_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
