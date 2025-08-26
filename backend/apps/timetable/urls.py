from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

# Register all viewsets
router.register(r'time-slots', views.TimeSlotViewSet)
router.register(r'rooms', views.RoomViewSet)
router.register(r'schedules', views.ScheduleViewSet)
router.register(r'class-schedules', views.ClassScheduleViewSet)
router.register(r'conflicts', views.ScheduleConflictViewSet)
router.register(r'templates', views.ScheduleTemplateViewSet)
router.register(r'template-schedules', views.TemplateScheduleViewSet)
router.register(r'changes', views.ScheduleChangeViewSet)
router.register(r'notifications', views.ScheduleNotificationViewSet)
router.register(r'settings', views.ScheduleSettingsViewSet)
router.register(r'dashboard', views.TimetableDashboardViewSet, basename='timetable-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
