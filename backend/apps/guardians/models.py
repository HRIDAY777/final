from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

User = get_user_model()


class Guardian(models.Model):
    """Guardian model for managing guardian information"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='guardian_profile')
    guardian_id = models.CharField(max_length=20, unique=True, verbose_name=_('Guardian ID'))
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
    alternate_phone = models.CharField(max_length=15, blank=True, verbose_name=_('Alternate Phone'))
    address = models.TextField(verbose_name=_('Address'))
    city = models.CharField(max_length=50, verbose_name=_('City'))
    state = models.CharField(max_length=50, verbose_name=_('State'))
    postal_code = models.CharField(max_length=10, verbose_name=_('Postal Code'))
    country = models.CharField(max_length=50, default='Bangladesh', verbose_name=_('Country'))
    
    # Professional information
    occupation = models.CharField(max_length=100, blank=True, verbose_name=_('Occupation'))
    employer = models.CharField(max_length=100, blank=True, verbose_name=_('Employer'))
    annual_income = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        null=True, 
        blank=True, 
        verbose_name=_('Annual Income')
    )
    education_level = models.CharField(
        max_length=50,
        choices=[
            ('primary', _('Primary')),
            ('secondary', _('Secondary')),
            ('higher_secondary', _('Higher Secondary')),
            ('bachelor', _('Bachelor')),
            ('master', _('Master')),
            ('phd', _('PhD')),
            ('other', _('Other')),
        ],
        blank=True,
        verbose_name=_('Education Level')
    )
    
    # Status and settings
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', _('Active')),
            ('inactive', _('Inactive')),
            ('suspended', _('Suspended')),
        ],
        default='active',
        verbose_name=_('Status')
    )
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Guardian')
        verbose_name_plural = _('Guardians')
        ordering = ['first_name', 'last_name']
        indexes = [
            models.Index(fields=['guardian_id']),
            models.Index(fields=['status']),
            models.Index(fields=['occupation']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.guardian_id})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def age(self):
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))


class GuardianProfile(models.Model):
    """Guardian profile model for additional information"""
    
    guardian = models.OneToOneField(Guardian, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to='guardians/profiles/', blank=True, verbose_name=_('Profile Picture'))
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
    spouse_occupation = models.CharField(max_length=100, blank=True, verbose_name=_('Spouse Occupation'))
    spouse_phone = models.CharField(max_length=15, blank=True, verbose_name=_('Spouse Phone'))
    
    # Family information
    total_children = models.PositiveIntegerField(default=1, verbose_name=_('Total Children'))
    children_in_school = models.PositiveIntegerField(default=1, verbose_name=_('Children in School'))
    
    # Additional information
    preferred_contact_method = models.CharField(
        max_length=20,
        choices=[
            ('phone', _('Phone')),
            ('email', _('Email')),
            ('sms', _('SMS')),
            ('whatsapp', _('WhatsApp')),
        ],
        default='phone',
        verbose_name=_('Preferred Contact Method')
    )
    preferred_contact_time = models.CharField(
        max_length=20,
        choices=[
            ('morning', _('Morning (8 AM - 12 PM)')),
            ('afternoon', _('Afternoon (12 PM - 4 PM)')),
            ('evening', _('Evening (4 PM - 8 PM)')),
            ('night', _('Night (8 PM - 12 AM)')),
        ],
        default='evening',
        verbose_name=_('Preferred Contact Time')
    )
    
    # Social media and web presence
    facebook_profile = models.URLField(blank=True, verbose_name=_('Facebook Profile'))
    linkedin_profile = models.URLField(blank=True, verbose_name=_('LinkedIn Profile'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Guardian Profile')
        verbose_name_plural = _('Guardian Profiles')

    def __str__(self):
        return f"Profile - {self.guardian.full_name}"


class GuardianStudent(models.Model):
    """Guardian-Student relationship model"""
    
    guardian = models.ForeignKey(Guardian, on_delete=models.CASCADE, related_name='students')
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='guardian_relationships')
    relationship = models.CharField(
        max_length=20,
        choices=[
            ('father', _('Father')),
            ('mother', _('Mother')),
            ('grandfather', _('Grandfather')),
            ('grandmother', _('Grandmother')),
            ('uncle', _('Uncle')),
            ('aunt', _('Aunt')),
            ('brother', _('Brother')),
            ('sister', _('Sister')),
            ('guardian', _('Legal Guardian')),
            ('other', _('Other')),
        ],
        verbose_name=_('Relationship')
    )
    is_primary_guardian = models.BooleanField(default=False, verbose_name=_('Is Primary Guardian'))
    is_emergency_contact = models.BooleanField(default=False, verbose_name=_('Is Emergency Contact'))
    is_fee_payer = models.BooleanField(default=False, verbose_name=_('Is Fee Payer'))
    is_authorized_pickup = models.BooleanField(default=False, verbose_name=_('Is Authorized Pickup'))
    
    # Additional permissions
    can_view_academic_records = models.BooleanField(default=True, verbose_name=_('Can View Academic Records'))
    can_view_attendance = models.BooleanField(default=True, verbose_name=_('Can View Attendance'))
    can_view_fees = models.BooleanField(default=True, verbose_name=_('Can View Fees'))
    can_receive_notifications = models.BooleanField(default=True, verbose_name=_('Can Receive Notifications'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Guardian Student')
        verbose_name_plural = _('Guardian Students')
        unique_together = ['guardian', 'student']
        ordering = ['guardian__first_name', 'student__first_name']

    def __str__(self):
        return f"{self.guardian.full_name} - {self.student.full_name} ({self.get_relationship_display()})"


class GuardianDocument(models.Model):
    """Guardian document model"""
    
    guardian = models.ForeignKey(Guardian, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(
        max_length=30,
        choices=[
            ('id_proof', _('ID Proof')),
            ('address_proof', _('Address Proof')),
            ('income_certificate', _('Income Certificate')),
            ('employment_certificate', _('Employment Certificate')),
            ('marriage_certificate', _('Marriage Certificate')),
            ('divorce_certificate', _('Divorce Certificate')),
            ('death_certificate', _('Death Certificate')),
            ('guardianship_certificate', _('Guardianship Certificate')),
            ('other', _('Other')),
        ],
        verbose_name=_('Document Type')
    )
    title = models.CharField(max_length=200, verbose_name=_('Title'))
    file = models.FileField(upload_to='guardians/documents/', verbose_name=_('File'))
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
        related_name='verified_guardian_documents',
        verbose_name=_('Verified By')
    )
    verified_date = models.DateTimeField(null=True, blank=True, verbose_name=_('Verified Date'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Guardian Document')
        verbose_name_plural = _('Guardian Documents')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_document_type_display()} - {self.guardian.full_name}"

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
            self.file_type = self.file.name.split('.')[-1].lower()
        super().save(*args, **kwargs)


class GuardianSettings(models.Model):
    """Guardian settings model"""
    
    guardian = models.OneToOneField(Guardian, on_delete=models.CASCADE, related_name='settings')
    
    # Notification settings
    email_notifications = models.BooleanField(default=True, verbose_name=_('Email Notifications'))
    sms_notifications = models.BooleanField(default=True, verbose_name=_('SMS Notifications'))
    push_notifications = models.BooleanField(default=True, verbose_name=_('Push Notifications'))
    
    # Specific notification types
    academic_notifications = models.BooleanField(default=True, verbose_name=_('Academic Notifications'))
    attendance_notifications = models.BooleanField(default=True, verbose_name=_('Attendance Notifications'))
    fee_notifications = models.BooleanField(default=True, verbose_name=_('Fee Notifications'))
    event_notifications = models.BooleanField(default=True, verbose_name=_('Event Notifications'))
    emergency_notifications = models.BooleanField(default=True, verbose_name=_('Emergency Notifications'))
    
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
    
    # Communication preferences
    communication_frequency = models.CharField(
        max_length=20,
        choices=[
            ('daily', _('Daily')),
            ('weekly', _('Weekly')),
            ('monthly', _('Monthly')),
            ('as_needed', _('As Needed')),
        ],
        default='as_needed',
        verbose_name=_('Communication Frequency')
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Guardian Settings')
        verbose_name_plural = _('Guardian Settings')

    def __str__(self):
        return f"Settings - {self.guardian.full_name}"


class GuardianNotification(models.Model):
    """Guardian notification model"""
    
    guardian = models.ForeignKey(Guardian, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200, verbose_name=_('Title'))
    message = models.TextField(verbose_name=_('Message'))
    notification_type = models.CharField(
        max_length=20,
        choices=[
            ('academic', _('Academic')),
            ('attendance', _('Attendance')),
            ('fee', _('Fee')),
            ('event', _('Event')),
            ('emergency', _('Emergency')),
            ('general', _('General')),
        ],
        verbose_name=_('Notification Type')
    )
    priority = models.CharField(
        max_length=20,
        choices=[
            ('low', _('Low')),
            ('medium', _('Medium')),
            ('high', _('High')),
            ('urgent', _('Urgent')),
        ],
        default='medium',
        verbose_name=_('Priority')
    )
    
    # Delivery status
    email_sent = models.BooleanField(default=False, verbose_name=_('Email Sent'))
    sms_sent = models.BooleanField(default=False, verbose_name=_('SMS Sent'))
    push_sent = models.BooleanField(default=False, verbose_name=_('Push Sent'))
    read = models.BooleanField(default=False, verbose_name=_('Read'))
    read_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Read At'))
    
    # Related objects
    related_student = models.ForeignKey(
        'students.Student', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name=_('Related Student')
    )
    related_event = models.ForeignKey(
        'events.Event', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name=_('Related Event')
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Guardian Notification')
        verbose_name_plural = _('Guardian Notifications')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.guardian.full_name}"

    def mark_as_read(self):
        """Mark notification as read"""
        self.read = True
        self.read_at = timezone.now()
        self.save()
