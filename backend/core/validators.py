"""
Custom validators for data validation.
"""
import re
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator
from django.utils.translation import gettext_lazy as _


def validate_phone_number(value):
    """Validate phone number format."""
    # Remove all non-digit characters
    digits_only = re.sub(r'\D', '', value)
    
    # Check if it's between 10-15 digits
    if not (10 <= len(digits_only) <= 15):
        raise ValidationError(
            _('Phone number must contain 10-15 digits.'),
            code='invalid_phone'
        )
    
    return value


def validate_student_id(value):
    """Validate student ID format."""
    pattern = r'^[A-Z]{2}\d{6,10}$'
    if not re.match(pattern, value):
        raise ValidationError(
            _('Student ID must be in format: XX123456 (2 letters followed by 6-10 digits)'),
            code='invalid_student_id'
        )
    
    return value


def validate_file_size(value, max_size_mb=5):
    """Validate file size."""
    max_size = max_size_mb * 1024 * 1024  # Convert to bytes
    
    if value.size > max_size:
        raise ValidationError(
            _(f'File size cannot exceed {max_size_mb}MB. Current size: {value.size / (1024 * 1024):.2f}MB'),
            code='file_too_large'
        )
    
    return value


def validate_image_file(value):
    """Validate image file type."""
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    
    if value.content_type not in allowed_types:
        raise ValidationError(
            _(f'Invalid image type. Allowed types: JPEG, PNG, GIF, WebP'),
            code='invalid_image_type'
        )
    
    # Check file size (max 5MB)
    validate_file_size(value, max_size_mb=5)
    
    return value


def validate_pdf_file(value):
    """Validate PDF file type."""
    if value.content_type != 'application/pdf':
        raise ValidationError(
            _('Invalid file type. Only PDF files are allowed.'),
            code='invalid_pdf'
        )
    
    # Check file size (max 10MB)
    validate_file_size(value, max_size_mb=10)
    
    return value


def validate_document_file(value):
    """Validate document file type."""
    allowed_types = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
    ]
    
    if value.content_type not in allowed_types:
        raise ValidationError(
            _('Invalid document type. Allowed types: PDF, Word, Excel, Text'),
            code='invalid_document'
        )
    
    # Check file size (max 10MB)
    validate_file_size(value, max_size_mb=10)
    
    return value


def validate_strong_password(value):
    """Validate password strength."""
    if len(value) < 8:
        raise ValidationError(
            _('Password must be at least 8 characters long.'),
            code='password_too_short'
        )
    
    if not re.search(r'[A-Z]', value):
        raise ValidationError(
            _('Password must contain at least one uppercase letter.'),
            code='password_no_uppercase'
        )
    
    if not re.search(r'[a-z]', value):
        raise ValidationError(
            _('Password must contain at least one lowercase letter.'),
            code='password_no_lowercase'
        )
    
    if not re.search(r'\d', value):
        raise ValidationError(
            _('Password must contain at least one digit.'),
            code='password_no_digit'
        )
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
        raise ValidationError(
            _('Password must contain at least one special character.'),
            code='password_no_special'
        )
    
    return value


def validate_username(value):
    """Validate username format."""
    pattern = r'^[a-zA-Z0-9_-]{3,30}$'
    if not re.match(pattern, value):
        raise ValidationError(
            _('Username must be 3-30 characters long and contain only letters, numbers, underscores, and hyphens.'),
            code='invalid_username'
        )
    
    return value


def validate_url_slug(value):
    """Validate URL slug format."""
    pattern = r'^[a-z0-9-]+$'
    if not re.match(pattern, value):
        raise ValidationError(
            _('Slug must contain only lowercase letters, numbers, and hyphens.'),
            code='invalid_slug'
        )
    
    return value


def validate_academic_year(value):
    """Validate academic year format."""
    pattern = r'^\d{4}-\d{4}$'
    if not re.match(pattern, value):
        raise ValidationError(
            _('Academic year must be in format: YYYY-YYYY (e.g., 2023-2024)'),
            code='invalid_academic_year'
        )
    
    # Validate year range
    start_year, end_year = value.split('-')
    if int(end_year) != int(start_year) + 1:
        raise ValidationError(
            _('Academic year end must be exactly one year after start.'),
            code='invalid_year_range'
        )
    
    return value


def validate_grade_level(value):
    """Validate grade level."""
    if not (1 <= value <= 12):
        raise ValidationError(
            _('Grade level must be between 1 and 12.'),
            code='invalid_grade_level'
        )
    
    return value


def validate_percentage(value):
    """Validate percentage value."""
    if not (0 <= value <= 100):
        raise ValidationError(
            _('Percentage must be between 0 and 100.'),
            code='invalid_percentage'
        )
    
    return value


def validate_positive_number(value):
    """Validate positive number."""
    if value < 0:
        raise ValidationError(
            _('Value must be a positive number.'),
            code='negative_value'
        )
    
    return value


def validate_future_date(value):
    """Validate that date is in the future."""
    from django.utils import timezone
    
    if value < timezone.now().date():
        raise ValidationError(
            _('Date must be in the future.'),
            code='past_date'
        )
    
    return value


def validate_past_date(value):
    """Validate that date is in the past."""
    from django.utils import timezone
    
    if value > timezone.now().date():
        raise ValidationError(
            _('Date must be in the past.'),
            code='future_date'
        )
    
    return value


def validate_time_range(start_time, end_time):
    """Validate time range."""
    if end_time <= start_time:
        raise ValidationError(
            _('End time must be after start time.'),
            code='invalid_time_range'
        )
    
    return True


def validate_date_range(start_date, end_date):
    """Validate date range."""
    if end_date < start_date:
        raise ValidationError(
            _('End date must be after start date.'),
            code='invalid_date_range'
        )
    
    return True

