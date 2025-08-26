from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReportTemplateViewSet, ScheduledReportViewSet, GeneratedReportViewSet,
    ReportParameterViewSet, ReportCategoryViewSet, ReportAccessLogViewSet,
    ReportExportViewSet, ReportCommentViewSet, ReportDashboardViewSet
)

router = DefaultRouter()
router.register(r'templates', ReportTemplateViewSet)
router.register(r'scheduled', ScheduledReportViewSet)
router.register(r'generated', GeneratedReportViewSet)
router.register(r'parameters', ReportParameterViewSet)
router.register(r'categories', ReportCategoryViewSet)
router.register(r'access-logs', ReportAccessLogViewSet)
router.register(r'exports', ReportExportViewSet)
router.register(r'comments', ReportCommentViewSet)
router.register(r'dashboards', ReportDashboardViewSet)

app_name = 'reports'

urlpatterns = [
    path('', include(router.urls)),
]
