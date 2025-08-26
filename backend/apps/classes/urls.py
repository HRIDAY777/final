from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClassViewSet, ClassSubjectViewSet, ClassScheduleViewSet
)

router = DefaultRouter()
router.register(r'classes', ClassViewSet)
# SubjectViewSet removed - not found in views
router.register(r'class-subjects', ClassSubjectViewSet)
# ClassRoomViewSet removed - not found in views
router.register(r'schedules', ClassScheduleViewSet)
# Other ViewSets removed - not found in views

app_name = 'classes'

urlpatterns = [
    path('', include(router.urls)),
]
