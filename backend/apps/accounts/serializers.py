"""
Serializers for the accounts app.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile, AdminRole, AdminAssignment, AuditLog

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model."""

    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    profile = UserProfileSerializer(read_only=True)
    admin_permissions = serializers.SerializerMethodField()
    role_permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'phone_number', 'profile_picture', 'date_of_birth', 'gender',
            'address', 'city', 'state', 'country', 'postal_code',
            'user_type', 'admin_level', 'tenant', 'is_active', 'is_verified',
            'email_verified', 'phone_verified', 'mfa_enabled',
            'language', 'timezone', 'notification_preferences',
            'created_at', 'updated_at', 'last_activity',
            'profile', 'admin_permissions', 'role_permissions'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at', 'last_activity')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def get_admin_permissions(self, obj):
        """Get admin permissions for the user."""
        return obj.get_admin_permissions()

    def get_role_permissions(self, obj):
        """Get comprehensive role permissions."""
        return obj.get_role_permissions()


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users."""
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name', 'password',
            'confirm_password', 'phone_number', 'user_type', 'admin_level',
            'tenant'
        ]

    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        """Create a new user."""
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating users."""

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number', 'profile_picture',
            'date_of_birth', 'gender', 'address', 'city', 'state',
            'country', 'postal_code', 'user_type', 'admin_level',
            'language', 'timezone', 'notification_preferences'
        ]


class AdminRoleSerializer(serializers.ModelSerializer):
    """Serializer for AdminRole model."""
    permissions = serializers.SerializerMethodField()
    assignments_count = serializers.SerializerMethodField()

    class Meta:
        model = AdminRole
        fields = [
            'id', 'name', 'role_type', 'description', 'can_manage_users',
            'can_manage_admins', 'can_manage_institutes', 'can_manage_tenants',
            'can_view_analytics', 'can_manage_settings', 'can_manage_billing',
            'can_manage_security', 'applicable_institutes', 'is_active',
            'created_by', 'created_at', 'updated_at', 'permissions',
            'assignments_count'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_permissions(self, obj):
        """Get list of permissions for this role."""
        return obj.get_permissions()

    def get_assignments_count(self, obj):
        """Get count of active assignments for this role."""
        return obj.assignments.filter(is_active=True).count()


class AdminRoleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating admin roles."""

    class Meta:
        model = AdminRole
        fields = [
            'name', 'role_type', 'description', 'can_manage_users',
            'can_manage_admins', 'can_manage_institutes', 'can_manage_tenants',
            'can_view_analytics', 'can_manage_settings', 'can_manage_billing',
            'can_manage_security', 'applicable_institutes'
        ]

    def create(self, validated_data):
        """Create a new admin role."""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class AdminAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for AdminAssignment model."""
    user = UserSerializer(read_only=True)
    role = AdminRoleSerializer(read_only=True)
    institute_name = serializers.CharField(
        source='institute.name', read_only=True
    )
    assigned_by_name = serializers.CharField(
        source='assigned_by.get_full_name', read_only=True
    )

    class Meta:
        model = AdminAssignment
        fields = [
            'id', 'user', 'role', 'institute', 'institute_name',
            'assigned_by', 'assigned_by_name', 'assigned_at', 'expires_at',
            'is_active', 'notes', 'is_expired', 'is_valid'
        ]
        read_only_fields = ('id', 'assigned_at')


class AdminAssignmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating admin assignments."""

    class Meta:
        model = AdminAssignment
        fields = [
            'user', 'role', 'institute', 'expires_at', 'notes'
        ]

    def create(self, validated_data):
        """Create a new admin assignment."""
        validated_data['assigned_by'] = self.context['request'].user
        assignment = super().create(validated_data)

        # Update user permissions based on the new role
        user = assignment.user
        role = assignment.role

        user.can_manage_users = (
            user.can_manage_users or role.can_manage_users
        )
        user.can_manage_admins = (
            user.can_manage_admins or role.can_manage_admins
        )
        user.can_manage_institutes = (
            user.can_manage_institutes or role.can_manage_institutes
        )
        user.can_manage_tenants = (
            user.can_manage_tenants or role.can_manage_tenants
        )
        user.can_view_analytics = (
            user.can_view_analytics or role.can_view_analytics
        )
        user.can_manage_settings = (
            user.can_manage_settings or role.can_manage_settings
        )
        user.can_manage_billing = (
            user.can_manage_billing or role.can_manage_billing
        )
        user.can_manage_security = (
            user.can_manage_security or role.can_manage_security
        )

        user.save()

        return assignment


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for AuditLog model."""
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(
        source='user.get_full_name', read_only=True
    )

    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_email', 'user_name', 'action',
            'resource_type', 'resource_id', 'details', 'ip_address',
            'user_agent', 'timestamp'
        ]
        read_only_fields = ('id', 'timestamp')


class PermissionCheckSerializer(serializers.Serializer):
    """Serializer for permission check requests."""
    permission = serializers.CharField(required=False)
    resource = serializers.CharField(required=False)
    action = serializers.CharField(required=False)
    resource_id = serializers.CharField(required=False)
    institute_id = serializers.CharField(required=False)

    def validate(self, attrs):
        """Validate that either permission or resource+action is provided."""
        if not attrs.get('permission') and not (
            attrs.get('resource') and attrs.get('action')
        ):
            raise serializers.ValidationError(
                "Either 'permission' or both 'resource' and 'action' "
                "must be provided"
            )
        return attrs


class PermissionResultSerializer(serializers.Serializer):
    """Serializer for permission check results."""
    allowed = serializers.BooleanField()
    reason = serializers.CharField(required=False)
    context = serializers.DictField(required=False)


class UserPermissionsSerializer(serializers.Serializer):
    """Serializer for user permissions summary."""
    user_id = serializers.CharField()
    user_type = serializers.CharField()
    admin_level = serializers.CharField()
    permissions = serializers.ListField(child=serializers.CharField())
    resources = serializers.ListField(child=serializers.CharField())
    actions = serializers.ListField(child=serializers.CharField())
    institutes = serializers.ListField(child=serializers.CharField())
    is_super_admin = serializers.BooleanField()
    is_system_admin = serializers.BooleanField()
    is_institute_admin = serializers.BooleanField()
    is_admin = serializers.BooleanField()


class RoleTemplateSerializer(serializers.Serializer):
    """Serializer for role templates."""
    name = serializers.CharField()
    description = serializers.CharField()
    type = serializers.CharField()
    default_permissions = serializers.ListField(child=serializers.CharField())
    default_resources = serializers.ListField(child=serializers.CharField())
    default_actions = serializers.ListField(child=serializers.CharField())
    is_system = serializers.BooleanField()


class AdminRoleAssignmentSerializer(serializers.Serializer):
    """Serializer for bulk admin role assignments."""
    user_ids = serializers.ListField(child=serializers.CharField())
    role_id = serializers.CharField()
    institute_id = serializers.CharField(required=False)
    expires_at = serializers.DateTimeField(required=False)
    notes = serializers.CharField(required=False)

    def validate_user_ids(self, value):
        """Validate that all user IDs exist."""
        user_ids = set(value)
        existing_users = set(
            User.objects.filter(id__in=user_ids).values_list(
                'id', flat=True
            )
        )
        missing_users = user_ids - existing_users

        if missing_users:
            raise serializers.ValidationError(
                f"Users with IDs {missing_users} do not exist"
            )
        return value

    def validate_role_id(self, value):
        """Validate that the role exists."""
        try:
            AdminRole.objects.get(id=value)
        except AdminRole.DoesNotExist:
            raise serializers.ValidationError("Role does not exist")
        return value


class UserPermissionUpdateSerializer(serializers.Serializer):
    """Serializer for updating user permissions."""
    can_manage_users = serializers.BooleanField(required=False)
    can_manage_admins = serializers.BooleanField(required=False)
    can_manage_institutes = serializers.BooleanField(required=False)
    can_manage_tenants = serializers.BooleanField(required=False)
    can_view_analytics = serializers.BooleanField(required=False)
    can_manage_settings = serializers.BooleanField(required=False)
    can_manage_billing = serializers.BooleanField(required=False)
    can_manage_security = serializers.BooleanField(required=False)
    admin_institutes = serializers.ListField(
        child=serializers.CharField(), required=False
    )


class InstituteAccessSerializer(serializers.Serializer):
    """Serializer for institute access information."""
    institute_id = serializers.CharField()
    institute_name = serializers.CharField()
    has_access = serializers.BooleanField()
    permissions = serializers.ListField(child=serializers.CharField())
    assigned_roles = serializers.ListField(child=serializers.CharField())


class UserAccessSummarySerializer(serializers.Serializer):
    """Serializer for user access summary."""
    user = UserSerializer()
    accessible_institutes = InstituteAccessSerializer(many=True)
    total_permissions = serializers.IntegerField()
    active_roles = serializers.IntegerField()
    last_activity = serializers.DateTimeField()
    is_locked = serializers.BooleanField()
