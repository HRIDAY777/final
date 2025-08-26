"""
Tenant models for multi-tenant architecture.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
import uuid

User = get_user_model()

class Tenant(models.Model):
    """Multi-tenant organization/school model"""
    
    TENANT_STATUS_CHOICES = [
        ('active', _('Active')),
        ('suspended', _('Suspended')),
        ('cancelled', _('Cancelled')),
        ('trial', _('Trial')),
        ('expired', _('Expired')),
    ]
    
    TENANT_TYPE_CHOICES = [
        ('school', _('School')),
        ('college', _('College')),
        ('university', _('University')),
        ('training_center', _('Training Center')),
        ('corporate', _('Corporate')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name=_('Organization Name'))
    slug = models.SlugField(max_length=255, unique=True, verbose_name=_('Organization Slug'))
    domain = models.CharField(max_length=255, unique=True, verbose_name=_('Domain'))
    subdomain = models.CharField(max_length=255, unique=True, verbose_name=_('Subdomain'))
    
    # Organization Details
    tenant_type = models.CharField(max_length=20, choices=TENANT_TYPE_CHOICES, default='school')
    description = models.TextField(blank=True, verbose_name=_('Description'))
    logo = models.ImageField(upload_to='tenants/logos/', blank=True, null=True)
    website = models.URLField(blank=True, verbose_name=_('Website'))
    
    # Contact Information
    email = models.EmailField(verbose_name=_('Contact Email'))
    phone = models.CharField(max_length=20, blank=True, verbose_name=_('Phone'))
    address = models.TextField(blank=True, verbose_name=_('Address'))
    city = models.CharField(max_length=100, blank=True, verbose_name=_('City'))
    state = models.CharField(max_length=100, blank=True, verbose_name=_('State'))
    country = models.CharField(max_length=100, blank=True, verbose_name=_('Country'))
    postal_code = models.CharField(max_length=20, blank=True, verbose_name=_('Postal Code'))
    
    # Subscription Details
    subscription_plan = models.ForeignKey('SubscriptionPlan', on_delete=models.SET_NULL, null=True, blank=True)
    subscription_status = models.CharField(max_length=20, choices=TENANT_STATUS_CHOICES, default='trial')
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    subscription_ends_at = models.DateTimeField(null=True, blank=True)
    
    # Limits and Usage
    max_students = models.PositiveIntegerField(default=100, verbose_name=_('Max Students'))
    max_teachers = models.PositiveIntegerField(default=20, verbose_name=_('Max Teachers'))
    max_storage_gb = models.PositiveIntegerField(default=10, verbose_name=_('Max Storage (GB)'))
    current_storage_gb = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Current Storage (GB)'))
    
    # Settings
    timezone = models.CharField(max_length=50, default='UTC', verbose_name=_('Timezone'))
    language = models.CharField(max_length=10, default='en', verbose_name=_('Language'))
    currency = models.CharField(max_length=3, default='USD', verbose_name=_('Currency'))
    
    # System Fields
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_tenants')
    
    class Meta:
        verbose_name = _('Tenant')
        verbose_name_plural = _('Tenants')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def is_trial_expired(self):
        if self.trial_ends_at:
            from django.utils import timezone
            return timezone.now() > self.trial_ends_at
        return False
    
    @property
    def is_subscription_expired(self):
        if self.subscription_ends_at:
            from django.utils import timezone
            return timezone.now() > self.subscription_ends_at
        return False
    
    @property
    def can_access_system(self):
        if self.subscription_status == 'active':
            return True
        elif self.subscription_status == 'trial' and not self.is_trial_expired:
            return True
        return False

class SubscriptionPlan(models.Model):
    """Subscription plans for different tiers"""
    
    PLAN_TYPE_CHOICES = [
        ('basic', _('Basic')),
        ('standard', _('Standard')),
        ('premium', _('Premium')),
        ('enterprise', _('Enterprise')),
        ('custom', _('Custom')),
    ]
    
    BILLING_CYCLE_CHOICES = [
        ('monthly', _('Monthly')),
        ('quarterly', _('Quarterly')),
        ('yearly', _('Yearly')),
        ('lifetime', _('Lifetime')),
    ]
    
    name = models.CharField(max_length=100, verbose_name=_('Plan Name'))
    slug = models.SlugField(max_length=100, unique=True, verbose_name=_('Plan Slug'))
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPE_CHOICES, default='basic')
    description = models.TextField(blank=True, verbose_name=_('Description'))
    
    # Pricing
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Monthly Price'))
    price_quarterly = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Quarterly Price'))
    price_yearly = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Yearly Price'))
    price_lifetime = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name=_('Lifetime Price'))
    
    # Limits
    max_students = models.PositiveIntegerField(default=100, verbose_name=_('Max Students'))
    max_teachers = models.PositiveIntegerField(default=20, verbose_name=_('Max Teachers'))
    max_storage_gb = models.PositiveIntegerField(default=10, verbose_name=_('Max Storage (GB)'))
    trial_days = models.PositiveIntegerField(default=14, verbose_name=_('Trial Days'))
    
    # Features
    features = models.JSONField(default=dict, verbose_name=_('Features'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    is_popular = models.BooleanField(default=False, verbose_name=_('Is Popular'))
    sort_order = models.PositiveIntegerField(default=0, verbose_name=_('Sort Order'))
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Subscription Plan')
        verbose_name_plural = _('Subscription Plans')
        ordering = ['sort_order', 'price_monthly']
    
    def __str__(self):
        return self.name
    
    def get_price(self, billing_cycle='monthly'):
        """Get price for specific billing cycle"""
        price_map = {
            'monthly': self.price_monthly,
            'quarterly': self.price_quarterly,
            'yearly': self.price_yearly,
            'lifetime': self.price_lifetime,
        }
        return price_map.get(billing_cycle, self.price_monthly)

class Module(models.Model):
    """Available modules in the system"""
    
    MODULE_CATEGORY_CHOICES = [
        ('core', _('Core')),
        ('academic', _('Academic')),
        ('administrative', _('Administrative')),
        ('communication', _('Communication')),
        ('analytics', _('Analytics')),
        ('finance', _('Finance')),
        ('library', _('Library')),
        ('transport', _('Transport')),
        ('hostel', _('Hostel')),
        ('health', _('Health')),
        ('extracurricular', _('Extracurricular')),
    ]
    
    name = models.CharField(max_length=100, verbose_name=_('Module Name'))
    slug = models.SlugField(max_length=100, unique=True, verbose_name=_('Module Slug'))
    category = models.CharField(max_length=20, choices=MODULE_CATEGORY_CHOICES, default='core')
    description = models.TextField(blank=True, verbose_name=_('Description'))
    icon = models.CharField(max_length=50, blank=True, verbose_name=_('Icon'))
    color = models.CharField(max_length=7, default='#3B82F6', verbose_name=_('Color'))
    
    # Module Details
    is_core = models.BooleanField(default=False, verbose_name=_('Is Core Module'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    sort_order = models.PositiveIntegerField(default=0, verbose_name=_('Sort Order'))
    
    # Features
    features = models.JSONField(default=dict, verbose_name=_('Features'))
    permissions = models.JSONField(default=list, verbose_name=_('Permissions'))
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Module')
        verbose_name_plural = _('Modules')
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return self.name

class PlanModule(models.Model):
    """Modules included in each subscription plan"""
    
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE, related_name='plan_modules')
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='plan_modules')
    is_included = models.BooleanField(default=True, verbose_name=_('Is Included'))
    is_limited = models.BooleanField(default=False, verbose_name=_('Is Limited'))
    limit_value = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('Limit Value'))
    
    class Meta:
        verbose_name = _('Plan Module')
        verbose_name_plural = _('Plan Modules')
        unique_together = ['plan', 'module']
    
    def __str__(self):
        return f"{self.plan.name} - {self.module.name}"

class TenantModule(models.Model):
    """Modules enabled for each tenant"""
    
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='tenant_modules')
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='tenant_modules')
    is_enabled = models.BooleanField(default=True, verbose_name=_('Is Enabled'))
    is_limited = models.BooleanField(default=False, verbose_name=_('Is Limited'))
    limit_value = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('Limit Value'))
    current_usage = models.PositiveIntegerField(default=0, verbose_name=_('Current Usage'))
    
    # Settings
    settings = models.JSONField(default=dict, verbose_name=_('Module Settings'))
    enabled_at = models.DateTimeField(auto_now_add=True)
    disabled_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('Tenant Module')
        verbose_name_plural = _('Tenant Modules')
        unique_together = ['tenant', 'module']
    
    def __str__(self):
        return f"{self.tenant.name} - {self.module.name}"
    
    @property
    def usage_percentage(self):
        if self.limit_value and self.limit_value > 0:
            return (self.current_usage / self.limit_value) * 100
        return 0
    
    @property
    def is_over_limit(self):
        if self.is_limited and self.limit_value:
            return self.current_usage >= self.limit_value
        return False

class Subscription(models.Model):
    """Active subscriptions for tenants"""
    
    SUBSCRIPTION_STATUS_CHOICES = [
        ('active', _('Active')),
        ('cancelled', _('Cancelled')),
        ('expired', _('Expired')),
        ('suspended', _('Suspended')),
        ('pending', _('Pending')),
    ]
    
    BILLING_CYCLE_CHOICES = [
        ('monthly', _('Monthly')),
        ('quarterly', _('Quarterly')),
        ('yearly', _('Yearly')),
        ('lifetime', _('Lifetime')),
    ]
    
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='tenant_subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE, related_name='subscriptions')
    
    # Subscription Details
    status = models.CharField(max_length=20, choices=SUBSCRIPTION_STATUS_CHOICES, default='pending')
    billing_cycle = models.CharField(max_length=20, choices=BILLING_CYCLE_CHOICES, default='monthly')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Amount'))
    
    # Dates
    start_date = models.DateTimeField(verbose_name=_('Start Date'))
    end_date = models.DateTimeField(verbose_name=_('End Date'))
    trial_ends_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Trial Ends At'))
    
    # Payment
    payment_method = models.CharField(max_length=50, blank=True, verbose_name=_('Payment Method'))
    payment_status = models.CharField(max_length=20, default='pending', verbose_name=_('Payment Status'))
    transaction_id = models.CharField(max_length=255, blank=True, verbose_name=_('Transaction ID'))
    
    # Auto-renewal
    auto_renew = models.BooleanField(default=True, verbose_name=_('Auto Renew'))
    next_billing_date = models.DateTimeField(null=True, blank=True, verbose_name=_('Next Billing Date'))
    
    # Notes
    notes = models.TextField(blank=True, verbose_name=_('Notes'))
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Subscription')
        verbose_name_plural = _('Subscriptions')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.tenant.name} - {self.plan.name}"
    
    @property
    def is_active(self):
        from django.utils import timezone
        return (
            self.status == 'active' and 
            self.end_date > timezone.now()
        )
    
    @property
    def is_trial(self):
        if self.trial_ends_at:
            from django.utils import timezone
            return timezone.now() < self.trial_ends_at
        return False

class UsageLog(models.Model):
    """Usage tracking for modules"""
    
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='usage_logs')
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='usage_logs')
    
    # Usage Details
    action = models.CharField(max_length=100, verbose_name=_('Action'))
    resource_type = models.CharField(max_length=50, verbose_name=_('Resource Type'))
    resource_id = models.CharField(max_length=255, blank=True, verbose_name=_('Resource ID'))
    quantity = models.PositiveIntegerField(default=1, verbose_name=_('Quantity'))
    
    # Metadata
    metadata = models.JSONField(default=dict, verbose_name=_('Metadata'))
    ip_address = models.GenericIPAddressField(blank=True, null=True, verbose_name=_('IP Address'))
    user_agent = models.TextField(blank=True, verbose_name=_('User Agent'))
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('Usage Log')
        verbose_name_plural = _('Usage Logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', 'module', 'created_at']),
            models.Index(fields=['action', 'resource_type']),
        ]
    
    def __str__(self):
        return f"{self.tenant.name} - {self.module.name} - {self.action}"

class BillingHistory(models.Model):
    """Billing history for subscriptions"""
    
    BILLING_STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('paid', _('Paid')),
        ('failed', _('Failed')),
        ('refunded', _('Refunded')),
        ('cancelled', _('Cancelled')),
    ]
    
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='billing_history')
    
    # Billing Details
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Amount'))
    currency = models.CharField(max_length=3, default='USD', verbose_name=_('Currency'))
    status = models.CharField(max_length=20, choices=BILLING_STATUS_CHOICES, default='pending')
    
    # Payment Details
    payment_method = models.CharField(max_length=50, blank=True, verbose_name=_('Payment Method'))
    transaction_id = models.CharField(max_length=255, blank=True, verbose_name=_('Transaction ID'))
    invoice_number = models.CharField(max_length=100, blank=True, verbose_name=_('Invoice Number'))
    
    # Dates
    billing_date = models.DateTimeField(verbose_name=_('Billing Date'))
    due_date = models.DateTimeField(verbose_name=_('Due Date'))
    paid_date = models.DateTimeField(null=True, blank=True, verbose_name=_('Paid Date'))
    
    # Description
    description = models.TextField(blank=True, verbose_name=_('Description'))
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Billing History')
        verbose_name_plural = _('Billing History')
        ordering = ['-billing_date']
    
    def __str__(self):
        return f"{self.subscription.tenant.name} - {self.amount} {self.currency}"

class FeatureFlag(models.Model):
    """Feature flags for tenants"""
    
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='feature_flags')
    name = models.CharField(max_length=100, verbose_name=_('Feature Name'))
    is_enabled = models.BooleanField(default=False, verbose_name=_('Is Enabled'))
    settings = models.JSONField(default=dict, verbose_name=_('Settings'))
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Feature Flag')
        verbose_name_plural = _('Feature Flags')
        unique_together = ['tenant', 'name']
    
    def __str__(self):
        return f"{self.tenant.name} - {self.name}"
