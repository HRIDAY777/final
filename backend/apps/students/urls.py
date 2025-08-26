from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StudentViewSet, StudentProfileViewSet, StudentGuardianViewSet,
    StudentDocumentViewSet, StudentAchievementViewSet, StudentDisciplineViewSet,
    StudentAcademicRecordViewSet, StudentSettingsViewSet
)

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'profiles', StudentProfileViewSet)
router.register(r'guardians', StudentGuardianViewSet)
router.register(r'documents', StudentDocumentViewSet)
router.register(r'achievements', StudentAchievementViewSet)
router.register(r'disciplines', StudentDisciplineViewSet)
router.register(r'academic-records', StudentAcademicRecordViewSet)
router.register(r'settings', StudentSettingsViewSet)

app_name = 'students'

urlpatterns = [
    path('', include(router.urls)),
]
