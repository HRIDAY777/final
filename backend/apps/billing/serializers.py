from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import (
    Plan, Subscription, Fee, Invoice, InvoiceItem, Payment, Transaction, BillingSettings
)


class PlanSerializer(serializers.ModelSerializer):
    yearly_price = serializers.ReadOnlyField()

    class Meta:
        model = Plan
        fields = [
            'id', 'name', 'plan_type', 'description', 'price', 'billing_cycle',
            'max_students', 'max_teachers', 'max_storage_gb', 'features',
            'is_active', 'yearly_price', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)
    plan_id = serializers.IntegerField(write_only=True)
    tenant = serializers.StringRelatedField(read_only=True)
    tenant_id = serializers.IntegerField(write_only=True)
    is_active = serializers.ReadOnlyField()
    days_remaining = serializers.ReadOnlyField()

    class Meta:
        model = Subscription
        fields = [
            'id', 'tenant', 'tenant_id', 'plan', 'plan_id', 'status',
            'start_date', 'end_date', 'auto_renew', 'cancelled_at',
            'cancelled_by', 'notes', 'is_active', 'days_remaining',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'cancelled_at', 'cancelled_by', 'created_at', 'updated_at',
            'is_active', 'days_remaining'
        ]

    def validate(self, data):
        if 'end_date' in data and 'start_date' in data:
            if data['end_date'] <= data['start_date']:
                raise ValidationError("End date must be after start date")
        return data


class FeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fee
        fields = [
            'id', 'name', 'fee_type', 'amount', 'description', 'is_recurring',
            'recurring_frequency', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InvoiceItemSerializer(serializers.ModelSerializer):
    fee = FeeSerializer(read_only=True)
    fee_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = InvoiceItem
        fields = [
            'id', 'invoice', 'fee', 'fee_id', 'description', 'quantity',
            'unit_price', 'total_price', 'created_at'
        ]
        read_only_fields = ['id', 'total_price', 'created_at']


class InvoiceSerializer(serializers.ModelSerializer):
    tenant = serializers.StringRelatedField(read_only=True)
    tenant_id = serializers.IntegerField(write_only=True)
    student = serializers.StringRelatedField(read_only=True)
    student_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    subscription = SubscriptionSerializer(read_only=True)
    subscription_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    items = InvoiceItemSerializer(many=True, read_only=True)
    is_overdue = serializers.ReadOnlyField()
    days_overdue = serializers.ReadOnlyField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'tenant', 'tenant_id', 'student', 'student_id',
            'subscription', 'subscription_id', 'status', 'issue_date', 'due_date',
            'paid_date', 'subtotal', 'tax_amount', 'discount_amount', 'total_amount',
            'notes', 'items', 'is_overdue', 'days_overdue', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'invoice_number', 'issue_date', 'paid_date', 'created_at', 'updated_at',
            'is_overdue', 'days_overdue'
        ]

    def validate(self, data):
        if 'due_date' in data:
            if data['due_date'] <= timezone.now():
                raise ValidationError("Due date must be in the future")
        return data


class InvoiceListSerializer(serializers.ModelSerializer):
    tenant = serializers.StringRelatedField()
    student = serializers.StringRelatedField()
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'tenant', 'student', 'status', 'total_amount',
            'issue_date', 'due_date', 'is_overdue', 'created_at'
        ]


class PaymentSerializer(serializers.ModelSerializer):
    invoice = InvoiceSerializer(read_only=True)
    invoice_id = serializers.IntegerField(write_only=True)
    paid_by = serializers.StringRelatedField(read_only=True)
    paid_by_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    processed_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'payment_id', 'invoice', 'invoice_id', 'amount', 'payment_method',
            'status', 'transaction_id', 'gateway_response', 'paid_by', 'paid_by_id',
            'processed_by', 'payment_date', 'processed_date', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'payment_id', 'processed_by', 'payment_date', 'processed_date',
            'created_at', 'updated_at'
        ]


class PaymentListSerializer(serializers.ModelSerializer):
    invoice = serializers.StringRelatedField()
    paid_by = serializers.StringRelatedField()
    processed_by = serializers.StringRelatedField()

    class Meta:
        model = Payment
        fields = [
            'id', 'payment_id', 'invoice', 'amount', 'payment_method', 'status',
            'paid_by', 'processed_by', 'payment_date', 'created_at'
        ]


class TransactionSerializer(serializers.ModelSerializer):
    tenant = serializers.StringRelatedField(read_only=True)
    tenant_id = serializers.IntegerField(write_only=True)
    payment = PaymentSerializer(read_only=True)
    payment_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    invoice = InvoiceSerializer(read_only=True)
    invoice_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_id', 'tenant', 'tenant_id', 'transaction_type',
            'amount', 'description', 'reference', 'payment', 'payment_id',
            'invoice', 'invoice_id', 'created_by', 'transaction_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'transaction_id', 'created_by', 'transaction_date',
            'created_at', 'updated_at'
        ]


class TransactionListSerializer(serializers.ModelSerializer):
    tenant = serializers.StringRelatedField()
    created_by = serializers.StringRelatedField()

    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_id', 'tenant', 'transaction_type', 'amount',
            'description', 'reference', 'created_by', 'transaction_date'
        ]


class BillingSettingsSerializer(serializers.ModelSerializer):
    tenant = serializers.StringRelatedField(read_only=True)
    tenant_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = BillingSettings
        fields = [
            'id', 'tenant', 'tenant_id', 'currency', 'tax_rate', 'late_fee_rate',
            'grace_period_days', 'auto_generate_invoices', 'send_payment_reminders',
            'reminder_days_before', 'payment_gateway_enabled', 'payment_gateway_config',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# Dashboard and Analytics Serializers
class BillingDashboardSerializer(serializers.Serializer):
    total_invoices = serializers.IntegerField()
    total_payments = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_invoices = serializers.IntegerField()
    overdue_invoices = serializers.IntegerField()
    pending_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    overdue_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    active_subscriptions = serializers.IntegerField()
    expiring_subscriptions = serializers.IntegerField()


class InvoiceAnalyticsSerializer(serializers.Serializer):
    invoice = InvoiceSerializer()
    payment_count = serializers.IntegerField()
    total_paid = serializers.DecimalField(max_digits=10, decimal_places=2)
    days_outstanding = serializers.IntegerField()


class PaymentAnalyticsSerializer(serializers.Serializer):
    payment_method = serializers.CharField()
    count = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    percentage = serializers.DecimalField(max_digits=5, decimal_places=2)


class RevenueAnalyticsSerializer(serializers.Serializer):
    period = serializers.CharField()
    revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    invoice_count = serializers.IntegerField()
    payment_count = serializers.IntegerField()


# Action Serializers
class CreateInvoiceSerializer(serializers.Serializer):
    tenant_id = serializers.IntegerField()
    student_id = serializers.IntegerField(required=False, allow_null=True)
    subscription_id = serializers.IntegerField(required=False, allow_null=True)
    due_date = serializers.DateTimeField()
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_items(self, value):
        for item in value:
            if 'fee_id' not in item or 'quantity' not in item:
                raise ValidationError("Each item must have fee_id and quantity")
            if item['quantity'] <= 0:
                raise ValidationError("Quantity must be greater than 0")
        return value


class ProcessPaymentSerializer(serializers.Serializer):
    invoice_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_method = serializers.CharField(max_length=20)
    transaction_id = serializers.CharField(max_length=100, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_amount(self, value):
        if value <= 0:
            raise ValidationError("Amount must be greater than 0")
        return value


class CancelSubscriptionSerializer(serializers.Serializer):
    subscription_id = serializers.IntegerField()
    reason = serializers.CharField(max_length=500, required=False, allow_blank=True)


class GenerateInvoiceSerializer(serializers.Serializer):
    tenant_id = serializers.IntegerField()
    fee_type = serializers.CharField(max_length=20, required=False)
    due_date = serializers.DateTimeField()
    include_recurring = serializers.BooleanField(default=True)


class SendPaymentReminderSerializer(serializers.Serializer):
    invoice_id = serializers.IntegerField()
    reminder_type = serializers.ChoiceField(choices=['email', 'sms', 'both'])
    custom_message = serializers.CharField(required=False, allow_blank=True)
