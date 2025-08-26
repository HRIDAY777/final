"""
Main API URL configuration.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create routers for each module
router = DefaultRouter()

# Student Management - Temporarily commented out
# router.register(r'students', views.StudentViewSet)
# router.register(r'profiles', views.StudentProfileViewSet)
# router.register(r'guardians', views.StudentGuardianViewSet)
# router.register(r'documents', views.StudentDocumentViewSet)
# router.register(r'achievements', views.StudentAchievementViewSet)
# router.register(r'disciplines', views.StudentDisciplineViewSet)
# router.register(r'academic-records', views.StudentAcademicRecordViewSet)
# router.register(r'settings', views.StudentSettingsViewSet)

# Teacher Management - Temporarily commented out
# router.register(r'teachers', views.TeacherViewSet)
# router.register(r'teacher-profiles', views.TeacherProfileViewSet)
# router.register(r'teacher-qualifications', views.TeacherQualificationViewSet)
# router.register(r'teacher-experiences', views.TeacherExperienceViewSet)
# router.register(r'teacher-subjects', views.TeacherSubjectViewSet)
# router.register(r'teacher-classes', views.TeacherClassViewSet)
# router.register(r'teacher-attendance', views.TeacherAttendanceViewSet)
# router.register(r'teacher-salaries', views.TeacherSalaryViewSet)
# router.register(r'teacher-leaves', views.TeacherLeaveViewSet)
# router.register(r'teacher-performance', views.TeacherPerformanceViewSet)
# router.register(r'teacher-documents', views.TeacherDocumentViewSet)
# router.register(r'teacher-settings', views.TeacherSettingsViewSet)

# Core API endpoints - Temporarily commented out
# router.register(r'tenants', views.TenantViewSet)

urlpatterns = [
    # Main API router
    path('', include(router.urls)),

    # Health check
    path('health/', views.health_view, name='health'),

    # Authentication
    path('auth/', include('apps.accounts.urls')),

    # Multi-tenant management
    path('tenants/', include('apps.tenants.urls')),

    # Temporarily commented out due to missing ViewSets/models
    # # Academics
    # path('academics/', include('apps.academics.urls')),
    # # Classes
    # path('classes/', include('apps.classes.urls')),
    # # Attendance
    # path('attendance/', include('apps.attendance.urls')),
    # # Exams
    # path('exams/', include('apps.exams.urls')),
    # # Library
    # path('library/', include('apps.library.urls')),
    # # Analytics
    # path('analytics/', include('apps.analytics.urls')),
    # # AI Tools
    # path('ai-tools/', include('apps.ai_tools.urls')),
    # # E-commerce
    # path('ecommerce/', include('apps.ecommerce.urls')),
    # # Events
    # path('events/', include('apps.events.urls')),
    # # Notices
    # path('notices/', include('apps.notices.urls')),
    # # E-learning
    # path('elearning/', include('apps.elearning.urls')),
    # # HR
    # path('hr/', include('apps.hr.urls')),
    # # Inventory
    # path('inventory/', include('apps.inventory.urls')),
    # # Reports
    # path('reports/', include('apps.reports.urls')),
    # # Billing
    # path('billing/', include('apps.billing.urls')),
    # # Timetable
    # path('timetable/', include('apps.timetable.urls')),
    # # Transport
    # path('transport/', include('apps.transport.urls')),
    # # Hostel
    # path('hostel/', include('apps.hostel.urls')),
    # # Assignments
    # path('assignments/', include('apps.assignments.urls')),
    # # Settings
    # path('settings/', include('apps.settings.urls')),
]
