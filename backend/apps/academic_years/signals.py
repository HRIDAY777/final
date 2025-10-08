from django.db.models.signals import pre_save, post_save, pre_delete
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from datetime import date

from .models import AcademicYear


@receiver(pre_save, sender=AcademicYear)
def academic_year_pre_save(sender, instance, **kwargs):
    """
    Pre-save signal for AcademicYear model.

    Handles business logic before saving academic year:
    - Ensures only one current academic year
    - Validates date ranges
    - Validates name format
    """

    # Ensure only one academic year is current
    if instance.is_current:
        # Unset all other current academic years
        AcademicYear.objects.filter(
            is_current=True
        ).exclude(id=instance.id).update(is_current=False)

    # Validate date range
    if instance.start_date and instance.end_date:
        if instance.start_date >= instance.end_date:
            raise ValidationError(_('End date must be after start date.'))

    # Validate name format (e.g., 2024-25)
    if instance.name and not _validate_name_format(instance.name):
        raise ValidationError(
            _('Name should be in format YYYY-YY (e.g., 2024-25).')
        )

    # Check for overlapping academic years
    if instance.start_date and instance.end_date:
        overlapping_years = AcademicYear.objects.filter(
            is_active=True
        ).exclude(id=instance.id).filter(
            start_date__lte=instance.end_date,
            end_date__gte=instance.start_date
        )

        if overlapping_years.exists():
            raise ValidationError(
                _('Academic year overlaps with existing active academic year.')
            )


@receiver(post_save, sender=AcademicYear)
def academic_year_post_save(sender, instance, created, **kwargs):
    """
    Post-save signal for AcademicYear model.

    Handles business logic after saving academic year:
    - Logs academic year creation/update
    - Sends notifications if needed
    - Updates related models if necessary
    """

    if created:
        # Log academic year creation
        print(f"New academic year created: {instance.name}")

        # You can add more logic here like:
        # - Send notifications to administrators
        # - Create default settings for the academic year
        # - Initialize academic year data
    else:
        # Log academic year update
        print(f"Academic year updated: {instance.name}")

        # You can add more logic here like:
        # - Send notifications about changes
        # - Update related models
        # - Sync with external systems


@receiver(pre_delete, sender=AcademicYear)
def academic_year_pre_delete(sender, instance, **kwargs):
    """
    Pre-delete signal for AcademicYear model.

    Prevents deletion of current academic year and handles cleanup.
    """

    # Prevent deletion of current academic year
    if instance.is_current:
        raise ValidationError(
            _('Cannot delete the current academic year.')
        )

    # Check if academic year has related data
    # You can add checks here for related models like:
    # - Students enrolled in this academic year
    # - Classes created for this academic year
    # - Assignments/exams scheduled for this academic year

    # Example check (uncomment and modify based on your models):
    # if instance.students.exists():
    #     raise ValidationError(
    #         _('Cannot delete academic year with enrolled students.')
    #     )

    # Log academic year deletion
    print(f"Academic year being deleted: {instance.name}")


def _validate_name_format(name):
    """
    Validate academic year name format.

    Expected format: YYYY-YY (e.g., 2024-25)
    """
    import re

    # Check basic format
    pattern = r'^\d{4}-\d{2}$'
    if not re.match(pattern, name):
        return False

    # Check if the years are consecutive
    try:
        start_year = int(name[:4])
        end_year = int('20' + name[5:])
        return end_year == start_year + 1
    except (ValueError, IndexError):
        return False


# Additional utility functions for academic year management

def get_current_academic_year():
    """
    Get the current academic year.

    Returns:
        AcademicYear: The current academic year or None if not found
    """
    try:
        return AcademicYear.objects.get(
            is_current=True, is_active=True
        )
    except AcademicYear.DoesNotExist:
        return None


def get_academic_year_by_date(target_date=None):
    """
    Get academic year for a specific date.

    Args:
        target_date (date): The date to find academic year for.
            Defaults to today.

    Returns:
        AcademicYear: The academic year for the given date or None if not found
    """
    if target_date is None:
        target_date = date.today()

    try:
        return AcademicYear.objects.get(
            start_date__lte=target_date,
            end_date__gte=target_date,
            is_active=True
        )
    except AcademicYear.DoesNotExist:
        return None


def get_upcoming_academic_years():
    """
    Get all upcoming academic years.

    Returns:
        QuerySet: Academic years that start in the future
    """
    return AcademicYear.objects.filter(
        start_date__gt=date.today(),
        is_active=True
    ).order_by('start_date')


def get_past_academic_years():
    """
    Get all past academic years.

    Returns:
        QuerySet: Academic years that have ended
    """
    return AcademicYear.objects.filter(
        end_date__lt=date.today(),
        is_active=True
    ).order_by('-end_date')
