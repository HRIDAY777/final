from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid

User = get_user_model()


# AcademicYear model moved to apps.academic_years


# Subject model moved to apps.subjects


class Course(models.Model):
    """Course model linking subjects to classes with teachers"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.ForeignKey(
        'subjects.Subject', on_delete=models.CASCADE, related_name='courses'
    )
    class_enrolled = models.ForeignKey(
        'classes.Class', on_delete=models.CASCADE, related_name='courses'
    )
    teacher = models.ForeignKey(
        'teachers.Teacher', on_delete=models.CASCADE, related_name='courses'
    )
    academic_year = models.CharField(max_length=20)
    semester = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['subject', 'class_enrolled', 'academic_year']
        verbose_name_plural = 'Courses'

    def __str__(self):
        return (
            f"{self.subject.name} - {self.class_enrolled.name} "
            f"({self.teacher.full_name})"
        )


class Lesson(models.Model):
    """Lesson model for individual class sessions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='lessons'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    content = models.TextField(
        help_text="Lesson content in markdown format"
    )
    duration_minutes = models.PositiveIntegerField(default=45)
    order = models.PositiveIntegerField()
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Lessons'
        ordering = ['order']

    def __str__(self):
        return f"{self.course.subject.name} - {self.title}"


class Grade(models.Model):
    """Grade model for student grades"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        'students.Student', on_delete=models.CASCADE, related_name='academic_grades'
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='grades'
    )
    assignment = models.ForeignKey(
        'assignments.Assignment', on_delete=models.CASCADE, related_name='grades', blank=True, null=True
    )
    score = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    letter_grade = models.CharField(
        max_length=2,
        choices=[
            ('A+', 'A+'), ('A', 'A'), ('A-', 'A-'),
            ('B+', 'B+'), ('B', 'B'), ('B-', 'B-'),
            ('C+', 'C+'), ('C', 'C'), ('C-', 'C-'),
            ('D+', 'D+'), ('D', 'D'), ('D-', 'D-'),
            ('F', 'F')
        ]
    )
    weight = models.DecimalField(
        max_digits=5, decimal_places=2, default=100.00,
        help_text="Weight of this grade in the final calculation (%)"
    )
    academic_year = models.CharField(max_length=20)
    semester = models.CharField(max_length=20, blank=True)
    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Grades'
        unique_together = ['student', 'course', 'assignment', 'academic_year']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.full_name} - {self.course.subject.name} - {self.score}%"

    def save(self, *args, **kwargs):
        # Calculate letter grade based on score
        if self.score >= 97:
            self.letter_grade = 'A+'
        elif self.score >= 93:
            self.letter_grade = 'A'
        elif self.score >= 90:
            self.letter_grade = 'A-'
        elif self.score >= 87:
            self.letter_grade = 'B+'
        elif self.score >= 83:
            self.letter_grade = 'B'
        elif self.score >= 80:
            self.letter_grade = 'B-'
        elif self.score >= 77:
            self.letter_grade = 'C+'
        elif self.score >= 73:
            self.letter_grade = 'C'
        elif self.score >= 70:
            self.letter_grade = 'C-'
        elif self.score >= 67:
            self.letter_grade = 'D+'
        elif self.score >= 63:
            self.letter_grade = 'D'
        elif self.score >= 60:
            self.letter_grade = 'D-'
        else:
            self.letter_grade = 'F'
        super().save(*args, **kwargs)
