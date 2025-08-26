from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'tenants', views.TenantViewSet)
router.register(r'subscription-plans', views.SubscriptionPlanViewSet)
router.register(r'modules', views.ModuleViewSet)
router.register(r'subscriptions', views.SubscriptionViewSet)
router.register(r'usage-logs', views.UsageLogViewSet)
router.register(r'billing-history', views.BillingHistoryViewSet)
router.register(r'feature-flags', views.FeatureFlagViewSet)

app_name = 'tenants'

urlpatterns = [
    path('api/', include(router.urls)),
]
