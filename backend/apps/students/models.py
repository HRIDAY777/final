from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class Student(models.Model):
    """Student model with comprehensive profile information"""
    
    GENDER_CHOICES = [
        ('M', _('Male')),
        ('F', _('Female')),
        ('O', _('Other')),
    ]
    
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]
    
    STATUS_CHOICES = [
        ('active', _('Active')),
        ('inactive', _('Inactive')),
        ('graduated', _('Graduated')),
        ('transferred', _('Transferred')),
        ('suspended', _('Suspended')),
        ('expelled', _('Expelled')),
    ]
    
    # Basic Information
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_user')
    student_id = models.CharField(max_length=20, unique=True, verbose_name=_('Student ID'))
    admission_number = models.CharField(max_length=20, unique=True, verbose_name=_('Admission Number'))
    first_name = models.CharField(max_length=50, verbose_name=_('First Name'))
    last_name = models.CharField(max_length=50, verbose_name=_('Last Name'))
    middle_name = models.CharField(max_length=50, blank=True, verbose_name=_('Middle Name'))
    date_of_birth = models.DateField(verbose_name=_('Date of Birth'))
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, verbose_name=_('Gender'))
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES, blank=True, verbose_name=_('Blood Group'))
    
    # Contact Information
    email = models.EmailField(blank=True, verbose_name=_('Email'))
    phone = models.CharField(max_length=15, blank=True, verbose_name=_('Phone'))
    address = models.TextField(verbose_name=_('Address'))
    city = models.CharField(max_length=50, verbose_name=_('City'))
    state = models.CharField(max_length=50, verbose_name=_('State'))
    postal_code = models.CharField(max_length=10, verbose_name=_('Postal Code'))
    country = models.CharField(max_length=50, default='Bangladesh', verbose_name=_('Country'))
    
    # Academic Information
    current_class = models.ForeignKey('classes.Class', on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_('Current Class'))
    admission_date = models.DateField(verbose_name=_('Admission Date'))
    academic_year = models.ForeignKey('academic_years.AcademicYear', on_delete=models.SET_NULL, null=True, verbose_name=_('Academic Year'))
    
    # Multi-tenant support
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='students',
        verbose_name=_('Tenant')
    )
    
    # Status and Settings
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name=_('Status'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Student')
        verbose_name_plural = _('Students')
        ordering = ['first_name', 'last_name']
        indexes = [
            models.Index(fields=['student_id']),
            models.Index(fields=['admission_number']),
            models.Index(fields=['status']),
            models.Index(fields=['current_class']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.student_id})"
    
    @property
    def full_name(self):
        """Return full name of the student"""
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self):
        """Calculate student age"""
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))


class StudentProfile(models.Model):
    """Extended student profile information"""
    
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='profile')
    
    # Personal Information
    profile_picture = models.ImageField(upload_to='students/profiles/', blank=True, verbose_name=_('Profile Picture'))
    emergency_contact = models.CharField(max_length=15, blank=True, verbose_name=_('Emergency Contact'))
    emergency_contact_name = models.CharField(max_length=100, blank=True, verbose_name=_('Emergency Contact Name'))
    emergency_contact_relation = models.CharField(max_length=50, blank=True, verbose_name=_('Emergency Contact Relation'))
    
    # Medical Information
    medical_conditions = models.TextField(blank=True, verbose_name=_('Medical Conditions'))
    allergies = models.TextField(blank=True, verbose_name=_('Allergies'))
    medications = models.TextField(blank=True, verbose_name=_('Current Medications'))
    
    # Additional Information
    hobbies = models.TextField(blank=True, verbose_name=_('Hobbies'))
    achievements = models.TextField(blank=True, verbose_name=_('Achievements'))
    notes = models.TextField(blank=True, verbose_name=_('Notes'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Student Profile')
        verbose_name_plural = _('Student Profiles')
    
    def __str__(self):
        return f"Profile - {self.student.full_name}"


class StudentAcademicRecord(models.Model):
    """Student academic performance records"""
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='academic_records')
    academic_year = models.ForeignKey('academic_years.AcademicYear', on_delete=models.CASCADE, verbose_name=_('Academic Year'))
    class_enrolled = models.ForeignKey('classes.Class', on_delete=models.CASCADE, verbose_name=_('Class Enrolled'))
    
    # Academic Performance
    total_marks = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name=_('Total Marks'))
    obtained_marks = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name=_('Obtained Marks'))
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name=_('Percentage'))
    grade = models.CharField(max_length=2, blank=True, verbose_name=_('Grade'))
    rank = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('Rank'))
    
    # Attendance
    total_days = models.PositiveIntegerField(default=0, verbose_name=_('Total Days'))
    present_days = models.PositiveIntegerField(default=0, verbose_name=_('Present Days'))
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name=_('Attendance Percentage'))
    
    # Status
    is_promoted = models.BooleanField(default=False, verbose_name=_('Is Promoted'))
    promotion_date = models.DateField(null=True, blank=True, verbose_name=_('Promotion Date'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Student Academic Record')
        verbose_name_plural = _('Student Academic Records')
        unique_together = ['student', 'academic_year', 'class_enrolled']
        ordering = ['-academic_year', '-percentage']
    
    def __str__(self):
        return f"{self.student.full_name} - {self.academic_year} ({self.class_enrolled})"
    
    def save(self, *args, **kwargs):
        # Calculate percentage
        if self.total_marks > 0:
            self.percentage = (self.obtained_marks / self.total_marks) * 100
        
        # Calculate attendance percentage
        if self.total_days > 0:
            self.attendance_percentage = (self.present_days / self.total_days) * 100
        
        super().save(*args, **kwargs)


class StudentGuardian(models.Model):
    """Student guardian/parent information"""
    
    RELATIONSHIP_CHOICES = [
        ('father', _('Father')),
        ('mother', _('Mother')),
        ('guardian', _('Guardian')),
        ('grandfather', _('Grandfather')),
        ('grandmother', _('Grandmother')),
        ('uncle', _('Uncle')),
        ('aunt', _('Aunt')),
        ('other', _('Other')),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='guardians')
    relationship = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES, verbose_name=_('Relationship'))
    
    # Guardian Information
    first_name = models.CharField(max_length=50, verbose_name=_('First Name'))
    last_name = models.CharField(max_length=50, verbose_name=_('Last Name'))
    middle_name = models.CharField(max_length=50, blank=True, verbose_name=_('Middle Name'))
    date_of_birth = models.DateField(null=True, blank=True, verbose_name=_('Date of Birth'))
    
    # Contact Information
    email = models.EmailField(blank=True, verbose_name=_('Email'))
    phone = models.CharField(max_length=15, verbose_name=_('Phone'))
    alternate_phone = models.CharField(max_length=15, blank=True, verbose_name=_('Alternate Phone'))
    address = models.TextField(verbose_name=_('Address'))
    city = models.CharField(max_length=50, verbose_name=_('City'))
    state = models.CharField(max_length=50, verbose_name=_('State'))
    postal_code = models.CharField(max_length=10, verbose_name=_('Postal Code'))
    
    # Professional Information
    occupation = models.CharField(max_length=100, blank=True, verbose_name=_('Occupation'))
    employer = models.CharField(max_length=100, blank=True, verbose_name=_('Employer'))
    annual_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name=_('Annual Income'))
    
    # Additional Information
    is_primary_guardian = models.BooleanField(default=False, verbose_name=_('Is Primary Guardian'))
    is_emergency_contact = models.BooleanField(default=False, verbose_name=_('Is Emergency Contact'))
    notes = models.TextField(blank=True, verbose_name=_('Notes'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Student Guardian')
        verbose_name_plural = _('Student Guardians')
        ordering = ['-is_primary_guardian', 'first_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.get_relationship_display()}) - {self.student.full_name}"
    
    @property
    def full_name(self):
        """Return full name of the guardian"""
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"


class StudentDocument(models.Model):
    """Student documents and certificates"""
    
    DOCUMENT_TYPE_CHOICES = [
        ('birth_certificate', _('Birth Certificate')),
        ('admission_form', _('Admission Form')),
        ('transfer_certificate', _('Transfer Certificate')),
        ('character_certificate', _('Character Certificate')),
        ('medical_certificate', _('Medical Certificate')),
        ('income_certificate', _('Income Certificate')),
        ('caste_certificate', _('Caste Certificate')),
        ('disability_certificate', _('Disability Certificate')),
        ('other', _('Other')),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPE_CHOICES, verbose_name=_('Document Type'))
    title = models.CharField(max_length=200, verbose_name=_('Title'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    
    # File Information
    file = models.FileField(upload_to='students/documents/', verbose_name=_('File'))
    file_size = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('File Size (bytes)'))
    file_type = models.CharField(max_length=50, blank=True, verbose_name=_('File Type'))
    
    # Document Details
    issue_date = models.DateField(null=True, blank=True, verbose_name=_('Issue Date'))
    expiry_date = models.DateField(null=True, blank=True, verbose_name=_('Expiry Date'))
    issuing_authority = models.CharField(max_length=200, blank=True, verbose_name=_('Issuing Authority'))
    
    # Status
    is_verified = models.BooleanField(default=False, verbose_name=_('Is Verified'))
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_('Verified By'))
    verified_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Verified At'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Student Document')
        verbose_name_plural = _('Student Documents')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student.full_name} - {self.get_document_type_display()}"


class StudentAchievement(models.Model):
    """Student achievements and awards"""
    
    ACHIEVEMENT_TYPE_CHOICES = [
        ('academic', _('Academic')),
        ('sports', _('Sports')),
        ('cultural', _('Cultural')),
        ('leadership', _('Leadership')),
        ('community_service', _('Community Service')),
        ('competition', _('Competition')),
        ('other', _('Other')),
    ]
    
    LEVEL_CHOICES = [
        ('school', _('School')),
        ('district', _('District')),
        ('state', _('State')),
        ('national', _('National')),
        ('international', _('International')),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=200, verbose_name=_('Title'))
    description = models.TextField(verbose_name=_('Description'))
    achievement_type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPE_CHOICES, verbose_name=_('Achievement Type'))
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, verbose_name=_('Level'))
    
    # Achievement Details
    date_achieved = models.DateField(verbose_name=_('Date Achieved'))
    position = models.CharField(max_length=50, blank=True, verbose_name=_('Position/Rank'))
    prize_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name=_('Prize Amount'))
    
    # Certificate/Proof
    certificate = models.FileField(upload_to='students/achievements/', blank=True, verbose_name=_('Certificate'))
    certificate_number = models.CharField(max_length=100, blank=True, verbose_name=_('Certificate Number'))
    issuing_authority = models.CharField(max_length=200, blank=True, verbose_name=_('Issuing Authority'))
    
    # Additional Information
    points_awarded = models.PositiveIntegerField(default=0, verbose_name=_('Points Awarded'))
    is_verified = models.BooleanField(default=False, verbose_name=_('Is Verified'))
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_('Verified By'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Student Achievement')
        verbose_name_plural = _('Student Achievements')
        ordering = ['-date_achieved']
    
    def __str__(self):
        return f"{self.student.full_name} - {self.title}"


class StudentDiscipline(models.Model):
    """Student disciplinary records"""
    
    DISCIPLINE_TYPE_CHOICES = [
        ('warning', _('Warning')),
        ('reprimand', _('Reprimand')),
        ('detention', _('Detention')),
        ('suspension', _('Suspension')),
        ('expulsion', _('Expulsion')),
        ('other', _('Other')),
    ]
    
    SEVERITY_CHOICES = [
        ('minor', _('Minor')),
        ('moderate', _('Moderate')),
        ('major', _('Major')),
        ('severe', _('Severe')),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='disciplinary_records')
    discipline_type = models.CharField(max_length=20, choices=DISCIPLINE_TYPE_CHOICES, verbose_name=_('Discipline Type'))
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, verbose_name=_('Severity'))
    
    # Incident Details
    incident_date = models.DateField(verbose_name=_('Incident Date'))
    incident_description = models.TextField(verbose_name=_('Incident Description'))
    violation = models.CharField(max_length=200, verbose_name=_('Violation'))
    
    # Action Taken
    action_taken = models.TextField(verbose_name=_('Action Taken'))
    duration = models.CharField(max_length=50, blank=True, verbose_name=_('Duration'))
    start_date = models.DateField(null=True, blank=True, verbose_name=_('Start Date'))
    end_date = models.DateField(null=True, blank=True, verbose_name=_('End Date'))
    
    # Reporting
    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name=_('Reported By'))
    witnesses = models.TextField(blank=True, verbose_name=_('Witnesses'))
    
    # Follow-up
    is_resolved = models.BooleanField(default=False, verbose_name=_('Is Resolved'))
    resolution_date = models.DateField(null=True, blank=True, verbose_name=_('Resolution Date'))
    resolution_notes = models.TextField(blank=True, verbose_name=_('Resolution Notes'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Student Discipline')
        verbose_name_plural = _('Student Disciplines')
        ordering = ['-incident_date']
    
    def __str__(self):
        return f"{self.student.full_name} - {self.get_discipline_type_display()} ({self.incident_date})"


class StudentSettings(models.Model):
    """Student-specific settings and preferences"""
    
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='settings')
    
    # Notification Settings
    email_notifications = models.BooleanField(default=True, verbose_name=_('Email Notifications'))
    sms_notifications = models.BooleanField(default=True, verbose_name=_('SMS Notifications'))
    push_notifications = models.BooleanField(default=True, verbose_name=_('Push Notifications'))
    
    # Privacy Settings
    profile_visibility = models.CharField(max_length=20, choices=[
        ('public', _('Public')),
        ('private', _('Private')),
        ('friends_only', _('Friends Only')),
    ], default='public', verbose_name=_('Profile Visibility'))
    
    # Academic Settings
    grade_notifications = models.BooleanField(default=True, verbose_name=_('Grade Notifications'))
    attendance_notifications = models.BooleanField(default=True, verbose_name=_('Attendance Notifications'))
    assignment_notifications = models.BooleanField(default=True, verbose_name=_('Assignment Notifications'))
    
    # Communication Settings
    allow_teacher_messages = models.BooleanField(default=True, verbose_name=_('Allow Teacher Messages'))
    allow_guardian_messages = models.BooleanField(default=True, verbose_name=_('Allow Guardian Messages'))
    allow_class_messages = models.BooleanField(default=True, verbose_name=_('Allow Class Messages'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Student Settings')
        verbose_name_plural = _('Student Settings')
    
    def __str__(self):
        return f"Settings - {self.student.full_name}"
