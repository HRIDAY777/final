from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

# Register all viewsets
router.register(r'vehicles', views.VehicleViewSet)
router.register(r'drivers', views.DriverViewSet)
router.register(r'routes', views.RouteViewSet)
router.register(r'trips', views.TripViewSet)
router.register(r'student-transport', views.StudentTransportViewSet)
router.register(r'trip-passengers', views.TripPassengerViewSet)
router.register(r'maintenance', views.MaintenanceRecordViewSet)
router.register(r'fuel-records', views.FuelRecordViewSet)
router.register(r'settings', views.TransportSettingsViewSet)
router.register(r'dashboard', views.TransportDashboardViewSet, basename='transport-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
