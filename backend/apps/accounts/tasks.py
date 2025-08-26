"""
Celery tasks for accounts app.
"""

from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
import logging

from .models import UserSession, User

logger = logging.getLogger(__name__)


@shared_task
def cleanup_expired_sessions():
    """
    Clean up expired user sessions.
    """
    try:
        # Delete sessions older than 30 days
        cutoff_date = timezone.now() - timedelta(days=30)
        deleted_count = UserSession.objects.filter(
            last_activity__lt=cutoff_date
        ).delete()[0]
        
        logger.info(f"Cleaned up {deleted_count} expired sessions")
        return f"Cleaned up {deleted_count} expired sessions"
    except Exception as e:
        logger.error(f"Failed to cleanup expired sessions: {e}")
        raise


@shared_task
def send_reminder_emails():
    """
    Send reminder emails to users.
    """
    try:
        # Get users who haven't logged in for 7 days
        cutoff_date = timezone.now() - timedelta(days=7)
        inactive_users = User.objects.filter(
            last_login__lt=cutoff_date,
            is_active=True
        )
        
        sent_count = 0
        for user in inactive_users:
            try:
                subject = 'Welcome back to EduCore Ultra!'
                message = f"""
                Hello {user.get_full_name()},
                
                We noticed you haven't logged in for a while. 
                Come back and check out the latest updates!
                
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
                sent_count += 1
            except Exception as e:
                logger.error(f"Failed to send reminder email to {user.email}: {e}")
        
        logger.info(f"Sent {sent_count} reminder emails")
        return f"Sent {sent_count} reminder emails"
    except Exception as e:
        logger.error(f"Failed to send reminder emails: {e}")
        raise


@shared_task
def send_welcome_email_task(user_id):
    """
    Send welcome email to new user.
    """
    try:
        user = User.objects.get(id=user_id)
        
        subject = 'Welcome to EduCore Ultra!'
        message = f"""
        Hello {user.get_full_name()},
        
        Welcome to EduCore Ultra! Your account has been created successfully.
        
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
        
        logger.info(f"Welcome email sent to {user.email}")
        return f"Welcome email sent to {user.email}"
    except User.DoesNotExist:
        logger.error(f"User with id {user_id} not found")
        raise
    except Exception as e:
        logger.error(f"Failed to send welcome email: {e}")
        raise


@shared_task
def send_password_reset_email_task(user_id, reset_token):
    """
    Send password reset email.
    """
    try:
        user = User.objects.get(id=user_id)
        
        subject = 'Password Reset Request'
        message = f"""
        Hello {user.get_full_name()},
        
        You have requested a password reset for your EduCore Ultra account.
        
        Click the following link to reset your password:
        {settings.FRONTEND_URL}/reset-password?token={reset_token}
        
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
        
        logger.info(f"Password reset email sent to {user.email}")
        return f"Password reset email sent to {user.email}"
    except User.DoesNotExist:
        logger.error(f"User with id {user_id} not found")
        raise
    except Exception as e:
        logger.error(f"Failed to send password reset email: {e}")
        raise
