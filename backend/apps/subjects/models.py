from django.db import models
import uuid


class Subject(models.Model):
    """Subject model for different academic subjects"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(
        max_length=100,
        help_text="e.g., Mathematics, English, Science"
    )
    code = models.CharField(
        max_length=20, unique=True, help_text="e.g., MATH101, ENG201"
    )
    description = models.TextField(blank=True)
    credits = models.PositiveIntegerField(default=1)
    semester = models.PositiveIntegerField(
        default=1, help_text="Semester number"
    )
    is_core = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Subjects'

    def __str__(self):
        return f"{self.name} ({self.code})"


class AcademicYear(models.Model):
    """Academic Year model for managing different academic periods"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(
        max_length=100,
        help_text="e.g., 2024-2025, Academic Year 2024"
    )
    description = models.TextField(blank=True)
    start_date = models.DateField(help_text="Start date of academic year")
    end_date = models.DateField(help_text="End date of academic year")
    is_active = models.BooleanField(default=True)
    is_current = models.BooleanField(
        default=False, help_text="Current academic year"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Academic Years'
        ordering = ['-start_date']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Ensure only one academic year is current
        if self.is_current:
            AcademicYear.objects.filter(
                is_current=True
            ).update(is_current=False)
        super().save(*args, **kwargs)
