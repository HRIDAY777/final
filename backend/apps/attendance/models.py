from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from apps.academics.models import Course
from apps.students.models import Student
from apps.teachers.models import Teacher
from apps.classes.models import Class
import uuid

User = get_user_model()


class AttendanceSession(models.Model):
    """Model for tracking attendance sessions/periods"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='attendance_sessions')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    session_type = models.CharField(
        max_length=20,
        choices=[
            ('regular', 'Regular Class'),
            ('exam', 'Examination'),
            ('practical', 'Practical'),
            ('lab', 'Laboratory'),
            ('field_trip', 'Field Trip'),
            ('other', 'Other')
        ],
        default='regular'
    )
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='created_sessions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['course', 'date', 'start_time']
        ordering = ['-date', '-start_time']
        verbose_name_plural = 'Attendance Sessions'

    def __str__(self):
        return f"{self.course} - {self.date} ({self.start_time})"

    @property
    def duration_minutes(self):
        """Calculate session duration in minutes"""
        start = timezone.datetime.combine(self.date, self.start_time)
        end = timezone.datetime.combine(self.date, self.end_time)
        return int((end - start).total_seconds() / 60)

    @property
    def total_students(self):
        """Get total number of students in the course"""
        return self.course.class_enrolled.students.count()

    @property
    def present_count(self):
        """Get number of present students"""
        return self.attendance_records.filter(status='present').count()

    @property
    def absent_count(self):
        """Get number of absent students"""
        return self.attendance_records.filter(status='absent').count()

    @property
    def late_count(self):
        """Get number of late students"""
        return self.attendance_records.filter(status='late').count()

    @property
    def attendance_percentage(self):
        """Calculate attendance percentage"""
        total = self.total_students
        if total == 0:
            return 0
        present = self.present_count + self.late_count
        return round((present / total) * 100, 2)


class AttendanceRecord(models.Model):
    """Model for individual student attendance records"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='attendance_records')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    status = models.CharField(
        max_length=10,
        choices=[
            ('present', 'Present'),
            ('absent', 'Absent'),
            ('late', 'Late'),
            ('excused', 'Excused'),
            ('half_day', 'Half Day')
        ],
        default='present'
    )
    arrival_time = models.TimeField(null=True, blank=True)
    departure_time = models.TimeField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    marked_by = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='marked_attendance')
    marked_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['session', 'student']
        ordering = ['-session__date', 'student__user__first_name']
        verbose_name_plural = 'Attendance Records'

    def __str__(self):
        return f"{self.student.full_name} - {self.session} ({self.status})"

    def save(self, *args, **kwargs):
        # Auto-calculate if student is late
        if self.arrival_time and self.session.start_time:
            if self.arrival_time > self.session.start_time:
                self.status = 'late'
        super().save(*args, **kwargs)


class LeaveRequest(models.Model):
    """Model for student leave requests"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(
        max_length=20,
        choices=[
            ('sick', 'Sick Leave'),
            ('personal', 'Personal Leave'),
            ('emergency', 'Emergency Leave'),
            ('family', 'Family Event'),
            ('medical', 'Medical Appointment'),
            ('other', 'Other')
        ]
    )
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    supporting_documents = models.FileField(upload_to='leave_documents/', blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('cancelled', 'Cancelled')
        ],
        default='pending'
    )
    approved_by = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Leave Requests'

    def __str__(self):
        return f"{self.student.full_name} - {self.leave_type} ({self.start_date} to {self.end_date})"

    @property
    def duration_days(self):
        """Calculate leave duration in days"""
        return (self.end_date - self.start_date).days + 1

    @property
    def is_approved(self):
        return self.status == 'approved'

    @property
    def is_pending(self):
        return self.status == 'pending'


class AttendanceReport(models.Model):
    """Model for storing attendance reports and analytics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_reports')
    class_enrolled = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='attendance_reports')
    academic_year = models.CharField(max_length=20)
    month = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    total_days = models.PositiveIntegerField(default=0)
    present_days = models.PositiveIntegerField(default=0)
    absent_days = models.PositiveIntegerField(default=0)
    late_days = models.PositiveIntegerField(default=0)
    excused_days = models.PositiveIntegerField(default=0)
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'academic_year', 'month']
        ordering = ['-academic_year', '-month']
        verbose_name_plural = 'Attendance Reports'

    def __str__(self):
        return f"{self.student.full_name} - {self.academic_year} Month {self.month}"

    def save(self, *args, **kwargs):
        # Calculate attendance percentage
        total_attendance_days = self.present_days + self.late_days + self.absent_days
        if total_attendance_days > 0:
            self.attendance_percentage = ((self.present_days + self.late_days) / total_attendance_days) * 100
        super().save(*args, **kwargs)


class AttendanceSettings(models.Model):
    """Model for attendance system settings"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class_enrolled = models.OneToOneField(Class, on_delete=models.CASCADE, related_name='attendance_settings')
    late_threshold_minutes = models.PositiveIntegerField(default=15, help_text="Minutes after which a student is marked late")
    absent_threshold_minutes = models.PositiveIntegerField(default=30, help_text="Minutes after which a student is marked absent")
    auto_mark_absent = models.BooleanField(default=True, help_text="Automatically mark absent students")
    send_notifications = models.BooleanField(default=True, help_text="Send attendance notifications to parents")
    require_excuse_notes = models.BooleanField(default=True, help_text="Require excuse notes for absences")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Attendance Settings'

    def __str__(self):
        return f"Attendance Settings - {self.class_enrolled.name}"
