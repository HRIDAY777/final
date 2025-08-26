from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, SupplierViewSet, AssetViewSet, StockItemViewSet,
    TransactionViewSet, MaintenanceRecordViewSet
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'assets', AssetViewSet)
router.register(r'stock-items', StockItemViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'maintenance-records', MaintenanceRecordViewSet)

app_name = 'inventory'

urlpatterns = [
    path('', include(router.urls)),
]
