from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from .models import (
    Plan, Subscription, Fee, Invoice, InvoiceItem, Payment, Transaction,
    BillingSettings
)
from .serializers import (
    PlanSerializer, SubscriptionSerializer, FeeSerializer, InvoiceSerializer,
    InvoiceListSerializer, PaymentSerializer, PaymentListSerializer,
    TransactionSerializer, TransactionListSerializer,
    BillingSettingsSerializer,
    BillingDashboardSerializer, PaymentAnalyticsSerializer,
    RevenueAnalyticsSerializer, CreateInvoiceSerializer,
    ProcessPaymentSerializer,
    CancelSubscriptionSerializer, SendPaymentReminderSerializer
)


class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = ['plan_type', 'billing_cycle', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'max_students', 'created_at']
    ordering = ['price']

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active plans"""
        plans = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(plans, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most popular plans by subscription count"""
        plans = self.queryset.annotate(
            subscription_count=Count('subscriptions')
        ).filter(subscription_count__gt=0).order_by(
            '-subscription_count')[:10]
        serializer = self.get_serializer(plans, many=True)
        return Response(serializer.data)


class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = ['status', 'plan', 'auto_renew']
    search_fields = ['tenant__name', 'plan__name', 'notes']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active subscriptions"""
        subscriptions = self.queryset.filter(status='active')
        serializer = self.get_serializer(subscriptions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expiring(self, request):
        """Get subscriptions expiring soon (within 30 days)"""
        thirty_days_from_now = timezone.now() + timedelta(days=30)
        subscriptions = self.queryset.filter(
            status='active',
            end_date__lte=thirty_days_from_now
        )
        serializer = self.get_serializer(subscriptions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a subscription"""
        subscription = self.get_object()
        serializer = CancelSubscriptionSerializer(data=request.data)

        if serializer.is_valid():
            try:
                subscription.cancel(
                    request.user,
                    serializer.validated_data.get('reason', '')
                )
                return Response(
                    {"message": "Subscription cancelled successfully"},
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FeeViewSet(viewsets.ModelViewSet):
    queryset = Fee.objects.all()
    serializer_class = FeeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = ['fee_type', 'is_recurring', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['amount', 'name', 'created_at']
    ordering = ['name']

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active fees"""
        fees = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(fees, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recurring(self, request):
        """Get recurring fees"""
        fees = self.queryset.filter(is_recurring=True, is_active=True)
        serializer = self.get_serializer(fees, many=True)
        return Response(serializer.data)


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = ['status', 'tenant', 'student']
    search_fields = ['invoice_number', 'tenant__name', 'student__first_name']
    ordering_fields = ['issue_date', 'due_date', 'total_amount']
    ordering = ['-issue_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceListSerializer
        return InvoiceSerializer

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending invoices"""
        invoices = self.queryset.filter(status='sent')
        serializer = InvoiceListSerializer(invoices, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue invoices"""
        invoices = self.queryset.filter(status='overdue')
        serializer = InvoiceListSerializer(invoices, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def create_invoice(self, request):
        """Create a new invoice with items"""
        serializer = CreateInvoiceSerializer(data=request.data)

        if serializer.is_valid():
            try:
                data = serializer.validated_data

                # Create invoice
                invoice = Invoice.objects.create(
                    tenant_id=data['tenant_id'],
                    student_id=data.get('student_id'),
                    subscription_id=data.get('subscription_id'),
                    due_date=data['due_date'],
                    notes=data.get('notes', '')
                )

                # Create invoice items
                subtotal = Decimal('0.00')
                for item_data in data['items']:
                    fee = Fee.objects.get(id=item_data['fee_id'])
                    quantity = item_data['quantity']
                    unit_price = fee.amount
                    total_price = unit_price * quantity
                    subtotal += total_price

                    InvoiceItem.objects.create(
                        invoice=invoice,
                        fee=fee,
                        description=item_data.get('description', fee.name),
                        quantity=quantity,
                        unit_price=unit_price,
                        total_price=total_price
                    )

                # Calculate totals
                invoice.subtotal = subtotal
                invoice.calculate_total()
                invoice.save()

                return Response(
                    {"message": "Invoice created successfully",
                     "invoice_id": invoice.id},
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        """Mark invoice as paid"""
        invoice = self.get_object()
        invoice.mark_as_paid()
        return Response(
            {"message": "Invoice marked as paid"},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def send_reminder(self, request, pk=None):
        """Send payment reminder"""
        self.get_object()  # Get invoice for validation
        serializer = SendPaymentReminderSerializer(data=request.data)

        if serializer.is_valid():
            # TODO: Implement reminder sending logic
            return Response(
                {"message": "Payment reminder sent"},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = ['status', 'payment_method']
    search_fields = ['payment_id', 'invoice__invoice_number', 'transaction_id']
    ordering_fields = ['payment_date', 'amount', 'created_at']
    ordering = ['-payment_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return PaymentListSerializer
        return PaymentSerializer

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending payments"""
        payments = self.queryset.filter(status='pending')
        serializer = PaymentListSerializer(payments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Get completed payments"""
        payments = self.queryset.filter(status='completed')
        serializer = PaymentListSerializer(payments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def process_payment(self, request):
        """Process a payment"""
        serializer = ProcessPaymentSerializer(data=request.data)

        if serializer.is_valid():
            try:
                data = serializer.validated_data

                # Create payment
                payment = Payment.objects.create(
                    invoice_id=data['invoice_id'],
                    amount=data['amount'],
                    payment_method=data['payment_method'],
                    transaction_id=data.get('transaction_id', ''),
                    paid_by=request.user,
                    notes=data.get('notes', '')
                )

                # Mark as completed
                payment.mark_as_completed(request.user)

                return Response(
                    {"message": "Payment processed successfully",
                     "payment_id": payment.id},
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def mark_as_completed(self, request, pk=None):
        """Mark payment as completed"""
        payment = self.get_object()
        payment.mark_as_completed(request.user)
        return Response(
            {"message": "Payment marked as completed"},
            status=status.HTTP_200_OK
        )


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = ['transaction_type', 'tenant']
    search_fields = ['transaction_id', 'description', 'reference']
    ordering_fields = ['transaction_date', 'amount', 'created_at']
    ordering = ['-transaction_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return TransactionListSerializer
        return TransactionSerializer

    @action(detail=False, methods=['get'])
    def income(self, request):
        """Get income transactions"""
        transactions = self.queryset.filter(transaction_type='income')
        serializer = TransactionListSerializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expenses(self, request):
        """Get expense transactions"""
        transactions = self.queryset.filter(transaction_type='expense')
        serializer = TransactionListSerializer(transactions, many=True)
        return Response(serializer.data)


class BillingSettingsViewSet(viewsets.ModelViewSet):
    queryset = BillingSettings.objects.all()
    serializer_class = BillingSettingsSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = ['currency', 'payment_gateway_enabled']
    search_fields = ['tenant__name']
    ordering = ['tenant__name']


class BillingAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get billing dashboard statistics"""
        total_invoices = Invoice.objects.count()
        total_payments = Payment.objects.count()
        total_revenue = Payment.objects.filter(
            status='completed').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        pending_invoices = Invoice.objects.filter(status='sent').count()
        overdue_invoices = Invoice.objects.filter(status='overdue').count()
        pending_amount = Invoice.objects.filter(status='sent').aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0.00')
        overdue_amount = Invoice.objects.filter(status='overdue').aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0.00')
        active_subscriptions = Subscription.objects.filter(
            status='active').count()
        expiring_subscriptions = Subscription.objects.filter(
            status='active',
            end_date__lte=timezone.now() + timedelta(days=30)
        ).count()

        data = {
            'total_invoices': total_invoices,
            'total_payments': total_payments,
            'total_revenue': total_revenue,
            'pending_invoices': pending_invoices,
            'overdue_invoices': overdue_invoices,
            'pending_amount': pending_amount,
            'overdue_amount': overdue_amount,
            'active_subscriptions': active_subscriptions,
            'expiring_subscriptions': expiring_subscriptions,
        }

        serializer = BillingDashboardSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def payment_methods(self, request):
        """Get payment method analytics"""
        payment_methods = Payment.objects.filter(status='completed').values(
            'payment_method'
        ).annotate(
            count=Count('id'),
            total_amount=Sum('amount')
        ).order_by('-total_amount')

        total_amount = sum(item['total_amount'] for item in payment_methods)

        data = []
        for method in payment_methods:
            percentage = ((method['total_amount'] / total_amount * 100)
                          if total_amount > 0 else 0)
            data.append({
                'payment_method': method['payment_method'],
                'count': method['count'],
                'total_amount': method['total_amount'],
                'percentage': round(percentage, 2)
            })

        serializer = PaymentAnalyticsSerializer(data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def revenue_trends(self, request):
        """Get revenue trends by period"""
        # Get last 12 months
        periods = []
        for i in range(12):
            date = timezone.now() - timedelta(days=30*i)
            period_start = date.replace(
                day=1, hour=0, minute=0, second=0, microsecond=0)
            period_end = ((period_start + timedelta(days=32)).replace(day=1)
                          - timedelta(seconds=1))

            revenue = Payment.objects.filter(
                status='completed',
                payment_date__range=(period_start, period_end)
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            invoice_count = Invoice.objects.filter(
                issue_date__range=(period_start, period_end)
            ).count()

            payment_count = Payment.objects.filter(
                payment_date__range=(period_start, period_end)
            ).count()

            periods.append({
                'period': period_start.strftime('%Y-%m'),
                'revenue': revenue,
                'invoice_count': invoice_count,
                'payment_count': payment_count
            })

        serializer = RevenueAnalyticsSerializer(periods, many=True)
        return Response(serializer.data)
