from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import uuid

User = get_user_model()


class Course(models.Model):
    """Course model for e-learning platform"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    short_description = models.CharField(max_length=300, blank=True)
    thumbnail = models.ImageField(
        upload_to='courses/thumbnails/', blank=True, null=True
    )
    video_intro = models.URLField(blank=True, null=True)
    
    # Course details
    category = models.CharField(max_length=100)
    level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
        ]
    )
    language = models.CharField(max_length=50, default='English')
    
    # Pricing
    price = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.00
    )
    is_free = models.BooleanField(default=True)
    discount_price = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )
    
    # Course structure
    total_lessons = models.PositiveIntegerField(default=0)
    total_duration = models.PositiveIntegerField(default=0)  # in minutes
    total_quizzes = models.PositiveIntegerField(default=0)
    
    # Course status
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=[
            ('draft', 'Draft'),
            ('published', 'Published'),
            ('archived', 'Archived'),
        ],
        default='draft'
    )
    
    # Instructor
    instructor = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='courses_created'
    )
    
    # Learning objectives
    learning_objectives = models.JSONField(default=list, blank=True)
    requirements = models.JSONField(default=list, blank=True)
    target_audience = models.TextField(blank=True)
    
    # Course content
    curriculum = models.JSONField(
        default=list, blank=True
    )  # Structured course content
    
    # Statistics
    enrolled_students = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(
        max_digits=3, decimal_places=2, default=0.00
    )
    total_reviews = models.PositiveIntegerField(default=0)
    completion_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default=0.00
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Course')
        verbose_name_plural = _('Courses')
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.is_published and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)


class Lesson(models.Model):
    """Individual lesson within a course"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    content = models.TextField()  # Rich text content
    video_url = models.URLField(blank=True, null=True)
    video_duration = models.PositiveIntegerField(default=0)  # in seconds
    attachments = models.JSONField(default=list, blank=True)  # List of file URLs
    
    # Lesson order
    order = models.PositiveIntegerField(default=0)
    is_free = models.BooleanField(default=False)
    
    # Lesson type
    lesson_type = models.CharField(max_length=20, choices=[
        ('video', 'Video'),
        ('text', 'Text'),
        ('quiz', 'Quiz'),
        ('assignment', 'Assignment'),
        ('discussion', 'Discussion'),
    ], default='video')
    
    # Completion requirements
    completion_criteria = models.CharField(max_length=20, choices=[
        ('watch', 'Watch Video'),
        ('read', 'Read Content'),
        ('quiz', 'Pass Quiz'),
        ('assignment', 'Submit Assignment'),
    ], default='watch')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']
        unique_together = ['course', 'order']
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Enrollment(models.Model):
    """Student enrollment in a course"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    
    # Enrollment status
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
        ('suspended', 'Suspended'),
    ], default='active')
    
    # Progress tracking
    progress = models.DecimalField(
        max_digits=5, decimal_places=2, default=0.00
    )  # Percentage
    completed_lessons = models.PositiveIntegerField(default=0)
    total_lessons = models.PositiveIntegerField(default=0)
    
    # Time tracking
    time_spent = models.PositiveIntegerField(default=0)  # in minutes
    last_accessed = models.DateTimeField(blank=True, null=True)
    
    # Completion
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    # Payment
    amount_paid = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.00
    )
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('paid', 'Paid'),
            ('failed', 'Failed'),
            ('refunded', 'Refunded'),
        ],
        default='pending'
    )
    
    class Meta:
        unique_together = ['student', 'course']
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.course.title}"


class LessonProgress(models.Model):
    """Individual lesson progress for enrolled students"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='progress')
    
    # Progress status
    status = models.CharField(max_length=20, choices=[
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ], default='not_started')
    
    # Video progress
    video_watched = models.PositiveIntegerField(default=0)  # seconds watched
    video_completed = models.BooleanField(default=False)
    
    # Quiz results
    quiz_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    quiz_attempts = models.PositiveIntegerField(default=0)
    quiz_passed = models.BooleanField(default=False)
    
    # Assignment
    assignment_submitted = models.BooleanField(default=False)
    assignment_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    
    # Timestamps
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    last_accessed = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['enrollment', 'lesson']
    
    def __str__(self):
        return f"{self.enrollment.student.get_full_name()} - {self.lesson.title}"


class Quiz(models.Model):
    """Quiz/Assessment for lessons"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name='quiz')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Quiz settings
    passing_score = models.PositiveIntegerField(default=70)  # percentage
    time_limit = models.PositiveIntegerField(default=0)  # in minutes, 0 = no limit
    max_attempts = models.PositiveIntegerField(default=3)
    shuffle_questions = models.BooleanField(default=True)
    
    # Questions
    questions = models.JSONField(default=list)  # List of question objects
    
    # Statistics
    total_attempts = models.PositiveIntegerField(default=0)
    average_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.lesson.title} - {self.title}"


class QuizAttempt(models.Model):
    """Individual quiz attempt by a student"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    
    # Attempt details
    attempt_number = models.PositiveIntegerField(default=1)
    score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    passed = models.BooleanField(default=False)
    
    # Answers
    answers = models.JSONField(default=dict)  # Question ID -> Answer mapping
    correct_answers = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField(default=0)
    
    # Time tracking
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    time_taken = models.PositiveIntegerField(default=0)  # in seconds
    
    class Meta:
        unique_together = ['enrollment', 'quiz', 'attempt_number']
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.enrollment.student.get_full_name()} - {self.quiz.title} (Attempt {self.attempt_number})"


class CourseReview(models.Model):
    """Student reviews for courses"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='review')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_reviews')
    
    # Review content
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField()
    
    # Review status
    is_approved = models.BooleanField(default=False)
    is_helpful = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.course.title} ({self.rating}/5)"


class Certificate(models.Model):
    """Course completion certificates"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='certificate')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')
    
    # Certificate details
    certificate_number = models.CharField(max_length=50, unique=True)
    issued_date = models.DateTimeField(auto_now_add=True)
    completion_date = models.DateTimeField()
    
    # Certificate file
    certificate_file = models.FileField(upload_to='certificates/', blank=True, null=True)
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verification_code = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return f"Certificate - {self.student.get_full_name()} - {self.course.title}"


class Discussion(models.Model):
    """Course discussion forum"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='discussions')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='discussions')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='replies')
    
    # Discussion content
    title = models.CharField(max_length=200, blank=True)
    content = models.TextField()
    
    # Discussion status
    is_pinned = models.BooleanField(default=False)
    is_resolved = models.BooleanField(default=False)
    
    # Statistics
    views = models.PositiveIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.author.get_full_name()} - {self.title or self.content[:50]}"


class CourseCategory(models.Model):
    """Course categories for organization"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # Icon class or emoji
    color = models.CharField(max_length=7, default='#3B82F6')  # Hex color
    
    # Category stats
    course_count = models.PositiveIntegerField(default=0)
    student_count = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Course Category')
        verbose_name_plural = _('Course Categories')
        ordering = ['name']
    
    def __str__(self):
        return self.name
