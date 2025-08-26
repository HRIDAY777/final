from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlanViewSet, SubscriptionViewSet, FeeViewSet, InvoiceViewSet,
    PaymentViewSet, TransactionViewSet, BillingSettingsViewSet,
    BillingAnalyticsViewSet
)

router = DefaultRouter()
router.register(r'plans', PlanViewSet)
router.register(r'subscriptions', SubscriptionViewSet)
router.register(r'fees', FeeViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'settings', BillingSettingsViewSet)
router.register(r'analytics', BillingAnalyticsViewSet, basename='analytics')

app_name = 'billing'

urlpatterns = [
    path('', include(router.urls)),
]
