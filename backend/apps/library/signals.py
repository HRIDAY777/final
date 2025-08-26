from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import Borrowing, Fine, Reservation, Book


@receiver(post_save, sender=Borrowing)
def create_fine_on_overdue(sender, instance, created, **kwargs):
    """Create fine when borrowing becomes overdue"""
    if not created and instance.status == 'overdue':
        # Check if fine already exists
        if not hasattr(instance, 'fine'):
            Fine.objects.create(
                borrowing=instance,
                daily_rate=1.00  # Default rate, can be made configurable
            )


@receiver(post_save, sender=Borrowing)
def update_book_availability(sender, instance, created, **kwargs):
    """Update book availability when borrowing status changes"""
    if created:
        # New borrowing - decrease available copies
        book = instance.book
        book.available_copies -= 1
        if book.available_copies == 0:
            book.status = 'borrowed'
        book.save()
    elif instance.status == 'returned':
        # Book returned - increase available copies
        book = instance.book
        book.available_copies += 1
        if book.status == 'borrowed':
            book.status = 'available'
        book.save()


@receiver(post_save, sender=Reservation)
def check_reservation_expiry(sender, instance, created, **kwargs):
    """Check if reservation has expired"""
    if not created and instance.status == 'pending':
        if timezone.now() > instance.expiry_date:
            instance.status = 'expired'
            instance.save()


@receiver(post_save, sender=Fine)
def send_fine_notification(sender, instance, created, **kwargs):
    """Send email notification when fine is created"""
    if created and settings.EMAIL_HOST:
        try:
            subject = f"Fine Notice - {instance.borrowing.book.title}"
            message = f"""
            Dear {instance.borrowing.borrower.get_full_name()},
            
            A fine has been applied to your account for the overdue book:
            Book: {instance.borrowing.book.title}
            Amount: ${instance.amount}
            Due Date: {instance.borrowing.due_date.strftime('%Y-%m-%d')}
            
            Please return the book and pay the fine as soon as possible.
            
            Best regards,
            Library Management System
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[instance.borrowing.borrower.email],
                fail_silently=True
            )
        except Exception as e:
            # Log error but don't fail the transaction
            print(f"Failed to send fine notification: {e}")


@receiver(post_save, sender=Book)
def update_book_status(sender, instance, **kwargs):
    """Update book status based on availability"""
    if instance.available_copies == 0 and instance.status == 'available':
        instance.status = 'borrowed'
        instance.save(update_fields=['status'])
    elif instance.available_copies > 0 and instance.status == 'borrowed':
        instance.status = 'available'
        instance.save(update_fields=['status'])


@receiver(post_delete, sender=Borrowing)
def restore_book_availability_on_delete(sender, instance, **kwargs):
    """Restore book availability when borrowing is deleted"""
    if instance.status in ['borrowed', 'overdue']:
        book = instance.book
        book.available_copies += 1
        if book.status == 'borrowed':
            book.status = 'available'
        book.save()
