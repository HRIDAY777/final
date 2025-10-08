from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Plan, Subscription, Fee, Invoice, InvoiceItem, Payment, Transaction,
    BillingSettings
)


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'plan_type', 'price', 'billing_cycle', 'yearly_price_display',
        'max_students', 'max_teachers', 'is_active', 'created_at'
    ]
    list_filter = ['plan_type', 'billing_cycle', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['price']
    readonly_fields = ['created_at', 'updated_at']

    def yearly_price_display(self, obj):
        return f"${obj.yearly_price}"
    yearly_price_display.short_description = 'Yearly Price'


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = [
        'tenant', 'plan', 'status_display', 'start_date', 'end_date',
        'is_active', 'days_remaining', 'auto_renew', 'created_at'
    ]
    list_filter = ['status', 'plan', 'auto_renew', 'start_date', 'end_date']
    search_fields = ['tenant__name', 'plan__name', 'notes']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'days_remaining']
    date_hierarchy = 'start_date'

    def status_display(self, obj):
        colors = {
            'active': 'green',
            'cancelled': 'red',
            'expired': 'orange',
            'suspended': 'yellow',
            'pending': 'blue'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'black'),
            obj.get_status_display()
        )
    status_display.short_description = 'Status'

    def is_active(self, obj):
        if obj.is_active:
            return format_html('<span style="color: green;">✓</span>')
        return format_html('<span style="color: red;">✗</span>')
    is_active.short_description = 'Active'

    actions = ['cancel_subscriptions', 'activate_subscriptions']

    def cancel_subscriptions(self, request, queryset):
        for subscription in queryset.filter(status='active'):
            subscription.cancel(request.user, "Cancelled by admin")
        self.message_user(
            request, f"Cancelled {queryset.count()} subscriptions"
        )
    cancel_subscriptions.short_description = "Cancel selected subscriptions"

    def activate_subscriptions(self, request, queryset):
        queryset.filter(status='pending').update(status='active')
        self.message_user(
            request, f"Activated {queryset.count()} subscriptions"
        )
    activate_subscriptions.short_description = "Activate"


@admin.register(Fee)
class FeeAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'fee_type', 'amount', 'is_recurring', 'recurring_frequency',
        'is_active', 'created_at'
    ]
    list_filter = ['fee_type', 'is_recurring', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = [
        'invoice_number', 'tenant', 'student', 'status_display',
        'total_amount',
        'is_overdue', 'days_overdue', 'issue_date', 'due_date'
    ]
    list_filter = [
        'status', 'issue_date', 'due_date', 'paid_date', 'tenant'
    ]
    search_fields = [
        'invoice_number', 'tenant__name', 'student__first_name',
        'student__last_name'
    ]
    ordering = ['-issue_date']
    readonly_fields = [
        'invoice_number', 'issue_date', 'created_at', 'updated_at',
        'is_overdue', 'days_overdue'
    ]
    date_hierarchy = 'issue_date'

    fieldsets = (
        ('Basic Information', {
            'fields': ('invoice_number', 'tenant', 'student', 'subscription')
        }),
        ('Amounts', {
            'fields': (
                'subtotal', 'tax_amount', 'discount_amount', 'total_amount'
            )
        }),
        ('Dates', {
            'fields': ('issue_date', 'due_date', 'paid_date')
        }),
        ('Status', {
            'fields': ('status', 'notes')
        }),
        ('Metadata', {
            'fields': (
                'created_at', 'updated_at', 'is_overdue', 'days_overdue'
            ),
            'classes': ('collapse',)
        }),
    )

    def status_display(self, obj):
        colors = {
            'draft': 'gray',
            'sent': 'blue',
            'paid': 'green',
            'overdue': 'red',
            'cancelled': 'black',
            'partially_paid': 'orange'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'black'),
            obj.get_status_display()
        )
    status_display.short_description = 'Status'

    def is_overdue(self, obj):
        if obj.is_overdue:
            return format_html(
                '<span style="color: red; font-weight: bold;">'
                '{} days overdue</span>',
                obj.days_overdue
            )
        return format_html('<span style="color: green;">On time</span>')
    is_overdue.short_description = 'Overdue Status'

    actions = ['mark_as_paid', 'mark_as_sent', 'mark_as_overdue']

    def mark_as_paid(self, request, queryset):
        for invoice in queryset:
            invoice.mark_as_paid()
        self.message_user(
            request, f"Marked {queryset.count()} invoices as paid"
        )
    mark_as_paid.short_description = "Mark selected invoices as paid"

    def mark_as_sent(self, request, queryset):
        queryset.filter(status='draft').update(status='sent')
        self.message_user(
            request, f"Marked {queryset.count()} invoices as sent"
        )
    mark_as_sent.short_description = "Mark selected invoices as sent"

    def mark_as_overdue(self, request, queryset):
        queryset.filter(status='sent').update(status='overdue')
        self.message_user(
            request, f"Marked {queryset.count()} invoices as overdue"
        )
    mark_as_overdue.short_description = "Mark selected invoices as overdue"


@admin.register(InvoiceItem)
class InvoiceItemAdmin(admin.ModelAdmin):
    list_display = [
        'invoice', 'fee', 'description', 'quantity', 'unit_price',
        'total_price', 'created_at'
    ]
    list_filter = ['fee__fee_type', 'created_at']
    search_fields = ['description', 'invoice__invoice_number']
    ordering = ['-created_at']
    readonly_fields = ['created_at']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'payment_id', 'invoice', 'amount', 'payment_method', 'status_display',
        'paid_by', 'processed_by', 'payment_date', 'processed_date'
    ]
    list_filter = [
        'status', 'payment_method', 'payment_date', 'processed_date'
    ]
    search_fields = [
        'payment_id', 'invoice__invoice_number', 'transaction_id',
        'paid_by__first_name', 'paid_by__last_name'
    ]
    ordering = ['-payment_date']
    readonly_fields = [
        'payment_id', 'payment_date', 'created_at', 'updated_at'
    ]
    date_hierarchy = 'payment_date'

    fieldsets = (
        ('Payment Information', {
            'fields': ('payment_id', 'invoice', 'amount', 'payment_method')
        }),
        ('Status', {
            'fields': ('status', 'transaction_id', 'gateway_response')
        }),
        ('Users', {
            'fields': ('paid_by', 'processed_by')
        }),
        ('Dates', {
            'fields': ('payment_date', 'processed_date')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def status_display(self, obj):
        colors = {
            'pending': 'orange',
            'processing': 'blue',
            'completed': 'green',
            'failed': 'red',
            'cancelled': 'gray',
            'refunded': 'purple'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'black'),
            obj.get_status_display()
        )
    status_display.short_description = 'Status'

    actions = ['mark_as_completed', 'mark_as_failed', 'mark_as_refunded']

    def mark_as_completed(self, request, queryset):
        for payment in queryset.filter(status='pending'):
            payment.mark_as_completed(request.user)
        self.message_user(
            request, f"Marked {queryset.count()} payments as completed"
        )
    mark_as_completed.short_description = "Mark selected payments as completed"

    def mark_as_failed(self, request, queryset):
        queryset.filter(status='pending').update(status='failed')
        self.message_user(
            request, f"Marked {queryset.count()} payments as failed"
        )
    mark_as_failed.short_description = "Mark selected payments as failed"

    def mark_as_refunded(self, request, queryset):
        queryset.filter(status='completed').update(status='refunded')
        self.message_user(
            request, f"Marked {queryset.count()} payments as refunded"
        )
    mark_as_refunded.short_description = "Mark selected payments as refunded"


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = [
        'transaction_id', 'tenant', 'transaction_type_display', 'amount',
        'description', 'reference', 'created_by', 'transaction_date'
    ]
    list_filter = [
        'transaction_type', 'transaction_date', 'tenant'
    ]
    search_fields = [
        'transaction_id', 'description', 'reference', 'tenant__name'
    ]
    ordering = ['-transaction_date']
    readonly_fields = [
        'transaction_id', 'transaction_date', 'created_at', 'updated_at'
    ]
    date_hierarchy = 'transaction_date'

    def transaction_type_display(self, obj):
        colors = {
            'income': 'green',
            'expense': 'red',
            'refund': 'blue',
            'adjustment': 'orange'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.transaction_type, 'black'),
            obj.get_transaction_type_display()
        )
    transaction_type_display.short_description = 'Type'


@admin.register(BillingSettings)
class BillingSettingsAdmin(admin.ModelAdmin):
    list_display = [
        'tenant', 'currency', 'tax_rate', 'late_fee_rate', 'grace_period_days',
        'auto_generate_invoices', 'send_payment_reminders',
        'payment_gateway_enabled'
    ]
    list_filter = [
        'currency', 'auto_generate_invoices', 'send_payment_reminders'
    ]
    search_fields = ['tenant__name']
    readonly_fields = ['created_at', 'updated_at']

    def has_add_permission(self, request):
        # Only allow one settings instance per tenant
        return True

    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion of settings
        return False
