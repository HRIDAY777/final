from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import Invoice, Payment, Transaction, Subscription, Fee
from datetime import timedelta


@receiver(post_save, sender=Payment)
def create_transaction_on_payment(sender, instance, created, **kwargs):
    """Create transaction when payment is completed"""
    if created and instance.status == 'completed':
        Transaction.objects.create(
            tenant=instance.invoice.tenant,
            transaction_type='income',
            amount=instance.amount,
            description=f"Payment for invoice {instance.invoice.invoice_number}",
            reference=instance.payment_id,
            payment=instance,
            invoice=instance.invoice,
            created_by=instance.processed_by or instance.paid_by
        )


@receiver(post_save, sender=Invoice)
def update_invoice_status_on_payment(sender, instance, **kwargs):
    """Update invoice status based on payment status"""
    if instance.status in ['sent', 'partially_paid']:
        total_paid = instance.get_paid_amount()
        if total_paid >= instance.total_amount:
            instance.mark_as_paid()
        elif total_paid > 0:
            instance.status = 'partially_paid'
            instance.save(update_fields=['status'])


@receiver(post_save, sender=Invoice)
def send_invoice_notification(sender, instance, created, **kwargs):
    """Send email notification when invoice is created"""
    if created and settings.EMAIL_HOST:
        try:
            subject = f"New Invoice - {instance.invoice_number}"
            message = f"""
            Dear {instance.tenant.name},
            
            A new invoice has been generated for your account:
            Invoice Number: {instance.invoice_number}
            Amount: ${instance.total_amount}
            Due Date: {instance.due_date.strftime('%Y-%m-%d')}
            
            Please make the payment before the due date to avoid late fees.
            
            Best regards,
            EduCore Ultra Billing Team
            """
            
            # Send to tenant admin email
            if hasattr(instance.tenant, 'admin_email') and instance.tenant.admin_email:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.tenant.admin_email],
                    fail_silently=True
                )
        except Exception as e:
            # Log error but don't fail the transaction
            print(f"Failed to send invoice notification: {e}")


@receiver(post_save, sender=Payment)
def send_payment_confirmation(sender, instance, created, **kwargs):
    """Send email confirmation when payment is completed"""
    if created and instance.status == 'completed' and settings.EMAIL_HOST:
        try:
            subject = f"Payment Confirmation - {instance.payment_id}"
            message = f"""
            Dear {instance.paid_by.get_full_name() if instance.paid_by else 'Customer'},
            
            Your payment has been successfully processed:
            Payment ID: {instance.payment_id}
            Amount: ${instance.amount}
            Method: {instance.get_payment_method_display()}
            Date: {instance.payment_date.strftime('%Y-%m-%d %H:%M')}
            Invoice: {instance.invoice.invoice_number}
            
            Thank you for your payment!
            
            Best regards,
            EduCore Ultra Billing Team
            """
            
            if instance.paid_by and instance.paid_by.email:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.paid_by.email],
                    fail_silently=True
                )
        except Exception as e:
            print(f"Failed to send payment confirmation: {e}")


@receiver(post_save, sender=Subscription)
def send_subscription_notification(sender, instance, created, **kwargs):
    """Send email notification for subscription changes"""
    if created and settings.EMAIL_HOST:
        try:
            subject = f"Subscription {instance.get_status_display()} - {instance.plan.name}"
            message = f"""
            Dear {instance.tenant.name},
            
            Your subscription has been {instance.get_status_display().lower()}:
            Plan: {instance.plan.name}
            Start Date: {instance.start_date.strftime('%Y-%m-%d')}
            End Date: {instance.end_date.strftime('%Y-%m-%d')}
            Amount: ${instance.plan.price}/{instance.plan.billing_cycle}
            
            Thank you for choosing EduCore Ultra!
            
            Best regards,
            EduCore Ultra Team
            """
            
            if hasattr(instance.tenant, 'admin_email') and instance.tenant.admin_email:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.tenant.admin_email],
                    fail_silently=True
                )
        except Exception as e:
            print(f"Failed to send subscription notification: {e}")


@receiver(post_save, sender=Invoice)
def check_overdue_invoices(sender, instance, **kwargs):
    """Check and update overdue invoices"""
    if instance.status in ['sent', 'partially_paid'] and instance.is_overdue:
        instance.status = 'overdue'
        instance.save(update_fields=['status'])


@receiver(post_save, sender=Subscription)
def check_expiring_subscriptions(sender, instance, **kwargs):
    """Check and update expiring subscriptions"""
    if instance.status == 'active' and instance.end_date <= timezone.now():
        instance.status = 'expired'
        instance.save(update_fields=['status'])


# Automatic invoice generation for recurring fees
def generate_recurring_invoices():
    """Generate invoices for recurring fees"""
    from apps.students.models import Student
    
    recurring_fees = Fee.objects.filter(is_recurring=True, is_active=True)
    
    for fee in recurring_fees:
        # Get all active tenants
        from apps.tenants.models import Tenant
        tenants = Tenant.objects.filter(is_active=True)
        
        for tenant in tenants:
            # Check if invoice already exists for this month
            current_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            existing_invoice = Invoice.objects.filter(
                tenant=tenant,
                items__fee=fee,
                issue_date__gte=current_month
            ).first()
            
            if not existing_invoice:
                # Create invoice for recurring fee
                invoice = Invoice.objects.create(
                    tenant=tenant,
                    due_date=timezone.now() + timedelta(days=30),
                    subtotal=fee.amount,
                    total_amount=fee.amount
                )
                
                # Create invoice item
                from .models import InvoiceItem
                InvoiceItem.objects.create(
                    invoice=invoice,
                    fee=fee,
                    description=fee.name,
                    quantity=1,
                    unit_price=fee.amount,
                    total_price=fee.amount
                )


# This function can be called by a Celery task or management command
def send_payment_reminders():
    """Send payment reminders for overdue invoices"""
    overdue_invoices = Invoice.objects.filter(
        status='overdue',
        due_date__lte=timezone.now()
    )
    
    for invoice in overdue_invoices:
        if settings.EMAIL_HOST:
            try:
                subject = f"Payment Reminder - Invoice {invoice.invoice_number}"
                message = f"""
                Dear {invoice.tenant.name},
                
                This is a reminder that your invoice is overdue:
                Invoice Number: {invoice.invoice_number}
                Amount: ${invoice.total_amount}
                Due Date: {invoice.due_date.strftime('%Y-%m-%d')}
                Days Overdue: {invoice.days_overdue}
                
                Please make the payment as soon as possible to avoid additional late fees.
                
                Best regards,
                EduCore Ultra Billing Team
                """
                
                if hasattr(invoice.tenant, 'admin_email') and invoice.tenant.admin_email:
                    send_mail(
                        subject=subject,
                        message=message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[invoice.tenant.admin_email],
                        fail_silently=True
                    )
            except Exception as e:
                print(f"Failed to send payment reminder: {e}")
