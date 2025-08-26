from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'records', views.AttendanceRecordViewSet, basename='attendance-record')
# Other ViewSets removed - not found in views

urlpatterns = [
    path('', include(router.urls)),
]
