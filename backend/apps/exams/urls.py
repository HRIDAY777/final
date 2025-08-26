from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'exams', views.ExamViewSet, basename='exam')
router.register(r'schedules', views.ExamScheduleViewSet, basename='exam-schedule')
router.register(r'questions', views.QuestionViewSet, basename='question')
router.register(r'answers', views.AnswerViewSet, basename='answer')
router.register(r'results', views.ExamResultViewSet, basename='exam-result')
router.register(r'student-answers', views.StudentAnswerViewSet, basename='student-answer')
router.register(r'quizzes', views.QuizViewSet, basename='quiz')
router.register(r'settings', views.ExamSettingsViewSet, basename='exam-settings')
router.register(r'analytics', views.ExamAnalyticsViewSet, basename='exam-analytics')

urlpatterns = [
    path('', include(router.urls)),
]
