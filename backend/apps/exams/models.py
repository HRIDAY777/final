from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from apps.subjects.models import Subject
from apps.academics.models import Course
from apps.students.models import Student
from apps.teachers.models import Teacher
from apps.classes.models import Class
import uuid

User = get_user_model()


class Exam(models.Model):
    """Model for exam definitions"""
    EXAM_TYPES = [
        ('midterm', 'Midterm'),
        ('final', 'Final'),
        ('quiz', 'Quiz'),
        ('assignment', 'Assignment'),
        ('project', 'Project'),
        ('practical', 'Practical'),
        ('other', 'Other')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    exam_type = models.CharField(max_length=20, choices=EXAM_TYPES, default='quiz')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='exams')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='exams')
    total_marks = models.PositiveIntegerField(default=100)
    duration_minutes = models.PositiveIntegerField(default=60)
    passing_marks = models.PositiveIntegerField(default=40)
    is_active = models.BooleanField(default=True)
    allow_retake = models.BooleanField(default=False)
    max_attempts = models.PositiveIntegerField(default=1)
    instructions = models.TextField(blank=True)
    created_by = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='created_exams')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Exams'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.subject.name}"

    @property
    def total_questions(self):
        return self.questions.count()

    @property
    def is_scheduled(self):
        return hasattr(self, 'schedule')


class ExamSchedule(models.Model):
    """Model for exam scheduling"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exam = models.OneToOneField(Exam, on_delete=models.CASCADE, related_name='schedule')
    start_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    venue = models.CharField(max_length=200, blank=True)
    room_number = models.CharField(max_length=50, blank=True)
    invigilator = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='invigilated_exams')
    is_online = models.BooleanField(default=False)
    online_platform = models.CharField(max_length=100, blank=True)
    meeting_link = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Exam Schedules'
        ordering = ['start_date', 'start_time']

    def __str__(self):
        return f"{self.exam.title} - {self.start_date} {self.start_time}"

    @property
    def duration_minutes(self):
        """Calculate actual duration from start and end time"""
        start = timezone.datetime.combine(self.start_date, self.start_time)
        end = timezone.datetime.combine(self.start_date, self.end_time)
        return int((end - start).total_seconds() / 60)

    @property
    def is_upcoming(self):
        """Check if exam is in the future"""
        now = timezone.now()
        exam_datetime = timezone.datetime.combine(self.start_date, self.start_time)
        return exam_datetime > now

    @property
    def is_ongoing(self):
        """Check if exam is currently ongoing"""
        now = timezone.now()
        start_datetime = timezone.datetime.combine(self.start_date, self.start_time)
        end_datetime = timezone.datetime.combine(self.start_date, self.end_time)
        return start_datetime <= now <= end_datetime

    @property
    def is_completed(self):
        """Check if exam has ended"""
        now = timezone.now()
        end_datetime = timezone.datetime.combine(self.start_date, self.end_time)
        return now > end_datetime


class Question(models.Model):
    """Model for exam questions"""
    QUESTION_TYPES = [
        ('multiple_choice', 'Multiple Choice'),
        ('single_choice', 'Single Choice'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer'),
        ('essay', 'Essay'),
        ('numerical', 'Numerical'),
        ('matching', 'Matching'),
        ('fill_blank', 'Fill in the Blank')
    ]
    
    DIFFICULTY_LEVELS = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='multiple_choice')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_LEVELS, default='medium')
    marks = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField()
    is_required = models.BooleanField(default=True)
    has_negative_marking = models.BooleanField(default=False)
    negative_marks = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    explanation = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['exam', 'order']
        ordering = ['exam', 'order']
        verbose_name_plural = 'Questions'

    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}..."

    @property
    def correct_answers(self):
        """Get correct answers for this question"""
        return self.answers.filter(is_correct=True)

    @property
    def total_answers(self):
        """Get total number of answers"""
        return self.answers.count()


class Answer(models.Model):
    """Model for question answers"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    answer_text = models.TextField()
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField()
    explanation = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['question', 'order']
        ordering = ['question', 'order']
        verbose_name_plural = 'Answers'

    def __str__(self):
        return f"{self.question}: {self.answer_text[:30]}..."


class ExamResult(models.Model):
    """Model for student exam results"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='results')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='exam_results')
    marks_obtained = models.PositiveIntegerField()
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.CharField(max_length=2, blank=True)
    is_passed = models.BooleanField(default=False)
    attempt_number = models.PositiveIntegerField(default=1)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration_taken_minutes = models.PositiveIntegerField()
    is_submitted = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(null=True, blank=True)
    graded_by = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='graded_results')
    graded_at = models.DateTimeField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['exam', 'student', 'attempt_number']
        ordering = ['-created_at']
        verbose_name_plural = 'Exam Results'

    def __str__(self):
        return f"{self.student.full_name} - {self.exam.title} (Attempt {self.attempt_number})"

    def save(self, *args, **kwargs):
        # Calculate percentage
        if self.marks_obtained and self.exam.total_marks:
            self.percentage = (self.marks_obtained / self.exam.total_marks) * 100
            
            # Determine grade based on percentage
            if self.percentage >= 90:
                self.grade = 'A+'
            elif self.percentage >= 80:
                self.grade = 'A'
            elif self.percentage >= 70:
                self.grade = 'B+'
            elif self.percentage >= 60:
                self.grade = 'B'
            elif self.percentage >= 50:
                self.grade = 'C+'
            elif self.percentage >= 40:
                self.grade = 'C'
            elif self.percentage >= 30:
                self.grade = 'D'
            else:
                self.grade = 'F'
            
            # Check if passed
            self.is_passed = self.percentage >= self.exam.passing_marks
        
        super().save(*args, **kwargs)


class StudentAnswer(models.Model):
    """Model for individual student answers"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exam_result = models.ForeignKey(ExamResult, on_delete=models.CASCADE, related_name='student_answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='student_answers')
    selected_answers = models.ManyToManyField(Answer, blank=True)
    text_answer = models.TextField(blank=True)
    numerical_answer = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_correct = models.BooleanField(default=False)
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    time_taken_seconds = models.PositiveIntegerField(default=0)
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['exam_result', 'question']
        verbose_name_plural = 'Student Answers'

    def __str__(self):
        return f"{self.exam_result.student.full_name} - {self.question}"

    def save(self, *args, **kwargs):
        # Auto-grade for objective questions
        if self.question.question_type in ['multiple_choice', 'single_choice', 'true_false']:
            correct_answers = self.question.correct_answers
            selected_answers = self.selected_answers.all()
            
            if self.question.question_type == 'single_choice':
                self.is_correct = len(selected_answers) == 1 and selected_answers[0] in correct_answers
            else:
                self.is_correct = set(selected_answers) == set(correct_answers)
            
            if self.is_correct:
                self.marks_obtained = self.question.marks
            elif self.question.has_negative_marking:
                self.marks_obtained = -self.question.negative_marks
        
        super().save(*args, **kwargs)


class Quiz(models.Model):
    """Model for quick quizzes and practice tests"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='quizzes')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    total_questions = models.PositiveIntegerField(default=10)
    time_limit_minutes = models.PositiveIntegerField(default=30)
    passing_score = models.PositiveIntegerField(default=70)
    is_randomized = models.BooleanField(default=True)
    show_results_immediately = models.BooleanField(default=True)
    allow_review = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='created_quizzes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Quizzes'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.subject.name}"


class ExamSettings(models.Model):
    """Model for exam system settings"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class_enrolled = models.OneToOneField(Class, on_delete=models.CASCADE, related_name='exam_settings')
    default_exam_duration = models.PositiveIntegerField(default=60, help_text="Default exam duration in minutes")
    default_passing_percentage = models.PositiveIntegerField(default=40, help_text="Default passing percentage")
    allow_exam_retakes = models.BooleanField(default=False, help_text="Allow students to retake failed exams")
    max_retake_attempts = models.PositiveIntegerField(default=2, help_text="Maximum number of retake attempts")
    auto_grade_objective_questions = models.BooleanField(default=True, help_text="Automatically grade objective questions")
    require_teacher_approval = models.BooleanField(default=False, help_text="Require teacher approval for exam results")
    send_result_notifications = models.BooleanField(default=True, help_text="Send notifications when results are published")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Exam Settings'

    def __str__(self):
        return f"Exam Settings - {self.class_enrolled.name}"
