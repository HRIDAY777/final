from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import (
    ReportTemplate, ScheduledReport, GeneratedReport, ReportParameter,
    ReportCategory, ReportAccessLog, ReportExport, ReportComment, ReportDashboard
)


@receiver(post_save, sender=ReportTemplate)
def report_template_created(sender, instance, created, **kwargs):
    """Handle report template creation"""
    if created:
        # Log the creation
        ReportAccessLog.objects.create(
            report_template=instance,
            user=instance.created_by,
            action='created',
            details=f'Report template "{instance.name}" created'
        )


@receiver(post_save, sender=ScheduledReport)
def scheduled_report_created(sender, instance, created, **kwargs):
    """Handle scheduled report creation"""
    if created:
        # Send notification to creator
        if instance.created_by.email:
            send_mail(
                subject=f'Scheduled Report Created: {instance.name}',
                message=f'Your scheduled report "{instance.name}" has been created successfully.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[instance.created_by.email],
                fail_silently=True
            )


@receiver(post_save, sender=GeneratedReport)
def generated_report_created(sender, instance, created, **kwargs):
    """Handle generated report creation"""
    if created:
        # Log the generation
        ReportAccessLog.objects.create(
            report_template=instance.template,
            user=instance.generated_by,
            action='generated',
            details=f'Report "{instance.template.name}" generated'
        )
        
        # Send notification if scheduled
        if instance.scheduled_report and instance.scheduled_report.created_by.email:
            send_mail(
                subject=f'Report Generated: {instance.template.name}',
                message=f'Your scheduled report "{instance.template.name}" has been generated successfully.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[instance.scheduled_report.created_by.email],
                fail_silently=True
            )


@receiver(post_save, sender=ReportExport)
def report_export_created(sender, instance, created, **kwargs):
    """Handle report export creation"""
    if created:
        # Log the export
        ReportAccessLog.objects.create(
            report_template=instance.report.template,
            user=instance.exported_by,
            action='exported',
            details=f'Report exported in {instance.format} format'
        )


@receiver(post_save, sender=ReportComment)
def report_comment_created(sender, instance, created, **kwargs):
    """Handle report comment creation"""
    if created:
        # Notify report owner about new comment
        report_owner = instance.report.template.created_by
        if report_owner.email and report_owner != instance.commented_by:
            send_mail(
                subject=f'New Comment on Report: {instance.report.template.name}',
                message=f'You have a new comment on your report "{instance.report.template.name}".',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[report_owner.email],
                fail_silently=True
            )


@receiver(post_delete, sender=ReportTemplate)
def report_template_deleted(sender, instance, **kwargs):
    """Handle report template deletion"""
    # Clean up related files if they exist
    if instance.template_file:
        try:
            instance.template_file.delete(save=False)
        except:
            pass


@receiver(post_delete, sender=GeneratedReport)
def generated_report_deleted(sender, instance, **kwargs):
    """Handle generated report deletion"""
    # Clean up report file if it exists
    if instance.report_file:
        try:
            instance.report_file.delete(save=False)
        except:
            pass


@receiver(post_delete, sender=ReportExport)
def report_export_deleted(sender, instance, **kwargs):
    """Handle report export deletion"""
    # Clean up export file if it exists
    if instance.export_file:
        try:
            instance.export_file.delete(save=False)
        except:
            pass


def cleanup_old_reports():
    """Clean up old generated reports and exports"""
    from django.utils import timezone
    from datetime import timedelta
    
    # Delete reports older than 90 days
    cutoff_date = timezone.now() - timedelta(days=90)
    GeneratedReport.objects.filter(created_at__lt=cutoff_date).delete()
    
    # Delete exports older than 30 days
    cutoff_date = timezone.now() - timedelta(days=30)
    ReportExport.objects.filter(created_at__lt=cutoff_date).delete()


def generate_scheduled_reports():
    """Generate scheduled reports that are due"""
    from django.utils import timezone
    
    now = timezone.now()
    due_reports = ScheduledReport.objects.filter(
        is_active=True,
        next_run__lte=now
    )
    
    for scheduled_report in due_reports:
        try:
            # Generate the report
            generated_report = GeneratedReport.objects.create(
                template=scheduled_report.template,
                scheduled_report=scheduled_report,
                generated_by=scheduled_report.created_by,
                parameters=scheduled_report.parameters,
                status='completed'
            )
            
            # Update next run time
            if scheduled_report.frequency == 'daily':
                scheduled_report.next_run = now + timedelta(days=1)
            elif scheduled_report.frequency == 'weekly':
                scheduled_report.next_run = now + timedelta(weeks=1)
            elif scheduled_report.frequency == 'monthly':
                scheduled_report.next_run = now + timedelta(days=30)
            
            scheduled_report.save()
            
        except Exception as e:
            # Log the error
            ReportAccessLog.objects.create(
                report_template=scheduled_report.template,
                user=scheduled_report.created_by,
                action='error',
                details=f'Failed to generate scheduled report: {str(e)}'
            )
