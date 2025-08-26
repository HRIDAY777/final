from rest_framework import serializers
from .models import (
    SystemSetting, UserPreference, ApplicationConfig, 
    SettingAuditLog, FeatureFlag
)


class SystemSettingSerializer(serializers.ModelSerializer):
    """Basic system setting serializer"""
    typed_value = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = SystemSetting
        fields = [
            'id', 'key', 'value', 'typed_value', 'setting_type', 'category',
            'description', 'is_public', 'is_required', 'validation_rules',
            'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_typed_value(self, obj):
        """Get the typed value"""
        return obj.get_typed_value()


class SystemSettingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating system settings"""
    
    class Meta:
        model = SystemSetting
        fields = [
            'key', 'value', 'setting_type', 'category', 'description',
            'is_public', 'is_required', 'validation_rules'
        ]
    
    def validate(self, data):
        """Validate setting data"""
        # Check if key already exists
        if SystemSetting.objects.filter(key=data['key']).exists():
            raise serializers.ValidationError(
                f"Setting with key '{data['key']}' already exists."
            )
        
        # Validate value based on setting type
        setting_type = data.get('setting_type', 'string')
        value = data.get('value', '')
        
        if setting_type == 'integer':
            try:
                int(value)
            except ValueError:
                raise serializers.ValidationError(
                    "Value must be a valid integer."
                )
        elif setting_type == 'float':
            try:
                float(value)
            except ValueError:
                raise serializers.ValidationError(
                    "Value must be a valid float."
                )
        elif setting_type == 'boolean':
            if value.lower() not in ('true', 'false', '1', '0', 'yes', 'no', 'on', 'off'):
                raise serializers.ValidationError(
                    "Value must be a valid boolean."
                )
        elif setting_type == 'json':
            try:
                import json
                json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError(
                    "Value must be valid JSON."
                )
        
        return data


class SystemSettingUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating system settings"""
    
    class Meta:
        model = SystemSetting
        fields = [
            'value', 'description', 'is_public', 'is_required', 'validation_rules'
        ]
    
    def validate(self, data):
        """Validate setting data"""
        # Validate value based on setting type
        setting_type = self.instance.setting_type
        value = data.get('value', self.instance.value)
        
        if setting_type == 'integer':
            try:
                int(value)
            except ValueError:
                raise serializers.ValidationError(
                    "Value must be a valid integer."
                )
        elif setting_type == 'float':
            try:
                float(value)
            except ValueError:
                raise serializers.ValidationError(
                    "Value must be a valid float."
                )
        elif setting_type == 'boolean':
            if value.lower() not in ('true', 'false', '1', '0', 'yes', 'no', 'on', 'off'):
                raise serializers.ValidationError(
                    "Value must be a valid boolean."
                )
        elif setting_type == 'json':
            try:
                import json
                json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError(
                    "Value must be valid JSON."
                )
        
        return data


class UserPreferenceSerializer(serializers.ModelSerializer):
    """Basic user preference serializer"""
    typed_value = serializers.SerializerMethodField()
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = UserPreference
        fields = [
            'id', 'user', 'user_name', 'key', 'value', 'typed_value',
            'preference_type', 'category', 'description', 'is_default',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_typed_value(self, obj):
        """Get the typed value"""
        return obj.get_typed_value()


class UserPreferenceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating user preferences"""
    
    class Meta:
        model = UserPreference
        fields = [
            'key', 'value', 'preference_type', 'category', 'description', 'is_default'
        ]
    
    def validate(self, data):
        """Validate preference data"""
        user = self.context['request'].user
        
        # Check if preference already exists for this user
        if UserPreference.objects.filter(user=user, key=data['key']).exists():
            raise serializers.ValidationError(
                f"Preference with key '{data['key']}' already exists for this user."
            )
        
        # Validate value based on preference type
        preference_type = data.get('preference_type', 'string')
        value = data.get('value', '')
        
        if preference_type == 'integer':
            try:
                int(value)
            except ValueError:
                raise serializers.ValidationError(
                    "Value must be a valid integer."
                )
        elif preference_type == 'float':
            try:
                float(value)
            except ValueError:
                raise serializers.ValidationError(
                    "Value must be a valid float."
                )
        elif preference_type == 'boolean':
            if value.lower() not in ('true', 'false', '1', '0', 'yes', 'no', 'on', 'off'):
                raise serializers.ValidationError(
                    "Value must be a valid boolean."
                )
        elif preference_type == 'json':
            try:
                import json
                json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError(
                    "Value must be valid JSON."
                )
        
        return data


class UserPreferenceUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user preferences"""
    
    class Meta:
        model = UserPreference
        fields = ['value', 'description', 'is_default']
    
    def validate(self, data):
        """Validate preference data"""
        # Validate value based on preference type
        preference_type = self.instance.preference_type
        value = data.get('value', self.instance.value)
        
        if preference_type == 'integer':
            try:
                int(value)
            except ValueError:
                raise serializers.ValidationError(
                    "Value must be a valid integer."
                )
        elif preference_type == 'float':
            try:
                float(value)
            except ValueError:
                raise serializers.ValidationError(
                    "Value must be a valid float."
                )
        elif preference_type == 'boolean':
            if value.lower() not in ('true', 'false', '1', '0', 'yes', 'no', 'on', 'off'):
                raise serializers.ValidationError(
                    "Value must be a valid boolean."
                )
        elif preference_type == 'json':
            try:
                import json
                json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError(
                    "Value must be valid JSON."
                )
        
        return data


class ApplicationConfigSerializer(serializers.ModelSerializer):
    """Application configuration serializer"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = ApplicationConfig
        fields = [
            'id', 'name', 'config_type', 'config_data', 'is_active',
            'description', 'version', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ApplicationConfigCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating application configurations"""
    
    class Meta:
        model = ApplicationConfig
        fields = [
            'name', 'config_type', 'config_data', 'is_active',
            'description', 'version'
        ]
    
    def validate(self, data):
        """Validate configuration data"""
        # Check if name already exists
        if ApplicationConfig.objects.filter(name=data['name']).exists():
            raise serializers.ValidationError(
                f"Configuration with name '{data['name']}' already exists."
            )
        
        return data


class SettingAuditLogSerializer(serializers.ModelSerializer):
    """Setting audit log serializer"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = SettingAuditLog
        fields = [
            'id', 'setting_key', 'action', 'old_value', 'new_value',
            'user', 'user_name', 'ip_address', 'user_agent', 'timestamp'
        ]
        read_only_fields = ['timestamp']


class FeatureFlagSerializer(serializers.ModelSerializer):
    """Feature flag serializer"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    enabled_users_count = serializers.SerializerMethodField()
    
    class Meta:
        model = FeatureFlag
        fields = [
            'id', 'name', 'key', 'flag_type', 'is_enabled', 'description',
            'percentage_enabled', 'enabled_users_count', 'start_date', 'end_date',
            'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_enabled_users_count(self, obj):
        """Get count of enabled users"""
        return obj.enabled_users.count()


class FeatureFlagCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating feature flags"""
    
    class Meta:
        model = FeatureFlag
        fields = [
            'name', 'key', 'flag_type', 'is_enabled', 'description',
            'percentage_enabled', 'start_date', 'end_date'
        ]
    
    def validate(self, data):
        """Validate feature flag data"""
        # Check if name already exists
        if FeatureFlag.objects.filter(name=data['name']).exists():
            raise serializers.ValidationError(
                f"Feature flag with name '{data['name']}' already exists."
            )
        
        # Check if key already exists
        if FeatureFlag.objects.filter(key=data['key']).exists():
            raise serializers.ValidationError(
                f"Feature flag with key '{data['key']}' already exists."
            )
        
        # Validate percentage for percentage type flags
        if data.get('flag_type') == 'percentage':
            percentage = data.get('percentage_enabled', 0)
            if not 0 <= percentage <= 100:
                raise serializers.ValidationError(
                    "Percentage must be between 0 and 100."
                )
        
        # Validate date range for date_range type flags
        if data.get('flag_type') == 'date_range':
            start_date = data.get('start_date')
            end_date = data.get('end_date')
            if start_date and end_date and start_date >= end_date:
                raise serializers.ValidationError(
                    "End date must be after start date."
                )
        
        return data


class FeatureFlagUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating feature flags"""
    
    class Meta:
        model = FeatureFlag
        fields = [
            'is_enabled', 'description', 'percentage_enabled',
            'start_date', 'end_date'
        ]
    
    def validate(self, data):
        """Validate feature flag data"""
        # Validate percentage for percentage type flags
        if self.instance.flag_type == 'percentage':
            percentage = data.get('percentage_enabled', self.instance.percentage_enabled)
            if not 0 <= percentage <= 100:
                raise serializers.ValidationError(
                    "Percentage must be between 0 and 100."
                )
        
        # Validate date range for date_range type flags
        if self.instance.flag_type == 'date_range':
            start_date = data.get('start_date', self.instance.start_date)
            end_date = data.get('end_date', self.instance.end_date)
            if start_date and end_date and start_date >= end_date:
                raise serializers.ValidationError(
                    "End date must be after start date."
                )
        
        return data


class FeatureFlagUserSerializer(serializers.ModelSerializer):
    """Serializer for managing feature flag users"""
    
    class Meta:
        model = FeatureFlag
        fields = ['enabled_users']


class SettingsStatsSerializer(serializers.Serializer):
    """Serializer for settings statistics"""
    total_settings = serializers.IntegerField()
    public_settings = serializers.IntegerField()
    required_settings = serializers.IntegerField()
    settings_by_category = serializers.DictField()
    total_preferences = serializers.IntegerField()
    preferences_by_category = serializers.DictField()
    total_configs = serializers.IntegerField()
    active_configs = serializers.IntegerField()
    total_feature_flags = serializers.IntegerField()
    enabled_feature_flags = serializers.IntegerField()
    recent_changes = SettingAuditLogSerializer(many=True)
