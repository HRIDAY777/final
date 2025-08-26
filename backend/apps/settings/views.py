from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Count, Q
from django.contrib.auth import get_user_model

from .models import (
    SystemSetting, UserPreference, ApplicationConfig, 
    SettingAuditLog, FeatureFlag
)
from .serializers import (
    SystemSettingSerializer, SystemSettingCreateSerializer, SystemSettingUpdateSerializer,
    UserPreferenceSerializer, UserPreferenceCreateSerializer, UserPreferenceUpdateSerializer,
    ApplicationConfigSerializer, ApplicationConfigCreateSerializer,
    SettingAuditLogSerializer, FeatureFlagSerializer, FeatureFlagCreateSerializer,
    FeatureFlagUpdateSerializer, FeatureFlagUserSerializer, SettingsStatsSerializer
)

User = get_user_model()


class SystemSettingViewSet(viewsets.ModelViewSet):
    """ViewSet for SystemSetting model"""
    
    queryset = SystemSetting.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['setting_type', 'category', 'is_public', 'is_required']
    search_fields = ['key', 'description']
    ordering_fields = ['key', 'category', 'created_at']
    ordering = ['category', 'key']

    def get_serializer_class(self):
        if self.action == 'create':
            return SystemSettingCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return SystemSettingUpdateSerializer
        return SystemSettingSerializer

    def get_queryset(self):
        """Filter queryset based on user permissions"""
        queryset = super().get_queryset()
        
        # If user is staff/admin, show all settings
        if self.request.user.is_staff:
            return queryset
        
        # For regular users, show only public settings
        return queryset.filter(is_public=True)

    def perform_create(self, serializer):
        """Set the creator when creating a setting"""
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        """Log setting changes"""
        old_value = self.get_object().value
        new_value = serializer.validated_data.get('value', old_value)
        
        # Create audit log entry
        SettingAuditLog.objects.create(
            setting_key=serializer.instance.key,
            action='updated',
            old_value=old_value,
            new_value=new_value,
            user=self.request.user,
            ip_address=self.get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )
        
        serializer.save()

    def get_client_ip(self):
        """Get client IP address"""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip

    @action(detail=False, methods=['get'])
    def public(self, request):
        """Get public settings only"""
        public_settings = self.get_queryset().filter(is_public=True)
        serializer = self.get_serializer(public_settings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get settings grouped by category"""
        category = request.query_params.get('category')
        if category:
            settings = self.get_queryset().filter(category=category)
        else:
            settings = self.get_queryset()
        
        # Group by category
        grouped_settings = {}
        for setting in settings:
            if setting.category not in grouped_settings:
                grouped_settings[setting.category] = []
            grouped_settings[setting.category].append(
                SystemSettingSerializer(setting).data
            )
        
        return Response(grouped_settings)

    @action(detail=True, methods=['post'])
    def reset_to_default(self, request, pk=None):
        """Reset setting to default value"""
        setting = self.get_object()
        # This would typically reset to a predefined default value
        # For now, we'll just return the current value
        serializer = self.get_serializer(setting)
        return Response(serializer.data)


class UserPreferenceViewSet(viewsets.ModelViewSet):
    """ViewSet for UserPreference model"""
    
    queryset = UserPreference.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['preference_type', 'category', 'is_default']
    search_fields = ['key', 'description']
    ordering_fields = ['key', 'category', 'created_at']
    ordering = ['category', 'key']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserPreferenceCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserPreferenceUpdateSerializer
        return UserPreferenceSerializer

    def get_queryset(self):
        """Filter queryset to show only user's own preferences"""
        return super().get_queryset().filter(user=self.request.user)

    def perform_create(self, serializer):
        """Set the user when creating a preference"""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get preferences grouped by category"""
        category = request.query_params.get('category')
        if category:
            preferences = self.get_queryset().filter(category=category)
        else:
            preferences = self.get_queryset()
        
        # Group by category
        grouped_preferences = {}
        for preference in preferences:
            if preference.category not in grouped_preferences:
                grouped_preferences[preference.category] = []
            grouped_preferences[preference.category].append(
                UserPreferenceSerializer(preference).data
            )
        
        return Response(grouped_preferences)

    @action(detail=True, methods=['post'])
    def reset_to_default(self, request, pk=None):
        """Reset preference to default value"""
        preference = self.get_object()
        # This would typically reset to a predefined default value
        # For now, we'll just return the current value
        serializer = self.get_serializer(preference)
        return Response(serializer.data)


class ApplicationConfigViewSet(viewsets.ModelViewSet):
    """ViewSet for ApplicationConfig model"""
    
    queryset = ApplicationConfig.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['config_type', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'create':
            return ApplicationConfigCreateSerializer
        return ApplicationConfigSerializer

    def get_queryset(self):
        """Filter queryset based on user permissions"""
        queryset = super().get_queryset()
        
        # If user is staff/admin, show all configs
        if self.request.user.is_staff:
            return queryset
        
        # For regular users, show only active configs
        return queryset.filter(is_active=True)

    def perform_create(self, serializer):
        """Set the creator when creating a config"""
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active configurations only"""
        active_configs = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(active_configs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a configuration"""
        config = self.get_object()
        config.is_active = True
        config.save()
        serializer = self.get_serializer(config)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a configuration"""
        config = self.get_object()
        config.is_active = False
        config.save()
        serializer = self.get_serializer(config)
        return Response(serializer.data)


class SettingAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for SettingAuditLog model (read-only)"""
    
    queryset = SettingAuditLog.objects.all()
    serializer_class = SettingAuditLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['setting_key', 'action', 'user']
    search_fields = ['setting_key', 'action']
    ordering_fields = ['timestamp', 'setting_key', 'action']
    ordering = ['-timestamp']

    def get_queryset(self):
        """Filter queryset based on user permissions"""
        queryset = super().get_queryset()
        
        # If user is staff/admin, show all logs
        if self.request.user.is_staff:
            return queryset
        
        # For regular users, show only their own changes
        return queryset.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent setting changes"""
        recent_changes = self.get_queryset().order_by('-timestamp')[:50]
        serializer = self.get_serializer(recent_changes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_setting(self, request):
        """Get audit logs for a specific setting"""
        setting_key = request.query_params.get('setting_key')
        if not setting_key:
            return Response(
                {'error': 'setting_key parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logs = self.get_queryset().filter(setting_key=setting_key)
        serializer = self.get_serializer(logs, many=True)
        return Response(serializer.data)


class FeatureFlagViewSet(viewsets.ModelViewSet):
    """ViewSet for FeatureFlag model"""
    
    queryset = FeatureFlag.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['flag_type', 'is_enabled']
    search_fields = ['name', 'key', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'create':
            return FeatureFlagCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return FeatureFlagUpdateSerializer
        elif self.action == 'manage_users':
            return FeatureFlagUserSerializer
        return FeatureFlagSerializer

    def get_queryset(self):
        """Filter queryset based on user permissions"""
        queryset = super().get_queryset()
        
        # If user is staff/admin, show all flags
        if self.request.user.is_staff:
            return queryset
        
        # For regular users, show only enabled flags they have access to
        return queryset.filter(
            Q(is_enabled=True) & 
            (Q(flag_type='boolean') | 
             Q(enabled_users=self.request.user) |
             Q(flag_type='percentage') |
             Q(flag_type='date_range'))
        ).distinct()

    def perform_create(self, serializer):
        """Set the creator when creating a feature flag"""
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def enabled(self, request):
        """Get enabled feature flags only"""
        enabled_flags = self.get_queryset().filter(is_enabled=True)
        serializer = self.get_serializer(enabled_flags, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def enable(self, request, pk=None):
        """Enable a feature flag"""
        flag = self.get_object()
        flag.is_enabled = True
        flag.save()
        serializer = self.get_serializer(flag)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def disable(self, request, pk=None):
        """Disable a feature flag"""
        flag = self.get_object()
        flag.is_enabled = False
        flag.save()
        serializer = self.get_serializer(flag)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def manage_users(self, request, pk=None):
        """Manage users for user_list type flags"""
        flag = self.get_object()
        if flag.flag_type != 'user_list':
            return Response(
                {'error': 'This action is only available for user_list type flags'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = FeatureFlagUserSerializer(flag, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def check_access(self, request, pk=None):
        """Check if current user has access to this feature flag"""
        flag = self.get_object()
        has_access = flag.is_enabled_for_user(request.user)
        return Response({
            'feature_key': flag.key,
            'has_access': has_access,
            'flag_type': flag.flag_type
        })


class SettingsDashboardViewSet(viewsets.ViewSet):
    """ViewSet for settings dashboard and statistics"""
    
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get settings statistics"""
        # System settings stats
        total_settings = SystemSetting.objects.count()
        public_settings = SystemSetting.objects.filter(is_public=True).count()
        required_settings = SystemSetting.objects.filter(is_required=True).count()
        settings_by_category = dict(
            SystemSetting.objects.values('category').annotate(
                count=Count('id')
            ).values_list('category', 'count')
        )
        
        # User preferences stats
        total_preferences = UserPreference.objects.count()
        preferences_by_category = dict(
            UserPreference.objects.values('category').annotate(
                count=Count('id')
            ).values_list('category', 'count')
        )
        
        # Application configs stats
        total_configs = ApplicationConfig.objects.count()
        active_configs = ApplicationConfig.objects.filter(is_active=True).count()
        
        # Feature flags stats
        total_feature_flags = FeatureFlag.objects.count()
        enabled_feature_flags = FeatureFlag.objects.filter(is_enabled=True).count()
        
        # Recent changes
        recent_changes = SettingAuditLog.objects.order_by('-timestamp')[:10]
        
        stats = {
            'total_settings': total_settings,
            'public_settings': public_settings,
            'required_settings': required_settings,
            'settings_by_category': settings_by_category,
            'total_preferences': total_preferences,
            'preferences_by_category': preferences_by_category,
            'total_configs': total_configs,
            'active_configs': active_configs,
            'total_feature_flags': total_feature_flags,
            'enabled_feature_flags': enabled_feature_flags,
            'recent_changes': SettingAuditLogSerializer(recent_changes, many=True).data
        }
        
        serializer = SettingsStatsSerializer(stats)
        return Response(serializer.data)
