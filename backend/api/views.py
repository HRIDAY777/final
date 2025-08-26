"""
Main API views with ViewSets.
"""

from django.utils import timezone
from django.http import JsonResponse

# Import working ViewSets from different apps
# Temporarily commented out until all ViewSets are implemented
# from apps.students.views import (
#     StudentViewSet, StudentProfileViewSet, StudentGuardianViewSet,
#     StudentDocumentViewSet, StudentAchievementViewSet,
#     StudentDisciplineViewSet, StudentAcademicRecordViewSet,
#     StudentSettingsViewSet
# )

# from apps.teachers.views import (
#     TeacherViewSet, TeacherProfileViewSet, TeacherQualificationViewSet,
#     TeacherExperienceViewSet, TeacherSubjectViewSet, TeacherClassViewSet,
#     TeacherAttendanceViewSet, TeacherSalaryViewSet, TeacherLeaveViewSet,
#     TeacherPerformanceViewSet, TeacherDocumentViewSet,
#     TeacherSettingsViewSet
# )

# from apps.tenants.views import TenantViewSet


def health_view(request):
    """Health check endpoint"""
    return JsonResponse({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'version': '1.0.0'
    })


# Re-export all ViewSets for URL routing
# Temporarily empty until all ViewSets are implemented
__all__ = [
    # Student Management
    # 'StudentViewSet', 'StudentProfileViewSet', 'StudentGuardianViewSet',
    # 'StudentDocumentViewSet', 'StudentAchievementViewSet',
    # 'StudentDisciplineViewSet', 'StudentAcademicRecordViewSet',
    # 'StudentSettingsViewSet',

    # Teacher Management
    # 'TeacherViewSet', 'TeacherProfileViewSet', 'TeacherQualificationViewSet',
    # 'TeacherExperienceViewSet', 'TeacherSubjectViewSet',
    # 'TeacherClassViewSet', 'TeacherAttendanceViewSet',
    # 'TeacherSalaryViewSet', 'TeacherLeaveViewSet',
    # 'TeacherPerformanceViewSet', 'TeacherDocumentViewSet',
    # 'TeacherSettingsViewSet',

    # Multi-tenant
    # 'TenantViewSet',
]
