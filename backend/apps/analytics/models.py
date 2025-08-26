from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
import uuid

User = get_user_model()


class StudentPerformance(models.Model):
    """Student performance tracking model"""
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='performance_records')
    subject = models.ForeignKey('subjects.Subject', on_delete=models.CASCADE, related_name='performance_records')
    academic_year = models.CharField(max_length=10)
    semester = models.CharField(max_length=20)
    
    # Performance metrics
    attendance_rate = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    average_score = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    total_assignments = models.PositiveIntegerField(default=0)
    completed_assignments = models.PositiveIntegerField(default=0)
    exam_scores = models.JSONField(default=list)  # List of exam scores
    participation_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Predictions and insights
    predicted_grade = models.CharField(max_length=2, blank=True)
    risk_level = models.CharField(max_length=20, choices=[
        ('low', _('Low Risk')),
        ('medium', _('Medium Risk')),
        ('high', _('High Risk')),
    ], default='low')
    improvement_areas = models.JSONField(default=list)
    recommendations = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Student Performance")
        verbose_name_plural = _("Student Performances")
        unique_together = ['student', 'subject', 'academic_year', 'semester']
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.student} - {self.subject} ({self.academic_year})"

    @property
    def assignment_completion_rate(self):
        if self.total_assignments == 0:
            return 0
        return (self.completed_assignments / self.total_assignments) * 100

    @property
    def overall_performance_score(self):
        """Calculate overall performance score"""
        weights = {
            'attendance': 0.2,
            'assignments': 0.3,
            'exams': 0.4,
            'participation': 0.1
        }
        
        attendance_score = self.attendance_rate
        assignment_score = self.assignment_completion_rate
        exam_score = sum(self.exam_scores) / len(self.exam_scores) if self.exam_scores else 0
        participation_score = self.participation_score
        
        overall = (
            attendance_score * weights['attendance'] +
            assignment_score * weights['assignments'] +
            exam_score * weights['exams'] +
            participation_score * weights['participation']
        )
        
        return round(overall, 2)


class AttendanceAnalytics(models.Model):
    """Attendance analytics model"""
    class_room = models.ForeignKey('classes.Class', on_delete=models.CASCADE, related_name='attendance_analytics')
    date = models.DateField()
    
    # Attendance metrics
    total_students = models.PositiveIntegerField()
    present_count = models.PositiveIntegerField()
    absent_count = models.PositiveIntegerField()
    late_count = models.PositiveIntegerField(default=0)
    excused_count = models.PositiveIntegerField(default=0)
    
    # Calculated fields
    attendance_rate = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    absence_rate = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Trends and patterns
    trend_direction = models.CharField(max_length=10, choices=[
        ('improving', _('Improving')),
        ('declining', _('Declining')),
        ('stable', _('Stable')),
    ], default='stable')
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Attendance Analytics")
        verbose_name_plural = _("Attendance Analytics")
        unique_together = ['class_room', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.class_room} - {self.date} ({self.attendance_rate}%)"

    def save(self, *args, **kwargs):
        if self.total_students > 0:
            self.attendance_rate = (self.present_count / self.total_students) * 100
            self.absence_rate = (self.absent_count / self.total_students) * 100
        super().save(*args, **kwargs)


class ExamAnalytics(models.Model):
    """Exam analytics model"""
    exam = models.ForeignKey('exams.Exam', on_delete=models.CASCADE, related_name='analytics')
    
    # Performance metrics
    total_students = models.PositiveIntegerField()
    average_score = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    highest_score = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    lowest_score = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    median_score = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Grade distribution
    grade_distribution = models.JSONField(default=dict)  # {'A': 10, 'B': 15, ...}
    pass_rate = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Question analysis
    question_analysis = models.JSONField(default=list)  # List of question performance data
    time_analysis = models.JSONField(default=dict)  # Time spent analysis
    
    # Insights
    difficulty_level = models.CharField(max_length=20, choices=[
        ('easy', _('Easy')),
        ('medium', _('Medium')),
        ('hard', _('Hard')),
    ], default='medium')
    
    recommendations = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Exam Analytics")
        verbose_name_plural = _("Exam Analytics")
        unique_together = ['exam']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.exam.title} - {self.average_score}%"


class SystemUsage(models.Model):
    """System usage tracking model"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='usage_records')
    session_id = models.CharField(max_length=100)
    
    # Usage metrics
    login_time = models.DateTimeField()
    logout_time = models.DateTimeField(null=True, blank=True)
    session_duration = models.PositiveIntegerField(default=0)  # in seconds
    
    # Activity tracking
    pages_visited = models.JSONField(default=list)
    actions_performed = models.JSONField(default=list)
    features_used = models.JSONField(default=list)
    
    # Device and browser info
    user_agent = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device_type = models.CharField(max_length=20, choices=[
        ('desktop', _('Desktop')),
        ('tablet', _('Tablet')),
        ('mobile', _('Mobile')),
    ], default='desktop')
    
    # Performance metrics
    page_load_times = models.JSONField(default=dict)
    errors_encountered = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("System Usage")
        verbose_name_plural = _("System Usage")
        ordering = ['-login_time']

    def __str__(self):
        return f"{self.user} - {self.login_time.strftime('%Y-%m-%d %H:%M')}"

    def calculate_session_duration(self):
        """Calculate session duration in seconds"""
        if self.logout_time and self.login_time:
            duration = self.logout_time - self.login_time
            return int(duration.total_seconds())
        return 0


class LearningAnalytics(models.Model):
    """Learning analytics model"""
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='learning_analytics')
    subject = models.ForeignKey('subjects.Subject', on_delete=models.CASCADE, related_name='learning_analytics')
    
    # Learning metrics
    study_time = models.PositiveIntegerField(default=0)  # in minutes
    resources_accessed = models.JSONField(default=list)
    learning_path_progress = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Engagement metrics
    engagement_score = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    participation_level = models.CharField(max_length=20, choices=[
        ('low', _('Low')),
        ('medium', _('Medium')),
        ('high', _('High')),
    ], default='medium')
    
    # Learning style analysis
    learning_style = models.CharField(max_length=20, choices=[
        ('visual', _('Visual')),
        ('auditory', _('Auditory')),
        ('kinesthetic', _('Kinesthetic')),
        ('reading', _('Reading/Writing')),
    ], default='visual')
    
    # Progress tracking
    skill_levels = models.JSONField(default=dict)  # Skill proficiency levels
    knowledge_gaps = models.JSONField(default=list)
    learning_objectives = models.JSONField(default=list)
    
    # Recommendations
    recommended_resources = models.JSONField(default=list)
    study_suggestions = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Learning Analytics")
        verbose_name_plural = _("Learning Analytics")
        unique_together = ['student', 'subject']
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.student} - {self.subject}"


class PredictiveAnalytics(models.Model):
    """Predictive analytics model"""
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='predictive_analytics')
    
    # Predictions
    predicted_gpa = models.DecimalField(max_digits=3, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(4)])
    graduation_probability = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    dropout_risk = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Career predictions
    career_recommendations = models.JSONField(default=list)
    skill_gaps = models.JSONField(default=list)
    development_areas = models.JSONField(default=list)
    
    # Academic predictions
    course_recommendations = models.JSONField(default=list)
    subject_performance_predictions = models.JSONField(default=dict)
    
    # Intervention recommendations
    intervention_needed = models.BooleanField(default=False)
    intervention_type = models.CharField(max_length=50, blank=True)
    intervention_priority = models.CharField(max_length=20, choices=[
        ('low', _('Low')),
        ('medium', _('Medium')),
        ('high', _('High')),
        ('critical', _('Critical')),
    ], default='low')
    
    # Model metadata
    model_version = models.CharField(max_length=20, default='1.0')
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Predictive Analytics")
        verbose_name_plural = _("Predictive Analytics")
        unique_together = ['student']
        ordering = ['-last_updated']

    def __str__(self):
        return f"{self.student} - GPA: {self.predicted_gpa}"


class AnalyticsDashboard(models.Model):
    """Analytics dashboard configuration model"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    # Dashboard configuration
    widgets = models.JSONField(default=list)  # List of widget configurations
    layout = models.JSONField(default=dict)  # Dashboard layout configuration
    filters = models.JSONField(default=dict)  # Default filters
    
    # Access control
    is_public = models.BooleanField(default=False)
    allowed_users = models.ManyToManyField(User, blank=True, related_name='accessible_dashboards')
    allowed_roles = models.JSONField(default=list)  # List of allowed roles
    
    # Settings
    refresh_interval = models.PositiveIntegerField(default=300)  # in seconds
    auto_refresh = models.BooleanField(default=True)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_analytics_dashboards')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Analytics Dashboard")
        verbose_name_plural = _("Analytics Dashboards")
        ordering = ['-created_at']

    def __str__(self):
        return self.name
