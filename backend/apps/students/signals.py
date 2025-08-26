from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import date, timedelta
from django.db.models import Count, F, Q

from .models import (
    Student, StudentProfile, StudentAcademicRecord, StudentGuardian,
    StudentDocument, StudentAchievement, StudentDiscipline, StudentSettings
)


@receiver(post_save, sender=Student)
def student_created(sender, instance, created, **kwargs):
    """Handle student creation"""
    if created:
        # Create default settings
        StudentSettings.objects.get_or_create(student=instance)
        
        # Send welcome email to student
        if instance.email:
            try:
                send_mail(
                    subject=f'Welcome to {settings.SCHOOL_NAME} - {instance.full_name}',
                    message=f'''
                    Dear {instance.full_name},
                    
                    Welcome to {settings.SCHOOL_NAME}! Your student account has been created successfully.
                    
                    Student ID: {instance.student_id}
                    Admission Number: {instance.admission_number}
                    Class: {instance.current_class.name if instance.current_class else 'Not Assigned'}
                    
                    Please log in to your account to complete your profile and access your academic information.
                    
                    Best regards,
                    {settings.SCHOOL_NAME} Administration
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.email],
                    fail_silently=True
                )
            except Exception as e:
                print(f"Failed to send welcome email to {instance.email}: {e}")
        
        # Notify guardians
        for guardian in instance.guardians.filter(is_primary_guardian=True):
            if guardian.email:
                try:
                    send_mail(
                        subject=f'Student Registration - {instance.full_name}',
                        message=f'''
                        Dear {guardian.full_name},
                        
                        Your child {instance.full_name} has been successfully registered at {settings.SCHOOL_NAME}.
                        
                        Student Details:
                        - Student ID: {instance.student_id}
                        - Admission Number: {instance.admission_number}
                        - Class: {instance.current_class.name if instance.current_class else 'Not Assigned'}
                        - Admission Date: {instance.admission_date}
                        
                        You can access your child's academic information through the parent portal.
                        
                        Best regards,
                        {settings.SCHOOL_NAME} Administration
                        ''',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[guardian.email],
                        fail_silently=True
                    )
                except Exception as e:
                    print(f"Failed to send guardian notification to {guardian.email}: {e}")


@receiver(post_save, sender=Student)
def student_updated(sender, instance, created, **kwargs):
    """Handle student updates"""
    if not created:
        # Check if status changed
        if instance.tracker.has_changed('status'):
            old_status = instance.tracker.previous('status')
            new_status = instance.status
            
            # Notify guardians of status change
            for guardian in instance.guardians.filter(is_primary_guardian=True):
                if guardian.email:
                    try:
                        send_mail(
                            subject=f'Student Status Update - {instance.full_name}',
                            message=f'''
                            Dear {guardian.full_name},
                            
                            The status of your child {instance.full_name} has been updated.
                            
                            Previous Status: {old_status}
                            New Status: {new_status}
                            
                            If you have any questions, please contact the school administration.
                            
                            Best regards,
                            {settings.SCHOOL_NAME} Administration
                            ''',
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[guardian.email],
                            fail_silently=True
                        )
                    except Exception as e:
                        print(f"Failed to send status update to {guardian.email}: {e}")


@receiver(post_save, sender=StudentGuardian)
def guardian_created(sender, instance, created, **kwargs):
    """Handle guardian creation"""
    if created:
        # Send welcome email to guardian
        if instance.email:
            try:
                send_mail(
                    subject=f'Welcome to {settings.SCHOOL_NAME} Parent Portal',
                    message=f'''
                    Dear {instance.full_name},
                    
                    Welcome to the {settings.SCHOOL_NAME} Parent Portal!
                    
                    You have been registered as a guardian for {instance.student.full_name}.
                    Relationship: {instance.get_relationship_display()}
                    
                    You can now access your child's academic information, attendance records, and communicate with teachers through the parent portal.
                    
                    Best regards,
                    {settings.SCHOOL_NAME} Administration
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.email],
                    fail_silently=True
                )
            except Exception as e:
                print(f"Failed to send guardian welcome email to {instance.email}: {e}")


@receiver(post_save, sender=StudentAcademicRecord)
def academic_record_created(sender, instance, created, **kwargs):
    """Handle academic record creation"""
    if created:
        # Notify guardians of new academic record
        for guardian in instance.student.guardians.filter(is_primary_guardian=True):
            if guardian.email and instance.student.settings.grade_notifications:
                try:
                    send_mail(
                        subject=f'New Academic Record - {instance.student.full_name}',
                        message=f'''
                        Dear {guardian.full_name},
                        
                        A new academic record has been created for {instance.student.full_name}.
                        
                        Academic Year: {instance.academic_year.name}
                        Class: {instance.class_enrolled.name}
                        Percentage: {instance.percentage}%
                        Grade: {instance.grade}
                        Rank: {instance.rank}
                        Attendance: {instance.attendance_percentage}%
                        
                        You can view detailed information in the parent portal.
                        
                        Best regards,
                        {settings.SCHOOL_NAME} Administration
                        ''',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[guardian.email],
                        fail_silently=True
                    )
                except Exception as e:
                    print(f"Failed to send academic record notification to {guardian.email}: {e}")


@receiver(post_save, sender=StudentDiscipline)
def discipline_record_created(sender, instance, created, **kwargs):
    """Handle disciplinary record creation"""
    if created:
        # Notify guardians of disciplinary action
        for guardian in instance.student.guardians.filter(is_primary_guardian=True):
            if guardian.email:
                try:
                    send_mail(
                        subject=f'Disciplinary Action - {instance.student.full_name}',
                        message=f'''
                        Dear {guardian.full_name},
                        
                        A disciplinary action has been recorded for {instance.student.full_name}.
                        
                        Incident Date: {instance.incident_date}
                        Violation: {instance.violation}
                        Discipline Type: {instance.get_discipline_type_display()}
                        Severity: {instance.get_severity_display()}
                        Action Taken: {instance.action_taken}
                        
                        Please review this information and discuss with your child.
                        
                        Best regards,
                        {settings.SCHOOL_NAME} Administration
                        ''',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[guardian.email],
                        fail_silently=True
                    )
                except Exception as e:
                    print(f"Failed to send disciplinary notification to {guardian.email}: {e}")


@receiver(post_save, sender=StudentAchievement)
def achievement_created(sender, instance, created, **kwargs):
    """Handle achievement creation"""
    if created:
        # Notify guardians of achievement
        for guardian in instance.student.guardians.filter(is_primary_guardian=True):
            if guardian.email:
                try:
                    send_mail(
                        subject=f'Congratulations! Achievement - {instance.student.full_name}',
                        message=f'''
                        Dear {guardian.full_name},
                        
                        Congratulations! {instance.student.full_name} has achieved a new milestone.
                        
                        Achievement: {instance.title}
                        Type: {instance.get_achievement_type_display()}
                        Level: {instance.get_level_display()}
                        Date: {instance.date_achieved}
                        Position: {instance.position}
                        Points Awarded: {instance.points_awarded}
                        
                        We are proud of this accomplishment!
                        
                        Best regards,
                        {settings.SCHOOL_NAME} Administration
                        ''',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[guardian.email],
                        fail_silently=True
                    )
                except Exception as e:
                    print(f"Failed to send achievement notification to {guardian.email}: {e}")


@receiver(post_save, sender=StudentDocument)
def document_created(sender, instance, created, **kwargs):
    """Handle document creation"""
    if created:
        # Notify admin for verification
        try:
            send_mail(
                subject=f'New Document Uploaded - {instance.student.full_name}',
                message=f'''
                A new document has been uploaded for {instance.student.full_name}.
                
                Document Type: {instance.get_document_type_display()}
                Title: {instance.title}
                Upload Date: {instance.created_at}
                
                Please review and verify this document.
                
                Best regards,
                System Notification
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ADMIN_EMAIL],
                fail_silently=True
            )
        except Exception as e:
            print(f"Failed to send document notification to admin: {e}")


@receiver(post_delete, sender=Student)
def student_deleted(sender, instance, **kwargs):
    """Handle student deletion"""
    # Clean up related files
    if hasattr(instance, 'profile') and instance.profile.profile_picture:
        try:
            instance.profile.profile_picture.delete(save=False)
        except:
            pass


@receiver(post_delete, sender=StudentDocument)
def document_deleted(sender, instance, **kwargs):
    """Handle document deletion"""
    # Clean up file
    if instance.file:
        try:
            instance.file.delete(save=False)
        except:
            pass


@receiver(post_delete, sender=StudentAchievement)
def achievement_deleted(sender, instance, **kwargs):
    """Handle achievement deletion"""
    # Clean up certificate file
    if instance.certificate:
        try:
            instance.certificate.delete(save=False)
        except:
            pass


def check_student_attendance():
    """Check student attendance and send notifications for low attendance"""
    from apps.attendance.models import AttendanceRecord
    
    # Get students with attendance below 75% in the last 30 days
    thirty_days_ago = timezone.now().date() - timedelta(days=30)
    
    students_with_low_attendance = Student.objects.filter(
        status='active',
        attendance_records__date__gte=thirty_days_ago
    ).annotate(
        total_days=Count('attendance_records'),
        present_days=Count('attendance_records', filter=Q(attendance_records__status='present'))
    ).filter(
        present_days__lt=F('total_days') * 0.75
    )
    
    for student in students_with_low_attendance:
        attendance_percentage = (student.present_days / student.total_days) * 100
        
        # Notify guardians
        for guardian in student.guardians.filter(is_primary_guardian=True):
            if guardian.email and student.settings.attendance_notifications:
                try:
                    send_mail(
                        subject=f'Low Attendance Alert - {student.full_name}',
                        message=f'''
                        Dear {guardian.full_name},
                        
                        This is to inform you that {student.full_name} has low attendance.
                        
                        Attendance in the last 30 days: {attendance_percentage:.1f}%
                        Present Days: {student.present_days}
                        Total Days: {student.total_days}
                        
                        Please ensure regular attendance to maintain academic progress.
                        
                        Best regards,
                        {settings.SCHOOL_NAME} Administration
                        ''',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[guardian.email],
                        fail_silently=True
                    )
                except Exception as e:
                    print(f"Failed to send attendance alert to {guardian.email}: {e}")


def check_upcoming_birthdays():
    """Check upcoming birthdays and send notifications"""
    today = timezone.now().date()
    next_week = today + timedelta(days=7)
    
    upcoming_birthdays = Student.objects.filter(
        status='active',
        date_of_birth__month=next_week.month,
        date_of_birth__day__gte=next_week.day
    )
    
    for student in upcoming_birthdays:
        # Notify teachers
        if student.current_class:
            for teacher in student.current_class.teachers.all():
                if teacher.email:
                    try:
                        send_mail(
                            subject=f'Upcoming Birthday - {student.full_name}',
                            message=f'''
                            Dear {teacher.full_name},
                            
                            {student.full_name} from {student.current_class.name} will be celebrating their birthday on {student.date_of_birth.strftime('%B %d')}.
                            
                            Please join us in wishing them a happy birthday!
                            
                            Best regards,
                            {settings.SCHOOL_NAME} Administration
                            ''',
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[teacher.email],
                            fail_silently=True
                        )
                    except Exception as e:
                        print(f"Failed to send birthday notification to {teacher.email}: {e}")


def check_document_expiry():
    """Check document expiry and send notifications"""
    today = timezone.now().date()
    thirty_days_from_now = today + timedelta(days=30)
    
    expiring_documents = StudentDocument.objects.filter(
        expiry_date__lte=thirty_days_from_now,
        expiry_date__gt=today,
        is_verified=True
    )
    
    for document in expiring_documents:
        days_until_expiry = (document.expiry_date - today).days
        
        # Notify guardians
        for guardian in document.student.guardians.filter(is_primary_guardian=True):
            if guardian.email:
                try:
                    send_mail(
                        subject=f'Document Expiry Alert - {document.student.full_name}',
                        message=f'''
                        Dear {guardian.full_name},
                        
                        This is to remind you that a document for {document.student.full_name} will expire soon.
                        
                        Document: {document.get_document_type_display()}
                        Title: {document.title}
                        Expiry Date: {document.expiry_date}
                        Days Remaining: {days_until_expiry}
                        
                        Please renew this document before it expires.
                        
                        Best regards,
                        {settings.SCHOOL_NAME} Administration
                        ''',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[guardian.email],
                        fail_silently=True
                    )
                except Exception as e:
                    print(f"Failed to send document expiry notification to {guardian.email}: {e}")
