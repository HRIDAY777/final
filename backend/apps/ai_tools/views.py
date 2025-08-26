from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
import json

from .models import (
    AIModel, AIQuizGenerator, AIQuestion, AILessonSummarizer, AIPerformancePredictor,
    AIAttendanceAnomalyDetector, AINaturalLanguageQuery, AITrainingJob, AIDataSource, AIUsageLog
)
from .serializers import (
    AIModelSerializer, AIModelCreateSerializer, AIQuizGeneratorSerializer, AIQuizGeneratorCreateSerializer,
    AIQuestionSerializer, AILessonSummarizerSerializer, AIPerformancePredictorSerializer,
    AIAttendanceAnomalyDetectorSerializer, AINaturalLanguageQuerySerializer, AITrainingJobSerializer,
    AIDataSourceSerializer, AIUsageLogSerializer, QuizGenerationSerializer, LessonSummarizationSerializer,
    PerformancePredictionSerializer, NaturalLanguageQuerySerializer, TrainingJobCreateSerializer,
    AIAnalyticsSerializer
)


class AIModelViewSet(viewsets.ModelViewSet):
    """ViewSet for AI models."""
    
    queryset = AIModel.objects.all()
    serializer_class = AIModelSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['model_type', 'status', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'accuracy', 'last_trained']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AIModelCreateSerializer
        return AIModelSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate an AI model."""
        model = self.get_object()
        model.status = 'active'
        model.is_active = True
        model.save()
        return Response({'status': 'Model activated'})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate an AI model."""
        model = self.get_object()
        model.status = 'inactive'
        model.is_active = False
        model.save()
        return Response({'status': 'Model deactivated'})
    
    @action(detail=True, methods=['post'])
    def retrain(self, request, pk=None):
        """Start retraining an AI model."""
        model = self.get_object()
        model.status = 'training'
        model.is_active = False
        model.save()
        # Here you would typically trigger a Celery task for training
        return Response({'status': 'Training started'})
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get AI models analytics."""
        total_models = AIModel.objects.count()
        active_models = AIModel.objects.filter(is_active=True).count()
        models_by_type = AIModel.objects.values('model_type').annotate(count=Count('id'))
        average_accuracy = AIModel.objects.filter(accuracy__isnull=False).aggregate(avg=Avg('accuracy'))
        
        data = {
            'total_models': total_models,
            'active_models': active_models,
            'models_by_type': {item['model_type']: item['count'] for item in models_by_type},
            'average_accuracy': average_accuracy['avg'] or 0.0
        }
        
        serializer = AIAnalyticsSerializer(data)
        return Response(serializer.data)


class AIQuizGeneratorViewSet(viewsets.ModelViewSet):
    """ViewSet for AI quiz generators."""
    
    queryset = AIQuizGenerator.objects.all()
    serializer_class = AIQuizGeneratorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['difficulty', 'is_generated', 'generation_status', 'subject']
    search_fields = ['title', 'description', 'syllabus_topic']
    ordering_fields = ['title', 'created_at', 'question_count']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AIQuizGeneratorCreateSerializer
        return AIQuizGeneratorSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def generate_quiz(self, request, pk=None):
        """Generate quiz questions using AI."""
        quiz = self.get_object()
        
        # Here you would typically call the AI service to generate questions
        # For now, we'll simulate the process
        quiz.generation_status = 'processing'
        quiz.save()
        
        # Simulate AI generation (replace with actual AI call)
        # generate_quiz_questions.delay(quiz.id)
        
        return Response({'status': 'Quiz generation started'})
    
    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get questions for a quiz."""
        quiz = self.get_object()
        questions = quiz.questions.all()
        serializer = AIQuestionSerializer(questions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate a new quiz using AI."""
        serializer = QuizGenerationSerializer(data=request.data)
        if serializer.is_valid():
            # Create quiz and trigger generation
            quiz_data = serializer.validated_data
            quiz = AIQuizGenerator.objects.create(
                title=f"AI Generated Quiz - {quiz_data['syllabus_topic']}",
                **quiz_data,
                created_by=request.user
            )
            
            # Trigger AI generation
            # generate_quiz_questions.delay(quiz.id)
            
            return Response(AIQuizGeneratorSerializer(quiz).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AIQuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for AI questions."""
    
    queryset = AIQuestion.objects.all()
    serializer_class = AIQuestionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['question_type', 'difficulty', 'quiz']
    search_fields = ['question_text', 'correct_answer']
    ordering_fields = ['order', 'created_at', 'confidence_score']
    ordering = ['order', 'created_at']
    
    def perform_create(self, serializer):
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        """Validate a question's quality."""
        question = self.get_object()
        
        # Here you would typically call AI to validate the question
        # For now, we'll simulate validation
        validation_score = 0.85  # Simulated score
        
        return Response({
            'question_id': question.id,
            'validation_score': validation_score,
            'is_valid': validation_score > 0.7
        })


class AILessonSummarizerViewSet(viewsets.ModelViewSet):
    """ViewSet for AI lesson summarizers."""
    
    queryset = AILessonSummarizer.objects.all()
    serializer_class = AILessonSummarizerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['summary_type', 'is_generated', 'generation_status', 'subject']
    search_fields = ['title', 'summary_content']
    ordering_fields = ['title', 'created_at', 'readability_score']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def generate_summary(self, request, pk=None):
        """Generate lesson summary using AI."""
        summarizer = self.get_object()
        
        # Here you would typically call the AI service to generate summary
        summarizer.generation_status = 'processing'
        summarizer.save()
        
        # Simulate AI generation (replace with actual AI call)
        # generate_lesson_summary.delay(summarizer.id)
        
        return Response({'status': 'Summary generation started'})
    
    @action(detail=False, methods=['post'])
    def summarize(self, request):
        """Generate a new lesson summary using AI."""
        serializer = LessonSummarizationSerializer(data=request.data)
        if serializer.is_valid():
            # Create summarizer and trigger generation
            summary_data = serializer.validated_data
            lesson = summary_data['lesson_id']
            
            summarizer = AILessonSummarizer.objects.create(
                title=f"AI Summary - Lesson {lesson}",
                lesson_id=lesson,
                summary_type=summary_data['summary_type'],
                created_by=request.user
            )
            
            # Trigger AI generation
            # generate_lesson_summary.delay(summarizer.id)
            
            return Response(AILessonSummarizerSerializer(summarizer).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AIPerformancePredictorViewSet(viewsets.ModelViewSet):
    """ViewSet for AI performance predictors."""
    
    queryset = AIPerformancePredictor.objects.all()
    serializer_class = AIPerformancePredictorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['prediction_type', 'confidence_level', 'intervention_needed', 'subject']
    search_fields = ['student__first_name', 'student__last_name']
    ordering_fields = ['created_at', 'predicted_value', 'confidence_score']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def predict(self, request, pk=None):
        """Generate performance prediction using AI."""
        predictor = self.get_object()
        
        # Here you would typically call the AI service to generate prediction
        # For now, we'll simulate the process
        predictor.predicted_value = 85.5  # Simulated prediction
        predictor.confidence_score = 0.78
        predictor.save()
        
        return Response({'status': 'Prediction generated'})
    
    @action(detail=False, methods=['post'])
    def predict_performance(self, request):
        """Generate a new performance prediction using AI."""
        serializer = PerformancePredictionSerializer(data=request.data)
        if serializer.is_valid():
            # Create predictor and trigger prediction
            prediction_data = serializer.validated_data
            
            predictor = AIPerformancePredictor.objects.create(
                student_id=prediction_data['student_id'],
                subject_id=prediction_data.get('subject_id'),
                prediction_type=prediction_data['prediction_type'],
                created_by=request.user
            )
            
            # Trigger AI prediction
            # generate_performance_prediction.delay(predictor.id)
            
            return Response(AIPerformancePredictorSerializer(predictor).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def interventions_needed(self, request):
        """Get predictions that need intervention."""
        interventions = self.queryset.filter(intervention_needed=True)
        serializer = self.get_serializer(interventions, many=True)
        return Response(serializer.data)


class AIAttendanceAnomalyDetectorViewSet(viewsets.ModelViewSet):
    """ViewSet for AI attendance anomaly detectors."""
    
    queryset = AIAttendanceAnomalyDetector.objects.all()
    serializer_class = AIAttendanceAnomalyDetectorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['anomaly_type', 'severity', 'intervention_needed', 'is_resolved']
    search_fields = ['student__first_name', 'student__last_name']
    ordering_fields = ['detection_date', 'created_at', 'severity']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Mark anomaly as resolved."""
        anomaly = self.get_object()
        anomaly.is_resolved = True
        anomaly.resolution_date = timezone.now()
        anomaly.resolution_notes = request.data.get('notes', '')
        anomaly.save()
        return Response({'status': 'Anomaly resolved'})
    
    @action(detail=False, methods=['get'])
    def unresolved(self, request):
        """Get unresolved anomalies."""
        unresolved = self.queryset.filter(is_resolved=False)
        serializer = self.get_serializer(unresolved, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def critical(self, request):
        """Get critical severity anomalies."""
        critical = self.queryset.filter(severity='critical', is_resolved=False)
        serializer = self.get_serializer(critical, many=True)
        return Response(serializer.data)


class AINaturalLanguageQueryViewSet(viewsets.ModelViewSet):
    """ViewSet for AI natural language queries."""
    
    queryset = AINaturalLanguageQuery.objects.all()
    serializer_class = AINaturalLanguageQuerySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['query_type', 'status']
    search_fields = ['query_text', 'intent']
    ordering_fields = ['created_at', 'processing_time', 'confidence_score']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Process a natural language query."""
        query = self.get_object()
        
        # Here you would typically call the AI service to process the query
        # For now, we'll simulate the process
        query.status = 'processing'
        query.save()
        
        # Simulate AI processing (replace with actual AI call)
        # process_natural_language_query.delay(query.id)
        
        return Response({'status': 'Query processing started'})
    
    @action(detail=False, methods=['post'])
    def query(self, request):
        """Process a new natural language query."""
        serializer = NaturalLanguageQuerySerializer(data=request.data)
        if serializer.is_valid():
            # Create query and trigger processing
            query_data = serializer.validated_data
            
            query = AINaturalLanguageQuery.objects.create(
                query_text=query_data['query_text'],
                query_type=query_data['query_type'],
                user=request.user
            )
            
            # Trigger AI processing
            # process_natural_language_query.delay(query.id)
            
            return Response(AINaturalLanguageQuerySerializer(query).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        """Rate a query result."""
        query = self.get_object()
        rating = request.data.get('rating')
        feedback = request.data.get('feedback', '')
        
        if rating and 1 <= rating <= 5:
            query.user_rating = rating
            query.user_feedback = feedback
            query.save()
            return Response({'status': 'Rating saved'})
        return Response({'error': 'Invalid rating'}, status=status.HTTP_400_BAD_REQUEST)


class AITrainingJobViewSet(viewsets.ModelViewSet):
    """ViewSet for AI training jobs."""
    
    queryset = AITrainingJob.objects.all()
    serializer_class = AITrainingJobSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'ai_model']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'progress', 'status']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start a training job."""
        job = self.get_object()
        
        if job.status == 'pending':
            job.status = 'running'
            job.started_at = timezone.now()
            job.save()
            
            # Here you would typically trigger the actual training process
            # start_training_job.delay(job.id)
            
            return Response({'status': 'Training job started'})
        return Response({'error': 'Job cannot be started'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a training job."""
        job = self.get_object()
        
        if job.status == 'running':
            job.status = 'cancelled'
            job.save()
            return Response({'status': 'Training job cancelled'})
        return Response({'error': 'Job cannot be cancelled'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def create_job(self, request):
        """Create a new training job."""
        serializer = TrainingJobCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Create training job
            job_data = serializer.validated_data
            
            job = AITrainingJob.objects.create(
                name=job_data['name'],
                description=job_data.get('description', ''),
                ai_model_id=job_data['ai_model_id'],
                training_config=job_data['training_config'],
                dataset_config=job_data['dataset_config'],
                created_by=request.user
            )
            
            return Response(AITrainingJobSerializer(job).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def running(self, request):
        """Get running training jobs."""
        running_jobs = self.queryset.filter(status='running')
        serializer = self.get_serializer(running_jobs, many=True)
        return Response(serializer.data)


class AIDataSourceViewSet(viewsets.ModelViewSet):
    """ViewSet for AI data sources."""
    
    queryset = AIDataSource.objects.all()
    serializer_class = AIDataSourceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['source_type', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'data_quality_score']
    ordering = ['name']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def test_connection(self, request, pk=None):
        """Test data source connection."""
        data_source = self.get_object()
        
        # Here you would typically test the connection
        # For now, we'll simulate a successful test
        return Response({
            'status': 'Connection successful',
            'data_source_id': data_source.id,
            'connection_status': 'connected'
        })
    
    @action(detail=True, methods=['post'])
    def refresh_data(self, request, pk=None):
        """Refresh data from the source."""
        data_source = self.get_object()
        
        # Here you would typically refresh the data
        data_source.last_updated = timezone.now()
        data_source.save()
        
        return Response({'status': 'Data refreshed'})
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active data sources."""
        active_sources = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(active_sources, many=True)
        return Response(serializer.data)


class AIUsageLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for AI usage logs (read-only)."""
    
    queryset = AIUsageLog.objects.all()
    serializer_class = AIUsageLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tool_type', 'success', 'ai_model']
    search_fields = ['user__username', 'tool_type']
    ordering_fields = ['timestamp', 'processing_time', 'user_satisfaction']
    ordering = ['-timestamp']
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get usage analytics."""
        total_queries = AIUsageLog.objects.count()
        successful_queries = AIUsageLog.objects.filter(success=True).count()
        average_processing_time = AIUsageLog.objects.filter(
            processing_time__isnull=False
        ).aggregate(avg=Avg('processing_time'))
        average_satisfaction = AIUsageLog.objects.filter(
            user_satisfaction__isnull=False
        ).aggregate(avg=Avg('user_satisfaction'))
        
        # Recent activity (last 7 days)
        week_ago = timezone.now() - timedelta(days=7)
        recent_activity = AIUsageLog.objects.filter(
            timestamp__gte=week_ago
        ).values('tool_type').annotate(count=Count('id'))
        
        data = {
            'total_queries': total_queries,
            'successful_queries': successful_queries,
            'average_processing_time': average_processing_time['avg'],
            'user_satisfaction': average_satisfaction['avg'] or 0.0,
            'recent_activity': {item['tool_type']: item['count'] for item in recent_activity}
        }
        
        serializer = AIAnalyticsSerializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def user_activity(self, request):
        """Get current user's activity."""
        user_logs = self.queryset.filter(user=request.user)
        serializer = self.get_serializer(user_logs, many=True)
        return Response(serializer.data)
