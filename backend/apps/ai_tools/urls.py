from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AIModelViewSet, AIQuizGeneratorViewSet, AIQuestionViewSet,
    AILessonSummarizerViewSet, AIPerformancePredictorViewSet,
    AIAttendanceAnomalyDetectorViewSet, AINaturalLanguageQueryViewSet,
    AITrainingJobViewSet, AIDataSourceViewSet, AIUsageLogViewSet
)

router = DefaultRouter()
router.register(r'models', AIModelViewSet)
router.register(r'quiz-generators', AIQuizGeneratorViewSet)
router.register(r'questions', AIQuestionViewSet)
router.register(r'lesson-summarizers', AILessonSummarizerViewSet)
router.register(r'performance-predictors', AIPerformancePredictorViewSet)
router.register(r'attendance-anomalies', AIAttendanceAnomalyDetectorViewSet)
router.register(r'natural-language-queries', AINaturalLanguageQueryViewSet)
router.register(r'training-jobs', AITrainingJobViewSet)
router.register(r'data-sources', AIDataSourceViewSet)
router.register(r'usage-logs', AIUsageLogViewSet)

app_name = 'ai_tools'

urlpatterns = [
    path('', include(router.urls)),
]
