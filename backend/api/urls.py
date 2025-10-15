"""
Main API URL configuration.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .health import (
    health_check,
    health_check_detailed,
    readiness_check,
    liveness_check,
    metrics
)

# Create routers for each module
router = DefaultRouter()

# Student Management
router.register(r'students', views.StudentViewSet)

# Teacher Management
router.register(r'teachers', views.TeacherViewSet)

# Core API endpoints
router.register(r'tenants', views.TenantViewSet)

# Academics
router.register(r'classes', views.ClassViewSet)
router.register(r'subjects', views.SubjectViewSet)
router.register(r'academic-years', views.AcademicYearViewSet)

urlpatterns = [
    # Main API router
    path('', include(router.urls)),

    # Health Check & Monitoring - Production Ready
    path('health/', health_check, name='health_check'),
    path('health/detailed/', health_check_detailed, name='health_check_detailed'),
    path('health/ready/', readiness_check, name='readiness_check'),
    path('health/live/', liveness_check, name='liveness_check'),
    path('metrics/', metrics, name='metrics'),

    # Authentication
    path('auth/', include('apps.accounts.urls')),

    # Multi-tenant management
    path('tenants/', include('apps.tenants.urls')),

    # Academics
    path('academics/', include('apps.academics.urls')),
    path('academic-years/', include('apps.academic_years.urls')),

    # Attendance
    path('attendance/', include('apps.attendance.urls')),

    # Assignments
    path('assignments/', include('apps.assignments.urls')),

    # Exams
    path('exams/', include('apps.exams.urls')),

    # Reports
    path('reports/', include('apps.reports.urls')),

    # Billing/Finance
    path('finance/', include('apps.billing.urls')),

    # Library
    path('library/', include('apps.library.urls')),

    # Transport
    path('transport/', include('apps.transport.urls')),
    
    # Ecommerce/Shop
    path('ecommerce/', include('apps.ecommerce.urls')),
    
    # Events
    path('events/', include('apps.events.urls')),
    
    # Analytics
    path('analytics/', include('apps.analytics.urls')),
]
