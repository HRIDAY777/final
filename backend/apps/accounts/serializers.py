"""
Serializers for user authentication and management.
"""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, UserProfile, UserSession, AuditLog


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer with additional user information.
    """
    def validate(self, attrs):
        data = super().validate(attrs)

        # Add custom claims
        data['user_id'] = self.user.id
        data['email'] = self.user.email
        data['user_type'] = self.user.user_type
        data['first_name'] = self.user.first_name
        data['last_name'] = self.user.last_name
        data['is_verified'] = self.user.is_verified

        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
    password = serializers.CharField(
        write_only=True, validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'password',
            'password_confirm', 'phone_number', 'user_type',
            'date_of_birth', 'gender'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(email=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            if user.is_locked():
                raise serializers.ValidationError(
                    'User account is locked'
                )

            attrs['user'] = user
        else:
            raise serializers.ValidationError(
                'Must include email and password'
            )

        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile.
    """
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user model.
    """
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'user_type', 'is_active', 'is_verified',
            'profile_picture', 'date_of_birth', 'gender', 'profile',
            'created_at', 'last_activity'
        ]
        read_only_fields = ['id', 'created_at', 'last_activity']

    def get_full_name(self, obj):
        return obj.get_full_name()


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user information.
    """
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number', 'date_of_birth',
            'gender', 'address', 'city', 'state', 'country',
            'postal_code', 'language', 'timezone', 'notification_preferences'
        ]


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True, validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect')
        return value


class PasswordResetSerializer(serializers.Serializer):
    """
    Serializer for password reset request.
    """
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for password reset confirmation.
    """
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs


class UserSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for user sessions.
    """
    class Meta:
        model = UserSession
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'last_activity']


class AuditLogSerializer(serializers.ModelSerializer):
    """
    Serializer for audit logs.
    """
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = ['user', 'timestamp']


class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer for email verification.
    """
    token = serializers.CharField()


class PhoneVerificationSerializer(serializers.Serializer):
    """
    Serializer for phone verification.
    """
    phone_number = serializers.CharField()
    otp = serializers.CharField()


class MFASetupSerializer(serializers.Serializer):
    """
    Serializer for MFA setup.
    """
    enable = serializers.BooleanField()


class MFATokenSerializer(serializers.Serializer):
    """
    Serializer for MFA token verification.
    """
    token = serializers.CharField()
