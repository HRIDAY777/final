from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TeacherViewSet, TeacherProfileViewSet, TeacherQualificationViewSet,
    TeacherExperienceViewSet, TeacherSubjectViewSet, TeacherClassViewSet,
    TeacherAttendanceViewSet, TeacherSalaryViewSet, TeacherLeaveViewSet,
    TeacherPerformanceViewSet, TeacherDocumentViewSet, TeacherSettingsViewSet
)

router = DefaultRouter()
router.register(r'teachers', TeacherViewSet)
router.register(r'profiles', TeacherProfileViewSet)
router.register(r'qualifications', TeacherQualificationViewSet)
router.register(r'experiences', TeacherExperienceViewSet)
router.register(r'subjects', TeacherSubjectViewSet)
router.register(r'classes', TeacherClassViewSet)
router.register(r'attendance', TeacherAttendanceViewSet)
router.register(r'salaries', TeacherSalaryViewSet)
router.register(r'leaves', TeacherLeaveViewSet)
router.register(r'performance', TeacherPerformanceViewSet)
router.register(r'documents', TeacherDocumentViewSet)
router.register(r'settings', TeacherSettingsViewSet)

app_name = 'teachers'

urlpatterns = [
    path('', include(router.urls)),
]
