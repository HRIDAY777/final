from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.subjects.models import Subject
from apps.teachers.models import Teacher
from apps.classes.models import Class
from apps.students.models import Student

User = get_user_model()


class TimeSlot(models.Model):
    """Time slots for scheduling classes"""
    DAYS_OF_WEEK = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]
    
    name = models.CharField(max_length=100)
    day_of_week = models.CharField(max_length=10, choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['day_of_week', 'start_time', 'end_time']
        ordering = ['day_of_week', 'start_time']
    
    def __str__(self):
        return f"{self.get_day_of_week_display()} {self.start_time} - {self.end_time}"
    
    @property
    def duration_minutes(self):
        """Calculate duration in minutes"""
        start = self.start_time
        end = self.end_time
        return (end.hour - start.hour) * 60 + (end.minute - start.minute)


class Room(models.Model):
    """Classrooms and facilities"""
    ROOM_TYPES = [
        ('classroom', 'Classroom'),
        ('laboratory', 'Laboratory'),
        ('computer_lab', 'Computer Lab'),
        ('library', 'Library'),
        ('auditorium', 'Auditorium'),
        ('gymnasium', 'Gymnasium'),
        ('music_room', 'Music Room'),
        ('art_room', 'Art Room'),
        ('conference_room', 'Conference Room'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=100)
    room_number = models.CharField(max_length=20, unique=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES, default='classroom')
    capacity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    building = models.CharField(max_length=100, blank=True)
    floor = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    facilities = models.JSONField(default=dict, blank=True)  # Equipment, features, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['building', 'floor', 'room_number']
    
    def __str__(self):
        return f"{self.building} - {self.room_number} ({self.get_room_type_display()})"


class Schedule(models.Model):
    """Main schedule/timetable"""
    SCHEDULE_TYPES = [
        ('regular', 'Regular Schedule'),
        ('exam', 'Exam Schedule'),
        ('special', 'Special Schedule'),
        ('holiday', 'Holiday Schedule'),
    ]
    
    name = models.CharField(max_length=200)
    schedule_type = models.CharField(max_length=20, choices=SCHEDULE_TYPES, default='regular')
    academic_year = models.ForeignKey('academic_years.AcademicYear', on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.name} ({self.get_schedule_type_display()})"


class ClassSchedule(models.Model):
    """Individual class schedule entries"""
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='class_schedules')
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='schedules')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['schedule', 'class_obj', 'time_slot']
        ordering = ['time_slot__day_of_week', 'time_slot__start_time']
    
    def __str__(self):
        return f"{self.class_obj.name} - {self.subject.name} ({self.time_slot})"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        # Check for conflicts
        conflicts = ClassSchedule.objects.filter(
            schedule=self.schedule,
            time_slot=self.time_slot,
            room=self.room,
            is_active=True
        ).exclude(id=self.id)
        
        if conflicts.exists():
            raise ValidationError("Room is already occupied at this time slot")
        
        # Check teacher conflicts
        teacher_conflicts = ClassSchedule.objects.filter(
            schedule=self.schedule,
            time_slot=self.time_slot,
            teacher=self.teacher,
            is_active=True
        ).exclude(id=self.id)
        
        if teacher_conflicts.exists():
            raise ValidationError("Teacher is already assigned at this time slot")


class ScheduleConflict(models.Model):
    """Track scheduling conflicts"""
    CONFLICT_TYPES = [
        ('room_conflict', 'Room Conflict'),
        ('teacher_conflict', 'Teacher Conflict'),
        ('class_conflict', 'Class Conflict'),
        ('time_conflict', 'Time Conflict'),
    ]
    
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='conflicts')
    conflict_type = models.CharField(max_length=20, choices=CONFLICT_TYPES)
    class_schedule = models.ForeignKey(ClassSchedule, on_delete=models.CASCADE, related_name='conflicts')
    conflicting_schedule = models.ForeignKey(ClassSchedule, on_delete=models.CASCADE, related_name='conflicted_by')
    description = models.TextField()
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_conflict_type_display()} - {self.class_schedule}"


class ScheduleTemplate(models.Model):
    """Reusable schedule templates"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    academic_year = models.ForeignKey('academic_years.AcademicYear', on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class TemplateSchedule(models.Model):
    """Schedule entries for templates"""
    template = models.ForeignKey(ScheduleTemplate, on_delete=models.CASCADE, related_name='template_schedules')
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['template', 'class_obj', 'time_slot']
        ordering = ['time_slot__day_of_week', 'time_slot__start_time']
    
    def __str__(self):
        return f"{self.template.name} - {self.class_obj.name} - {self.subject.name}"


class ScheduleChange(models.Model):
    """Track schedule changes and modifications"""
    CHANGE_TYPES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('deleted', 'Deleted'),
        ('moved', 'Moved'),
        ('substituted', 'Substituted'),
    ]
    
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='changes')
    class_schedule = models.ForeignKey(ClassSchedule, on_delete=models.CASCADE, related_name='changes')
    change_type = models.CharField(max_length=20, choices=CHANGE_TYPES)
    old_data = models.JSONField(default=dict, blank=True)
    new_data = models.JSONField(default=dict, blank=True)
    reason = models.TextField(blank=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.get_change_type_display()} - {self.class_schedule}"


class ScheduleNotification(models.Model):
    """Notifications for schedule changes"""
    NOTIFICATION_TYPES = [
        ('schedule_change', 'Schedule Change'),
        ('conflict_resolved', 'Conflict Resolved'),
        ('new_schedule', 'New Schedule'),
        ('reminder', 'Reminder'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, null=True, blank=True)
    class_schedule = models.ForeignKey(ClassSchedule, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.notification_type} - {self.recipient}"


class ScheduleSettings(models.Model):
    """Global timetable settings"""
    school = models.OneToOneField('tenants.Tenant', on_delete=models.CASCADE)
    default_start_time = models.TimeField(default='08:00')
    default_end_time = models.TimeField(default='16:00')
    break_duration = models.PositiveIntegerField(default=15, help_text="Break duration in minutes")
    lunch_duration = models.PositiveIntegerField(default=60, help_text="Lunch duration in minutes")
    max_periods_per_day = models.PositiveIntegerField(default=8)
    allow_weekend_classes = models.BooleanField(default=False)
    auto_resolve_conflicts = models.BooleanField(default=False)
    notify_on_changes = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Schedule Settings - {self.school.name}"
