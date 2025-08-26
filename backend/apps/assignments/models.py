from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import uuid

User = get_user_model()


class Assignment(models.Model):
    """Assignment model for managing academic assignments"""
    
    ASSIGNMENT_TYPES = [
        ('homework', _('Homework')),
        ('project', _('Project')),
        ('essay', _('Essay')),
        ('presentation', _('Presentation')),
        ('quiz', _('Quiz')),
        ('lab', _('Laboratory Work')),
        ('research', _('Research Paper')),
        ('other', _('Other')),
    ]
    
    STATUS_CHOICES = [
        ('draft', _('Draft')),
        ('published', _('Published')),
        ('active', _('Active')),
        ('submission_closed', _('Submission Closed')),
        ('grading', _('Grading')),
        ('completed', _('Completed')),
        ('archived', _('Archived')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, verbose_name=_('Title'))
    description = models.TextField(verbose_name=_('Description'))
    instructions = models.TextField(blank=True, verbose_name=_('Instructions'))
    
    # Assignment details
    assignment_type = models.CharField(max_length=20, choices=ASSIGNMENT_TYPES, default='homework')
    subject = models.ForeignKey('subjects.Subject', on_delete=models.CASCADE, related_name='assignments')
    class_group = models.ForeignKey('classes.Class', on_delete=models.CASCADE, related_name='assignments')
    
    # Dates and deadlines
    assigned_date = models.DateTimeField(default=timezone.now, verbose_name=_('Assigned Date'))
    due_date = models.DateTimeField(verbose_name=_('Due Date'))
    late_submission_deadline = models.DateTimeField(null=True, blank=True, verbose_name=_('Late Submission Deadline'))
    
    # Grading
    total_marks = models.PositiveIntegerField(validators=[MinValueValidator(1)], verbose_name=_('Total Marks'))
    weightage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name=_('Weightage (%)')
    )
    
    # Settings
    allow_late_submission = models.BooleanField(default=False, verbose_name=_('Allow Late Submission'))
    late_submission_penalty = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name=_('Late Submission Penalty (%)')
    )
    allow_resubmission = models.BooleanField(default=False, verbose_name=_('Allow Resubmission'))
    max_resubmissions = models.PositiveIntegerField(default=1, verbose_name=_('Max Resubmissions'))
    
    # Files and attachments
    attachment = models.FileField(upload_to='assignments/', blank=True, null=True, verbose_name=_('Attachment'))
    rubric = models.JSONField(default=dict, blank=True, verbose_name=_('Grading Rubric'))
    
    # Status and tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    
    # Multi-tenant support
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='assignments',
        verbose_name=_('Tenant')
    )
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_assignments')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Assignment')
        verbose_name_plural = _('Assignments')
        ordering = ['-due_date', '-created_at']
        indexes = [
            models.Index(fields=['subject']),
            models.Index(fields=['class_group']),
            models.Index(fields=['status']),
            models.Index(fields=['due_date']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.subject.name}"
    
    @property
    def is_overdue(self):
        """Check if assignment is overdue"""
        return timezone.now() > self.due_date
    
    @property
    def is_late_submission_allowed(self):
        """Check if late submission is still allowed"""
        if not self.allow_late_submission or not self.late_submission_deadline:
            return False
        return timezone.now() <= self.late_submission_deadline
    
    @property
    def submission_count(self):
        """Get total number of submissions"""
        return self.submissions.count()
    
    @property
    def graded_count(self):
        """Get number of graded submissions"""
        return self.submissions.filter(is_graded=True).count()


class AssignmentSubmission(models.Model):
    """Model for student assignment submissions"""
    
    STATUS_CHOICES = [
        ('submitted', _('Submitted')),
        ('late', _('Late')),
        ('graded', _('Graded')),
        ('returned', _('Returned')),
        ('resubmitted', _('Resubmitted')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='assignment_submissions')
    
    # Submission details
    submission_text = models.TextField(blank=True, verbose_name=_('Submission Text'))
    attachment = models.FileField(upload_to='submissions/', blank=True, null=True, verbose_name=_('Attachment'))
    submission_date = models.DateTimeField(auto_now_add=True, verbose_name=_('Submission Date'))
    
    # Grading
    marks_obtained = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name=_('Marks Obtained')
    )
    percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name=_('Percentage')
    )
    grade = models.CharField(max_length=2, blank=True, verbose_name=_('Grade'))
    feedback = models.TextField(blank=True, verbose_name=_('Feedback'))
    rubric_scores = models.JSONField(default=dict, blank=True, verbose_name=_('Rubric Scores'))
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    is_graded = models.BooleanField(default=False, verbose_name=_('Is Graded'))
    is_late = models.BooleanField(default=False, verbose_name=_('Is Late'))
    
    # Resubmission tracking
    resubmission_count = models.PositiveIntegerField(default=0, verbose_name=_('Resubmission Count'))
    original_submission = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='resubmissions',
        verbose_name=_('Original Submission')
    )
    
    # Metadata
    graded_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='graded_submissions',
        verbose_name=_('Graded By')
    )
    graded_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Graded At'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Assignment Submission')
        verbose_name_plural = _('Assignment Submissions')
        ordering = ['-submission_date']
        unique_together = ['assignment', 'student']
        indexes = [
            models.Index(fields=['assignment']),
            models.Index(fields=['student']),
            models.Index(fields=['status']),
            models.Index(fields=['submission_date']),
        ]
    
    def __str__(self):
        return f"{self.student} - {self.assignment.title}"
    
    def save(self, *args, **kwargs):
        # Check if submission is late
        if self.submission_date > self.assignment.due_date:
            self.is_late = True
            if not self.assignment.allow_late_submission:
                self.status = 'late'
        
        # Calculate percentage if marks are provided
        if self.marks_obtained is not None and self.assignment.total_marks > 0:
            self.percentage = (self.marks_obtained / self.assignment.total_marks) * 100
        
        super().save(*args, **kwargs)
    
    @property
    def days_late(self):
        """Get number of days the submission is late"""
        if self.is_late:
            return (self.submission_date - self.assignment.due_date).days
        return 0


class AssignmentComment(models.Model):
    """Model for comments on assignments and submissions"""
    
    COMMENT_TYPES = [
        ('general', _('General')),
        ('feedback', _('Feedback')),
        ('question', _('Question')),
        ('clarification', _('Clarification')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='comments')
    submission = models.ForeignKey(
        AssignmentSubmission, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='comments'
    )
    
    # Comment details
    comment_type = models.CharField(max_length=20, choices=COMMENT_TYPES, default='general')
    content = models.TextField(verbose_name=_('Content'))
    is_private = models.BooleanField(default=False, verbose_name=_('Is Private'))
    
    # Metadata
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignment_comments')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Assignment Comment')
        verbose_name_plural = _('Assignment Comments')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.author} on {self.assignment.title}"
