from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import uuid
import json

User = get_user_model()


class SystemSetting(models.Model):
    """System-wide configuration settings"""
    
    SETTING_TYPES = [
        ('string', _('String')),
        ('integer', _('Integer')),
        ('float', _('Float')),
        ('boolean', _('Boolean')),
        ('json', _('JSON')),
        ('email', _('Email')),
        ('url', _('URL')),
        ('file', _('File')),
    ]
    
    CATEGORIES = [
        ('general', _('General')),
        ('email', _('Email')),
        ('security', _('Security')),
        ('database', _('Database')),
        ('file_upload', _('File Upload')),
        ('notification', _('Notification')),
        ('payment', _('Payment')),
        ('integration', _('Integration')),
        ('appearance', _('Appearance')),
        ('performance', _('Performance')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.CharField(max_length=100, unique=True, verbose_name=_('Setting Key'))
    value = models.TextField(verbose_name=_('Setting Value'))
    setting_type = models.CharField(max_length=20, choices=SETTING_TYPES, default='string', verbose_name=_('Setting Type'))
    category = models.CharField(max_length=20, choices=CATEGORIES, default='general', verbose_name=_('Category'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    is_public = models.BooleanField(default=False, verbose_name=_('Is Public'))
    is_required = models.BooleanField(default=False, verbose_name=_('Is Required'))
    validation_rules = models.JSONField(default=dict, blank=True, verbose_name=_('Validation Rules'))
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_settings')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('System Setting')
        verbose_name_plural = _('System Settings')
        ordering = ['category', 'key']
        indexes = [
            models.Index(fields=['key']),
            models.Index(fields=['category']),
            models.Index(fields=['is_public']),
        ]
    
    def __str__(self):
        return f"{self.key} ({self.get_category_display()})"
    
    def get_typed_value(self):
        """Get the value with proper type conversion"""
        if self.setting_type == 'integer':
            return int(self.value) if self.value else 0
        elif self.setting_type == 'float':
            return float(self.value) if self.value else 0.0
        elif self.setting_type == 'boolean':
            return self.value.lower() in ('true', '1', 'yes', 'on')
        elif self.setting_type == 'json':
            return json.loads(self.value) if self.value else {}
        else:
            return self.value
    
    def set_typed_value(self, value):
        """Set the value with proper type conversion"""
        if self.setting_type == 'json' and isinstance(value, (dict, list)):
            self.value = json.dumps(value)
        else:
            self.value = str(value)


class UserPreference(models.Model):
    """User-specific preferences and settings"""
    
    PREFERENCE_TYPES = [
        ('string', _('String')),
        ('integer', _('Integer')),
        ('float', _('Float')),
        ('boolean', _('Boolean')),
        ('json', _('JSON')),
    ]
    
    CATEGORIES = [
        ('interface', _('Interface')),
        ('notification', _('Notification')),
        ('privacy', _('Privacy')),
        ('accessibility', _('Accessibility')),
        ('language', _('Language')),
        ('timezone', _('Timezone')),
        ('theme', _('Theme')),
        ('dashboard', _('Dashboard')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='preferences')
    key = models.CharField(max_length=100, verbose_name=_('Preference Key'))
    value = models.TextField(verbose_name=_('Preference Value'))
    preference_type = models.CharField(max_length=20, choices=PREFERENCE_TYPES, default='string', verbose_name=_('Preference Type'))
    category = models.CharField(max_length=20, choices=CATEGORIES, default='interface', verbose_name=_('Category'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    is_default = models.BooleanField(default=False, verbose_name=_('Is Default'))
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('User Preference')
        verbose_name_plural = _('User Preferences')
        unique_together = ['user', 'key']
        ordering = ['category', 'key']
        indexes = [
            models.Index(fields=['user', 'key']),
            models.Index(fields=['category']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.key}"
    
    def get_typed_value(self):
        """Get the value with proper type conversion"""
        if self.preference_type == 'integer':
            return int(self.value) if self.value else 0
        elif self.preference_type == 'float':
            return float(self.value) if self.value else 0.0
        elif self.preference_type == 'boolean':
            return self.value.lower() in ('true', '1', 'yes', 'on')
        elif self.preference_type == 'json':
            return json.loads(self.value) if self.value else {}
        else:
            return self.value
    
    def set_typed_value(self, value):
        """Set the value with proper type conversion"""
        if self.preference_type == 'json' and isinstance(value, (dict, list)):
            self.value = json.dumps(value)
        else:
            self.value = str(value)


class ApplicationConfig(models.Model):
    """Application-specific configuration"""
    
    CONFIG_TYPES = [
        ('feature_flag', _('Feature Flag')),
        ('api_config', _('API Configuration')),
        ('third_party', _('Third Party Integration')),
        ('custom', _('Custom Configuration')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, verbose_name=_('Configuration Name'))
    config_type = models.CharField(max_length=20, choices=CONFIG_TYPES, default='custom', verbose_name=_('Configuration Type'))
    config_data = models.JSONField(default=dict, verbose_name=_('Configuration Data'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    version = models.CharField(max_length=20, default='1.0.0', verbose_name=_('Version'))
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_configs')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Application Configuration')
        verbose_name_plural = _('Application Configurations')
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['config_type']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_config_type_display()})"


class SettingAuditLog(models.Model):
    """Audit log for setting changes"""
    
    ACTION_TYPES = [
        ('created', _('Created')),
        ('updated', _('Updated')),
        ('deleted', _('Deleted')),
        ('activated', _('Activated')),
        ('deactivated', _('Deactivated')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    setting_key = models.CharField(max_length=100, verbose_name=_('Setting Key'))
    action = models.CharField(max_length=20, choices=ACTION_TYPES, verbose_name=_('Action'))
    old_value = models.TextField(blank=True, verbose_name=_('Old Value'))
    new_value = models.TextField(blank=True, verbose_name=_('New Value'))
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='setting_changes')
    ip_address = models.GenericIPAddressField(blank=True, null=True, verbose_name=_('IP Address'))
    user_agent = models.TextField(blank=True, verbose_name=_('User Agent'))
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name=_('Timestamp'))
    
    class Meta:
        verbose_name = _('Setting Audit Log')
        verbose_name_plural = _('Setting Audit Logs')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['setting_key']),
            models.Index(fields=['action']),
            models.Index(fields=['user']),
            models.Index(fields=['timestamp']),
        ]
    
    def __str__(self):
        return f"{self.setting_key} - {self.action} by {self.user} at {self.timestamp}"


class FeatureFlag(models.Model):
    """Feature flags for enabling/disabling features"""
    
    FLAG_TYPES = [
        ('boolean', _('Boolean')),
        ('percentage', _('Percentage')),
        ('user_list', _('User List')),
        ('date_range', _('Date Range')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, verbose_name=_('Feature Name'))
    key = models.CharField(max_length=100, unique=True, verbose_name=_('Feature Key'))
    flag_type = models.CharField(max_length=20, choices=FLAG_TYPES, default='boolean', verbose_name=_('Flag Type'))
    is_enabled = models.BooleanField(default=False, verbose_name=_('Is Enabled'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    
    # Configuration based on flag type
    percentage_enabled = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name=_('Percentage Enabled')
    )
    enabled_users = models.ManyToManyField(
        User, 
        blank=True, 
        related_name='enabled_features',
        verbose_name=_('Enabled Users')
    )
    start_date = models.DateTimeField(null=True, blank=True, verbose_name=_('Start Date'))
    end_date = models.DateTimeField(null=True, blank=True, verbose_name=_('End Date'))
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_features')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Feature Flag')
        verbose_name_plural = _('Feature Flags')
        ordering = ['name']
        indexes = [
            models.Index(fields=['key']),
            models.Index(fields=['is_enabled']),
            models.Index(fields=['flag_type']),
        ]
    
    def __str__(self):
        return f"{self.name} ({'Enabled' if self.is_enabled else 'Disabled'})"
    
    def is_enabled_for_user(self, user):
        """Check if feature is enabled for a specific user"""
        if not self.is_enabled:
            return False
        
        if self.flag_type == 'boolean':
            return True
        elif self.flag_type == 'percentage':
            # Simple hash-based percentage check
            user_hash = hash(user.id) % 100
            return user_hash < self.percentage_enabled
        elif self.flag_type == 'user_list':
            return user in self.enabled_users.all()
        elif self.flag_type == 'date_range':
            now = timezone.now()
            if self.start_date and now < self.start_date:
                return False
            if self.end_date and now > self.end_date:
                return False
            return True
        
        return False
