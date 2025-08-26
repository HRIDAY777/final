from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'classes', views.ClassViewSet, basename='class')
# Subjects URLs moved to apps.subjects
router.register(r'teachers', views.TeacherViewSet, basename='teacher')
router.register(r'students', views.StudentViewSet, basename='student')
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'lessons', views.LessonViewSet, basename='lesson')
# Assignment and AssignmentSubmission URLs moved to assignments app
router.register(r'grades', views.GradeViewSet, basename='grade')

urlpatterns = [
    path('', include(router.urls)),
]
