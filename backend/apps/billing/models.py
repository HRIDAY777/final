from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
import uuid

User = get_user_model()


class Plan(models.Model):
    """Subscription plan model"""
    PLAN_TYPES = [
        ('basic', _('Basic')),
        ('standard', _('Standard')),
        ('premium', _('Premium')),
        ('enterprise', _('Enterprise')),
    ]

    BILLING_CYCLES = [
        ('monthly', _('Monthly')),
        ('quarterly', _('Quarterly')),
        ('yearly', _('Yearly')),
    ]

    name = models.CharField(max_length=100, unique=True)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    billing_cycle = models.CharField(
        max_length=20, choices=BILLING_CYCLES, default='monthly'
    )
    max_students = models.PositiveIntegerField(default=100)
    max_teachers = models.PositiveIntegerField(default=10)
    max_storage_gb = models.PositiveIntegerField(default=10)
    features = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Plan")
        verbose_name_plural = _("Plans")
        ordering = ['price']

    def __str__(self):
        return f"{self.name} - ${self.price}/{self.billing_cycle}"

    @property
    def yearly_price(self):
        """Calculate yearly price based on billing cycle"""
        if self.billing_cycle == 'yearly':
            return self.price
        elif self.billing_cycle == 'quarterly':
            return self.price * 4
        elif self.billing_cycle == 'monthly':
            return self.price * 12
        return self.price


class Subscription(models.Model):
    """Subscription model"""
    STATUS_CHOICES = [
        ('active', _('Active')),
        ('cancelled', _('Cancelled')),
        ('expired', _('Expired')),
        ('suspended', _('Suspended')),
        ('pending', _('Pending')),
    ]

    tenant = models.ForeignKey(
        'tenants.Tenant', on_delete=models.CASCADE,
        related_name='billing_subscriptions'
    )
    plan = models.ForeignKey(
        Plan, on_delete=models.CASCADE, related_name='subscriptions'
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending'
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    auto_renew = models.BooleanField(default=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='cancelled_subscriptions'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Subscription")
        verbose_name_plural = _("Subscriptions")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.tenant.name} - {self.plan.name}"

    def clean(self):
        if self.end_date <= self.start_date:
            raise ValidationError(_("End date must be after start date"))

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    @property
    def is_active(self):
        return self.status == 'active' and timezone.now() <= self.end_date

    @property
    def days_remaining(self):
        if self.is_active:
            return (self.end_date - timezone.now()).days
        return 0

    def cancel(self, cancelled_by=None, reason=""):
        """Cancel the subscription"""
        self.status = 'cancelled'
        self.cancelled_at = timezone.now()
        self.cancelled_by = cancelled_by
        self.notes = reason
        self.save()


class Fee(models.Model):
    """Fee model for different types of fees"""
    FEE_TYPES = [
        ('tuition', _('Tuition Fee')),
        ('library', _('Library Fee')),
        ('transport', _('Transport Fee')),
        ('meal', _('Meal Fee')),
        ('uniform', _('Uniform Fee')),
        ('exam', _('Exam Fee')),
        ('other', _('Other Fee')),
    ]

    name = models.CharField(max_length=100)
    fee_type = models.CharField(max_length=20, choices=FEE_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    is_recurring = models.BooleanField(default=False)
    recurring_frequency = models.CharField(
        max_length=20, blank=True, help_text="monthly, quarterly, yearly"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Fee")
        verbose_name_plural = _("Fees")
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - ${self.amount}"


class Invoice(models.Model):
    """Invoice model"""
    STATUS_CHOICES = [
        ('draft', _('Draft')),
        ('sent', _('Sent')),
        ('paid', _('Paid')),
        ('overdue', _('Overdue')),
        ('cancelled', _('Cancelled')),
        ('partially_paid', _('Partially Paid')),
    ]

    invoice_number = models.CharField(max_length=50, unique=True)
    tenant = models.ForeignKey(
        'tenants.Tenant', on_delete=models.CASCADE, related_name='invoices'
    )
    student = models.ForeignKey(
        'students.Student', on_delete=models.CASCADE, related_name='invoices',
        null=True, blank=True
    )
    subscription = models.ForeignKey(
        Subscription, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='invoices'
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='draft'
    )
    issue_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    paid_date = models.DateTimeField(null=True, blank=True)
    subtotal = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    tax_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    discount_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    total_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Invoice")
        verbose_name_plural = _("Invoices")
        ordering = ['-issue_date']

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.tenant.name}"

    def clean(self):
        if self.due_date <= self.issue_date:
            raise ValidationError(_("Due date must be after issue date"))

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = self.generate_invoice_number()
        self.clean()
        super().save(*args, **kwargs)

    def generate_invoice_number(self):
        """Generate unique invoice number"""
        return (
            f"INV-{timezone.now().strftime('%Y%m')}-"
            f"{uuid.uuid4().hex[:8].upper()}"
        )

    def calculate_total(self):
        """Calculate total amount"""
        self.total_amount = (
            self.subtotal + self.tax_amount - self.discount_amount
        )
        return self.total_amount

    def get_paid_amount(self):
        """Get total paid amount"""
        return self.payments.filter(status='completed').aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')

    @property
    def is_overdue(self):
        return (
            self.status in ['sent', 'partially_paid'] and
            timezone.now() > self.due_date
        )

    @property
    def days_overdue(self):
        if self.is_overdue:
            return (timezone.now() - self.due_date).days
        return 0

    def mark_as_paid(self):
        """Mark invoice as paid"""
        self.status = 'paid'
        self.paid_date = timezone.now()
        self.save()


class InvoiceItem(models.Model):
    """Invoice item model"""
    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE, related_name='items'
    )
    fee = models.ForeignKey(
        Fee, on_delete=models.CASCADE, related_name='invoice_items'
    )
    description = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Invoice Item")
        verbose_name_plural = _("Invoice Items")

    def __str__(self):
        return f"{self.description} - {self.invoice.invoice_number}"

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class Payment(models.Model):
    """Payment model"""
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('processing', _('Processing')),
        ('completed', _('Completed')),
        ('failed', _('Failed')),
        ('cancelled', _('Cancelled')),
        ('refunded', _('Refunded')),
    ]

    PAYMENT_METHODS = [
        ('cash', _('Cash')),
        ('check', _('Check')),
        ('bank_transfer', _('Bank Transfer')),
        ('credit_card', _('Credit Card')),
        ('debit_card', _('Debit Card')),
        ('paypal', _('PayPal')),
        ('stripe', _('Stripe')),
        ('razorpay', _('Razorpay')),
        ('other', _('Other')),
    ]

    payment_id = models.CharField(max_length=100, unique=True)
    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE, related_name='payments'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending'
    )
    transaction_id = models.CharField(max_length=100, blank=True)
    gateway_response = models.JSONField(
        default=dict, blank=True
    )
    paid_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='payments_made'
    )
    processed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='payments_processed'
    )
    payment_date = models.DateTimeField(auto_now_add=True)
    processed_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Payment")
        verbose_name_plural = _("Payments")
        ordering = ['-payment_date']

    def __str__(self):
        return f"Payment {self.payment_id} - ${self.amount}"

    def save(self, *args, **kwargs):
        if not self.payment_id:
            self.payment_id = self.generate_payment_id()
        super().save(*args, **kwargs)

    def generate_payment_id(self):
        """Generate unique payment ID"""
        return (
            f"PAY-{timezone.now().strftime('%Y%m%d')}-"
            f"{uuid.uuid4().hex[:8].upper()}"
        )

    def mark_as_completed(self, processed_by=None):
        """Mark payment as completed"""
        self.status = 'completed'
        self.processed_by = processed_by
        self.processed_date = timezone.now()
        self.save()

        # Update invoice status if fully paid
        total_paid = self.invoice.get_paid_amount()
        if total_paid >= self.invoice.total_amount:
            self.invoice.mark_as_paid()


class Transaction(models.Model):
    """Transaction model for financial tracking"""
    TRANSACTION_TYPES = [
        ('income', _('Income')),
        ('expense', _('Expense')),
        ('refund', _('Refund')),
        ('adjustment', _('Adjustment')),
    ]

    transaction_id = models.CharField(max_length=100, unique=True)
    tenant = models.ForeignKey(
        'tenants.Tenant', on_delete=models.CASCADE,
        related_name='transactions'
    )
    transaction_type = models.CharField(
        max_length=20, choices=TRANSACTION_TYPES
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=200)
    reference = models.CharField(max_length=100, blank=True)
    payment = models.ForeignKey(
        Payment, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='transactions'
    )
    invoice = models.ForeignKey(
        Invoice, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='transactions'
    )
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='transactions_created'
    )
    transaction_date = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Transaction")
        verbose_name_plural = _("Transactions")
        ordering = ['-transaction_date']

    def __str__(self):
        return (
            f"{self.transaction_type.title()} - ${self.amount} - "
            f"{self.description}"
        )

    def save(self, *args, **kwargs):
        if not self.transaction_id:
            self.transaction_id = self.generate_transaction_id()
        super().save(*args, **kwargs)

    def generate_transaction_id(self):
        """Generate unique transaction ID"""
        return (
            f"TXN-{timezone.now().strftime('%Y%m%d')}-"
            f"{uuid.uuid4().hex[:8].upper()}"
        )


class BillingSettings(models.Model):
    """Billing settings model"""
    tenant = models.OneToOneField(
        'tenants.Tenant', on_delete=models.CASCADE,
        related_name='billing_settings'
    )
    currency = models.CharField(max_length=3, default='USD')
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    late_fee_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default=5.00
    )
    grace_period_days = models.PositiveIntegerField(default=7)
    auto_generate_invoices = models.BooleanField(default=True)
    send_payment_reminders = models.BooleanField(default=True)
    reminder_days_before = models.PositiveIntegerField(default=3)
    payment_gateway_enabled = models.BooleanField(default=False)
    payment_gateway_config = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Billing Setting")
        verbose_name_plural = _("Billing Settings")

    def __str__(self):
        return f"Billing Settings - {self.tenant.name}"
