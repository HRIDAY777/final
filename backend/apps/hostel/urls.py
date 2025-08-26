from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

# Register all viewsets
router.register(r'buildings', views.BuildingViewSet)
router.register(r'room-types', views.RoomTypeViewSet)
router.register(r'rooms', views.RoomViewSet)
router.register(r'allocations', views.RoomAllocationViewSet)
router.register(r'fees', views.HostelFeeViewSet)
router.register(r'student-fees', views.StudentFeeViewSet)
router.register(r'maintenance', views.MaintenanceRequestViewSet)
router.register(r'rules', views.HostelRuleViewSet)
router.register(r'visitors', views.VisitorLogViewSet)
router.register(r'dashboard', views.HostelDashboardViewSet, basename='hostel-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
