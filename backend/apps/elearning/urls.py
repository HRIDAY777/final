from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, LessonViewSet, EnrollmentViewSet, LessonProgressViewSet,
    QuizViewSet, QuizAttemptViewSet, CourseReviewViewSet, CertificateViewSet,
    DiscussionViewSet, CourseCategoryViewSet
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'enrollments', EnrollmentViewSet)
router.register(r'lesson-progress', LessonProgressViewSet)
router.register(r'quizzes', QuizViewSet)
router.register(r'quiz-attempts', QuizAttemptViewSet)
router.register(r'course-reviews', CourseReviewViewSet)
router.register(r'certificates', CertificateViewSet)
router.register(r'discussions', DiscussionViewSet)
router.register(r'categories', CourseCategoryViewSet)

app_name = 'elearning'

urlpatterns = [
    path('', include(router.urls)),
]
