from django.db import models
from django.utils.translation import gettext_lazy as _
import uuid


class Event(models.Model):
    """Event model for school events and activities"""
    
    EVENT_TYPES = [
        ('academic', _('Academic')),
        ('sports', _('Sports')),
        ('cultural', _('Cultural')),
        ('social', _('Social')),
        ('other', _('Other')),
    ]
    
    STATUS_CHOICES = [
        ('upcoming', _('Upcoming')),
        ('ongoing', _('Ongoing')),
        ('completed', _('Completed')),
        ('cancelled', _('Cancelled')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, verbose_name=_('Event Title'))
    description = models.TextField(verbose_name=_('Description'))
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES, default='other', verbose_name=_('Event Type'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming', verbose_name=_('Status'))
    
    # Date and Time
    start_date = models.DateField(verbose_name=_('Start Date'))
    end_date = models.DateField(verbose_name=_('End Date'))
    start_time = models.TimeField(verbose_name=_('Start Time'))
    end_time = models.TimeField(verbose_name=_('End Time'))
    
    # Location
    venue = models.CharField(max_length=200, verbose_name=_('Venue'))
    address = models.TextField(blank=True, verbose_name=_('Address'))
    
    # Organizer
    organizer = models.CharField(max_length=100, verbose_name=_('Organizer'))
    contact_person = models.CharField(max_length=100, blank=True, verbose_name=_('Contact Person'))
    contact_email = models.EmailField(blank=True, verbose_name=_('Contact Email'))
    contact_phone = models.CharField(max_length=15, blank=True, verbose_name=_('Contact Phone'))
    
    # Participants
    target_audience = models.CharField(max_length=200, blank=True, verbose_name=_('Target Audience'))
    max_participants = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('Max Participants'))
    
    # Additional Information
    is_public = models.BooleanField(default=True, verbose_name=_('Is Public'))
    requires_registration = models.BooleanField(default=False, verbose_name=_('Requires Registration'))
    registration_deadline = models.DateTimeField(null=True, blank=True, verbose_name=_('Registration Deadline'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Event')
        verbose_name_plural = _('Events')
        ordering = ['-start_date', '-start_time']
        indexes = [
            models.Index(fields=['event_type']),
            models.Index(fields=['status']),
            models.Index(fields=['start_date']),
            models.Index(fields=['is_public']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def is_ongoing(self):
        """Check if event is currently ongoing"""
        from django.utils import timezone
        now = timezone.now()
        return (self.start_date <= now.date() <= self.end_date and 
                self.status in ['upcoming', 'ongoing'])
    
    @property
    def is_upcoming(self):
        """Check if event is upcoming"""
        from django.utils import timezone
        now = timezone.now()
        return self.start_date > now.date() and self.status == 'upcoming'
