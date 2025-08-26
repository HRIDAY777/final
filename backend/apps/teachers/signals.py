from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import date, timedelta
from django.db.models import Count, F, Q

from .models import (
    Teacher, TeacherProfile, TeacherQualification, TeacherExperience,
    TeacherSubject, TeacherClass, TeacherAttendance, TeacherSalary,
    TeacherLeave, TeacherPerformance, TeacherDocument, TeacherSettings
)


@receiver(post_save, sender=Teacher)
def teacher_created(sender, instance, created, **kwargs):
    """Handle teacher creation"""
    if created:
        # Create default settings
        TeacherSettings.objects.get_or_create(teacher=instance)
        
        # Send welcome email to teacher
        if instance.email:
            try:
                send_mail(
                    subject=f'Welcome to {settings.SCHOOL_NAME} - {instance.full_name}',
                    message=f'''
                    Dear {instance.full_name},
                    
                    Welcome to {settings.SCHOOL_NAME}! Your teacher account has been created successfully.
                    
                    Teacher ID: {instance.teacher_id}
                    Employee Number: {instance.employee_number}
                    Designation: {instance.designation}
                    Department: {instance.department}
                    Joining Date: {instance.joining_date}
                    
                    Please log in to your account to complete your profile and access your teaching information.
                    
                    Best regards,
                    {settings.SCHOOL_NAME} Administration
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.email],
                    fail_silently=True
                )
            except Exception as e:
                print(f"Failed to send welcome email to {instance.email}: {e}")


@receiver(post_save, sender=Teacher)
def teacher_updated(sender, instance, created, **kwargs):
    """Handle teacher updates"""
    if not created:
        # Check if status changed
        if instance.tracker.has_changed('status'):
            old_status = instance.tracker.previous('status')
            new_status = instance.status
            
            # Send status change notification
            if instance.email:
                try:
                    send_mail(
                        subject=f'Status Update - {instance.full_name}',
                        message=f'''
                        Dear {instance.full_name},
                        
                        Your status has been updated.
                        
                        Previous Status: {old_status}
                        New Status: {new_status}
                        
                        If you have any questions, please contact the administration.
                        
                        Best regards,
                        {settings.SCHOOL_NAME} Administration
                        ''',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[instance.email],
                        fail_silently=True
                    )
                except Exception as e:
                    print(f"Failed to send status update to {instance.email}: {e}")


@receiver(post_save, sender=TeacherQualification)
def qualification_created(sender, instance, created, **kwargs):
    """Handle qualification creation"""
    if created:
        # Notify admin for verification
        try:
            send_mail(
                subject=f'New Qualification Added - {instance.teacher.full_name}',
                message=f'''
                A new qualification has been added for {instance.teacher.full_name}.
                
                Degree: {instance.degree}
                Institution: {instance.institution}
                Field of Study: {instance.field_of_study}
                Completion Year: {instance.completion_year}
                
                Please review and verify this qualification.
                
                Best regards,
                System Notification
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ADMIN_EMAIL],
                fail_silently=True
            )
        except Exception as e:
            print(f"Failed to send qualification notification to admin: {e}")


@receiver(post_save, sender=TeacherQualification)
def qualification_verified(sender, instance, created, **kwargs):
    """Handle qualification verification"""
    if not created and instance.is_verified:
        # Notify teacher of verification
        if instance.teacher.email:
            try:
                send_mail(
                    subject=f'Qualification Verified - {instance.teacher.full_name}',
                    message=f'''
                    Dear {instance.teacher.full_name},
                    
                    Your qualification has been verified.
                    
                    Degree: {instance.degree}
                    Institution: {instance.institution}
                    Field of Study: {instance.field_of_study}
                    Completion Year: {instance.completion_year}
                    
                    Best regards,
                    {settings.SCHOOL_NAME} Administration
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.teacher.email],
                    fail_silently=True
                )
            except Exception as e:
                print(f"Failed to send qualification verification to {instance.teacher.email}: {e}")


@receiver(post_save, sender=TeacherLeave)
def leave_request_created(sender, instance, created, **kwargs):
    """Handle leave request creation"""
    if created:
        # Notify admin of leave request
        try:
            send_mail(
                subject=f'Leave Request - {instance.teacher.full_name}',
                message=f'''
                A leave request has been submitted by {instance.teacher.full_name}.
                
                Leave Type: {instance.get_leave_type_display()}
                Start Date: {instance.start_date}
                End Date: {instance.end_date}
                Total Days: {instance.total_days}
                Reason: {instance.reason}
                
                Please review and approve/reject this request.
                
                Best regards,
                System Notification
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ADMIN_EMAIL],
                fail_silently=True
            )
        except Exception as e:
            print(f"Failed to send leave request notification to admin: {e}")


@receiver(post_save, sender=TeacherLeave)
def leave_status_updated(sender, instance, created, **kwargs):
    """Handle leave status updates"""
    if not created and instance.tracker.has_changed('status'):
        # Notify teacher of status change
        if instance.teacher.email and instance.teacher.settings.leave_notifications:
            try:
                send_mail(
                    subject=f'Leave Request {instance.status.title()} - {instance.teacher.full_name}',
                    message=f'''
                    Dear {instance.teacher.full_name},
                    
                    Your leave request has been {instance.status}.
                    
                    Leave Type: {instance.get_leave_type_display()}
                    Start Date: {instance.start_date}
                    End Date: {instance.end_date}
                    Total Days: {instance.total_days}
                    Status: {instance.get_status_display()}
                    
                    {f"Remarks: {instance.remarks}" if instance.remarks else ""}
                    
                    Best regards,
                    {settings.SCHOOL_NAME} Administration
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.teacher.email],
                    fail_silently=True
                )
            except Exception as e:
                print(f"Failed to send leave status update to {instance.teacher.email}: {e}")


@receiver(post_save, sender=TeacherSalary)
def salary_created(sender, instance, created, **kwargs):
    """Handle salary creation"""
    if created:
        # Notify teacher of salary generation
        if instance.teacher.email and instance.teacher.settings.salary_notifications:
            try:
                send_mail(
                    subject=f'Salary Generated - {instance.teacher.full_name} ({instance.month}/{instance.year})',
                    message=f'''
                    Dear {instance.teacher.full_name},
                    
                    Your salary for {instance.month}/{instance.year} has been generated.
                    
                    Basic Salary: {instance.basic_salary}
                    Gross Salary: {instance.gross_salary}
                    Total Deductions: {instance.total_deductions}
                    Net Salary: {instance.net_salary}
                    Payment Status: {instance.get_payment_status_display()}
                    
                    Best regards,
                    {settings.SCHOOL_NAME} Administration
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.teacher.email],
                    fail_silently=True
                )
            except Exception as e:
                print(f"Failed to send salary notification to {instance.teacher.email}: {e}")


@receiver(post_save, sender=TeacherSalary)
def salary_paid(sender, instance, created, **kwargs):
    """Handle salary payment"""
    if not created and instance.tracker.has_changed('payment_status') and instance.payment_status == 'paid':
        # Notify teacher of salary payment
        if instance.teacher.email and instance.teacher.settings.salary_notifications:
            try:
                send_mail(
                    subject=f'Salary Paid - {instance.teacher.full_name} ({instance.month}/{instance.year})',
                    message=f'''
                    Dear {instance.teacher.full_name},
                    
                    Your salary for {instance.month}/{instance.year} has been paid.
                    
                    Net Salary: {instance.net_salary}
                    Payment Date: {instance.payment_date}
                    Payment Method: {instance.payment_method}
                    
                    Best regards,
                    {settings.SCHOOL_NAME} Administration
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.teacher.email],
                    fail_silently=True
                )
            except Exception as e:
                print(f"Failed to send salary payment notification to {instance.teacher.email}: {e}")


@receiver(post_save, sender=TeacherPerformance)
def performance_evaluated(sender, instance, created, **kwargs):
    """Handle performance evaluation"""
    if created:
        # Notify teacher of performance evaluation
        if instance.teacher.email and instance.teacher.settings.performance_notifications:
            try:
                send_mail(
                    subject=f'Performance Evaluation - {instance.teacher.full_name}',
                    message=f'''
                    Dear {instance.teacher.full_name},
                    
                    Your performance evaluation has been completed.
                    
                    Academic Year: {instance.academic_year.name}
                    Evaluation Period: {instance.get_evaluation_period_display()}
                    Overall Score: {instance.overall_score}/10
                    Grade: {instance.grade}
                    
                    Strengths: {instance.strengths}
                    Areas for Improvement: {instance.areas_for_improvement}
                    Recommendations: {instance.recommendations}
                    
                    Best regards,
                    {settings.SCHOOL_NAME} Administration
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.teacher.email],
                    fail_silently=True
                )
            except Exception as e:
                print(f"Failed to send performance evaluation to {instance.teacher.email}: {e}")


@receiver(post_save, sender=TeacherDocument)
def document_created(sender, instance, created, **kwargs):
    """Handle document creation"""
    if created:
        # Notify admin for verification
        try:
            send_mail(
                subject=f'New Document Uploaded - {instance.teacher.full_name}',
                message=f'''
                A new document has been uploaded by {instance.teacher.full_name}.
                
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


@receiver(post_save, sender=TeacherDocument)
def document_verified(sender, instance, created, **kwargs):
    """Handle document verification"""
    if not created and instance.is_verified:
        # Notify teacher of verification
        if instance.teacher.email:
            try:
                send_mail(
                    subject=f'Document Verified - {instance.teacher.full_name}',
                    message=f'''
                    Dear {instance.teacher.full_name},
                    
                    Your document has been verified.
                    
                    Document Type: {instance.get_document_type_display()}
                    Title: {instance.title}
                    Verification Date: {instance.verified_date}
                    
                    Best regards,
                    {settings.SCHOOL_NAME} Administration
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.teacher.email],
                    fail_silently=True
                )
            except Exception as e:
                print(f"Failed to send document verification to {instance.teacher.email}: {e}")


@receiver(post_delete, sender=Teacher)
def teacher_deleted(sender, instance, **kwargs):
    """Handle teacher deletion"""
    # Clean up related files
    if hasattr(instance, 'profile') and instance.profile.profile_picture:
        try:
            instance.profile.profile_picture.delete(save=False)
        except:
            pass


@receiver(post_delete, sender=TeacherDocument)
def document_deleted(sender, instance, **kwargs):
    """Handle document deletion"""
    # Clean up file
    if instance.file:
        try:
            instance.file.delete(save=False)
        except:
            pass


@receiver(post_delete, sender=TeacherQualification)
def qualification_deleted(sender, instance, **kwargs):
    """Handle qualification deletion"""
    # Clean up certificate file
    if instance.certificate:
        try:
            instance.certificate.delete(save=False)
        except:
            pass


def check_teacher_attendance():
    """Check teacher attendance and send notifications for low attendance"""
    # Get teachers with attendance below 80% in the last 30 days
    thirty_days_ago = timezone.now().date() - timedelta(days=30)
    
    teachers_with_low_attendance = Teacher.objects.filter(
        status='active',
        attendance_records__date__gte=thirty_days_ago
    ).annotate(
        total_days=Count('attendance_records'),
        present_days=Count('attendance_records', filter=Q(attendance_records__status='present'))
    ).filter(
        present_days__lt=F('total_days') * 0.8
    )
    
    for teacher in teachers_with_low_attendance:
        attendance_percentage = (teacher.present_days / teacher.total_days) * 100
        
        # Notify teacher
        if teacher.email and teacher.settings.attendance_notifications:
            try:
                send_mail(
                    subject=f'Low Attendance Alert - {teacher.full_name}',
                    message=f'''
                    Dear {teacher.full_name},
                    
                    This is to inform you that you have low attendance.
                    
                    Attendance in the last 30 days: {attendance_percentage:.1f}%
                    Present Days: {teacher.present_days}
                    Total Days: {teacher.total_days}
                    
                    Please ensure regular attendance to maintain professional standards.
                    
                    Best regards,
                    {settings.SCHOOL_NAME} Administration
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[teacher.email],
                    fail_silently=True
                )
            except Exception as e:
                print(f"Failed to send attendance alert to {teacher.email}: {e}")


def check_document_expiry():
    """Check document expiry and send notifications"""
    today = timezone.now().date()
    thirty_days_from_now = today + timedelta(days=30)
    
    expiring_documents = TeacherDocument.objects.filter(
        expiry_date__lte=thirty_days_from_now,
        expiry_date__gt=today,
        is_verified=True
    )
    
    for document in expiring_documents:
        days_until_expiry = (document.expiry_date - today).days
        
        # Notify teacher
        if document.teacher.email:
            try:
                send_mail(
                    subject=f'Document Expiry Alert - {document.teacher.full_name}',
                    message=f'''
                    Dear {document.teacher.full_name},
                    
                    This is to remind you that a document will expire soon.
                    
                    Document: {document.get_document_type_display()}
                    Title: {document.title}
                    Expiry Date: {document.expiry_date}
                    Days Remaining: {days_until_expiry}
                    
                    Please renew this document before it expires.
                    
                    Best regards,
                    {settings.SCHOOL_NAME} Administration
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[document.teacher.email],
                    fail_silently=True
                )
            except Exception as e:
                print(f"Failed to send document expiry notification to {document.teacher.email}: {e}")


def check_upcoming_birthdays():
    """Check upcoming birthdays and send notifications"""
    today = timezone.now().date()
    next_week = today + timedelta(days=7)
    
    upcoming_birthdays = Teacher.objects.filter(
        status='active',
        date_of_birth__month=next_week.month,
        date_of_birth__day__gte=next_week.day
    )
    
    for teacher in upcoming_birthdays:
        # Notify admin
        try:
            send_mail(
                subject=f'Upcoming Birthday - {teacher.full_name}',
                message=f'''
                {teacher.full_name} from {teacher.department} will be celebrating their birthday on {teacher.date_of_birth.strftime('%B %d')}.
                
                Please join us in wishing them a happy birthday!
                
                Best regards,
                System Notification
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ADMIN_EMAIL],
                fail_silently=True
            )
        except Exception as e:
            print(f"Failed to send birthday notification to admin: {e}")
