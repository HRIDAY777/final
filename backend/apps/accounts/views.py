"""
Views for user authentication and management.
"""

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from django.db import connection
from django.core.cache import cache
import logging

from .serializers import (
    CustomTokenObtainPairSerializer, UserRegistrationSerializer,
    UserSerializer, UserUpdateSerializer, PasswordChangeSerializer,
    PasswordResetSerializer, PasswordResetConfirmSerializer,
    UserSessionSerializer, AuditLogSerializer
)
from .models import UserProfile, UserSession, AuditLog

logger = logging.getLogger(__name__)
User = get_user_model()


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    """
    Health check endpoint for monitoring.
    """
    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        # Check cache connection
        cache.set('health_check', 'ok', 10)
        cache_result = cache.get('health_check')
        
        return Response({
            'status': 'healthy',
            'database': 'connected',
            'cache': 'connected' if cache_result == 'ok' else 'disconnected',
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return Response({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain pair view with additional logging.
    """
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            # Log successful login
            user = User.objects.get(email=request.data.get('email'))
            self.log_audit_event(user, 'login', 'user', str(user.id))

            # Update user activity
            user.update_last_activity()
            user.reset_failed_attempts()

            # Create or update session
            self.create_session(user, request)

        return response

    def log_audit_event(self, user, action, resource_type, resource_id):
        """Log audit event."""
        try:
            AuditLog.objects.create(
                user=user,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                ip_address=self.get_client_ip(),
                user_agent=self.request.META.get('HTTP_USER_AGENT', '')
            )
        except Exception as e:
            logger.error(f"Failed to log audit event: {e}")

    def get_client_ip(self):
        """Get client IP address."""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip

    def create_session(self, user, request):
        """Create or update user session."""
        try:
            session_key = request.session.session_key
            if not session_key:
                request.session.create()
                session_key = request.session.session_key

            UserSession.objects.update_or_create(
                session_key=session_key,
                defaults={
                    'user': user,
                    'ip_address': self.get_client_ip(),
                    'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                    'last_activity': timezone.now()
                }
            )
        except Exception as e:
            logger.error(f"Failed to create session: {e}")


class UserRegistrationView(generics.CreateAPIView):
    """
    User registration view.
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            user = serializer.save()

            # Create user profile
            UserProfile.objects.create(user=user)

            # Send welcome email
            self.send_welcome_email(user)

            # Log registration
            self.log_audit_event(user, 'register', 'user', str(user.id))

        return Response({
            'message': (
                'User registered successfully. Please check your email '
                'for verification.'
            ),
            'user_id': user.id
        }, status=status.HTTP_201_CREATED)

    def send_welcome_email(self, user):
        """Send welcome email to new user."""
        try:
            subject = 'Welcome to EduCore Ultra!'
            message = f"""
            Hello {user.get_full_name()},

            Welcome to EduCore Ultra! Your account has been created '
            'successfully.

            Please verify your email address to activate your account.

            Best regards,
            EduCore Ultra Team
            """

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"Failed to send welcome email: {e}")

    def log_audit_event(self, user, action, resource_type, resource_id):
        """Log audit event."""
        try:
            AuditLog.objects.create(
                user=user,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                ip_address=self.get_client_ip(),
                user_agent=self.request.META.get('HTTP_USER_AGENT', '')
            )
        except Exception as e:
            logger.error(f"Failed to log audit event: {e}")

    def get_client_ip(self):
        """Get client IP address."""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    User profile view for retrieving and updating user information.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserUpdateView(generics.UpdateAPIView):
    """
    User update view for updating user information.
    """
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)

        # Log update event
        self.log_audit_event(
            request.user, 'update_profile', 'user', str(request.user.id)
        )

        return response

    def log_audit_event(self, user, action, resource_type, resource_id):
        """Log audit event."""
        try:
            AuditLog.objects.create(
                user=user,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                ip_address=self.get_client_ip(),
                user_agent=self.request.META.get('HTTP_USER_AGENT', '')
            )
        except Exception as e:
            logger.error(f"Failed to log audit event: {e}")

    def get_client_ip(self):
        """Get client IP address."""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip


class PasswordChangeView(APIView):
    """
    Password change view.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        # Log password change
        self.log_audit_event(user, 'change_password', 'user', str(user.id))

        return Response({'message': 'Password changed successfully'})

    def log_audit_event(self, user, action, resource_type, resource_id):
        """Log audit event."""
        try:
            AuditLog.objects.create(
                user=user,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                ip_address=self.get_client_ip(),
                user_agent=self.request.META.get('HTTP_USER_AGENT', '')
            )
        except Exception as e:
            logger.error(f"Failed to log audit event: {e}")

    def get_client_ip(self):
        """Get client IP address."""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip


class PasswordResetView(APIView):
    """
    Password reset request view.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            # Send password reset email
            self.send_password_reset_email(user)
            return Response({'message': 'Password reset email sent'})
        except User.DoesNotExist:
            return Response(
                {'message': 'Password reset email sent'}
            )  # Don't reveal if user exists

    def send_password_reset_email(self, user):
        """Send password reset email."""
        try:
            # Generate reset token (simplified - in production use proper token
            # generation)
            token = f"reset_{user.id}_{timezone.now().timestamp()}"

            subject = 'Password Reset Request'
            message = f"""
            Hello {user.get_full_name()},

            You have requested a password reset for your EduCore Ultra account.

            Click the following link to reset your password:
            {settings.FRONTEND_URL}/reset-password?token={token}

            If you didn't request this, please ignore this email.

            Best regards,
            EduCore Ultra Team
            """

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"Failed to send password reset email: {e}")


class PasswordResetConfirmView(APIView):
    """
    Password reset confirmation view.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # In production, validate the token properly
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        # Simplified token validation (replace with proper implementation)
        try:
            user_id = token.split('_')[1]
            user = User.objects.get(id=user_id)
            user.set_password(new_password)
            user.save()

            # Log password reset
            self.log_audit_event(user, 'reset_password', 'user', str(user.id))

            return Response({'message': 'Password reset successfully'})
        except (IndexError, User.DoesNotExist):
            return Response(
                {'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST
            )

    def log_audit_event(self, user, action, resource_type, resource_id):
        """Log audit event."""
        try:
            AuditLog.objects.create(
                user=user,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                ip_address=self.get_client_ip(),
                user_agent=self.request.META.get('HTTP_USER_AGENT', '')
            )
        except Exception as e:
            logger.error(f"Failed to log audit event: {e}")

    def get_client_ip(self):
        """Get client IP address."""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip


class UserSessionsView(generics.ListAPIView):
    """
    View for listing user sessions.
    """
    serializer_class = UserSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserSession.objects.filter(
            user=self.request.user, is_active=True
        )


class AuditLogView(generics.ListAPIView):
    """
    View for listing audit logs.
    """
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AuditLog.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    Logout view.
    """
    # Log logout event
    try:
        AuditLog.objects.create(
            user=request.user,
            action='logout',
            resource_type='user',
            resource_id=str(request.user.id),
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
    except Exception as e:
        logger.error(f"Failed to log logout event: {e}")

    return Response({'message': 'Logged out successfully'})


def get_client_ip(request):
    """Get client IP address."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
