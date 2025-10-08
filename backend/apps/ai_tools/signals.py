from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Avg, Count
from datetime import timedelta

from .models import (
    AIModel, AIQuizGenerator, AIQuestion, AILessonSummarizer,
    AIPerformancePredictor, AIAttendanceAnomalyDetector,
    AINaturalLanguageQuery, AITrainingJob, AIDataSource, AIUsageLog
)

User = get_user_model()


@receiver(post_save, sender=AIModel)
def handle_ai_model_save(sender, instance, created, **kwargs):
    """Handle AI model save events."""
    if created:
        # Log the creation of a new AI model
        AIUsageLog.objects.create(
            user=instance.created_by,
            tool_type='custom',
            input_data={
                'action': 'model_created',
                'model_name': instance.name
            },
            output_data={
                'model_id': str(instance.id),
                'model_type': instance.model_type
            },
            success=True
        )

        # Send notification to admins about new model
        if hasattr(settings, 'ADMIN_EMAILS'):
            try:
                model_name = instance.name
                creator = instance.created_by.username
                send_mail(
                    subject=f'New AI Model Created: {model_name}',
                    message=(
                        f'A new AI model "{model_name}" has been created by '
                        f'{creator}.'
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=settings.ADMIN_EMAILS,
                    fail_silently=True
                )
            except Exception:
                pass  # Email sending failed, but don't break the signal

    elif instance.status == 'active' and instance.is_active:
        # Model was activated
        AIUsageLog.objects.create(
            user=instance.created_by,
            tool_type='custom',
            input_data={
                'action': 'model_activated',
                'model_name': instance.name
            },
            output_data={'model_id': str(instance.id)},
            success=True
        )


@receiver(post_save, sender=AIQuizGenerator)
def handle_quiz_generator_save(sender, instance, created, **kwargs):
    """Handle quiz generator save events."""
    if created:
        # Log the creation of a new quiz generator
        AIUsageLog.objects.create(
            user=instance.created_by,
            tool_type='quiz_generator',
            input_data={
                'action': 'quiz_created',
                'title': instance.title,
                'difficulty': instance.difficulty,
                'question_count': instance.question_count
            },
            output_data={'quiz_id': str(instance.id)},
            success=True
        )

    elif instance.is_generated and instance.generation_status == 'active':
        # Quiz was successfully generated
        AIUsageLog.objects.create(
            user=instance.created_by,
            tool_type='quiz_generator',
            input_data={
                'action': 'quiz_generated',
                'quiz_id': str(instance.id)
            },
            output_data={
                'quiz_id': str(instance.id),
                'question_count': instance.questions.count(),
                'generated_at': (
                    instance.generated_at.isoformat()
                    if instance.generated_at else None
                )
            },
            success=True
        )


@receiver(post_save, sender=AIQuestion)
def handle_question_save(sender, instance, created, **kwargs):
    """Handle AI question save events."""
    if created:
        # Log the creation of a new question
        AIUsageLog.objects.create(
            user=instance.quiz.created_by,
            tool_type='quiz_generator',
            input_data={
                'action': 'question_created',
                'question_type': instance.question_type,
                'difficulty': instance.difficulty
            },
            output_data={
                'question_id': str(instance.id),
                'quiz_id': str(instance.quiz.id),
                'confidence_score': instance.confidence_score
            },
            success=True
        )


@receiver(post_save, sender=AILessonSummarizer)
def handle_lesson_summarizer_save(sender, instance, created, **kwargs):
    """Handle lesson summarizer save events."""
    if created:
        # Log the creation of a new lesson summarizer
        AIUsageLog.objects.create(
            user=instance.created_by,
            tool_type='summarizer',
            input_data={
                'action': 'summary_created',
                'title': instance.title,
                'summary_type': instance.summary_type
            },
            output_data={'summary_id': str(instance.id)},
            success=True
        )

    elif instance.is_generated and instance.generation_status == 'active':
        # Summary was successfully generated
        AIUsageLog.objects.create(
            user=instance.created_by,
            tool_type='summarizer',
            input_data={
                'action': 'summary_generated',
                'summary_id': str(instance.id)
            },
            output_data={
                'summary_id': str(instance.id),
                'readability_score': instance.readability_score,
                'generated_at': (
                    instance.generated_at.isoformat()
                    if instance.generated_at else None
                )
            },
            success=True
        )


@receiver(post_save, sender=AIPerformancePredictor)
def handle_performance_predictor_save(sender, instance, created, **kwargs):
    """Handle performance predictor save events."""
    if created:
        # Log the creation of a new performance prediction
        user = (
            instance.student.created_by
            if hasattr(instance.student, 'created_by') else None
        )
        AIUsageLog.objects.create(
            user=user,
            tool_type='predictor',
            input_data={
                'action': 'prediction_created',
                'prediction_type': instance.prediction_type,
                'student_id': instance.student.id
            },
            output_data={'prediction_id': str(instance.id)},
            success=True
        )

    elif instance.predicted_value and instance.confidence_score:
        # Prediction was generated
        user = (
            instance.student.created_by
            if hasattr(instance.student, 'created_by') else None
        )
        AIUsageLog.objects.create(
            user=user,
            tool_type='predictor',
            input_data={
                'action': 'prediction_generated',
                'prediction_id': str(instance.id)
            },
            output_data={
                'prediction_id': str(instance.id),
                'predicted_value': instance.predicted_value,
                'confidence_score': instance.confidence_score,
                'intervention_needed': instance.intervention_needed
            },
            success=True
        )


@receiver(post_save, sender=AIAttendanceAnomalyDetector)
def handle_attendance_anomaly_save(sender, instance, created, **kwargs):
    """Handle attendance anomaly detector save events."""
    if created:
        # Log the detection of a new anomaly
        user = (
            instance.student.created_by
            if hasattr(instance.student, 'created_by') else None
        )
        AIUsageLog.objects.create(
            user=user,
            tool_type='anomaly_detector',
            input_data={
                'action': 'anomaly_detected',
                'anomaly_type': instance.anomaly_type,
                'severity': instance.severity,
                'student_id': instance.student.id
            },
            output_data={'anomaly_id': str(instance.id)},
            success=True
        )

        # Send notification for critical anomalies
        if instance.severity == 'critical' and instance.intervention_needed:
            try:
                # Notify relevant staff about critical anomaly
                student_name = instance.student.full_name
                subject = f'Critical Attendance Anomaly: {student_name}'
                message = f"""
                A critical attendance anomaly has been detected for student
                {instance.student.full_name}.

                Details:
                - Anomaly Type: {instance.get_anomaly_type_display()}
                - Severity: {instance.get_severity_display()}
                - Attendance Rate: {instance.attendance_rate:.1f}%
                - Deviation: {instance.deviation:+.1f}%

                Please take immediate action.
                """

                # Send to relevant staff
                if hasattr(settings, 'STAFF_EMAILS'):
                    send_mail(
                        subject=subject,
                        message=message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=settings.STAFF_EMAILS,
                        fail_silently=True
                    )
            except Exception:
                pass  # Email sending failed, but don't break the signal

    elif instance.is_resolved:
        # Anomaly was resolved
        user = (
            instance.student.created_by
            if hasattr(instance.student, 'created_by') else None
        )
        AIUsageLog.objects.create(
            user=user,
            tool_type='anomaly_detector',
            input_data={
                'action': 'anomaly_resolved',
                'anomaly_id': str(instance.id)
            },
            output_data={
                'anomaly_id': str(instance.id),
                'resolution_date': (
                    instance.resolution_date.isoformat()
                    if instance.resolution_date else None
                )
            },
            success=True
        )


@receiver(post_save, sender=AINaturalLanguageQuery)
def handle_natural_language_query_save(sender, instance, created, **kwargs):
    """Handle natural language query save events."""
    if created:
        # Log the creation of a new query
        AIUsageLog.objects.create(
            user=instance.user,
            tool_type='nlq',
            input_data={
                'action': 'query_created',
                'query_text': instance.query_text[:100],  # Truncate
                'query_type': instance.query_type
            },
            output_data={'query_id': str(instance.id)},
            success=True
        )

    elif instance.status == 'completed' and instance.result_data:
        # Query was successfully processed
        AIUsageLog.objects.create(
            user=instance.user,
            tool_type='nlq',
            input_data={
                'action': 'query_completed',
                'query_id': str(instance.id)
            },
            output_data={
                'query_id': str(instance.id),
                'processing_time': (
                    str(instance.processing_time)
                    if instance.processing_time else None
                ),
                'confidence_score': instance.confidence_score,
                'user_rating': instance.user_rating
            },
            success=True
        )


@receiver(post_save, sender=AITrainingJob)
def handle_training_job_save(sender, instance, created, **kwargs):
    """Handle training job save events."""
    if created:
        # Log the creation of a new training job
        AIUsageLog.objects.create(
            user=instance.created_by,
            tool_type='custom',
            input_data={
                'action': 'training_job_created',
                'job_name': instance.name,
                'model_name': instance.ai_model.name
            },
            output_data={'job_id': str(instance.id)},
            success=True
        )

    elif instance.status == 'completed':
        # Training job completed successfully
        AIUsageLog.objects.create(
            user=instance.created_by,
            tool_type='custom',
            input_data={
                'action': 'training_job_completed',
                'job_id': str(instance.id)
            },
            output_data={
                'job_id': str(instance.id),
                'duration': (
                    str(instance.duration)
                    if instance.duration else None
                ),
                'final_metrics': instance.final_metrics
            },
            success=True
        )

        # Update the AI model with new metrics
        if instance.final_metrics:
            try:
                metrics = instance.final_metrics
                instance.ai_model.accuracy = metrics.get('accuracy')
                instance.ai_model.precision = metrics.get('precision')
                instance.ai_model.recall = metrics.get('recall')
                instance.ai_model.f1_score = metrics.get('f1_score')
                instance.ai_model.last_trained = timezone.now()
                instance.ai_model.training_duration = instance.duration
                instance.ai_model.save()
            except Exception:
                pass  # Don't break the signal if model update fails

    elif instance.status == 'failed':
        # Training job failed
        AIUsageLog.objects.create(
            user=instance.created_by,
            tool_type='custom',
            input_data={
                'action': 'training_job_failed',
                'job_id': str(instance.id)
            },
            output_data={
                'job_id': str(instance.id),
                'error_message': instance.error_message
            },
            success=False,
            error_message=instance.error_message
        )


@receiver(post_save, sender=AIDataSource)
def handle_data_source_save(sender, instance, created, **kwargs):
    """Handle data source save events."""
    if created:
        # Log the creation of a new data source
        AIUsageLog.objects.create(
            user=instance.created_by,
            tool_type='custom',
            input_data={
                'action': 'data_source_created',
                'name': instance.name,
                'source_type': instance.source_type
            },
            output_data={'data_source_id': str(instance.id)},
            success=True
        )


# Helper functions for periodic tasks (to be used with Celery)
def cleanup_old_usage_logs():
    """Clean up old usage logs (older than 90 days)."""
    cutoff_date = timezone.now() - timedelta(days=90)
    AIUsageLog.objects.filter(timestamp__lt=cutoff_date).delete()


def update_model_metrics():
    """Update AI model metrics based on recent usage."""
    for model in AIModel.objects.filter(is_active=True):
        # Calculate average accuracy from recent predictions
        recent_predictions = AIPerformancePredictor.objects.filter(
            ai_model=model,
            created_at__gte=timezone.now() - timedelta(days=30)
        )

        if recent_predictions.exists():
            avg_accuracy = recent_predictions.aggregate(
                avg=Avg('prediction_accuracy')
            )['avg']
            if avg_accuracy:
                model.accuracy = avg_accuracy
                model.save()


def generate_weekly_ai_report():
    """Generate weekly AI usage report."""
    week_ago = timezone.now() - timedelta(days=7)

    # Get usage statistics
    total_queries = AIUsageLog.objects.filter(
        timestamp__gte=week_ago
    ).count()
    successful_queries = AIUsageLog.objects.filter(
        timestamp__gte=week_ago,
        success=True
    ).count()

    # Get most used tools
    tool_usage = AIUsageLog.objects.filter(
        timestamp__gte=week_ago
    ).values('tool_type').annotate(
        count=Count('id')
    ).order_by('-count')

    # Get user satisfaction
    avg_satisfaction = AIUsageLog.objects.filter(
        timestamp__gte=week_ago,
        user_satisfaction__isnull=False
    ).aggregate(avg=Avg('user_satisfaction'))['avg'] or 0.0

    # Create report
    report_data = {
        'period': 'Weekly',
        'total_queries': total_queries,
        'successful_queries': successful_queries,
        'success_rate': (
            (successful_queries / total_queries * 100)
            if total_queries > 0 else 0
        ),
        'tool_usage': {
            item['tool_type']: item['count'] for item in tool_usage
        },
        'average_satisfaction': avg_satisfaction,
        'generated_at': timezone.now().isoformat()
    }

    # Here you would typically save this to a report model or send via email
    return report_data
