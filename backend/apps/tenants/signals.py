from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import (
    Tenant, Subscription, TenantModule, UsageLog, SubscriptionPlan, Module
)


@receiver(post_save, sender=Tenant)
def create_default_modules_for_tenant(sender, instance, created, **kwargs):
    """Create default modules for new tenant"""
    if created:
        # Get core modules
        core_modules = Module.objects.filter(is_core=True, is_active=True)
        
        # Create tenant modules for core modules
        tenant_modules = []
        for module in core_modules:
            tenant_modules.append(
                TenantModule(
                    tenant=instance,
                    module=module,
                    is_enabled=True
                )
            )
        
        TenantModule.objects.bulk_create(tenant_modules)


@receiver(post_save, sender=Subscription)
def update_tenant_subscription_status(sender, instance, **kwargs):
    """Update tenant subscription status when subscription changes"""
    tenant = instance.tenant
    
    if instance.status == 'active':
        tenant.subscription_status = 'active'
        tenant.subscription_plan = instance.plan
        tenant.subscription_ends_at = instance.end_date
    elif instance.status == 'cancelled':
        tenant.subscription_status = 'cancelled'
        tenant.subscription_ends_at = instance.end_date
    elif instance.status == 'expired':
        tenant.subscription_status = 'expired'
        tenant.subscription_ends_at = instance.end_date
    
    tenant.save()


@receiver(post_save, sender=TenantModule)
def log_module_enable_disable(sender, instance, **kwargs):
    """Log when modules are enabled/disabled"""
    if hasattr(instance, '_state') and instance._state.adding:
        # New instance, don't log
        return
    
    # Check if enabled status changed
    if instance.pk:
        try:
            old_instance = TenantModule.objects.get(pk=instance.pk)
            if old_instance.is_enabled != instance.is_enabled:
                action = 'enabled' if instance.is_enabled else 'disabled'
                
                UsageLog.objects.create(
                    tenant=instance.tenant,
                    module=instance.module,
                    action=f'module_{action}',
                    resource_type='module',
                    resource_id=str(instance.module.id),
                    quantity=1,
                    metadata={
                        'module_name': instance.module.name,
                        'action': action,
                        'timestamp': timezone.now().isoformat()
                    }
                )
        except TenantModule.DoesNotExist:
            pass


@receiver(post_save, sender=UsageLog)
def update_module_usage_count(sender, instance, created, **kwargs):
    """Update module usage count when usage is logged"""
    if created:
        try:
            tenant_module = TenantModule.objects.get(
                tenant=instance.tenant,
                module=instance.module
            )
            tenant_module.current_usage += 1
            tenant_module.save()
        except TenantModule.DoesNotExist:
            pass


@receiver(post_save, sender=SubscriptionPlan)
def create_plan_modules(sender, instance, created, **kwargs):
    """Create default modules for new subscription plan"""
    # This would be handled in the admin or through a separate process
    # to assign modules to plans
    pass


@receiver(post_delete, sender=Tenant)
def cleanup_tenant_data(sender, instance, **kwargs):
    """Clean up tenant data when tenant is deleted"""
    # This signal would handle cleanup of tenant-specific data
    # from other apps when a tenant is deleted
    pass
