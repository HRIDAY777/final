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
    is_core = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Subjects'

    def __str__(self):
        return f"{self.name} ({self.code})"
