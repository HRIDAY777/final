from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GuardianViewSet, GuardianProfileViewSet, GuardianStudentViewSet,
    GuardianDocumentViewSet, GuardianSettingsViewSet, GuardianNotificationViewSet
)

router = DefaultRouter()
router.register(r'guardians', GuardianViewSet)
router.register(r'profiles', GuardianProfileViewSet)
router.register(r'students', GuardianStudentViewSet)
router.register(r'documents', GuardianDocumentViewSet)
router.register(r'settings', GuardianSettingsViewSet)
router.register(r'notifications', GuardianNotificationViewSet)

app_name = 'guardians'

urlpatterns = [
    path('', include(router.urls)),
]
