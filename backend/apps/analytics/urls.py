from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StudentPerformanceViewSet, AttendanceAnalyticsViewSet, ExamAnalyticsViewSet,
    SystemUsageViewSet, LearningAnalyticsViewSet, PredictiveAnalyticsViewSet,
    AnalyticsDashboardViewSet
)

router = DefaultRouter()
router.register(r'student-performance', StudentPerformanceViewSet)
router.register(r'attendance', AttendanceAnalyticsViewSet)
router.register(r'exams', ExamAnalyticsViewSet)
router.register(r'system-usage', SystemUsageViewSet)
router.register(r'learning', LearningAnalyticsViewSet)
router.register(r'predictive', PredictiveAnalyticsViewSet)
router.register(r'dashboards', AnalyticsDashboardViewSet)

app_name = 'analytics'

urlpatterns = [
    path('', include(router.urls)),
]

