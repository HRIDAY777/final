from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

User = get_user_model()


class Class(models.Model):
    name = models.CharField(
        max_length=50, verbose_name=_('Class Name')
    )
    code = models.CharField(
        max_length=10, unique=True, verbose_name=_('Class Code')
    )
    description = models.TextField(
        blank=True, verbose_name=_('Description')
    )
    academic_year = models.ForeignKey(
        'academic_years.AcademicYear', on_delete=models.CASCADE,
        verbose_name=_('Academic Year')
    )
    capacity = models.PositiveIntegerField(
        default=30, verbose_name=_('Class Capacity')
    )
    current_students = models.PositiveIntegerField(
        default=0, verbose_name=_('Current Students')
    )
    class_teacher = models.ForeignKey(
        'teachers.Teacher', on_delete=models.SET_NULL, null=True,
        blank=True, verbose_name=_('Class Teacher')
    )
    room = models.ForeignKey(
        'ClassRoom', on_delete=models.SET_NULL, null=True,
        blank=True, verbose_name=_('Class Room')
    )
    grade_level = models.CharField(
        max_length=20, choices=[
            ('primary', _('Primary')),
            ('middle', _('Middle')),
            ('high', _('High')),
            ('college', _('College'))
        ], default='primary', verbose_name=_('Grade Level')
    )
    section = models.CharField(
        max_length=10, blank=True, verbose_name=_('Section')
    )
    is_active = models.BooleanField(
        default=True, verbose_name=_('Is Active')
    )
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name=_('Created At')
    )
    updated_at = models.DateTimeField(
        auto_now=True, verbose_name=_('Updated At')
    )

    class Meta:
        verbose_name = _('Class')
        verbose_name_plural = _('Classes')
        ordering = ['grade_level', 'name', 'section']
        unique_together = ['name', 'academic_year', 'section']

    def __str__(self):
        if self.section:
            return f"{self.name} - {self.section}"
        return self.name

    @property
    def full_name(self):
        if self.section:
            return f"{self.name} - {self.section}"
        return self.name

    @property
    def available_seats(self):
        return self.capacity - self.current_students

    @property
    def occupancy_rate(self):
        if self.capacity > 0:
            return (self.current_students / self.capacity) * 100
        return 0

    @property
    def current_student_count(self):
        return self.current_students

    @property
    def is_full(self):
        return self.current_students >= self.capacity

    def can_add_student(self):
        return self.current_students < self.capacity

class Subject(models.Model):
    name = models.CharField(max_length=100, verbose_name=_('Subject Name'))
    code = models.CharField(max_length=10, unique=True, verbose_name=_('Subject Code'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    category = models.CharField(max_length=50, choices=[
        ('core', _('Core')),
        ('elective', _('Elective')),
        ('optional', _('Optional')),
        ('extra_curricular', _('Extra Curricular'))
    ], default='core', verbose_name=_('Category'))
    grade_level = models.CharField(max_length=20, choices=[
        ('primary', _('Primary')),
        ('middle', _('Middle')),
        ('high', _('High')),
        ('college', _('College')),
        ('all', _('All Levels'))
    ], default='all', verbose_name=_('Grade Level'))
    credit_hours = models.PositiveIntegerField(default=1, verbose_name=_('Credit Hours'))
    max_marks = models.PositiveIntegerField(default=100, verbose_name=_('Maximum Marks'))
    pass_marks = models.PositiveIntegerField(default=40, verbose_name=_('Pass Marks'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Subject')
        verbose_name_plural = _('Subjects')
        ordering = ['category', 'name']

    def __str__(self):
        return self.name

    def validate_pass_marks(self):
        if self.pass_marks > self.max_marks:
            raise ValueError("Pass marks cannot be greater than maximum marks")

    def save(self, *args, **kwargs):
        self.validate_pass_marks()
        super().save(*args, **kwargs)

class ClassSubject(models.Model):
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='subjects', verbose_name=_('Class'))
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, verbose_name=_('Subject'))
    teacher = models.ForeignKey('teachers.Teacher', on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_('Teacher'))
    academic_year = models.ForeignKey('academic_years.AcademicYear', on_delete=models.CASCADE, verbose_name=_('Academic Year'))
    is_compulsory = models.BooleanField(default=True, verbose_name=_('Is Compulsory'))
    weekly_hours = models.PositiveIntegerField(default=5, verbose_name=_('Weekly Hours'))
    order = models.PositiveIntegerField(default=1, verbose_name=_('Display Order'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Class Subject')
        verbose_name_plural = _('Class Subjects')
        ordering = ['class_obj', 'order', 'subject']
        unique_together = ['class_obj', 'subject', 'academic_year']

    def __str__(self):
        return f"{self.class_obj.name} - {self.subject.name}"

class ClassRoom(models.Model):
    name = models.CharField(max_length=50, verbose_name=_('Room Name'))
    number = models.CharField(max_length=20, unique=True, verbose_name=_('Room Number'))
    building = models.CharField(max_length=50, blank=True, verbose_name=_('Building'))
    floor = models.PositiveIntegerField(default=1, verbose_name=_('Floor'))
    capacity = models.PositiveIntegerField(default=30, verbose_name=_('Capacity'))
    room_type = models.CharField(max_length=20, choices=[
        ('classroom', _('Classroom')),
        ('laboratory', _('Laboratory')),
        ('computer_lab', _('Computer Lab')),
        ('library', _('Library')),
        ('auditorium', _('Auditorium')),
        ('gymnasium', _('Gymnasium')),
        ('other', _('Other'))
    ], default='classroom', verbose_name=_('Room Type'))
    equipment = models.TextField(blank=True, verbose_name=_('Equipment'))
    is_available = models.BooleanField(default=True, verbose_name=_('Is Available'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Class Room')
        verbose_name_plural = _('Class Rooms')
        ordering = ['building', 'floor', 'number']

    def __str__(self):
        if self.building:
            return f"{self.building} - {self.number}"
        return self.number

    @property
    def full_name(self):
        if self.building:
            return f"{self.building} - {self.number}"
        return self.number

class ClassSchedule(models.Model):
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='class_schedules', verbose_name=_('Class'))
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, verbose_name=_('Subject'))
    teacher = models.ForeignKey('teachers.Teacher', on_delete=models.CASCADE, related_name='class_schedules', verbose_name=_('Teacher'))
    room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, verbose_name=_('Room'))
    academic_year = models.ForeignKey('academic_years.AcademicYear', on_delete=models.CASCADE, verbose_name=_('Academic Year'))
    day_of_week = models.CharField(max_length=10, choices=[
        ('monday', _('Monday')),
        ('tuesday', _('Tuesday')),
        ('wednesday', _('Wednesday')),
        ('thursday', _('Thursday')),
        ('friday', _('Friday')),
        ('saturday', _('Saturday')),
        ('sunday', _('Sunday'))
    ], verbose_name=_('Day of Week'))
    start_time = models.TimeField(verbose_name=_('Start Time'))
    end_time = models.TimeField(verbose_name=_('End Time'))
    period_number = models.PositiveIntegerField(verbose_name=_('Period Number'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Class Schedule')
        verbose_name_plural = _('Class Schedules')
        ordering = ['day_of_week', 'start_time']
        unique_together = ['class_obj', 'day_of_week', 'period_number', 'academic_year']

    def __str__(self):
        return f"{self.class_obj.name} - {self.subject.name} - {self.get_day_of_week_display()}"

    @property
    def duration_minutes(self):
        start = self.start_time
        end = self.end_time
        return (end.hour - start.hour) * 60 + (end.minute - start.minute)

    def has_time_conflict(self):
        """Check if this schedule conflicts with other schedules for the same class/teacher/room"""
        conflicts = ClassSchedule.objects.filter(
            academic_year=self.academic_year,
            day_of_week=self.day_of_week,
            is_active=True
        ).exclude(id=self.id)

        # Check class conflicts
        class_conflicts = conflicts.filter(class_obj=self.class_obj)
        for conflict in class_conflicts:
            if (self.start_time < conflict.end_time and self.end_time > conflict.start_time):
                return True

        # Check teacher conflicts
        teacher_conflicts = conflicts.filter(teacher=self.teacher)
        for conflict in teacher_conflicts:
            if (self.start_time < conflict.end_time and self.end_time > conflict.start_time):
                return True

        # Check room conflicts
        room_conflicts = conflicts.filter(room=self.room)
        for conflict in room_conflicts:
            if (self.start_time < conflict.end_time and self.end_time > conflict.start_time):
                return True

        return False

class ClassEnrollment(models.Model):
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='class_enrollments', verbose_name=_('Student'))
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='enrollments', verbose_name=_('Class'))
    academic_year = models.ForeignKey('academic_years.AcademicYear', on_delete=models.CASCADE, verbose_name=_('Academic Year'))
    enrollment_date = models.DateField(default=timezone.now, verbose_name=_('Enrollment Date'))
    status = models.CharField(max_length=20, choices=[
        ('active', _('Active')),
        ('inactive', _('Inactive')),
        ('transferred', _('Transferred')),
        ('graduated', _('Graduated')),
        ('dropped', _('Dropped'))
    ], default='active', verbose_name=_('Status'))
    remarks = models.TextField(blank=True, verbose_name=_('Remarks'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Class Enrollment')
        verbose_name_plural = _('Class Enrollments')
        ordering = ['-enrollment_date']
        unique_together = ['student', 'class_obj', 'academic_year']

    def __str__(self):
        return f"{self.student.full_name} - {self.class_obj.name}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Update class student count
        if is_new and self.status == 'active':
            self.class_obj.current_students += 1
            self.class_obj.save()
        elif not is_new:
            # Handle status changes
            old_instance = ClassEnrollment.objects.get(pk=self.pk)
            if old_instance.status == 'active' and self.status != 'active':
                self.class_obj.current_students -= 1
                self.class_obj.save()
            elif old_instance.status != 'active' and self.status == 'active':
                self.class_obj.current_students += 1
                self.class_obj.save()

class SubjectPrerequisite(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='prerequisites', verbose_name=_('Subject'))
    prerequisite_subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='required_for', verbose_name=_('Prerequisite Subject'))
    minimum_grade = models.CharField(max_length=5, choices=[
        ('A+', 'A+'), ('A', 'A'), ('A-', 'A-'),
        ('B+', 'B+'), ('B', 'B'), ('B-', 'B-'),
        ('C+', 'C+'), ('C', 'C'), ('C-', 'C-'),
        ('D+', 'D+'), ('D', 'D'), ('F', 'F')
    ], default='C', verbose_name=_('Minimum Grade'))
    is_mandatory = models.BooleanField(default=True, verbose_name=_('Is Mandatory'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))

    class Meta:
        verbose_name = _('Subject Prerequisite')
        verbose_name_plural = _('Subject Prerequisites')
        unique_together = ['subject', 'prerequisite_subject']

    def __str__(self):
        return f"{self.subject.name} requires {self.prerequisite_subject.name}"

class ClassSettings(models.Model):
    class_obj = models.OneToOneField(Class, on_delete=models.CASCADE, related_name='settings', verbose_name=_('Class'))
    max_absences = models.PositiveIntegerField(default=20, verbose_name=_('Maximum Absences'))
    attendance_required = models.BooleanField(default=True, verbose_name=_('Attendance Required'))
    grading_system = models.CharField(max_length=20, choices=[
        ('letter', _('Letter Grades')),
        ('percentage', _('Percentage')),
        ('gpa', _('GPA'))
    ], default='letter', verbose_name=_('Grading System'))
    pass_percentage = models.PositiveIntegerField(default=40, verbose_name=_('Pass Percentage'))
    allow_repeat = models.BooleanField(default=True, verbose_name=_('Allow Repeat'))
    max_repeats = models.PositiveIntegerField(default=2, verbose_name=_('Maximum Repeats'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Class Settings')
        verbose_name_plural = _('Class Settings')

    def __str__(self):
        return f"Settings for {self.class_obj.name}"
