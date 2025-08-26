"""
Admin configuration for tenant models.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from .models import (
    Tenant, SubscriptionPlan, Module, PlanModule, TenantModule,
    Subscription, UsageLog, BillingHistory, FeatureFlag
)


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'tenant_type', 'subscription_status', 'subscription_plan',
        'max_students', 'current_storage_gb', 'is_active', 'created_at'
    ]
    list_filter = [
        'tenant_type', 'subscription_status', 'is_active', 'created_at',
        'country', 'state'
    ]
    search_fields = ['name', 'slug', 'domain', 'email', 'phone']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('id', 'name', 'slug', 'tenant_type', 'description')
        }),
        (_('Domain & Access'), {
            'fields': ('domain', 'subdomain', 'is_active')
        }),
        (_('Contact Information'), {
            'fields': ('email', 'phone', 'website', 'address', 'city', 'state', 'country', 'postal_code')
        }),
        (_('Subscription'), {
            'fields': ('subscription_plan', 'subscription_status', 'trial_ends_at', 'subscription_ends_at')
        }),
        (_('Limits & Usage'), {
            'fields': ('max_students', 'max_teachers', 'max_storage_gb', 'current_storage_gb')
        }),
        (_('Settings'), {
            'fields': ('timezone', 'language', 'currency', 'logo')
        }),
        (_('System'), {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('subscription_plan', 'created_by')


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'plan_type', 'price_monthly', 'price_yearly', 'max_students',
        'trial_days', 'is_active', 'is_popular', 'sort_order'
    ]
    list_filter = ['plan_type', 'is_active', 'is_popular', 'created_at']
    search_fields = ['name', 'slug', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'slug', 'plan_type', 'description')
        }),
        (_('Pricing'), {
            'fields': ('price_monthly', 'price_quarterly', 'price_yearly', 'price_lifetime')
        }),
        (_('Limits'), {
            'fields': ('max_students', 'max_teachers', 'max_storage_gb', 'trial_days')
        }),
        (_('Features'), {
            'fields': ('features', 'is_active', 'is_popular', 'sort_order')
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'category', 'is_core', 'is_active', 'sort_order', 'color_display'
    ]
    list_filter = ['category', 'is_core', 'is_active', 'created_at']
    search_fields = ['name', 'slug', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'slug', 'category', 'description')
        }),
        (_('Display'), {
            'fields': ('icon', 'color', 'sort_order')
        }),
        (_('Settings'), {
            'fields': ('is_core', 'is_active')
        }),
        (_('Features & Permissions'), {
            'fields': ('features', 'permissions')
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def color_display(self, obj):
        if obj.color:
            return format_html(
                '<span style="background-color: {}; padding: 5px 10px; border-radius: 3px; color: white;">{}</span>',
                obj.color, obj.color
            )
        return '-'
    color_display.short_description = _('Color')


@admin.register(PlanModule)
class PlanModuleAdmin(admin.ModelAdmin):
    list_display = ['plan', 'module', 'is_included', 'is_limited', 'limit_value']
    list_filter = ['is_included', 'is_limited', 'plan__plan_type', 'module__category']
    search_fields = ['plan__name', 'module__name']
    autocomplete_fields = ['plan', 'module']


@admin.register(TenantModule)
class TenantModuleAdmin(admin.ModelAdmin):
    list_display = [
        'tenant', 'module', 'is_enabled', 'is_limited', 'current_usage',
        'limit_value', 'usage_percentage_display'
    ]
    list_filter = [
        'is_enabled', 'is_limited', 'module__category', 'enabled_at'
    ]
    search_fields = ['tenant__name', 'module__name']
    readonly_fields = ['enabled_at', 'disabled_at', 'usage_percentage']
    autocomplete_fields = ['tenant', 'module']
    
    def usage_percentage_display(self, obj):
        if obj.usage_percentage > 0:
            color = 'red' if obj.usage_percentage > 90 else 'orange' if obj.usage_percentage > 70 else 'green'
            return format_html(
                '<span style="color: {};">{:.1f}%</span>',
                color, obj.usage_percentage
            )
        return '-'
    usage_percentage_display.short_description = _('Usage %')


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = [
        'tenant', 'plan', 'status', 'billing_cycle', 'amount',
        'start_date', 'end_date', 'is_active_display'
    ]
    list_filter = [
        'status', 'billing_cycle', 'payment_status', 'auto_renew', 'start_date'
    ]
    search_fields = ['tenant__name', 'plan__name', 'transaction_id']
    readonly_fields = ['created_at', 'updated_at']
    autocomplete_fields = ['tenant', 'plan']
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('tenant', 'plan', 'status', 'billing_cycle', 'amount')
        }),
        (_('Dates'), {
            'fields': ('start_date', 'end_date', 'trial_ends_at', 'next_billing_date')
        }),
        (_('Payment'), {
            'fields': ('payment_method', 'payment_status', 'transaction_id')
        }),
        (_('Settings'), {
            'fields': ('auto_renew', 'notes')
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def is_active_display(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="color: green;">✓ Active</span>'
            )
        else:
            return format_html(
                '<span style="color: red;">✗ Inactive</span>'
            )
    is_active_display.short_description = _('Status')


@admin.register(UsageLog)
class UsageLogAdmin(admin.ModelAdmin):
    list_display = [
        'tenant', 'module', 'action', 'resource_type', 'quantity', 'created_at'
    ]
    list_filter = [
        'module__category', 'action', 'resource_type', 'created_at'
    ]
    search_fields = ['tenant__name', 'module__name', 'action', 'resource_id']
    readonly_fields = ['created_at']
    autocomplete_fields = ['tenant', 'module']
    date_hierarchy = 'created_at'
    
    def has_add_permission(self, request):
        return False  # Usage logs are created automatically


@admin.register(BillingHistory)
class BillingHistoryAdmin(admin.ModelAdmin):
    list_display = [
        'subscription', 'amount', 'currency', 'status', 'billing_date',
        'due_date', 'paid_date'
    ]
    list_filter = ['status', 'currency', 'billing_date', 'due_date']
    search_fields = [
        'subscription__tenant__name', 'transaction_id', 'invoice_number'
    ]
    readonly_fields = ['created_at', 'updated_at']
    autocomplete_fields = ['subscription']
    date_hierarchy = 'billing_date'


@admin.register(FeatureFlag)
class FeatureFlagAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'name', 'is_enabled', 'created_at']
    list_filter = ['is_enabled', 'created_at']
    search_fields = ['tenant__name', 'name']
    autocomplete_fields = ['tenant']
    readonly_fields = ['created_at', 'updated_at']


# Custom admin site configuration
admin.site.site_header = _('EduCore Ultra - Multi-Tenant SaaS Admin')
admin.site.site_title = _('EduCore Ultra Admin')
admin.site.index_title = _('Multi-Tenant School Management System')
