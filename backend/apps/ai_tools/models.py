from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import FileExtensionValidator
from django.utils import timezone
import uuid
import json

User = get_user_model()


class AIModel(models.Model):
    """
    Model for managing AI models and their configurations.
    """
    MODEL_TYPES = [
        ('quiz_generator', 'Quiz Generator'),
        ('summarizer', 'Text Summarizer'),
        ('predictor', 'Performance Predictor'),
        ('anomaly_detector', 'Anomaly Detector'),
        ('nlq', 'Natural Language Query'),
        ('custom', 'Custom Model'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('training', 'Training'),
        ('inactive', 'Inactive'),
        ('error', 'Error'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    model_type = models.CharField(max_length=30, choices=MODEL_TYPES)
    version = models.CharField(max_length=50, default='1.0.0')
    
    # Model configuration
    model_config = models.JSONField(default=dict, help_text="Model configuration parameters")
    hyperparameters = models.JSONField(default=dict, help_text="Training hyperparameters")
    model_path = models.CharField(max_length=500, blank=True, help_text="Path to the model file")
    
    # Performance metrics
    accuracy = models.FloatField(null=True, blank=True, help_text="Model accuracy score")
    precision = models.FloatField(null=True, blank=True, help_text="Model precision score")
    recall = models.FloatField(null=True, blank=True, help_text="Model recall score")
    f1_score = models.FloatField(null=True, blank=True, help_text="Model F1 score")
    
    # Status and tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inactive')
    is_active = models.BooleanField(default=False)
    last_trained = models.DateTimeField(null=True, blank=True)
    training_duration = models.DurationField(null=True, blank=True)
    
    # Access control
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_ai_models')
    shared_with = models.ManyToManyField(User, blank=True, related_name='shared_ai_models')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'AI Model'
        verbose_name_plural = 'AI Models'
    
    def __str__(self):
        return f"{self.name} v{self.version} ({self.get_model_type_display()})"


class AIQuizGenerator(models.Model):
    """
    Model for AI-generated quizzes and questions.
    """
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
        ('expert', 'Expert'),
    ]
    
    QUESTION_TYPES = [
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer'),
        ('essay', 'Essay'),
        ('matching', 'Matching'),
        ('fill_blank', 'Fill in the Blank'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Source content
    subject = models.ForeignKey('subjects.Subject', on_delete=models.CASCADE, related_name='ai_quizzes')
    syllabus_topic = models.CharField(max_length=200, blank=True)
    content_source = models.TextField(help_text="Source content for quiz generation")
    
    # Quiz configuration
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='medium')
    question_count = models.IntegerField(default=10)
    time_limit = models.IntegerField(default=30, help_text="Time limit in minutes")
    
    # Generation parameters
    ai_model = models.ForeignKey(AIModel, on_delete=models.SET_NULL, null=True, blank=True, related_name='generated_quizzes')
    generation_params = models.JSONField(default=dict, help_text="Parameters used for quiz generation")
    
    # Status and tracking
    is_generated = models.BooleanField(default=False)
    generation_status = models.CharField(max_length=20, choices=AIModel.STATUS_CHOICES, default='inactive')
    generated_at = models.DateTimeField(null=True, blank=True)
    
    # Access control
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_quizzes')
    shared_with = models.ManyToManyField(User, blank=True, related_name='shared_quizzes')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'AI Quiz Generator'
        verbose_name_plural = 'AI Quiz Generators'
    
    def __str__(self):
        return f"{self.title} - {self.subject.name}"


class AIQuestion(models.Model):
    """
    Model for individual AI-generated questions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(AIQuizGenerator, on_delete=models.CASCADE, related_name='questions')
    
    # Question content
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=AIQuizGenerator.QUESTION_TYPES)
    difficulty = models.CharField(max_length=20, choices=AIQuizGenerator.DIFFICULTY_CHOICES)
    
    # Options and answers
    options = models.JSONField(default=list, help_text="Multiple choice options")
    correct_answer = models.TextField(help_text="Correct answer or answer key")
    explanation = models.TextField(blank=True, help_text="Explanation for the correct answer")
    
    # Metadata
    points = models.IntegerField(default=1, help_text="Points for this question")
    order = models.IntegerField(default=0, help_text="Question order in quiz")
    
    # AI generation info
    ai_model = models.ForeignKey(AIModel, on_delete=models.SET_NULL, null=True, blank=True)
    confidence_score = models.FloatField(null=True, blank=True, help_text="AI confidence in this question")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'AI Question'
        verbose_name_plural = 'AI Questions'
    
    def __str__(self):
        return f"Question {self.order}: {self.question_text[:50]}..."


class AILessonSummarizer(models.Model):
    """
    Model for AI-generated lesson summaries.
    """
    SUMMARY_TYPES = [
        ('brief', 'Brief Summary'),
        ('detailed', 'Detailed Summary'),
        ('key_points', 'Key Points'),
        ('outline', 'Lesson Outline'),
        ('custom', 'Custom Format'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    
    # Source lesson
    lesson = models.ForeignKey('academics.Lesson', on_delete=models.CASCADE, related_name='ai_summaries')
    subject = models.ForeignKey('subjects.Subject', on_delete=models.CASCADE, related_name='ai_summaries')
    
    # Summary content
    summary_type = models.CharField(max_length=20, choices=SUMMARY_TYPES, default='detailed')
    summary_content = models.TextField()
    key_points = models.JSONField(default=list, help_text="List of key points from the lesson")
    vocabulary = models.JSONField(default=list, help_text="Important vocabulary terms")
    
    # Generation parameters
    ai_model = models.ForeignKey(AIModel, on_delete=models.SET_NULL, null=True, blank=True, related_name='generated_summaries')
    generation_params = models.JSONField(default=dict, help_text="Parameters used for summary generation")
    
    # Quality metrics
    readability_score = models.FloatField(null=True, blank=True, help_text="Readability score of the summary")
    coherence_score = models.FloatField(null=True, blank=True, help_text="Coherence score of the summary")
    
    # Status and tracking
    is_generated = models.BooleanField(default=False)
    generation_status = models.CharField(max_length=20, choices=AIModel.STATUS_CHOICES, default='inactive')
    generated_at = models.DateTimeField(null=True, blank=True)
    
    # Access control
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_summaries')
    shared_with = models.ManyToManyField(User, blank=True, related_name='shared_summaries')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'AI Lesson Summarizer'
        verbose_name_plural = 'AI Lesson Summarizers'
    
    def __str__(self):
        return f"{self.title} - {self.lesson.title}"


class AIPerformancePredictor(models.Model):
    """
    Model for AI-based student performance prediction.
    """
    PREDICTION_TYPES = [
        ('exam_score', 'Exam Score'),
        ('course_grade', 'Course Grade'),
        ('attendance_risk', 'Attendance Risk'),
        ('dropout_risk', 'Dropout Risk'),
        ('career_path', 'Career Path'),
        ('learning_style', 'Learning Style'),
    ]
    
    CONFIDENCE_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('very_high', 'Very High'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='ai_predictions')
    subject = models.ForeignKey('subjects.Subject', on_delete=models.CASCADE, related_name='ai_predictions', null=True, blank=True)
    
    # Prediction details
    prediction_type = models.CharField(max_length=20, choices=PREDICTION_TYPES)
    predicted_value = models.FloatField(help_text="Predicted score or probability")
    confidence_level = models.CharField(max_length=20, choices=CONFIDENCE_LEVELS)
    confidence_score = models.FloatField(help_text="Confidence score (0-1)")
    
    # Input features
    input_features = models.JSONField(default=dict, help_text="Features used for prediction")
    feature_importance = models.JSONField(default=dict, help_text="Feature importance scores")
    
    # Model and generation
    ai_model = models.ForeignKey(AIModel, on_delete=models.SET_NULL, null=True, blank=True, related_name='performance_predictions')
    generation_params = models.JSONField(default=dict, help_text="Parameters used for prediction")
    
    # Recommendations
    recommendations = models.JSONField(default=list, help_text="AI-generated recommendations")
    intervention_needed = models.BooleanField(default=False)
    intervention_urgency = models.CharField(max_length=20, choices=CONFIDENCE_LEVELS, default='medium')
    
    # Validation
    actual_value = models.FloatField(null=True, blank=True, help_text="Actual value when available")
    prediction_accuracy = models.FloatField(null=True, blank=True, help_text="Accuracy of prediction")
    
    # Metadata
    academic_year = models.IntegerField(default=lambda: timezone.now().year)
    semester = models.CharField(max_length=10, default='1')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'AI Performance Predictor'
        verbose_name_plural = 'AI Performance Predictors'
    
    def __str__(self):
        return f"{self.student.full_name} - {self.get_prediction_type_display()}"


class AIAttendanceAnomalyDetector(models.Model):
    """
    Model for AI-based attendance anomaly detection.
    """
    ANOMALY_TYPES = [
        ('sudden_drop', 'Sudden Drop'),
        ('pattern_change', 'Pattern Change'),
        ('seasonal_variation', 'Seasonal Variation'),
        ('peer_comparison', 'Peer Comparison'),
        ('external_factors', 'External Factors'),
    ]
    
    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='attendance_anomalies')
    class_enrolled = models.ForeignKey('classes.Class', on_delete=models.CASCADE, related_name='attendance_anomalies')
    
    # Anomaly details
    anomaly_type = models.CharField(max_length=20, choices=ANOMALY_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS)
    confidence_score = models.FloatField(help_text="Confidence in anomaly detection (0-1)")
    
    # Detection data
    detection_date = models.DateField()
    attendance_rate = models.FloatField(help_text="Current attendance rate")
    historical_average = models.FloatField(help_text="Historical average attendance rate")
    deviation = models.FloatField(help_text="Deviation from historical average")
    
    # Analysis
    contributing_factors = models.JSONField(default=list, help_text="Factors contributing to the anomaly")
    pattern_analysis = models.JSONField(default=dict, help_text="Pattern analysis data")
    peer_comparison = models.JSONField(default=dict, help_text="Comparison with peer group")
    
    # Model and generation
    ai_model = models.ForeignKey(AIModel, on_delete=models.SET_NULL, null=True, blank=True, related_name='attendance_anomalies')
    detection_params = models.JSONField(default=dict, help_text="Parameters used for anomaly detection")
    
    # Actions and recommendations
    recommendations = models.JSONField(default=list, help_text="Recommended actions")
    intervention_needed = models.BooleanField(default=False)
    intervention_actions = models.JSONField(default=list, help_text="Specific intervention actions")
    
    # Status tracking
    is_resolved = models.BooleanField(default=False)
    resolution_date = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'AI Attendance Anomaly Detector'
        verbose_name_plural = 'AI Attendance Anomaly Detectors'
    
    def __str__(self):
        return f"{self.student.full_name} - {self.get_anomaly_type_display()} ({self.get_severity_display()})"


class AINaturalLanguageQuery(models.Model):
    """
    Model for natural language query processing and results.
    """
    QUERY_TYPES = [
        ('academic', 'Academic Query'),
        ('attendance', 'Attendance Query'),
        ('financial', 'Financial Query'),
        ('analytics', 'Analytics Query'),
        ('general', 'General Query'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='nlq_queries')
    
    # Query details
    query_text = models.TextField(help_text="Natural language query from user")
    query_type = models.CharField(max_length=20, choices=QUERY_TYPES)
    intent = models.CharField(max_length=100, blank=True, help_text="Detected intent of the query")
    
    # Processing
    processed_query = models.JSONField(default=dict, help_text="Processed query structure")
    sql_query = models.TextField(blank=True, help_text="Generated SQL query")
    parameters = models.JSONField(default=dict, help_text="Query parameters")
    
    # Results
    result_data = models.JSONField(default=dict, help_text="Query results")
    result_summary = models.TextField(blank=True, help_text="Natural language summary of results")
    visualization_config = models.JSONField(default=dict, help_text="Configuration for result visualization")
    
    # Model and processing
    ai_model = models.ForeignKey(AIModel, on_delete=models.SET_NULL, null=True, blank=True, related_name='nlq_queries')
    processing_params = models.JSONField(default=dict, help_text="Parameters used for query processing")
    
    # Performance metrics
    processing_time = models.DurationField(null=True, blank=True)
    confidence_score = models.FloatField(null=True, blank=True)
    accuracy_score = models.FloatField(null=True, blank=True)
    
    # Status and tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(blank=True, help_text="Error message if processing failed")
    
    # User feedback
    user_rating = models.IntegerField(null=True, blank=True, help_text="User rating (1-5)")
    user_feedback = models.TextField(blank=True, help_text="User feedback on results")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'AI Natural Language Query'
        verbose_name_plural = 'AI Natural Language Queries'
    
    def __str__(self):
        return f"{self.user.username}: {self.query_text[:50]}..."


class AITrainingJob(models.Model):
    """
    Model for managing AI model training jobs.
    """
    JOB_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Model and configuration
    ai_model = models.ForeignKey(AIModel, on_delete=models.CASCADE, related_name='training_jobs')
    training_config = models.JSONField(default=dict, help_text="Training configuration")
    dataset_config = models.JSONField(default=dict, help_text="Dataset configuration")
    
    # Job tracking
    status = models.CharField(max_length=20, choices=JOB_STATUS_CHOICES, default='pending')
    progress = models.IntegerField(default=0, help_text="Training progress percentage")
    current_epoch = models.IntegerField(default=0)
    total_epochs = models.IntegerField(default=0)
    
    # Performance metrics
    training_metrics = models.JSONField(default=dict, help_text="Training metrics over time")
    validation_metrics = models.JSONField(default=dict, help_text="Validation metrics over time")
    final_metrics = models.JSONField(default=dict, help_text="Final model metrics")
    
    # Timing
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    duration = models.DurationField(null=True, blank=True)
    
    # Resources
    gpu_usage = models.FloatField(null=True, blank=True, help_text="GPU usage percentage")
    memory_usage = models.FloatField(null=True, blank=True, help_text="Memory usage in GB")
    
    # Error handling
    error_message = models.TextField(blank=True, help_text="Error message if training failed")
    logs = models.TextField(blank=True, help_text="Training logs")
    
    # Access control
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_training_jobs')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'AI Training Job'
        verbose_name_plural = 'AI Training Jobs'
    
    def __str__(self):
        return f"{self.name} - {self.ai_model.name} ({self.get_status_display()})"


class AIDataSource(models.Model):
    """
    Model for managing data sources used by AI models.
    """
    SOURCE_TYPES = [
        ('database', 'Database'),
        ('file', 'File'),
        ('api', 'API'),
        ('stream', 'Data Stream'),
        ('external', 'External Service'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES)
    
    # Connection details
    connection_config = models.JSONField(default=dict, help_text="Connection configuration")
    schema_config = models.JSONField(default=dict, help_text="Data schema configuration")
    
    # Data quality
    data_quality_score = models.FloatField(null=True, blank=True, help_text="Data quality score (0-1)")
    last_updated = models.DateTimeField(null=True, blank=True)
    record_count = models.BigIntegerField(null=True, blank=True)
    
    # Access control
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_data_sources')
    shared_with = models.ManyToManyField(User, blank=True, related_name='shared_data_sources')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'AI Data Source'
        verbose_name_plural = 'AI Data Sources'
    
    def __str__(self):
        return f"{self.name} ({self.get_source_type_display()})"


class AIUsageLog(models.Model):
    """
    Model for tracking AI tool usage and performance.
    """
    TOOL_TYPES = [
        ('quiz_generator', 'Quiz Generator'),
        ('summarizer', 'Lesson Summarizer'),
        ('predictor', 'Performance Predictor'),
        ('anomaly_detector', 'Anomaly Detector'),
        ('nlq', 'Natural Language Query'),
        ('custom', 'Custom Tool'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_usage_logs')
    tool_type = models.CharField(max_length=30, choices=TOOL_TYPES)
    
    # Usage details
    input_data = models.JSONField(default=dict, help_text="Input data provided to AI tool")
    output_data = models.JSONField(default=dict, help_text="Output data from AI tool")
    processing_time = models.DurationField(null=True, blank=True)
    
    # Performance metrics
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True, help_text="Error message if failed")
    user_satisfaction = models.IntegerField(null=True, blank=True, help_text="User satisfaction rating (1-5)")
    
    # Model information
    ai_model = models.ForeignKey(AIModel, on_delete=models.SET_NULL, null=True, blank=True)
    model_version = models.CharField(max_length=50, blank=True)
    
    # Context
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    session_id = models.CharField(max_length=100, blank=True)
    
    # Metadata
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'AI Usage Log'
        verbose_name_plural = 'AI Usage Logs'
    
    def __str__(self):
        return f"{self.user.username} - {self.get_tool_type_display()} - {self.timestamp}"

