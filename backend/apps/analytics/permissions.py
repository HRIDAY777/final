from rest_framework import permissions


class AnalyticsPermission(permissions.BasePermission):
    """
    Custom permission for analytics access.
    Allows access based on user role and specific analytics permissions.
    """
    
    def has_permission(self, request, view):
        # Allow read access to authenticated users with analytics permissions
        if request.method in permissions.SAFE_METHODS:
            return (
                request.user.is_authenticated and
                (request.user.is_staff or 
                 hasattr(request.user, 'role') and 
                 request.user.role in ['admin', 'teacher', 'analyst'])
            )
        
        # Allow write access only to staff and analysts
        return (
            request.user.is_authenticated and
            (request.user.is_staff or 
             hasattr(request.user, 'role') and 
             request.user.role in ['admin', 'analyst'])
        )
    
    def has_object_permission(self, request, view, obj):
        # Staff can access all analytics data
        if request.user.is_staff:
            return True
        
        # Teachers can only access analytics for their classes
        if hasattr(request.user, 'role') and request.user.role == 'teacher':
            if hasattr(obj, 'student'):
                # Check if the student is in teacher's class
                return obj.student.class_section.teacher == request.user
            elif hasattr(obj, 'class_section'):
                return obj.class_section.teacher == request.user
            elif hasattr(obj, 'subject'):
                # Check if teacher teaches this subject
                return obj.subject.teacher == request.user
        
        # Analysts can access all analytics data
        if hasattr(request.user, 'role') and request.user.role == 'analyst':
            return True
        
        return False


class StudentPerformancePermission(permissions.BasePermission):
    """
    Permission for student performance analytics.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return (
                request.user.is_authenticated and
                (request.user.is_staff or 
                 hasattr(request.user, 'role') and 
                 request.user.role in ['admin', 'teacher', 'analyst', 'parent'])
            )
        return (
            request.user.is_authenticated and
            (request.user.is_staff or 
             hasattr(request.user, 'role') and 
             request.user.role in ['admin', 'teacher', 'analyst'])
        )
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        
        # Teachers can access performance data for their students
        if hasattr(request.user, 'role') and request.user.role == 'teacher':
            return obj.student.class_section.teacher == request.user
        
        # Parents can only access their own children's performance
        if hasattr(request.user, 'role') and request.user.role == 'parent':
            return obj.student.parent == request.user
        
        # Analysts can access all performance data
        if hasattr(request.user, 'role') and request.user.role == 'analyst':
            return True
        
        return False


class AttendanceAnalyticsPermission(permissions.BasePermission):
    """
    Permission for attendance analytics.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return (
                request.user.is_authenticated and
                (request.user.is_staff or 
                 hasattr(request.user, 'role') and 
                 request.user.role in ['admin', 'teacher', 'analyst', 'parent'])
            )
        return (
            request.user.is_authenticated and
            (request.user.is_staff or 
             hasattr(request.user, 'role') and 
             request.user.role in ['admin', 'teacher', 'analyst'])
        )
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        
        # Teachers can access attendance data for their classes
        if hasattr(request.user, 'role') and request.user.role == 'teacher':
            return obj.student.class_section.teacher == request.user
        
        # Parents can only access their own children's attendance
        if hasattr(request.user, 'role') and request.user.role == 'parent':
            return obj.student.parent == request.user
        
        # Analysts can access all attendance data
        if hasattr(request.user, 'role') and request.user.role == 'analyst':
            return True
        
        return False


class ExamAnalyticsPermission(permissions.BasePermission):
    """
    Permission for exam analytics.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return (
                request.user.is_authenticated and
                (request.user.is_staff or 
                 hasattr(request.user, 'role') and 
                 request.user.role in ['admin', 'teacher', 'analyst', 'parent'])
            )
        return (
            request.user.is_authenticated and
            (request.user.is_staff or 
             hasattr(request.user, 'role') and 
             request.user.role in ['admin', 'teacher', 'analyst'])
        )
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        
        # Teachers can access exam data for their subjects/classes
        if hasattr(request.user, 'role') and request.user.role == 'teacher':
            if hasattr(obj, 'subject'):
                return obj.subject.teacher == request.user
            elif hasattr(obj, 'class_section'):
                return obj.class_section.teacher == request.user
        
        # Parents can only access their own children's exam data
        if hasattr(request.user, 'role') and request.user.role == 'parent':
            # This would need to be implemented based on how exam analytics are linked to students
            return True  # Placeholder - implement based on actual model structure
        
        # Analysts can access all exam data
        if hasattr(request.user, 'role') and request.user.role == 'analyst':
            return True
        
        return False


class SystemUsagePermission(permissions.BasePermission):
    """
    Permission for system usage analytics.
    Only staff and analysts can access system usage data.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            (request.user.is_staff or 
             hasattr(request.user, 'role') and 
             request.user.role in ['admin', 'analyst'])
        )
    
    def has_object_permission(self, request, view, obj):
        return (
            request.user.is_staff or 
            hasattr(request.user, 'role') and 
            request.user.role in ['admin', 'analyst']
        )


class LearningAnalyticsPermission(permissions.BasePermission):
    """
    Permission for learning analytics.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return (
                request.user.is_authenticated and
                (request.user.is_staff or 
                 hasattr(request.user, 'role') and 
                 request.user.role in ['admin', 'teacher', 'analyst', 'parent'])
            )
        return (
            request.user.is_authenticated and
            (request.user.is_staff or 
             hasattr(request.user, 'role') and 
             request.user.role in ['admin', 'teacher', 'analyst'])
        )
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        
        # Teachers can access learning data for their students
        if hasattr(request.user, 'role') and request.user.role == 'teacher':
            return obj.student.class_section.teacher == request.user
        
        # Parents can only access their own children's learning data
        if hasattr(request.user, 'role') and request.user.role == 'parent':
            return obj.student.parent == request.user
        
        # Analysts can access all learning data
        if hasattr(request.user, 'role') and request.user.role == 'analyst':
            return True
        
        return False


class PredictiveAnalyticsPermission(permissions.BasePermission):
    """
    Permission for predictive analytics.
    Only staff and analysts can access predictive analytics.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            (request.user.is_staff or 
             hasattr(request.user, 'role') and 
             request.user.role in ['admin', 'analyst'])
        )
    
    def has_object_permission(self, request, view, obj):
        return (
            request.user.is_staff or 
            hasattr(request.user, 'role') and 
            request.user.role in ['admin', 'analyst']
        )


class DashboardPermission(permissions.BasePermission):
    """
    Permission for analytics dashboard.
    Users can only access their own dashboards or shared dashboards.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Users can access their own dashboards
        if obj.user == request.user:
            return True
        
        # Staff can access all dashboards
        if request.user.is_staff:
            return True
        
        # Check if dashboard is shared with user's role
        if hasattr(obj, 'shared_with_roles') and obj.shared_with_roles:
            user_role = getattr(request.user, 'role', None)
            if user_role and user_role in obj.shared_with_roles:
                return True
        
        return False

