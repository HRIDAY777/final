from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class NoticeCategory(models.Model):
    """Notice category model"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name=_('Category Name'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    color = models.CharField(max_length=7, default='#3B82F6', verbose_name=_('Color'))
    icon = models.CharField(max_length=50, default='bell', verbose_name=_('Icon'))
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Notice Category')
        verbose_name_plural = _('Notice Categories')
        ordering = ['name']

    def __str__(self):
        return self.name


class Notice(models.Model):
    """Notice model for school announcements and communications"""
    
    PRIORITY_CHOICES = [
        ('low', _('Low')),
        ('medium', _('Medium')),
        ('high', _('High')),
        ('urgent', _('Urgent')),
    ]
    
    STATUS_CHOICES = [
        ('draft', _('Draft')),
        ('published', _('Published')),
        ('archived', _('Archived')),
        ('expired', _('Expired')),
    ]
    
    TARGET_AUDIENCE_CHOICES = [
        ('all', _('All Users')),
        ('students', _('Students Only')),
        ('teachers', _('Teachers Only')),
        ('parents', _('Parents Only')),
        ('staff', _('Staff Only')),
        ('specific_class', _('Specific Class')),
        ('specific_grade', _('Specific Grade')),
        ('custom', _('Custom Selection')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, verbose_name=_('Title'))
    content = models.TextField(verbose_name=_('Content'))
    summary = models.TextField(blank=True, verbose_name=_('Summary'))
    
    # Categorization
    category = models.ForeignKey(
        NoticeCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name=_('Category')
    )
    priority = models.CharField(
        max_length=20, 
        choices=PRIORITY_CHOICES, 
        default='medium',
        verbose_name=_('Priority')
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='draft',
        verbose_name=_('Status')
    )
    
    # Targeting
    target_audience = models.CharField(
        max_length=20,
        choices=TARGET_AUDIENCE_CHOICES,
        default='all',
        verbose_name=_('Target Audience')
    )
    target_classes = models.ManyToManyField(
        'classes.Class',
        blank=True,
        verbose_name=_('Target Classes')
    )
    # target_grades removed - Grade model not found
    target_users = models.ManyToManyField(
        User,
        blank=True,
        verbose_name=_('Target Users')
    )
    
    # Scheduling
    publish_date = models.DateTimeField(verbose_name=_('Publish Date'))
    expiry_date = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name=_('Expiry Date')
    )
    
    # Author and approval
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='authored_notices',
        verbose_name=_('Author')
    )
    requires_approval = models.BooleanField(default=False, verbose_name=_('Requires Approval'))
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_notices',
        verbose_name=_('Approved By')
    )
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Approved At'))
    
    # Delivery settings
    send_email = models.BooleanField(default=True, verbose_name=_('Send Email'))
    send_sms = models.BooleanField(default=False, verbose_name=_('Send SMS'))
    send_push = models.BooleanField(default=True, verbose_name=_('Send Push Notification'))
    pin_to_top = models.BooleanField(default=False, verbose_name=_('Pin to Top'))
    
    # Analytics
    views_count = models.PositiveIntegerField(default=0, verbose_name=_('Views Count'))
    read_count = models.PositiveIntegerField(default=0, verbose_name=_('Read Count'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    published_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Published At'))

    class Meta:
        verbose_name = _('Notice')
        verbose_name_plural = _('Notices')
        ordering = ['-publish_date', '-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Set published_at when status changes to published
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        """Check if notice has expired"""
        if self.expiry_date:
            return timezone.now() > self.expiry_date
        return False

    @property
    def is_published(self):
        """Check if notice is currently published"""
        if self.status != 'published':
            return False
        if self.publish_date > timezone.now():
            return False
        if self.is_expired:
            return False
        return True


class NoticeAttachment(models.Model):
    """Notice attachment model"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notice = models.ForeignKey(
        Notice,
        on_delete=models.CASCADE,
        related_name='attachments',
        verbose_name=_('Notice')
    )
    file = models.FileField(upload_to='notices/attachments/', verbose_name=_('File'))
    filename = models.CharField(max_length=255, verbose_name=_('Filename'))
    file_size = models.PositiveIntegerField(verbose_name=_('File Size (bytes)'))
    file_type = models.CharField(max_length=100, verbose_name=_('File Type'))
    description = models.CharField(max_length=255, blank=True, verbose_name=_('Description'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))

    class Meta:
        verbose_name = _('Notice Attachment')
        verbose_name_plural = _('Notice Attachments')

    def __str__(self):
        return f"{self.filename} - {self.notice.title}"

    def save(self, *args, **kwargs):
        if not self.filename:
            self.filename = self.file.name.split('/')[-1]
        if not self.file_size:
            self.file_size = self.file.size
        super().save(*args, **kwargs)


class NoticeRecipient(models.Model):
    """Notice recipient tracking model"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notice = models.ForeignKey(
        Notice,
        on_delete=models.CASCADE,
        related_name='recipients',
        verbose_name=_('Notice')
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_notices',
        verbose_name=_('User')
    )
    
    # Delivery status
    email_sent = models.BooleanField(default=False, verbose_name=_('Email Sent'))
    sms_sent = models.BooleanField(default=False, verbose_name=_('SMS Sent'))
    push_sent = models.BooleanField(default=False, verbose_name=_('Push Sent'))
    
    # Read status
    is_read = models.BooleanField(default=False, verbose_name=_('Is Read'))
    read_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Read At'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Notice Recipient')
        verbose_name_plural = _('Notice Recipients')
        unique_together = ['notice', 'user']

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.notice.title}"

    def mark_as_read(self):
        """Mark notice as read for this recipient"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()
            # Update notice read count
            self.notice.read_count += 1
            self.notice.save(update_fields=['read_count'])


class NoticeTemplate(models.Model):
    """Notice template model for reusable notice formats"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name=_('Template Name'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    subject = models.CharField(max_length=200, verbose_name=_('Subject'))
    content = models.TextField(verbose_name=_('Content'))
    category = models.ForeignKey(
        NoticeCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Category')
    )
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_notice_templates',
        verbose_name=_('Created By')
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Notice Template')
        verbose_name_plural = _('Notice Templates')
        ordering = ['name']

    def __str__(self):
        return self.name
