from rest_framework import permissions


class AcademicYearPermission(permissions.BasePermission):
    """
    Custom permission class for academic year operations.

    - Read access: All authenticated users
    - Write access: Staff users only
    - Delete access: Superusers only
    """

    def has_permission(self, request, view):
        """Check if user has permission for the requested action"""
        if not request.user or not request.user.is_authenticated:
            return False

        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions for staff users only
        if request.method in ['POST', 'PUT', 'PATCH']:
            return request.user.is_staff

        # Delete permissions for superusers only
        if request.method == 'DELETE':
            return request.user.is_superuser

        return False

    def has_object_permission(self, request, view, obj):
        """Check if user has permission for the specific object"""
        if not request.user or not request.user.is_authenticated:
            return False

        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions for staff users only
        if request.method in ['PUT', 'PATCH']:
            return request.user.is_staff

        # Delete permissions for superusers only
        if request.method == 'DELETE':
            return request.user.is_superuser

        return False


class AcademicYearAdminPermission(permissions.BasePermission):
    """
    Permission class for academic year admin operations.

    Only allows superusers to perform admin actions.
    """

    def has_permission(self, request, view):
        """Check if user has admin permission"""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_superuser
        )

    def has_object_permission(self, request, view, obj):
        """Check if user has admin permission for the specific object"""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_superuser
        )


class AcademicYearReadOnlyPermission(permissions.BasePermission):
    """
    Permission class for read-only access to academic years.

    Allows all authenticated users to read academic year data.
    """

    def has_permission(self, request, view):
        """Check if user has read permission"""
        return (
            request.user and
            request.user.is_authenticated
        )

    def has_object_permission(self, request, view, obj):
        """Check if user has read permission for the specific object"""
        return (
            request.user and
            request.user.is_authenticated
        )
