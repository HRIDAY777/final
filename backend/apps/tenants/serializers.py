from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import (
    Tenant, SubscriptionPlan, Module, PlanModule, TenantModule,
    Subscription, UsageLog, BillingHistory, FeatureFlag
)


class ModuleSerializer(serializers.ModelSerializer):
    """Serializer for Module model"""
    
    class Meta:
        model = Module
        fields = [
            'id', 'name', 'slug', 'category', 'description', 'icon', 'color',
            'is_core', 'is_active', 'sort_order', 'features', 'permissions',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """Serializer for SubscriptionPlan model"""
    
    modules = ModuleSerializer(many=True, read_only=True, source='plan_modules')
    
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'name', 'slug', 'plan_type', 'description',
            'price_monthly', 'price_quarterly', 'price_yearly', 'price_lifetime',
            'max_students', 'max_teachers', 'max_storage_gb', 'trial_days',
            'features', 'is_active', 'is_popular', 'sort_order', 'modules',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TenantModuleSerializer(serializers.ModelSerializer):
    """Serializer for TenantModule model"""
    
    module = ModuleSerializer(read_only=True)
    module_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = TenantModule
        fields = [
            'id', 'module', 'module_id', 'is_enabled', 'is_limited',
            'limit_value', 'current_usage', 'usage_percentage', 'settings',
            'enabled_at', 'disabled_at'
        ]
        read_only_fields = [
            'id', 'current_usage', 'usage_percentage', 'enabled_at', 'disabled_at'
        ]


class TenantSerializer(serializers.ModelSerializer):
    """Serializer for Tenant model"""
    
    subscription_plan = SubscriptionPlanSerializer(read_only=True)
    tenant_modules = TenantModuleSerializer(many=True, read_only=True)
    subscription_status_display = serializers.CharField(
        source='get_subscription_status_display', read_only=True
    )
    tenant_type_display = serializers.CharField(
        source='get_tenant_type_display', read_only=True
    )
    
    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'slug', 'domain', 'subdomain', 'tenant_type',
            'tenant_type_display', 'description', 'logo', 'website',
            'email', 'phone', 'address', 'city', 'state', 'country', 'postal_code',
            'subscription_plan', 'subscription_status', 'subscription_status_display',
            'trial_ends_at', 'subscription_ends_at', 'max_students', 'max_teachers',
            'max_storage_gb', 'current_storage_gb', 'timezone', 'language',
            'currency', 'is_active', 'tenant_modules', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'current_storage_gb', 'created_at', 'updated_at'
        ]
    
    def validate_slug(self, value):
        """Validate slug uniqueness"""
        if Tenant.objects.filter(slug=value).exists():
            raise serializers.ValidationError(_('This slug is already taken.'))
        return value
    
    def validate_domain(self, value):
        """Validate domain uniqueness"""
        if Tenant.objects.filter(domain=value).exists():
            raise serializers.ValidationError(_('This domain is already taken.'))
        return value
    
    def validate_subdomain(self, value):
        """Validate subdomain uniqueness"""
        if Tenant.objects.filter(subdomain=value).exists():
            raise serializers.ValidationError(_('This subdomain is already taken.'))
        return value


class TenantCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new tenants"""
    
    admin_user = serializers.JSONField(write_only=True)
    
    class Meta:
        model = Tenant
        fields = [
            'name', 'slug', 'domain', 'subdomain', 'tenant_type', 'description',
            'email', 'phone', 'address', 'city', 'state', 'country', 'postal_code',
            'timezone', 'language', 'currency', 'admin_user'
        ]
    
    def create(self, validated_data):
        admin_user_data = validated_data.pop('admin_user')
        tenant = Tenant.objects.create(**validated_data)
        
        # Create admin user for tenant
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        user = User.objects.create_user(
            username=admin_user_data['username'],
            email=admin_user_data['email'],
            password=admin_user_data['password'],
            first_name=admin_user_data.get('first_name', ''),
            last_name=admin_user_data.get('last_name', ''),
            user_type='admin',
            tenant=tenant
        )
        
        return tenant


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for Subscription model"""
    
    tenant = TenantSerializer(read_only=True)
    plan = SubscriptionPlanSerializer(read_only=True)
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    billing_cycle_display = serializers.CharField(
        source='get_billing_cycle_display', read_only=True
    )
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'tenant', 'plan', 'status', 'status_display', 'billing_cycle',
            'billing_cycle_display', 'amount', 'start_date', 'end_date',
            'trial_ends_at', 'payment_method', 'payment_status', 'transaction_id',
            'auto_renew', 'next_billing_date', 'notes', 'is_active', 'is_trial',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'is_active', 'is_trial', 'created_at', 'updated_at'
        ]


class UsageLogSerializer(serializers.ModelSerializer):
    """Serializer for UsageLog model"""
    
    tenant = serializers.StringRelatedField()
    module = ModuleSerializer(read_only=True)
    
    class Meta:
        model = UsageLog
        fields = [
            'id', 'tenant', 'module', 'action', 'resource_type', 'resource_id',
            'quantity', 'metadata', 'ip_address', 'user_agent', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class BillingHistorySerializer(serializers.ModelSerializer):
    """Serializer for BillingHistory model"""
    
    subscription = SubscriptionSerializer(read_only=True)
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    
    class Meta:
        model = BillingHistory
        fields = [
            'id', 'subscription', 'amount', 'currency', 'status', 'status_display',
            'payment_method', 'transaction_id', 'invoice_number', 'billing_date',
            'due_date', 'paid_date', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FeatureFlagSerializer(serializers.ModelSerializer):
    """Serializer for FeatureFlag model"""
    
    tenant = serializers.StringRelatedField()
    
    class Meta:
        model = FeatureFlag
        fields = [
            'id', 'tenant', 'name', 'is_enabled', 'settings', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TenantDashboardSerializer(serializers.ModelSerializer):
    """Serializer for tenant dashboard data"""
    
    subscription_plan = SubscriptionPlanSerializer(read_only=True)
    active_modules_count = serializers.SerializerMethodField()
    total_students = serializers.SerializerMethodField()
    total_teachers = serializers.SerializerMethodField()
    storage_usage_percentage = serializers.SerializerMethodField()
    recent_usage = serializers.SerializerMethodField()
    
    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'subscription_plan', 'subscription_status',
            'trial_ends_at', 'subscription_ends_at', 'max_students',
            'max_teachers', 'max_storage_gb', 'current_storage_gb',
            'active_modules_count', 'total_students', 'total_teachers',
            'storage_usage_percentage', 'recent_usage'
        ]
    
    def get_active_modules_count(self, obj):
        return obj.tenant_modules.filter(is_enabled=True).count()
    
    def get_total_students(self, obj):
        from apps.students.models import Student
        return Student.objects.filter(tenant=obj).count()
    
    def get_total_teachers(self, obj):
        from apps.accounts.models import User
        return User.objects.filter(tenant=obj, user_type='teacher').count()
    
    def get_storage_usage_percentage(self, obj):
        if obj.max_storage_gb > 0:
            return (obj.current_storage_gb / obj.max_storage_gb) * 100
        return 0
    
    def get_recent_usage(self, obj):
        recent_logs = obj.usage_logs.select_related('module').order_by('-created_at')[:10]
        return UsageLogSerializer(recent_logs, many=True).data


class ModuleUsageSerializer(serializers.ModelSerializer):
    """Serializer for module usage statistics"""
    
    module = ModuleSerializer(read_only=True)
    usage_today = serializers.SerializerMethodField()
    usage_this_week = serializers.SerializerMethodField()
    usage_this_month = serializers.SerializerMethodField()
    
    class Meta:
        model = TenantModule
        fields = [
            'id', 'module', 'is_enabled', 'is_limited', 'limit_value',
            'current_usage', 'usage_percentage', 'usage_today',
            'usage_this_week', 'usage_this_month'
        ]
    
    def get_usage_today(self, obj):
        from django.utils import timezone
        from datetime import datetime, time
        
        today_start = datetime.combine(timezone.now().date(), time.min)
        today_end = datetime.combine(timezone.now().date(), time.max)
        
        return obj.tenant.usage_logs.filter(
            module=obj.module,
            created_at__range=(today_start, today_end)
        ).count()
    
    def get_usage_this_week(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        
        week_ago = timezone.now() - timedelta(days=7)
        return obj.tenant.usage_logs.filter(
            module=obj.module,
            created_at__gte=week_ago
        ).count()
    
    def get_usage_this_month(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        
        month_ago = timezone.now() - timedelta(days=30)
        return obj.tenant.usage_logs.filter(
            module=obj.module,
            created_at__gte=month_ago
        ).count()


class SubscriptionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new subscriptions"""
    
    class Meta:
        model = Subscription
        fields = [
            'tenant', 'plan', 'billing_cycle', 'amount', 'start_date',
            'end_date', 'trial_ends_at', 'payment_method', 'auto_renew'
        ]
    
    def validate(self, data):
        """Validate subscription data"""
        tenant = data['tenant']
        plan = data['plan']
        
        # Check if tenant already has an active subscription
        if Subscription.objects.filter(
            tenant=tenant, status='active'
        ).exists():
            raise serializers.ValidationError(
                _('Tenant already has an active subscription.')
            )
        
        # Validate plan limits
        if tenant.max_students > plan.max_students:
            raise serializers.ValidationError(
                _('Tenant exceeds plan student limit.')
            )
        
        if tenant.max_teachers > plan.max_teachers:
            raise serializers.ValidationError(
                _('Tenant exceeds plan teacher limit.')
            )
        
        return data


class TenantSettingsSerializer(serializers.ModelSerializer):
    """Serializer for tenant settings"""
    
    class Meta:
        model = Tenant
        fields = [
            'timezone', 'language', 'currency', 'logo', 'website',
            'email', 'phone', 'address', 'city', 'state', 'country', 'postal_code'
        ]


class PlanModuleSerializer(serializers.ModelSerializer):
    """Serializer for PlanModule model"""
    
    module = ModuleSerializer(read_only=True)
    
    class Meta:
        model = PlanModule
        fields = [
            'id', 'plan', 'module', 'is_included', 'is_limited', 'limit_value'
        ]
