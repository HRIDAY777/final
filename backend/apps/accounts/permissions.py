"""
RBAC (Role-Based Access Control) permissions for the accounts app.
"""

from rest_framework import permissions
from django.contrib.auth import get_user_model

User = get_user_model()


class BaseRBACPermission(permissions.BasePermission):
    """
    Base RBAC permission class with common functionality.
    """

    def has_permission(self, request, view):
        """Check if user has permission to access the view."""
        if not request.user.is_authenticated:
            return False

        # Super admins have access to everything
        if request.user.is_super_admin():
            return True

        return self.check_permission(request, view)

    def has_object_permission(self, request, view, obj):
        """Check if user has permission to access the specific object."""
        if not request.user.is_authenticated:
            return False

        # Super admins have access to everything
        if request.user.is_super_admin():
            return True

        return self.check_object_permission(request, view, obj)

    def check_permission(self, request, view):
        """Override this method to implement specific permission logic."""
        return True

    def check_object_permission(self, request, view, obj):
        """Override this method to implement object permission logic."""
        return True


class UserManagementPermission(BaseRBACPermission):
    """
    Permission for user management operations.
    """

    def check_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.can_manage_users
        return request.user.can_manage_users

    def check_object_permission(self, request, view, obj):
        # Users can always access their own profile
        if obj == request.user:
            return True

        # Check if user has permission to manage other users
        if not request.user.can_manage_users:
            return False

        # Institute admins can only manage users in their institutes
        if request.user.is_institute_admin():
            if hasattr(obj, 'tenant') and obj.tenant:
                return obj.tenant in request.user.admin_institutes.all()

        return True


class AdminManagementPermission(BaseRBACPermission):
    """
    Permission for admin management operations.
    """

    def check_permission(self, request, view):
        return request.user.can_manage_admins

    def check_object_permission(self, request, view, obj):
        # Super admins can manage all admins
        if request.user.is_super_admin():
            return True

        # System admins can manage institute and lower level admins
        if request.user.is_system_admin():
            if hasattr(obj, 'admin_level'):
                return obj.admin_level not in [
                    'super_admin', 'system_admin'
                ]

        # Institute admins can only manage department and faculty admins
        if request.user.is_institute_admin():
            if hasattr(obj, 'admin_level'):
                return obj.admin_level in [
                    'department_admin', 'faculty_admin'
                ]

        return False


class InstituteManagementPermission(BaseRBACPermission):
    """
    Permission for institute management operations.
    """

    def check_permission(self, request, view):
        return request.user.can_manage_institutes

    def check_object_permission(self, request, view, obj):
        # Super admins can manage all institutes
        if request.user.is_super_admin():
            return True

        # System admins can manage institutes
        if request.user.is_system_admin():
            return True

        # Institute admins can only manage their own institutes
        if request.user.is_institute_admin():
            if hasattr(obj, 'id'):
                return obj.id in request.user.admin_institutes.values_list(
                    'id', flat=True
                )

        return False


class TenantManagementPermission(BaseRBACPermission):
    """
    Permission for tenant management operations.
    """

    def check_permission(self, request, view):
        return request.user.can_manage_tenants

    def check_object_permission(self, request, view, obj):
        # Only super admins can manage tenants
        return request.user.is_super_admin()


class AnalyticsPermission(BaseRBACPermission):
    """
    Permission for analytics access.
    """

    def check_permission(self, request, view):
        return request.user.can_view_analytics

    def check_object_permission(self, request, view, obj):
        # Check if user has access to the specific analytics data
        if hasattr(obj, 'tenant') and obj.tenant:
            if request.user.is_institute_admin():
                return obj.tenant in request.user.admin_institutes.all()

        return True


class SettingsPermission(BaseRBACPermission):
    """
    Permission for settings management.
    """

    def check_permission(self, request, view):
        return request.user.can_manage_settings

    def check_object_permission(self, request, view, obj):
        # Super admins can manage all settings
        if request.user.is_super_admin():
            return True

        # System admins can manage system settings
        if request.user.is_system_admin():
            return True

        # Institute admins can only manage institute settings
        if request.user.is_institute_admin():
            if hasattr(obj, 'tenant') and obj.tenant:
                return obj.tenant in request.user.admin_institutes.all()

        return False


class BillingPermission(BaseRBACPermission):
    """
    Permission for billing management.
    """

    def check_permission(self, request, view):
        return request.user.can_manage_billing

    def check_object_permission(self, request, view, obj):
        # Super admins can manage all billing
        if request.user.is_super_admin():
            return True

        # System admins can manage billing
        if request.user.is_system_admin():
            return True

        # Institute admins can only manage their institute's billing
        if request.user.is_institute_admin():
            if hasattr(obj, 'tenant') and obj.tenant:
                return obj.tenant in request.user.admin_institutes.all()

        return False


class SecurityPermission(BaseRBACPermission):
    """
    Permission for security management.
    """

    def check_permission(self, request, view):
        return request.user.can_manage_security

    def check_object_permission(self, request, view, obj):
        # Only super admins and system admins can manage security
        return request.user.is_super_admin() or request.user.is_system_admin()


class AcademicPermission(BaseRBACPermission):
    """
    Base permission for academic operations.
    """

    def check_permission(self, request, view):
        # Check if user has any academic permissions
        return (
            request.user.can_manage_classes or
            request.user.can_manage_subjects or
            request.user.can_manage_courses or
            request.user.can_manage_assignments or
            request.user.can_manage_exams or
            request.user.can_manage_grades
        )

    def check_object_permission(self, request, view, obj):
        # Check institute-level access
        if hasattr(obj, 'tenant') and obj.tenant:
            if request.user.is_institute_admin():
                return obj.tenant in request.user.admin_institutes.all()

        return True


class ClassManagementPermission(AcademicPermission):
    """
    Permission for class management operations.
    """

    def check_permission(self, request, view):
        return request.user.can_manage_classes


class SubjectManagementPermission(AcademicPermission):
    """
    Permission for subject management operations.
    """

    def check_permission(self, request, view):
        return request.user.can_manage_subjects


class CourseManagementPermission(AcademicPermission):
    """
    Permission for course management operations.
    """

    def check_permission(self, request, view):
        return request.user.can_manage_courses


class AssignmentManagementPermission(AcademicPermission):
    """
    Permission for assignment management operations.
    """

    def check_permission(self, request, view):
        return request.user.can_manage_assignments


class ExamManagementPermission(AcademicPermission):
    """
    Permission for exam management operations.
    """

    def check_permission(self, request, view):
        return request.user.can_manage_exams


class GradeManagementPermission(AcademicPermission):
    """
    Permission for grade management operations.
    """

    def check_permission(self, request, view):
        return request.user.can_manage_grades


class AttendancePermission(BaseRBACPermission):
    """
    Permission for attendance operations.
    """

    def check_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.can_view_attendance
        return request.user.can_manage_attendance

    def check_object_permission(self, request, view, obj):
        # Teachers can access attendance for their classes
        if request.user.user_type == 'teacher':
            if hasattr(obj, 'class_section') and obj.class_section:
                return obj.class_section.teacher == request.user

        # Institute admins can access attendance in their institutes
        if request.user.is_institute_admin():
            if hasattr(obj, 'tenant') and obj.tenant:
                return obj.tenant in request.user.admin_institutes.all()

        return True


class FinancePermission(BaseRBACPermission):
    """
    Permission for finance operations.
    """

    def check_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.can_view_finance
        return request.user.can_manage_finance

    def check_object_permission(self, request, view, obj):
        # Institute admins can access finance in their institutes
        if request.user.is_institute_admin():
            if hasattr(obj, 'tenant') and obj.tenant:
                return obj.tenant in request.user.admin_institutes.all()

        return True


class LibraryPermission(BaseRBACPermission):
    """
    Permission for library operations.
    """

    def check_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.can_view_library
        return request.user.can_manage_library

    def check_object_permission(self, request, view, obj):
        # Institute admins can access library in their institutes
        if request.user.is_institute_admin():
            if hasattr(obj, 'tenant') and obj.tenant:
                return obj.tenant in request.user.admin_institutes.all()

        return True


class TransportPermission(BaseRBACPermission):
    """
    Permission for transport operations.
    """

    def check_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.can_view_transport
        return request.user.can_manage_transport

    def check_object_permission(self, request, view, obj):
        # Institute admins can access transport in their institutes
        if request.user.is_institute_admin():
            if hasattr(obj, 'tenant') and obj.tenant:
                return obj.tenant in request.user.admin_institutes.all()

        return True


class HostelPermission(BaseRBACPermission):
    """
    Permission for hostel operations.
    """

    def check_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.can_view_hostel
        return request.user.can_manage_hostel

    def check_object_permission(self, request, view, obj):
        # Institute admins can access hostel in their institutes
        if request.user.is_institute_admin():
            if hasattr(obj, 'tenant') and obj.tenant:
                return obj.tenant in request.user.admin_institutes.all()

        return True


class HRPermission(BaseRBACPermission):
    """
    Permission for HR operations.
    """

    def check_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.can_view_hr
        return request.user.can_manage_hr

    def check_object_permission(self, request, view, obj):
        # Institute admins can access HR in their institutes
        if request.user.is_institute_admin():
            if hasattr(obj, 'tenant') and obj.tenant:
                return obj.tenant in request.user.admin_institutes.all()

        return True


class InventoryPermission(BaseRBACPermission):
    """
    Permission for inventory operations.
    """

    def check_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.can_view_inventory
        return request.user.can_manage_inventory

    def check_object_permission(self, request, view, obj):
        # Institute admins can access inventory in their institutes
        if request.user.is_institute_admin():
            if hasattr(obj, 'tenant') and obj.tenant:
                return obj.tenant in request.user.admin_institutes.all()

        return True


class EcommercePermission(BaseRBACPermission):
    """
    Permission for e-commerce operations.
    """

    def check_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.can_view_ecommerce
        return request.user.can_manage_ecommerce

    def check_object_permission(self, request, view, obj):
        # Institute admins can access e-commerce in their institutes
        if request.user.is_institute_admin():
            if hasattr(obj, 'tenant') and obj.tenant:
                return obj.tenant in request.user.admin_institutes.all()

        return True


class ElearningPermission(BaseRBACPermission):
    """
    Permission for e-learning operations.
    """

    def check_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.can_view_elearning
        return request.user.can_manage_elearning

    def check_object_permission(self, request, view, obj):
        # Institute admins can access e-learning in their institutes
        if request.user.is_institute_admin():
            if hasattr(obj, 'tenant') and obj.tenant:
                return obj.tenant in request.user.admin_institutes.all()

        return True


class EventsPermission(BaseRBACPermission):
    """
    Permission for events operations.
    """

    def check_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.can_view_events
        return request.user.can_manage_events

    def check_object_permission(self, request, view, obj):
        # Institute admins can access events in their institutes
        if request.user.is_institute_admin():
            if hasattr(obj, 'tenant') and obj.tenant:
                return obj.tenant in request.user.admin_institutes.all()

        return True


class NoticesPermission(BaseRBACPermission):
    """
    Permission for notices operations.
    """

    def check_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.can_view_notices
        return request.user.can_manage_notices

    def check_object_permission(self, request, view, obj):
        # Institute admins can access notices in their institutes
        if request.user.is_institute_admin():
            if hasattr(obj, 'tenant') and obj.tenant:
                return obj.tenant in request.user.admin_institutes.all()

        return True


class AIToolsPermission(BaseRBACPermission):
    """
    Permission for AI tools operations.
    """

    def check_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.can_use_ai_tools
        return request.user.can_manage_ai_tools

    def check_object_permission(self, request, view, obj):
        # Institute admins can access AI tools in their institutes
        if request.user.is_institute_admin():
            if hasattr(obj, 'tenant') and obj.tenant:
                return obj.tenant in request.user.admin_institutes.all()

        return True


class ReportsPermission(BaseRBACPermission):
    """
    Permission for reports operations.
    """

    def check_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.can_view_reports
        return request.user.can_manage_reports

    def check_object_permission(self, request, view, obj):
        # Institute admins can access reports in their institutes
        if request.user.is_institute_admin():
            if hasattr(obj, 'tenant') and obj.tenant:
                return obj.tenant in request.user.admin_institutes.all()

        return True


class StudentPermission(BaseRBACPermission):
    """
    Permission for student-specific operations.
    """

    def check_permission(self, request, view):
        # Students can access their own data
        if request.user.user_type == 'student':
            return True

        # Teachers can access their students' data
        if request.user.user_type == 'teacher':
            return True

        # Admins can access all student data
        if request.user.is_admin():
            return True

        return False

    def check_object_permission(self, request, view, obj):
        # Students can only access their own data
        if request.user.user_type == 'student':
            return obj == request.user

        # Teachers can access their students' data
        if request.user.user_type == 'teacher':
            if hasattr(obj, 'class_section') and obj.class_section:
                return obj.class_section.teacher == request.user

        # Admins can access all student data
        if request.user.is_admin():
            return True

        return False


class ParentPermission(BaseRBACPermission):
    """
    Permission for parent-specific operations.
    """

    def check_permission(self, request, view):
        # Parents can access their children's data
        if request.user.user_type == 'parent':
            return True

        # Admins can access all parent data
        if request.user.is_admin():
            return True

        return False

    def check_object_permission(self, request, view, obj):
        # Parents can only access their children's data
        if request.user.user_type == 'parent':
            # This would need to be implemented based on how parent-child
            # relationships are stored
            # Placeholder - implement based on actual model structure
            return True

        # Admins can access all parent data
        if request.user.is_admin():
            return True

        return False


class TeacherPermission(BaseRBACPermission):
    """
    Permission for teacher-specific operations.
    """

    def check_permission(self, request, view):
        # Teachers can access their own data
        if request.user.user_type == 'teacher':
            return True

        # Admins can access all teacher data
        if request.user.is_admin():
            return True

        return False

    def check_object_permission(self, request, view, obj):
        # Teachers can only access their own data
        if request.user.user_type == 'teacher':
            return obj == request.user

        # Admins can access all teacher data
        if request.user.is_admin():
            return True

        return False


class StaffPermission(BaseRBACPermission):
    """
    Permission for staff-specific operations.
    """

    def check_permission(self, request, view):
        # Staff can access their own data
        if request.user.user_type == 'staff':
            return True

        # Admins can access all staff data
        if request.user.is_admin():
            return True

        return False

    def check_object_permission(self, request, view, obj):
        # Staff can only access their own data
        if request.user.user_type == 'staff':
            return obj == request.user

        # Admins can access all staff data
        if request.user.is_admin():
            return True

        return False


# Permission mapping for different user types
PERMISSION_MAPPING = {
    'super_admin': {
        'permissions': [
            'can_manage_users',
            'can_manage_admins',
            'can_manage_institutes',
            'can_manage_tenants',
            'can_view_analytics',
            'can_manage_settings',
            'can_manage_billing',
            'can_manage_security',
            'can_manage_classes',
            'can_manage_subjects',
            'can_manage_courses',
            'can_manage_assignments',
            'can_manage_exams',
            'can_manage_grades',
            'can_manage_attendance',
            'can_view_attendance',
            'can_manage_finance',
            'can_view_finance',
            'can_manage_library',
            'can_view_library',
            'can_manage_transport',
            'can_view_transport',
            'can_manage_hostel',
            'can_view_hostel',
            'can_manage_hr',
            'can_view_hr',
            'can_manage_inventory',
            'can_view_inventory',
            'can_manage_ecommerce',
            'can_view_ecommerce',
            'can_manage_elearning',
            'can_view_elearning',
            'can_manage_events',
            'can_view_events',
            'can_manage_notices',
            'can_view_notices',
            'can_manage_ai_tools',
            'can_use_ai_tools',
            'can_manage_reports',
            'can_view_reports',
        ]
    },
    'admin': {
        'permissions': [
            'can_manage_users',
            'can_manage_institutes',
            'can_view_analytics',
            'can_manage_settings',
            'can_manage_billing',
            'can_manage_classes',
            'can_manage_subjects',
            'can_manage_courses',
            'can_manage_assignments',
            'can_manage_exams',
            'can_manage_grades',
            'can_manage_attendance',
            'can_view_attendance',
            'can_manage_finance',
            'can_view_finance',
            'can_manage_library',
            'can_view_library',
            'can_manage_transport',
            'can_view_transport',
            'can_manage_hostel',
            'can_view_hostel',
            'can_manage_hr',
            'can_view_hr',
            'can_manage_inventory',
            'can_view_inventory',
            'can_manage_ecommerce',
            'can_view_ecommerce',
            'can_manage_elearning',
            'can_view_elearning',
            'can_manage_events',
            'can_view_events',
            'can_manage_notices',
            'can_view_notices',
            'can_manage_ai_tools',
            'can_use_ai_tools',
            'can_manage_reports',
            'can_view_reports',
        ]
    },
    'institute_admin': {
        'permissions': [
            'can_manage_users',
            'can_view_analytics',
            'can_manage_classes',
            'can_manage_subjects',
            'can_manage_courses',
            'can_manage_assignments',
            'can_manage_exams',
            'can_manage_grades',
            'can_manage_attendance',
            'can_view_attendance',
            'can_view_finance',
            'can_manage_library',
            'can_view_library',
            'can_manage_transport',
            'can_view_transport',
            'can_manage_hostel',
            'can_view_hostel',
            'can_view_hr',
            'can_manage_inventory',
            'can_view_inventory',
            'can_view_ecommerce',
            'can_manage_elearning',
            'can_view_elearning',
            'can_manage_events',
            'can_view_events',
            'can_manage_notices',
            'can_view_notices',
            'can_use_ai_tools',
            'can_manage_reports',
            'can_view_reports',
        ]
    },
    'teacher': {
        'permissions': [
            'can_view_analytics',
            'can_manage_assignments',
            'can_manage_exams',
            'can_manage_grades',
            'can_view_attendance',
            'can_view_library',
            'can_use_ai_tools',
            'can_view_reports',
        ]
    },
    'student': {
        'permissions': [
            'can_view_analytics',
            'can_view_library',
            'can_use_ai_tools',
            'can_view_reports',
        ]
    },
    'parent': {
        'permissions': [
            'can_view_analytics',
            'can_view_reports',
        ]
    },
    'staff': {
        'permissions': [
            'can_view_analytics',
            'can_view_library',
            'can_view_inventory',
            'can_view_reports',
        ]
    },
}
