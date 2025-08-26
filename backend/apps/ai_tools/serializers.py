from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import json

from .models import (
    AIModel, AIQuizGenerator, AIQuestion, AILessonSummarizer, AIPerformancePredictor,
    AIAttendanceAnomalyDetector, AINaturalLanguageQuery, AITrainingJob, AIDataSource, AIUsageLog
)

User = get_user_model()


# Use UserSerializer from accounts app instead
from apps.accounts.serializers import UserSerializer


class AIModelSerializer(serializers.ModelSerializer):
    """Serializer for AIModel."""
    
    created_by = UserSerializer(read_only=True)
    shared_with = UserSerializer(many=True, read_only=True)
    
    class Meta:
        model = AIModel
        fields = [
            'id', 'name', 'description', 'model_type', 'version',
            'model_config', 'hyperparameters', 'model_path', 'accuracy',
            'precision', 'recall', 'f1_score', 'status', 'is_active',
            'last_trained', 'training_duration', 'created_by', 'shared_with',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_model_config(self, value):
        """Validate model configuration JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Model configuration must be a valid JSON object.")
        return value
    
    def validate_hyperparameters(self, value):
        """Validate hyperparameters JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Hyperparameters must be a valid JSON object.")
        return value


class AIModelCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating AIModel with sharing."""
    
    shared_with_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = AIModel
        fields = [
            'id', 'name', 'description', 'model_type', 'version',
            'model_config', 'hyperparameters', 'model_path', 'status',
            'is_active', 'shared_with_ids'
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        shared_with_ids = validated_data.pop('shared_with_ids', [])
        model = super().create(validated_data)
        
        # Share with users
        if shared_with_ids:
            users = User.objects.filter(id__in=shared_with_ids)
            model.shared_with.set(users)
        
        return model


class AIQuizGeneratorSerializer(serializers.ModelSerializer):
    """Serializer for AIQuizGenerator."""
    
    subject = serializers.StringRelatedField()
    ai_model = AIModelSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    shared_with = UserSerializer(many=True, read_only=True)
    question_count_display = serializers.SerializerMethodField()
    
    class Meta:
        model = AIQuizGenerator
        fields = [
            'id', 'title', 'description', 'subject', 'syllabus_topic',
            'content_source', 'difficulty', 'question_count', 'time_limit',
            'ai_model', 'generation_params', 'is_generated', 'generation_status',
            'generated_at', 'created_by', 'shared_with', 'created_at', 'updated_at',
            'question_count_display'
        ]
        read_only_fields = ['id', 'generated_at', 'created_at', 'updated_at']
    
    def get_question_count_display(self, obj):
        """Get the actual number of questions generated."""
        return obj.questions.count()
    
    def validate_generation_params(self, value):
        """Validate generation parameters JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Generation parameters must be a valid JSON object.")
        return value


class AIQuizGeneratorCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating AIQuizGenerator with sharing."""
    
    shared_with_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = AIQuizGenerator
        fields = [
            'id', 'title', 'description', 'subject', 'syllabus_topic',
            'content_source', 'difficulty', 'question_count', 'time_limit',
            'ai_model', 'generation_params', 'shared_with_ids'
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        shared_with_ids = validated_data.pop('shared_with_ids', [])
        quiz = super().create(validated_data)
        
        # Share with users
        if shared_with_ids:
            users = User.objects.filter(id__in=shared_with_ids)
            quiz.shared_with.set(users)
        
        return quiz


class AIQuestionSerializer(serializers.ModelSerializer):
    """Serializer for AIQuestion."""
    
    quiz = AIQuizGeneratorSerializer(read_only=True)
    ai_model = AIModelSerializer(read_only=True)
    confidence_score_display = serializers.SerializerMethodField()
    
    class Meta:
        model = AIQuestion
        fields = [
            'id', 'quiz', 'question_text', 'question_type', 'difficulty',
            'options', 'correct_answer', 'explanation', 'points', 'order',
            'ai_model', 'confidence_score', 'created_at', 'updated_at',
            'confidence_score_display'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_confidence_score_display(self, obj):
        """Get confidence score as percentage."""
        if obj.confidence_score:
            return f"{obj.confidence_score:.1%}"
        return None
    
    def validate_options(self, value):
        """Validate options JSON."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Options must be a valid JSON array.")
        return value


class AILessonSummarizerSerializer(serializers.ModelSerializer):
    """Serializer for AILessonSummarizer."""
    
    lesson = serializers.StringRelatedField()
    subject = serializers.StringRelatedField()
    ai_model = AIModelSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    shared_with = UserSerializer(many=True, read_only=True)
    readability_score_display = serializers.SerializerMethodField()
    
    class Meta:
        model = AILessonSummarizer
        fields = [
            'id', 'title', 'lesson', 'subject', 'summary_type', 'summary_content',
            'key_points', 'vocabulary', 'ai_model', 'generation_params',
            'readability_score', 'coherence_score', 'is_generated', 'generation_status',
            'generated_at', 'created_by', 'shared_with', 'created_at', 'updated_at',
            'readability_score_display'
        ]
        read_only_fields = ['id', 'generated_at', 'created_at', 'updated_at']
    
    def get_readability_score_display(self, obj):
        """Get readability score as percentage."""
        if obj.readability_score:
            return f"{obj.readability_score:.1%}"
        return None
    
    def validate_key_points(self, value):
        """Validate key points JSON."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Key points must be a valid JSON array.")
        return value
    
    def validate_vocabulary(self, value):
        """Validate vocabulary JSON."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Vocabulary must be a valid JSON array.")
        return value


class AIPerformancePredictorSerializer(serializers.ModelSerializer):
    """Serializer for AIPerformancePredictor."""
    
    student = serializers.StringRelatedField()
    subject = serializers.StringRelatedField()
    ai_model = AIModelSerializer(read_only=True)
    confidence_score_display = serializers.SerializerMethodField()
    predicted_value_display = serializers.SerializerMethodField()
    
    class Meta:
        model = AIPerformancePredictor
        fields = [
            'id', 'student', 'subject', 'prediction_type', 'predicted_value',
            'confidence_level', 'confidence_score', 'input_features', 'feature_importance',
            'ai_model', 'generation_params', 'recommendations', 'intervention_needed',
            'intervention_urgency', 'actual_value', 'prediction_accuracy',
            'academic_year', 'semester', 'created_at', 'updated_at',
            'confidence_score_display', 'predicted_value_display'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_confidence_score_display(self, obj):
        """Get confidence score as percentage."""
        if obj.confidence_score:
            return f"{obj.confidence_score:.1%}"
        return None
    
    def get_predicted_value_display(self, obj):
        """Get predicted value with appropriate formatting."""
        if obj.prediction_type in ['exam_score', 'course_grade']:
            return f"{obj.predicted_value:.1f}%"
        elif obj.prediction_type in ['attendance_risk', 'dropout_risk']:
            return f"{obj.predicted_value:.1%}"
        return str(obj.predicted_value)
    
    def validate_input_features(self, value):
        """Validate input features JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Input features must be a valid JSON object.")
        return value
    
    def validate_feature_importance(self, value):
        """Validate feature importance JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Feature importance must be a valid JSON object.")
        return value
    
    def validate_recommendations(self, value):
        """Validate recommendations JSON."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Recommendations must be a valid JSON array.")
        return value


class AIAttendanceAnomalyDetectorSerializer(serializers.ModelSerializer):
    """Serializer for AIAttendanceAnomalyDetector."""
    
    student = serializers.StringRelatedField()
    class_section = serializers.StringRelatedField()
    ai_model = AIModelSerializer(read_only=True)
    attendance_rate_display = serializers.SerializerMethodField()
    deviation_display = serializers.SerializerMethodField()
    
    class Meta:
        model = AIAttendanceAnomalyDetector
        fields = [
            'id', 'student', 'class_section', 'anomaly_type', 'severity',
            'confidence_score', 'detection_date', 'attendance_rate', 'historical_average',
            'deviation', 'contributing_factors', 'pattern_analysis', 'peer_comparison',
            'ai_model', 'detection_params', 'recommendations', 'intervention_needed',
            'intervention_actions', 'is_resolved', 'resolution_date', 'resolution_notes',
            'created_at', 'updated_at', 'attendance_rate_display', 'deviation_display'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_attendance_rate_display(self, obj):
        """Get attendance rate as percentage."""
        return f"{obj.attendance_rate:.1f}%"
    
    def get_deviation_display(self, obj):
        """Get deviation as percentage."""
        return f"{obj.deviation:+.1f}%"
    
    def validate_contributing_factors(self, value):
        """Validate contributing factors JSON."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Contributing factors must be a valid JSON array.")
        return value
    
    def validate_pattern_analysis(self, value):
        """Validate pattern analysis JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Pattern analysis must be a valid JSON object.")
        return value
    
    def validate_peer_comparison(self, value):
        """Validate peer comparison JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Peer comparison must be a valid JSON object.")
        return value
    
    def validate_recommendations(self, value):
        """Validate recommendations JSON."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Recommendations must be a valid JSON array.")
        return value
    
    def validate_intervention_actions(self, value):
        """Validate intervention actions JSON."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Intervention actions must be a valid JSON array.")
        return value


class AINaturalLanguageQuerySerializer(serializers.ModelSerializer):
    """Serializer for AINaturalLanguageQuery."""
    
    user = UserSerializer(read_only=True)
    ai_model = AIModelSerializer(read_only=True)
    processing_time_display = serializers.SerializerMethodField()
    confidence_score_display = serializers.SerializerMethodField()
    
    class Meta:
        model = AINaturalLanguageQuery
        fields = [
            'id', 'user', 'query_text', 'query_type', 'intent', 'processed_query',
            'sql_query', 'parameters', 'result_data', 'result_summary', 'visualization_config',
            'ai_model', 'processing_params', 'processing_time', 'confidence_score',
            'accuracy_score', 'status', 'error_message', 'user_rating', 'user_feedback',
            'created_at', 'updated_at', 'processing_time_display', 'confidence_score_display'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_processing_time_display(self, obj):
        """Get processing time in human-readable format."""
        if obj.processing_time:
            return str(obj.processing_time).split('.')[0]
        return None
    
    def get_confidence_score_display(self, obj):
        """Get confidence score as percentage."""
        if obj.confidence_score:
            return f"{obj.confidence_score:.1%}"
        return None
    
    def validate_processed_query(self, value):
        """Validate processed query JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Processed query must be a valid JSON object.")
        return value
    
    def validate_parameters(self, value):
        """Validate parameters JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Parameters must be a valid JSON object.")
        return value
    
    def validate_result_data(self, value):
        """Validate result data JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Result data must be a valid JSON object.")
        return value
    
    def validate_visualization_config(self, value):
        """Validate visualization config JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Visualization config must be a valid JSON object.")
        return value


class AITrainingJobSerializer(serializers.ModelSerializer):
    """Serializer for AITrainingJob."""
    
    ai_model = AIModelSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    progress_display = serializers.SerializerMethodField()
    duration_display = serializers.SerializerMethodField()
    
    class Meta:
        model = AITrainingJob
        fields = [
            'id', 'name', 'description', 'ai_model', 'training_config', 'dataset_config',
            'status', 'progress', 'current_epoch', 'total_epochs', 'training_metrics',
            'validation_metrics', 'final_metrics', 'started_at', 'completed_at', 'duration',
            'gpu_usage', 'memory_usage', 'error_message', 'logs', 'created_by',
            'created_at', 'updated_at', 'progress_display', 'duration_display'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at', 'duration', 'created_at', 'updated_at']
    
    def get_progress_display(self, obj):
        """Get progress as percentage."""
        return f"{obj.progress}%"
    
    def get_duration_display(self, obj):
        """Get duration in human-readable format."""
        if obj.duration:
            return str(obj.duration).split('.')[0]
        return None
    
    def validate_training_config(self, value):
        """Validate training config JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Training config must be a valid JSON object.")
        return value
    
    def validate_dataset_config(self, value):
        """Validate dataset config JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Dataset config must be a valid JSON object.")
        return value
    
    def validate_training_metrics(self, value):
        """Validate training metrics JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Training metrics must be a valid JSON object.")
        return value
    
    def validate_validation_metrics(self, value):
        """Validate validation metrics JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Validation metrics must be a valid JSON object.")
        return value
    
    def validate_final_metrics(self, value):
        """Validate final metrics JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Final metrics must be a valid JSON object.")
        return value


class AIDataSourceSerializer(serializers.ModelSerializer):
    """Serializer for AIDataSource."""
    
    created_by = UserSerializer(read_only=True)
    shared_with = UserSerializer(many=True, read_only=True)
    data_quality_score_display = serializers.SerializerMethodField()
    
    class Meta:
        model = AIDataSource
        fields = [
            'id', 'name', 'description', 'source_type', 'connection_config',
            'schema_config', 'data_quality_score', 'last_updated', 'record_count',
            'is_active', 'created_by', 'shared_with', 'created_at', 'updated_at',
            'data_quality_score_display'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_data_quality_score_display(self, obj):
        """Get data quality score as percentage."""
        if obj.data_quality_score:
            return f"{obj.data_quality_score:.1%}"
        return None
    
    def validate_connection_config(self, value):
        """Validate connection config JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Connection config must be a valid JSON object.")
        return value
    
    def validate_schema_config(self, value):
        """Validate schema config JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Schema config must be a valid JSON object.")
        return value


class AIUsageLogSerializer(serializers.ModelSerializer):
    """Serializer for AIUsageLog."""
    
    user = UserSerializer(read_only=True)
    ai_model = AIModelSerializer(read_only=True)
    processing_time_display = serializers.SerializerMethodField()
    
    class Meta:
        model = AIUsageLog
        fields = [
            'id', 'user', 'tool_type', 'input_data', 'output_data', 'processing_time',
            'success', 'error_message', 'user_satisfaction', 'ai_model', 'model_version',
            'ip_address', 'user_agent', 'session_id', 'timestamp', 'processing_time_display'
        ]
        read_only_fields = ['id', 'timestamp']
    
    def get_processing_time_display(self, obj):
        """Get processing time in human-readable format."""
        if obj.processing_time:
            return str(obj.processing_time).split('.')[0]
        return None
    
    def validate_input_data(self, value):
        """Validate input data JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Input data must be a valid JSON object.")
        return value
    
    def validate_output_data(self, value):
        """Validate output data JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Output data must be a valid JSON object.")
        return value


# Specialized serializers for specific actions
class QuizGenerationSerializer(serializers.Serializer):
    """Serializer for quiz generation requests."""
    
    subject_id = serializers.IntegerField()
    syllabus_topic = serializers.CharField(required=False, allow_blank=True)
    content_source = serializers.CharField()
    difficulty = serializers.ChoiceField(choices=AIQuizGenerator.DIFFICULTY_CHOICES, default='medium')
    question_count = serializers.IntegerField(min_value=1, max_value=50, default=10)
    time_limit = serializers.IntegerField(min_value=5, max_value=180, default=30)
    ai_model_id = serializers.UUIDField(required=False, allow_null=True)
    
    def validate_content_source(self, value):
        """Validate content source is not empty."""
        if not value.strip():
            raise serializers.ValidationError("Content source cannot be empty.")
        return value


class LessonSummarizationSerializer(serializers.Serializer):
    """Serializer for lesson summarization requests."""
    
    lesson_id = serializers.IntegerField()
    summary_type = serializers.ChoiceField(choices=AILessonSummarizer.SUMMARY_TYPES, default='detailed')
    ai_model_id = serializers.UUIDField(required=False, allow_null=True)
    
    def validate_lesson_id(self, value):
        """Validate lesson exists."""
        from apps.academics.models import Lesson
        try:
            Lesson.objects.get(id=value)
        except Lesson.DoesNotExist:
            raise serializers.ValidationError("Lesson does not exist.")
        return value


class PerformancePredictionSerializer(serializers.Serializer):
    """Serializer for performance prediction requests."""
    
    student_id = serializers.IntegerField()
    subject_id = serializers.IntegerField(required=False, allow_null=True)
    prediction_type = serializers.ChoiceField(choices=AIPerformancePredictor.PREDICTION_TYPES)
    ai_model_id = serializers.UUIDField(required=False, allow_null=True)
    
    def validate_student_id(self, value):
        """Validate student exists."""
        from apps.students.models import Student
        try:
            Student.objects.get(id=value)
        except Student.DoesNotExist:
            raise serializers.ValidationError("Student does not exist.")
        return value


class NaturalLanguageQuerySerializer(serializers.Serializer):
    """Serializer for natural language query requests."""
    
    query_text = serializers.CharField()
    query_type = serializers.ChoiceField(choices=AINaturalLanguageQuery.QUERY_TYPES, default='general')
    ai_model_id = serializers.UUIDField(required=False, allow_null=True)
    
    def validate_query_text(self, value):
        """Validate query text is not empty."""
        if not value.strip():
            raise serializers.ValidationError("Query text cannot be empty.")
        return value


class TrainingJobCreateSerializer(serializers.Serializer):
    """Serializer for creating training jobs."""
    
    ai_model_id = serializers.UUIDField()
    name = serializers.CharField(max_length=200)
    description = serializers.CharField(required=False, allow_blank=True)
    training_config = serializers.JSONField(default=dict)
    dataset_config = serializers.JSONField(default=dict)
    
    def validate_ai_model_id(self, value):
        """Validate AI model exists."""
        try:
            AIModel.objects.get(id=value)
        except AIModel.DoesNotExist:
            raise serializers.ValidationError("AI model does not exist.")
        return value
    
    def validate_training_config(self, value):
        """Validate training config JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Training config must be a valid JSON object.")
        return value
    
    def validate_dataset_config(self, value):
        """Validate dataset config JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Dataset config must be a valid JSON object.")
        return value


class AIAnalyticsSerializer(serializers.Serializer):
    """Serializer for AI analytics data."""
    
    total_models = serializers.IntegerField()
    active_models = serializers.IntegerField()
    models_by_type = serializers.DictField()
    average_accuracy = serializers.FloatField()
    total_queries = serializers.IntegerField()
    successful_queries = serializers.IntegerField()
    average_processing_time = serializers.DurationField()
    user_satisfaction = serializers.FloatField()
    recent_activity = serializers.ListField()
    
    class Meta:
        fields = [
            'total_models', 'active_models', 'models_by_type', 'average_accuracy',
            'total_queries', 'successful_queries', 'average_processing_time',
            'user_satisfaction', 'recent_activity'
        ]
