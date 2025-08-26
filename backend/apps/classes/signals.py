from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import date, timedelta
from django.db.models import Count, F, Q

from .models import (
    Class, Subject, ClassSubject, ClassRoom, ClassSchedule,
    ClassEnrollment, SubjectPrerequisite, ClassSettings
)

@receiver(post_save, sender=Class)
def class_created(sender, instance, created, **kwargs):
    """Create default settings when a class is created"""
    if created:
        ClassSettings.objects.get_or_create(class_obj=instance)

@receiver(post_save, sender=Class)
def class_updated(sender, instance, created, **kwargs):
    """Handle class updates and notifications"""
    if not created:
        if hasattr(instance, 'tracker') and instance.tracker.has_changed('class_teacher'):
            # Notify new class teacher
            if instance.class_teacher and instance.class_teacher.email:
                send_mail(
                    subject=f'Class Assignment - {settings.SCHOOL_NAME}',
                    message=f'''
                    Dear {instance.class_teacher.full_name},
                    
                    You have been assigned as the class teacher for {instance.full_name}.
                    
                    Class Details:
                    - Class: {instance.full_name}
                    - Grade Level: {instance.get_grade_level_display()}
                    - Capacity: {instance.capacity}
                    - Current Students: {instance.current_students}
                    
                    Please review the class schedule and student list in your dashboard.
                    
                    Best regards,
                    {settings.SCHOOL_NAME} Team
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.class_teacher.email],
                    fail_silently=True
                )

@receiver(post_save, sender=ClassSubject)
def class_subject_created(sender, instance, created, **kwargs):
    """Send notification when a subject is assigned to a class"""
    if created and instance.teacher and instance.teacher.email:
        send_mail(
            subject=f'Subject Assignment - {settings.SCHOOL_NAME}',
            message=f'''
            Dear {instance.teacher.full_name},
            
            You have been assigned to teach {instance.subject.name} in {instance.class_obj.full_name}.
            
            Assignment Details:
            - Class: {instance.class_obj.full_name}
            - Subject: {instance.subject.name}
            - Weekly Hours: {instance.weekly_hours}
            - Compulsory: {'Yes' if instance.is_compulsory else 'No'}
            
            Please check your schedule and prepare your lesson plans accordingly.
            
            Best regards,
            {settings.SCHOOL_NAME} Team
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[instance.teacher.email],
            fail_silently=True
        )

@receiver(post_save, sender=ClassEnrollment)
def enrollment_created(sender, instance, created, **kwargs):
    """Send notification when a student is enrolled in a class"""
    if created:
        # Notify student's guardians
        guardians = instance.student.guardian_relationships.all()
        for guardian_rel in guardians:
            if guardian_rel.guardian.email:
                send_mail(
                    subject=f'Student Enrollment - {settings.SCHOOL_NAME}',
                    message=f'''
                    Dear {guardian_rel.guardian.full_name},
                    
                    {instance.student.full_name} has been enrolled in {instance.class_obj.full_name}.
                    
                    Enrollment Details:
                    - Student: {instance.student.full_name} ({instance.student.student_id})
                    - Class: {instance.class_obj.full_name}
                    - Academic Year: {instance.academic_year.name}
                    - Enrollment Date: {instance.enrollment_date.strftime('%B %d, %Y')}
                    - Status: {instance.get_status_display()}
                    
                    You can view the class schedule and academic progress through the parent portal.
                    
                    Best regards,
                    {settings.SCHOOL_NAME} Team
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[guardian_rel.guardian.email],
                    fail_silently=True
                )

@receiver(post_save, sender=ClassEnrollment)
def enrollment_status_changed(sender, instance, created, **kwargs):
    """Handle enrollment status changes"""
    if not created and hasattr(instance, 'tracker') and instance.tracker.has_changed('status'):
        # Notify guardians of status change
        guardians = instance.student.guardian_relationships.all()
        for guardian_rel in guardians:
            if guardian_rel.guardian.email:
                send_mail(
                    subject=f'Enrollment Status Update - {settings.SCHOOL_NAME}',
                    message=f'''
                    Dear {guardian_rel.guardian.full_name},
                    
                    The enrollment status for {instance.student.full_name} in {instance.class_obj.full_name} has been updated.
                    
                    Updated Details:
                    - Student: {instance.student.full_name}
                    - Class: {instance.class_obj.full_name}
                    - New Status: {instance.get_status_display()}
                    - Updated Date: {timezone.now().strftime('%B %d, %Y at %I:%M %p')}
                    
                    If you have any questions about this change, please contact the school administration.
                    
                    Best regards,
                    {settings.SCHOOL_NAME} Team
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[guardian_rel.guardian.email],
                    fail_silently=True
                )

@receiver(post_save, sender=ClassSchedule)
def schedule_created(sender, instance, created, **kwargs):
    """Send notification when a new schedule is created"""
    if created:
        # Notify teacher
        if instance.teacher and instance.teacher.email:
            send_mail(
                subject=f'New Class Schedule - {settings.SCHOOL_NAME}',
                message=f'''
                Dear {instance.teacher.full_name},
                
                A new class schedule has been created for you.
                
                Schedule Details:
                - Class: {instance.class_obj.full_name}
                - Subject: {instance.subject.name}
                - Day: {instance.get_day_of_week_display()}
                - Time: {instance.start_time.strftime('%I:%M %p')} - {instance.end_time.strftime('%I:%M %p')}
                - Room: {instance.room.full_name}
                - Period: {instance.period_number}
                
                Please update your personal schedule accordingly.
                
                Best regards,
                {settings.SCHOOL_NAME} Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[instance.teacher.email],
                fail_silently=True
            )

@receiver(post_save, sender=ClassSchedule)
def schedule_updated(sender, instance, created, **kwargs):
    """Handle schedule updates and notify affected parties"""
    if not created and hasattr(instance, 'tracker'):
        changed_fields = []
        if instance.tracker.has_changed('start_time'):
            changed_fields.append('start time')
        if instance.tracker.has_changed('end_time'):
            changed_fields.append('end time')
        if instance.tracker.has_changed('room'):
            changed_fields.append('room')
        
        if changed_fields and instance.teacher and instance.teacher.email:
            send_mail(
                subject=f'Schedule Update - {settings.SCHOOL_NAME}',
                message=f'''
                Dear {instance.teacher.full_name},
                
                Your class schedule has been updated.
                
                Updated Schedule:
                - Class: {instance.class_obj.full_name}
                - Subject: {instance.subject.name}
                - Day: {instance.get_day_of_week_display()}
                - Time: {instance.start_time.strftime('%I:%M %p')} - {instance.end_time.strftime('%I:%M %p')}
                - Room: {instance.room.full_name}
                - Period: {instance.period_number}
                
                Changes made: {', '.join(changed_fields)}
                
                Please update your personal schedule accordingly.
                
                Best regards,
                {settings.SCHOOL_NAME} Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[instance.teacher.email],
                fail_silently=True
            )

# Periodic functions for automated checks
def check_class_capacity():
    """Check for classes approaching capacity and send notifications"""
    from django.utils import timezone
    
    # Classes at 90% capacity or higher
    high_occupancy_classes = Class.objects.filter(
        current_students__gte=F('capacity') * 0.9,
        is_active=True
    )
    
    for class_obj in high_occupancy_classes:
        if class_obj.class_teacher and class_obj.class_teacher.email:
            send_mail(
                subject=f'Class Capacity Alert - {settings.SCHOOL_NAME}',
                message=f'''
                Dear {class_obj.class_teacher.full_name},
                
                Your class {class_obj.full_name} is approaching full capacity.
                
                Capacity Details:
                - Current Students: {class_obj.current_students}
                - Maximum Capacity: {class_obj.capacity}
                - Occupancy Rate: {class_obj.occupancy_rate:.1f}%
                
                Please consider this when planning future enrollments.
                
                Best regards,
                {settings.SCHOOL_NAME} Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[class_obj.class_teacher.email],
                fail_silently=True
            )

def check_room_availability():
    """Check for room conflicts and send notifications"""
    from django.utils import timezone
    
    # Find rooms that are unavailable but have active schedules
    unavailable_rooms = ClassRoom.objects.filter(is_available=False, is_active=True)
    
    for room in unavailable_rooms:
        # Find active schedules for this room
        active_schedules = ClassSchedule.objects.filter(room=room, is_active=True)
        
        if active_schedules.exists():
            # Notify administrators about the conflict
            send_mail(
                subject=f'Room Availability Conflict - {settings.SCHOOL_NAME}',
                message=f'''
                Room {room.full_name} is marked as unavailable but has active schedules.
                
                Room Details:
                - Room: {room.full_name}
                - Type: {room.get_room_type_display()}
                - Capacity: {room.capacity}
                
                Active Schedules: {active_schedules.count()}
                
                Please review and update the room availability or reschedule the classes.
                
                Best regards,
                {settings.SCHOOL_NAME} Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ADMIN_EMAIL] if hasattr(settings, 'ADMIN_EMAIL') else [],
                fail_silently=True
            )

def check_subject_prerequisites():
    """Check for students enrolled in subjects without meeting prerequisites"""
    from django.utils import timezone
    
    # Get all subject prerequisites
    prerequisites = SubjectPrerequisite.objects.filter(is_mandatory=True)
    
    for prereq in prerequisites:
        # Find students enrolled in the subject
        subject_enrollments = ClassEnrollment.objects.filter(
            class_obj__subjects__subject=prereq.subject,
            status='active'
        )
        
        for enrollment in subject_enrollments:
            # Check if student has completed the prerequisite subject
            # This would need to be implemented based on your grading system
            # For now, we'll just log the check
            pass

def generate_class_reports():
    """Generate periodic class reports"""
    from django.utils import timezone
    
    # Generate monthly class reports
    if timezone.now().day == 1:  # First day of month
        classes = Class.objects.filter(is_active=True)
        
        for class_obj in classes:
            if class_obj.class_teacher and class_obj.class_teacher.email:
                # Calculate class statistics
                total_students = class_obj.current_students
                total_subjects = class_obj.subjects.filter(is_active=True).count()
                total_schedules = class_obj.schedules.filter(is_active=True).count()
                
                send_mail(
                    subject=f'Monthly Class Report - {settings.SCHOOL_NAME}',
                    message=f'''
                    Dear {class_obj.class_teacher.full_name},
                    
                    Monthly Report for {class_obj.full_name} - {timezone.now().strftime('%B %Y')}
                    
                    Class Statistics:
                    - Total Students: {total_students}
                    - Total Subjects: {total_subjects}
                    - Total Schedules: {total_schedules}
                    - Occupancy Rate: {class_obj.occupancy_rate:.1f}%
                    
                    Please review the class performance and attendance records.
                    
                    Best regards,
                    {settings.SCHOOL_NAME} Team
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[class_obj.class_teacher.email],
                    fail_silently=True
                )
