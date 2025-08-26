from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta

from .models import (
    Tenant, SubscriptionPlan, Module, TenantModule,
    Subscription, UsageLog, BillingHistory, FeatureFlag
)
from .serializers import (
    TenantSerializer, TenantCreateSerializer, TenantDashboardSerializer,
    TenantSettingsSerializer, SubscriptionPlanSerializer, ModuleSerializer,
    TenantModuleSerializer, SubscriptionSerializer,
    SubscriptionCreateSerializer, UsageLogSerializer, BillingHistorySerializer,
    FeatureFlagSerializer, ModuleUsageSerializer, PlanModuleSerializer
)


class TenantViewSet(viewsets.ModelViewSet):
    """ViewSet for Tenant management"""

    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return TenantCreateSerializer
        elif self.action == 'dashboard':
            return TenantDashboardSerializer
        elif self.action in ['update', 'partial_update']:
            return TenantSettingsSerializer
        return TenantSerializer

    def get_queryset(self):
        """Filter queryset based on user permissions"""
        user = self.request.user

        if user.is_superuser:
            return Tenant.objects.all()
        elif hasattr(user, 'tenant'):
            return Tenant.objects.filter(id=user.tenant.id)

        return Tenant.objects.none()

    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):
        """Get tenant dashboard data"""
        tenant = self.get_object()
        serializer = self.get_serializer(tenant)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def modules(self, request, pk=None):
        """Get tenant modules with usage statistics"""
        tenant = self.get_object()
        modules = tenant.tenant_modules.select_related('module')
        serializer = ModuleUsageSerializer(modules, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def enable_module(self, request, pk=None):
        """Enable a module for tenant"""
        tenant = self.get_object()
        module_id = request.data.get('module_id')

        try:
            module = Module.objects.get(id=module_id)
            tenant_module, created = TenantModule.objects.get_or_create(
                tenant=tenant,
                module=module,
                defaults={'is_enabled': True}
            )

            if not created:
                tenant_module.is_enabled = True
                tenant_module.save()

            serializer = TenantModuleSerializer(tenant_module)
            return Response(serializer.data)

        except Module.DoesNotExist:
            return Response(
                {'error': _('Module not found.')},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def disable_module(self, request, pk=None):
        """Disable a module for tenant"""
        tenant = self.get_object()
        module_id = request.data.get('module_id')

        try:
            tenant_module = tenant.tenant_modules.get(module_id=module_id)
            tenant_module.is_enabled = False
            tenant_module.save()

            serializer = TenantModuleSerializer(tenant_module)
            return Response(serializer.data)

        except TenantModule.DoesNotExist:
            return Response(
                {'error': _('Module not found for this tenant.')},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def usage_stats(self, request, pk=None):
        """Get tenant usage statistics"""
        tenant = self.get_object()

        # Get usage for last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_usage = tenant.usage_logs.filter(
            created_at__gte=thirty_days_ago
        ).aggregate(
            total_actions=Count('id'),
            unique_modules=Count('module', distinct=True)
        )

        # Get storage usage
        storage_usage = {
            'current_gb': tenant.current_storage_gb,
            'max_gb': tenant.max_storage_gb,
            'percentage': (
                tenant.current_storage_gb / tenant.max_storage_gb * 100
            ) if tenant.max_storage_gb > 0 else 0
        }

        # Get user counts
        from apps.accounts.models import User
        from apps.students.models import Student

        user_counts = {
            'students': Student.objects.filter(tenant=tenant).count(),
            'teachers': User.objects.filter(
                tenant=tenant, user_type='teacher'
            ).count(),
            'parents': User.objects.filter(
                tenant=tenant, user_type='parent'
            ).count(),
            'staff': User.objects.filter(
                tenant=tenant, user_type='staff'
            ).count()
        }

        return Response({
            'recent_usage': recent_usage,
            'storage_usage': storage_usage,
            'user_counts': user_counts
        })


class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for SubscriptionPlan (read-only)"""

    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular subscription plans"""
        plans = self.get_queryset().filter(
            is_popular=True
        ).order_by('sort_order')
        serializer = self.get_serializer(plans, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def modules(self, request, pk=None):
        """Get modules included in a plan"""
        plan = self.get_object()
        plan_modules = plan.plan_modules.select_related('module')
        serializer = PlanModuleSerializer(plan_modules, many=True)
        return Response(serializer.data)


class ModuleViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Module (read-only)"""

    queryset = Module.objects.filter(is_active=True)
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all module categories"""
        categories = Module.objects.values_list(
            'category', flat=True
        ).distinct()
        return Response(list(categories))

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get modules grouped by category"""
        category = request.query_params.get('category')
        if category:
            modules = self.get_queryset().filter(category=category)
        else:
            modules = self.get_queryset()

        # Group by category
        categories = {}
        for module in modules:
            if module.category not in categories:
                categories[module.category] = []
            categories[module.category].append(
                ModuleSerializer(module).data
            )

        return Response(categories)


class SubscriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for Subscription management"""

    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return SubscriptionCreateSerializer
        return SubscriptionSerializer

    def get_queryset(self):
        """Filter queryset based on user permissions"""
        user = self.request.user

        if user.is_superuser:
            return Subscription.objects.all()
        elif hasattr(user, 'tenant'):
            return Subscription.objects.filter(tenant=user.tenant)

        return Subscription.objects.none()

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a subscription"""
        subscription = self.get_object()
        subscription.status = 'cancelled'
        subscription.end_date = timezone.now()
        subscription.save()

        serializer = self.get_serializer(subscription)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        """Renew a subscription"""
        subscription = self.get_object()

        if subscription.status == 'active':
            return Response(
                {'error': _('Subscription is already active.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate new end date based on billing cycle
        if subscription.billing_cycle == 'monthly':
            new_end_date = timezone.now() + timedelta(days=30)
        elif subscription.billing_cycle == 'quarterly':
            new_end_date = timezone.now() + timedelta(days=90)
        elif subscription.billing_cycle == 'yearly':
            new_end_date = timezone.now() + timedelta(days=365)
        else:
            new_end_date = timezone.now() + timedelta(days=30)

        subscription.status = 'active'
        subscription.start_date = timezone.now()
        subscription.end_date = new_end_date
        subscription.save()

        serializer = self.get_serializer(subscription)
        return Response(serializer.data)


class UsageLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for UsageLog (read-only)"""

    queryset = UsageLog.objects.all()
    serializer_class = UsageLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter queryset based on user permissions"""
        user = self.request.user

        if user.is_superuser:
            return UsageLog.objects.all()
        elif hasattr(user, 'tenant'):
            return UsageLog.objects.filter(tenant=user.tenant)

        return UsageLog.objects.none()

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get usage summary"""
        user = self.request.user

        if not hasattr(user, 'tenant'):
            return Response(
                {'error': _('No tenant associated with user.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        tenant = user.tenant

        # Get usage for different time periods
        now = timezone.now()
        today = now.date()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)

        usage_summary = {
            'today': tenant.usage_logs.filter(
                created_at__date=today
            ).count(),
            'this_week': tenant.usage_logs.filter(
                created_at__gte=week_ago
            ).count(),
            'this_month': tenant.usage_logs.filter(
                created_at__gte=month_ago
            ).count(),
            'total': tenant.usage_logs.count()
        }

        # Get usage by module
        module_usage = tenant.usage_logs.values('module__name').annotate(
            count=Count('id')
        ).order_by('-count')[:10]

        return Response({
            'summary': usage_summary,
            'by_module': module_usage
        })


class BillingHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for BillingHistory (read-only)"""

    queryset = BillingHistory.objects.all()
    serializer_class = BillingHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter queryset based on user permissions"""
        user = self.request.user

        if user.is_superuser:
            return BillingHistory.objects.all()
        elif hasattr(user, 'tenant'):
            return BillingHistory.objects.filter(
                subscription__tenant=user.tenant
            )

        return BillingHistory.objects.none()


class FeatureFlagViewSet(viewsets.ModelViewSet):
    """ViewSet for FeatureFlag management"""

    queryset = FeatureFlag.objects.all()
    serializer_class = FeatureFlagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter queryset based on user permissions"""
        user = self.request.user

        if user.is_superuser:
            return FeatureFlag.objects.all()
        elif hasattr(user, 'tenant'):
            return FeatureFlag.objects.filter(tenant=user.tenant)

        return FeatureFlag.objects.none()

    @action(detail=False, methods=['get'])
    def enabled(self, request):
        """Get enabled feature flags for tenant"""
        user = self.request.user

        if not hasattr(user, 'tenant'):
            return Response([])

        flags = self.get_queryset().filter(is_enabled=True)
        serializer = self.get_serializer(flags, many=True)
        return Response(serializer.data)
