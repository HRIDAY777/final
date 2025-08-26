from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.db.models import Avg, Count, Q, Max, Min
from datetime import timedelta
import logging

from .models import (
    StudentPerformance, AttendanceAnalytics, ExamAnalytics, SystemUsage,
    LearningAnalytics, PredictiveAnalytics, AnalyticsDashboard
)

logger = logging.getLogger(__name__)


@receiver(post_save, sender='students.Student')
def create_student_performance_analytics(sender, instance, created, **kwargs):
    """
    Create initial performance analytics when a new student is created.
    """
    if created:
        try:
            StudentPerformance.objects.create(
                student=instance,
                academic_year=timezone.now().year,
                semester='1',  # Default to first semester
                score=0.0,
                performance_type='initial'
            )
            logger.info(f"Created initial performance analytics for student {instance.id}")
        except Exception as e:
            logger.error(f"Error creating performance analytics for student {instance.id}: {e}")


@receiver(post_save, sender='attendance.AttendanceRecord')
def update_attendance_analytics(sender, instance, created, **kwargs):
    """
    Update attendance analytics when attendance records are created or updated.
    """
    try:
        student = instance.student
        class_section = instance.class_section
        academic_year = instance.date.year
        semester = '1' if instance.date.month <= 6 else '2'
        
        # Calculate attendance rate for the period
        total_days = instance.class_section.school_days.filter(
            date__gte=timezone.now().replace(day=1),
            date__lte=timezone.now()
        ).count()
        
        if total_days > 0:
            present_days = instance.class_section.attendance_set.filter(
                student=student,
                date__gte=timezone.now().replace(day=1),
                date__lte=timezone.now(),
                status='present'
            ).count()
            
            attendance_rate = (present_days / total_days) * 100
            
            # Update or create attendance analytics
            analytics, created = AttendanceAnalytics.objects.get_or_create(
                student=student,
                class_section=class_section,
                academic_year=academic_year,
                semester=semester,
                defaults={
                    'attendance_rate': attendance_rate,
                    'total_days': total_days,
                    'present_days': present_days,
                    'absent_days': total_days - present_days
                }
            )
            
            if not created:
                analytics.attendance_rate = attendance_rate
                analytics.total_days = total_days
                analytics.present_days = present_days
                analytics.absent_days = total_days - present_days
                analytics.save()
            
            logger.info(f"Updated attendance analytics for student {student.id}")
            
    except Exception as e:
        logger.error(f"Error updating attendance analytics: {e}")


@receiver(post_save, sender='exams.ExamResult')
def update_exam_analytics(sender, instance, created, **kwargs):
    """
    Update exam analytics when exam results are created or updated.
    """
    try:
        exam = instance.exam
        subject = exam.subject
        class_section = exam.class_section
        academic_year = exam.exam_date.year
        
        # Calculate exam statistics
        results = exam.examresult_set.all()
        total_students = results.count()
        
        if total_students > 0:
            average_score = results.aggregate(avg_score=Avg('score'))['avg_score'] or 0
            pass_count = results.filter(score__gte=exam.pass_marks).count()
            pass_rate = (pass_count / total_students) * 100
            
            # Update or create exam analytics
            analytics, created = ExamAnalytics.objects.get_or_create(
                exam=exam,
                subject=subject,
                class_section=class_section,
                academic_year=academic_year,
                defaults={
                    'total_students': total_students,
                    'average_score': average_score,
                    'pass_rate': pass_rate,
                    'highest_score': results.aggregate(max_score=Max('score'))['max_score'] or 0,
                    'lowest_score': results.aggregate(min_score=Min('score'))['min_score'] or 0
                }
            )
            
            if not created:
                analytics.total_students = total_students
                analytics.average_score = average_score
                analytics.pass_rate = pass_rate
                analytics.highest_score = results.aggregate(max_score=Max('score'))['max_score'] or 0
                analytics.lowest_score = results.aggregate(min_score=Min('score'))['min_score'] or 0
                analytics.save()
            
            logger.info(f"Updated exam analytics for exam {exam.id}")
            
    except Exception as e:
        logger.error(f"Error updating exam analytics: {e}")


@receiver(post_save, sender='accounts.User')
def track_system_usage(sender, instance, created, **kwargs):
    """
    Track system usage when users perform actions.
    This is a simplified version - in practice, this would be called from middleware or views.
    """
    if not created:  # Only track usage for existing users
        try:
            # This would typically be called from middleware or views
            # For now, we'll just log the action
            logger.info(f"User {instance.username} performed an action")
            
        except Exception as e:
            logger.error(f"Error tracking system usage: {e}")


@receiver(post_save, sender='academics.Lesson')
def update_learning_analytics(sender, instance, created, **kwargs):
    """
    Update learning analytics when lessons are created or updated.
    """
    try:
        subject = instance.subject
        class_section = instance.class_section
        
        # Get all students in the class
        students = class_section.student_set.all()
        
        for student in students:
            # Calculate learning progress for this student and subject
            completed_lessons = subject.lesson_set.filter(
                class_section=class_section,
                status='completed'
            ).count()
            
            total_lessons = subject.lesson_set.filter(
                class_section=class_section
            ).count()
            
            if total_lessons > 0:
                progress_percentage = (completed_lessons / total_lessons) * 100
                
                # Update or create learning analytics
                analytics, created = LearningAnalytics.objects.get_or_create(
                    student=student,
                    subject=subject,
                    learning_path=instance.learning_path if hasattr(instance, 'learning_path') else None,
                    academic_year=timezone.now().year,
                    defaults={
                        'progress_percentage': progress_percentage,
                        'time_spent': 0,  # This would be calculated from actual usage data
                        'last_activity': timezone.now()
                    }
                )
                
                if not created:
                    analytics.progress_percentage = progress_percentage
                    analytics.last_activity = timezone.now()
                    analytics.save()
                
        logger.info(f"Updated learning analytics for lesson {instance.id}")
        
    except Exception as e:
        logger.error(f"Error updating learning analytics: {e}")


@receiver(post_save, sender=StudentPerformance)
def generate_predictive_insights(sender, instance, created, **kwargs):
    """
    Generate predictive insights when performance data is updated.
    """
    try:
        student = instance.student
        subject = instance.subject
        
        # Simple prediction logic (in practice, this would use ML models)
        recent_performance = StudentPerformance.objects.filter(
            student=student,
            subject=subject,
            created_at__gte=timezone.now() - timedelta(days=90)
        ).order_by('-created_at')[:5]
        
        if recent_performance.count() >= 3:
            avg_recent = recent_performance.aggregate(avg_score=Avg('score'))['avg_score']
            trend = 'improving' if avg_recent > instance.score else 'declining'
            
            # Create or update predictive analytics
            prediction, created = PredictiveAnalytics.objects.get_or_create(
                student=student,
                subject=subject,
                prediction_type='performance_prediction',
                academic_year=timezone.now().year,
                defaults={
                    'predicted_value': avg_recent,
                    'confidence_level': 75.0,  # Simple confidence calculation
                    'risk_level': 'low' if avg_recent >= 70 else 'medium' if avg_recent >= 50 else 'high',
                    'recommendations': f"Performance trend is {trend}. Consider additional support if needed."
                }
            )
            
            if not created:
                prediction.predicted_value = avg_recent
                prediction.confidence_level = 75.0
                prediction.risk_level = 'low' if avg_recent >= 70 else 'medium' if avg_recent >= 50 else 'high'
                prediction.recommendations = f"Performance trend is {trend}. Consider additional support if needed."
                prediction.save()
            
            logger.info(f"Generated predictive insights for student {student.id}")
            
    except Exception as e:
        logger.error(f"Error generating predictive insights: {e}")


@receiver(post_save, sender=AttendanceAnalytics)
def detect_attendance_anomalies(sender, instance, created, **kwargs):
    """
    Detect attendance anomalies and create alerts.
    """
    try:
        if instance.attendance_rate < 75:  # Low attendance threshold
            # Check if this is a significant drop
            previous_analytics = AttendanceAnalytics.objects.filter(
                student=instance.student,
                class_section=instance.class_section,
                created_at__lt=instance.created_at
            ).order_by('-created_at')[:3]
            
            if previous_analytics.exists():
                avg_previous = previous_analytics.aggregate(avg_rate=Avg('attendance_rate'))['avg_rate']
                if instance.attendance_rate < avg_previous - 20:  # 20% drop
                    # Create an alert or notification
                    logger.warning(
                        f"Attendance anomaly detected for student {instance.student.id}: "
                        f"Current rate: {instance.attendance_rate}%, Previous average: {avg_previous}%"
                    )
                    
                    # In a real implementation, you would create an alert/notification here
                    # from notifications.models import Alert
                    # Alert.objects.create(
                    #     user=instance.student.parent,
                    #     title="Attendance Alert",
                    #     message=f"Your child's attendance has dropped significantly.",
                    #     alert_type="attendance_anomaly"
                    # )
        
    except Exception as e:
        logger.error(f"Error detecting attendance anomalies: {e}")


def generate_weekly_analytics_report():
    """
    Generate weekly analytics report.
    This function would typically be called by a Celery task.
    """
    try:
        # Calculate weekly statistics
        week_start = timezone.now() - timedelta(days=7)
        
        # Student performance summary
        performance_summary = StudentPerformance.objects.filter(
            created_at__gte=week_start
        ).aggregate(
            avg_score=Avg('score'),
            total_records=Count('id')
        )
        
        # Attendance summary
        attendance_summary = AttendanceAnalytics.objects.filter(
            created_at__gte=week_start
        ).aggregate(
            avg_attendance=Avg('attendance_rate'),
            total_students=Count('student', distinct=True)
        )
        
        # System usage summary
        usage_summary = SystemUsage.objects.filter(
            timestamp__gte=week_start
        ).aggregate(
            total_actions=Count('id'),
            unique_users=Count('user', distinct=True)
        )
        
        # Log the weekly report
        logger.info("Weekly Analytics Report:")
        logger.info(f"Performance - Avg Score: {performance_summary['avg_score']:.2f}, Records: {performance_summary['total_records']}")
        logger.info(f"Attendance - Avg Rate: {attendance_summary['avg_attendance']:.2f}%, Students: {attendance_summary['total_students']}")
        logger.info(f"Usage - Actions: {usage_summary['total_actions']}, Users: {usage_summary['unique_users']}")
        
        # In a real implementation, you would send this report via email or store it
        # from reports.models import WeeklyReport
        # WeeklyReport.objects.create(
        #     performance_summary=performance_summary,
        #     attendance_summary=attendance_summary,
        #     usage_summary=usage_summary
        # )
        
    except Exception as e:
        logger.error(f"Error generating weekly analytics report: {e}")


def cleanup_old_analytics_data():
    """
    Clean up old analytics data to maintain performance.
    This function would typically be called by a Celery task.
    """
    try:
        # Keep data for 2 years
        cutoff_date = timezone.now() - timedelta(days=730)
        
        # Delete old analytics data
        old_performance = StudentPerformance.objects.filter(created_at__lt=cutoff_date)
        old_attendance = AttendanceAnalytics.objects.filter(created_at__lt=cutoff_date)
        old_exams = ExamAnalytics.objects.filter(created_at__lt=cutoff_date)
        old_usage = SystemUsage.objects.filter(timestamp__lt=cutoff_date)
        old_learning = LearningAnalytics.objects.filter(created_at__lt=cutoff_date)
        old_predictive = PredictiveAnalytics.objects.filter(created_at__lt=cutoff_date)
        
        deleted_count = (
            old_performance.count() + old_attendance.count() + old_exams.count() +
            old_usage.count() + old_learning.count() + old_predictive.count()
        )
        
        old_performance.delete()
        old_attendance.delete()
        old_exams.delete()
        old_usage.delete()
        old_learning.delete()
        old_predictive.delete()
        
        logger.info(f"Cleaned up {deleted_count} old analytics records")
        
    except Exception as e:
        logger.error(f"Error cleaning up old analytics data: {e}")

