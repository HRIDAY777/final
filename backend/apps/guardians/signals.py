from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import date, timedelta
from django.db.models import Count, F, Q

from .models import (
    Guardian, GuardianProfile, GuardianStudent, GuardianDocument,
    GuardianSettings, GuardianNotification
)

@receiver(post_save, sender=Guardian)
def guardian_created(sender, instance, created, **kwargs):
    """Send welcome email when guardian is created"""
    if created:
        GuardianSettings.objects.get_or_create(guardian=instance)
        if instance.email:
            send_mail(
                subject=f'Welcome to {settings.SCHOOL_NAME} - {instance.full_name}',
                message=f'''
                Dear {instance.full_name},
                
                Welcome to {settings.SCHOOL_NAME}! Your guardian account has been successfully created.
                
                Your Guardian ID: {instance.guardian_id}
                Email: {instance.email}
                Phone: {instance.phone}
                
                You can now access the parent portal to view your child's academic progress, attendance, and other important information.
                
                If you have any questions, please don't hesitate to contact us.
                
                Best regards,
                {settings.SCHOOL_NAME} Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[instance.email],
                fail_silently=True
            )

@receiver(post_save, sender=Guardian)
def guardian_updated(sender, instance, created, **kwargs):
    """Handle guardian updates and status changes"""
    if not created:
        if hasattr(instance, 'tracker') and instance.tracker.has_changed('status'):
            # Send status change notification
            if instance.email:
                send_mail(
                    subject=f'Account Status Update - {settings.SCHOOL_NAME}',
                    message=f'''
                    Dear {instance.full_name},
                    
                    Your guardian account status has been updated to: {instance.get_status_display()}
                    
                    If you have any questions about this change, please contact the school administration.
                    
                    Best regards,
                    {settings.SCHOOL_NAME} Team
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.email],
                    fail_silently=True
                )

@receiver(post_save, sender=GuardianStudent)
def guardian_student_created(sender, instance, created, **kwargs):
    """Send notification when guardian-student relationship is created"""
    if created:
        # Send notification to guardian
        GuardianNotification.objects.create(
            guardian=instance.guardian,
            title=f'Student Link Added',
            message=f'You have been linked to student {instance.student.full_name} ({instance.student.student_id}) as {instance.get_relationship_display()}.',
            notification_type='academic',
            priority='medium'
        )
        
        # Send email notification
        if instance.guardian.email:
            send_mail(
                subject=f'Student Link Added - {settings.SCHOOL_NAME}',
                message=f'''
                Dear {instance.guardian.full_name},
                
                You have been linked to student {instance.student.full_name} ({instance.student.student_id}) as {instance.get_relationship_display()}.
                
                You can now view this student's academic progress, attendance, and other information through the parent portal.
                
                Best regards,
                {settings.SCHOOL_NAME} Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[instance.guardian.email],
                fail_silently=True
            )

@receiver(post_save, sender=GuardianDocument)
def guardian_document_uploaded(sender, instance, created, **kwargs):
    """Send notification when guardian document is uploaded"""
    if created:
        # Send notification to admin for verification
        GuardianNotification.objects.create(
            guardian=instance.guardian,
            title=f'Document Uploaded',
            message=f'Your {instance.get_document_type_display()} has been uploaded and is pending verification.',
            notification_type='document',
            priority='medium'
        )
        
        # Send email notification to guardian
        if instance.guardian.email:
            send_mail(
                subject=f'Document Upload Confirmation - {settings.SCHOOL_NAME}',
                message=f'''
                Dear {instance.guardian.full_name},
                
                Your {instance.get_document_type_display()} has been successfully uploaded and is pending verification by the school administration.
                
                Document Details:
                - Type: {instance.get_document_type_display()}
                - Description: {instance.description or 'N/A'}
                - Expiry Date: {instance.expiry_date or 'N/A'}
                
                You will be notified once the document is verified.
                
                Best regards,
                {settings.SCHOOL_NAME} Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[instance.guardian.email],
                fail_silently=True
            )

@receiver(post_save, sender=GuardianDocument)
def guardian_document_verified(sender, instance, created, **kwargs):
    """Send notification when guardian document is verified"""
    if not created and hasattr(instance, 'tracker') and instance.tracker.has_changed('verified'):
        if instance.verified:
            # Send verification notification
            GuardianNotification.objects.create(
                guardian=instance.guardian,
                title=f'Document Verified',
                message=f'Your {instance.get_document_type_display()} has been verified by the school administration.',
                notification_type='document',
                priority='low'
            )
            
            # Send email notification
            if instance.guardian.email:
                send_mail(
                    subject=f'Document Verified - {settings.SCHOOL_NAME}',
                    message=f'''
                    Dear {instance.guardian.full_name},
                    
                    Your {instance.get_document_type_display()} has been successfully verified by the school administration.
                    
                    Document Details:
                    - Type: {instance.get_document_type_display()}
                    - Verified By: {instance.verified_by.get_full_name() if instance.verified_by else 'School Admin'}
                    - Verified At: {instance.verified_at.strftime('%B %d, %Y at %I:%M %p')}
                    
                    Best regards,
                    {settings.SCHOOL_NAME} Team
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.guardian.email],
                    fail_silently=True
                )

@receiver(post_delete, sender=Guardian)
def guardian_deleted(sender, instance, **kwargs):
    """Clean up when guardian is deleted"""
    # Clean up associated files
    if instance.profile and instance.profile.profile_picture:
        try:
            instance.profile.profile_picture.delete(save=False)
        except:
            pass

@receiver(post_delete, sender=GuardianDocument)
def guardian_document_deleted(sender, instance, **kwargs):
    """Clean up document file when deleted"""
    if instance.file:
        try:
            instance.file.delete(save=False)
        except:
            pass

# Periodic functions for automated checks
def check_guardian_document_expiry():
    """Check for expiring guardian documents and send notifications"""
    from django.utils import timezone
    
    # Documents expiring in 30 days
    expiring_documents = GuardianDocument.objects.filter(
        expiry_date__lte=timezone.now().date() + timedelta(days=30),
        expiry_date__gt=timezone.now().date(),
        verified=True
    )
    
    for document in expiring_documents:
        GuardianNotification.objects.create(
            guardian=document.guardian,
            title=f'Document Expiring Soon',
            message=f'Your {document.get_document_type_display()} will expire on {document.expiry_date.strftime("%B %d, %Y")}. Please renew it soon.',
            notification_type='document',
            priority='high'
        )
        
        # Send email notification
        if document.guardian.email:
            send_mail(
                subject=f'Document Expiring Soon - {settings.SCHOOL_NAME}',
                message=f'''
                Dear {document.guardian.full_name},
                
                Your {document.get_document_type_display()} will expire on {document.expiry_date.strftime("%B %d, %Y")}.
                
                Please renew this document before the expiry date to avoid any issues with your guardian account.
                
                Best regards,
                {settings.SCHOOL_NAME} Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[document.guardian.email],
                fail_silently=True
            )

def check_guardian_activity():
    """Check for inactive guardians and send reminders"""
    from django.utils import timezone
    
    # Guardians who haven't logged in for 30 days
    inactive_threshold = timezone.now() - timedelta(days=30)
    inactive_guardians = Guardian.objects.filter(
        user__last_login__lt=inactive_threshold,
        is_active=True
    )
    
    for guardian in inactive_guardians:
        GuardianNotification.objects.create(
            guardian=guardian,
            title=f'Account Activity Reminder',
            message='You haven\'t accessed your guardian account recently. Please log in to check for any updates about your child.',
            notification_type='reminder',
            priority='medium'
        )
        
        # Send email reminder
        if guardian.email:
            send_mail(
                subject=f'Account Activity Reminder - {settings.SCHOOL_NAME}',
                message=f'''
                Dear {guardian.full_name},
                
                You haven't accessed your guardian account recently. There might be important updates about your child's academic progress, attendance, or other school-related information.
                
                Please log in to your guardian portal to stay updated.
                
                Best regards,
                {settings.SCHOOL_NAME} Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[guardian.email],
                fail_silently=True
            )

def check_guardian_student_relationships():
    """Check for guardians with multiple students and send summary notifications"""
    from django.utils import timezone
    
    # Guardians with multiple students
    guardians_with_multiple_students = Guardian.objects.annotate(
        student_count=Count('students')
    ).filter(student_count__gt=1, is_active=True)
    
    for guardian in guardians_with_multiple_students:
        # Send monthly summary if it's the first of the month
        if timezone.now().day == 1:
            GuardianNotification.objects.create(
                guardian=guardian,
                title=f'Monthly Student Summary',
                message=f'You have {guardian.students.count()} students linked to your account. Check the portal for their latest updates.',
                notification_type='summary',
                priority='low'
            )
            
            # Send email summary
            if guardian.email:
                send_mail(
                    subject=f'Monthly Student Summary - {settings.SCHOOL_NAME}',
                    message=f'''
                    Dear {guardian.full_name},
                    
                    This is your monthly summary for {timezone.now().strftime("%B %Y")}.
                    
                    You have {guardian.students.count()} students linked to your account:
                    {chr(10).join([f"- {rel.student.full_name} ({rel.student.student_id}) - {rel.student.class_enrolled.name if rel.student.class_enrolled else 'N/A'}" for rel in guardian.students.all()])}
                    
                    Please log in to your guardian portal to view detailed information about each student's progress.
                    
                    Best regards,
                    {settings.SCHOOL_NAME} Team
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[guardian.email],
                    fail_silently=True
                )
