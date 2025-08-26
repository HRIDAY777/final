from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class Teacher(models.Model):
    """Teacher model for managing teacher information"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_user')
    teacher_id = models.CharField(max_length=20, unique=True, verbose_name=_('Teacher ID'))
    employee_number = models.CharField(max_length=20, unique=True, verbose_name=_('Employee Number'))
    first_name = models.CharField(max_length=50, verbose_name=_('First Name'))
    last_name = models.CharField(max_length=50, verbose_name=_('Last Name'))
    middle_name = models.CharField(max_length=50, blank=True, verbose_name=_('Middle Name'))
    date_of_birth = models.DateField(verbose_name=_('Date of Birth'))
    gender = models.CharField(
        max_length=1, 
        choices=[('M', _('Male')), ('F', _('Female')), ('O', _('Other'))], 
        verbose_name=_('Gender')
    )
    blood_group = models.CharField(max_length=5, blank=True, verbose_name=_('Blood Group'))
    email = models.EmailField(unique=True, verbose_name=_('Email'))
    phone = models.CharField(max_length=15, verbose_name=_('Phone'))
    address = models.TextField(verbose_name=_('Address'))
    city = models.CharField(max_length=50, verbose_name=_('City'))
    state = models.CharField(max_length=50, verbose_name=_('State'))
    postal_code = models.CharField(max_length=10, verbose_name=_('Postal Code'))
    country = models.CharField(max_length=50, default='Bangladesh', verbose_name=_('Country'))
    
    # Employment details
    joining_date = models.DateField(verbose_name=_('Joining Date'))
    employment_type = models.CharField(
        max_length=20,
        choices=[
            ('full_time', _('Full Time')),
            ('part_time', _('Part Time')),
            ('contract', _('Contract')),
            ('visiting', _('Visiting')),
        ],
        default='full_time',
        verbose_name=_('Employment Type')
    )
    designation = models.CharField(max_length=100, verbose_name=_('Designation'))
    department = models.CharField(max_length=100, verbose_name=_('Department'))
    qualification = models.CharField(max_length=100, verbose_name=_('Highest Qualification'))
    specialization = models.CharField(max_length=200, blank=True, verbose_name=_('Specialization'))
    
    # Status and settings
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', _('Active')),
            ('inactive', _('Inactive')),
            ('suspended', _('Suspended')),
            ('resigned', _('Resigned')),
            ('retired', _('Retired')),
        ],
        default='active',
        verbose_name=_('Status')
    )
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Teacher')
        verbose_name_plural = _('Teachers')
        ordering = ['first_name', 'last_name']
        indexes = [
            models.Index(fields=['teacher_id']),
            models.Index(fields=['employee_number']),
            models.Index(fields=['status']),
            models.Index(fields=['department']),
            models.Index(fields=['employment_type']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.teacher_id})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def age(self):
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))

    @property
    def experience_years(self):
        from datetime import date
        today = date.today()
        return today.year - self.joining_date.year - ((today.month, today.day) < (self.joining_date.month, self.joining_date.day))


class TeacherProfile(models.Model):
    """Teacher profile model for additional information"""
    
    teacher = models.OneToOneField(Teacher, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to='teachers/profiles/', blank=True, verbose_name=_('Profile Picture'))
    emergency_contact = models.CharField(max_length=15, blank=True, verbose_name=_('Emergency Contact'))
    emergency_contact_name = models.CharField(max_length=100, blank=True, verbose_name=_('Emergency Contact Name'))
    emergency_contact_relationship = models.CharField(max_length=50, blank=True, verbose_name=_('Emergency Contact Relationship'))
    
    # Personal information
    marital_status = models.CharField(
        max_length=20,
        choices=[
            ('single', _('Single')),
            ('married', _('Married')),
            ('divorced', _('Divorced')),
            ('widowed', _('Widowed')),
        ],
        blank=True,
        verbose_name=_('Marital Status')
    )
    spouse_name = models.CharField(max_length=100, blank=True, verbose_name=_('Spouse Name'))
    children_count = models.PositiveIntegerField(default=0, verbose_name=_('Number of Children'))
    
    # Professional information
    teaching_experience_years = models.PositiveIntegerField(default=0, verbose_name=_('Teaching Experience (Years)'))
    previous_schools = models.TextField(blank=True, verbose_name=_('Previous Schools'))
    achievements = models.TextField(blank=True, verbose_name=_('Achievements'))
    publications = models.TextField(blank=True, verbose_name=_('Publications'))
    research_interests = models.TextField(blank=True, verbose_name=_('Research Interests'))
    
    # Social media and web presence
    linkedin_profile = models.URLField(blank=True, verbose_name=_('LinkedIn Profile'))
    twitter_profile = models.URLField(blank=True, verbose_name=_('Twitter Profile'))
    personal_website = models.URLField(blank=True, verbose_name=_('Personal Website'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Teacher Profile')
        verbose_name_plural = _('Teacher Profiles')

    def __str__(self):
        return f"Profile - {self.teacher.full_name}"


class TeacherQualification(models.Model):
    """Teacher qualification model"""
    
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='qualifications')
    degree = models.CharField(max_length=100, verbose_name=_('Degree'))
    institution = models.CharField(max_length=200, verbose_name=_('Institution'))
    field_of_study = models.CharField(max_length=100, verbose_name=_('Field of Study'))
    completion_year = models.PositiveIntegerField(verbose_name=_('Completion Year'))
    grade_cgpa = models.CharField(max_length=20, blank=True, verbose_name=_('Grade/CGPA'))
    certificate = models.FileField(upload_to='teachers/qualifications/', blank=True, verbose_name=_('Certificate'))
    is_verified = models.BooleanField(default=False, verbose_name=_('Is Verified'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Teacher Qualification')
        verbose_name_plural = _('Teacher Qualifications')
        ordering = ['-completion_year']

    def __str__(self):
        return f"{self.degree} - {self.teacher.full_name}"


class TeacherExperience(models.Model):
    """Teacher experience model"""
    
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='experiences')
    organization = models.CharField(max_length=200, verbose_name=_('Organization'))
    position = models.CharField(max_length=100, verbose_name=_('Position'))
    start_date = models.DateField(verbose_name=_('Start Date'))
    end_date = models.DateField(null=True, blank=True, verbose_name=_('End Date'))
    is_current = models.BooleanField(default=False, verbose_name=_('Is Current Position'))
    description = models.TextField(blank=True, verbose_name=_('Job Description'))
    achievements = models.TextField(blank=True, verbose_name=_('Achievements'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Teacher Experience')
        verbose_name_plural = _('Teacher Experiences')
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.position} at {self.organization} - {self.teacher.full_name}"


class TeacherSubject(models.Model):
    """Teacher subject assignment model"""
    
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='subjects')
    subject = models.ForeignKey('classes.Subject', on_delete=models.CASCADE, verbose_name=_('Subject'))
    is_primary = models.BooleanField(default=False, verbose_name=_('Is Primary Subject'))
    expertise_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', _('Beginner')),
            ('intermediate', _('Intermediate')),
            ('advanced', _('Advanced')),
            ('expert', _('Expert')),
        ],
        default='intermediate',
        verbose_name=_('Expertise Level')
    )
    years_teaching = models.PositiveIntegerField(default=0, verbose_name=_('Years Teaching This Subject'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Teacher Subject')
        verbose_name_plural = _('Teacher Subjects')
        unique_together = ['teacher', 'subject']

    def __str__(self):
        return f"{self.teacher.full_name} - {self.subject.name}"


class TeacherClass(models.Model):
    """Teacher class assignment model"""
    
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='classes')
    class_obj = models.ForeignKey('classes.Class', on_delete=models.CASCADE, verbose_name=_('Class'))
    academic_year = models.ForeignKey('academic_years.AcademicYear', on_delete=models.CASCADE, verbose_name=_('Academic Year'))
    role = models.CharField(
        max_length=20,
        choices=[
            ('class_teacher', _('Class Teacher')),
            ('subject_teacher', _('Subject Teacher')),
            ('assistant_teacher', _('Assistant Teacher')),
        ],
        default='subject_teacher',
        verbose_name=_('Role')
    )
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Teacher Class')
        verbose_name_plural = _('Teacher Classes')
        unique_together = ['teacher', 'class_obj', 'academic_year']

    def __str__(self):
        return f"{self.teacher.full_name} - {self.class_obj.name} ({self.get_role_display()})"


class TeacherAttendance(models.Model):
    """Teacher attendance model"""
    
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField(verbose_name=_('Date'))
    status = models.CharField(
        max_length=20,
        choices=[
            ('present', _('Present')),
            ('absent', _('Absent')),
            ('late', _('Late')),
            ('half_day', _('Half Day')),
            ('leave', _('On Leave')),
        ],
        default='present',
        verbose_name=_('Status')
    )
    check_in_time = models.TimeField(null=True, blank=True, verbose_name=_('Check In Time'))
    check_out_time = models.TimeField(null=True, blank=True, verbose_name=_('Check Out Time'))
    working_hours = models.DecimalField(
        max_digits=4, 
        decimal_places=2, 
        null=True, 
        blank=True, 
        verbose_name=_('Working Hours')
    )
    remarks = models.TextField(blank=True, verbose_name=_('Remarks'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Teacher Attendance')
        verbose_name_plural = _('Teacher Attendance')
        unique_together = ['teacher', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.teacher.full_name} - {self.date} ({self.get_status_display()})"


class TeacherSalary(models.Model):
    """Teacher salary model"""
    
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='salaries')
    month = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)], verbose_name=_('Month'))
    year = models.PositiveIntegerField(verbose_name=_('Year'))
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Basic Salary'))
    house_rent_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('House Rent Allowance'))
    medical_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Medical Allowance'))
    transport_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Transport Allowance'))
    other_allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Other Allowances'))
    gross_salary = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Gross Salary'))
    
    # Deductions
    provident_fund = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Provident Fund'))
    tax_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Tax Deduction'))
    other_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Other Deductions'))
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Total Deductions'))
    
    # Net salary
    net_salary = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Net Salary'))
    
    # Payment status
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', _('Pending')),
            ('paid', _('Paid')),
            ('partial', _('Partial')),
        ],
        default='pending',
        verbose_name=_('Payment Status')
    )
    payment_date = models.DateField(null=True, blank=True, verbose_name=_('Payment Date'))
    payment_method = models.CharField(max_length=50, blank=True, verbose_name=_('Payment Method'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Teacher Salary')
        verbose_name_plural = _('Teacher Salaries')
        unique_together = ['teacher', 'month', 'year']
        ordering = ['-year', '-month']

    def __str__(self):
        return f"{self.teacher.full_name} - {self.month}/{self.year}"

    def save(self, *args, **kwargs):
        # Calculate gross salary
        self.gross_salary = (
            self.basic_salary + 
            self.house_rent_allowance + 
            self.medical_allowance + 
            self.transport_allowance + 
            self.other_allowances
        )
        
        # Calculate total deductions
        self.total_deductions = (
            self.provident_fund + 
            self.tax_deduction + 
            self.other_deductions
        )
        
        # Calculate net salary
        self.net_salary = self.gross_salary - self.total_deductions
        
        super().save(*args, **kwargs)


class TeacherLeave(models.Model):
    """Teacher leave model"""
    
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='leaves')
    leave_type = models.CharField(
        max_length=20,
        choices=[
            ('casual', _('Casual Leave')),
            ('sick', _('Sick Leave')),
            ('annual', _('Annual Leave')),
            ('maternity', _('Maternity Leave')),
            ('paternity', _('Paternity Leave')),
            ('study', _('Study Leave')),
            ('other', _('Other')),
        ],
        verbose_name=_('Leave Type')
    )
    start_date = models.DateField(verbose_name=_('Start Date'))
    end_date = models.DateField(verbose_name=_('End Date'))
    total_days = models.PositiveIntegerField(verbose_name=_('Total Days'))
    reason = models.TextField(verbose_name=_('Reason'))
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', _('Pending')),
            ('approved', _('Approved')),
            ('rejected', _('Rejected')),
            ('cancelled', _('Cancelled')),
        ],
        default='pending',
        verbose_name=_('Status')
    )
    approved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='approved_teacher_leaves',
        verbose_name=_('Approved By')
    )
    approved_date = models.DateTimeField(null=True, blank=True, verbose_name=_('Approved Date'))
    remarks = models.TextField(blank=True, verbose_name=_('Remarks'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Teacher Leave')
        verbose_name_plural = _('Teacher Leaves')
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.teacher.full_name} - {self.get_leave_type_display()} ({self.start_date} to {self.end_date})"


class TeacherPerformance(models.Model):
    """Teacher performance evaluation model"""
    
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='performance_records')
    academic_year = models.ForeignKey('academic_years.AcademicYear', on_delete=models.CASCADE, verbose_name=_('Academic Year'))
    evaluation_period = models.CharField(
        max_length=20,
        choices=[
            ('quarterly', _('Quarterly')),
            ('semester', _('Semester')),
            ('annual', _('Annual')),
        ],
        verbose_name=_('Evaluation Period')
    )
    evaluation_date = models.DateField(verbose_name=_('Evaluation Date'))
    
    # Performance metrics (1-10 scale)
    teaching_quality = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        verbose_name=_('Teaching Quality')
    )
    student_engagement = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        verbose_name=_('Student Engagement')
    )
    classroom_management = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        verbose_name=_('Classroom Management')
    )
    communication_skills = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        verbose_name=_('Communication Skills')
    )
    professional_development = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        verbose_name=_('Professional Development')
    )
    teamwork = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        verbose_name=_('Teamwork')
    )
    attendance_punctuality = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        verbose_name=_('Attendance & Punctuality')
    )
    
    # Calculated fields
    overall_score = models.DecimalField(max_digits=4, decimal_places=2, verbose_name=_('Overall Score'))
    grade = models.CharField(max_length=2, verbose_name=_('Grade'))
    
    # Evaluation details
    strengths = models.TextField(blank=True, verbose_name=_('Strengths'))
    areas_for_improvement = models.TextField(blank=True, verbose_name=_('Areas for Improvement'))
    recommendations = models.TextField(blank=True, verbose_name=_('Recommendations'))
    evaluator_comments = models.TextField(blank=True, verbose_name=_('Evaluator Comments'))
    
    # Evaluator information
    evaluated_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='teacher_evaluations',
        verbose_name=_('Evaluated By')
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Teacher Performance')
        verbose_name_plural = _('Teacher Performance')
        unique_together = ['teacher', 'academic_year', 'evaluation_period']
        ordering = ['-evaluation_date']

    def __str__(self):
        return f"{self.teacher.full_name} - {self.academic_year.name} ({self.get_evaluation_period_display()})"

    def save(self, *args, **kwargs):
        # Calculate overall score
        scores = [
            self.teaching_quality,
            self.student_engagement,
            self.classroom_management,
            self.communication_skills,
            self.professional_development,
            self.teamwork,
            self.attendance_punctuality
        ]
        self.overall_score = sum(scores) / len(scores)
        
        # Determine grade
        if self.overall_score >= 9.0:
            self.grade = 'A+'
        elif self.overall_score >= 8.0:
            self.grade = 'A'
        elif self.overall_score >= 7.0:
            self.grade = 'B+'
        elif self.overall_score >= 6.0:
            self.grade = 'B'
        elif self.overall_score >= 5.0:
            self.grade = 'C+'
        elif self.overall_score >= 4.0:
            self.grade = 'C'
        else:
            self.grade = 'D'
        
        super().save(*args, **kwargs)


class TeacherDocument(models.Model):
    """Teacher document model"""
    
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(
        max_length=30,
        choices=[
            ('cv_resume', _('CV/Resume')),
            ('educational_certificate', _('Educational Certificate')),
            ('experience_certificate', _('Experience Certificate')),
            ('id_proof', _('ID Proof')),
            ('address_proof', _('Address Proof')),
            ('medical_certificate', _('Medical Certificate')),
            ('police_verification', _('Police Verification')),
            ('contract_agreement', _('Contract Agreement')),
            ('other', _('Other')),
        ],
        verbose_name=_('Document Type')
    )
    title = models.CharField(max_length=200, verbose_name=_('Title'))
    file = models.FileField(upload_to='teachers/documents/', verbose_name=_('File'))
    file_size = models.PositiveIntegerField(blank=True, verbose_name=_('File Size (bytes)'))
    file_type = models.CharField(max_length=20, blank=True, verbose_name=_('File Type'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    expiry_date = models.DateField(null=True, blank=True, verbose_name=_('Expiry Date'))
    is_verified = models.BooleanField(default=False, verbose_name=_('Is Verified'))
    verified_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='verified_teacher_documents',
        verbose_name=_('Verified By')
    )
    verified_date = models.DateTimeField(null=True, blank=True, verbose_name=_('Verified Date'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Teacher Document')
        verbose_name_plural = _('Teacher Documents')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_document_type_display()} - {self.teacher.full_name}"

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
            self.file_type = self.file.name.split('.')[-1].lower()
        super().save(*args, **kwargs)


class TeacherSettings(models.Model):
    """Teacher settings model"""
    
    teacher = models.OneToOneField(Teacher, on_delete=models.CASCADE, related_name='settings')
    
    # Notification settings
    email_notifications = models.BooleanField(default=True, verbose_name=_('Email Notifications'))
    sms_notifications = models.BooleanField(default=True, verbose_name=_('SMS Notifications'))
    push_notifications = models.BooleanField(default=True, verbose_name=_('Push Notifications'))
    
    # Specific notification types
    attendance_notifications = models.BooleanField(default=True, verbose_name=_('Attendance Notifications'))
    leave_notifications = models.BooleanField(default=True, verbose_name=_('Leave Notifications'))
    salary_notifications = models.BooleanField(default=True, verbose_name=_('Salary Notifications'))
    performance_notifications = models.BooleanField(default=True, verbose_name=_('Performance Notifications'))
    event_notifications = models.BooleanField(default=True, verbose_name=_('Event Notifications'))
    
    # Privacy settings
    profile_visibility = models.CharField(
        max_length=20,
        choices=[
            ('public', _('Public')),
            ('staff_only', _('Staff Only')),
            ('private', _('Private')),
        ],
        default='staff_only',
        verbose_name=_('Profile Visibility')
    )
    
    # Theme settings
    theme_preference = models.CharField(
        max_length=20,
        choices=[
            ('light', _('Light')),
            ('dark', _('Dark')),
            ('auto', _('Auto')),
        ],
        default='auto',
        verbose_name=_('Theme Preference')
    )
    
    # Language settings
    language_preference = models.CharField(
        max_length=10,
        choices=[
            ('en', _('English')),
            ('bn', _('Bangla')),
        ],
        default='en',
        verbose_name=_('Language Preference')
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Teacher Settings')
        verbose_name_plural = _('Teacher Settings')

    def __str__(self):
        return f"Settings - {self.teacher.full_name}"
