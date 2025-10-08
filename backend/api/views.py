"""
Main API views with ViewSets.
"""

from django.utils import timezone
from django.http import JsonResponse

# Import only essential ViewSets that we know work
from apps.students.views import StudentViewSet
from apps.teachers.views import TeacherViewSet
from apps.tenants.views import TenantViewSet
from apps.academics.views import ClassViewSet
from apps.subjects.views import SubjectViewSet, AcademicYearViewSet


def health_view(request):
    """Health check endpoint"""
    return JsonResponse({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'version': '1.0.0'
    })


# Re-export all ViewSets for URL routing
__all__ = [
    # Student Management
    'StudentViewSet',

    # Teacher Management
    'TeacherViewSet',

    # Multi-tenant
    'TenantViewSet',

    # Academics
    'ClassViewSet', 'SubjectViewSet', 'AcademicYearViewSet',
]
